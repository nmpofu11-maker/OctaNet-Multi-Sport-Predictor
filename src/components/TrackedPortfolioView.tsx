import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { PredictionResult, SPORT_LABELS } from '../types/sports';

interface TrackedPortfolioViewProps {
  trackedBets: PredictionResult[];
  onRemoveBet: (fixtureId: string) => void;
  onClearAll: () => void;
  onExportSlipCSV: () => void;
  onNavigateToDaily: () => void;
}

export const TrackedPortfolioView: React.FC<TrackedPortfolioViewProps> = ({
  trackedBets,
  onRemoveBet,
  onClearAll,
  onExportSlipCSV,
  onNavigateToDaily,
}) => {
  const [bankroll, setBankroll] = useState<number>(1000);
  const [stakingMode, setStakingMode] = useState<'quarter-kelly' | 'flat-2pct'>('quarter-kelly');

  const rowsWithStake = trackedBets.map((bet) => {
    const pct =
      stakingMode === 'quarter-kelly'
        ? Math.max(0.5, bet.kellyFractionPercent)
        : 2.0;
    const stakeCurrency = (bankroll * pct) / 100;
    const expectedProfit = stakeCurrency * (bet.edgePercent / 100);
    return { bet, pct, stakeCurrency, expectedProfit };
  });

  const totalStaked = rowsWithStake.reduce((acc, r) => acc + r.stakeCurrency, 0);
  const totalExpectedProfit = rowsWithStake.reduce((acc, r) => acc + r.expectedProfit, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tracked Daily Bet Slip &amp; Kelly Sizing
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Manage saved selections across all 6 sports, compare Quarter-Kelly vs flat unit sizing, and export your card to CSV.
          </p>
        </div>

        {trackedBets.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExportSlipCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Bet Slip CSV
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Slip
            </button>
          </div>
        )}
      </div>

      {/* Bankroll & Sizing Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="bankroll-input" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Reference Bankroll ($):
          </label>
          <input
            id="bankroll-input"
            type="number"
            min={50}
            max={1000000}
            step={50}
            value={bankroll}
            onChange={(e) => setBankroll(Math.max(10, Number(e.target.value) || 0))}
            className="w-32 px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setStakingMode('quarter-kelly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              stakingMode === 'quarter-kelly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarter-Kelly Sizing
          </button>
          <button
            type="button"
            onClick={() => setStakingMode('flat-2pct')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              stakingMode === 'flat-2pct'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flat 2.0% Unit
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono tabular-nums">
          <div>
            <span className="text-slate-500 font-sans">Total Outlay: </span>
            <strong className="text-slate-900">${totalStaked.toFixed(2)}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-sans">Projected EV: </span>
            <strong className={totalExpectedProfit >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
              {totalExpectedProfit >= 0 ? '+' : ''}${totalExpectedProfit.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Slip Table or Empty State */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {rowsWithStake.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Your Daily Bet Slip Is Empty
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Save picks from any of the 6 daily Top 10 sport boards (Soccer, Tennis, Basketball, Golf, Cricket, or Rugby) to model stake sizing and expected return.
            </p>
            <button
              type="button"
              onClick={onNavigateToDaily}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Browse Daily Top 10 Bets
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                  <th className="py-3 pl-4 pr-3">Sport &amp; Matchup</th>
                  <th className="py-3 px-3">Selection</th>
                  <th className="py-3 px-3 text-right">Odds</th>
                  <th className="py-3 px-3 text-right">Hybrid Prob</th>
                  <th className="py-3 px-3 text-right">Edge</th>
                  <th className="py-3 px-3 text-right">Stake ($)</th>
                  <th className="py-3 px-3 text-right">Expected Profit</th>
                  <th className="py-3 pl-3 pr-4 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {rowsWithStake.map(({ bet, pct, stakeCurrency, expectedProfit }) => (
                  <tr key={bet.fixture.id} className="hover:bg-slate-50/80">
                    <td className="py-3 pl-4 pr-3">
                      <div className="font-semibold text-slate-900">{bet.fixture.matchupLabel}</div>
                      <div className="text-slate-500">
                        {SPORT_LABELS[bet.fixture.sport]} · {bet.fixture.competition} · {bet.fixture.date}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {bet.fixture.selection} · {bet.fixture.market}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900">
                      {bet.fixture.decimalOdds.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900">
                      {(bet.hybridProbability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {bet.edgePercent >= 0 ? '+' : ''}
                      {bet.edgePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900">
                      ${stakeCurrency.toFixed(2)} ({pct.toFixed(1)}%)
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {expectedProfit >= 0 ? '+' : ''}${expectedProfit.toFixed(2)}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveBet(bet.fixture.id)}
                        aria-label={`Remove ${bet.fixture.selection} from slip`}
                        className="p-1.5 text-slate-400 hover:text-red-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
