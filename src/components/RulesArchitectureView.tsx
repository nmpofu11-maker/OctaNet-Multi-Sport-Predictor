import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  ALL_SPORTS,
  RuleKey,
  SPORT_LABELS,
  SportId,
} from '../types/sports';
import {
  getDefaultSportWeights,
  normalizeWeights,
  SPORT_ADAPTED_RULES,
  SportRuleWeights,
} from '../engine/sportRules';

interface RulesArchitectureViewProps {
  sportWeights: SportRuleWeights;
  learnedGlobalImportance: Record<RuleKey, number>;
  onUpdateSportWeights: (sport: SportId, nextWeights: Record<RuleKey, number>) => void;
  onResetAllWeights: () => void;
}

export const RulesArchitectureView: React.FC<RulesArchitectureViewProps> = ({
  sportWeights,
  learnedGlobalImportance,
  onUpdateSportWeights,
  onResetAllWeights,
}) => {
  const [activeSport, setActiveSport] = useState<SportId>(SportId.Soccer);

  const specs = SPORT_ADAPTED_RULES[activeSport];
  const currentWeights = normalizeWeights(sportWeights[activeSport]);
  const defaultWeights = getDefaultSportWeights()[activeSport];

  const handleSliderChange = (ruleKey: RuleKey, nextPercent: number) => {
    const raw = { ...sportWeights[activeSport], [ruleKey]: nextPercent / 100 };
    onUpdateSportWeights(activeSport, normalizeWeights(raw));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Universal 8-Rule Multi-Sport Dynamics &amp; Formulas
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Derived directly from your 8 analytical pillars: Motivation &amp; Stakes, Last-5 Attacking Form, H2H + 8-Spot Standings Gap Decay, Competitor Tiers, Derby Disruption, Squad Value Subordinate to Rules 1–3, Continental Rotation Fatigue, and Coach H2H + High-Volatility League Watchlist.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetAllWeights}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors self-start whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Reset All Sport Priors
        </button>
      </div>

      {/* Sport Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto" role="tablist" aria-label="Select sport rules">
        {ALL_SPORTS.map((sport) => (
          <button
            key={sport}
            type="button"
            role="tab"
            aria-selected={activeSport === sport}
            onClick={() => setActiveSport(sport)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSport === sport
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {SPORT_LABELS[sport]} Dynamics
          </button>
        ))}
      </div>

      {/* 8-Rule Domain Adaptation Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                <th className="py-3 pl-4 pr-2 w-12">Rule</th>
                <th className="py-3 px-3 w-64">{SPORT_LABELS[activeSport]} Adaptation</th>
                <th className="py-3 px-3">Universal Multi-Sport Math &amp; Domain Logic</th>
                <th className="py-3 px-3 text-right w-28">Default Prior</th>
                <th className="py-3 px-3 text-right w-28">MLP Learned</th>
                <th className="py-3 pl-3 pr-4 w-52">Active Rule Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {specs.map((spec) => {
                const activeW = currentWeights[spec.key];
                const defaultW = defaultWeights[spec.key];
                const mlpW = learnedGlobalImportance[spec.key] ?? 0.125;
                const sliderId = `weight-${activeSport}-${spec.key}`;
                return (
                  <tr key={spec.key} className="hover:bg-slate-50/60">
                    <td className="py-3.5 pl-4 pr-2 font-mono text-xs tabular-nums font-semibold text-slate-500">
                      0{spec.index}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{spec.sportTitle}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {spec.universalName} · {spec.metricUnit}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 leading-relaxed max-w-lg">
                      <div>{spec.dynamicSummary}</div>
                      <div className="mt-1 font-mono text-[11px] text-slate-800">
                        {spec.universalFormula}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                        CSV Column: {spec.csvColumnHint}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-xs tabular-nums text-slate-600">
                      {(defaultW * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-xs tabular-nums text-blue-700 font-medium">
                      {(mlpW * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 pl-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <label htmlFor={sliderId} className="sr-only">
                          Weight for {spec.sportTitle}
                        </label>
                        <input
                          id={sliderId}
                          type="range"
                          min={2}
                          max={35}
                          step={1}
                          value={Math.round(activeW * 100)}
                          onChange={(e) => handleSliderChange(spec.key, Number(e.target.value))}
                          className="w-full accent-blue-700"
                        />
                        <span className="font-mono text-xs tabular-nums font-semibold text-slate-900 w-12 text-right">
                          {(activeW * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
