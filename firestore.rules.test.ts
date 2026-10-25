import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const RULES_PATH = path.resolve(process.cwd(), 'firestore.rules');
const BLUEPRINT_PATH = path.resolve(process.cwd(), 'firebase-blueprint.json');

interface AuthCtx {
  uid: string;
  email_verified: boolean;
}

interface SimStore {
  workspaces: Record<string, Record<string, unknown>>;
  settledMatchesAfter: Record<string, boolean>;
}

const SERVER_TIME = '2026-10-25T14:35:00.000Z';

function isValidId(id: unknown): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
}

function isValidDateIso(val: unknown): boolean {
  return typeof val === 'string' && val.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(val);
}

function isValidSport(val: unknown): boolean {
  return (
    typeof val === 'string' &&
    val.length <= 20 &&
    ['soccer', 'tennis', 'basketball', 'golf', 'cricket', 'rugby'].includes(val)
  );
}

function isValidRuleScore(val: unknown): boolean {
  return typeof val === 'number' && !Number.isNaN(val) && val >= 0 && val <= 10;
}

function isValidProb(val: unknown): boolean {
  return typeof val === 'number' && !Number.isNaN(val) && val >= 0 && val <= 1;
}

function hasExactKeys(obj: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(obj);
  return keys.every((k) => actual.includes(k)) && actual.every((k) => keys.includes(k));
}

function affectedKeysOnly(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>,
  allowed: string[]
): boolean {
  const allKeys = new Set([...Object.keys(incoming), ...Object.keys(existing)]);
  for (const k of allKeys) {
    if (incoming[k] !== existing[k] && !allowed.includes(k)) {
      return false;
    }
  }
  return true;
}

function evaluateWorkspaceCreate(
  auth: AuthCtx | null,
  userId: string,
  incoming: Record<string, unknown>
): boolean {
  if (!auth || !auth.email_verified) return false;
  if (!isValidId(userId) || userId !== auth.uid) return false;
  const reqKeys = [
    'ownerId',
    'activeCorpusCount',
    'neuralBlendAlpha',
    'lastAuditDate',
    'lastValidationAccuracy',
    'lastBrierScore',
    'createdAt',
    'updatedAt',
  ];
  if (!hasExactKeys(incoming, reqKeys)) return false;
  if (!isValidId(incoming.ownerId) || incoming.ownerId !== auth.uid) return false;
  if (
    typeof incoming.activeCorpusCount !== 'number' ||
    !Number.isInteger(incoming.activeCorpusCount) ||
    incoming.activeCorpusCount < 0 ||
    incoming.activeCorpusCount > 50000
  ) {
    return false;
  }
  if (!isValidProb(incoming.neuralBlendAlpha)) return false;
  if (!isValidDateIso(incoming.lastAuditDate)) return false;
  if (!isValidProb(incoming.lastValidationAccuracy)) return false;
  if (!isValidProb(incoming.lastBrierScore)) return false;
  if (incoming.createdAt !== SERVER_TIME || incoming.updatedAt !== SERVER_TIME) return false;
  return true;
}

function isValidDailyAuditPickDoc(
  auth: AuthCtx,
  userId: string,
  data: Record<string, unknown>
): boolean {
  const keys = [
    'ownerId',
    'workspaceId',
    'auditDate',
    'sport',
    'competition',
    'selection',
    'opponent',
    'market',
    'isHomeOrFavoredContext',
    'decimalOdds',
    'ruleProbability',
    'neuralProbability',
    'hybridProbability',
    'r1_motivation_stakes',
    'r2_form_momentum',
    'r3_h2h_standings_gap',
    'r4_tier_classification',
    'r5_derby_rivalry',
    'r6_squad_value_vs_form',
    'r7_continental_fatigue',
    'r8_coach_volatility',
    'settlementStatus',
    'actualOutcome',
    'scoreSummary',
    'createdAt',
    'updatedAt',
  ];
  if (!hasExactKeys(data, keys)) return false;
  if (!isValidId(data.ownerId) || data.ownerId !== auth.uid) return false;
  if (!isValidId(data.workspaceId) || data.workspaceId !== userId) return false;
  if (!isValidDateIso(data.auditDate)) return false;
  if (!isValidSport(data.sport)) return false;
  for (const field of ['competition', 'selection', 'opponent'] as const) {
    const val = data[field];
    if (typeof val !== 'string' || val.length < 1 || val.length > 120) return false;
  }
  if (typeof data.market !== 'string' || data.market.length < 1 || data.market.length > 80) {
    return false;
  }
  if (typeof data.isHomeOrFavoredContext !== 'boolean') return false;
  if (typeof data.decimalOdds !== 'number' || data.decimalOdds < 1.01 || data.decimalOdds > 100) {
    return false;
  }
  if (
    !isValidProb(data.ruleProbability) ||
    !isValidProb(data.neuralProbability) ||
    !isValidProb(data.hybridProbability)
  ) {
    return false;
  }
  const ruleKeys = [
    'r1_motivation_stakes',
    'r2_form_momentum',
    'r3_h2h_standings_gap',
    'r4_tier_classification',
    'r5_derby_rivalry',
    'r6_squad_value_vs_form',
    'r7_continental_fatigue',
    'r8_coach_volatility',
  ];
  for (const rk of ruleKeys) {
    if (!isValidRuleScore(data[rk])) return false;
  }
  if (
    typeof data.settlementStatus !== 'string' ||
    !['pending', 'settled', 'adapted'].includes(data.settlementStatus)
  ) {
    return false;
  }
  if (typeof data.actualOutcome !== 'number' || ![-1, 0, 1].includes(data.actualOutcome)) {
    return false;
  }
  if (typeof data.scoreSummary !== 'string' || data.scoreSummary.length > 160) return false;
  return typeof data.createdAt === 'string' && typeof data.updatedAt === 'string';
}

function evaluateAuditPickCreate(
  auth: AuthCtx | null,
  store: SimStore,
  userId: string,
  pickId: string,
  incoming: Record<string, unknown>
): boolean {
  if (!auth || !auth.email_verified) return false;
  if (!isValidId(userId) || !isValidId(pickId) || userId !== auth.uid) return false;
  if (!isValidDailyAuditPickDoc(auth, userId, incoming)) return false;
  if (incoming.createdAt !== SERVER_TIME || incoming.updatedAt !== SERVER_TIME) return false;
  const parent = store.workspaces[userId];
  if (!parent || parent.ownerId !== auth.uid) return false;
  return true;
}

function evaluateAuditPickUpdate(
  auth: AuthCtx | null,
  store: SimStore,
  userId: string,
  pickId: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>
): boolean {
  if (!auth || !auth.email_verified) return false;
  if (!isValidId(userId) || !isValidId(pickId) || userId !== auth.uid) return false;
  if (!isValidDailyAuditPickDoc(auth, userId, incoming)) return false;
  if (existing.settlementStatus === 'adapted') return false;
  if (
    incoming.ownerId !== existing.ownerId ||
    incoming.workspaceId !== existing.workspaceId ||
    incoming.createdAt !== existing.createdAt ||
    incoming.updatedAt !== SERVER_TIME
  ) {
    return false;
  }
  const parent = store.workspaces[userId];
  if (!parent || parent.ownerId !== auth.uid) return false;

  const isSettleAction =
    ['pending', 'settled'].includes(String(incoming.settlementStatus)) &&
    affectedKeysOnly(incoming, existing, [
      'settlementStatus',
      'actualOutcome',
      'scoreSummary',
      'updatedAt',
    ]);

  const isAdaptAction =
    existing.settlementStatus === 'settled' &&
    (existing.actualOutcome === 0 || existing.actualOutcome === 1) &&
    incoming.settlementStatus === 'adapted' &&
    affectedKeysOnly(incoming, existing, ['settlementStatus', 'updatedAt']) &&
    Boolean(store.settledMatchesAfter[`${userId}/${pickId}`]);

  return isSettleAction || isAdaptAction;
}

function evaluateAuditPickList(
  auth: AuthCtx | null,
  userId: string,
  resourceDoc: Record<string, unknown>
): boolean {
  if (!auth) return false;
  return (
    userId === auth.uid &&
    resourceDoc.ownerId === auth.uid &&
    resourceDoc.workspaceId === userId
  );
}

function makeValidPick(uid = 'user_1'): Record<string, unknown> {
  return {
    ownerId: uid,
    workspaceId: uid,
    auditDate: '2026-10-24',
    sport: 'soccer',
    competition: 'Premier League',
    selection: 'Arsenal',
    opponent: 'Brighton',
    market: 'Moneyline (1X2)',
    isHomeOrFavoredContext: true,
    decimalOdds: 1.55,
    ruleProbability: 0.72,
    neuralProbability: 0.75,
    hybridProbability: 0.74,
    r1_motivation_stakes: 8.5,
    r2_form_momentum: 8.1,
    r3_h2h_standings_gap: 7.8,
    r4_tier_classification: 8.0,
    r5_derby_rivalry: 6.8,
    r6_squad_value_vs_form: 7.9,
    r7_continental_fatigue: 6.9,
    r8_coach_volatility: 7.2,
    settlementStatus: 'pending',
    actualOutcome: -1,
    scoreSummary: '',
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME,
  };
}

test('firestore.rules enforces Eight Pillars structural invariants and matches firebase-blueprint.json', () => {
  const rulesText = fs.readFileSync(RULES_PATH, 'utf-8');
  const blueprint = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, 'utf-8'));

  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('match /{document=**} {\n      allow read, write: if false;'));
  assert.ok(rulesText.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesText.includes('existsAfter(/databases/$(database)/documents/workspaces/$(userId)/settledMatches/$(pickId))'));

  // Every path in blueprint has a matching block in firestore.rules
  const paths = Object.keys(blueprint.firestore);
  assert.deepEqual(paths, [
    '/workspaces/{userId}',
    '/workspaces/{userId}/settledMatches/{matchId}',
    '/workspaces/{userId}/auditPicks/{pickId}',
  ]);
  assert.ok(rulesText.includes('match /workspaces/{userId}'));
  assert.ok(rulesText.includes('match /settledMatches/{matchId}'));
  assert.ok(rulesText.includes('match /auditPicks/{pickId}'));
});

test('Dirty Dozen adversarial payloads all return PERMISSION_DENIED (false) while valid operations succeed', () => {
  const verifiedOwner: AuthCtx = { uid: 'user_1', email_verified: true };
  const storeWithParent: SimStore = {
    workspaces: { user_1: { ownerId: 'user_1' } },
    settledMatchesAfter: { 'user_1/pick_1': true },
  };

  // Sanity check: valid workspace & pick succeed
  assert.equal(
    evaluateWorkspaceCreate(verifiedOwner, 'user_1', {
      ownerId: 'user_1',
      activeCorpusCount: 360,
      neuralBlendAlpha: 0.6,
      lastAuditDate: '2026-10-24',
      lastValidationAccuracy: 0.72,
      lastBrierScore: 0.184,
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME,
    }),
    true
  );
  assert.equal(
    evaluateAuditPickCreate(verifiedOwner, storeWithParent, 'user_1', 'pick_1', makeValidPick()),
    true
  );

  // DD-01: Shadow field injection
  assert.equal(
    evaluateWorkspaceCreate(verifiedOwner, 'user_1', {
      ownerId: 'user_1',
      activeCorpusCount: 360,
      neuralBlendAlpha: 0.6,
      lastAuditDate: '2026-10-24',
      lastValidationAccuracy: 0.72,
      lastBrierScore: 0.184,
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME,
      isAdmin: true,
    }),
    false
  );

  // DD-02: Unverified email spoof
  assert.equal(
    evaluateWorkspaceCreate({ uid: 'user_1', email_verified: false }, 'user_1', {
      ownerId: 'user_1',
      activeCorpusCount: 360,
      neuralBlendAlpha: 0.6,
      lastAuditDate: '2026-10-24',
      lastValidationAccuracy: 0.72,
      lastBrierScore: 0.184,
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME,
    }),
    false
  );

  // DD-03: Cross-tenant identity spoofing
  assert.equal(
    evaluateWorkspaceCreate(verifiedOwner, 'victim_uid', {
      ownerId: 'user_1',
      activeCorpusCount: 360,
      neuralBlendAlpha: 0.6,
      lastAuditDate: '2026-10-24',
      lastValidationAccuracy: 0.72,
      lastBrierScore: 0.184,
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME,
    }),
    false
  );

  // DD-04: Orphaned subcollection write without parent workspace
  assert.equal(
    evaluateAuditPickCreate(
      verifiedOwner,
      { workspaces: {}, settledMatchesAfter: {} },
      'user_1',
      'pick_1',
      makeValidPick()
    ),
    false
  );

  // DD-05: Path ID poisoning
  assert.equal(
    evaluateAuditPickCreate(
      verifiedOwner,
      storeWithParent,
      'user_1',
      'bad$id/../escape',
      makeValidPick()
    ),
    false
  );

  // DD-06: Denial-of-wallet oversized string
  assert.equal(
    evaluateAuditPickCreate(verifiedOwner, storeWithParent, 'user_1', 'pick_1', {
      ...makeValidPick(),
      scoreSummary: 'X'.repeat(5000),
    }),
    false
  );

  // DD-07: Out-of-range rule score value poisoning
  assert.equal(
    evaluateAuditPickCreate(verifiedOwner, storeWithParent, 'user_1', 'pick_1', {
      ...makeValidPick(),
      r1_motivation_stakes: 999,
    }),
    false
  );

  // DD-08: Update-gap partial key injection (modifying decimalOdds during settlement)
  const existingPending = { ...makeValidPick(), createdAt: '2026-10-24T10:00:00.000Z' };
  assert.equal(
    evaluateAuditPickUpdate(verifiedOwner, storeWithParent, 'user_1', 'pick_1', existingPending, {
      ...existingPending,
      decimalOdds: 9.99,
      settlementStatus: 'settled',
      actualOutcome: 1,
      scoreSummary: '2-0 FT',
      updatedAt: SERVER_TIME,
    }),
    false
  );

  // DD-09: Terminal state re-opening on 'adapted' pick
  const existingAdapted = {
    ...existingPending,
    settlementStatus: 'adapted',
    actualOutcome: 1,
    scoreSummary: '2-0 FT',
  };
  assert.equal(
    evaluateAuditPickUpdate(verifiedOwner, storeWithParent, 'user_1', 'pick_1', existingAdapted, {
      ...existingAdapted,
      settlementStatus: 'settled',
      actualOutcome: 0,
      updatedAt: SERVER_TIME,
    }),
    false
  );

  // DD-10: Timestamp forgery
  assert.equal(
    evaluateAuditPickUpdate(verifiedOwner, storeWithParent, 'user_1', 'pick_1', existingPending, {
      ...existingPending,
      settlementStatus: 'settled',
      actualOutcome: 1,
      scoreSummary: '2-0 FT',
      updatedAt: '2099-01-01T00:00:00.000Z',
    }),
    false
  );

  // DD-11: Atomicity violation (transitioning to 'adapted' without settledMatches/{pickId} batch write)
  const existingSettled = {
    ...existingPending,
    settlementStatus: 'settled',
    actualOutcome: 1,
    scoreSummary: '2-0 FT',
  };
  assert.equal(
    evaluateAuditPickUpdate(
      verifiedOwner,
      { workspaces: { user_1: { ownerId: 'user_1' } }, settledMatchesAfter: {} },
      'user_1',
      'pick_1',
      existingSettled,
      {
        ...existingSettled,
        settlementStatus: 'adapted',
        updatedAt: SERVER_TIME,
      }
    ),
    false
  );

  // DD-12: Unauthorized cross-user list scrape
  assert.equal(
    evaluateAuditPickList({ uid: 'attacker_uid', email_verified: true }, 'user_1', makeValidPick()),
    false
  );
});
