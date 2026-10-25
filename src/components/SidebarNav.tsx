import React from 'react';
import {
  BarChart3,
  BookOpen,
  BookmarkCheck,
  BrainCircuit,
  ClipboardCheck,
  Database,
  X,
} from 'lucide-react';

export type WorkspaceSection =
  | 'daily-bets'
  | 'daily-audit'
  | 'neural-lab'
  | 'rules-matrix'
  | 'intelligence-json'
  | 'portfolio';

interface SidebarNavProps {
  activeSection: WorkspaceSection;
  onSelectSection: (section: WorkspaceSection) => void;
  trackedCount: number;
  readyAuditCount: number;
  trainedRowsCount: number;
  hybridAccuracy: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: {
  id: WorkspaceSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'daily-bets', label: 'Daily Top 10 Bets', icon: BarChart3 },
  { id: 'daily-audit', label: "Yesterday's Audit", icon: ClipboardCheck },
  { id: 'neural-lab', label: 'CSV Neural Lab', icon: BrainCircuit },
  { id: 'rules-matrix', label: '8-Rule Sport Dynamics', icon: BookOpen },
  { id: 'intelligence-json', label: 'Intelligence Matrices', icon: Database },
  { id: 'portfolio', label: 'Tracked Bet Slip', icon: BookmarkCheck },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  onSelectSection,
  trackedCount,
  readyAuditCount,
  trainedRowsCount,
  hybridAccuracy,
  mobileOpen,
  onCloseMobile,
}) => {
  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <a
          href="#daily-bets"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('daily-bets');
            onCloseMobile();
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          OctaNet Sports
        </a>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav aria-label="Workspace navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSection(item.id);
                onCloseMobile();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'daily-audit' && readyAuditCount > 0 && (
                <span className="font-mono text-xs tabular-nums text-blue-700 font-semibold">
                  {readyAuditCount}
                </span>
              )}
              {item.id === 'portfolio' && trackedCount > 0 && (
                <span className="font-mono text-xs tabular-nums text-blue-700 font-semibold">
                  {trackedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span>CSV Training Corpus</span>
          <span className="font-mono tabular-nums font-medium text-slate-900">
            {trainedRowsCount} matches
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Validation Accuracy</span>
          <span className="font-mono tabular-nums font-medium text-emerald-700">
            {(hybridAccuracy * 100).toFixed(1)}%
          </span>
        </div>
        <div className="pt-2 border-t border-slate-100 text-slate-500 leading-relaxed">
          6 sports · 10 daily picks per discipline · 8-rule MLP hybrid
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {renderNavContent()}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[82vw] h-full z-10">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
