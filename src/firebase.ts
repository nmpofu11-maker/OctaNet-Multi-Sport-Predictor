import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ALL_SPORTS, DailyAuditEntry, HistoricalMatchRow, SportId } from './types/sports';
import { sanitizeDocId } from './engine/auditEngine';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate connection to Firestore on boot per Firebase integration specification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function clampNum(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
}

function safeStr(val: string, maxLen: number, fallback = 'Unknown'): string {
  const trimmed = (val ?? '').trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : fallback;
}

function safeDateIso(val: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : '2026-10-24';
}

export async function signInWithGooglePopup(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export interface WorkspaceMetricsInput {
  activeCorpusCount: number;
  neuralBlendAlpha: number;
  lastAuditDate: string;
  lastValidationAccuracy: number;
  lastBrierScore: number;
}

/**
 * Ensures the Master Gate /workspaces/{uid} document exists for the signed-in user
 */
export async function ensureUserWorkspace(
  uid: string,
  metrics: WorkspaceMetricsInput
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const path = `workspaces/${safeUid}`;
  const ref = doc(db, 'workspaces', safeUid);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: safeUid,
        activeCorpusCount: Math.round(clampNum(metrics.activeCorpusCount, 0, 50000)),
        neuralBlendAlpha: clampNum(metrics.neuralBlendAlpha, 0, 1),
        lastAuditDate: safeDateIso(metrics.lastAuditDate),
        lastValidationAccuracy: clampNum(metrics.lastValidationAccuracy, 0, 1),
        lastBrierScore: clampNum(metrics.lastBrierScore, 0, 1),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves locked daily predictions to /workspaces/{uid}/auditPicks/{pickId}
 */
export async function syncAuditCardToFirestore(
  uid: string,
  entries: DailyAuditEntry[]
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const basePath = `workspaces/${safeUid}/auditPicks`;
  try {
    const batch = writeBatch(db);
    for (const entry of entries) {
      const pickId = sanitizeDocId(entry.id);
      const ref = doc(db, 'workspaces', safeUid, 'auditPicks', pickId);
      batch.set(ref, {
        ownerId: safeUid,
        workspaceId: safeUid,
        auditDate: safeDateIso(entry.auditDate),
        sport: entry.sport,
        competition: safeStr(entry.competition, 120),
        selection: safeStr(entry.selection, 120),
        opponent: safeStr(entry.opponent, 120),
        market: safeStr(entry.market, 80),
        isHomeOrFavoredContext: Boolean(entry.isHomeOrFavoredContext),
        decimalOdds: clampNum(entry.decimalOdds, 1.01, 100),
        ruleProbability: clampNum(entry.ruleProbability, 0, 1),
        neuralProbability: clampNum(entry.neuralProbability, 0, 1),
        hybridProbability: clampNum(entry.hybridProbability, 0, 1),
        r1_motivation_stakes: clampNum(entry.rules.r1_motivation_stakes, 0, 10),
        r2_form_momentum: clampNum(entry.rules.r2_form_momentum, 0, 10),
        r3_h2h_standings_gap: clampNum(entry.rules.r3_h2h_standings_gap, 0, 10),
        r4_tier_classification: clampNum(entry.rules.r4_tier_classification, 0, 10),
        r5_derby_rivalry: clampNum(entry.rules.r5_derby_rivalry, 0, 10),
        r6_squad_value_vs_form: clampNum(entry.rules.r6_squad_value_vs_form, 0, 10),
        r7_continental_fatigue: clampNum(entry.rules.r7_continental_fatigue, 0, 10),
        r8_coach_volatility: clampNum(entry.rules.r8_coach_volatility, 0, 10),
        settlementStatus: entry.settlementStatus === 'adapted' ? 'settled' : entry.settlementStatus,
        actualOutcome: entry.actualOutcome,
        scoreSummary: (entry.scoreSummary ?? '').slice(0, 160),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, basePath);
  }
}

/**
 * Updates settlement outcome on a single non-adapted pick using Action 1 allowed keys
 */
export async function syncSinglePickSettlementToFirestore(
  uid: string,
  entry: DailyAuditEntry
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const pickId = sanitizeDocId(entry.id);
  const path = `workspaces/${safeUid}/auditPicks/${pickId}`;
  try {
    const ref = doc(db, 'workspaces', safeUid, 'auditPicks', pickId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await syncAuditCardToFirestore(uid, [entry]);
      return;
    }
    if (snap.data().settlementStatus === 'adapted') {
      return;
    }
    await updateDoc(ref, {
      settlementStatus: entry.settlementStatus === 'settled' ? 'settled' : 'pending',
      actualOutcome: entry.actualOutcome,
      scoreSummary: (entry.scoreSummary ?? '').slice(0, 160),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Atomically writes newly settled matches to /settledMatches/{pickId}, transitions /auditPicks/{pickId}
 * into terminal 'adapted' status (satisfying Pillar 7 existsAfter), and updates /workspaces/{uid}.
 */
export async function commitAdaptedPicksBatchToFirestore(
  uid: string,
  settledEntries: DailyAuditEntry[],
  nextMetrics: WorkspaceMetricsInput
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const basePath = `workspaces/${safeUid}`;
  try {
    // First ensure any local settled picks exist in auditPicks with status 'settled' before transitioning to 'adapted'
    const prepBatch = writeBatch(db);
    let needsPrep = false;
    for (const entry of settledEntries) {
      const pickId = sanitizeDocId(entry.id);
      const pickRef = doc(db, 'workspaces', safeUid, 'auditPicks', pickId);
      const snap = await getDoc(pickRef);
      if (!snap.exists()) {
        needsPrep = true;
        prepBatch.set(pickRef, {
          ownerId: safeUid,
          workspaceId: safeUid,
          auditDate: safeDateIso(entry.auditDate),
          sport: entry.sport,
          competition: safeStr(entry.competition, 120),
          selection: safeStr(entry.selection, 120),
          opponent: safeStr(entry.opponent, 120),
          market: safeStr(entry.market, 80),
          isHomeOrFavoredContext: Boolean(entry.isHomeOrFavoredContext),
          decimalOdds: clampNum(entry.decimalOdds, 1.01, 100),
          ruleProbability: clampNum(entry.ruleProbability, 0, 1),
          neuralProbability: clampNum(entry.neuralProbability, 0, 1),
          hybridProbability: clampNum(entry.hybridProbability, 0, 1),
          r1_motivation_stakes: clampNum(entry.rules.r1_motivation_stakes, 0, 10),
          r2_form_momentum: clampNum(entry.rules.r2_form_momentum, 0, 10),
          r3_h2h_standings_gap: clampNum(entry.rules.r3_h2h_standings_gap, 0, 10),
          r4_tier_classification: clampNum(entry.rules.r4_tier_classification, 0, 10),
          r5_derby_rivalry: clampNum(entry.rules.r5_derby_rivalry, 0, 10),
          r6_squad_value_vs_form: clampNum(entry.rules.r6_squad_value_vs_form, 0, 10),
          r7_continental_fatigue: clampNum(entry.rules.r7_continental_fatigue, 0, 10),
          r8_coach_volatility: clampNum(entry.rules.r8_coach_volatility, 0, 10),
          settlementStatus: 'settled',
          actualOutcome: entry.actualOutcome === 1 ? 1 : 0,
          scoreSummary: (entry.scoreSummary ?? '').slice(0, 160),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else if (snap.data().settlementStatus === 'pending') {
        needsPrep = true;
        prepBatch.update(pickRef, {
          settlementStatus: 'settled',
          actualOutcome: entry.actualOutcome === 1 ? 1 : 0,
          scoreSummary: (entry.scoreSummary ?? '').slice(0, 160),
          updatedAt: serverTimestamp(),
        });
      }
    }
    if (needsPrep) {
      await prepBatch.commit();
    }

    // Atomic batch: create settledMatches/{pickId} + lock auditPicks/{pickId} to 'adapted' + update workspace
    const atomicBatch = writeBatch(db);
    for (const entry of settledEntries) {
      const pickId = sanitizeDocId(entry.id);
      const settledRef = doc(db, 'workspaces', safeUid, 'settledMatches', pickId);
      const pickRef = doc(db, 'workspaces', safeUid, 'auditPicks', pickId);

      atomicBatch.set(settledRef, {
        ownerId: safeUid,
        workspaceId: safeUid,
        date: safeDateIso(entry.auditDate),
        sport: entry.sport,
        competition: safeStr(entry.competition, 120),
        selection: safeStr(entry.selection, 120),
        opponent: safeStr(entry.opponent, 120),
        market: safeStr(entry.market, 80),
        isHomeOrFavoredContext: Boolean(entry.isHomeOrFavoredContext),
        decimalOdds: clampNum(entry.decimalOdds, 1.01, 100),
        r1_motivation_stakes: clampNum(entry.rules.r1_motivation_stakes, 0, 10),
        r2_form_momentum: clampNum(entry.rules.r2_form_momentum, 0, 10),
        r3_h2h_standings_gap: clampNum(entry.rules.r3_h2h_standings_gap, 0, 10),
        r4_tier_classification: clampNum(entry.rules.r4_tier_classification, 0, 10),
        r5_derby_rivalry: clampNum(entry.rules.r5_derby_rivalry, 0, 10),
        r6_squad_value_vs_form: clampNum(entry.rules.r6_squad_value_vs_form, 0, 10),
        r7_continental_fatigue: clampNum(entry.rules.r7_continental_fatigue, 0, 10),
        r8_coach_volatility: clampNum(entry.rules.r8_coach_volatility, 0, 10),
        outcomeWon: entry.actualOutcome === 1 ? 1 : 0,
        sourceVerified: true,
        sourceReference: entry.scoreSummary.replace(/^SOURCE-VERIFIED:\\s*/, '').slice(0, 500),
        createdAt: serverTimestamp(),
      });

      atomicBatch.update(pickRef, {
        settlementStatus: 'adapted',
        updatedAt: serverTimestamp(),
      });
    }

    const wsRef = doc(db, 'workspaces', safeUid);
    atomicBatch.update(wsRef, {
      activeCorpusCount: Math.round(clampNum(nextMetrics.activeCorpusCount, 0, 50000)),
      neuralBlendAlpha: clampNum(nextMetrics.neuralBlendAlpha, 0, 1),
      lastAuditDate: safeDateIso(nextMetrics.lastAuditDate),
      lastValidationAccuracy: clampNum(nextMetrics.lastValidationAccuracy, 0, 1),
      lastBrierScore: clampNum(nextMetrics.lastBrierScore, 0, 1),
      updatedAt: serverTimestamp(),
    });

    await atomicBatch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, basePath);
  }
}

/**
 * Real-time subscription to user's settledMatches subcollection (enforcing ownerId == uid & workspaceId == uid)
 */
export function subscribeWorkspaceSettledMatches(
  uid: string,
  onRows: (rows: HistoricalMatchRow[]) => void,
  onErrorMsg?: (msg: string) => void
): Unsubscribe {
  const safeUid = sanitizeDocId(uid);
  const path = `workspaces/${safeUid}/settledMatches`;
  const q = query(
    collection(db, 'workspaces', safeUid, 'settledMatches'),
    where('ownerId', '==', safeUid),
    where('workspaceId', '==', safeUid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows: HistoricalMatchRow[] = snap.docs.flatMap((d): HistoricalMatchRow[] => {
        const data = d.data();
        const date = typeof data.date === 'string' ? data.date : '';
        const parsedDate = /^\\d{4}-\\d{2}-\\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
        const validDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date);
        const sport = data.sport as SportId;
        const strings = ['competition', 'selection', 'opponent', 'market'];
        const validStrings = strings.every((key) => typeof data[key] === 'string' && data[key].trim().length > 0);
        const odds = data.decimalOdds;
        const outcome = data.outcomeWon;
        const ruleKeys = [
          'r1_motivation_stakes', 'r2_form_momentum', 'r3_h2h_standings_gap', 'r4_tier_classification',
          'r5_derby_rivalry', 'r6_squad_value_vs_form', 'r7_continental_fatigue', 'r8_coach_volatility',
        ];
        const validRules = ruleKeys.every((key) => typeof data[key] === 'number' && Number.isFinite(data[key]) && data[key] >= 0 && data[key] <= 10);
        if (
          data.sourceVerified !== true || typeof data.sourceReference !== 'string' || !/^https?:\\/\\//i.test(data.sourceReference) ||
          !validDate || !ALL_SPORTS.includes(sport) || !validStrings || typeof data.isHomeOrFavoredContext !== 'boolean' ||
          typeof odds !== 'number' || !Number.isFinite(odds) || odds < 1.01 || odds > 100 ||
          (outcome !== 0 && outcome !== 1) || !validRules
        ) return [];
        return [{
          id: d.id,
          date,
          sport,
          competition: data.competition,
          selection: data.selection,
          opponent: data.opponent,
          market: data.market,
          decimalOdds: odds,
          isHomeOrFavoredContext: data.isHomeOrFavoredContext,
          rules: {
            r1_motivation_stakes: data.r1_motivation_stakes,
            r2_form_momentum: data.r2_form_momentum,
            r3_h2h_standings_gap: data.r3_h2h_standings_gap,
            r4_tier_classification: data.r4_tier_classification,
            r5_derby_rivalry: data.r5_derby_rivalry,
            r6_squad_value_vs_form: data.r6_squad_value_vs_form,
            r7_continental_fatigue: data.r7_continental_fatigue,
            r8_coach_volatility: data.r8_coach_volatility,
          },
          outcomeWon: outcome,
        }];
      });
      onRows(rows);
    },
    (error) => {
      if (onErrorMsg) {
        onErrorMsg(error instanceof Error ? error.message : String(error));
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
