export enum SportId {
  Soccer = 'soccer',
  Tennis = 'tennis',
  Basketball = 'basketball',
  Golf = 'golf',
  Cricket = 'cricket',
  Rugby = 'rugby',
}

export const ALL_SPORTS: SportId[] = [
  SportId.Soccer,
  SportId.Tennis,
  SportId.Basketball,
  SportId.Golf,
  SportId.Cricket,
  SportId.Rugby,
];

export const SPORT_LABELS: Record<SportId, string> = {
  [SportId.Soccer]: 'Soccer',
  [SportId.Tennis]: 'Tennis',
  [SportId.Basketball]: 'Basketball',
  [SportId.Golf]: 'Golf',
  [SportId.Cricket]: 'Cricket',
  [SportId.Rugby]: 'Rugby',
};

export type RuleKey =
  | 'r1_motivation_stakes'
  | 'r2_form_momentum'
  | 'r3_h2h_standings_gap'
  | 'r4_tier_classification'
  | 'r5_derby_rivalry'
  | 'r6_squad_value_vs_form'
  | 'r7_continental_fatigue'
  | 'r8_coach_volatility';

export const RULE_KEYS: RuleKey[] = [
  'r1_motivation_stakes',
  'r2_form_momentum',
  'r3_h2h_standings_gap',
  'r4_tier_classification',
  'r5_derby_rivalry',
  'r6_squad_value_vs_form',
  'r7_continental_fatigue',
  'r8_coach_volatility',
];

export interface AdaptedRuleSpec {
  key: RuleKey;
  index: number;
  universalName: string;
  universalFormula: string;
  sportTitle: string;
  metricUnit: string;
  dynamicSummary: string;
  csvColumnHint: string;
  defaultWeight: number; // sums to 1.0 across 8 rules per sport
}

export type RuleScoreVector = Record<RuleKey, number>; // each [0, 10]

export interface LearnedCoefficients {
  home_advantage_multiplier: number;
  form_momentum_weight: number;
  volatility_index: number;
  fatigue_penalty_modifier: number;
}

export interface TeamIntelligenceEntry {
  sample_size_matches: number;
  learned_coefficients: LearnedCoefficients;
}

/**
 * Exact JSON schema contract for Team Intelligence Matrices
 */
export interface IntelligenceMatrixPayload {
  sync_timestamp: string;
  model_engine: string;
  meta_improvement_notes: string;
  team_intelligence_matrices: Record<string, TeamIntelligenceEntry>;
}

export interface HistoricalMatchRow {
  id: string;
  date: string;
  sport: SportId;
  competition: string;
  selection: string;
  opponent: string;
  market: string;
  decimalOdds: number;
  isHomeOrFavoredContext: boolean;
  rules: RuleScoreVector;
  outcomeWon: 0 | 1;
  sampleWeight?: number;
}

export interface DailyFixture {
  id: string;
  date: string;
  kickoffTime: string;
  sport: SportId;
  competition: string;
  venueOrSurface: string;
  selection: string;
  opponent: string;
  matchupLabel: string;
  market: string;
  decimalOdds: number;
  isHomeOrFavoredContext: boolean;
  rules: RuleScoreVector;
  sportContextStat: string;
}

export interface RuleBreakdownItem {
  key: RuleKey;
  index: number;
  sportTitle: string;
  universalFormula: string;
  metricUnit: string;
  rawScore: number; // 0..10
  effectiveScore: number; // after R2->R3 coupling, R6 cap, & volatility/derby/fatigue gates
  priorWeight: number;
  neuralAttribution: number; // normalized importance share 0..1
  weightedPoints: number;
}

export interface PredictionResult {
  fixture: DailyFixture;
  rank: number;
  eightPointScore: number; // 0..100 scaled
  eightPointNormalized: number; // 0..8.00 scale
  ruleProbability: number; // 0..1
  neuralProbability: number; // 0..1
  hybridProbability: number; // 0..1
  impliedProbability: number; // 1 / decimalOdds
  edgePercent: number; // (hybridProb * odds - 1) * 100
  fairOdds: number;
  kellyFractionPercent: number; // quarter-Kelly bankroll %
  confidenceTier: 'High Conviction' | 'Strong Value' | 'Caution / Damped';
  cautionFlags: string[];
  teamCoefficients: LearnedCoefficients;
  sampleSizeMatches: number;
  ruleBreakdown: RuleBreakdownItem[];
}

export interface NeuralHyperparameters {
  epochs: number;
  learningRate: number;
  l2Regularization: number;
  hiddenLayer1Size: number;
  hiddenLayer2Size: number;
  neuralBlendAlpha: number; // 0 = pure 8-rule engine, 1 = pure MLP neural engine
}

export interface EpochSnapshot {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  valAccuracy: number;
}

export interface CorpusEvolutionPoint {
  milestoneIndex: number;
  corpusSize: number;
  trainRows: number;
  holdoutRows: number;
  throughDate: string;
  competitorsTracked: number;
  ruleBrier: number;
  neuralBrier: number;
  hybridBrier: number;
  ruleAccuracyPct: number;
  neuralAccuracyPct: number;
  hybridAccuracyPct: number;
  brierImprovementVsInitialPct: number;
}

export interface TrainingReport {
  trainedAt: string;
  totalRows: number;
  trainRows: number;
  valRows: number;
  sportCounts: Record<SportId, number>;
  baselineRuleAccuracy: number;
  baselineRuleBrier: number;
  neuralValAccuracy: number;
  neuralValBrier: number;
  hybridValAccuracy: number;
  hybridValBrier: number;
  epochHistory: EpochSnapshot[];
  learnedFeatureImportance: Record<RuleKey, number>;
  confusionMatrix: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
}

export type SettlementStatus = 'pending' | 'settled' | 'adapted';

export interface DailyAuditEntry {
  id: string;
  auditDate: string;
  sport: SportId;
  competition: string;
  selection: string;
  opponent: string;
  market: string;
  isHomeOrFavoredContext: boolean;
  decimalOdds: number;
  kellyFractionPercent: number;
  ruleProbability: number;
  neuralProbability: number;
  hybridProbability: number;
  cautionFlags: string[];
  rules: RuleScoreVector;
  settlementStatus: SettlementStatus;
  actualOutcome: -1 | 0 | 1; // -1 = pending/void, 0 = lost, 1 = won
  scoreSummary: string;
}

export interface CalibrationBucket {
  label: string;
  count: number;
  avgPredictedProb: number;
  realizedHitRate: number;
  calibrationGap: number; // realizedHitRate - avgPredictedProb
}

export interface RuleFailureDiagnostic {
  ruleKey: RuleKey;
  title: string;
  lossCount: number;
  explanation: string;
}

export interface SportAuditMetrics {
  sport: SportId;
  total: number;
  settled: number;
  won: number;
  lost: number;
  hitRate: number;
  flatUnitsPL: number;
  flatRoiPercent: number;
  hybridBrier: number;
}

export interface DailyAuditSummary {
  totalLocked: number;
  settledCount: number;
  pendingCount: number;
  adaptedCount: number;
  readyToAdaptCount: number;
  wonCount: number;
  lostCount: number;
  hitRate: number;
  flatUnitsPL: number;
  flatRoiPercent: number;
  kellyUnitsPL: number;
  ruleHitRate: number;
  neuralHitRate: number;
  hybridHitRate: number;
  ruleBrier: number;
  neuralBrier: number;
  hybridBrier: number;
  calibrationBuckets: CalibrationBucket[];
  ruleDiagnostics: RuleFailureDiagnostic[];
  bySport: Record<SportId, SportAuditMetrics>;
}

export interface AdaptationDeltaReport {
  adaptedAt: string;
  auditDate: string;
  newlyIngestedRows: number;
  totalCorpusBefore: number;
  totalCorpusAfter: number;
  prevAlpha: number;
  nextAlpha: number;
  prevValAccuracy: number;
  nextValAccuracy: number;
  prevValBrier: number;
  nextValBrier: number;
  ruleBrierOnAudit: number;
  neuralBrierOnAudit: number;
  shiftedCompetitors: {
    name: string;
    sampleSize: number;
    prevVolatility: number;
    nextVolatility: number;
    nextFormWeight: number;
  }[];
}

