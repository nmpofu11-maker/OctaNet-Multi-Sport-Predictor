/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { BrainCircuit, Cloud, LogOut, Menu } from 'lucide-react';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AdaptationDeltaReport,
  ALL_SPORTS,
  DailyAuditEntry,
  DailyFixture,
  HistoricalMatchRow,
  IntelligenceMatrixPayload,
  NeuralHyperparameters,
  PredictionResult,
  RuleKey,
  SPORT_LABELS,
  SportId,
} from './types/sports';
import { getDefaultSportWeights, SportRuleWeights } from './engine/sportRules';
import {
  DEFAULT_HYPERPARAMETERS,
  rankCrossSportTop10,
  rankTop10BetsForSport,
  TrainedNeuralEngine,
  createUntrainedNeuralEngine,
  trainNeuralNetworkOnCSV,
} from './engine/neuralNetwork';
import {
  adaptNeuralEngineFromAudit,
  buildLockedAuditCardForDate,
  selectSuppliedFixturesForDate,
  computeDailyAuditSummary,
  createLockedAuditCardFromPredictions,
  getPreviousDateISO,
  simulateDeterministicSettlement,
} from './engine/auditEngine';
import { exportPredictionsToCSV } from './engine/csvParser';
import {
  commitAdaptedPicksBatchToFirestore,
  ensureUserWorkspace,
  signInWithGooglePopup,
  signOutUser,
  subscribeAuthState,
  subscribeWorkspaceAuditPicks,
  subscribeWorkspaceSettledMatches,
  syncAuditCardToFirestore,
  syncSinglePickSettlementToFirestore,
} from './firebase';
import { SidebarNav, WorkspaceSection } from './components/SidebarNav';
import { DailyBetsView } from './components/DailyBetsView';
import { DailyAuditView } from './components/DailyAuditView';
import { BetInspectorDrawer } from './components/BetInspectorDrawer';
import { NeuralLabView } from './components/NeuralLabView';
import { RulesArchitectureView } from './components/RulesArchitectureView';
import { IntelligenceMatrixView } from './components/IntelligenceMatrixView';
import { TrackedPortfolioView } from './components/TrackedPortfolioView';

const SECTION_LABELS: Record<WorkspaceSection, string> = {
  'daily-bets': 'Daily Top 10 Predictions',
  'daily-audit': "Yesterday's Accuracy Audit & Auto-Adapt",
  'neural-lab': 'CSV Neural Training Lab',
  'rules-matrix': '8-Rule Sport Dynamics',
  'intelligence-json': 'Competitor Intelligence Matrices',
  portfolio: 'Tracked Bet Slip',
};

function triggerCSVDownload(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TRAINING_STATE_STORAGE_KEY = 'octanet-training-state-v1';

interface PersistedTrainingState {
  version: 1;
  rows: HistoricalMatchRow[];
  hyperparams: NeuralHyperparameters;
  engine: TrainedNeuralEngine;
  savedAt: string;
}

function readPersistedTrainingState(): PersistedTrainingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TRAINING_STATE_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<PersistedTrainingState>;
    if (
      saved.version !== 1 || !Array.isArray(saved.rows) ||
      !saved.hyperparams || !saved.engine || !saved.engine.report ||
      !saved.engine.weights || saved.rows.length > 50000
    ) return null;
    return saved as PersistedTrainingState;
  } catch {
    return null;
  }
}

function canWriteTrainingState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(TRAINING_STATE_STORAGE_KEY);
    if (!raw) return true;
    const saved = JSON.parse(raw) as Partial<PersistedTrainingState>;
    return saved.version === 1 && Array.isArray(saved.rows) && Boolean(saved.hyperparams) &&
      Boolean(saved.engine?.report) && Boolean(saved.engine?.weights) && saved.rows.length <= 50000;
  } catch {
    return false;
  }
}

function formatCloudErrorMessage(raw: string): { text: string; upgradeUrl?: string } {
  if (raw.includes("Free daily read units per project (free tier database)")) {
    const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;
    return {
      text: 'Firestore daily free-tier read quota reached. Quota resets tomorrow, or you can upgrade your database plan.',
      upgradeUrl,
    };
  }
  if (raw.includes('Quota exceeded')) {
    return {
      text: 'Firestore daily quota exceeded. Quota resets tomorrow (see Firebase Spark Enterprise pricing limits).',
    };
  }
  return { text: raw };
}

export default function App() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('daily-bets');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Date & Active Sport Selection
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedSport, setSelectedSport] = useState<SportId | 'cross-sport'>(SportId.Soccer);

  // Initial Seed Corpus, Weights & Neural Engine
  const initialState = useMemo(() => {
    const weights = getDefaultSportWeights();
    const baseRows: HistoricalMatchRow[] = [];
    const untrained = createUntrainedNeuralEngine(DEFAULT_HYPERPARAMETERS);
    const yesterdayDate = getPreviousDateISO(new Date().toISOString().slice(0, 10));
    const yesterdayCard: DailyAuditEntry[] = [];
    return { weights, baseRows, trained: untrained, yesterdayDate, yesterdayCard };
  }, []);

  const [sportWeights, setSportWeights] = useState<SportRuleWeights>(initialState.weights);
  const savedTrainingState = useMemo(() => readPersistedTrainingState(), []);
  const persistenceAllowed = useMemo(() => canWriteTrainingState(), []);
  const [historicalRows, setHistoricalRows] = useState<HistoricalMatchRow[]>(
    savedTrainingState?.rows ?? initialState.baseRows
  );
  const [hyperparams, setHyperparams] = useState<NeuralHyperparameters>(
    savedTrainingState?.hyperparams ?? DEFAULT_HYPERPARAMETERS
  );
  const [engine, setEngine] = useState<TrainedNeuralEngine>(
    savedTrainingState?.engine ?? initialState.trained
  );

  // Daily Audit Cards & Adaptation State
  const [auditDate, setAuditDate] = useState<string>(initialState.yesterdayDate);
  const [auditCardsByDate, setAuditCardsByDate] = useState<
    Record<string, DailyAuditEntry[]>
  >(() => ({
    [initialState.yesterdayDate]: initialState.yesterdayCard,
  }));
  const [isFetchingLiveResults, setIsFetchingLiveResults] = useState(false);
  const [liveAuditMessage, setLiveAuditMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    sources?: { uri: string; title: string }[];
  } | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [lastAdaptationReport, setLastAdaptationReport] =
    useState<AdaptationDeltaReport | null>(null);

  // Firebase Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [cloudBannerError, setCloudBannerError] = useState<{
    text: string;
    upgradeUrl?: string;
  } | null>(null);
  const syncedCloudIdsRef = useRef<Set<string>>(new Set());

  // Live synced custom fixtures merged on top of deterministic daily fixtures
  const [customFixturesByDate, setCustomFixturesByDate] = useState<
    Record<string, DailyFixture[]>
  >({});
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [liveSyncMessage, setLiveSyncMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    sources?: { uri: string; title: string }[];
  } | null>(null);
  const [isCalibratingAI, setIsCalibratingAI] = useState(false);

  // Tracked Bets Slip & Active Inspector Drawer
  const [trackedMap, setTrackedMap] = useState<Record<string, PredictionResult>>({});
  const [inspectedPrediction, setInspectedPrediction] = useState<PredictionResult | null>(
    null
  );

  // Persist imported historical rows and explicitly trained weights across refreshes.
  // This versioned key has no generated/demo seed data and never silently reseeds a corpus.
  useEffect(() => {
    if (!persistenceAllowed) {
      setCloudBannerError({ text: 'Saved training state could not be safely read. It was not overwritten; export or recover your saved corpus before continuing.' });
      return;
    }
    try {
      window.localStorage.setItem(TRAINING_STATE_STORAGE_KEY, JSON.stringify({
        version: 1,
        rows: historicalRows,
        hyperparams,
        engine,
        savedAt: new Date().toISOString(),
      } satisfies PersistedTrainingState));
    } catch {
      setCloudBannerError({ text: 'Local persistence failed. Export your active CSV corpus before leaving this session.' });
    }
  }, [historicalRows, hyperparams, engine, persistenceAllowed]);

  // Subscribe to Firebase Auth & Firestore Workspace listeners when authenticated
  useEffect(() => {
    const unsubAuth = subscribeAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let unsubSettled: (() => void) | null = null;
    let unsubAudit: (() => void) | null = null;
    let cancelled = false;

    const bootCloudSync = async () => {
      try {
        await ensureUserWorkspace(currentUser.uid, {
          activeCorpusCount: historicalRows.length,
          neuralBlendAlpha: engine.hyperparams.neuralBlendAlpha,
          lastAuditDate: auditDate,
          lastValidationAccuracy: engine.report.hybridValAccuracy,
          lastBrierScore: engine.report.hybridValBrier,
        });
        if (cancelled) return;

        unsubSettled = subscribeWorkspaceSettledMatches(
          currentUser.uid,
          (cloudRows) => {
            if (cloudRows.length === 0) return;
            const freshRows = cloudRows.filter((r) => !syncedCloudIdsRef.current.has(r.id));
            if (freshRows.length === 0) return;
            for (const r of freshRows) syncedCloudIdsRef.current.add(r.id);

            setHistoricalRows((prev) => {
              const existingIds = new Set(prev.map((x) => x.id));
              const additions = freshRows.filter((r) => !existingIds.has(r.id));
              if (additions.length === 0) return prev;
              // Cloud arrivals update the corpus only. Training is always an explicit user action.
              return [...prev, ...additions];
            });
          },
          (msg) => setCloudBannerError(formatCloudErrorMessage(msg))
        );

        unsubAudit = subscribeWorkspaceAuditPicks(
          currentUser.uid,
          (cloudPicks) => {
            if (cloudPicks.length === 0) return;
            setAuditCardsByDate((prev) => {
              const next = { ...prev };
              const grouped: Record<string, DailyAuditEntry[]> = {};
              for (const p of cloudPicks) {
                if (!grouped[p.auditDate]) grouped[p.auditDate] = [];
                grouped[p.auditDate].push(p);
              }
              for (const [dt, list] of Object.entries(grouped)) {
                const existing = next[dt] ?? [];
                const byId = new Map(existing.map((e) => [e.id, e]));
                for (const item of list) {
                  const local = byId.get(item.id);
                  byId.set(item.id, {
                    ...(local ?? item),
                    ...item,
                    cautionFlags: local?.cautionFlags ?? item.cautionFlags,
                    kellyFractionPercent:
                      local?.kellyFractionPercent ?? item.kellyFractionPercent,
                  });
                }
                next[dt] = Array.from(byId.values());
              }
              return next;
            });
          },
          (msg) => setCloudBannerError(formatCloudErrorMessage(msg))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setCloudBannerError(formatCloudErrorMessage(msg));
      }
    };

    void bootCloudSync();

    return () => {
      cancelled = true;
      if (unsubSettled) unsubSettled();
      if (unsubAudit) unsubAudit();
    };
  }, [currentUser]);

  const dailyFixtures = useMemo(
    () => selectSuppliedFixturesForDate(selectedDate, customFixturesByDate[selectedDate] ?? []),
    [selectedDate, customFixturesByDate]
  );

  const predictionsBySport = useMemo(() => {
    const map = {} as Record<SportId, PredictionResult[]>;
    for (const s of ALL_SPORTS) {
      map[s] = engine.report.epochHistory.length >= 1 && engine.report.totalRows === historicalRows.length && historicalRows.length >= 8
        ? rankTop10BetsForSport(dailyFixtures, s, engine, sportWeights, 10)
        : [];
    }
    return map;
  }, [dailyFixtures, engine, historicalRows.length, sportWeights]);

  const crossSportTop10 = useMemo(
    () => engine.report.epochHistory.length >= 1 && engine.report.totalRows === historicalRows.length && historicalRows.length >= 8
      ? rankCrossSportTop10(dailyFixtures, engine, sportWeights, 10)
      : [],
    [dailyFixtures, engine, historicalRows.length, sportWeights]
  );

  // Active Audit Card & Summary
  const activeAuditEntries = useMemo(
    () => auditCardsByDate[auditDate] ?? [],
    [auditCardsByDate, auditDate]
  );
  const activeAuditSummary = useMemo(
    () => computeDailyAuditSummary(activeAuditEntries),
    [activeAuditEntries]
  );
  const availableAuditDates = useMemo(() => {
    const set = new Set<string>(Object.keys(auditCardsByDate));
    set.add(getPreviousDateISO(selectedDate));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [auditCardsByDate, selectedDate]);

  const handleSelectAuditDate = (nextAuditDate: string) => {
    setAuditDate(nextAuditDate);
    setLiveAuditMessage(null);
    setAuditCardsByDate((prev) => {
      if (prev[nextAuditDate]) return prev;
      const autoSettle = false; // Historical dates must be settled from verified results, never simulated outcomes.
      return {
        ...prev,
        [nextAuditDate]: buildLockedAuditCardForDate(
          nextAuditDate,
          engine,
          sportWeights,
          customFixturesByDate[nextAuditDate] ?? [],
          autoSettle
        ),
      };
    });
  };

  const handleChangeSelectedDate = (nextDate: string) => {
    setSelectedDate(nextDate);
    const prevDay = getPreviousDateISO(nextDate);
    setAuditCardsByDate((prev) => {
      if (prev[prevDay]) return prev;
      return {
        ...prev,
        [prevDay]: buildLockedAuditCardForDate(
          prevDay,
          engine,
          sportWeights,
          customFixturesByDate[prevDay] ?? [],
          false
        ),
      };
    });
  };

  const handleLockCurrentDateForAudit = async () => {
    if (auditCardsByDate[selectedDate]) {
      setAuditDate(selectedDate);
      setActiveSection('daily-audit');
      return;
    }
    const locked = createLockedAuditCardFromPredictions(
      selectedDate,
      predictionsBySport,
      false
    );
    setAuditCardsByDate((prev) => ({
      ...prev,
      [selectedDate]: locked,
    }));
    setAuditDate(selectedDate);
    setActiveSection('daily-audit');

    if (currentUser) {
      try {
        await syncAuditCardToFirestore(currentUser.uid, locked);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setCloudBannerError(formatCloudErrorMessage(msg));
      }
    }
  };

  const handleSettleSinglePick = async (
    id: string,
    outcome: -1 | 0 | 1,
    scoreSummary = ''
  ) => {
    let targetUpdated: DailyAuditEntry | null = null;
    setAuditCardsByDate((prev) => {
      const list = prev[auditDate] ?? [];
      const updated = list.map((item) => {
        if (item.id !== id || item.settlementStatus === 'adapted') return item;
        const nextItem: DailyAuditEntry = {
          ...item,
          settlementStatus: outcome === -1 ? 'pending' : 'settled',
          actualOutcome: outcome,
          scoreSummary: outcome === -1 ? '' : scoreSummary,
        };
        targetUpdated = nextItem;
        return nextItem;
      });
      return { ...prev, [auditDate]: updated };
    });

    if (currentUser && targetUpdated) {
      try {
        await syncSinglePickSettlementToFirestore(currentUser.uid, targetUpdated);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setCloudBannerError(formatCloudErrorMessage(msg));
      }
    }
  };

  const handleSimulateSettlement = async () => {
    const current = auditCardsByDate[auditDate] ?? [];
    const settled = simulateDeterministicSettlement(current);
    setAuditCardsByDate((prev) => ({
      ...prev,
      [auditDate]: settled,
    }));
    setLiveAuditMessage({
      type: 'success',
      text: `Simulated outcomes were labelled as synthetic and excluded from verified performance metrics and model adaptation.`,
    });

    if (currentUser) {
      try {
        const nonAdapted = settled.filter((e) => e.settlementStatus !== 'adapted');
        if (nonAdapted.length > 0) {
          await syncAuditCardToFirestore(currentUser.uid, nonAdapted);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setCloudBannerError(formatCloudErrorMessage(msg));
      }
    }
  };

  const handleFetchLiveResults = async (sportFilter: SportId | 'all') => {
    const list = auditCardsByDate[auditDate] ?? [];
    const candidates = list
      .filter(
        (e) =>
          e.settlementStatus !== 'adapted' &&
          (sportFilter === 'all' || e.sport === sportFilter)
      )
      .slice(0, 12);

    if (candidates.length === 0) {
      setLiveAuditMessage({
        type: 'error',
        text: 'All picks in this filter are already adapted into the neural corpus.',
      });
      return;
    }

    setIsFetchingLiveResults(true);
    setLiveAuditMessage(null);
    try {
      const resp = await fetch('/api/ai/audit-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: auditDate,
          sport: sportFilter === 'all' ? 'multi-sport' : SPORT_LABELS[sportFilter],
          picks: candidates.map((c) => ({
            id: c.id,
            selection: c.selection,
            opponent: c.opponent,
            competition: c.competition,
            market: c.market,
          })),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to verify live final scores.');
      }

      const settlements: {
        id: string;
        status: string;
        actualOutcome: number;
        scoreSummary: string;
      }[] = Array.isArray(data.settlements) ? data.settlements : [];
      const mapById = new Map(settlements.map((s) => [s.id, s]));

      let settledCountDelta = 0;
      const updatedForCloud: DailyAuditEntry[] = [];

      setAuditCardsByDate((prev) => {
        const current = prev[auditDate] ?? [];
        const next = current.map((entry) => {
          const found = mapById.get(entry.id);
          if (!found || entry.settlementStatus === 'adapted') return entry;
          const isSettled =
            found.status === 'settled' &&
            (found.actualOutcome === 0 || found.actualOutcome === 1);
          if (isSettled) settledCountDelta += 1;
          const nextEntry: DailyAuditEntry = {
            ...entry,
            settlementStatus: isSettled ? 'settled' : 'pending',
            actualOutcome: isSettled ? (found.actualOutcome as 0 | 1) : -1,
            scoreSummary: `AI-UNVERIFIED: ${String(found.scoreSummary || '').slice(0, 140)}`, 
          };
          updatedForCloud.push(nextEntry);
          return nextEntry;
        });
        return { ...prev, [auditDate]: next };
      });

      setLiveAuditMessage({
        type: 'success',
        text: `AI search graded ${candidates.length} matchups (${settledCountDelta} candidate outcomes). Grades remain unverified until manually checked against an official source.`,
        sources: data.sources,
      });

      if (currentUser && updatedForCloud.length > 0) {
        await syncAuditCardToFirestore(currentUser.uid, updatedForCloud);
      }
    } catch (err) {
      setLiveAuditMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Unable to fetch live final scores from web search.',
      });
    } finally {
      setIsFetchingLiveResults(false);
    }
  };

  const handleAdaptNeuralNetwork = async () => {
    const entries = auditCardsByDate[auditDate] ?? [];
    setIsAdapting(true);
    setLiveAuditMessage(null);
    try {
      const result = adaptNeuralEngineFromAudit(
        auditDate,
        entries,
        historicalRows,
        hyperparams,
        sportWeights,
        engine
      );

      for (const item of result.newlySettledEntries) {
        syncedCloudIdsRef.current.add(item.id);
      }

      setHistoricalRows(result.nextCorpus);
      setHyperparams(result.nextHyperparams);
      setEngine(result.nextEngine);
      setAuditCardsByDate((prev) => ({
        ...prev,
        [auditDate]: result.updatedEntries,
      }));
      setLastAdaptationReport(result.deltaReport);

      if (currentUser) {
        await commitAdaptedPicksBatchToFirestore(
          currentUser.uid,
          result.newlySettledEntries,
          {
            activeCorpusCount: result.nextCorpus.length,
            neuralBlendAlpha: result.nextHyperparams.neuralBlendAlpha,
            lastAuditDate: auditDate,
            lastValidationAccuracy: result.nextEngine.report.hybridValAccuracy,
            lastBrierScore: result.nextEngine.report.hybridValBrier,
          }
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLiveAuditMessage({ type: 'error', text: msg });
    } finally {
      setIsAdapting(false);
    }
  };

  const handleGoogleAuthToggle = async () => {
    setIsAuthBusy(true);
    setCloudBannerError(null);
    try {
      if (currentUser) {
        await signOutUser();
      } else {
        await signInWithGooglePopup();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled.';
      setCloudBannerError(formatCloudErrorMessage(msg));
    } finally {
      setIsAuthBusy(false);
    }
  };

  const trackedIds = useMemo(() => new Set(Object.keys(trackedMap)), [trackedMap]);
  const trackedList = useMemo(() => Object.values(trackedMap), [trackedMap]);

  const handleToggleTrack = (pred: PredictionResult) => {
    setTrackedMap((prev) => {
      const next = { ...prev };
      if (next[pred.fixture.id]) {
        delete next[pred.fixture.id];
      } else {
        next[pred.fixture.id] = pred;
      }
      return next;
    });
  };

  const handleLoadRows = (rows: HistoricalMatchRow[]) => {
    setHistoricalRows(rows);
    // Imported rows are not trained until the user explicitly starts training.
    setEngine(createUntrainedNeuralEngine(hyperparams));
  };

  const handleTrainWithRows = (
    rows: HistoricalMatchRow[],
    nextParams: NeuralHyperparameters
  ) => {
    if (rows.length < 8) {
      setLiveAuditMessage({ type: 'error', text: 'Training blocked: import at least 8 valid historical rows first.' });
      return;
    }
    const nextEngine = trainNeuralNetworkOnCSV(
      rows,
      nextParams,
      sportWeights
    );
    setHistoricalRows(rows);
    setHyperparams(nextParams);
    setEngine(nextEngine);
  };

  const handleUpdateSportWeights = (
    sport: SportId,
    nextWeights: Record<RuleKey, number>
  ) => {
    setSportWeights((prev) => ({
      ...prev,
      [sport]: nextWeights,
    }));
  };

  const handleResetAllWeights = () => {
    setSportWeights(getDefaultSportWeights());
  };

  const handleImportIntelligenceMatrix = (nextPayload: IntelligenceMatrixPayload) => {
    setEngine((prev) => ({
      ...prev,
      intelligencePayload: nextPayload,
    }));
  };

  const handleLiveSyncSport = async (sport: SportId, date: string) => {
    setIsSyncingLive(true);
    setLiveSyncMessage(null);
    try {
      const resp = await fetch('/api/ai/sync-fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport: SPORT_LABELS[sport], date }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to sync live schedule.');
      }
      const rawItems: unknown[] = Array.isArray(data.fixtures) ? data.fixtures : [];
      const ruleKeys: RuleKey[] = [
        'r1_motivation_stakes', 'r2_form_momentum', 'r3_h2h_standings_gap', 'r4_tier_classification',
        'r5_derby_rivalry', 'r6_squad_value_vs_form', 'r7_continental_fatigue', 'r8_coach_volatility',
      ];
      const validItems = rawItems.filter((candidate): candidate is Record<string, unknown> => {
        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return false;
        const item = candidate as Record<string, unknown>;
        const requiredStrings = ['kickoffTime', 'competition', 'venueOrSurface', 'selection', 'opponent', 'market', 'sportContextStat'];
        if (requiredStrings.some((key) => typeof item[key] !== 'string' || !(item[key] as string).trim())) return false;
        if (typeof item.isHomeOrFavoredContext !== 'boolean') return false;
        if (typeof item.decimalOdds !== 'number' || !Number.isFinite(item.decimalOdds) || item.decimalOdds < 1.01 || item.decimalOdds > 100) return false;
        return ruleKeys.every((key) => typeof item[key] === 'number' && Number.isFinite(item[key]) && Number(item[key]) >= 0 && Number(item[key]) <= 10);
      });
      if (validItems.length === 0) {
        throw new Error('No complete fixture candidates were returned. Missing or invalid fields are not replaced with invented defaults.');
      }
      const mapped: DailyFixture[] = validItems.map((item, idx) => {
          const selection = String(item.selection);
          const opponent = String(item.opponent);
          return {
            id: `live-${date}-${sport}-${Date.now()}-${idx}`,
            date,
            kickoffTime: String(item.kickoffTime),
            sport,
            competition: String(item.competition),
            venueOrSurface: String(item.venueOrSurface),
            selection,
            opponent,
            matchupLabel: `${selection} vs ${opponent}`,
            market: String(item.market),
            decimalOdds: Number(item.decimalOdds),
            isHomeOrFavoredContext: item.isHomeOrFavoredContext as boolean,
            sportContextStat: String(item.sportContextStat),
            rules: {
              r1_motivation_stakes: Number(item.r1_motivation_stakes),
              r2_form_momentum: Number(item.r2_form_momentum),
              r3_h2h_standings_gap: Number(item.r3_h2h_standings_gap),
              r4_tier_classification: Number(item.r4_tier_classification),
              r5_derby_rivalry: Number(item.r5_derby_rivalry),
              r6_squad_value_vs_form: Number(item.r6_squad_value_vs_form),
              r7_continental_fatigue: Number(item.r7_continental_fatigue),
              r8_coach_volatility: Number(item.r8_coach_volatility),
            },
          };
        }
      );

      setCustomFixturesByDate((prev) => ({
        ...prev,
        [date]: [...(prev[date] ?? []).filter((fixture) => fixture.sport !== sport), ...mapped],
      }));
      setLiveSyncMessage({
        type: 'success',
        text: `Loaded ${mapped.length} AI-search-grounded ${SPORT_LABELS[sport]} candidates for ${date}. These are not independently verified fixtures or bookmaker odds.`,
        sources: data.sources,
      });
    } catch (err) {
      setLiveSyncMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to fetch live fixtures.',
      });
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleRecalibrateNotesAI = async () => {
    if (engine.report.epochHistory.length === 0 || engine.report.totalRows !== historicalRows.length || historicalRows.length < 8) {
      throw new Error('AI model notes are unavailable until the active historical corpus has been explicitly trained.');
    }
    setIsCalibratingAI(true);
    try {
      const sampleTeams = Object.entries(engine.intelligencePayload.team_intelligence_matrices)
        .slice(0, 4)
        .map(([name, val]) => ({ name, ...val }));
      const resp = await fetch('/api/ai/calibrate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelEngine: engine.intelligencePayload.model_engine,
          accuracy: engine.report.hybridValAccuracy,
          brier: engine.report.hybridValBrier,
          topFeatures: engine.report.learnedFeatureImportance,
          sampleTeams,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to synthesize notes.');
      }
      if (data.meta_improvement_notes) {
        setEngine((prev) => ({
          ...prev,
          intelligencePayload: {
            ...prev.intelligencePayload,
            sync_timestamp: new Date().toISOString(),
            meta_improvement_notes: data.meta_improvement_notes,
          },
        }));
      }
    } finally {
      setIsCalibratingAI(false);
    }
  };

  const handleExportAll60CSV = () => {
    const all60 = ALL_SPORTS.flatMap((s) => predictionsBySport[s]);
    const csv = exportPredictionsToCSV(all60);
    triggerCSVDownload(csv, `octanet-all-60-best-bets-${selectedDate}.csv`);
  };

  const syncedInspectedPrediction = useMemo(() => {
    if (!inspectedPrediction) return null;
    const sportList = predictionsBySport[inspectedPrediction.fixture.sport] ?? [];
    return (
      sportList.find((p) => p.fixture.id === inspectedPrediction.fixture.id) ??
      crossSportTop10.find((p) => p.fixture.id === inspectedPrediction.fixture.id) ??
      inspectedPrediction
    );
  }, [inspectedPrediction, predictionsBySport, crossSportTop10]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <SidebarNav
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setLiveSyncMessage(null);
          setLiveAuditMessage(null);
        }}
        trackedCount={trackedList.length}
        readyAuditCount={activeAuditSummary.readyToAdaptCount}
        trainedRowsCount={historicalRows.length}
        hybridAccuracy={engine.report.epochHistory.length > 0 && engine.report.totalRows === historicalRows.length && historicalRows.length >= 8 ? engine.report.hybridValAccuracy : null}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* SaaS Top Bar Contract: Breadcrumb on left, Cloud Sync + 1 primary CTA on right */}
        <header className="h-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs sm:text-sm font-medium text-slate-500 truncate">
              <span>OctaNet</span>
              <span className="mx-2 text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="text-slate-900 font-semibold">
                {SECTION_LABELS[activeSection]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleGoogleAuthToggle}
              disabled={isAuthBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {currentUser ? (
                <>
                  <LogOut className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Cloud Synced · Sign Out</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isAuthBusy ? 'Signing In...' : 'Sign In for Cloud DB'}</span>
                </>
              )}
            </button>

            {activeSection !== 'daily-audit' ? (
              <button
                type="button"
                onClick={() => setActiveSection('daily-audit')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                Audit T-1 &amp; Adapt ({activeAuditSummary.readyToAdaptCount})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveSection('daily-bets')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                View Daily Top 10 Bets
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1360px] w-full mx-auto space-y-4">
          <div role="note" className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs leading-5 text-amber-900">
            <strong>Model status:</strong> UNTRAINED until you explicitly train on imported historical results. OctaNet starts with an empty corpus and never generates demo fixtures or synthetic training rows. Uploaded CSV contents are user-supplied and are not independently verified by the app. AI-search fixture candidates and estimated odds are also unverified. Simulated outcomes are excluded from learning.
          </div>
          {cloudBannerError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-center justify-between gap-4"
            >
              <div>
                <span>{cloudBannerError.text}</span>
                {cloudBannerError.upgradeUrl && (
                  <>
                    {' '}
                    <a
                      href={cloudBannerError.upgradeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold"
                    >
                      Open Firestore Database Upgrade
                    </a>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCloudBannerError(null)}
                className="text-amber-800 hover:text-amber-950 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeSection === 'daily-bets' && (
            <DailyBetsView
              selectedDate={selectedDate}
              onChangeDate={handleChangeSelectedDate}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              predictionsBySport={predictionsBySport}
              crossSportTop10={crossSportTop10}
              trackedIds={trackedIds}
              onToggleTrack={handleToggleTrack}
              onInspectPrediction={setInspectedPrediction}
              onExportCurrentCSV={(preds, label) =>
                triggerCSVDownload(exportPredictionsToCSV(preds), `${label}.csv`)
              }
              onExportAll60CSV={handleExportAll60CSV}
              onLockDailyCardForAudit={handleLockCurrentDateForAudit}
              isCurrentDateLocked={Boolean(auditCardsByDate[selectedDate])}
              onLiveSyncSport={handleLiveSyncSport}
              isSyncingLive={isSyncingLive}
              liveSyncMessage={liveSyncMessage}
              neuralBlendAlpha={engine.hyperparams.neuralBlendAlpha}
            />
          )}

          {activeSection === 'daily-audit' && (
            <DailyAuditView
              auditDate={auditDate}
              availableAuditDates={availableAuditDates}
              onSelectAuditDate={handleSelectAuditDate}
              entries={activeAuditEntries}
              summary={activeAuditSummary}
              onSettleSinglePick={handleSettleSinglePick}
              onSimulateSettlement={handleSimulateSettlement}
              onFetchLiveResults={handleFetchLiveResults}
              isFetchingLiveResults={isFetchingLiveResults}
              liveAuditMessage={liveAuditMessage}
              onAdaptNeuralNetwork={handleAdaptNeuralNetwork}
              isAdapting={isAdapting}
              lastAdaptationReport={lastAdaptationReport}
              isCloudSynced={Boolean(currentUser)}
            />
          )}

          {activeSection === 'neural-lab' && (
            <NeuralLabView
              historicalRows={historicalRows}
              engine={engine}
              hyperparams={hyperparams}
              sportWeights={sportWeights}
              onUpdateHyperparams={setHyperparams}
              onLoadRows={handleLoadRows}
              onTrainWithRows={handleTrainWithRows}
            />
          )}

          {activeSection === 'rules-matrix' && (
            <RulesArchitectureView
              sportWeights={sportWeights}
              learnedGlobalImportance={engine.report.learnedFeatureImportance}
              onUpdateSportWeights={handleUpdateSportWeights}
              onResetAllWeights={handleResetAllWeights}
            />
          )}

          {activeSection === 'intelligence-json' && (
            <IntelligenceMatrixView
              payload={engine.intelligencePayload}
              onImportPayload={handleImportIntelligenceMatrix}
              onRecalibrateNotesAI={handleRecalibrateNotesAI}
              isCalibratingAI={isCalibratingAI}
            />
          )}

          {activeSection === 'portfolio' && (
            <TrackedPortfolioView
              trackedBets={trackedList}
              onRemoveBet={(id) =>
                setTrackedMap((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                })
              }
              onClearAll={() => setTrackedMap({})}
              onExportSlipCSV={() =>
                triggerCSVDownload(
                  exportPredictionsToCSV(trackedList),
                  `octanet-tracked-slip-${selectedDate}.csv`
                )
              }
              onNavigateToDaily={() => setActiveSection('daily-bets')}
            />
          )}
        </main>
      </div>

      <BetInspectorDrawer
        prediction={syncedInspectedPrediction}
        onClose={() => setInspectedPrediction(null)}
        isTracked={
          syncedInspectedPrediction
            ? trackedIds.has(syncedInspectedPrediction.fixture.id)
            : false
        }
        onToggleTrack={handleToggleTrack}
      />
    </div>
  );
}
