import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error(
      'GEMINI_API_KEY is not configured yet. Configure your key in Settings > Secrets to run live web schedule sync.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY.trim() !== ''
    );
    res.json({ ok: true, geminiConfigured: hasKey });
  });

  // Grounded live schedule & universal 8-rule intelligence sync
  app.post('/api/ai/sync-fixtures', async (req, res) => {
    try {
      const { date, sport } = req.body ?? {};
      if (!date || !sport) {
        res.status(400).json({ error: 'Both `date` and `sport` are required.' });
        return;
      }

      const ai = getGenAIClient();
      const prompt = `Search for scheduled professional ${sport} matches, tournaments, or fixtures around ${date}.
Summarize up to 5 real matchups, noting: (1) title/qualification/relegation motivation, (2) last 5 games form, (3) head-to-head and standings gap, (4) team/player tier, (5) whether it is a derby/rivalry, (6) squad value vs form, (7) continental/cup schedule rotation fatigue, and (8) coach H2H or volatile league status.`;

      const searchResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingRaw = searchResp.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources = groundingRaw
        .map((c) => (c.web ? { uri: c.web.uri ?? '', title: c.web.title ?? '' } : null))
        .filter((s): s is { uri: string; title: string } => Boolean(s && s.uri));

      const structResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Convert the following ${sport} schedule briefing for ${date} into structured fixture entries using our Universal 8 Rules (0.0 to 10.0, where low r5_derby_rivalry means fierce derby, low r7_continental_fatigue means heavy rotation risk, and low r8_coach_volatility means high-volatility league such as Japan/Korea/China/Norway/Sweden/Belarus/Bulgaria/Romania/Ukraine/Russia):\n\n${searchResp.text ?? ''}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                kickoffTime: { type: Type.STRING },
                competition: { type: Type.STRING },
                venueOrSurface: { type: Type.STRING },
                selection: { type: Type.STRING },
                opponent: { type: Type.STRING },
                market: { type: Type.STRING },
                decimalOdds: { type: Type.NUMBER },
                isHomeOrFavoredContext: { type: Type.BOOLEAN },
                sportContextStat: { type: Type.STRING },
                r1_motivation_stakes: { type: Type.NUMBER },
                r2_form_momentum: { type: Type.NUMBER },
                r3_h2h_standings_gap: { type: Type.NUMBER },
                r4_tier_classification: { type: Type.NUMBER },
                r5_derby_rivalry: { type: Type.NUMBER },
                r6_squad_value_vs_form: { type: Type.NUMBER },
                r7_continental_fatigue: { type: Type.NUMBER },
                r8_coach_volatility: { type: Type.NUMBER },
              },
              required: [
                'kickoffTime',
                'competition',
                'venueOrSurface',
                'selection',
                'opponent',
                'market',
                'decimalOdds',
                'isHomeOrFavoredContext',
                'sportContextStat',
                'r1_motivation_stakes',
                'r2_form_momentum',
                'r3_h2h_standings_gap',
                'r4_tier_classification',
                'r5_derby_rivalry',
                'r6_squad_value_vs_form',
                'r7_continental_fatigue',
                'r8_coach_volatility',
              ],
            },
          },
        },
      });

      const parsedFixtures = JSON.parse((structResp.text ?? '[]').trim());
      res.json({
        fixtures: parsedFixtures,
        briefing: searchResp.text ?? '',
        sources,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to synchronize live sports fixtures.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/calibrate-notes', async (req, res) => {
    try {
      const { modelEngine, accuracy, brier, topFeatures, sampleTeams } = req.body ?? {};
      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are a quantitative sports modeling analyst. Summarize calibration findings in 2 concise sentences (under 45 words) for model "${modelEngine}" achieving ${(Number(accuracy || 0) * 100).toFixed(1)}% validation accuracy and ${Number(brier || 0.2).toFixed(4)} Brier score. Top learned rule weights: ${JSON.stringify(topFeatures)}. Sample calibrated teams: ${JSON.stringify(sampleTeams)}.`,
      });
      res.json({
        meta_improvement_notes: (response.text ?? '').trim(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to synthesize meta-improvement notes.';
      res.status(500).json({ error: message });
    }
  });

  // Grounded post-match settlement audit for yesterday's (T-1) locked predictions
  app.post('/api/ai/audit-results', async (req, res) => {
    try {
      const { date, sport, picks } = req.body ?? {};
      if (!date || !Array.isArray(picks) || picks.length === 0) {
        res.status(400).json({ error: '`date` and a non-empty `picks` array are required.' });
        return;
      }

      const ai = getGenAIClient();
      const compactList = picks
        .slice(0, 15)
        .map(
          (p: Record<string, unknown>) =>
            `- ID: ${String(p.id)} | ${String(p.selection)} vs ${String(p.opponent)} (${String(p.competition)}, Market: ${String(p.market)})`
        )
        .join('\n');

      const searchResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Search for official final match results and scores around ${date} for these ${sport || 'multi-sport'} events:\n${compactList}\nSummarize the actual final score or tournament standing for each listed matchup.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingRaw = searchResp.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources = groundingRaw
        .map((c) => (c.web ? { uri: c.web.uri ?? '', title: c.web.title ?? '' } : null))
        .filter((s): s is { uri: string; title: string } => Boolean(s && s.uri));

      const structResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Grade each locked prediction below using the verified final results briefing. If a match has not finished or no verified final result is found, set status to "pending" and actualOutcome to -1. Otherwise set status to "settled" and actualOutcome to 1 (selection won the market) or 0 (selection lost).\n\nLocked Picks:\n${compactList}\n\nVerified Results Briefing:\n${searchResp.text ?? ''}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                status: { type: Type.STRING },
                actualOutcome: { type: Type.INTEGER },
                scoreSummary: { type: Type.STRING },
              },
              required: ['id', 'status', 'actualOutcome', 'scoreSummary'],
            },
          },
        },
      });

      const settlements = JSON.parse((structResp.text ?? '[]').trim());
      res.json({
        settlements,
        briefing: searchResp.text ?? '',
        sources,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to audit final match results.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OctaNet server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
