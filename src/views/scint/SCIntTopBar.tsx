import React from 'react';
import { Cpu, Sun, BatteryCharging, Mountain, Search, ChevronRight } from 'lucide-react';
import { SovereignSectorId, SovereignSectorMeta } from '@/types';
import { SOVEREIGN_SECTORS } from '@/data/scintData';

interface SCIntTopBarProps {
  currentSector: SovereignSectorId;
  onSelectSector: (sector: SovereignSectorId) => void;
  currentStep: 1 | 2 | 3;
  onNavigateStep: (step: 1 | 2 | 3) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStageName?: string;
  selectedPlaybookName?: string;
}

export const SCIntTopBar: React.FC<SCIntTopBarProps> = ({
  currentSector,
  onSelectSector,
  currentStep,
  onNavigateStep,
  searchQuery,
  onSearchChange,
  selectedStageName,
  selectedPlaybookName,
}) => {
  const getSectorIcon = (id: SovereignSectorId) => {
    switch (id) {
      case 'semiconductor':
        return <Cpu className="w-4 h-4 text-sky-500" />;
      case 'solar':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'batteries':
        return <BatteryCharging className="w-4 h-4 text-emerald-500" />;
      case 'minerals':
        return <Mountain className="w-4 h-4 text-purple-500" />;
    }
  };

  const activeSectorData = SOVEREIGN_SECTORS.find((s) => s.id === currentSector) || SOVEREIGN_SECTORS[0];

  return (
    <header className="space-y-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
      {/* Top Bar: Sector Selector & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold">
              Sovereign Industrial Intelligence Studio
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Venture Diligence Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              SCInt Studio
            </h1>

            {/* First-Class Multi-Sector Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              {getSectorIcon(currentSector)}
              <select
                value={currentSector}
                onChange={(e) => onSelectSector(e.target.value as SovereignSectorId)}
                className="bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-2"
                aria-label="Select Sovereign Industrial Sector"
              >
                {SOVEREIGN_SECTORS.map((sec) => (
                  <option key={sec.id} value={sec.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {sec.name} {sec.status === 'coming-soon' ? '(Roadmap)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {activeSectorData.tagline}
          </p>
        </div>

        {/* Global Search Bar (Large, Legible) */}
        <div className="relative max-w-sm w-full self-start md:self-auto">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search playbooks, minerals, buyers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-sm"
          />
        </div>
      </div>

      {/* Apple-style 3-Step Guided Breadcrumb Bar */}
      {currentSector === 'semiconductor' && (
        <nav
          className="flex items-center gap-2 pt-2 text-sm font-medium overflow-x-auto"
          aria-label="Guided Journey Steps"
        >
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => onNavigateStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span className="font-mono text-xs">Step 1</span>
            <span>Value Chain Stage</span>
          </button>

          <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => onNavigateStep(2)}
            disabled={currentStep < 2}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              currentStep === 2
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-sm'
                : currentStep > 2
                ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="font-mono text-xs">Step 2</span>
            <span>{selectedStageName ? selectedStageName : 'Venture Playbook'}</span>
          </button>

          <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => onNavigateStep(3)}
            disabled={currentStep < 3}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              currentStep === 3
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-sm'
                : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="font-mono text-xs">Step 3</span>
            <span>{selectedPlaybookName ? 'Executive Dossier' : 'Diligence Dossier'}</span>
          </button>
        </nav>
      )}
    </header>
  );
};
