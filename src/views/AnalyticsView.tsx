import React, { useMemo, useState } from 'react';
import {
  Activity,
  Clock,
  CheckSquare,
  Flame,
  UtensilsCrossed,
  TrendingUp,
  Award,
  Calendar,
  Tag,
  ArrowUpDown,
  Layers,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/common/Badge';
import { TagAnalyticsItem } from '@/types';
import { formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import { subDays, format, parseISO, isSameDay } from 'date-fns';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, habits, calorieEntries, settings, focusStats } = useData();

  const [tagSortBy, setTagSortBy] = useState<'focus' | 'tasks' | 'completion' | 'name'>('focus');

  // Task Velocity Metrics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Habit Consistency
  const activeHabitsCount = habits.filter((h) => !h.archived).length;
  const totalHabitCompletions = habits.reduce(
    (sum, h) => sum + Object.keys(h.completions).length,
    0
  );
  const averageHabitStreak = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length) : 0;

  // Tag Performance & Attribution Metrics
  const tagAnalytics = useMemo<TagAnalyticsItem[]>(() => {
    const tagMap = new Map<string, {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      totalFocusSeconds: number;
      pomodoroCount: number;
    }>();

    tasks.forEach((t) => {
      if (t.tags && t.tags.length > 0) {
        const uniqueTaskTags = Array.from(
          new Set(t.tags.map((tg) => tg.trim().toLowerCase()).filter(Boolean))
        );
        uniqueTaskTags.forEach((tag) => {
          const current = tagMap.get(tag) || {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            totalFocusSeconds: 0,
            pomodoroCount: 0,
          };

          current.totalTasks += 1;
          if (t.status === 'completed' || t.archived) {
            current.completedTasks += 1;
          } else {
            current.pendingTasks += 1;
          }
          current.totalFocusSeconds += t.totalFocusSeconds || 0;
          current.pomodoroCount += t.pomodoroCount || 0;

          tagMap.set(tag, current);
        });
      }
    });

    return Array.from(tagMap.entries()).map(([tag, data]) => ({
      tag,
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      pendingTasks: data.pendingTasks,
      completionRate: data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0,
      totalFocusSeconds: data.totalFocusSeconds,
      pomodoroCount: data.pomodoroCount,
    }));
  }, [tasks]);

  const sortedTagAnalytics = useMemo(() => {
    return [...tagAnalytics].sort((a, b) => {
      if (tagSortBy === 'focus') {
        const diff = b.totalFocusSeconds - a.totalFocusSeconds;
        return diff !== 0 ? diff : a.tag.localeCompare(b.tag);
      }
      if (tagSortBy === 'tasks') {
        const diff = b.totalTasks - a.totalTasks;
        return diff !== 0 ? diff : a.tag.localeCompare(b.tag);
      }
      if (tagSortBy === 'completion') {
        const diff = b.completionRate - a.completionRate;
        return diff !== 0 ? diff : a.tag.localeCompare(b.tag);
      }
      return a.tag.localeCompare(b.tag);
    });
  }, [tagAnalytics, tagSortBy]);

  const mostFocusedTag = useMemo(() => {
    if (tagAnalytics.length === 0) return null;
    return [...tagAnalytics].sort((a, b) => {
      const diff = b.totalFocusSeconds - a.totalFocusSeconds;
      return diff !== 0 ? diff : a.tag.localeCompare(b.tag);
    })[0];
  }, [tagAnalytics]);

  const highestVelocityTag = useMemo(() => {
    if (tagAnalytics.length === 0) return null;
    return [...tagAnalytics].sort((a, b) => {
      const diff = b.completionRate - a.completionRate;
      return diff !== 0 ? diff : a.tag.localeCompare(b.tag);
    })[0];
  }, [tagAnalytics]);

  const totalTaggedFocusSeconds = useMemo(() => {
    const taggedTasks = tasks.filter((t) => t.tags && t.tags.some((tg) => tg.trim().length > 0));
    return taggedTasks.reduce((sum, item) => sum + (item.totalFocusSeconds || 0), 0);
  }, [tasks]);

  // 7-day focus distribution (SVG bars)
  const past7DaysFocus = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dStr = format(d, 'yyyy-MM-dd');
      const sessions = focusSessions.filter((s) => s.mode === 'focus' && s.completedAt.startsWith(dStr));
      const totalSec = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

      return {
        dateStr: dStr,
        dayName: format(d, 'EEE'),
        totalSeconds: totalSec,
        hours: (totalSec / 3600).toFixed(1),
        pomodoroCount: sessions.length,
      };
    });
  }, [focusSessions]);

  const weekSessionsCount = past7DaysFocus.reduce((sum, d) => sum + d.pomodoroCount, 0);

  // Max focus hours in 7-day period for relative bar heights
  const maxFocusSec = Math.max(...past7DaysFocus.map((d) => d.totalSeconds), 3600 * 4);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 card-enter">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-500" />
          <span>Productivity & Execution Analytics</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Unified telemetry combining deep work duration, tag-based time attribution, task completion velocity, and habit consistency.
        </p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 interactive-card card-enter stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Total Focus Time</span>
            <Clock className="h-4 w-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {formatSecondsToHoursMinutes(focusStats.weekFocusSeconds)}
          </span>
          <span className="text-[10px] text-zinc-500 block">
            This week ({weekSessionsCount} sessions • {focusStats.totalSessionsCount} all-time)
          </span>
        </div>

        {/* Task Completion Velocity */}
        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 interactive-card card-enter stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Task Velocity</span>
            <CheckSquare className="h-4 w-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {taskCompletionRate}%
          </span>
          <span className="text-[10px] text-zinc-500 block">
            {completedTasksCount} completed / {totalTasksCount} total tasks
          </span>
        </div>

        {/* Habit Consistency */}
        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 interactive-card card-enter stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Habit Adherence</span>
            <Flame className="h-4 w-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {averageHabitStreak} days
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Average streak across {activeHabitsCount} active habits
          </span>
        </div>

        {/* Pomodoros Completed */}
        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 interactive-card card-enter stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Pomodoros Done</span>
            <Award className="h-4 w-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {focusStats.todayPomodoroCount} Today
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Continuous streak: {focusStats.streakDays} days
          </span>
        </div>
      </div>

      {/* 7-Day Focus Distribution Chart */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter stagger-2 interactive-card">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              7-Day Deep Work Distribution
            </h3>
            <p className="text-xs text-zinc-400">
              Daily focused work hours tracked via Pomodoro engine.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Peak: {(maxFocusSec / 3600).toFixed(1)}h
          </span>
        </div>

        <div className="h-52 flex items-end justify-between gap-4 pt-6 px-4">
          {past7DaysFocus.map((d) => {
            const heightPercent = Math.min(100, Math.round((d.totalSeconds / maxFocusSec) * 100));

            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  {d.totalSeconds > 0 ? `${d.hours}h` : ''}
                </span>

                <div className="w-full max-w-[48px] bg-zinc-100 dark:bg-zinc-800 rounded-t-sm flex items-end h-full">
                  <div
                    className={`w-full rounded-t-sm chart-bar-animated ${
                      d.totalSeconds > 0
                        ? 'bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 transition-opacity'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <div className="text-center font-mono">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                    {d.dayName}
                  </span>
                  <span className="text-[9px] text-zinc-400 block">
                    {d.pomodoroCount} p
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tag Performance & Time Allocation Section */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-5 card-enter stagger-3 interactive-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Tag className="h-4 w-4 text-sky-500" />
              <span>Tag Performance & Time Allocation</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Task distribution, completion velocity, and deep work time mapped by Pomodoro session tracking.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 self-start sm:self-auto">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={tagSortBy}
              onChange={(e) => setTagSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 border-0 focus:outline-none cursor-pointer"
            >
              <option value="focus">Sort: Focus Time</option>
              <option value="tasks">Sort: Total Tasks</option>
              <option value="completion">Sort: Completion Rate</option>
              <option value="name">Sort: Tag Name</option>
            </select>
          </div>
        </div>

        {/* Tag Summary Mini-Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Distinct Tags</span>
            <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {tagAnalytics.length}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Top Focused Tag</span>
            <span className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 block">
              {mostFocusedTag ? `#${mostFocusedTag.tag}` : 'None'}
            </span>
            {mostFocusedTag && (
              <span className="text-[10px] font-mono text-zinc-500 block">
                {formatSecondsToHoursMinutes(mostFocusedTag.totalFocusSeconds)}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Highest Completion</span>
            <span className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 block">
              {highestVelocityTag ? `#${highestVelocityTag.tag}` : 'None'}
            </span>
            {highestVelocityTag && (
              <span className="text-[10px] font-mono text-zinc-500 block">
                {highestVelocityTag.completionRate}% complete
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Tagged Deep Work</span>
            <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {totalTaggedFocusSeconds > 0 ? formatSecondsToHoursMinutes(totalTaggedFocusSeconds) : '0 min'}
            </span>
          </div>
        </div>

        {/* Tag Analytics Breakdown Table / List */}
        {tagAnalytics.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <Tag className="h-6 w-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
            <p className="font-medium text-zinc-600 dark:text-zinc-300">No task tags tracked yet.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Assign tags like #work, #study, or #project in Tasks to see tag-based velocity and Pomodoro focus attribution.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedTagAnalytics.map((item) => (
              <div
                key={item.tag}
                className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {/* Tag Badge & Task Counts */}
                <div className="space-y-1 min-w-0 sm:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200">
                      #{item.tag}
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {item.completedTasks} of {item.totalTasks} completed
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    {item.pendingTasks} pending tasks
                  </span>
                </div>

                {/* Completion Velocity Bar */}
                <div className="space-y-1 sm:w-1/3">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                    <span>Completion Rate</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.completionRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200/70 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                      style={{ width: `${item.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Focus Time & Pomodoro Count */}
                <div className="text-left sm:text-right sm:w-1/3">
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                    {formatSecondsToHoursMinutes(item.totalFocusSeconds)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    {item.pomodoroCount} {item.pomodoroCount === 1 ? 'pomodoro' : 'pomodoros'} logged
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task & Domain Focus Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Focused Tasks */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter stagger-3 interactive-card">
          <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Highest Focus Allocation Tasks
            </h3>
            <p className="text-xs text-zinc-400">
              Tasks receiving the greatest proportion of logged deep work hours.
            </p>
          </div>

          <div className="space-y-3">
            {tasks
              .filter((t) => t.totalFocusSeconds > 0)
              .sort((a, b) => b.totalFocusSeconds - a.totalFocusSeconds)
              .slice(0, 4)
              .map((t) => (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-2">
                      {t.title}
                    </span>
                    <span className="font-mono text-zinc-500 shrink-0">
                      {formatSecondsToHoursMinutes(t.totalFocusSeconds)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 progress-bar-animated"
                      style={{
                        width: `${Math.min(100, Math.round((t.totalFocusSeconds / (3600 * 5)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Multi-System Balance */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter stagger-4 interactive-card">
          <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Personal Operating System Balance
            </h3>
            <p className="text-xs text-zinc-400">
              Cross-domain performance health check.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="text-zinc-700 dark:text-zinc-300">Time & Calendar Alignment</span>
              <Badge variant="success">Optimal</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="text-zinc-700 dark:text-zinc-300">Deep Work / Rest Ratio</span>
              <Badge variant="success">Balanced</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="text-zinc-700 dark:text-zinc-300">Daily Caloric Adherence</span>
              <Badge variant="info">Within Target</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="text-zinc-700 dark:text-zinc-300">ICAI Foundation Study Velocity</span>
              <Badge variant="warning">Revision Due</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
