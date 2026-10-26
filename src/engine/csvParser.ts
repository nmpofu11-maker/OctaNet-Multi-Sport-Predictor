import {
  ALL_SPORTS,
  HistoricalMatchRow,
  IntelligenceMatrixPayload,
  PredictionResult,
  RuleScoreVector,
  SPORT_LABELS,
  SportId,
} from '../types/sports';

export interface CSVParseResult {
  rows: HistoricalMatchRow[];
  warnings: string[];
  errors: string[];
}

const SPORT_ALIASES: Record<string, SportId> = {
  soccer: SportId.Soccer,
  football: SportId.Soccer,
  epl: SportId.Soccer,
  ucl: SportId.Soccer,
  tennis: SportId.Tennis,
  atp: SportId.Tennis,
  wta: SportId.Tennis,
  basketball: SportId.Basketball,
  nba: SportId.Basketball,
  euroleague: SportId.Basketball,
  golf: SportId.Golf,
  pga: SportId.Golf,
  dpwt: SportId.Golf,
  cricket: SportId.Cricket,
  ipl: SportId.Cricket,
  odi: SportId.Cricket,
  t20: SportId.Cricket,
  test: SportId.Cricket,
  rugby: SportId.Rugby,
  urc: SportId.Rugby,
  sixnations: SportId.Rugby,
};

function splitCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function escapeCSVCell(val: string | number): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function parseRuleNumber(raw: string | undefined, fallback = 5.8): number {
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) return fallback;
  if (n > 10 && n <= 100) return Math.min(10, Math.max(0, n / 10));
  if (n >= 0 && n <= 1.0001 && raw.includes('.')) {
    return n <= 1 ? n * 10 : n;
  }
  return Math.min(10, Math.max(0, n));
}

export function parseHistoricalCSV(csvText: string): CSVParseResult {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return {
      rows: [],
      warnings: [],
      errors: ['CSV input is empty. Upload a .csv file or load a multi-sport training dataset.'],
    };
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    return {
      rows: [],
      warnings: [],
      errors: ['CSV must contain a header row and at least one historical match data row.'],
    };
  }

  const rawHeaders = splitCSVLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  );

  const findCol = (candidates: string[]): number => {
    for (const c of candidates) {
      const idx = rawHeaders.indexOf(c);
      if (idx !== -1) return idx;
    }
    for (const c of candidates) {
      const idx = rawHeaders.findIndex((h) => h.includes(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colDate = findCol(['date', 'match_date']);
  const colSport = findCol(['sport', 'discipline']);
  const colComp = findCol(['competition', 'league', 'tournament']);
  const colSelection = findCol(['selection', 'team', 'home_team', 'player', 'competitor']);
  const colOpponent = findCol(['opponent', 'away_team', 'rival', 'field']);
  const colMarket = findCol(['market', 'bet_type', 'pick']);
  const colOdds = findCol(['decimal_odds', 'odds', 'price']);
  const colHome = findCol(['is_home', 'home_context', 'venue_context']);
  const colOutcome = findCol(['outcome', 'won', 'result', 'target']);

  const colR1 = findCol(['r1_motivation', 'r1_motivation_stakes', 'r1', 'motivation', 'stakes']);
  const colR2 = findCol(['r2_form_l5', 'r2_form_momentum', 'r2_form', 'r2', 'form']);
  const colR3 = findCol(['r3_h2h_gap8', 'r3_h2h_standings_gap', 'r3_h2h', 'r3', 'h2h']);
  const colR4 = findCol(['r4_tiers', 'r4_tier_classification', 'r4', 'tier']);
  const colR5 = findCol(['r5_derby', 'r5_derby_rivalry', 'r5', 'derby', 'rivalry']);
  const colR6 = findCol(['r6_value_vs_form', 'r6_squad_value_vs_form', 'r6', 'squad_value']);
  const colR7 = findCol(['r7_continental_fatigue', 'r7_fatigue', 'r7', 'continental', 'fatigue']);
  const colR8 = findCol(['r8_coach_volatility', 'r8_volatility', 'r8', 'coach', 'volatility']);

  const errors: string[] = [];
  const warnings: string[] = [];

  // Do not invent missing training values: they can contaminate evaluation and adaptation metrics.
  const requiredColumns: [string, number][] = [
    ['date', colDate], ['sport', colSport], ['competition', colComp],
    ['selection/team/player', colSelection], ['opponent', colOpponent], ['market', colMarket],
    ['decimal odds', colOdds], ['home/favored context', colHome], ['outcome', colOutcome],
    ['R1 motivation/stakes', colR1], ['R2 form/momentum', colR2],
    ['R3 H2H/standings gap', colR3], ['R4 tier classification', colR4],
    ['R5 derby/rivalry', colR5], ['R6 squad value vs form', colR6],
    ['R7 fatigue', colR7], ['R8 coach/volatility', colR8],
  ];
  for (const [label, index] of requiredColumns) {
    if (index === -1) errors.push(`Missing required CSV column: ${label}.`);
  }

  if (errors.length > 0) {
    return { rows: [], warnings, errors };
  }

  const rows: HistoricalMatchRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    if (cells.length < 3) {
      warnings.push(`Skipped malformed line ${i + 1}: insufficient columns.`);
      continue;
    }

    const requiredValues = requiredColumns.map(([, index]) => cells[index]?.trim() ?? '');
    if (requiredValues.some((value) => value.length === 0)) {
      warnings.push(`Skipped line ${i + 1}: one or more required fields are blank.`);
      continue;
    }

    const rawDate = cells[colDate].trim();
    const parsedDate = new Date(`${rawDate}T00:00:00Z`);
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(rawDate) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== rawDate) {
      warnings.push(`Skipped line ${i + 1}: date must be a real YYYY-MM-DD date.`);
      continue;
    }
    const date = rawDate;

    const rawSport = cells[colSport].toLowerCase().replace(/\\s+/g, '');
    const sport = SPORT_ALIASES[rawSport];
    if (!sport) {
      warnings.push(`Skipped line ${i + 1}: unrecognized sport "${cells[colSport]}"; row excluded.`);
      continue;
    }

    const selection = cells[colSelection].trim();
    const opponent = cells[colOpponent].trim();
    const competition = cells[colComp].trim();
    const market = cells[colMarket].trim();

    const parsedOdds = Number(cells[colOdds]);
    if (!Number.isFinite(parsedOdds) || parsedOdds < 1.02) {
      warnings.push(`Skipped line ${i + 1}: decimal odds must be a finite number >= 1.02.`);
      continue;
    }
    const decimalOdds = parsedOdds;

    const rawHome = cells[colHome].trim().toLowerCase();
    if (!['1', '0', 'true', 'false', 'yes', 'no', 'home', 'away', 'favored', 'underdog'].includes(rawHome)) {
      warnings.push(`Skipped line ${i + 1}: home/favored context must be explicit.`);
      continue;
    }
    const isHomeOrFavoredContext =
      rawHome === '1' || rawHome === 'true' || rawHome === 'yes' || rawHome === 'home' || rawHome === 'favored';

    const rawOut = (cells[colOutcome] ?? '').toLowerCase();
    let outcomeWon: 0 | 1 | null = null;
    if (rawOut === '1' || rawOut === 'w' || rawOut === 'win' || rawOut === 'won' || rawOut === 'true') {
      outcomeWon = 1;
    } else if (rawOut === '0' || rawOut === 'l' || rawOut === 'loss' || rawOut === 'lost' || rawOut === 'false') {
      outcomeWon = 0;
    }
    if (outcomeWon === null) {
      warnings.push(`Skipped line ${i + 1}: outcome "${cells[colOutcome]}" must be 1/0 or W/L.`);
      continue;
    }

    const rawRuleValues = [colR1, colR2, colR3, colR4, colR5, colR6, colR7, colR8]
      .map((index) => cells[index].trim());
    const numericRuleValues = rawRuleValues.map(Number);
    if (numericRuleValues.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
      warnings.push(`Skipped line ${i + 1}: all eight rule scores must be numeric values from 0 to 10 (or 0 to 100 scale).`);
      continue;
    }
    const rules: RuleScoreVector = {
      r1_motivation_stakes: parseRuleNumber(cells[colR1], 6.2),
      r2_form_momentum: parseRuleNumber(cells[colR2], 6.0),
      r3_h2h_standings_gap: parseRuleNumber(cells[colR3], 5.8),
      r4_tier_classification: parseRuleNumber(cells[colR4], 6.0),
      r5_derby_rivalry: parseRuleNumber(cells[colR5], 7.5),
      r6_squad_value_vs_form: parseRuleNumber(cells[colR6], 6.0),
      r7_continental_fatigue: parseRuleNumber(cells[colR7], 7.2),
      r8_coach_volatility: parseRuleNumber(cells[colR8], 6.5),
    };

    rows.push({
      id: `csv-${i}-${sport}`,
      date,
      sport,
      competition,
      selection,
      opponent,
      market,
      decimalOdds,
      isHomeOrFavoredContext,
      rules,
      outcomeWon,
    });
  }

  if (rows.length === 0) {
    errors.push('No valid match rows remained after parsing CSV.');
  }

  return { rows, warnings, errors };
}

export function serializeHistoricalRowsToCSV(rows: HistoricalMatchRow[]): string {
  const header = [
    'date',
    'sport',
    'competition',
    'selection',
    'opponent',
    'market',
    'decimal_odds',
    'is_home',
    'r1_motivation',
    'r2_form_l5',
    'r3_h2h_gap8',
    'r4_tiers',
    'r5_derby',
    'r6_value_vs_form',
    'r7_continental_fatigue',
    'r8_coach_volatility',
    'outcome',
  ].join(',');

  const body = rows.map((r) =>
    [
      escapeCSVCell(r.date),
      escapeCSVCell(r.sport),
      escapeCSVCell(r.competition),
      escapeCSVCell(r.selection),
      escapeCSVCell(r.opponent),
      escapeCSVCell(r.market),
      r.decimalOdds.toFixed(2),
      r.isHomeOrFavoredContext ? '1' : '0',
      r.rules.r1_motivation_stakes.toFixed(1),
      r.rules.r2_form_momentum.toFixed(1),
      r.rules.r3_h2h_standings_gap.toFixed(1),
      r.rules.r4_tier_classification.toFixed(1),
      r.rules.r5_derby_rivalry.toFixed(1),
      r.rules.r6_squad_value_vs_form.toFixed(1),
      r.rules.r7_continental_fatigue.toFixed(1),
      r.rules.r8_coach_volatility.toFixed(1),
      r.outcomeWon,
    ].join(',')
  );

  return [header, ...body].join('\n');
}

export function exportPredictionsToCSV(predictions: PredictionResult[]): string {
  const header = [
    'date',
    'sport',
    'rank',
    'competition',
    'matchup',
    'selection_market',
    'decimal_odds',
    'eight_point_score_of_8',
    'rule_prob_pct',
    'neural_prob_pct',
    'hybrid_prob_pct',
    'implied_prob_pct',
    'expected_value_pct',
    'quarter_kelly_pct',
    'confidence_tier',
    'caution_flags',
  ].join(',');

  const lines = predictions.map((p) =>
    [
      escapeCSVCell(p.fixture.date),
      escapeCSVCell(SPORT_LABELS[p.fixture.sport]),
      p.rank,
      escapeCSVCell(p.fixture.competition),
      escapeCSVCell(p.fixture.matchupLabel),
      escapeCSVCell(`${p.fixture.selection} · ${p.fixture.market}`),
      p.fixture.decimalOdds.toFixed(2),
      p.eightPointNormalized.toFixed(2),
      (p.ruleProbability * 100).toFixed(1),
      (p.neuralProbability * 100).toFixed(1),
      (p.hybridProbability * 100).toFixed(1),
      (p.impliedProbability * 100).toFixed(1),
      p.edgePercent.toFixed(2),
      p.kellyFractionPercent.toFixed(2),
      escapeCSVCell(p.confidenceTier),
      escapeCSVCell(p.cautionFlags.join('; ')),
    ].join(',')
  );

  return [header, ...lines].join('\n');
}

export function validateIntelligenceMatrixJSON(rawJson: string): {
  payload: IntelligenceMatrixPayload | null;
  error: string | null;
} {
  if (!rawJson.trim()) {
    return { payload: null, error: 'JSON input cannot be empty.' };
  }
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      return { payload: null, error: 'Root element must be a JSON object.' };
    }
    if (typeof parsed.sync_timestamp !== 'string' || !parsed.sync_timestamp.trim()) {
      return { payload: null, error: 'Missing required string field `sync_timestamp`.' };
    }
    if (typeof parsed.model_engine !== 'string' || !parsed.model_engine.trim()) {
      return { payload: null, error: 'Missing required string field `model_engine`.' };
    }
    if (typeof parsed.meta_improvement_notes !== 'string') {
      return { payload: null, error: 'Missing required string field `meta_improvement_notes`.' };
    }
    if (!parsed.team_intelligence_matrices || typeof parsed.team_intelligence_matrices !== 'object') {
      return { payload: null, error: 'Missing required object `team_intelligence_matrices`.' };
    }
    for (const [team, entry] of Object.entries(parsed.team_intelligence_matrices)) {
      const e = entry as Record<string, unknown>;
      if (!e || typeof e !== 'object') {
        return { payload: null, error: `Entry for "${team}" must be an object.` };
      }
      if (typeof e.sample_size_matches !== 'number' || !Number.isInteger(e.sample_size_matches)) {
        return { payload: null, error: `Entry for "${team}" requires integer \`sample_size_matches\`.` };
      }
      const lc = e.learned_coefficients as Record<string, unknown> | undefined;
      if (!lc || typeof lc !== 'object') {
        return { payload: null, error: `Entry for "${team}" requires \`learned_coefficients\` object.` };
      }
      const reqFields = [
        'home_advantage_multiplier',
        'form_momentum_weight',
        'volatility_index',
        'fatigue_penalty_modifier',
      ];
      for (const f of reqFields) {
        if (typeof lc[f] !== 'number' || Number.isNaN(lc[f])) {
          return { payload: null, error: `Entry for "${team}" missing numeric coefficient \`${f}\`.` };
        }
      }
    }
    return { payload: parsed as IntelligenceMatrixPayload, error: null };
  } catch (err) {
    return {
      payload: null,
      error: err instanceof Error ? `Invalid JSON syntax: ${err.message}` : 'Failed to parse JSON.',
    };
  }
}

export function generateSportCSVTemplate(sport: SportId | 'all'): string {
  const sampleSports = sport === 'all' ? ALL_SPORTS : [sport];
  const sampleRows: HistoricalMatchRow[] = sampleSports.map((s, idx) => ({
    id: `tpl-${s}-${idx}`,
    date: '2026-10-18',
    sport: s,
    competition:
      s === SportId.Soccer
        ? 'Premier League'
        : s === SportId.Tennis
        ? 'ATP Vienna Indoor 500'
        : s === SportId.Basketball
        ? 'NBA Regular Season'
        : s === SportId.Golf
        ? 'PGA Zozo Championship'
        : s === SportId.Cricket
        ? 'ICC World Test Championship'
        : 'United Rugby Championship',
    selection:
      s === SportId.Soccer
        ? 'Arsenal'
        : s === SportId.Tennis
        ? 'Jannik Sinner'
        : s === SportId.Basketball
        ? 'Boston Celtics'
        : s === SportId.Golf
        ? 'Collin Morikawa'
        : s === SportId.Cricket
        ? 'India'
        : 'Leinster',
    opponent:
      s === SportId.Soccer
        ? 'Brighton'
        : s === SportId.Tennis
        ? 'Alex de Minaur'
        : s === SportId.Basketball
        ? 'Indiana Pacers'
        : s === SportId.Golf
        ? 'Sahith Theegala'
        : s === SportId.Cricket
        ? 'New Zealand'
        : 'Ulster',
    market:
      s === SportId.Golf ? '72-Hole H2H Matchup' : s === SportId.Rugby ? 'Handicap -5.5' : 'Moneyline / Win',
    decimalOdds: 1.85,
    isHomeOrFavoredContext: true,
    rules: {
      r1_motivation_stakes: 8.6,
      r2_form_momentum: 8.2,
      r3_h2h_standings_gap: 7.9,
      r4_tier_classification: 8.1,
      r5_derby_rivalry: 8.5,
      r6_squad_value_vs_form: 7.8,
      r7_continental_fatigue: 8.0,
      r8_coach_volatility: 7.7,
    },
    outcomeWon: 1,
  }));
  return serializeHistoricalRowsToCSV(sampleRows);
}
