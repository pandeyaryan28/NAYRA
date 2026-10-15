import React from 'react';
import { Filter, X, LayoutDashboard, Clock, CheckSquare, Flame, UtensilsCrossed, BookOpen } from 'lucide-react';
import { AnalyticsPerspective } from './types';

interface AnalyticsFilterBarProps {
  activePerspective: AnalyticsPerspective;
  setActivePerspective: (perspective: AnalyticsPerspective) => void;
  availableTags: [string, number][];
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  totalTaskCount: number;
}

const PERSPECTIVES: Array<{
  id: AnalyticsPerspective;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'focus', label: 'Focus Lab', icon: Clock },
  { id: 'tasks', label: 'Tasks & Velocity', icon: CheckSquare },
  { id: 'habits', label: 'Habits & Streaks', icon: Flame },
  { id: 'nutrition', label: 'Nutrition & Fuel', icon: UtensilsCrossed },
  { id: 'ca', label: 'CA Foundation', icon: BookOpen },
];

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  activePerspective,
  setActivePerspective,
  availableTags,
  activeTagFilter,
  setActiveTagFilter,
  totalTaskCount,
}) => {
  return (
    <div className="space-y-3 card-enter">
      {/* Domain Perspective Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 overflow-x-auto no-scrollbar">
        {PERSPECTIVES.map((p) => {
          const isActive = activePerspective === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePerspective(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 swiftui-press ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Tag Filter Bar */}
      <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-sky-500" />
            <span>Filter by Tag:</span>
            {activeTagFilter ? (
              <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 ml-1">
                Active: [{activeTagFilter}]
              </span>
            ) : (
              <span className="text-zinc-400 font-normal ml-1">Showing all activities</span>
            )}
          </div>

          {activeTagFilter && (
            <button
              type="button"
              onClick={() => setActiveTagFilter(null)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 hover:underline swiftui-press"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <button
            type="button"
            onClick={() => setActiveTagFilter(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 swiftui-press ${
              activeTagFilter === null
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Tags ({totalTaskCount})
          </button>

          {availableTags.map(([tag, count]) => {
            const isSelected = activeTagFilter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTagFilter(isSelected ? null : tag)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all duration-150 swiftui-press ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="text-[10px] opacity-60">tag:</span>
                <span>{tag}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}

          {availableTags.length === 0 && (
            <span className="text-xs text-zinc-400 italic">No tags created yet.</span>
          )}
        </div>
      </div>
    </div>
  );
};
