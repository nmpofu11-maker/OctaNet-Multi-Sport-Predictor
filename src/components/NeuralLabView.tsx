import React, { useMemo, useRef, useState } from 'react';
import { Download, FileUp, Play, RotateCcw } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ALL_SPORTS,
  CorpusEvolutionPoint,
  HistoricalMatchRow,
  NeuralHyperparameters,
  RULE_KEYS,
  SPORT_LABELS,
  SportId,
} from '../types/sports';
import {
  computeCorpusEvolutionCurve,
  TrainedNeuralEngine,
} from '../engine/neuralNetwork';
import {
  generateSportCSVTemplate,
  parseHistoricalCSV,
  serializeHistoricalRowsToCSV,
} from '../engine/csvParser';
import { SPORT_ADAPTED_RULES, SportRuleWeights } from '../engine/sportRules';

interface NeuralLabViewProps {
  historicalRows: HistoricalMatchRow[];
  engine: TrainedNeuralEngine;
  hyperparams: NeuralHyperparameters;
  sportWeights?: SportRuleWeights;
  onUpdateHyperparams: (next: NeuralHyperparameters) => void;
  onTrainWithRows: (rows: HistoricalMatchRow[], nextParams: NeuralHyperparameters) => void;
  onResetDefaultDataset: () => void;
}

interface EvolutionTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CorpusEvolutionPoint }>;
}

const EvolutionTooltip: React.FC<EvolutionTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0].payload;
  const deltaSign = pt.brierImprovementVsInitialPct >= 0 ? '-' : '+';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs space-y-2 min-w-[235px]">
      <div className="border-b border-slate-100 pb-1.5">
        <div className="font-semibold text-slate-900 font-mono tabular-nums">
          {pt.corpusSize} Historical Matches · {pt.throughDate}
        </div>
        <div className="text-slate-500 font-mono tabular-nums mt-0.5">
          {pt.trainRows} train / {pt.holdoutRows} holdout · {pt.competitorsTracked} competitors
        </div>
      </div>

      <div className="space-y-1 font-mono tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-700 font-medium">Hybrid Ensemble Brier</span>
          <span className="font-semibold text-slate-900">{pt.hybridBrier.toFixed(4)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-blue-700">Neural MLP Brier</span>
          <span className="text-slate-800">{pt.neuralBrier.toFixed(4)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">8-Rule Baseline Brier</span>
          <span className="text-slate-700">{pt.ruleBrier.toFixed(4)}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-1.5 space-y-1 font-mono tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Holdout Accuracy (Hybrid)</span>
          <span className="font-semibold text-slate-900">{pt.hybridAccuracyPct.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Brier Error vs Initial Slice</span>
          <span
            className={
              pt.brierImprovementVsInitialPct >= 0
                ? 'text-emerald-700 font-semibold'
                : 'text-amber-700 font-semibold'
            }
          >
            {deltaSign}
            {Math.abs(pt.brierImprovementVsInitialPct).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const NeuralLabView: React.FC<NeuralLabViewProps> = ({
  historicalRows,
  engine,
  hyperparams,
  sportWeights,
  onUpdateHyperparams,
  onTrainWithRows,
  onResetDefaultDataset,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sampleMultiSportSlice = (rows: HistoricalMatchRow[], perSport = 5) => {
    const out: HistoricalMatchRow[] = [];
    for (const s of ALL_SPORTS) {
      out.push(...rows.filter((r) => r.sport === s).slice(0, perSport));
    }
    return out.length > 0 ? out : rows.slice(0, perSport * 6);
  };

  const [csvEditorText, setCsvEditorText] = useState<string>(() =>
    serializeHistoricalRowsToCSV(sampleMultiSportSlice(historicalRows, 3))
  );
  const [templateSport, setTemplateSport] = useState<SportId | 'all'>('all');
  const [evolutionViewMode, setEvolutionViewMode] = useState<
    'brier-models' | 'brier-vs-accuracy'
  >('brier-models');
  const [parseFeedback, setParseFeedback] = useState<{
    type: 'success' | 'error';
    messages: string[];
  } | null>(null);

  const { report } = engine;
  const epochHistory = report.epochHistory;

  const evolutionCurve = useMemo(
    () =>
      computeCorpusEvolutionCurve(
        historicalRows,
        engine.hyperparams,
        sportWeights
      ),
    [historicalRows, engine.hyperparams, sportWeights]
  );

  const firstMilestone = evolutionCurve[0];
  const latestMilestone = evolutionCurve[evolutionCurve.length - 1];

  const brierDomain = useMemo<[number, number]>(() => {
    if (evolutionCurve.length === 0) return [0.14, 0.28];
    const vals = evolutionCurve.flatMap((p) => [
      p.hybridBrier,
      p.neuralBrier,
      p.ruleBrier,
    ]);
    const minV = Math.max(0.05, Math.floor((Math.min(...vals) - 0.012) * 100) / 100);
    const maxV = Math.min(0.45, Math.ceil((Math.max(...vals) + 0.012) * 100) / 100);
    return [minV, Math.max(minV + 0.04, maxV)];
  }, [evolutionCurve]);

  const accuracyDomain = useMemo<[number, number]>(() => {
    if (evolutionCurve.length === 0) return [50, 85];
    const vals = evolutionCurve.flatMap((p) => [
      p.hybridAccuracyPct,
      p.neuralAccuracyPct,
    ]);
    const minA = Math.max(35, Math.floor((Math.min(...vals) - 4) / 5) * 5);
    const maxA = Math.min(100, Math.ceil((Math.max(...vals) + 4) / 5) * 5);
    return [minA, Math.max(minA + 15, maxA)];
  }, [evolutionCurve]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvEditorText(text);
    const parsed = parseHistoricalCSV(text);
    if (parsed.errors.length > 0) {
      setParseFeedback({ type: 'error', messages: parsed.errors });
      return;
    }
    if (parsed.rows.length < 8) {
      setParseFeedback({
        type: 'error',
        messages: [
          `Parsed ${parsed.rows.length} rows from "${file.name}", but at least 8 historical match rows are needed for train/validation backpropagation.`,
        ],
      });
      return;
    }
    onTrainWithRows(parsed.rows, hyperparams);
    setParseFeedback({
      type: 'success',
      messages: [
        `Trained MLP neural network on ${parsed.rows.length} uploaded CSV records from "${file.name}".`,
        ...parsed.warnings.slice(0, 2),
      ],
    });
  };

  const handleTrainFromEditor = () => {
    const parsed = parseHistoricalCSV(csvEditorText);
    if (parsed.errors.length > 0) {
      setParseFeedback({ type: 'error', messages: parsed.errors });
      return;
    }
    if (parsed.rows.length < 8) {
      setParseFeedback({
        type: 'error',
        messages: [
          `CSV editor currently has ${parsed.rows.length} valid rows. Provide at least 8 historical rows to train and validate the neural network.`,
        ],
      });
      return;
    }
    onTrainWithRows(parsed.rows, hyperparams);
    setParseFeedback({
      type: 'success',
      messages: [
        `Neural network retrained on ${parsed.rows.length} CSV editor rows across ${
          new Set(parsed.rows.map((r) => r.sport)).size
        } sports.`,
        ...parsed.warnings.slice(0, 2),
      ],
    });
  };

  const handleRetrainFullCorpus = () => {
    onTrainWithRows(historicalRows, hyperparams);
    setParseFeedback({
      type: 'success',
      messages: [
        `Completed ${hyperparams.epochs}-epoch backpropagation pass on ${historicalRows.length} historical multi-sport records. Daily Top 10 bets updated.`,
      ],
    });
  };

  const handleDownloadTemplate = () => {
    const csv = generateSportCSVTemplate(templateSport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `octanet-${templateSport}-training-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFullCorpus = () => {
    const csv = serializeHistoricalRowsToCSV(historicalRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `octanet-historical-360-matches.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build SVG polyline coordinates for Training vs Validation Cross-Entropy Loss
  const chartW = 560;
  const chartH = 190;
  const padX = 40;
  const padY = 20;
  const allLosses = epochHistory.flatMap((s) => [s.trainLoss, s.valLoss]);
  const minLoss = Math.max(0, Math.min(...allLosses, 0.35) - 0.04);
  const maxLoss = Math.max(...allLosses, 0.72) + 0.04;

  const toX = (idx: number) =>
    padX + (idx / Math.max(1, epochHistory.length - 1)) * (chartW - padX * 1.5);
  const toY = (loss: number) =>
    chartH - padY - ((loss - minLoss) / Math.max(0.01, maxLoss - minLoss)) * (chartH - padY * 2);

  const trainPoints = epochHistory.map((s, i) => `${toX(i).toFixed(1)},${toY(s.trainLoss).toFixed(1)}`).join(' ');
  const valPoints = epochHistory.map((s, i) => `${toX(i).toFixed(1)},${toY(s.valLoss).toFixed(1)}`).join(' ');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            CSV Neural Network Training Workbench
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Train a feed-forward Multi-Layer Perceptron (20 inputs &rarr; {engine.weights.h1Dim} &rarr;{' '}
            {engine.weights.h2Dim} &rarr; Sigmoid) on historical CSV sports results governed by your Universal 8 Multi-Sport Rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-file-upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            Upload Past Sports CSV
          </button>
          <button
            type="button"
            onClick={handleExportFullCorpus}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Active CSV ({historicalRows.length} rows)
          </button>
          <button
            type="button"
            onClick={() => {
              onResetDefaultDataset();
              setParseFeedback({
                type: 'success',
                messages: ['Restored 360-match 6-sport benchmark CSV dataset and retrained MLP.'],
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset 360-Row Corpus
          </button>
        </div>
      </div>

      {parseFeedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-lg border text-xs space-y-1 ${
            parseFeedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {parseFeedback.messages.map((m, idx) => (
            <div key={idx} className="font-medium">
              {m}
            </div>
          ))}
        </div>
      )}

      {/* Benchmark Comparison Strip: Pure 8-Rule vs Neural MLP vs Hybrid */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4">
          <div className="text-xs text-slate-500">8-Point Rule Baseline Accuracy</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-slate-900">
            {(report.baselineRuleAccuracy * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            Brier {report.baselineRuleBrier.toFixed(4)}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Standalone Neural MLP Accuracy</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-blue-700">
            {(report.neuralValAccuracy * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            Brier {report.neuralValBrier.toFixed(4)}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Hybrid Ensemble Accuracy</div>
          <div className="mt-1 text-xl font-semibold font-mono tabular-nums text-emerald-700">
            {(report.hybridValAccuracy * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            Brier {report.hybridValBrier.toFixed(4)} ({report.valRows} holdout)
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Holdout Confusion Matrix</div>
          <div className="mt-1 text-sm font-semibold font-mono tabular-nums text-slate-900">
            TP {report.confusionMatrix.tp} · TN {report.confusionMatrix.tn}
          </div>
          <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-500">
            FP {report.confusionMatrix.fp} · FN {report.confusionMatrix.fn} ({report.trainRows} train)
          </div>
        </div>
      </div>

      {/* Historical Corpus Size Learning Curve (Recharts) */}
      {evolutionCurve.length >= 2 && firstMilestone && latestMilestone && (
        <section
          aria-labelledby="corpus-evolution-heading"
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <h2
                id="corpus-evolution-heading"
                className="text-base font-semibold text-slate-900"
              >
                Brier Score &amp; Accuracy Evolution Over Historical Corpus Growth
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 max-w-3xl">
                Chronological learning curve evaluating probability calibration (Brier score &mdash; lower is sharper) and unseen holdout accuracy as the training corpus scales from{' '}
                <span className="font-mono tabular-nums text-slate-700">
                  {firstMilestone.corpusSize}
                </span>{' '}
                early-season matches ({firstMilestone.throughDate}) to{' '}
                <span className="font-mono tabular-nums text-slate-700">
                  {latestMilestone.corpusSize}
                </span>{' '}
                matches ({latestMilestone.throughDate}).
              </p>
            </div>

            <div
              role="group"
              aria-label="Evolution chart series mode"
              className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start shrink-0"
            >
              <button
                type="button"
                aria-pressed={evolutionViewMode === 'brier-models'}
                onClick={() => setEvolutionViewMode('brier-models')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  evolutionViewMode === 'brier-models'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Brier Calibration (3 Models)
              </button>
              <button
                type="button"
                aria-pressed={evolutionViewMode === 'brier-vs-accuracy'}
                onClick={() => setEvolutionViewMode('brier-vs-accuracy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  evolutionViewMode === 'brier-vs-accuracy'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Brier vs Accuracy (%)
              </button>
            </div>
          </div>

          {/* Progression Delta Strip (unboxed, hairline separated) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-slate-100">
            <div>
              <div className="text-xs text-slate-500">
                Initial Slice ({firstMilestone.corpusSize} Rows)
              </div>
              <div className="mt-0.5 text-base font-semibold font-mono tabular-nums text-slate-900">
                {firstMilestone.hybridBrier.toFixed(4)} Brier
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                {firstMilestone.hybridAccuracyPct.toFixed(1)}% acc · {firstMilestone.throughDate}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Active Corpus ({latestMilestone.corpusSize} Rows)
              </div>
              <div className="mt-0.5 text-base font-semibold font-mono tabular-nums text-emerald-700">
                {latestMilestone.hybridBrier.toFixed(4)} Brier
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                {latestMilestone.hybridAccuracyPct.toFixed(1)}% acc · {latestMilestone.throughDate}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Net Brier Error Reduction</div>
              <div
                className={`mt-0.5 text-base font-semibold font-mono tabular-nums ${
                  latestMilestone.brierImprovementVsInitialPct >= 0
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {latestMilestone.brierImprovementVsInitialPct >= 0 ? '-' : '+'}
                {Math.abs(latestMilestone.brierImprovementVsInitialPct).toFixed(1)}% (
                {(latestMilestone.hybridBrier - firstMilestone.hybridBrier >= 0 ? '+' : '') +
                  (latestMilestone.hybridBrier - firstMilestone.hybridBrier).toFixed(4)}
                )
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                Neural MLP {firstMilestone.neuralBrier.toFixed(4)} &rarr;{' '}
                {latestMilestone.neuralBrier.toFixed(4)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Accuracy &amp; Matrix Coverage</div>
              <div className="mt-0.5 text-base font-semibold font-mono tabular-nums text-blue-700">
                {latestMilestone.hybridAccuracyPct - firstMilestone.hybridAccuracyPct >= 0
                  ? '+'
                  : ''}
                {(
                  latestMilestone.hybridAccuracyPct - firstMilestone.hybridAccuracyPct
                ).toFixed(1)}{' '}
                pts
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                {firstMilestone.competitorsTracked} &rarr; {latestMilestone.competitorsTracked}{' '}
                competitors learned
              </div>
            </div>
          </div>

          {/* Series Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {evolutionViewMode === 'brier-models' ? (
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-3.5 h-0.5 bg-emerald-600 inline-block" />
                  Hybrid Ensemble Brier (Lower = Better)
                </span>
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <span className="w-3.5 h-0.5 bg-blue-700 inline-block" />
                  Standalone Neural MLP Brier
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="w-3.5 h-0 border-t-2 border-dashed border-slate-400 inline-block" />
                  8-Rule Baseline Brier
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-3.5 h-0.5 bg-emerald-600 inline-block" />
                  Hybrid Brier Score (Left Axis · Lower = Better)
                </span>
                <span className="inline-flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-3.5 h-0.5 bg-blue-700 inline-block" />
                  Hybrid Holdout Accuracy % (Right Axis · Higher = Better)
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="w-3.5 h-0 border-t-2 border-dashed border-indigo-500 inline-block" />
                  Neural MLP Accuracy % (Right Axis)
                </span>
              </div>
            )}
            <span className="font-mono tabular-nums text-slate-500">
              Fixed Holdout Benchmark: {latestMilestone.holdoutRows} Unseen Matches
            </span>
          </div>

          {/* Recharts Canvas */}
          <div
            className="w-full h-[290px] min-w-0"
            data-testid="brier-evolution-chart"
          >
            <ResponsiveContainer width="100%" height={290}>
              <ComposedChart
                data={evolutionCurve}
                margin={{
                  top: 10,
                  right: evolutionViewMode === 'brier-vs-accuracy' ? 12 : 34,
                  left: 4,
                  bottom: 8,
                }}
              >
                <defs>
                  <linearGradient id="hybridBrierFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="corpusSize"
                  padding={{ left: 14, right: 16 }}
                  tickFormatter={(v: number) => `${v} rows`}
                  stroke="#94a3b8"
                  tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  yAxisId="brier"
                  domain={brierDomain}
                  tickFormatter={(v: number) => v.toFixed(3)}
                  stroke="#94a3b8"
                  width={54}
                  tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                />
                {evolutionViewMode === 'brier-vs-accuracy' && (
                  <YAxis
                    yAxisId="accuracy"
                    orientation="right"
                    domain={accuracyDomain}
                    tickFormatter={(v: number) => `${v}%`}
                    stroke="#94a3b8"
                    width={46}
                    tick={{ fill: '#1d4ed8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                    tickLine={false}
                    axisLine={false}
                  />
                )}
                <Tooltip content={<EvolutionTooltip />} />
                {brierDomain[1] >= 0.25 && brierDomain[0] <= 0.25 && (
                  <ReferenceLine
                    yAxisId="brier"
                    y={0.25}
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                    label={{
                      value: '0.250 Coin-Flip Brier Ceiling',
                      position: 'insideTopRight',
                      fill: '#64748b',
                      fontSize: 10,
                    }}
                  />
                )}

                <Area
                  yAxisId="brier"
                  type="monotone"
                  dataKey="hybridBrier"
                  name="Hybrid Ensemble Brier"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#hybridBrierFill)"
                  dot={{ r: 3.5, fill: '#059669', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#047857' }}
                  isAnimationActive={false}
                />

                {evolutionViewMode === 'brier-models' ? (
                  <>
                    <Line
                      yAxisId="brier"
                      type="monotone"
                      dataKey="neuralBrier"
                      name="Standalone Neural MLP Brier"
                      stroke="#1d4ed8"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#1d4ed8', strokeWidth: 0 }}
                      activeDot={{ r: 4.5, fill: '#1e40af' }}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="brier"
                      type="monotone"
                      dataKey="ruleBrier"
                      name="8-Rule Baseline Brier"
                      stroke="#64748b"
                      strokeWidth={1.8}
                      strokeDasharray="5 4"
                      dot={{ r: 2.5, fill: '#64748b', strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      yAxisId="accuracy"
                      type="monotone"
                      dataKey="hybridAccuracyPct"
                      name="Hybrid Accuracy %"
                      stroke="#1d4ed8"
                      strokeWidth={2.2}
                      dot={{ r: 3.5, fill: '#1d4ed8', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#1e40af' }}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="accuracy"
                      type="monotone"
                      dataKey="neuralAccuracyPct"
                      name="Neural MLP Accuracy %"
                      stroke="#6366f1"
                      strokeWidth={1.7}
                      strokeDasharray="4 3"
                      dot={{ r: 2.5, fill: '#6366f1', strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chronological Milestone Ledger */}
          <div className="overflow-x-auto border-t border-slate-100 pt-3">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-1.5 pr-3 font-medium">Corpus Size</th>
                  <th className="py-1.5 px-3 font-medium">Through Date</th>
                  <th className="py-1.5 px-3 font-medium text-right">8-Rule Brier</th>
                  <th className="py-1.5 px-3 font-medium text-right">Neural MLP Brier</th>
                  <th className="py-1.5 px-3 font-medium text-right">Hybrid Brier</th>
                  <th className="py-1.5 px-3 font-medium text-right">Hybrid Accuracy</th>
                  <th className="py-1.5 pl-3 font-medium text-right">vs Initial Slice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {evolutionCurve.map((pt, idx) => {
                  const isLatest = idx === evolutionCurve.length - 1;
                  return (
                    <tr
                      key={pt.corpusSize}
                      className={
                        isLatest
                          ? 'bg-slate-50/80 font-semibold text-slate-900'
                          : 'text-slate-700'
                      }
                    >
                      <td className="py-1.5 pr-3">
                        {pt.corpusSize} rows ({pt.trainRows} train)
                      </td>
                      <td className="py-1.5 px-3 text-slate-500">{pt.throughDate}</td>
                      <td className="py-1.5 px-3 text-right">{pt.ruleBrier.toFixed(4)}</td>
                      <td className="py-1.5 px-3 text-right text-blue-700">
                        {pt.neuralBrier.toFixed(4)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-emerald-700">
                        {pt.hybridBrier.toFixed(4)}
                      </td>
                      <td className="py-1.5 px-3 text-right">{pt.hybridAccuracyPct.toFixed(1)}%</td>
                      <td
                        className={`py-1.5 pl-3 text-right ${
                          idx === 0
                            ? 'text-slate-400'
                            : pt.brierImprovementVsInitialPct >= 0
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                        }`}
                      >
                        {idx === 0
                          ? 'Baseline'
                          : `${pt.brierImprovementVsInitialPct >= 0 ? '-' : '+'}${Math.abs(
                              pt.brierImprovementVsInitialPct
                            ).toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Main Split: Hyperparameters + Loss Curve & Learned Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Hyperparameters */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Neural Architecture &amp; Training Controls
            </h2>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="epochs-range" className="font-medium text-slate-700">
                  Training Epochs
                </label>
                <span className="font-mono tabular-nums text-slate-900">{hyperparams.epochs}</span>
              </div>
              <input
                id="epochs-range"
                type="range"
                min={20}
                max={250}
                step={10}
                value={hyperparams.epochs}
                onChange={(e) =>
                  onUpdateHyperparams({ ...hyperparams, epochs: Number(e.target.value) })
                }
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="lr-range" className="font-medium text-slate-700">
                  Learning Rate (Momentum SGD)
                </label>
                <span className="font-mono tabular-nums text-slate-900">
                  {hyperparams.learningRate.toFixed(3)}
                </span>
              </div>
              <input
                id="lr-range"
                type="range"
                min={0.005}
                max={0.12}
                step={0.005}
                value={hyperparams.learningRate}
                onChange={(e) =>
                  onUpdateHyperparams({ ...hyperparams, learningRate: Number(e.target.value) })
                }
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="alpha-range" className="font-medium text-slate-700">
                  Neural vs 8-Rule Blend (&alpha;)
                </label>
                <span className="font-mono tabular-nums text-slate-900">
                  {Math.round(hyperparams.neuralBlendAlpha * 100)}% Neural /{' '}
                  {Math.round((1 - hyperparams.neuralBlendAlpha) * 100)}% Rule
                </span>
              </div>
              <input
                id="alpha-range"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={hyperparams.neuralBlendAlpha}
                onChange={(e) =>
                  onUpdateHyperparams({
                    ...hyperparams,
                    neuralBlendAlpha: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label htmlFor="h1-select" className="block text-xs font-medium text-slate-700 mb-1">
                  Hidden Layer 1 Neurons
                </label>
                <select
                  id="h1-select"
                  value={hyperparams.hiddenLayer1Size}
                  onChange={(e) =>
                    onUpdateHyperparams({
                      ...hyperparams,
                      hiddenLayer1Size: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value={8}>8 units</option>
                  <option value={16}>16 units</option>
                  <option value={24}>24 units</option>
                  <option value={32}>32 units</option>
                </select>
              </div>
              <div>
                <label htmlFor="h2-select" className="block text-xs font-medium text-slate-700 mb-1">
                  Hidden Layer 2 Neurons
                </label>
                <select
                  id="h2-select"
                  value={hyperparams.hiddenLayer2Size}
                  onChange={(e) =>
                    onUpdateHyperparams({
                      ...hyperparams,
                      hiddenLayer2Size: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value={4}>4 units</option>
                  <option value={8}>8 units</option>
                  <option value={12}>12 units</option>
                  <option value={16}>16 units</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Sport distribution in active corpus:{' '}
              {ALL_SPORTS.map((s) => `${SPORT_LABELS[s]} ${report.sportCounts[s] ?? 0}`).join(' · ')}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRetrainFullCorpus}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            Train Neural Engine ({historicalRows.length} Active CSV Rows)
          </button>
        </div>

        {/* Right: Convergence SVG & Global Learned Rule Sensitivity */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Cross-Entropy Loss Convergence
              </h2>
              <p className="text-xs text-slate-500">
                Epoch 1 ({epochHistory[0]?.trainLoss.toFixed(4)}) &rarr; Epoch{' '}
                {epochHistory[epochHistory.length - 1]?.epoch} (
                {epochHistory[epochHistory.length - 1]?.trainLoss.toFixed(4)})
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-0.5 bg-blue-700 inline-block" /> Train Loss
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Holdout Val Loss
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-44 bg-slate-50/70 rounded-lg border border-slate-100"
              role="img"
              aria-label="Neural network training and validation loss curve"
            >
              {[0, 0.5, 1].map((t, idx) => {
                const yVal = minLoss + t * (maxLoss - minLoss);
                const y = toY(yVal);
                return (
                  <g key={idx}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartW - padX * 0.5}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={6}
                      y={y + 3}
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {yVal.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              {trainPoints && (
                <polyline
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.2"
                  points={trainPoints}
                />
              )}
              {valPoints && (
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  points={valPoints}
                />
              )}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900">
                Learned Neural Gradient Attribution Across the 8 Rules
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Normalized |∂P / ∂Rule|
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {RULE_KEYS.map((key, idx) => {
                const spec = SPORT_ADAPTED_RULES[SportId.Soccer][idx];
                const share = report.learnedFeatureImportance[key] ?? 0.125;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 truncate">
                        R{idx + 1}. {spec.universalName}
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {(share * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-700"
                        style={{ width: `${Math.min(100, share * 340)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive CSV Paste / Edit Sandbox & Sport Template Downloader */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Direct CSV Training Sandbox &amp; Schema Templates
            </h2>
            <p className="text-xs text-slate-500">
              Paste exported spreadsheet rows (date, sport, competition, selection, opponent, market, decimal_odds, is_home, r1_motivation..r8_coach_volatility, outcome) and train directly.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="template-sport-select" className="sr-only">
              Select CSV template sport
            </label>
            <select
              id="template-sport-select"
              value={templateSport}
              onChange={(e) => setTemplateSport(e.target.value as SportId | 'all')}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="all">All 6 Sports Template</option>
              {ALL_SPORTS.map((s) => (
                <option key={s} value={s}>
                  {SPORT_LABELS[s]} CSV Template
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          </div>
        </div>

        <label htmlFor="csv-sandbox-textarea" className="sr-only">
          Historical sports CSV rows
        </label>
        <textarea
          id="csv-sandbox-textarea"
          rows={7}
          value={csvEditorText}
          onChange={(e) => setCsvEditorText(e.target.value)}
          className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
          spellCheck={false}
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              setCsvEditorText(
                serializeHistoricalRowsToCSV(sampleMultiSportSlice(historicalRows, 5))
              )
            }
            className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
          >
            Load 30 Sample Multi-Sport Rows into Editor
          </button>
          <button
            type="button"
            onClick={handleTrainFromEditor}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            Validate &amp; Train on Pasted CSV
          </button>
        </div>
      </div>
    </div>
  );
};
