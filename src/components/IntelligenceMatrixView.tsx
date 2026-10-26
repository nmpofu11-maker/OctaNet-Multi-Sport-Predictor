import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, RefreshCw, Search, Upload } from 'lucide-react';
import { IntelligenceMatrixPayload } from '../types/sports';
import { validateIntelligenceMatrixJSON } from '../engine/csvParser';

interface IntelligenceMatrixViewProps {
  payload: IntelligenceMatrixPayload;
  onImportPayload: (next: IntelligenceMatrixPayload) => void;
  onRecalibrateNotesAI: () => Promise<void>;
  isCalibratingAI: boolean;
}

export const IntelligenceMatrixView: React.FC<IntelligenceMatrixViewProps> = ({
  payload,
  onImportPayload,
  onRecalibrateNotesAI,
  isCalibratingAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(payload, null, 2));
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const entries = useMemo(() => {
    const all = Object.entries(payload.team_intelligence_matrices);
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(([team]) => team.toLowerCase().includes(q));
  }, [payload, searchQuery]);

  const formattedJson = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setStatusMessage({ type: 'error', text: 'Clipboard write was blocked by browser permissions.' });
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_intelligence_matrices_${payload.sync_timestamp.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidateAndImport = () => {
    const check = validateIntelligenceMatrixJSON(jsonInput);
    if (check.error || !check.payload) {
      setStatusMessage({
        type: 'error',
        text: check.error ?? 'Invalid Team Intelligence Matrix JSON payload.',
      });
      return;
    }
    onImportPayload(check.payload);
    setStatusMessage({
      type: 'success',
      text: `Imported ${
        Object.keys(check.payload.team_intelligence_matrices).length
      } competitor intelligence matrices and recalculated daily Top 10 predictions.`,
    });
    setJsonEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team &amp; Competitor Intelligence Matrices
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            {Object.keys(payload.team_intelligence_matrices).length === 0
              ? 'No learned competitor coefficients are available yet. Import historical results and explicitly train the model before treating any coefficients as empirical.'
              : 'Competitor coefficients derived from the active CSV corpus (home advantage, form momentum, volatility index, and fatigue penalty) feed the 8-rule prior and MLP input vector. Verify source data before relying on these estimates.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isCalibratingAI}
            onClick={async () => {
              try {
                await onRecalibrateNotesAI();
                setStatusMessage({
                  type: 'success',
                  text: 'Updated meta-improvement calibration notes.',
                });
              } catch (err) {
                setStatusMessage({
                  type: 'error',
                  text: err instanceof Error ? err.message : 'AI calibration failed.',
                });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalibratingAI ? 'animate-spin' : ''}`} />
            {isCalibratingAI ? 'Synthesizing...' : 'Generate AI Meta Notes'}
          </button>
          <button
            type="button"
            onClick={() => {
              setJsonInput(formattedJson);
              setJsonEditorOpen((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            {jsonEditorOpen ? 'Close JSON Importer' : 'Import / Edit JSON'}
          </button>
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied JSON' : 'Copy JSON'}
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Matrix JSON
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`p-3.5 rounded-lg border text-xs font-medium ${
            statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Metadata Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-500">Model Engine Identifier</div>
            <div className="mt-0.5 font-mono font-semibold text-slate-900">
              {payload.model_engine}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Last Sync Timestamp</div>
            <div className="mt-0.5 font-mono tabular-nums text-slate-900">
              {payload.sync_timestamp}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Tracked Teams &amp; Players</div>
            <div className="mt-0.5 font-mono tabular-nums font-semibold text-slate-900">
              {Object.keys(payload.team_intelligence_matrices).length} competitors
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
          <strong className="text-slate-900">Meta Improvement Notes:</strong>{' '}
          {payload.meta_improvement_notes}
        </div>
      </div>

      {jsonEditorOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              JSON Schema Import &amp; Validation
            </h2>
          </div>
          <label htmlFor="matrix-json-textarea" className="sr-only">
            Team Intelligence Matrix JSON payload
          </label>
          <textarea
            id="matrix-json-textarea"
            rows={10}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
            spellCheck={false}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setJsonEditorOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleValidateAndImport}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
            >
              Validate &amp; Apply JSON Matrix
            </button>
          </div>
        </div>
      )}

      {/* Search & Coefficient Grid */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="matrix-search-input" className="sr-only">
            Search competitor intelligence coefficients
          </label>
          <input
            id="matrix-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Arsenal, Jannik Sinner, Boston Celtics, Scottie Scheffler..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-sm font-medium text-slate-900">
                No competitors match &ldquo;{searchQuery}&rdquo;.
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-lg"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Team / Competitor</th>
                    <th className="py-3 px-3 text-right">Matches in Active Corpus</th>
                    <th className="py-3 px-3 text-right">Home / Surface Mult.</th>
                    <th className="py-3 px-3 text-right">Form Momentum Wt.</th>
                    <th className="py-3 px-3 text-right">Volatility Index</th>
                    <th className="py-3 pl-3 pr-4 text-right">Fatigue Penalty Mod.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {entries.map(([team, info]) => (
                    <tr key={team} className="hover:bg-slate-50/80">
                      <td className="py-2.5 pl-4 pr-3 font-semibold text-slate-900">{team}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {info.sample_size_matches}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                        {info.learned_coefficients.home_advantage_multiplier.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-blue-700 font-medium">
                        {info.learned_coefficients.form_momentum_weight.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {info.learned_coefficients.volatility_index.toFixed(3)}
                      </td>
                      <td className="py-2.5 pl-3 pr-4 text-right font-mono tabular-nums text-slate-700">
                        {info.learned_coefficients.fatigue_penalty_modifier.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
