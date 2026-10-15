import React from 'react';
import { Compass, Cpu, Sliders, MapPin, Search } from 'lucide-react';
import { SCIntHubId } from '@/types';

interface SCIntHeaderProps {
  activeHub: SCIntHubId;
  onSelectHub: (hub: SCIntHubId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  capexScale: 'modular' | 'benchmark';
  onScaleChange: (scale: 'modular' | 'benchmark') => void;
}

export const SCIntHeader: React.FC<SCIntHeaderProps> = ({
  activeHub,
  onSelectHub,
  searchQuery,
  onSearchChange,
  capexScale,
  onScaleChange,
}) => {
  const hubs: { id: SCIntHubId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'journey', label: 'Value Chain', icon: Compass },
    { id: 'blueprints', label: 'Venture Studio', icon: Cpu },
    { id: 'subsidies', label: 'CapEx Lab', icon: Sliders },
    { id: 'clusters', label: 'Industrial Hubs', icon: MapPin },
  ];

  return (
    <div className="space-y-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
      {/* Top Bar: Title & Primary Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold">
              Sovereign Industrial Intelligence
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              34-Node Semiconductor Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
            SCInt Studio
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Techno-economic diligence framework modeling India's semiconductor ecosystem — from mined ores to packaged silicon.
          </p>
        </div>

        {/* Global Scale Switcher (Modular vs Benchmark) */}
        <div className="flex items-center self-start md:self-auto gap-2">
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:inline">
            Model Scale:
          </span>
          <div className="flex items-center p-1 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-zinc-100/80 dark:bg-zinc-900/80">
            <button
              type="button"
              onClick={() => onScaleChange('modular')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                capexScale === 'modular'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Modular Scale
            </button>
            <button
              type="button"
              onClick={() => onScaleChange('benchmark')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                capexScale === 'benchmark'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Benchmark Scale
            </button>
          </div>
        </div>
      </div>

      {/* Apple-style Segmented Hub Bar & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* 4 Studio Hubs Segmented Control */}
        <nav
          className="flex items-center p-1 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-zinc-100/90 dark:bg-zinc-900/90 gap-1 overflow-x-auto"
          aria-label="SCInt Studio Hubs"
        >
          {hubs.map((hub) => {
            const Icon = hub.icon;
            const isActive = activeHub === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => onSelectHub(hub.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-500' : 'text-zinc-400'}`} />
                <span>{hub.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search nodes, minerals, machinery..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8.5 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>
    </div>
  );
};
