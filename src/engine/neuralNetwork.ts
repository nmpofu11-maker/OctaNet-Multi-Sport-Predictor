import {
  ALL_SPORTS,
  CorpusEvolutionPoint,
  DailyFixture,
  EpochSnapshot,
  HistoricalMatchRow,
  IntelligenceMatrixPayload,
  LearnedCoefficients,
  NeuralHyperparameters,
  PredictionResult,
  RULE_KEYS,
  RuleBreakdownItem,
  RuleKey,
  SportId,
  TeamIntelligenceEntry,
  TrainingReport,
} from '../types/sports';
import {
  evaluateEightPointModel,
  isVolatileCompetition,
  normalizeWeights,
  SPORT_ADAPTED_RULES,
  SportRuleWeights,
} from './sportRules';

/**
 * Input vector layout (20 features) designed specifically around the Universal 8 Multi-Sport Rules:
 * [0..7]   Effective normalized 8-rule scores (-1..+1):
 *            0: R1 Motivation & Qualification Stakes
 *            1: R2 Last-5 Form & Attacking Momentum
 *            2: R3 H2H + 8-Spot Standings Gap (incorporating R2)
 *            3: R4 Competitor Tier Classification
 *            4: R5 Derby & Rivalry Disruption Guard
 *            5: R6 Squad Valuation (capped by Core Trio R1-R3)
 *            6: R7 Continental / Schedule Sandwich Fatigue
 *            7: R8 Coach H2H & Volatile League Caution
 * [8]      Non-Linear Guardrail Neuron: Core Trio ((R1+R2+R3)/3) minus Raw Squad Value (R6)
 * [9]      Disruption & Volatility Gate: composite caution signal from Derby (R5), Fatigue (R7), & Watchlist (R8)
 * [10..15] One-hot Sport encoding (Soccer, Tennis, Basketball, Golf, Cricket, Rugby)
 * [16]     Implied Market Probability (1 / decimalOdds)
 * [17]     Learned Home/Surface Advantage Multiplier
 * [18]     Learned Form Momentum Weight
 * [19]     Learned Volatility & Fatigue Composite
 */
export const INPUT_DIM = 20;

export interface MLPWeights {
  inputDim: number;
  h1Dim: number;
  h2Dim: number;
  W1: number[][];
  b1: number[];
  W2: number[][];
  b2: number[];
  W3: number[];
  b3: number;
}

export interface TrainedNeuralEngine {
  weights: MLPWeights;
  hyperparams: NeuralHyperparameters;
  intelligencePayload: IntelligenceMatrixPayload;
  report: TrainingReport;
}

export const DEFAULT_HYPERPARAMETERS: NeuralHyperparameters = {
  epochs: 90,
  learningRate: 0.035,
  l2Regularization: 0.0008,
  hiddenLayer1Size: 16,
  hiddenLayer2Size: 8,
  neuralBlendAlpha: 0.60,
};

export const DEFAULT_COEFFICIENTS: LearnedCoefficients = {
  home_advantage_multiplier: 1.04,
  form_momentum_weight: 1.02,
  volatility_index: 0.24,
  fatigue_penalty_modifier: 1.0,
};

class SeededRNG {
  private state: number;
  constructor(seed = 20261025) {
    this.state = seed >>> 0;
  }
  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 4294967296;
  }
  gaussian(): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }
}

function sigmoid(z: number): number {
  const clipped = Math.max(-25, Math.min(25, z));
  return 1 / (1 + Math.exp(-clipped));
}

function leakyRelu(x: number): number {
  return x > 0 ? x : 0.08 * x;
}

function dLeakyRelu(x: number): number {
  return x > 0 ? 1 : 0.08;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function initializeMLP(
  h1Dim = 16,
  h2Dim = 8,
  seed = 42026
): MLPWeights {
  const rng = new SeededRNG(seed);
  const scale1 = Math.sqrt(2 / INPUT_DIM);
  const scale2 = Math.sqrt(2 / h1Dim);
  const scale3 = Math.sqrt(1 / h2Dim);

  const W1 = Array.from({ length: h1Dim }, () =>
    Array.from({ length: INPUT_DIM }, () => rng.gaussian() * scale1)
  );
  const b1 = new Array(h1Dim).fill(0.01);

  const W2 = Array.from({ length: h2Dim }, () =>
    Array.from({ length: h1Dim }, () => rng.gaussian() * scale2)
  );
  const b2 = new Array(h2Dim).fill(0.01);

  const W3 = Array.from({ length: h2Dim }, () => rng.gaussian() * scale3);
  const b3 = 0;

  return { inputDim: INPUT_DIM, h1Dim, h2Dim, W1, b1, W2, b2, W3, b3 };
}

export function buildFeatureVector(
  sport: SportId,
  rules: Record<RuleKey, number>,
  decimalOdds: number,
  coeffs: LearnedCoefficients,
  competition = ''
): number[] {
  const vec = new Array<number>(INPUT_DIM).fill(0);

  // Enforce universal structural rules right in the feature representation:
  const r1 = clamp(rules.r1_motivation_stakes ?? 5, 0, 10);
  const r2 = clamp(rules.r2_form_momentum ?? 5, 0, 10);
  const r3Coupled = clamp(0.75 * (rules.r3_h2h_standings_gap ?? 5) + 0.25 * r2, 0, 10);
  const r4 = clamp(rules.r4_tier_classification ?? 5, 0, 10);
  const r5 = clamp(rules.r5_derby_rivalry ?? 6, 0, 10);
  const coreTrio = (r1 + r2 + r3Coupled) / 3;
  const rawVal = clamp(rules.r6_squad_value_vs_form ?? 5, 0, 10);
  const r6Capped = clamp(Math.min(rawVal, coreTrio + 0.65), 0, 10);
  const r7 = clamp(rules.r7_continental_fatigue ?? 6, 0, 10);
  const watchlist = competition ? isVolatileCompetition(competition) : false;
  const r8 = clamp(
    (rules.r8_coach_volatility ?? 5.5) * (watchlist ? 0.72 : 1.0),
    0,
    10
  );

  const effectiveArr = [r1, r2, r3Coupled, r4, r5, r6Capped, r7, r8];
  for (let i = 0; i < 8; i++) {
    vec[i] = (effectiveArr[i] - 5.0) / 5.0;
  }

  // [8]: Core Trio vs Squad Value Guardrail (positive when motivation/form/H2H outpace paper value)
  vec[8] = clamp((coreTrio - rawVal) / 5.0, -1, 1);

  // [9]: Disruption & Volatility Gate (negative when derby, continental rotation, or volatile league hits)
  const minSafety = Math.min(r5, r7, r8);
  vec[9] = (minSafety - 5.5) / 4.5;

  // [10..15]: one-hot sport
  const sportIdx = ALL_SPORTS.indexOf(sport);
  if (sportIdx >= 0) {
    vec[10 + sportIdx] = 1.0;
  }

  // [16]: market implied probability
  const implied = clamp(1 / Math.max(1.04, decimalOdds), 0.04, 0.96);
  vec[16] = (implied - 0.5) * 2.0;

  // [17..19]: learned competitor intelligence coefficients
  vec[17] = clamp(coeffs.home_advantage_multiplier - 1.0, -0.6, 0.6);
  vec[18] = clamp(coeffs.form_momentum_weight - 1.0, -0.6, 0.6);
  vec[19] = clamp(
    (coeffs.fatigue_penalty_modifier - 1.0) * 0.5 - (coeffs.volatility_index - 0.25),
    -0.8,
    0.8
  );
  return vec;
}

export function forwardMLP(weights: MLPWeights, x: number[]): {
  z1: number[];
  a1: number[];
  z2: number[];
  a2: number[];
  z3: number;
  prob: number;
} {
  const { h1Dim, h2Dim, W1, b1, W2, b2, W3, b3 } = weights;
  const z1 = new Array<number>(h1Dim);
  const a1 = new Array<number>(h1Dim);
  for (let i = 0; i < h1Dim; i++) {
    let sum = b1[i];
    const row = W1[i];
    for (let j = 0; j < INPUT_DIM; j++) {
      sum += row[j] * x[j];
    }
    z1[i] = sum;
    a1[i] = leakyRelu(sum);
  }

  const z2 = new Array<number>(h2Dim);
  const a2 = new Array<number>(h2Dim);
  for (let i = 0; i < h2Dim; i++) {
    let sum = b2[i];
    const row = W2[i];
    for (let j = 0; j < h1Dim; j++) {
      sum += row[j] * a1[j];
    }
    z2[i] = sum;
    a2[i] = leakyRelu(sum);
  }

  let z3 = b3;
  for (let j = 0; j < h2Dim; j++) {
    z3 += W3[j] * a2[j];
  }
  const prob = clamp(sigmoid(z3), 0.01, 0.99);
  return { z1, a1, z2, a2, z3, prob };
}

/**
 * Computes exact input-gradient sensitivity |dProb / dx_k| for the 8 universal rules
 */
export function computeRuleGradientAttribution(
  weights: MLPWeights,
  x: number[]
): Record<RuleKey, number> {
  const { h1Dim, h2Dim, W1, W2, W3 } = weights;
  const fwd = forwardMLP(weights, x);
  const dz3 = fwd.prob * (1 - fwd.prob);

  const dz2 = new Array<number>(h2Dim);
  for (let i = 0; i < h2Dim; i++) {
    dz2[i] = dz3 * W3[i] * dLeakyRelu(fwd.z2[i]);
  }

  const dz1 = new Array<number>(h1Dim);
  for (let j = 0; j < h1Dim; j++) {
    let acc = 0;
    for (let i = 0; i < h2Dim; i++) {
      acc += dz2[i] * W2[i][j];
    }
    dz1[j] = acc * dLeakyRelu(fwd.z1[j]);
  }

  const rawImportance: number[] = new Array(8).fill(0);
  let total = 0;
  for (let k = 0; k < 8; k++) {
    let grad = 0;
    for (let j = 0; j < h1Dim; j++) {
      grad += dz1[j] * W1[j][k];
    }
    const mag = Math.abs(grad) * (0.65 + 0.35 * Math.abs(x[k]));
    rawImportance[k] = mag;
    total += mag;
  }

  const result = {} as Record<RuleKey, number>;
  for (let k = 0; k < 8; k++) {
    result[RULE_KEYS[k]] = total > 1e-9 ? rawImportance[k] / total : 1 / 8;
  }
  return result;
}

/**
 * Learns Team / Competitor Intelligence Matrices directly from historical CSV rows
 * conforming strictly to the required JSON schema.
 */
export function deriveTeamIntelligenceMatrices(
  rows: HistoricalMatchRow[],
  modelEngineLabel: string,
  valAccuracy: number,
  valBrier: number
): IntelligenceMatrixPayload {
  interface Accumulator {
    matches: number;
    homeMatches: number;
    homeWins: number;
    awayMatches: number;
    awayWins: number;
    highFormWins: number;
    highFormCount: number;
    squaredResiduals: number;
    fatigueSpotWins: number;
    fatigueSpotCount: number;
  }

  const accMap = new Map<string, Accumulator>();

  for (const row of rows) {
    const entity = row.selection.trim();
    if (!entity) continue;
    let acc = accMap.get(entity);
    if (!acc) {
      acc = {
        matches: 0,
        homeMatches: 0,
        homeWins: 0,
        awayMatches: 0,
        awayWins: 0,
        highFormWins: 0,
        highFormCount: 0,
        squaredResiduals: 0,
        fatigueSpotWins: 0,
        fatigueSpotCount: 0,
      };
      accMap.set(entity, acc);
    }

    acc.matches += 1;
    const implied = clamp(1 / Math.max(1.05, row.decimalOdds), 0.05, 0.95);
    acc.squaredResiduals += Math.pow(row.outcomeWon - implied, 2);

    if (row.isHomeOrFavoredContext) {
      acc.homeMatches += 1;
      acc.homeWins += row.outcomeWon;
    } else {
      acc.awayMatches += 1;
      acc.awayWins += row.outcomeWon;
    }

    if (row.rules.r2_form_momentum >= 6.5) {
      acc.highFormCount += 1;
      acc.highFormWins += row.outcomeWon;
    }

    if (row.rules.r7_continental_fatigue <= 5.2) {
      acc.fatigueSpotCount += 1;
      acc.fatigueSpotWins += row.outcomeWon;
    }
  }

  const matrices: Record<string, TeamIntelligenceEntry> = {};
  const sortedNames = Array.from(accMap.keys()).sort((a, b) => a.localeCompare(b));

  for (const name of sortedNames) {
    const a = accMap.get(name)!;
    const homeRate = (a.homeWins + 2.4) / (a.homeMatches + 4);
    const awayRate = (a.awayWins + 2.0) / (a.awayMatches + 4);
    const homeAdv = clamp(1 + (homeRate - awayRate) * 0.45, 0.82, 1.38);

    const formRate = (a.highFormWins + 2.4) / (a.highFormCount + 4);
    const formWeight = clamp(0.85 + formRate * 0.42, 0.80, 1.35);

    const volatility = clamp(
      Math.sqrt(a.squaredResiduals / Math.max(1, a.matches)) * 0.58,
      0.11,
      0.55
    );

    const tiredWinRate = (a.fatigueSpotWins + 2.0) / (a.fatigueSpotCount + 4);
    const fatiguePenalty = clamp(1.22 - tiredWinRate * 0.4, 0.82, 1.32);

    matrices[name] = {
      sample_size_matches: a.matches,
      learned_coefficients: {
        home_advantage_multiplier: Number(homeAdv.toFixed(3)),
        form_momentum_weight: Number(formWeight.toFixed(3)),
        volatility_index: Number(volatility.toFixed(3)),
        fatigue_penalty_modifier: Number(fatiguePenalty.toFixed(3)),
      },
    };
  }

  return {
    sync_timestamp: new Date().toISOString(),
    model_engine: modelEngineLabel,
    meta_improvement_notes: `Trained universal 8-rule multi-sport MLP across ${rows.length} CSV records (${sortedNames.length} competitors). Holdout accuracy ${(valAccuracy * 100).toFixed(1)}%, Brier ${valBrier.toFixed(4)}.`,
    team_intelligence_matrices: matrices,
  };
}

/**
 * Trains the Multi-Layer Perceptron on historical CSV match rows using Momentum SGD + L2 Regularization
 */
export function trainNeuralNetworkOnCSV(
  rows: HistoricalMatchRow[],
  hyperparams: NeuralHyperparameters = DEFAULT_HYPERPARAMETERS,
  sportRuleWeights?: SportRuleWeights,
  existingMatrix?: IntelligenceMatrixPayload
): TrainedNeuralEngine {
  if (rows.length < 8) {
    throw new Error(
      'At least 8 historical match rows are required to train and validate the neural network.'
    );
  }

  const h1Dim = clamp(Math.round(hyperparams.hiddenLayer1Size), 4, 64);
  const h2Dim = clamp(Math.round(hyperparams.hiddenLayer2Size), 4, 32);
  const epochs = clamp(Math.round(hyperparams.epochs), 10, 400);
  const lr = clamp(hyperparams.learningRate, 0.001, 0.25);
  const l2 = clamp(hyperparams.l2Regularization, 0, 0.05);
  const blendAlpha = clamp(hyperparams.neuralBlendAlpha, 0, 1);

  const weightsMap = sportRuleWeights ?? ({} as SportRuleWeights);
  for (const s of ALL_SPORTS) {
    if (!weightsMap[s]) {
      const def = {} as Record<RuleKey, number>;
      for (const spec of SPORT_ADAPTED_RULES[s]) def[spec.key] = spec.defaultWeight;
      weightsMap[s] = def;
    }
  }

  // Keep evaluation outcomes out of learned features: reserve the latest 20% by date
  // before deriving competitor coefficients. Existing matrices may contain later labels,
  // so they are deliberately not used to construct validation features.
  const chronological = rows.map((row, idx) => ({ row, idx }))
    .sort((a, b) => a.row.date.localeCompare(b.row.date) || a.idx - b.idx);
  const holdoutCount = Math.max(0, Math.floor(chronological.length * 0.2));
  const trainingRows = chronological.slice(0, chronological.length - holdoutCount).map(({ row }) => row);
  const prelimMatrix = deriveTeamIntelligenceMatrices(
    trainingRows,
    `OctaNet-MLP-${INPUT_DIM}x${h1Dim}x${h2Dim}x1`,
    0.65,
    0.21
  );
  const mergedTeams: Record<string, TeamIntelligenceEntry> = {
    ...prelimMatrix.team_intelligence_matrices,
  };

  const dataset = rows.map((row) => {
    const coeffs = mergedTeams[row.selection]?.learned_coefficients ?? DEFAULT_COEFFICIENTS;
    const x = buildFeatureVector(
      row.sport,
      row.rules,
      row.decimalOdds,
      coeffs,
      row.competition
    );
    const ruleEval = evaluateEightPointModel(
      row.sport,
      row.rules,
      weightsMap[row.sport],
      row.isHomeOrFavoredContext,
      row.decimalOdds,
      coeffs.home_advantage_multiplier,
      coeffs.form_momentum_weight,
      coeffs.volatility_index,
      coeffs.fatigue_penalty_modifier,
      row.competition
    );
    return {
      row,
      x,
      y: row.outcomeWon,
      weight: clamp(row.sampleWeight ?? 1.0, 0.2, 3.0),
      ruleProb: ruleEval.ruleProbability,
    };
  });

  const orderedDataset = dataset.map((sample, idx) => ({ sample, idx }))
    .sort((a, b) => a.sample.row.date.localeCompare(b.sample.row.date) || a.idx - b.idx)
    .map(({ sample }) => sample);
  const holdoutSize = Math.max(0, Math.floor(orderedDataset.length * 0.2));
  const trainSet = orderedDataset.slice(0, orderedDataset.length - holdoutSize);
  const valSet = orderedDataset.slice(orderedDataset.length - holdoutSize);
  const evalSet = valSet.length >= 2 ? valSet : trainSet;

  const mlp = initializeMLP(h1Dim, h2Dim, 20261025);

  const vW1 = Array.from({ length: h1Dim }, () => new Array<number>(INPUT_DIM).fill(0));
  const vb1 = new Array<number>(h1Dim).fill(0);
  const vW2 = Array.from({ length: h2Dim }, () => new Array<number>(h1Dim).fill(0));
  const vb2 = new Array<number>(h2Dim).fill(0);
  const vW3 = new Array<number>(h2Dim).fill(0);
  let vb3 = 0;
  const momentum = 0.85;

  const epochHistory: EpochSnapshot[] = [];
  const totalWeight = Math.max(
    1,
    trainSet.reduce((acc, s) => acc + s.weight, 0)
  );
  const invN = 1 / totalWeight;

  for (let epoch = 1; epoch <= epochs; epoch++) {
    const gW1 = Array.from({ length: h1Dim }, () => new Array<number>(INPUT_DIM).fill(0));
    const gb1 = new Array<number>(h1Dim).fill(0);
    const gW2 = Array.from({ length: h2Dim }, () => new Array<number>(h1Dim).fill(0));
    const gb2 = new Array<number>(h2Dim).fill(0);
    const gW3 = new Array<number>(h2Dim).fill(0);
    let gb3 = 0;

    let trainLossSum = 0;

    for (const sample of trainSet) {
      const fwd = forwardMLP(mlp, sample.x);
      const p = fwd.prob;
      const y = sample.y;
      trainLossSum +=
        sample.weight * -(y * Math.log(p) + (1 - y) * Math.log(1 - p));

      const dz3 = sample.weight * (p - y) * invN;
      gb3 += dz3;

      const dz2 = new Array<number>(h2Dim);
      for (let i = 0; i < h2Dim; i++) {
        gW3[i] += dz3 * fwd.a2[i];
        dz2[i] = dz3 * mlp.W3[i] * dLeakyRelu(fwd.z2[i]);
        gb2[i] += dz2[i];
        const gRow2 = gW2[i];
        for (let j = 0; j < h1Dim; j++) {
          gRow2[j] += dz2[i] * fwd.a1[j];
        }
      }

      for (let j = 0; j < h1Dim; j++) {
        let acc = 0;
        for (let i = 0; i < h2Dim; i++) {
          acc += dz2[i] * mlp.W2[i][j];
        }
        const dz1j = acc * dLeakyRelu(fwd.z1[j]);
        gb1[j] += dz1j;
        const gRow1 = gW1[j];
        for (let k = 0; k < INPUT_DIM; k++) {
          gRow1[k] += dz1j * sample.x[k];
        }
      }
    }

    const stepLr = lr * (0.55 + 0.45 * Math.cos((Math.PI * (epoch - 1)) / epochs));

    for (let i = 0; i < h1Dim; i++) {
      vb1[i] = momentum * vb1[i] + stepLr * gb1[i];
      mlp.b1[i] -= vb1[i];
      for (let k = 0; k < INPUT_DIM; k++) {
        const regGrad = gW1[i][k] + l2 * mlp.W1[i][k];
        vW1[i][k] = momentum * vW1[i][k] + stepLr * regGrad;
        mlp.W1[i][k] -= vW1[i][k];
      }
    }

    for (let i = 0; i < h2Dim; i++) {
      vb2[i] = momentum * vb2[i] + stepLr * gb2[i];
      mlp.b2[i] -= vb2[i];
      for (let j = 0; j < h1Dim; j++) {
        const regGrad = gW2[i][j] + l2 * mlp.W2[i][j];
        vW2[i][j] = momentum * vW2[i][j] + stepLr * regGrad;
        mlp.W2[i][j] -= vW2[i][j];
      }
      const regW3 = gW3[i] + l2 * mlp.W3[i];
      vW3[i] = momentum * vW3[i] + stepLr * regW3;
      mlp.W3[i] -= vW3[i];
    }
    vb3 = momentum * vb3 + stepLr * gb3;
    mlp.b3 -= vb3;

    if (epoch === 1 || epoch === epochs || epoch % 3 === 0) {
      let valLossSum = 0;
      let valCorrect = 0;
      for (const sample of evalSet) {
        const vp = forwardMLP(mlp, sample.x).prob;
        valLossSum += -(sample.y * Math.log(vp) + (1 - sample.y) * Math.log(1 - vp));
        const pred = vp >= 0.5 ? 1 : 0;
        if (pred === sample.y) valCorrect += 1;
      }
      epochHistory.push({
        epoch,
        trainLoss: trainLossSum / Math.max(1, trainSet.length),
        valLoss: valLossSum / Math.max(1, evalSet.length),
        valAccuracy: valCorrect / Math.max(1, evalSet.length),
      });
    }
  }

  let ruleCorrect = 0;
  let ruleBrierSum = 0;
  let neuralCorrect = 0;
  let neuralBrierSum = 0;
  let hybridCorrect = 0;
  let hybridBrierSum = 0;
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const sample of evalSet) {
    const np = forwardMLP(mlp, sample.x).prob;
    const rp = sample.ruleProb;
    const hp = blendAlpha * np + (1 - blendAlpha) * rp;

    if ((rp >= 0.5 ? 1 : 0) === sample.y) ruleCorrect += 1;
    ruleBrierSum += Math.pow(rp - sample.y, 2);

    if ((np >= 0.5 ? 1 : 0) === sample.y) neuralCorrect += 1;
    neuralBrierSum += Math.pow(np - sample.y, 2);

    const hPred = hp >= 0.5 ? 1 : 0;
    if (hPred === sample.y) hybridCorrect += 1;
    hybridBrierSum += Math.pow(hp - sample.y, 2);

    if (hPred === 1 && sample.y === 1) tp += 1;
    else if (hPred === 0 && sample.y === 0) tn += 1;
    else if (hPred === 1 && sample.y === 0) fp += 1;
    else fn += 1;
  }

  const evalN = Math.max(1, evalSet.length);
  const baselineRuleAccuracy = ruleCorrect / evalN;
  const baselineRuleBrier = ruleBrierSum / evalN;
  const neuralValAccuracy = neuralCorrect / evalN;
  const neuralValBrier = neuralBrierSum / evalN;
  const hybridValAccuracy = hybridCorrect / evalN;
  const hybridValBrier = hybridBrierSum / evalN;

  const importanceAccum: Record<RuleKey, number> = {
    r1_motivation_stakes: 0,
    r2_form_momentum: 0,
    r3_h2h_standings_gap: 0,
    r4_tier_classification: 0,
    r5_derby_rivalry: 0,
    r6_squad_value_vs_form: 0,
    r7_continental_fatigue: 0,
    r8_coach_volatility: 0,
  };
  for (const sample of dataset) {
    const attr = computeRuleGradientAttribution(mlp, sample.x);
    for (const k of RULE_KEYS) {
      importanceAccum[k] += attr[k];
    }
  }
  const learnedFeatureImportance = normalizeWeights(importanceAccum);

  const sportCounts: Record<SportId, number> = {
    [SportId.Soccer]: 0,
    [SportId.Tennis]: 0,
    [SportId.Basketball]: 0,
    [SportId.Golf]: 0,
    [SportId.Cricket]: 0,
    [SportId.Rugby]: 0,
  };
  for (const r of rows) {
    sportCounts[r.sport] = (sportCounts[r.sport] ?? 0) + 1;
  }

  const engineLabel = `OctaNet-Universal8-MLP (${INPUT_DIM}x${h1Dim}x${h2Dim}x1, alpha=${blendAlpha.toFixed(2)})`;
  const finalPayload = deriveTeamIntelligenceMatrices(
    rows,
    engineLabel,
    hybridValAccuracy,
    hybridValBrier
  );
  if (existingMatrix?.team_intelligence_matrices) {
    finalPayload.team_intelligence_matrices = {
      ...existingMatrix.team_intelligence_matrices,
      ...finalPayload.team_intelligence_matrices,
    };
  }

  return {
    weights: mlp,
    hyperparams: {
      epochs,
      learningRate: lr,
      l2Regularization: l2,
      hiddenLayer1Size: h1Dim,
      hiddenLayer2Size: h2Dim,
      neuralBlendAlpha: blendAlpha,
    },
    intelligencePayload: finalPayload,
    report: {
      trainedAt: finalPayload.sync_timestamp,
      totalRows: rows.length,
      trainRows: trainSet.length,
      valRows: evalSet.length,
      sportCounts,
      baselineRuleAccuracy,
      baselineRuleBrier,
      neuralValAccuracy,
      neuralValBrier,
      hybridValAccuracy,
      hybridValBrier,
      epochHistory,
      learnedFeatureImportance,
      confusionMatrix: { tp, tn, fp, fn },
    },
  };
}

/**
 * Evaluates how Brier score calibration and holdout validation accuracy evolve as the
 * chronological historical CSV corpus grows from an initial early-season slice up to the
 * full active corpus (including newly adapted T-1 audit cohorts).
 */
export function computeCorpusEvolutionCurve(
  rows: HistoricalMatchRow[],
  hyperparams: NeuralHyperparameters = DEFAULT_HYPERPARAMETERS,
  sportRuleWeights?: SportRuleWeights
): CorpusEvolutionPoint[] {
  if (rows.length < 8) {
    return [];
  }

  const h1Dim = clamp(Math.round(hyperparams.hiddenLayer1Size), 4, 64);
  const h2Dim = clamp(Math.round(hyperparams.hiddenLayer2Size), 4, 32);
  const epochs = clamp(Math.round(hyperparams.epochs), 10, 400);
  const lr = clamp(hyperparams.learningRate, 0.001, 0.25);
  const l2 = clamp(hyperparams.l2Regularization, 0, 0.05);
  const blendAlpha = clamp(hyperparams.neuralBlendAlpha, 0, 1);

  const weightsMap = {} as SportRuleWeights;
  for (const s of ALL_SPORTS) {
    if (sportRuleWeights?.[s]) {
      weightsMap[s] = sportRuleWeights[s];
    } else {
      const def = {} as Record<RuleKey, number>;
      for (const spec of SPORT_ADAPTED_RULES[s]) def[spec.key] = spec.defaultWeight;
      weightsMap[s] = def;
    }
  }

  // Chronological out-of-time holdout: latest 20% is evaluation-only.
  // Competitor matrices for each milestone are derived only from that milestone's training rows.
  const indexedRows = rows.map((row, idx) => ({ row, idx }))
    .sort((a, b) => a.row.date.localeCompare(b.row.date) || a.idx - b.idx);
  const holdoutSize = Math.max(0, Math.floor(indexedRows.length * 0.2));
  const trainChronological = indexedRows.slice(0, indexedRows.length - holdoutSize).map((x) => x.row);
  const valRaw = indexedRows.slice(indexedRows.length - holdoutSize).map((x) => x.row);

  const evalRows = valRaw.length >= 2 ? valRaw : trainChronological;
  const totalTrain = trainChronological.length;
  if (totalTrain < 4) {
    return [];
  }

  const targetFractions = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1.0];
  const milestones: { corpusSize: number; trainCount: number; isFull: boolean }[] = [];
  const seenTrainCounts = new Set<number>();

  for (const frac of targetFractions) {
    const isFull = frac >= 0.999;
    const trainCount = isFull
      ? totalTrain
      : clamp(Math.round(totalTrain * frac), 4, Math.max(4, totalTrain - 1));
    if (seenTrainCounts.has(trainCount) && !isFull) continue;
    seenTrainCounts.add(trainCount);
    const corpusSize = isFull
      ? rows.length
      : Math.max(trainCount + 1, Math.round(rows.length * (trainCount / totalTrain)));
    milestones.push({ corpusSize, trainCount, isFull });
  }

  // Ensure if the final 1.0 milestone collided with an earlier count on tiny CSVs, only keep unique corpusSize
  const dedupedMilestones = milestones.filter(
    (m, i, arr) => i === arr.findIndex((other) => other.corpusSize === m.corpusSize)
  );

  const points: CorpusEvolutionPoint[] = [];
  let initialHybridBrier = 0;

  for (let mIdx = 0; mIdx < dedupedMilestones.length; mIdx++) {
    const { corpusSize, trainCount, isFull } = dedupedMilestones[mIdx];
    const trainSlice = trainChronological.slice(0, trainCount);
    // Report the corpus coverage date at the full-corpus endpoint, including the held-out rows.
    // Intermediate points remain dated by the last row available to that milestone's training slice.
    const throughDate = isFull
      ? indexedRows[indexedRows.length - 1]?.row.date ?? rows[rows.length - 1].date
      : trainSlice[trainSlice.length - 1]?.date ?? rows[rows.length - 1].date;

    const matrixSourceRows = trainSlice; // Never fit features on holdout labels.
    const learnedMatrix = deriveTeamIntelligenceMatrices(
      matrixSourceRows,
      `OctaNet-MLP-${INPUT_DIM}x${h1Dim}x${h2Dim}x1`,
      0.65,
      0.21
    );
    const teamMap = learnedMatrix.team_intelligence_matrices;
    const competitorsTracked = Object.keys(teamMap).length;

    const buildSample = (row: HistoricalMatchRow) => {
      const coeffs = teamMap[row.selection]?.learned_coefficients ?? DEFAULT_COEFFICIENTS;
      const x = buildFeatureVector(
        row.sport,
        row.rules,
        row.decimalOdds,
        coeffs,
        row.competition
      );
      const ruleEval = evaluateEightPointModel(
        row.sport,
        row.rules,
        weightsMap[row.sport],
        row.isHomeOrFavoredContext,
        row.decimalOdds,
        coeffs.home_advantage_multiplier,
        coeffs.form_momentum_weight,
        coeffs.volatility_index,
        coeffs.fatigue_penalty_modifier,
        row.competition
      );
      return {
        x,
        y: row.outcomeWon,
        weight: clamp(row.sampleWeight ?? 1.0, 0.2, 3.0),
        ruleProb: ruleEval.ruleProbability,
      };
    };

    const trainSamples = trainSlice.map(buildSample);
    const evalSamples = evalRows.map(buildSample);

    const mlp = initializeMLP(h1Dim, h2Dim, 20261025);
    const vW1 = Array.from({ length: h1Dim }, () => new Array<number>(INPUT_DIM).fill(0));
    const vb1 = new Array<number>(h1Dim).fill(0);
    const vW2 = Array.from({ length: h2Dim }, () => new Array<number>(h1Dim).fill(0));
    const vb2 = new Array<number>(h2Dim).fill(0);
    const vW3 = new Array<number>(h2Dim).fill(0);
    let vb3 = 0;
    const momentum = 0.85;

    const gW1 = Array.from({ length: h1Dim }, () => new Array<number>(INPUT_DIM).fill(0));
    const gb1 = new Array<number>(h1Dim).fill(0);
    const gW2 = Array.from({ length: h2Dim }, () => new Array<number>(h1Dim).fill(0));
    const gb2 = new Array<number>(h2Dim).fill(0);
    const gW3 = new Array<number>(h2Dim).fill(0);
    const z1Buf = new Float64Array(h1Dim);
    const a1Buf = new Float64Array(h1Dim);
    const z2Buf = new Float64Array(h2Dim);
    const a2Buf = new Float64Array(h2Dim);
    const dz2Buf = new Float64Array(h2Dim);

    const totalWeight = Math.max(
      1,
      trainSamples.reduce((acc, s) => acc + s.weight, 0)
    );
    const invN = 1 / totalWeight;

    for (let epoch = 1; epoch <= epochs; epoch++) {
      for (let i = 0; i < h1Dim; i++) {
        gb1[i] = 0;
        gW1[i].fill(0);
      }
      for (let i = 0; i < h2Dim; i++) {
        gb2[i] = 0;
        gW3[i] = 0;
        gW2[i].fill(0);
      }
      let gb3 = 0;

      for (const sample of trainSamples) {
        const sx = sample.x;
        for (let i = 0; i < h1Dim; i++) {
          let sum = mlp.b1[i];
          const row = mlp.W1[i];
          for (let j = 0; j < INPUT_DIM; j++) sum += row[j] * sx[j];
          z1Buf[i] = sum;
          a1Buf[i] = sum > 0 ? sum : 0.08 * sum;
        }
        for (let i = 0; i < h2Dim; i++) {
          let sum = mlp.b2[i];
          const row = mlp.W2[i];
          for (let j = 0; j < h1Dim; j++) sum += row[j] * a1Buf[j];
          z2Buf[i] = sum;
          a2Buf[i] = sum > 0 ? sum : 0.08 * sum;
        }
        let z3 = mlp.b3;
        for (let j = 0; j < h2Dim; j++) z3 += mlp.W3[j] * a2Buf[j];
        const prob = clamp(sigmoid(z3), 0.01, 0.99);

        const dz3 = sample.weight * (prob - sample.y) * invN;
        gb3 += dz3;

        for (let i = 0; i < h2Dim; i++) {
          gW3[i] += dz3 * a2Buf[i];
          const dz2i = dz3 * mlp.W3[i] * (z2Buf[i] > 0 ? 1 : 0.08);
          dz2Buf[i] = dz2i;
          gb2[i] += dz2i;
          const gRow2 = gW2[i];
          for (let j = 0; j < h1Dim; j++) {
            gRow2[j] += dz2i * a1Buf[j];
          }
        }

        for (let j = 0; j < h1Dim; j++) {
          let acc = 0;
          for (let i = 0; i < h2Dim; i++) {
            acc += dz2Buf[i] * mlp.W2[i][j];
          }
          const dz1j = acc * (z1Buf[j] > 0 ? 1 : 0.08);
          gb1[j] += dz1j;
          const gRow1 = gW1[j];
          for (let k = 0; k < INPUT_DIM; k++) {
            gRow1[k] += dz1j * sx[k];
          }
        }
      }

      const stepLr = lr * (0.55 + 0.45 * Math.cos((Math.PI * (epoch - 1)) / epochs));

      for (let i = 0; i < h1Dim; i++) {
        vb1[i] = momentum * vb1[i] + stepLr * gb1[i];
        mlp.b1[i] -= vb1[i];
        for (let k = 0; k < INPUT_DIM; k++) {
          const regGrad = gW1[i][k] + l2 * mlp.W1[i][k];
          vW1[i][k] = momentum * vW1[i][k] + stepLr * regGrad;
          mlp.W1[i][k] -= vW1[i][k];
        }
      }

      for (let i = 0; i < h2Dim; i++) {
        vb2[i] = momentum * vb2[i] + stepLr * gb2[i];
        mlp.b2[i] -= vb2[i];
        for (let j = 0; j < h1Dim; j++) {
          const regGrad = gW2[i][j] + l2 * mlp.W2[i][j];
          vW2[i][j] = momentum * vW2[i][j] + stepLr * regGrad;
          mlp.W2[i][j] -= vW2[i][j];
        }
        const regW3 = gW3[i] + l2 * mlp.W3[i];
        vW3[i] = momentum * vW3[i] + stepLr * regW3;
        mlp.W3[i] -= vW3[i];
      }
      vb3 = momentum * vb3 + stepLr * gb3;
      mlp.b3 -= vb3;
    }

    let ruleCorrect = 0;
    let ruleBrierSum = 0;
    let neuralCorrect = 0;
    let neuralBrierSum = 0;
    let hybridCorrect = 0;
    let hybridBrierSum = 0;

    for (const sample of evalSamples) {
      const np = forwardMLP(mlp, sample.x).prob;
      const rp = sample.ruleProb;
      const hp = blendAlpha * np + (1 - blendAlpha) * rp;

      if ((rp >= 0.5 ? 1 : 0) === sample.y) ruleCorrect += 1;
      ruleBrierSum += Math.pow(rp - sample.y, 2);

      if ((np >= 0.5 ? 1 : 0) === sample.y) neuralCorrect += 1;
      neuralBrierSum += Math.pow(np - sample.y, 2);

      if ((hp >= 0.5 ? 1 : 0) === sample.y) hybridCorrect += 1;
      hybridBrierSum += Math.pow(hp - sample.y, 2);
    }

    const evalN = Math.max(1, evalSamples.length);
    const ruleBrier = Number((ruleBrierSum / evalN).toFixed(4));
    const neuralBrier = Number((neuralBrierSum / evalN).toFixed(4));
    const hybridBrier = Number((hybridBrierSum / evalN).toFixed(4));

    if (mIdx === 0) {
      initialHybridBrier = hybridBrier;
    }
    const brierImprovementVsInitialPct =
      initialHybridBrier > 1e-6
        ? Number((((initialHybridBrier - hybridBrier) / initialHybridBrier) * 100).toFixed(2))
        : 0;

    points.push({
      milestoneIndex: mIdx + 1,
      corpusSize,
      trainRows: trainCount,
      holdoutRows: evalN,
      throughDate,
      competitorsTracked,
      ruleBrier,
      neuralBrier,
      hybridBrier,
      ruleAccuracyPct: Number(((ruleCorrect / evalN) * 100).toFixed(1)),
      neuralAccuracyPct: Number(((neuralCorrect / evalN) * 100).toFixed(1)),
      hybridAccuracyPct: Number(((hybridCorrect / evalN) * 100).toFixed(1)),
      brierImprovementVsInitialPct,
    });
  }

  return points;
}

/**
 * Scores a single fixture using the Universal 8-Rule Engine + Trained Multi-Sport Neural Network
 */
export function predictFixture(
  fixture: DailyFixture,
  engine: TrainedNeuralEngine,
  sportWeights: Record<RuleKey, number>
): Omit<PredictionResult, 'rank'> {
  const teamEntry = engine.intelligencePayload.team_intelligence_matrices[fixture.selection];
  const coeffs = teamEntry?.learned_coefficients ?? DEFAULT_COEFFICIENTS;
  const sampleSizeMatches = teamEntry?.sample_size_matches ?? 0;

  const normPriorWeights = normalizeWeights(sportWeights);
  const ruleEval = evaluateEightPointModel(
    fixture.sport,
    fixture.rules,
    normPriorWeights,
    fixture.isHomeOrFavoredContext,
    fixture.decimalOdds,
    coeffs.home_advantage_multiplier,
    coeffs.form_momentum_weight,
    coeffs.volatility_index,
    coeffs.fatigue_penalty_modifier,
    fixture.competition
  );

  const featureVec = buildFeatureVector(
    fixture.sport,
    fixture.rules,
    fixture.decimalOdds,
    coeffs,
    fixture.competition
  );
  const rawNeuralProb = forwardMLP(engine.weights, featureVec).prob;
  const impliedProbability = clamp(1 / Math.max(1.02, fixture.decimalOdds), 0.02, 0.98);

  // Apply extra caution shrinkage when fixture is on the volatile-league watchlist (Rule 8) or fierce derby (Rule 5)
  const watchlist = isVolatileCompetition(fixture.competition);
  const marketAnchorShare = watchlist ? 0.48 : 0.32;
  const neuralProbability = clamp(
    (1 - marketAnchorShare) * rawNeuralProb + marketAnchorShare * impliedProbability,
    0.04,
    0.95
  );

  const alpha = clamp(engine.hyperparams.neuralBlendAlpha, 0, 1);
  const hybridProbability = clamp(
    alpha * neuralProbability + (1 - alpha) * ruleEval.ruleProbability,
    0.03,
    0.95
  );

  const edgePercent = (hybridProbability * fixture.decimalOdds - 1) * 100;
  const fairOdds = 1 / Math.max(0.03, hybridProbability);

  const b = Math.max(0.05, fixture.decimalOdds - 1);
  const fullKelly = (b * hybridProbability - (1 - hybridProbability)) / b;
  const kellyFractionPercent = clamp(
    Math.max(0, fullKelly) * (watchlist ? 16 : 25),
    0,
    5.0
  );

  const gradAttribution = computeRuleGradientAttribution(engine.weights, featureVec);
  const ruleSpecs = SPORT_ADAPTED_RULES[fixture.sport];

  const ruleBreakdown: RuleBreakdownItem[] = ruleSpecs.map((spec) => ({
    key: spec.key,
    index: spec.index,
    sportTitle: spec.sportTitle,
    universalFormula: spec.universalFormula,
    metricUnit: spec.metricUnit,
    rawScore: fixture.rules[spec.key],
    effectiveScore: ruleEval.effectiveScores[spec.key],
    priorWeight: normPriorWeights[spec.key],
    neuralAttribution: gradAttribution[spec.key],
    weightedPoints: ruleEval.weightedContributions[spec.key],
  }));

  let confidenceTier: PredictionResult['confidenceTier'] = 'Strong Value';
  if (ruleEval.cautionFlags.length > 0 && (watchlist || ruleEval.eightPointScale8 < 5.3)) {
    confidenceTier = 'Caution / Damped';
  } else if (
    edgePercent >= 6.5 &&
    ruleEval.eightPointScale8 >= 5.55 &&
    ruleEval.cautionFlags.length === 0
  ) {
    confidenceTier = 'High Conviction';
  }

  return {
    fixture,
    eightPointScore: Number(ruleEval.eightPointScore100.toFixed(1)),
    eightPointNormalized: Number(ruleEval.eightPointScale8.toFixed(2)),
    ruleProbability: ruleEval.ruleProbability,
    neuralProbability,
    hybridProbability,
    impliedProbability,
    edgePercent,
    fairOdds,
    kellyFractionPercent,
    confidenceTier,
    cautionFlags: ruleEval.cautionFlags,
    teamCoefficients: coeffs,
    sampleSizeMatches,
    ruleBreakdown,
  };
}

/**
 * Evaluates a pool of daily fixtures and returns the Top 10 Best Bets for a given sport
 * Penalizes volatile-league / derby / continental-fatigue traps so clean high-stakes spots rise to the top!
 */
export function rankTop10BetsForSport(
  fixtures: DailyFixture[],
  sport: SportId,
  engine: TrainedNeuralEngine,
  allSportWeights: SportRuleWeights,
  limit = 10
): PredictionResult[] {
  const sportFixtures = fixtures.filter((f) => f.sport === sport);
  const scored = sportFixtures.map((f) =>
    predictFixture(f, engine, allSportWeights[sport])
  );

  scored.sort((a, b) => {
    const penaltyA = a.cautionFlags.length * 3.5;
    const penaltyB = b.cautionFlags.length * 3.5;
    const scoreA =
      a.edgePercent * 1.35 + (a.eightPointNormalized - 4.5) * 4.5 + a.hybridProbability * 11 - penaltyA;
    const scoreB =
      b.edgePercent * 1.35 + (b.eightPointNormalized - 4.5) * 4.5 + b.hybridProbability * 11 - penaltyB;
    return scoreB - scoreA;
  });

  return scored.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

/**
 * Returns the Top 10 Cross-Sport Best Bets across all 6 sports combined
 */
export function rankCrossSportTop10(
  fixtures: DailyFixture[],
  engine: TrainedNeuralEngine,
  allSportWeights: SportRuleWeights,
  limit = 10
): PredictionResult[] {
  const scored = fixtures.map((f) =>
    predictFixture(f, engine, allSportWeights[f.sport])
  );
  scored.sort((a, b) => {
    const penaltyA = a.cautionFlags.length * 3.5;
    const penaltyB = b.cautionFlags.length * 3.5;
    const scoreA =
      a.edgePercent * 1.4 + (a.eightPointNormalized - 4.5) * 4.4 + a.hybridProbability * 10 - penaltyA;
    const scoreB =
      b.edgePercent * 1.4 + (b.eightPointNormalized - 4.5) * 4.4 + b.hybridProbability * 10 - penaltyB;
    return scoreB - scoreA;
  });
  return scored.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
