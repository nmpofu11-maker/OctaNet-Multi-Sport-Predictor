import React, { useMemo, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  AdaptationDeltaReport,
  ALL_SPORTS,
  DailyAuditEntry,
  DailyAuditSummary,
  SPORT_LABELS,
  SportId,
} from '../types/sports';

interface DailyAuditViewProps {
  auditDate: string;
  availableAuditDates: string[];
  onSelectAuditDate: (date: string) => void;
  entries: DailyAuditEntry[];
  summary: DailyAuditSummary;
  onSettleSinglePick: (id: string, outcome: -1 | 0 | 1, scoreSummary?: string) => void;
  onSimulateSettlement: () => void;
  onFetchLiveResults: (sportFilter: SportId | 'all') => Promise<void>;
  isFetchingLiveResults: boolean;
  liveAuditMessage: {
    type: 'success' | 'error';
    text: string;
    sources?: { uri: string; title: string }[];
  } | null;
  onAdaptNeuralNetwork: () => Promise<void>;
  isAdapting: boolean;
  lastAdaptationReport: AdaptationDeltaReport | null;
  isCloudSynced: boolean;
}

export const DailyAuditView: React.FC<DailyAuditViewProps> = ({
  auditDate,
  availableAuditDates,
  onSelectAuditDate,
  entries,
  summary,
  onSettleSinglePick,
  onSimulateSettlement,
  onFetchLiveResults,
  isFetchingLiveResults,
  liveAuditMessage,
  onAdaptNeuralNetwork,
  isAdapting,
  lastAdaptationReport,
  isCloudSynced,
}) => {
  const [sportFilter, setSportFilter] = useState<SportId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (sportFilter !== 'all' && e.sport !== sportFilter) return false;
      if (statusFilter === 'won' && e.actualOutcome !== 1) return false;
      if (statusFilter === 'lost' && e.actualOutcome !== 0) return false;
      if (statusFilter === 'pending' && e.settlementStatus !== 'pending') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.selection.toLowerCase().includes(q) ||
        e.opponent.toLowerCase().includes(q) ||
        e.competition.toLowerCase().includes(q) ||
        e.scoreSummary.toLowerCase().includes(q)
      );
    });
  }, [entries, sportFilter, statusFilter, searchQuery]);

  const brierLeader = useMemo(() => {
    if (summary.settledCount === 0) return 'Awaiting settlement';
    if (summary.neuralBrier + 0.002 < summary.ruleBrier) {
      return 'Neural MLP more calibrated than 8-Rule';
    }
    if (summary.ruleBrier + 0.002 < summary.neuralBrier) {
      return '8-Rule Prior more calibrated than MLP';
    }
    return '8-Rule & Neural MLP equally calibrated';
  }, [summary]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Adaptation Action */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Yesterday&apos;s Accuracy Audit &amp; Neural Adaptation
            </h1>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              Grade prior-day locked Top 10 predictions across all 6 sports, diagnose 8-rule variance traps, and append settled outcomes into your CSV neural corpus with recency-weighted backpropagation.
              {isCloudSynced
                ? ' · Cloud Firestore persistence active.'
                : ' · Local session active (sign in above to persist in Firestore).'}
            </p>
          </div>

          <button
            type="button"
            onClick={onAdaptNeuralNetwork}
            disabled={isAdapting || summary.readyToAdaptCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 transition-colors whitespace-nowrap shrink-0"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            {isAdapting
              ? 'Adapting Neural Weights...'
              : summary.readyToAdaptCount > 0
                ? `Append ${summary.readyToAdaptCount} Settled & Adapt Neural Engine`
                : summary.adaptedCount > 0
                  ? 'All Settled Picks Adapted'
                  : 'Settle Picks to Adapt'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <label
              htmlFor="audit-date-select"
              className="text-xs font-medium text-slate-600 whitespace-nowrap"
            >
              Audit Card Date:
            </label>
            <select
              id="audit-date-select"
              value={auditDate}
              onChange={(e) => onSelectAuditDate(e.target.value)}
              className="text-xs font-mono tabular-nums font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-2 focus:outline-blue-600"
            >
              {availableAuditDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="hidden sm:inline text-xs text-slate-500">
              · {entries.length} locked multi-sport picks
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onFetchLiveResults(sportFilter)}
              disabled={isFetchingLiveResults || entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetchingLiveResults ? 'animate-spin' : ''}`}
              />
              {isFetchingLiveResults
                ? 'Verifying Final Scores...'
                : sportFilter === 'all'
                  ? 'Fetch Live Final Scores'
                  : `Fetch Live ${SPORT_LABELS[sportFilter]} Scores`}
            </button>

            <button
              type="button"
              onClick={onSimulateSettlement}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              Auto-Grade Pending Picks
            </button>
          </div>
        </div>
      </div>

      {/* Live Web Result Verification Feedback */}
      {liveAuditMessage && (
        <div
          role="status"
          className={`p-3.5 rounded-lg border text-xs ${
            liveAuditMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="font-medium">{liveAuditMessage.text}</div>
          {liveAuditMessage.sources && liveAuditMessage.sources.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
              <span>Verified scoreboard sources:</span>
              {liveAuditMessage.sources.slice(0, 4).map((src, i) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-slate-900 truncate max-w-[240px]"
                >
                  {src.title || src.uri}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Last Neural Adaptation Delta Report */}
      {lastAdaptationReport && (
        <div
          role="region"
          aria-label="Latest neural adaptation summary"
          className="bg-white border border-blue-200 rounded-xl p-5 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900">
                Neural Engine Adapted from {lastAdaptationReport.auditDate} Settlement Audit
              </h2>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500">
              Corpus: {lastAdaptationReport.totalCorpusBefore} → {lastAdaptationReport.totalCorpusAfter} matches (+{lastAdaptationReport.newlyIngestedRows} new)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <div className="text-slate-500">Dynamic Ensemble Blend (α)</div>
              <div className="mt-0.5 font-mono tabular-nums font-semibold text-slate-900">
                {Math.round(lastAdaptationReport.prevAlpha * 100)}% MLP → {Math.round(lastAdaptationReport.nextAlpha * 100)}% MLP
              </div>
              <div className="text-slate-500 mt-0.5">
                Audit Brier: MLP {lastAdaptationReport.neuralBrierOnAudit.toFixed(4)} vs Rule {lastAdaptationReport.ruleBrierOnAudit.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Holdout Validation Accuracy &amp; Brier</div>
              <div className="mt-0.5 font-mono tabular-nums font-semibold text-emerald-700">
                {(lastAdaptationReport.prevValAccuracy * 100).toFixed(1)}% → {(lastAdaptationReport.nextValAccuracy * 100).toFixed(1)}%
              </div>
              <div className="text-slate-500 mt-0.5 font-mono tabular-nums">
                Brier {lastAdaptationReport.prevValBrier.toFixed(4)} → {lastAdaptationReport.nextValBrier.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Recalibrated Team Intelligence Matrices</div>
              <div className="mt-0.5 text-slate-800 leading-relaxed">
                {lastAdaptationReport.shiftedCompetitors.length > 0
                  ? lastAdaptationReport.shiftedCompetitors
                      .slice(0, 3)
                      .map(
                        (c) =>
                          `${c.name} (vol ${c.prevVolatility.toFixed(2)}→${c.nextVolatility.toFixed(2)})`
                      )
                      .join(' · ')
                  : 'All active team coefficients updated'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Column Audit KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4">
          <div className="text-xs text-slate-500">Audited Hit Rate ({auditDate})</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary.settledCount > 0 ? `${(summary.hitRate * 100).toFixed(1)}%` : '—'}
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            {summary.wonCount}W · {summary.lostCount}L · {summary.pendingCount} Pending
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500">Realized Flat-Stake Yield</div>
          <div
            className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
              summary.flatUnitsPL >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {summary.settledCount > 0
              ? `${summary.flatUnitsPL >= 0 ? '+' : ''}${summary.flatUnitsPL.toFixed(2)}u`
              : '0.00u'}
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            ROI {summary.flatRoiPercent >= 0 ? '+' : ''}
            {summary.flatRoiPercent.toFixed(1)}% · Kelly {summary.kellyUnitsPL >= 0 ? '+' : ''}
            {summary.kellyUnitsPL.toFixed(1)}%
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500">Hybrid Brier Calibration Error</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-blue-700">
            {summary.settledCount > 0 ? summary.hybridBrier.toFixed(4) : '—'}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 truncate" title={brierLeader}>
            Rule {summary.ruleBrier.toFixed(3)} · MLP {summary.neuralBrier.toFixed(3)}
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500">Adaptation Queue Status</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary.readyToAdaptCount} Ready
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            {summary.adaptedCount} of {summary.totalLocked} locked into corpus
          </div>
        </div>
      </div>

      {/* Diagnostic Grid: Sport-by-Sport Accuracy & Calibration vs Rule Failure Post-Mortem */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sport Breakdown & Probability Calibration Honesty */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Sport-by-Sport Audit &amp; Calibration Honesty
            </h2>
            <span className="text-xs text-slate-500">{brierLeader}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-medium">Sport</th>
                  <th className="py-2 px-3 font-medium text-right">Record</th>
                  <th className="py-2 px-3 font-medium text-right">Hit Rate</th>
                  <th className="py-2 px-3 font-medium text-right">Flat P/L</th>
                  <th className="py-2 pl-3 font-medium text-right">Brier Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_SPORTS.map((s) => {
                  const m = summary.bySport[s];
                  return (
                    <tr key={s} className="hover:bg-slate-50/70">
                      <td className="py-2 pr-3 font-medium text-slate-900">{SPORT_LABELS[s]}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                        {m.won}W-{m.lost}L
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {m.settled > 0 ? `${(m.hitRate * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono tabular-nums font-semibold ${
                          m.flatUnitsPL >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {m.settled > 0
                          ? `${m.flatUnitsPL >= 0 ? '+' : ''}${m.flatUnitsPL.toFixed(2)}u`
                          : '—'}
                      </td>
                      <td className="py-2 pl-3 text-right font-mono tabular-nums text-slate-600">
                        {m.settled > 0 ? m.hybridBrier.toFixed(4) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Probability Calibration Buckets (Predicted vs Realized Win Rate)
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                8-Rule {(summary.ruleHitRate * 100).toFixed(0)}% · MLP {(summary.neuralHitRate * 100).toFixed(0)}% · Hybrid {(summary.hybridHitRate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {summary.calibrationBuckets.map((b) => (
                <div key={b.label} className="text-xs space-y-1">
                  <div className="text-slate-500 truncate">{b.label}</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-900">
                    {b.count > 0
                      ? `${(b.avgPredictedProb * 100).toFixed(0)}% pred → ${(b.realizedHitRate * 100).toFixed(0)}% actual`
                      : 'No picks in range'}
                  </div>
                  {b.count > 0 && (
                    <div className="text-slate-500 font-mono tabular-nums">
                      {b.count} picks · Gap {b.calibrationGap >= 0 ? '+' : ''}
                      {(b.calibrationGap * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rule-Level Upset Post-Mortem Diagnostics */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                8-Rule Upset Post-Mortem Diagnostics
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Identifies which rule vulnerabilities appeared across yesterday&apos;s losing selections so backpropagation tightens those weights.
              </p>
            </div>

            {summary.ruleDiagnostics.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Settle pending predictions to inspect rule-level loss diagnostics.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {summary.ruleDiagnostics.map((diag) => (
                  <div key={diag.ruleKey} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900">{diag.title}</span>
                      <span className="font-mono tabular-nums font-semibold text-rose-700 shrink-0">
                        {diag.lossCount} {diag.lossCount === 1 ? 'loss' : 'losses'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{diag.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
            Adaptation Safeguard: Newly settled rows use 2x recency replay alongside your full historical CSV corpus so one volatile day refines team volatility indices without overwriting core multi-sport rules.
          </div>
        </div>
      </div>

      {/* Filter Bar & 60-Pick Settlement Ledger */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sport Filter Tabs */}
          <div
            className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto"
            role="tablist"
            aria-label="Filter audit picks by sport"
          >
            <button
              type="button"
              role="tab"
              aria-selected={sportFilter === 'all'}
              onClick={() => setSportFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                sportFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sports ({entries.length})
            </button>
            {ALL_SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={sportFilter === s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  sportFilter === s
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {SPORT_LABELS[s]} ({summary.bySport[s]?.total ?? 0})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <label htmlFor="audit-search-input" className="sr-only">
                Search audited picks
              </label>
              <input
                id="audit-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, league, or score..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600 w-56"
              />
            </div>

            <div
              className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
              role="group"
              aria-label="Filter picks by settlement status"
            >
              {(['all', 'won', 'lost', 'pending'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  aria-label={`Filter ${st} picks`}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all'
                    ? 'All'
                    : st === 'won'
                      ? 'Won'
                      : st === 'lost'
                        ? 'Lost'
                        : 'Pending'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No audited predictions match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                    <th className="py-2.5 px-4 font-medium">Matchup &amp; Sport</th>
                    <th className="py-2.5 px-3 font-medium">Locked Pick</th>
                    <th className="py-2.5 px-3 font-medium text-right">Odds</th>
                    <th className="py-2.5 px-3 font-medium text-right">8-Rule</th>
                    <th className="py-2.5 px-3 font-medium text-right">Neural</th>
                    <th className="py-2.5 px-3 font-medium text-right">Hybrid</th>
                    <th className="py-2.5 px-3 font-medium">Final Score &amp; Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Grade Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map((entry) => {
                    const isAdapted = entry.settlementStatus === 'adapted';
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {entry.selection} vs {entry.opponent}
                          </div>
                          <div className="mt-0.5 text-slate-500">
                            {SPORT_LABELS[entry.sport]} · {entry.competition}
                            {entry.cautionFlags.length > 0
                              ? ` · ${entry.cautionFlags[0]}`
                              : ''}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{entry.selection}</div>
                          <div className="text-slate-500">{entry.market}</div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {entry.decimalOdds.toFixed(2)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                          {(entry.ruleProbability * 100).toFixed(1)}%
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-blue-700">
                          {(entry.neuralProbability * 100).toFixed(1)}%
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {(entry.hybridProbability * 100).toFixed(1)}%
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {entry.actualOutcome === 1 ? (
                              <span className="font-semibold text-emerald-700">Won</span>
                            ) : entry.actualOutcome === 0 ? (
                              <span className="font-semibold text-rose-700">Lost</span>
                            ) : (
                              <span className="text-slate-500">Pending</span>
                            )}
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="font-mono tabular-nums text-slate-700">
                              {entry.scoreSummary || 'Awaiting score'}
                            </span>
                            {isAdapted && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">
                                  ·
                                </span>
                                <span className="text-blue-700 font-medium">Adapted</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isAdapted ? (
                            <span className="text-slate-400 font-medium whitespace-nowrap">
                              Locked in Corpus
                            </span>
                          ) : (
                            <div
                              className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-md"
                              role="group"
                              aria-label={`Settle ${entry.selection} vs ${entry.opponent}`}
                            >
                              <button
                                type="button"
                                aria-label={`Grade ${entry.selection} Won`}
                                onClick={() =>
                                  onSettleSinglePick(
                                    entry.id,
                                    1,
                                    entry.scoreSummary || 'Verified Win'
                                  )
                                }
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                                  entry.actualOutcome === 1
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Won
                              </button>
                              <button
                                type="button"
                                aria-label={`Grade ${entry.selection} Lost`}
                                onClick={() =>
                                  onSettleSinglePick(
                                    entry.id,
                                    0,
                                    entry.scoreSummary || 'Verified Loss'
                                  )
                                }
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                                  entry.actualOutcome === 0
                                    ? 'bg-rose-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Lost
                              </button>
                              <button
                                type="button"
                                aria-label={`Grade ${entry.selection} Pending`}
                                onClick={() => onSettleSinglePick(entry.id, -1, '')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                                  entry.settlementStatus === 'pending'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Pending
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
