import React, { useState } from 'react';
import { ScintDataProvider, useScintData } from './context/ScintDataContext';
import { BlueprintsView } from './components/blueprints/BlueprintsView';
import { SupplyChainExplorerView } from './components/explorer/SupplyChainExplorerView';
import { SubsidyCalculatorView } from './components/calculator/SubsidyCalculatorView';
import { HubsMatrixView } from './components/hubs/HubsMatrixView';
import { MarketIntelligenceView } from './components/intelligence/MarketIntelligenceView';
import type { NavigationSubTab } from './types/index';
import { 
  Cpu, 
  Layers, 
  GitBranch, 
  Calculator, 
  Building2, 
  BarChart3, 
  Printer, 
  Download,
  ShieldCheck
} from 'lucide-react';

const SUB_NAV_ITEMS: { id: NavigationSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'blueprints', label: 'Venture Blueprints', icon: Layers },
  { id: 'explorer', label: 'Supply Chain Matrix', icon: GitBranch },
  { id: 'calculator', label: 'Subsidy Calculator', icon: Calculator },
  { id: 'hubs', label: 'Semicon Hubs', icon: Building2 },
  { id: 'intelligence', label: 'Market Intelligence', icon: BarChart3 },
];

const ScintEngineContent: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<NavigationSubTab>('blueprints');
  const { exportFullDatasetJson, selectBlueprint, backendStatus } = useScintData();

  const handleNavigateToBlueprint = (nodeId: string) => {
    selectBlueprint(nodeId);
    setActiveSubTab('blueprints');
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Secondary Navigation Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100 shrink-0">
              <div className="w-5 h-5 rounded-md bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shadow-2xs">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">CHIPCHAIN 360</span>
            </div>

            {SUB_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-zinc-900' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* Status Indicator (Clean, non-pulsing) */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium select-none"
              title="ChipChain 360 Engine Operational • 34 Nodes Online"
            >
              <span className="w-1.5 h-1.5 rounded-xs bg-emerald-500" />
              <span className="text-[11px] font-mono">ISM 2.0 Active</span>
            </div>

            {/* Print / PDF view */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 cursor-pointer"
              title="Print Dossier / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Export JSON dataset */}
            <button
              onClick={exportFullDatasetJson}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer"
              title="Export Full 34-Node Intelligence Dataset (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sub-view Content Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
        {activeSubTab === 'blueprints' && <BlueprintsView />}
        {activeSubTab === 'explorer' && (
          <SupplyChainExplorerView onNavigateToBlueprint={handleNavigateToBlueprint} />
        )}
        {activeSubTab === 'calculator' && <SubsidyCalculatorView />}
        {activeSubTab === 'hubs' && <HubsMatrixView />}
        {activeSubTab === 'intelligence' && <MarketIntelligenceView />}
      </div>
    </div>
  );
};

export const ScintEngineView: React.FC = () => {
  return (
    <ScintDataProvider>
      <ScintEngineContent />
    </ScintDataProvider>
  );
};

export default ScintEngineView;
