import {
  AdaptationDeltaReport,
  ALL_SPORTS,
  CalibrationBucket,
  DailyAuditEntry,
  DailyAuditSummary,
  DailyFixture,
  HistoricalMatchRow,
  IntelligenceMatrixPayload,
  NeuralHyperparameters,
  PredictionResult,
  RuleFailureDiagnostic,
  SportAuditMetrics,
  SportId,
} from '../types/sports';
import { isVolatileCompetition, SportRuleWeights } from './sportRules';
import {
  rankTop10BetsForSport,
  TrainedNeuralEngine,
  trainNeuralNetworkOnCSV,
} from './neuralNetwork';


function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function hashStringSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0) / 4294967296;
}

/**
 * Ensures IDs strictly adhere to firebase-blueprint.json regex ^[a-zA-Z0-9_\-]+$ and <= 128 chars
 */
export function sanitizeDocId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : 'doc_fallback';
}

/**
 * Computes YYYY-MM-DD one calendar day prior to the supplied YYYY-MM-DD string
 */
export function getPreviousDateISO(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return '2026-10-24';
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

function synthesizeScoreSummary(entry: DailyAuditEntry, won: boolean, u: number): string {
  const step = Math.floor(u * 4);
  switch (entry.sport) {
    case SportId.Soccer:
      return won
        ? ['2-0 FT', '2-1 FT', '3-1 FT', '1-0 FT'][step]
        : ['1-1 FT (Draw)', '0-1 FT', '1-2 FT', '0-0 FT (Draw)'][step];
    case SportId.Tennis:
      return won
        ? ['6-4, 6-3', '7-6, 6-4', '6-3, 4-6, 6-2', '6-2, 6-4'][step]
        : ['4-6, 5-7', '6-4, 3-6, 4-6', '5-7, 4-6', '6-7, 3-6'][step];
    case SportId.Basketball:
      return won
        ? ['116-107 FT', '121-112 FT', '109-101 FT', '118-105 FT'][step]
        : ['104-111 FT', '108-112 FT', '99-107 FT', '110-115 OT'][step];
    case SportId.Golf:
      return won
        ? ['-13 (Finished T6)', '-15 (Won H2H +3)', '-11 (Finished T9)', '-14 (Finished 4th)'][step]
        : ['-5 (Finished T28)', '-3 (Missed Cut)', '-7 (Lost H2H -2)', '-6 (Finished T24)'][step];
    case SportId.Cricket:
      return won
        ? ['Won by 6 wickets', 'Won by 24 runs', '192/4 beat 186/8', 'Won by 5 wickets'][step]
        : ['Lost by 18 runs', 'Lost by 4 wickets', '168/9 fell short', 'Lost in final over'][step];
    case SportId.Rugby:
      return won
        ? ['28-17 FT', '31-20 FT', '24-16 FT', '34-19 FT'][step]
        : ['18-22 FT', '20-24 FT', '16-23 FT', '21-27 FT'][step];
  }
}

/**
 * Deterministically settles pending audit entries using realistic probability + rule-trap dynamics
 * so users can immediately inspect T-1 post-mortem accuracy or test adaptation offline.
 */
export function simulateDeterministicSettlement(
  entries: DailyAuditEntry[]
): DailyAuditEntry[] {
  return entries.map((entry) => {
    if (entry.settlementStatus === 'adapted') {
      return entry;
    }
    const u = hashStringSeed(`settle:${entry.id}:${entry.auditDate}`);
    const uScore = hashStringSeed(`score:${entry.id}`);

    // Incorporate realistic penalties when caution flags or squad-value traps occur
    const coreTrio =
      (entry.rules.r1_motivation_stakes +
        entry.rules.r2_form_momentum +
        entry.rules.r3_h2h_standings_gap) /
      3;
    const valueOverreach = Math.max(0, entry.rules.r6_squad_value_vs_form - coreTrio - 0.5);
    const trapPenalty =
      entry.cautionFlags.length * 0.055 +
      (valueOverreach > 0 ? 0.06 : 0) +
      (isVolatileCompetition(entry.competition) ? 0.05 : 0);

    const trueRealizedProb = clamp(entry.hybridProbability - trapPenalty - 0.04, 0.22, 0.88);
    const won = u < trueRealizedProb;

    return {
      ...entry,
      settlementStatus: 'settled',
      actualOutcome: won ? 1 : 0,
      scoreSummary: `SIMULATED: ${synthesizeScoreSummary(entry, won, uScore)}`, 
    };
  });
}

/**
 * Converts a day's PredictionResult map into locked DailyAuditEntry records
 */
export function createLockedAuditCardFromPredictions(
  auditDate: string,
  predictionsBySport: Record<SportId, PredictionResult[]>,
  autoSettle = false
): DailyAuditEntry[] {
  const entries: DailyAuditEntry[] = [];
  for (const sport of ALL_SPORTS) {
    const picks = predictionsBySport[sport] ?? [];
    for (const pred of picks) {
      const id = sanitizeDocId(`audit_${auditDate}_${sport}_${pred.fixture.selection}_${pred.rank}`);
      entries.push({
        id,
        auditDate,
        sport,
        competition: pred.fixture.competition.slice(0, 120),
        selection: pred.fixture.selection.slice(0, 120),
        opponent: pred.fixture.opponent.slice(0, 120),
        market: pred.fixture.market.slice(0, 80),
        isHomeOrFavoredContext: pred.fixture.isHomeOrFavoredContext,
        decimalOdds: pred.fixture.decimalOdds,
        kellyFractionPercent: pred.kellyFractionPercent,
        ruleProbability: Number(pred.ruleProbability.toFixed(4)),
        neuralProbability: Number(pred.neuralProbability.toFixed(4)),
        hybridProbability: Number(pred.hybridProbability.toFixed(4)),
        cautionFlags: [...pred.cautionFlags],
        rules: { ...pred.fixture.rules },
        settlementStatus: 'pending',
        actualOutcome: -1,
        scoreSummary: '',
      });
    }
  }
  return autoSettle ? simulateDeterministicSettlement(entries) : entries;
}

/**
 * Selects only fixtures explicitly supplied for the requested date.
 * Generated demo fixtures must never be silently added to an operational prediction pool.
 */
export function selectSuppliedFixturesForDate(
  date: string,
  suppliedFixtures: DailyFixture[]
): DailyFixture[] {
  return suppliedFixtures.filter((fixture) => fixture.date === date);
}

/**
 * Builds the 60-pick locked audit card for any given YYYY-MM-DD date directly from the engine
 */
export function buildLockedAuditCardForDate(
  auditDate: string,
  engine: TrainedNeuralEngine,
  sportWeights: SportRuleWeights,
  extraFixtures: DailyFixture[] = [],
  autoSettle = false
): DailyAuditEntry[] {
  // Audit cards must only contain caller-supplied fixtures. Never silently substitute
  // generated demo fixtures when live fixture ingestion is empty or incomplete.
  const fixtures = selectSuppliedFixturesForDate(auditDate, extraFixtures);
  const map = {} as Record<SportId, PredictionResult[]>;
  for (const s of ALL_SPORTS) {
    map[s] = rankTop10BetsForSport(fixtures, s, engine, sportWeights, 10);
  }
  return createLockedAuditCardFromPredictions(auditDate, map, autoSettle);
}

/**
 * Audits all locked picks for accuracy, ROI, Brier calibration, probability honesty buckets,
 * and 8-Rule failure post-mortem diagnostics.
 */
export function computeDailyAuditSummary(entries: DailyAuditEntry[]): DailyAuditSummary {
  const settled = entries.filter(
    (e) =>
      (e.settlementStatus === 'settled' || e.settlementStatus === 'adapted') &&
      e.scoreSummary.startsWith('SOURCE-VERIFIED:') &&
      (e.actualOutcome === 0 || e.actualOutcome === 1)
  );
  const pendingCount = entries.filter((e) => e.settlementStatus === 'pending').length;
  const adaptedCount = entries.filter((e) => e.settlementStatus === 'adapted').length;
  const readyToAdaptCount = entries.filter(
    (e) => e.settlementStatus === 'settled' &&
      e.scoreSummary.startsWith('SOURCE-VERIFIED:') &&
      (e.actualOutcome === 0 || e.actualOutcome === 1)
  ).length;

  let wonCount = 0;
  let lostCount = 0;
  let flatUnitsPL = 0;
  let kellyUnitsPL = 0;

  let ruleCorrect = 0;
  let neuralCorrect = 0;
  let hybridCorrect = 0;

  let ruleBrierSum = 0;
  let neuralBrierSum = 0;
  let hybridBrierSum = 0;

  const bySport = {} as Record<SportId, SportAuditMetrics>;
  for (const s of ALL_SPORTS) {
    bySport[s] = {
      sport: s,
      total: 0,
      settled: 0,
      won: 0,
      lost: 0,
      hitRate: 0,
      flatUnitsPL: 0,
      flatRoiPercent: 0,
      hybridBrier: 0,
    };
  }

  for (const e of entries) {
    bySport[e.sport].total += 1;
  }

  const sportBrierAccum: Record<SportId, number> = {
    [SportId.Soccer]: 0,
    [SportId.Tennis]: 0,
    [SportId.Basketball]: 0,
    [SportId.Golf]: 0,
    [SportId.Cricket]: 0,
    [SportId.Rugby]: 0,
  };

  for (const e of settled) {
    const y = e.actualOutcome as 0 | 1;
    const sp = bySport[e.sport];
    sp.settled += 1;

    if (y === 1) {
      wonCount += 1;
      sp.won += 1;
      const net = e.decimalOdds - 1;
      flatUnitsPL += net;
      sp.flatUnitsPL += net;
      kellyUnitsPL += e.kellyFractionPercent * net;
    } else {
      lostCount += 1;
      sp.lost += 1;
      flatUnitsPL -= 1;
      sp.flatUnitsPL -= 1;
      kellyUnitsPL -= e.kellyFractionPercent;
    }

    if ((e.ruleProbability >= 0.5 ? 1 : 0) === y) ruleCorrect += 1;
    if ((e.neuralProbability >= 0.5 ? 1 : 0) === y) neuralCorrect += 1;
    if ((e.hybridProbability >= 0.5 ? 1 : 0) === y) hybridCorrect += 1;

    ruleBrierSum += Math.pow(e.ruleProbability - y, 2);
    neuralBrierSum += Math.pow(e.neuralProbability - y, 2);
    const hb = Math.pow(e.hybridProbability - y, 2);
    hybridBrierSum += hb;
    sportBrierAccum[e.sport] += hb;
  }

  for (const s of ALL_SPORTS) {
    const sp = bySport[s];
    if (sp.settled > 0) {
      sp.hitRate = sp.won / sp.settled;
      sp.flatRoiPercent = (sp.flatUnitsPL / sp.settled) * 100;
      sp.hybridBrier = sportBrierAccum[s] / sp.settled;
    }
  }

  const n = Math.max(1, settled.length);
  const hitRate = settled.length > 0 ? wonCount / settled.length : 0;
  const flatRoiPercent = settled.length > 0 ? (flatUnitsPL / settled.length) * 100 : 0;

  // Calibration Honesty Buckets
  const bucketDefs = [
    { label: 'Moderate Edge (50%–68%)', min: 0, max: 0.68 },
    { label: 'Strong Conviction (68%–80%)', min: 0.68, max: 0.80 },
    { label: 'Tier-1 Lock (80%+)', min: 0.80, max: 1.01 },
  ];
  const calibrationBuckets: CalibrationBucket[] = bucketDefs.map((b) => {
    const items = settled.filter(
      (e) => e.hybridProbability >= b.min && e.hybridProbability < b.max
    );
    if (items.length === 0) {
      return {
        label: b.label,
        count: 0,
        avgPredictedProb: 0,
        realizedHitRate: 0,
        calibrationGap: 0,
      };
    }
    const avgPred =
      items.reduce((acc, i) => acc + i.hybridProbability, 0) / items.length;
    const realized =
      items.reduce((acc, i) => acc + (i.actualOutcome === 1 ? 1 : 0), 0) / items.length;
    return {
      label: b.label,
      count: items.length,
      avgPredictedProb: avgPred,
      realizedHitRate: realized,
      calibrationGap: realized - avgPred,
    };
  });

  // Rule-Level Post-Mortem Diagnostics on Losing Picks
  const losses = settled.filter((e) => e.actualOutcome === 0);
  const diagCounts = {
    continentalFatigue: losses.filter((e) => e.rules.r7_continental_fatigue < 5.6).length,
    derbyVariance: losses.filter((e) => e.rules.r5_derby_rivalry < 5.6).length,
    narrowStandingsGap: losses.filter((e) => e.rules.r3_h2h_standings_gap < 6.4).length,
    squadValueOverreach: losses.filter((e) => {
      const trio =
        (e.rules.r1_motivation_stakes +
          e.rules.r2_form_momentum +
          e.rules.r3_h2h_standings_gap) /
        3;
      return e.rules.r6_squad_value_vs_form > trio + 0.35;
    }).length,
    volatileWatchlist: losses.filter(
      (e) => e.rules.r8_coach_volatility < 5.6 || isVolatileCompetition(e.competition)
    ).length,
    weakLast5Momentum: losses.filter((e) => e.rules.r2_form_momentum < 6.3).length,
  };

  const rawDiagnostics: RuleFailureDiagnostic[] = [
    {
      ruleKey: 'r7_continental_fatigue',
      title: 'R7 · Continental / Cup Rotation Attrition',
      lossCount: diagCounts.continentalFatigue,
      explanation:
        'Favourites sandwiching continental or back-to-back fixtures underperformed pre-match odds due to squad rotation.',
    },
    {
      ruleKey: 'r3_h2h_standings_gap',
      title: 'R3 · Narrow (<8 Spot) Table / Ranking Gap',
      lossCount: diagCounts.narrowStandingsGap,
      explanation:
        'Losses clustered where table/ranking separation narrowed below the 8-spot threshold despite positive market edge.',
    },
    {
      ruleKey: 'r6_squad_value_vs_form',
      title: 'R6 · High Valuation Outpacing Core Trio (R1–R3)',
      lossCount: diagCounts.squadValueOverreach,
      explanation:
        'Higher-valued rosters dropped results when Motivation, Last-5 Form, and H2H lagged paper market value.',
    },
    {
      ruleKey: 'r5_derby_rivalry',
      title: 'R5 · Derby & Historic Rivalry Disruption',
      lossCount: diagCounts.derbyVariance,
      explanation:
        'Emotionally charged rivalry matchups compressed statistical gaps and caused underdog upsets.',
    },
    {
      ruleKey: 'r8_coach_volatility',
      title: 'R8 · Coach H2H & High-Volatility Competition',
      lossCount: diagCounts.volatileWatchlist,
      explanation:
        'Elevated upset rate in high-parity competitions or unfavorable tactical manager head-to-heads.',
    },
    {
      ruleKey: 'r2_form_momentum',
      title: 'R2 · Sub-Peak Last-5 Attacking Momentum',
      lossCount: diagCounts.weakLast5Momentum,
      explanation:
        'Selections entering with softer Last-5 shot accuracy or control failed to convert expected edge.',
    },
  ];

  const ruleDiagnostics = rawDiagnostics
    .filter((d) => d.lossCount > 0)
    .sort((a, b) => b.lossCount - a.lossCount)
    .slice(0, 4);

  return {
    totalLocked: entries.length,
    settledCount: settled.length,
    pendingCount,
    adaptedCount,
    readyToAdaptCount,
    wonCount,
    lostCount,
    hitRate,
    flatUnitsPL,
    flatRoiPercent,
    kellyUnitsPL,
    ruleHitRate: settled.length > 0 ? ruleCorrect / n : 0,
    neuralHitRate: settled.length > 0 ? neuralCorrect / n : 0,
    hybridHitRate: settled.length > 0 ? hybridCorrect / n : 0,
    ruleBrier: settled.length > 0 ? ruleBrierSum / n : 0,
    neuralBrier: settled.length > 0 ? neuralBrierSum / n : 0,
    hybridBrier: settled.length > 0 ? hybridBrierSum / n : 0,
    calibrationBuckets,
    ruleDiagnostics,
    bySport,
  };
}

/**
 * Converts settled DailyAuditEntry items into canonical HistoricalMatchRow records,
 * appends them to the corpus with controlled recency replay, calibrates hybrid blend alpha,
 * and retrains the 20-input MLP + Team Intelligence Matrices.
 */
export function adaptNeuralEngineFromAudit(
  auditDate: string,
  entries: DailyAuditEntry[],
  currentCorpus: HistoricalMatchRow[],
  currentHyperparams: NeuralHyperparameters,
  sportWeights: SportRuleWeights,
  prevEngine: TrainedNeuralEngine
): {
  nextEngine: TrainedNeuralEngine;
  nextCorpus: HistoricalMatchRow[];
  nextHyperparams: NeuralHyperparameters;
  updatedEntries: DailyAuditEntry[];
  newlySettledEntries: DailyAuditEntry[];
  deltaReport: AdaptationDeltaReport;
} {
  const newlySettledEntries = entries.filter(
    (e) => e.settlementStatus === 'settled' &&
      e.scoreSummary.startsWith('SOURCE-VERIFIED:') &&
      (e.actualOutcome === 0 || e.actualOutcome === 1)
  );

  if (newlySettledEntries.length === 0) {
    throw new Error(
      'No source-verified settlements are queued for adaptation. Simulated and AI-generated grades are excluded; manually review the exact event and outcome, then record an official source URL.'
    );
  }

  const auditSummary = computeDailyAuditSummary(entries);
  const existingIds = new Set(currentCorpus.map((r) => r.id));

  const newRows: HistoricalMatchRow[] = newlySettledEntries.map((e) => ({
    id: e.id,
    date: e.auditDate,
    sport: e.sport,
    competition: e.competition,
    selection: e.selection,
    opponent: e.opponent,
    market: e.market,
    decimalOdds: e.decimalOdds,
    isHomeOrFavoredContext: e.isHomeOrFavoredContext,
    rules: { ...e.rules },
    outcomeWon: e.actualOutcome as 0 | 1,
    sampleWeight: 1.6,
  }));

  const dedupedAdditions = newRows.filter((r) => !existingIds.has(r.id));
  const nextCorpus = [
    ...currentCorpus.map((r) => ({ ...r, sampleWeight: 1.0 })),
    ...dedupedAdditions,
  ];

  // Dynamic Blend Alpha Calibration: shift alpha modestly toward whichever engine achieved lower Brier error on T-1
  const prevAlpha = currentHyperparams.neuralBlendAlpha;
  const brierDiff = auditSummary.ruleBrier - auditSummary.neuralBrier; // >0 means Neural beat 8-Rule
  const alphaShift = clamp(brierDiff * 0.45, -0.06, 0.06);
  const nextAlpha = Number(clamp(prevAlpha + alphaShift, 0.35, 0.78).toFixed(2));

  const nextHyperparams: NeuralHyperparameters = {
    ...currentHyperparams,
    neuralBlendAlpha: nextAlpha,
  };

  const prevMatrices = prevEngine.intelligencePayload.team_intelligence_matrices;
  const nextEngine = trainNeuralNetworkOnCSV(
    nextCorpus,
    nextHyperparams,
    sportWeights,
    prevEngine.intelligencePayload
  );

  // Compute top competitor coefficient shifts caused by yesterday's settled matches
  const touchedNames = Array.from(new Set(newlySettledEntries.map((e) => e.selection)));
  const shiftedCompetitors = touchedNames
    .map((name) => {
      const prevEntry = prevMatrices[name];
      const nextEntry = nextEngine.intelligencePayload.team_intelligence_matrices[name];
      if (!nextEntry) return null;
      return {
        name,
        sampleSize: nextEntry.sample_size_matches,
        prevVolatility: prevEntry?.learned_coefficients.volatility_index ?? 0.24,
        nextVolatility: nextEntry.learned_coefficients.volatility_index,
        nextFormWeight: nextEntry.learned_coefficients.form_momentum_weight,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort(
      (a, b) =>
        Math.abs(b.nextVolatility - b.prevVolatility) -
        Math.abs(a.nextVolatility - a.prevVolatility)
    )
    .slice(0, 6);

  const updatedEntries: DailyAuditEntry[] = entries.map((e) =>
    e.settlementStatus === 'settled' &&
    e.scoreSummary.startsWith('SOURCE-VERIFIED:') &&
    (e.actualOutcome === 0 || e.actualOutcome === 1)
      ? { ...e, settlementStatus: 'adapted' }
      : e
  );

  const deltaReport: AdaptationDeltaReport = {
    adaptedAt: new Date().toISOString(),
    auditDate,
    newlyIngestedRows: dedupedAdditions.length,
    totalCorpusBefore: currentCorpus.length,
    totalCorpusAfter: nextCorpus.length,
    prevAlpha,
    nextAlpha,
    prevValAccuracy: prevEngine.report.hybridValAccuracy,
    nextValAccuracy: nextEngine.report.hybridValAccuracy,
    prevValBrier: prevEngine.report.hybridValBrier,
    nextValBrier: nextEngine.report.hybridValBrier,
    ruleBrierOnAudit: auditSummary.ruleBrier,
    neuralBrierOnAudit: auditSummary.neuralBrier,
    shiftedCompetitors,
  };

  return {
    nextEngine,
    nextCorpus,
    nextHyperparams,
    updatedEntries,
    newlySettledEntries,
    deltaReport,
  };
}
