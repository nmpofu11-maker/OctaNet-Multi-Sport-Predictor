import React from 'react';
import { Bookmark, Check, X } from 'lucide-react';
import { PredictionResult, SPORT_LABELS } from '../types/sports';

interface BetInspectorDrawerProps {
  prediction: PredictionResult | null;
  onClose: () => void;
  isTracked: boolean;
  onToggleTrack: (prediction: PredictionResult) => void;
}

export const BetInspectorDrawer: React.FC<BetInspectorDrawerProps> = ({
  prediction,
  onClose,
  isTracked,
  onToggleTrack,
}) => {
  if (!prediction) return null;

  const { fixture } = prediction;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/35 transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="text-xs text-slate-500">
              {SPORT_LABELS[fixture.sport]} · {fixture.competition} · Rank #{prediction.rank}
            </div>
            <h2 id="inspector-title" className="mt-0.5 text-lg font-bold text-slate-900">
              {fixture.matchupLabel}
            </h2>
            <div className="mt-0.5 text-xs text-slate-600">
              {fixture.venueOrSurface} · {fixture.kickoffTime}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close prediction inspector"
            className="p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Primary Pick & Probability Comparison */}
          <div className="pb-5 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Recommended Selection</div>
                <div className="text-base font-bold text-slate-900">
                  {fixture.selection} · {fixture.market}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {fixture.sportContextStat} · {prediction.confidenceTier}
                </div>
                {prediction.cautionFlags.length > 0 && (
                  <div className="mt-1 text-xs text-amber-800 font-medium">
                    Active Guardrails: {prediction.cautionFlags.join(' · ')}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggleTrack(prediction)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isTracked
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isTracked ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved in Slip
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Add to Bet Slip
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-2">
              <div>
                <div className="text-xs text-slate-500">Market Odds</div>
                <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
                  {fixture.decimalOdds.toFixed(2)}
                </div>
                <div className="font-mono text-[11px] tabular-nums text-slate-500">
                  {(prediction.impliedProbability * 100).toFixed(1)}% imp
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">8-Rule Engine</div>
                <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
                  {prediction.eightPointNormalized.toFixed(2)} / 8
                </div>
                <div className="font-mono text-[11px] tabular-nums text-slate-500">
                  {(prediction.ruleProbability * 100).toFixed(1)}% prob
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Neural MLP</div>
                <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-blue-700">
                  {(prediction.neuralProbability * 100).toFixed(1)}%
                </div>
                <div className="font-mono text-[11px] tabular-nums text-slate-500">
                  CSV-learned
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Hybrid Edge</div>
                <div
                  className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${
                    prediction.edgePercent >= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {prediction.edgePercent >= 0 ? '+' : ''}
                  {prediction.edgePercent.toFixed(2)}%
                </div>
                <div className="font-mono text-[11px] tabular-nums text-slate-500">
                  Kelly {prediction.kellyFractionPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* 8 Sport-Adapted Universal Rules Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {SPORT_LABELS[fixture.sport]}-Adapted Universal 8 Rules &amp; MLP Attribution
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Effective /10 · MLP Sensitivity %
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {prediction.ruleBreakdown.map((item) => {
                const wasAdjusted = Math.abs(item.effectiveScore - item.rawScore) >= 0.15;
                return (
                  <div key={item.key} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-900">
                        0{item.index}. {item.sportTitle}
                      </span>
                      <span className="font-mono tabular-nums text-slate-700 shrink-0">
                        <strong className="text-slate-900">
                          {item.effectiveScore.toFixed(1)}
                        </strong>
                        /10
                        {wasAdjusted ? ` (raw ${item.rawScore.toFixed(1)})` : ''} · Prior{' '}
                        {(item.priorWeight * 100).toFixed(0)}% · MLP{' '}
                        <span className="text-blue-700 font-semibold">
                          {(item.neuralAttribution * 100).toFixed(1)}%
                        </span>
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {item.universalFormula}
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-slate-800 h-full transition-transform duration-150"
                        style={{ width: `${Math.min(100, item.effectiveScore * 10)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competitor Learned Intelligence Coefficients */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Learned Competitor Intelligence Matrix ({fixture.selection})
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                CSV Sample: {prediction.sampleSizeMatches} matches
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-lg p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Home / Surface Mult.</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {prediction.teamCoefficients.home_advantage_multiplier.toFixed(3)}x
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Form Momentum Wt.</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {prediction.teamCoefficients.form_momentum_weight.toFixed(3)}x
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Volatility Index</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {prediction.teamCoefficients.volatility_index.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Fatigue Penalty Mod.</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {prediction.teamCoefficients.fatigue_penalty_modifier.toFixed(3)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
