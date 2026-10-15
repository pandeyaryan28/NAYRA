import React, { useState } from 'react';
import { Activity, Copy, Check, Download } from 'lucide-react';
import { TimeHorizon } from '@/views/AnalyticsView';

interface AnalyticsHeaderProps {
  timeHorizon: TimeHorizon;
  setTimeHorizon: (horizon: TimeHorizon) => void;
  activeTagFilter: string | null;
  onCopyReport: () => void;
  onExportJson: () => void;
}

export const HORIZON_LABELS: Record<TimeHorizon, { title: string; subtitle: string }> = {
  today: { title: 'Today', subtitle: 'Live activity and progress for today' },
  yesterday: { title: 'Yesterday', subtitle: 'Accomplishments and focus summary from yesterday' },
  tomorrow: { title: 'Tomorrow', subtitle: 'Forward schedule and workload projection for tomorrow' },
  '7d': { title: 'Last 7 Days', subtitle: 'Rolling 7-day deep work and execution velocity' },
  '30d': { title: 'Last 30 Days', subtitle: 'Monthly consistency and task velocity review' },
  all: { title: 'All Time', subtitle: 'Lifetime productivity and execution telemetry' },
};

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  timeHorizon,
  setTimeHorizon,
  activeTagFilter,
  onCopyReport,
  onExportJson,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyReport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const horizons: TimeHorizon[] = ['today', 'yesterday', 'tomorrow', '7d', '30d', 'all'];

  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 card-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-500" />
            <span>Productivity & Execution Analytics</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {HORIZON_LABELS[timeHorizon].subtitle}
            {activeTagFilter && (
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 ml-1">
                (filtered by tag: {activeTagFilter})
              </span>
            )}
          </p>
        </div>

        {/* Action Utilities (Copy Report & Export JSON) */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs transition-colors swiftui-press"
            title="Copy executive summary report to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs transition-colors swiftui-press"
            title="Download full analytics dataset as JSON"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Time Horizon Segmented Control */}
      <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center overflow-x-auto no-scrollbar max-w-full">
        {horizons.map((h) => {
          const isActive = timeHorizon === h;
          return (
            <button
              key={h}
              type="button"
              onClick={() => setTimeHorizon(h)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-150 swiftui-press ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/[0.04]'
              }`}
              aria-pressed={isActive}
            >
              {HORIZON_LABELS[h].title}
            </button>
          );
        })}
      </div>
    </div>
  );
};
