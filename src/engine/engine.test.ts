import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SPORTS, RULE_KEYS, SportId } from '../types/sports';
import {
  evaluateEightPointModel,
  getDefaultSportWeights,
  isVolatileCompetition,
  SPORT_ADAPTED_RULES,
} from './sportRules';
import {
  DEFAULT_HYPERPARAMETERS,
  createUntrainedNeuralEngine,
  rankCrossSportTop10,
  rankTop10BetsForSport,
  trainNeuralNetworkOnCSV,
} from './neuralNetwork';
import {
  exportPredictionsToCSV,
  parseHistoricalCSV,
  serializeHistoricalRowsToCSV,
  fingerprintHistoricalRows,
  validateIntelligenceMatrixJSON,
} from './csvParser';
import {
  generateSyntheticTestFixtures,
  generateSyntheticTestHistoricalRows,
} from './__tests__/testFixtures';
import {
  adaptNeuralEngineFromAudit,
  isSourceVerifiedScoreSummary,
  buildLockedAuditCardForDate,
  computeDailyAuditSummary,
  getPreviousDateISO,
  selectSuppliedFixturesForDate,
} from './auditEngine';

test('source verification marker requires a credential-free HTTPS URL', () => {
  assert.equal(isSourceVerifiedScoreSummary('SOURCE-VERIFIED: https://results.example.org/match/123'), true);
  assert.equal(isSourceVerifiedScoreSummary('SOURCE-VERIFIED: http://results.example.org/match/123'), false);
  assert.equal(isSourceVerifiedScoreSummary('SOURCE-VERIFIED: https://user:pass@results.example.org/match/123'), false);
  assert.equal(isSourceVerifiedScoreSummary('SOURCE-VERIFIED: not-a-url'), false);
});

test('corpus fingerprint changes when data changes even if row count stays the same', () => {
  const rows = generateSyntheticTestHistoricalRows(2);
  assert.equal(fingerprintHistoricalRows(rows), fingerprintHistoricalRows(rows.map((row) => ({ ...row }))));
  const changed = rows.map((row, index) => index === 0 ? { ...row, selection: `${row.selection} changed` } : row);
  assert.equal(changed.length, rows.length);
  assert.notEqual(fingerprintHistoricalRows(rows), fingerprintHistoricalRows(changed));
});

test('empty initial engine is explicitly untrained and exposes no performance metrics', () => {
  const engine = createUntrainedNeuralEngine();
  assert.equal(engine.report.totalRows, 0);
  assert.equal(engine.report.trainRows, 0);
  assert.equal(engine.report.valRows, 0);
  assert.equal(engine.report.epochHistory.length, 0);
  assert.equal(engine.intelligencePayload.model_engine, 'UNTRAINED — awaiting historical results');
  assert.equal(Object.keys(engine.intelligencePayload.team_intelligence_matrices).length, 0);
});

test('all 6 sports adapt the universal 8 rules with normalized weights summing to 1.0', () => {
  assert.equal(ALL_SPORTS.length, 6);
  const weights = getDefaultSportWeights();

  for (const sport of ALL_SPORTS) {
    const specs = SPORT_ADAPTED_RULES[sport];
    assert.equal(specs.length, 8, `Expected 8 adapted rules for ${sport}`);
    const keys = specs.map((s) => s.key);
    assert.deepEqual(keys, RULE_KEYS);

    const weightSum = Object.values(weights[sport]).reduce((a, b) => a + b, 0);
    assert.ok(
      Math.abs(weightSum - 1.0) < 1e-6,
      `Weights for ${sport} must sum to 1.0, got ${weightSum}`
    );
  }
});

test('universal 8-rule guardrails enforce Squad Value cap (R6 <= Core Trio) and Volatile League watchlist caution (R8)', () => {
  const weights = getDefaultSportWeights()[SportId.Soccer];

  // Paper tiger: huge squad value (9.8), but poor Motivation (3.5), Form (3.5), and H2H/Gap (3.5)
  const paperTiger = evaluateEightPointModel(
    SportId.Soccer,
    {
      r1_motivation_stakes: 3.5,
      r2_form_momentum: 3.5,
      r3_h2h_standings_gap: 3.5,
      r4_tier_classification: 6.5,
      r5_derby_rivalry: 8.0,
      r6_squad_value_vs_form: 9.8,
      r7_continental_fatigue: 8.0,
      r8_coach_volatility: 7.0,
    },
    weights,
    true,
    1.85,
    1.0,
    1.0,
    0.2,
    1.0,
    'Premier League'
  );
  // Effective R6 score must be strictly capped near core trio (3.5 + 0.65 = 4.15), never 9.8!
  assert.ok(paperTiger.effectiveScores.r6_squad_value_vs_form <= 4.2);

  // Watchlist volatile leagues (Japan, Korea, China, Norway, Sweden, Belarus, Bulgaria, Romania, Ukraine, Russia)
  for (const league of [
    'J1 League (Japan)',
    'K League 1 (South Korea)',
    'Chinese Super League',
    'Eliteserien (Norway)',
    'Allsvenskan (Sweden)',
    'Vysheyshaya Liga Belarus',
    'Parva Liga Bulgaria',
    'SuperLiga Romania',
    'Premier Liga Ukraine',
    'Russian Premier League',
  ]) {
    assert.equal(isVolatileCompetition(league), true, `Expected ${league} on watchlist`);
  }

  const baseRules = {
    r1_motivation_stakes: 8.5,
    r2_form_momentum: 8.2,
    r3_h2h_standings_gap: 8.0,
    r4_tier_classification: 8.0,
    r5_derby_rivalry: 8.5,
    r6_squad_value_vs_form: 7.8,
    r7_continental_fatigue: 8.4,
    r8_coach_volatility: 7.8,
  };

  const cleanEval = evaluateEightPointModel(
    SportId.Soccer,
    baseRules,
    weights,
    true,
    1.90,
    1.0,
    1.0,
    0.2,
    1.0,
    'Premier League'
  );
  const volatileEval = evaluateEightPointModel(
    SportId.Soccer,
    baseRules,
    weights,
    true,
    1.90,
    1.0,
    1.0,
    0.2,
    1.0,
    'Allsvenskan (Sweden)'
  );

  assert.ok(
    volatileEval.ruleProbability < cleanEval.ruleProbability,
    'Volatile league watchlist should damp overconfident win probability'
  );
  assert.ok(volatileEval.cautionFlags.includes('High-Volatility League Watchlist'));
});

test('CSV parser round-trips universal 8-rule multi-sport data and validates malformed inputs', () => {
  const emptyRes = parseHistoricalCSV('   ');
  assert.ok(emptyRes.errors.length > 0);
  assert.equal(emptyRes.rows.length, 0);

  const missingColRes = parseHistoricalCSV('date,sport,notes\n2026-10-01,soccer,hello');
  assert.ok(missingColRes.errors.length >= 2);

  const sampleRows = generateSyntheticTestHistoricalRows(10);
  assert.equal(sampleRows.length, 60);

  const csvString = serializeHistoricalRowsToCSV(sampleRows);
  const parsed = parseHistoricalCSV(csvString);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.rows.length, 60);
  assert.equal(parsed.rows[0].selection, sampleRows[0].selection);
  assert.equal(parsed.rows[0].outcomeWon, sampleRows[0].outcomeWon);

  // Missing source values must be excluded rather than silently defaulted into training data.
  const incompleteLines = csvString.split('\n');
  const firstDataCells = incompleteLines[1].split(',');
  firstDataCells[0] = ''; // missing date
  incompleteLines[1] = firstDataCells.join(',');
  const incompleteParsed = parseHistoricalCSV(incompleteLines.join('\n'));
  assert.equal(incompleteParsed.rows.length, sampleRows.length - 1);
  assert.ok(incompleteParsed.warnings.some((warning) => warning.includes('required fields are blank')));

  const invalidDateLines = csvString.split('\n');
  const invalidDateCells = invalidDateLines[1].split(',');
  invalidDateCells[0] = '2026-02-30';
  invalidDateLines[1] = invalidDateCells.join(',');
  const invalidDateParsed = parseHistoricalCSV(invalidDateLines.join('\n'));
  assert.equal(invalidDateParsed.rows.length, sampleRows.length - 1);
  assert.ok(invalidDateParsed.warnings.some((warning) => warning.includes('real YYYY-MM-DD date')));
});

test('20-input MLP neural network trains on CSV rows, reduces loss, and generates compliant Team Intelligence Matrix JSON', () => {
  const rows = generateSyntheticTestHistoricalRows(40);
  const engine = trainNeuralNetworkOnCSV(rows, {
    ...DEFAULT_HYPERPARAMETERS,
    epochs: 80,
    learningRate: 0.04,
  });

  const history = engine.report.epochHistory;
  assert.ok(history.length >= 3);
  const initialLoss = history[0].trainLoss;
  const finalLoss = history[history.length - 1].trainLoss;
  assert.ok(
    finalLoss < initialLoss,
    `Expected neural network loss to decrease during training (${initialLoss} -> ${finalLoss})`
  );

  const impSum = Object.values(engine.report.learnedFeatureImportance).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(impSum - 1.0) < 1e-5);

  const jsonText = JSON.stringify(engine.intelligencePayload, null, 2);
  const schemaCheck = validateIntelligenceMatrixJSON(jsonText);
  assert.equal(schemaCheck.error, null);
  assert.ok(schemaCheck.payload !== null);
  assert.ok(Object.keys(schemaCheck.payload.team_intelligence_matrices).length >= 20);
});

test('Daily prediction engine produces exact 10 best bets per day for each of the 6 sports', () => {
  const rows = generateSyntheticTestHistoricalRows(30);
  const engine = trainNeuralNetworkOnCSV(rows);
  const weights = getDefaultSportWeights();
  const dailyFixtures = generateSyntheticTestFixtures('2026-10-25');

  for (const sport of ALL_SPORTS) {
    const top10 = rankTop10BetsForSport(dailyFixtures, sport, engine, weights, 10);
    assert.equal(top10.length, 10, `Expected 10 best bets for ${sport}`);
    assert.equal(top10[0].rank, 1);
    assert.equal(top10[9].rank, 10);

    for (const bet of top10) {
      assert.equal(bet.fixture.sport, sport);
      assert.ok(bet.hybridProbability > 0.02 && bet.hybridProbability < 0.98);
      assert.ok(bet.eightPointNormalized >= 0 && bet.eightPointNormalized <= 8);
      assert.equal(bet.ruleBreakdown.length, 8);
    }
  }

  const crossTop10 = rankCrossSportTop10(dailyFixtures, engine, weights, 10);
  assert.equal(crossTop10.length, 10);
  const exported = exportPredictionsToCSV(crossTop10);
  assert.equal(exported.split('\n').length, 11);
});

test('daily prediction fixture selection never falls back to generated demo fixtures', () => {
  const supplied = selectSuppliedFixturesForDate('2026-10-25', []);
  assert.deepEqual(supplied, []);
  const engine = trainNeuralNetworkOnCSV(generateSyntheticTestHistoricalRows(12));
  const predictions = rankTop10BetsForSport(
    supplied,
    SportId.Soccer,
    engine,
    getDefaultSportWeights(),
    10
  );
  assert.equal(predictions.length, 0);
});

test('locked audit cards never invent demo fixtures when no verified fixtures are supplied', () => {
  const rows = generateSyntheticTestHistoricalRows(12);
  const engine = trainNeuralNetworkOnCSV(rows);
  const emptyCard = buildLockedAuditCardForDate(
    '2026-10-24',
    engine,
    getDefaultSportWeights(),
    [],
    false
  );
  assert.deepEqual(emptyCard, []);
});

test('Simulated settlement is excluded from real metrics and cannot train the model', () => {
  assert.equal(getPreviousDateISO('2026-10-25'), '2026-10-24');

  const baseCorpus = generateSyntheticTestHistoricalRows(30); // 180 rows
  const weights = getDefaultSportWeights();
  const initialEngine = trainNeuralNetworkOnCSV(baseCorpus, DEFAULT_HYPERPARAMETERS, weights);

  const explicitDemoFixtures = generateSyntheticTestFixtures('2026-10-24');
  const lockedCard = buildLockedAuditCardForDate(
    '2026-10-24',
    initialEngine,
    weights,
    explicitDemoFixtures,
    true
  );
  assert.equal(lockedCard.length, 60);

  const summary = computeDailyAuditSummary(lockedCard);
  assert.equal(summary.totalLocked, 60);
  assert.equal(summary.settledCount, 0, 'Synthetic outcomes must not count as real settlements');
  assert.equal(summary.readyToAdaptCount, 0);
  assert.equal(summary.wonCount + summary.lostCount, 0);
  assert.ok(lockedCard.every((entry) => entry.scoreSummary.startsWith('SIMULATED:')));
  assert.throws(
    () => adaptNeuralEngineFromAudit('2026-10-24', lockedCard, baseCorpus, DEFAULT_HYPERPARAMETERS, weights, initialEngine),
    /source-verified settlements are queued for adaptation/
  );

  const malformedSourceCard = lockedCard.map((entry) => ({
    ...entry,
    settlementStatus: 'settled' as const,
    actualOutcome: 1 as const,
    scoreSummary: 'SOURCE-VERIFIED: not-a-url',
  }));
  assert.equal(computeDailyAuditSummary(malformedSourceCard).settledCount, 0);
  assert.throws(
    () => adaptNeuralEngineFromAudit('2026-10-24', malformedSourceCard, baseCorpus, DEFAULT_HYPERPARAMETERS, weights, initialEngine),
    /source-verified settlements are queued for adaptation/
  );

  // Exercise the adaptation path separately with explicitly marked verified test records.
  const verifiedTestCard = lockedCard.map((entry) => ({
    ...entry,
    scoreSummary: 'SOURCE-VERIFIED: https://example.com/test-result',
  }));
  const adapted = adaptNeuralEngineFromAudit(
    '2026-10-24',
    verifiedTestCard,
    baseCorpus,
    DEFAULT_HYPERPARAMETERS,
    weights,
    initialEngine
  );

  assert.equal(adapted.deltaReport.newlyIngestedRows, 60);
  assert.equal(adapted.nextCorpus.length, 240);
  assert.ok(
    adapted.nextHyperparams.neuralBlendAlpha >= 0.35 &&
      adapted.nextHyperparams.neuralBlendAlpha <= 0.78
  );
  assert.ok(
    adapted.updatedEntries.every((e) => e.settlementStatus === 'adapted'),
    'All settled picks should lock into terminal adapted status after ingestion'
  );

  const postSummary = computeDailyAuditSummary(adapted.updatedEntries);
  assert.equal(postSummary.readyToAdaptCount, 0);
  assert.equal(postSummary.adaptedCount, 60);
});

test('computeCorpusEvolutionCurve tracks Brier score improvement and accuracy evolution across corpus growth', async () => {
  const { computeCorpusEvolutionCurve } = await import('./neuralNetwork');
  const weights = getDefaultSportWeights();
  const baseCorpus = generateSyntheticTestHistoricalRows(60); // 360 rows
  const engine = trainNeuralNetworkOnCSV(baseCorpus, DEFAULT_HYPERPARAMETERS, weights);

  const curve360 = computeCorpusEvolutionCurve(baseCorpus, DEFAULT_HYPERPARAMETERS, weights);
  assert.equal(curve360.length, 7);
  assert.equal(curve360[0].corpusSize, 36);
  assert.equal(curve360[curve360.length - 1].corpusSize, 360);

  // Corpus sizes and dates must progress monotonically
  for (let i = 1; i < curve360.length; i++) {
    assert.ok(curve360[i].corpusSize > curve360[i - 1].corpusSize);
    assert.ok(curve360[i].throughDate >= curve360[i - 1].throughDate);
  }

  const firstPt = curve360[0];
  const finalPt = curve360[curve360.length - 1];

  // Full-corpus endpoint must match active TrainingReport holdout Brier & accuracy
  assert.ok(Math.abs(finalPt.hybridBrier - engine.report.hybridValBrier) < 0.001);
  assert.ok(Math.abs(finalPt.neuralBrier - engine.report.neuralValBrier) < 0.001);
  assert.ok(
    finalPt.hybridBrier < firstPt.hybridBrier,
    `Expected Hybrid Brier score to improve (decrease) from 36 rows (${firstPt.hybridBrier}) to 360 rows (${finalPt.hybridBrier})`
  );
  assert.ok(
    finalPt.neuralBrier < firstPt.neuralBrier,
    `Expected Neural MLP Brier score to improve (decrease) from 36 rows (${firstPt.neuralBrier}) to 360 rows (${finalPt.neuralBrier})`
  );
  assert.ok(finalPt.brierImprovementVsInitialPct > 0);

  // A larger synthetic test corpus verifies curve expansion independently of
  // settlement/adaptation, which must require genuinely source-verified results.
  const expandedCorpus = generateSyntheticTestHistoricalRows(70).map((row, index, allRows) => ({
    ...row,
    date: index >= allRows.length - 60 ? '2026-10-24' : row.date,
  }));
  const curve420 = computeCorpusEvolutionCurve(
    expandedCorpus,
    DEFAULT_HYPERPARAMETERS,
    weights
  );
  assert.equal(curve420[curve420.length - 1].corpusSize, 420);
  assert.equal(curve420[curve420.length - 1].throughDate, '2026-10-24');

  // Verify small CSV slice (18 rows) produces deduplicated valid curve points
  const smallCurve = computeCorpusEvolutionCurve(baseCorpus.slice(0, 18), DEFAULT_HYPERPARAMETERS, weights);
  assert.ok(smallCurve.length >= 3);
  assert.equal(smallCurve[smallCurve.length - 1].corpusSize, 18);
});


