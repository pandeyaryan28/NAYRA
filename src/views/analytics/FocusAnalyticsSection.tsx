import React, { useState } from 'react';
import { Clock, ShieldCheck, AlertCircle, TrendingUp, BarChart2 } from 'lucide-react';
import { TimeHorizon } from '@/views/AnalyticsView';
import { HORIZON_LABELS } from './AnalyticsHeader';
import { DayFocusItem, HourlyFocusItem } from './types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import { TaskItem, FocusSession } from '@/types';

interface FocusAnalyticsSectionProps {
  timeHorizon: TimeHorizon;
  maxFocusSec: number;
  past7DaysFocus: DayFocusItem[];
  singleDayHourlyDistribution: HourlyFocusItem[];
  tomorrowProjectedBlocks: Array<{ key: string; label: string; count: number }>;
  tomorrowTasksCount: number;
  tomorrowStr: string;
  tagScopedTasks: TaskItem[];
  tagScopedSessions: FocusSession[];
}

export const FocusAnalyticsSection: React.FC<FocusAnalyticsSectionProps> = ({
  timeHorizon,
  maxFocusSec,
  past7DaysFocus,
  singleDayHourlyDistribution,
  tomorrowProjectedBlocks,
  tomorrowTasksCount,
  tagScopedTasks,
  tagScopedSessions,
}) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Quality metrics
  const focusOnlySessions = tagScopedSessions.filter((s) => s.mode === 'focus');
  const totalSessions = focusOnlySessions.length;
  const uninterruptedSessions = focusOnlySessions.filter((s) => !s.interrupted).length;
  const interruptedSessions = totalSessions - uninterruptedSessions;
  const uninterruptedRate = totalSessions > 0 ? Math.round((uninterruptedSessions / totalSessions) * 100) : 100;

  const totalFocusSeconds = focusOnlySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalFocusSeconds / totalSessions / 60) : 0;
  const longestSessionSeconds = focusOnlySessions.reduce((max, s) => Math.max(max, s.durationSeconds), 0);

  // Calculate average daily focus for baseline line in 7-day chart
  const averageDailySeconds =
    past7DaysFocus.length > 0
      ? Math.round(past7DaysFocus.reduce((sum, d) => sum + d.totalSeconds, 0) / past7DaysFocus.length)
      : 0;
  const avgHeightPercent =
    maxFocusSec > 0 ? Math.min(100, Math.round((averageDailySeconds / maxFocusSec) * 100)) : 0;

  return (
    <div className="space-y-6 card-enter">
      {/* Dynamic Distribution Chart Section */}
      <div className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl p-5 space-y-4 card-enter stagger-2 interactive-card apple-card-surface liquid-glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {timeHorizon === 'today'
                ? "Today's Hourly Deep Work Distribution"
                : timeHorizon === 'yesterday'
                ? "Yesterday's Hourly Deep Work Distribution"
                : timeHorizon === 'tomorrow'
                ? "Tomorrow's Scheduled Task Workload by Priority"
                : timeHorizon === '7d'
                ? "7-Day Deep Work Distribution"
                : `${HORIZON_LABELS[timeHorizon].title} Focus Work Distribution`}
            </h3>
            <p className="text-xs text-zinc-400">
              {timeHorizon === 'tomorrow'
                ? "Breakdown of scheduled tasks due tomorrow ready for tomorrow's study session."
                : 'Deep work distribution tracked via Pomodoro engine.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {timeHorizon === '7d' && averageDailySeconds > 0 && (
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
                Avg: {(averageDailySeconds / 3600).toFixed(1)}h/day
              </span>
            )}
            <span className="text-xs font-mono text-zinc-500">
              {timeHorizon === 'tomorrow'
                ? `${tomorrowTasksCount} tasks scheduled`
                : `Peak: ${(maxFocusSec / 3600).toFixed(1)}h`}
            </span>
          </div>
        </div>

        {/* Chart View */}
        {timeHorizon === 'tomorrow' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            {tomorrowProjectedBlocks.map((b) => (
              <div
                key={b.key}
                className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-1 text-center"
              >
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">{b.label}</span>
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                  {b.count}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {b.count === 1 ? 'task scheduled' : 'tasks scheduled'}
                </span>
              </div>
            ))}
          </div>
        ) : timeHorizon === 'today' || timeHorizon === 'yesterday' ? (
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 sm:px-4 relative">
            {singleDayHourlyDistribution.map((b) => {
              const heightPercent =
                maxFocusSec > 0 ? Math.min(100, Math.round((b.totalSeconds / maxFocusSec) * 100)) : 0;
              const isHovered = hoveredBar === b.label;
              return (
                <div
                  key={b.label}
                  onMouseEnter={() => setHoveredBar(b.label)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  {isHovered && b.totalSeconds > 0 && (
                    <div className="absolute -top-10 px-2 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-mono whitespace-nowrap shadow-md z-10 animate-in fade-in zoom-in-95">
                      {b.name}: {formatSecondsToHoursMinutes(b.totalSeconds)} ({b.pomodoroCount} sessions)
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                    {b.totalSeconds > 0 ? `${b.hours}h` : ''}
                  </span>
                  <div className="w-full max-w-[42px] bg-zinc-100 dark:bg-zinc-800 rounded-t-sm flex items-end h-full">
                    <div
                      className={`w-full rounded-t-sm chart-bar-animated ${
                        b.totalSeconds > 0
                          ? 'bg-zinc-900 dark:bg-zinc-100 group-hover:bg-sky-600 dark:group-hover:bg-sky-400 transition-colors'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-center font-mono">
                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 block">
                      {b.label}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">{b.pomodoroCount}p</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 sm:px-4 relative">
            {/* Baseline reference line for 7-day average */}
            {averageDailySeconds > 0 && (
              <div
                className="absolute left-0 right-0 border-b border-dashed border-zinc-300 dark:border-zinc-700 pointer-events-none z-0"
                style={{ bottom: `calc(${avgHeightPercent}% + 36px)` }}
                title={`Daily Average: ${(averageDailySeconds / 3600).toFixed(1)}h`}
              />
            )}

            {past7DaysFocus.map((d) => {
              const heightPercent = Math.min(100, Math.round((d.totalSeconds / maxFocusSec) * 100));
              const isHovered = hoveredBar === d.dateStr;
              return (
                <div
                  key={d.dateStr}
                  onMouseEnter={() => setHoveredBar(d.dateStr)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer z-10"
                >
                  {/* Tooltip on hover */}
                  {isHovered && d.totalSeconds > 0 && (
                    <div className="absolute -top-10 px-2 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-mono whitespace-nowrap shadow-md z-20 animate-in fade-in zoom-in-95">
                      {d.dateStr}: {formatSecondsToHoursMinutes(d.totalSeconds)} ({d.pomodoroCount} sessions)
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    {d.totalSeconds > 0 ? `${d.hours}h` : ''}
                  </span>
                  <div className="w-full max-w-[48px] bg-zinc-100 dark:bg-zinc-800 rounded-t-sm flex items-end h-full">
                    <div
                      className={`w-full rounded-t-sm chart-bar-animated ${
                        d.totalSeconds > 0
                          ? 'bg-zinc-900 dark:bg-zinc-100 group-hover:bg-sky-600 dark:group-hover:bg-sky-400 transition-colors'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-center font-mono">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                      {d.dayName}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">{d.pomodoroCount} p</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Focus Quality & Flow Integrity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              Flow Completion Rate
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {totalSessions > 0 ? `${uninterruptedRate}% flow` : '--'}
          </span>
          <span className="text-[10px] text-zinc-500 block">
            {uninterruptedSessions} of {totalSessions} sessions completed without pause
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              Average Session Length
            </span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {avgSessionMinutes > 0 ? `${avgSessionMinutes} min` : '--'}
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Target default: 25 minutes
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              Longest Continuous Session
            </span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {longestSessionSeconds > 0 ? `${Math.round(longestSessionSeconds / 60)} min` : '--'}
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Peak uninterrupted focus duration
          </span>
        </div>
      </div>
    </div>
  );
};
