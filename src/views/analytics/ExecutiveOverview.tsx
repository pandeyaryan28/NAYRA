import React from 'react';
import {
  Clock,
  CheckSquare,
  Flame,
  Award,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { HStack, VStack } from '@/components/swiftui/SwiftUIStack';
import { TimeHorizon } from '@/views/AnalyticsView';
import { HORIZON_LABELS } from './AnalyticsHeader';
import { SystemHealthScore, AutomatedInsight, HorizonDelta, AnalyticsPerspective } from './types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';

interface ExecutiveOverviewProps {
  timeHorizon: TimeHorizon;
  activeTagFilter: string | null;
  horizonFocusSeconds: number;
  weekFocusSeconds: number;
  weekSessionsCount: number;
  totalSessionsCount: number;
  horizonPomodoroCount: number;
  streakDays: number;
  horizonCompletionRate: number;
  horizonCompletedTasks: number;
  horizonTotalTasks: number;
  habitCompletionsForHorizon: number;
  activeHabitsCount: number;
  averageHabitStreak: number;
  deltas: HorizonDelta;
  healthScores: SystemHealthScore[];
  automatedInsights: AutomatedInsight[];
  onSelectPerspective: (perspective: AnalyticsPerspective) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  timeHorizon,
  activeTagFilter,
  horizonFocusSeconds,
  weekFocusSeconds,
  weekSessionsCount,
  totalSessionsCount,
  horizonPomodoroCount,
  streakDays,
  horizonCompletionRate,
  horizonCompletedTasks,
  horizonTotalTasks,
  habitCompletionsForHorizon,
  activeHabitsCount,
  averageHabitStreak,
  deltas,
  healthScores,
  automatedInsights,
  onSelectPerspective,
}) => {
  return (
    <div className="space-y-6 card-enter">
      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card liquid-glass-interactive card-enter stagger-1">
          <HStack alignment="center" spacing={2} className="w-full justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              {timeHorizon === 'tomorrow' ? 'Total Focus Time (Projected)' : 'Total Focus Time'}
            </span>
            <Clock className="h-4 w-4 text-zinc-400" />
          </HStack>

          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {formatSecondsToHoursMinutes(
                timeHorizon === '7d' && !activeTagFilter ? weekFocusSeconds : horizonFocusSeconds
              )}
            </span>
            {timeHorizon !== 'tomorrow' && deltas.focusSecondsPercent !== 0 && (
              <span
                className={`text-[11px] font-mono font-medium flex items-center gap-0.5 ${
                  deltas.focusSecondsPercent > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400'
                }`}
                title={`Change compared to prior equivalent period (${deltas.focusSecondsPercent > 0 ? '+' : ''}${deltas.focusSecondsPercent}%)`}
              >
                {deltas.focusSecondsPercent > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {deltas.focusSecondsPercent > 0 ? `+${deltas.focusSecondsPercent}%` : `${deltas.focusSecondsPercent}%`}
                </span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-zinc-500 block truncate">
            {timeHorizon === 'tomorrow'
              ? 'Estimated for tomorrow tasks'
              : timeHorizon === '7d' && !activeTagFilter
              ? `This week (${weekSessionsCount} sessions • ${totalSessionsCount} all-time)`
              : `${HORIZON_LABELS[timeHorizon].title} (${horizonPomodoroCount} sessions • ${totalSessionsCount} all-time)`}
          </span>
        </div>

        {/* Task Velocity */}
        <div className="p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card liquid-glass-interactive card-enter stagger-2">
          <HStack alignment="center" spacing={2} className="w-full justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Task Velocity</span>
            <CheckSquare className="h-4 w-4 text-zinc-400" />
          </HStack>

          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {horizonCompletionRate}%
            </span>
            {timeHorizon !== 'tomorrow' && deltas.completedTasksPercent !== 0 && (
              <span
                className={`text-[11px] font-mono font-medium flex items-center gap-0.5 ${
                  deltas.completedTasksPercent > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400'
                }`}
                title={`Change in completed tasks vs prior period`}
              >
                {deltas.completedTasksPercent > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {deltas.completedTasksPercent > 0 ? `+${deltas.completedTasksPercent}%` : `${deltas.completedTasksPercent}%`}
                </span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-zinc-500 block truncate">
            {horizonCompletedTasks} completed / {horizonTotalTasks} scoped tasks
          </span>
        </div>

        {/* Habit Consistency */}
        <div className="p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card liquid-glass-interactive card-enter stagger-3">
          <HStack alignment="center" spacing={2} className="w-full justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Habit Adherence</span>
            <Flame className="h-4 w-4 text-zinc-400" />
          </HStack>

          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {timeHorizon === 'today' || timeHorizon === 'yesterday'
              ? `${habitCompletionsForHorizon}/${activeHabitsCount}`
              : `${averageHabitStreak} days`}
          </span>

          <span className="text-[10px] text-zinc-500 block truncate">
            {timeHorizon === 'today' || timeHorizon === 'yesterday'
              ? `Done on ${HORIZON_LABELS[timeHorizon].title}`
              : `Average streak across ${activeHabitsCount} habits`}
          </span>
        </div>

        {/* Pomodoros Completed */}
        <div className="p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card liquid-glass-interactive card-enter stagger-4">
          <HStack alignment="center" spacing={2} className="w-full justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Pomodoros Done</span>
            <Award className="h-4 w-4 text-zinc-400" />
          </HStack>

          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {horizonPomodoroCount} {timeHorizon === 'tomorrow' ? 'Planned' : 'Sessions'}
          </span>

          <span className="text-[10px] text-zinc-500 block truncate">
            Continuous streak: {streakDays} days
          </span>
        </div>
      </div>

      {/* Smart Automated Insights Grid */}
      {automatedInsights.length > 0 && (
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl space-y-3 card-enter">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Actionable Heuristic Insights
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {automatedInsights.length} operational indicators detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {automatedInsights.map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {ins.title}
                  </span>
                  {ins.metric && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shrink-0">
                      {ins.metric}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Operating System Balance (100% Real Live Computed Metrics) */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter stagger-4 interactive-card">
        <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Personal Operating System Balance
            </h3>
            <p className="text-xs text-zinc-400">
              Cross-domain performance health check.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Computed from active database
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthScores.map((h) => (
            <div
              key={h.id}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {h.label}
                </span>
                <Badge variant={h.variant}>{h.statusText}</Badge>
              </div>

              {/* Score bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Score</span>
                  <span>{h.score}/100</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-sm overflow-hidden">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ${
                      h.score >= 80
                        ? 'bg-emerald-500'
                        : h.score >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${h.score}%` }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {h.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Quick-Jumps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSelectPerspective('focus')}
          className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all swiftui-press"
        >
          <Clock className="w-4 h-4 text-sky-500 mb-2" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Focus Lab
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Heatmap & hourly flow
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPerspective('tasks')}
          className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all swiftui-press"
        >
          <CheckSquare className="w-4 h-4 text-emerald-500 mb-2" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Tasks & Velocity
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Tags & priority analysis
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPerspective('habits')}
          className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all swiftui-press"
        >
          <Flame className="w-4 h-4 text-amber-500 mb-2" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Habits & Streaks
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Consistency leaderboard
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPerspective('nutrition')}
          className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all swiftui-press"
        >
          <TrendingUp className="w-4 h-4 text-purple-500 mb-2" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Nutrition & Fuel
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Calorie & macro split
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPerspective('ca')}
          className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-left transition-all swiftui-press"
        >
          <Award className="w-4 h-4 text-blue-500 mb-2" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            CA Foundation
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Syllabus & mock tests
          </span>
        </button>
      </div>
    </div>
  );
};
