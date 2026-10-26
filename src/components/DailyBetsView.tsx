import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ClipboardCheck,
  Download,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ALL_SPORTS,
  PredictionResult,
  SPORT_LABELS,
  SportId,
} from '../types/sports';
import { FixtureDiscoveryCandidate } from '../engine/fixtureSources';
import { SPORT_ADAPTED_RULES } from '../engine/sportRules';

interface DailyBetsViewProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  selectedSport: SportId | 'cross-sport';
  onSelectSport: (sport: SportId | 'cross-sport') => void;
  predictionsBySport: Record<SportId, PredictionResult[]>;
  crossSportTop10: PredictionResult[];
  trackedIds: Set<string>;
  onToggleTrack: (prediction: PredictionResult) => void;
  onInspectPrediction: (prediction: PredictionResult) => void;
  onExportCurrentCSV: (predictions: PredictionResult[], label: string) => void;
  onExportAll60CSV: () => void;
  onLockDailyCardForAudit: () => void;
  isCurrentDateLocked: boolean;
  onLiveSyncSport: (sport: SportId, date: string) => Promise<void>;
  isSyncingLive: boolean;
  liveSyncMessage: { type: 'success' | 'error'; text: string; sources?: { uri: string; title: string }[] } | null;
  fixtureCandidates: FixtureDiscoveryCandidate[];
  neuralBlendAlpha: number;
}

export const DailyBetsView: React.FC<DailyBetsViewProps> = ({
  selectedDate,
  onChangeDate,
  selectedSport,
  onSelectSport,
  predictionsBySport,
  crossSportTop10,
  trackedIds,
  onToggleTrack,
  onInspectPrediction,
  onExportCurrentCSV,
  onExportAll60CSV,
  onLockDailyCardForAudit,
  isCurrentDateLocked,
  onLiveSyncSport,
  isSyncingLive,
  liveSyncMessage,
  fixtureCandidates,
  neuralBlendAlpha,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minEdgeFilter, setMinEdgeFilter] = useState<'all' | 'pos' | 'strong'>('all');

  const activePredictions = useMemo(() => {
    const base =
      selectedSport === 'cross-sport'
        ? crossSportTop10
        : predictionsBySport[selectedSport] ?? [];

    return base.filter((p) => {
      if (minEdgeFilter === 'pos' && p.edgePercent <= 0) return false;
      if (minEdgeFilter === 'strong' && p.edgePercent < 4.0) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.fixture.selection.toLowerCase().includes(q) ||
        p.fixture.opponent.toLowerCase().includes(q) ||
        p.fixture.competition.toLowerCase().includes(q) ||
        p.fixture.market.toLowerCase().includes(q)
      );
    });
  }, [selectedSport, crossSportTop10, predictionsBySport, minEdgeFilter, searchQuery]);

  const summaryStats = useMemo(() => {
    const base =
      selectedSport === 'cross-sport'
        ? crossSportTop10
        : predictionsBySport[selectedSport] ?? [];
    if (base.length === 0) {
      return { hasData: false, avgEdge: 0, avgHybridProb: 0, avgEightScore: 0, highConvictionCount: 0 };
    }
    const avgEdge = base.reduce((acc, b) => acc + b.edgePercent, 0) / base.length;
    const avgHybridProb = base.reduce((acc, b) => acc + b.hybridProbability, 0) / base.length;
    const avgEightScore = base.reduce((acc, b) => acc + b.eightPointNormalized, 0) / base.length;
    const highConvictionCount = base.filter((b) => b.confidenceTier === 'High Conviction').length;
    return { hasData: true, avgEdge, avgHybridProb, avgEightScore, highConvictionCount };
  }, [selectedSport, crossSportTop10, predictionsBySport]);

  const activeSportRulesPreview =
    selectedSport === 'cross-sport' ? null : SPORT_ADAPTED_RULES[selectedSport];

  const stepDate = (daysDelta: number) => {
    const parts = selectedDate.split('-').map(Number);
    if (parts.length !== 3) return;
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() + daysDelta);
    onChangeDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {selectedSport === 'cross-sport'
              ? 'Cross-Sport Daily Top 10 Best Bets'
              : `${SPORT_LABELS[selectedSport]} · Daily 10 Best Bets`}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            {(selectedSport === 'cross-sport' ? crossSportTop10.length > 0 : (predictionsBySport[selectedSport] ?? []).length > 0)
              ? `Ranked by hybrid expected value combining sport-adapted 8-point fundamentals (${Math.round((1 - neuralBlendAlpha) * 100)}% prior) with explicitly trained CSV neural probabilities (${Math.round(neuralBlendAlpha * 100)}% MLP).`
              : 'No predictions available. The model must be explicitly trained on imported historical rows, and supplied fixture candidates must be available. No demo predictions are generated.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => stepDate(-1)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded whitespace-nowrap shrink-0"
            >
              Prev Day
            </button>
            <label htmlFor="slate-date-input" className="sr-only">
              Select prediction date
            </label>
            <input
              id="slate-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onChangeDate(e.target.value);
              }}
              className="px-2 py-1 text-xs font-mono tabular-nums text-slate-900 bg-transparent border-x border-slate-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => stepDate(1)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded whitespace-nowrap shrink-0"
            >
              Next Day
            </button>
          </div>

          <button
            type="button"
            onClick={onLockDailyCardForAudit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
            {isCurrentDateLocked ? 'View Locked Audit Card' : 'Lock 60 Picks for Audit'}
          </button>

          <button
            type="button"
            onClick={onExportAll60CSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export All 60 Daily Picks
          </button>
        </div>
      </div>

      {/* 6-Sport Segmented Selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto" role="tablist" aria-label="Select sport">
        {ALL_SPORTS.map((sport) => {
          const isSelected = selectedSport === sport;
          return (
            <button
              key={sport}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectSport(sport)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {SPORT_LABELS[sport]} (10)
            </button>
          );
        })}
        <button
          type="button"
          role="tab"
          aria-selected={selectedSport === 'cross-sport'}
          onClick={() => onSelectSport('cross-sport')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            selectedSport === 'cross-sport'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cross-Sport Top 10
        </button>
      </div>

      {/* Quantitative Summary Strip (Single-Elevation Grid with Hairline Dividers) */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4">
          <div className="text-xs text-slate-500">Top 10 Mean Expected Value</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-emerald-700">
            {summaryStats.hasData ? <>{summaryStats.avgEdge >= 0 ? '+' : ''}{summaryStats.avgEdge.toFixed(2)}%</> : 'Unavailable'}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{summaryStats.hasData ? 'vs bookmaker implied odds' : 'Not trained or no eligible predictions'}</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Mean Hybrid Win Probability</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-slate-900">
            {summaryStats.hasData ? (summaryStats.avgHybridProb * 100).toFixed(1) + '%' : 'Unavailable'}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{summaryStats.hasData ? '8-rule + MLP consensus' : 'Not trained or no eligible predictions'}</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Mean 8-Point Model Rating</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-slate-900">
            {summaryStats.hasData ? summaryStats.avgEightScore.toFixed(2) + ' / 8.00' : 'Unavailable'}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{summaryStats.hasData ? 'Sport-adapted rule index' : 'Not trained or no eligible predictions'}</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">High-Conviction Selections</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-blue-700">
            {summaryStats.hasData ? summaryStats.highConvictionCount + ' of 10' : 'Unavailable'}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{summaryStats.hasData ? 'Edge ≥ +6.5% and score ≥ 5.60' : 'Not trained or no eligible predictions'}</div>
        </div>
      </div>

      {/* Sport-Specific Dynamics Context Strip */}
      {activeSportRulesPreview && selectedSport !== 'cross-sport' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-900">
              Active {SPORT_LABELS[selectedSport]} 8-Rule Neural Focus
            </div>
            <p className="text-xs text-slate-600">
              {activeSportRulesPreview
                .slice(0, 4)
                .map((r) => `R${r.index}: ${r.sportTitle}`)
                .join(' · ')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isSyncingLive}
              onClick={() => onLiveSyncSport(selectedSport, selectedDate)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              {isSyncingLive ? 'Syncing Live Web Slate...' : `Sync Live ${SPORT_LABELS[selectedSport]} Slate`}
            </button>
            <button
              type="button"
              onClick={() =>
                onExportCurrentCSV(
                  activePredictions,
                  `${selectedSport}-top10-${selectedDate}`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download {SPORT_LABELS[selectedSport]} CSV
            </button>
          </div>
        </div>
      )}

      {liveSyncMessage && (
        <div
          role="status"
          className={`p-3.5 rounded-lg border text-xs ${
            liveSyncMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="font-medium">{liveSyncMessage.text}</div>
          {liveSyncMessage.sources && liveSyncMessage.sources.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
              <span>Sources:</span>
              {liveSyncMessage.sources.slice(0, 4).map((s, idx) => (
                <a
                  key={idx}
                  href={s.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-slate-900 truncate max-w-xs"
                >
                  {s.title || s.uri}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {fixtureCandidates.filter((candidate) => selectedSport === 'cross-sport' || candidate.sport === selectedSport).length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3" aria-labelledby="schedule-records-heading">
          <div>
            <h2 id="schedule-records-heading" className="text-sm font-semibold text-slate-900">Provider-listed schedule records · not prediction-ready</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Source records from TheSportsDB are shown separately from forecasts. This feed does not supply all eight evidence rules, and the app does not invent rule scores or odds to fill those gaps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {fixtureCandidates
              .filter((candidate) => selectedSport === 'cross-sport' || candidate.sport === selectedSport)
              .slice(0, 18)
              .map((candidate) => (
                <article key={candidate.id} className="rounded-lg border border-slate-200 p-3 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 break-words">{candidate.eventName}</div>
                  <div className="mt-1 text-[11px] text-slate-600">
                    {candidate.competition ?? 'Competition not supplied'} · {SPORT_LABELS[candidate.sport]}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600">
                    {candidate.date}{candidate.kickoffTime ? ` · ${candidate.kickoffTime}` : ''}
                    {candidate.venue ? ` · ${candidate.venue}` : ''}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {candidate.status ?? 'Status not supplied'}
                    {candidate.homeScore !== null && candidate.awayScore !== null
                      ? ` · Provider score: ${candidate.homeScore}–${candidate.awayScore}`
                      : ''}
                  </div>
                  <a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-medium text-blue-700 underline hover:text-blue-900">
                    Open provider record
                  </a>
                </article>
              ))}
          </div>
          {fixtureCandidates.filter((candidate) => selectedSport === 'cross-sport' || candidate.sport === selectedSport).length > 18 && (
            <p className="text-[11px] text-slate-500">Showing the first 18 records for this view.</p>
          )}
        </section>
      )}

      {/* Search & Edge Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="bet-search-input" className="sr-only">
            Filter teams, players, or competitions
          </label>
          <input
            id="bet-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter team, player, tournament, or market..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 shrink-0" />
          {(
            [
              { id: 'all', label: 'All Top 10' },
              { id: 'pos', label: 'Positive EV Only' },
              { id: 'strong', label: 'Edge >= +4.0%' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMinEdgeFilter(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                minEdgeFilter === opt.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Top 10 Best Bets Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {activePredictions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900">
              No daily picks match the current search or edge filter.
            </p>
            <p className="text-xs text-slate-500">
              Clear your search text or relax the minimum expected value threshold to view all 10 daily bets.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMinEdgeFilter('all');
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                  <th className="py-3 pl-4 pr-2 w-12">#</th>
                  <th className="py-3 px-3">Matchup &amp; Sport Context</th>
                  <th className="py-3 px-3">Recommended Bet</th>
                  <th className="py-3 px-3 text-right">Odds</th>
                  <th className="py-3 px-3 text-right">8-Rule</th>
                  <th className="py-3 px-3 text-right">Neural MLP</th>
                  <th className="py-3 px-3 text-right">Hybrid Prob</th>
                  <th className="py-3 px-3 text-right">Expected Edge</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {activePredictions.map((pred) => {
                  const isTracked = trackedIds.has(pred.fixture.id);
                  const isPositiveEdge = pred.edgePercent >= 0;
                  return (
                    <tr
                      key={pred.fixture.id}
                      className="hover:bg-slate-50/90 transition-colors group"
                    >
                      <td className="py-3 pl-4 pr-2 font-mono text-xs tabular-nums text-slate-500 font-semibold">
                        {String(pred.rank).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {pred.fixture.matchupLabel}
                        </div>
                        {/* Zero-Pill Metadata Discipline: quiet unboxed text with separators */}
                        <div className="mt-0.5 text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5">
                          {selectedSport === 'cross-sport' && (
                            <>
                              <span className="font-medium text-slate-700">
                                {SPORT_LABELS[pred.fixture.sport]}
                              </span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span>{pred.fixture.competition}</span>
                          <span aria-hidden="true">·</span>
                          <span>{pred.fixture.kickoffTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] text-slate-600">
                            {pred.fixture.sportContextStat}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {pred.fixture.selection}
                        </div>
                        <div className="text-xs text-slate-500">
                          {pred.fixture.market} · {pred.confidenceTier}
                          {pred.cautionFlags.length > 0 ? ` · ${pred.cautionFlags[0]}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs tabular-nums font-medium text-slate-900">
                        {pred.fixture.decimalOdds.toFixed(2)}
                        <div className="text-[11px] text-slate-400">
                          Imp {(pred.impliedProbability * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {pred.eightPointNormalized.toFixed(2)}
                        </span>
                        <span className="text-slate-400">/8</span>
                        <div className="text-[11px] text-slate-500">
                          {(pred.ruleProbability * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-blue-700 font-medium">
                        {(pred.neuralProbability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs tabular-nums font-semibold text-slate-900">
                        {(pred.hybridProbability * 100).toFixed(1)}%
                        <div className="text-[11px] font-normal text-slate-500">
                          Fair {pred.fairOdds.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs tabular-nums">
                        <div
                          className={`font-semibold ${
                            isPositiveEdge ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isPositiveEdge ? '+' : ''}
                          {pred.edgePercent.toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Kelly {pred.kellyFractionPercent.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onInspectPrediction(pred)}
                            aria-label={`Inspect 8-rule breakdown for ${pred.fixture.selection}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            Inspect
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleTrack(pred)}
                            aria-label={
                              isTracked
                                ? `Remove ${pred.fixture.selection} from bet slip`
                                : `Save ${pred.fixture.selection} to bet slip`
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                              isTracked
                                ? 'bg-blue-700 text-white hover:bg-blue-800'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {isTracked ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                Save
                              </>
                            )}
                          </button>
                        </div>
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
  );
};
