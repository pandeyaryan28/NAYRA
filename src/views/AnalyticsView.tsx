import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { TagAnalyticsItem } from '@/types';
import { formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import { subDays, addDays, format, parseISO } from 'date-fns';
import { Clock, CheckSquare, Flame, TrendingUp, TrendingDown, Target } from 'lucide-react';

import {
  calculateHorizonDeltas,
  calculateTaskPeriodFocus,
  detectPeakFocusWindow,
  generateMarkdownSummary,
} from './analytics/analyticsUtils';
import { AnalyticsHeader, HORIZON_LABELS } from './analytics/AnalyticsHeader';
import { FocusAnalyticsSection } from './analytics/FocusAnalyticsSection';
import { TaskFocusBreakdown } from './analytics/TaskFocusBreakdown';
import { TaskVelocitySection } from './analytics/TaskVelocitySection';
import {
  normalizeTag,
  areTagsSimilar,
  calculateComprehensiveTagAnalytics,
} from '@/lib/tagUtils';

export type TimeHorizon = 'today' | 'yesterday' | 'tomorrow' | '7d' | '30d' | 'all';

export const toLocalDateString = (isoString?: string | null): string => {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), 'yyyy-MM-dd');
  } catch {
    return isoString.slice(0, 10);
  }
};

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, focusStats, habits } = useData();

  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('7d');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [tagSortBy, setTagSortBy] = useState<'focus' | 'tasks' | 'completion' | 'name'>('focus');

  const activeHabits = useMemo(() => (habits || []).filter((h) => !h.archived), [habits]);
  const avgHabitStreak = useMemo(() => {
    if (activeHabits.length === 0) return focusStats.streakDays || 0;
    const total = activeHabits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);
    return Math.round(total / activeHabits.length);
  }, [activeHabits, focusStats.streakDays]);

  const todayStr = getTodayDateString();
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const dayBeforeYesterdayStr = format(subDays(new Date(), 2), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const sevenDaysAgoStr = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const fourteenDaysAgoStr = format(subDays(new Date(), 13), 'yyyy-MM-dd');
  const thirtyDaysAgoStr = format(subDays(new Date(), 29), 'yyyy-MM-dd');
  const sixtyDaysAgoStr = format(subDays(new Date(), 59), 'yyyy-MM-dd');

  // List of all unique tags in the system across tasks and focus sessions
  const availableTags = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((tag) => {
          const clean = normalizeTag(tag);
          if (clean) {
            map.set(clean, (map.get(clean) || 0) + 1);
          }
        });
      }
    });
    focusSessions.forEach((s) => {
      if (s.tags) {
        s.tags.forEach((tag) => {
          const clean = normalizeTag(tag);
          if (clean) {
            map.set(clean, (map.get(clean) || 0) + 1);
          }
        });
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks, focusSessions]);

  // Tasks scoped by tag filter (fuzzy/canonical matching)
  const tagScopedTasks = useMemo(() => {
    if (!activeTagFilter) return tasks;
    return tasks.filter((t) =>
      t.tags && t.tags.some((tg) => areTagsSimilar(tg, activeTagFilter))
    );
  }, [tasks, activeTagFilter]);

  // Tag-scoped focus sessions (supports session tags, linked task tags, multi-tasks)
  const tagScopedSessions = useMemo(() => {
    if (!activeTagFilter) return focusSessions;
    const allowedTaskIds = new Set(tagScopedTasks.map((t) => t.id));
    return focusSessions.filter((s) => {
      if (s.tags && s.tags.some((tg) => areTagsSimilar(tg, activeTagFilter))) {
        return true;
      }
      if (s.taskId && allowedTaskIds.has(s.taskId)) {
        return true;
      }
      if (s.taskIds && s.taskIds.some((id) => allowedTaskIds.has(id))) {
        return true;
      }
      if (s.taskTimeAllocations && Object.keys(s.taskTimeAllocations).some((id) => allowedTaskIds.has(id))) {
        return true;
      }
      return false;
    });
  }, [focusSessions, tagScopedTasks, activeTagFilter]);

  // Horizon-filtered focus sessions
  const horizonSessions = useMemo(() => {
    return tagScopedSessions.filter((s) => {
      if (s.mode !== 'focus') return false;
      const completedDate = toLocalDateString(s.completedAt);
      switch (timeHorizon) {
        case 'today':
          return completedDate === todayStr;
        case 'yesterday':
          return completedDate === yesterdayStr;
        case 'tomorrow':
          return false; // Tomorrow has not happened yet
        case '7d':
          return completedDate >= sevenDaysAgoStr && completedDate <= todayStr;
        case '30d':
          return completedDate >= thirtyDaysAgoStr && completedDate <= todayStr;
        case 'all':
        default:
          return true;
      }
    });
  }, [tagScopedSessions, timeHorizon, todayStr, yesterdayStr, sevenDaysAgoStr, thirtyDaysAgoStr]);

  // Prior equivalent period sessions for delta calculations
  const priorPeriodSessions = useMemo(() => {
    return tagScopedSessions.filter((s) => {
      if (s.mode !== 'focus') return false;
      const completedDate = toLocalDateString(s.completedAt);
      switch (timeHorizon) {
        case 'today':
          return completedDate === yesterdayStr;
        case 'yesterday':
          return completedDate === dayBeforeYesterdayStr;
        case '7d':
          return completedDate >= fourteenDaysAgoStr && completedDate < sevenDaysAgoStr;
        case '30d':
          return completedDate >= sixtyDaysAgoStr && completedDate < thirtyDaysAgoStr;
        case 'tomorrow':
        case 'all':
        default:
          return false;
      }
    });
  }, [tagScopedSessions, timeHorizon, yesterdayStr, dayBeforeYesterdayStr, sevenDaysAgoStr, fourteenDaysAgoStr, thirtyDaysAgoStr, sixtyDaysAgoStr]);

  // Horizon-filtered tasks
  const horizonTasks = useMemo(() => {
    return tagScopedTasks.filter((t) => {
      const taskDate = toLocalDateString(t.due || t.completedAt || t.createdAt);
      switch (timeHorizon) {
        case 'today':
          return taskDate === todayStr;
        case 'yesterday':
          return taskDate === yesterdayStr;
        case 'tomorrow':
          return taskDate === tomorrowStr;
        case '7d':
          return taskDate >= sevenDaysAgoStr && taskDate <= todayStr;
        case '30d':
          return taskDate >= thirtyDaysAgoStr && taskDate <= todayStr;
        case 'all':
        default:
          return true;
      }
    });
  }, [tagScopedTasks, timeHorizon, todayStr, yesterdayStr, tomorrowStr, sevenDaysAgoStr, thirtyDaysAgoStr]);

  // Primary Aggregations
  const horizonFocusSeconds = useMemo(() => {
    if (timeHorizon === 'tomorrow') return 0;
    return horizonSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  }, [horizonSessions, timeHorizon]);

  const priorFocusSeconds = useMemo(() => {
    return priorPeriodSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  }, [priorPeriodSessions]);

  const horizonCompletedTasks = useMemo(() => {
    return horizonTasks.filter((t) => t.status === 'completed' || t.archived).length;
  }, [horizonTasks]);

  const horizonTotalTasks = horizonTasks.length;

  const priorCompletedTasks = useMemo(() => {
    return tagScopedTasks.filter((t) => {
      const d = toLocalDateString(t.completedAt || t.due);
      switch (timeHorizon) {
        case 'today':
          return d === yesterdayStr && (t.status === 'completed' || t.archived);
        case 'yesterday':
          return d === dayBeforeYesterdayStr && (t.status === 'completed' || t.archived);
        case '7d':
          return d >= fourteenDaysAgoStr && d < sevenDaysAgoStr && (t.status === 'completed' || t.archived);
        case '30d':
          return d >= sixtyDaysAgoStr && d < thirtyDaysAgoStr && (t.status === 'completed' || t.archived);
        default:
          return false;
      }
    }).length;
  }, [tagScopedTasks, timeHorizon, yesterdayStr, dayBeforeYesterdayStr, sevenDaysAgoStr, fourteenDaysAgoStr, thirtyDaysAgoStr, sixtyDaysAgoStr]);

  const horizonPomodoroCount = horizonSessions.length;
  const priorPomodoroCount = priorPeriodSessions.length;

  const horizonCompletionRate =
    horizonTotalTasks > 0 ? Math.round((horizonCompletedTasks / horizonTotalTasks) * 100) : 0;

  // Deltas vs prior period
  const horizonDeltas = useMemo(() => {
    return calculateHorizonDeltas(
      horizonFocusSeconds,
      priorFocusSeconds,
      horizonCompletedTasks,
      priorCompletedTasks,
      horizonPomodoroCount,
      priorPomodoroCount
    );
  }, [horizonFocusSeconds, priorFocusSeconds, horizonCompletedTasks, priorCompletedTasks, horizonPomodoroCount, priorPomodoroCount]);

  // Peak focus window
  const peakFocusWindow = useMemo(() => {
    return detectPeakFocusWindow(horizonSessions);
  }, [horizonSessions]);

  // Full Task Focus Breakdown Items (NO 4-5 task limit!)
  const taskPeriodItems = useMemo(() => {
    return calculateTaskPeriodFocus(tagScopedTasks, horizonSessions, timeHorizon);
  }, [tagScopedTasks, horizonSessions, timeHorizon]);

  // Daily distribution (past 7 days)
  const past7DaysFocus = useMemo(() => {
    const days: Array<{ dateStr: string; dayName: string; totalSeconds: number; hours: string; pomodoroCount: number }> = [];
    const count = timeHorizon === '30d' ? 30 : 7;
    for (let i = count - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayName = count === 30 ? format(d, 'd MMM') : format(d, 'EEE');

      const daySessions = tagScopedSessions.filter(
        (s) => s.mode === 'focus' && toLocalDateString(s.completedAt) === dateStr
      );

      const totalSec = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);

      days.push({
        dateStr,
        dayName,
        totalSeconds: totalSec,
        hours: (totalSec / 3600).toFixed(1),
        pomodoroCount: daySessions.length,
      });
    }
    return days;
  }, [tagScopedSessions, timeHorizon]);

  // Hourly distribution for single day (Today or Yesterday) with complete 24h coverage
  const singleDayHourlyDistribution = useMemo(() => {
    const targetDate = timeHorizon === 'yesterday' ? yesterdayStr : todayStr;
    const hours = [
      { start: 0, end: 4, label: '0-4', name: '00:00 - 04:00' },
      { start: 4, end: 8, label: '4-8', name: '04:00 - 08:00' },
      { start: 8, end: 10, label: '8-10', name: '08:00 - 10:00' },
      { start: 10, end: 12, label: '10-12', name: '10:00 - 12:00' },
      { start: 12, end: 14, label: '12-14', name: '12:00 - 14:00' },
      { start: 14, end: 16, label: '14-16', name: '14:00 - 16:00' },
      { start: 16, end: 18, label: '16-18', name: '16:00 - 18:00' },
      { start: 18, end: 20, label: '18-20', name: '18:00 - 20:00' },
      { start: 20, end: 22, label: '20-22', name: '20:00 - 22:00' },
      { start: 22, end: 24, label: '22-24', name: '22:00 - 24:00' },
    ];

    const daySessions = tagScopedSessions.filter(
      (s) => s.mode === 'focus' && toLocalDateString(s.completedAt) === targetDate
    );

    return hours.map((h) => {
      const bucketSessions = daySessions.filter((s) => {
        try {
          const dt = parseISO(s.completedAt);
          const hr = dt.getHours();
          return hr >= h.start && hr < h.end;
        } catch {
          return false;
        }
      });

      const totalSec = bucketSessions.reduce((sum, s) => sum + s.durationSeconds, 0);

      return {
        label: h.label,
        name: h.name,
        totalSeconds: totalSec,
        hours: (totalSec / 3600).toFixed(1),
        pomodoroCount: bucketSessions.length,
      };
    });
  }, [tagScopedSessions, timeHorizon, todayStr, yesterdayStr]);

  // Tomorrow projected blocks
  const tomorrowProjectedBlocks = useMemo(() => {
    const tomorrowTasks = tagScopedTasks.filter((t) => t.due && toLocalDateString(t.due) === tomorrowStr);
    const high = tomorrowTasks.filter((t) => t.priority === 'high').length;
    const med = tomorrowTasks.filter((t) => t.priority === 'medium').length;
    const low = tomorrowTasks.filter((t) => t.priority === 'low' || !t.priority).length;
    return [
      { key: 'high', label: 'High Priority', count: high },
      { key: 'medium', label: 'Medium Priority', count: med },
      { key: 'low', label: 'Low Priority', count: low },
      { key: 'total', label: 'Total Scheduled', count: tomorrowTasks.length },
    ];
  }, [tagScopedTasks, tomorrowStr]);


  // Peak focus time for scaling charts
  const maxFocusSec = useMemo(() => {
    if (timeHorizon === 'today' || timeHorizon === 'yesterday') {
      const maxHourly = Math.max(...singleDayHourlyDistribution.map((h) => h.totalSeconds), 0);
      return Math.max(3600, maxHourly);
    }
    const maxDaily = Math.max(...past7DaysFocus.map((d) => d.totalSeconds), 0);
    return Math.max(3600 * 3, maxDaily);
  }, [timeHorizon, singleDayHourlyDistribution, past7DaysFocus]);

  // Tag analytics with comprehensive time tracking & cluster recognition
  const tagAnalytics: TagAnalyticsItem[] = useMemo(() => {
    return calculateComprehensiveTagAnalytics(tasks, focusSessions, horizonSessions);
  }, [tasks, focusSessions, horizonSessions]);

  const sortedTagAnalytics = useMemo(() => {
    return [...tagAnalytics].sort((a, b) => {
      switch (tagSortBy) {
        case 'focus':
          return b.totalFocusSeconds - a.totalFocusSeconds;
        case 'tasks':
          return b.totalTasks - a.totalTasks;
        case 'completion':
          return b.completionRate - a.completionRate;
        case 'name':
          return a.tag.localeCompare(b.tag);
        default:
          return b.totalFocusSeconds - a.totalFocusSeconds;
      }
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
    const taskSec = taggedTasks.reduce((sum, item) => sum + (item.totalFocusSeconds || 0), 0);
    const autonomousTaggedSessions = focusSessions.filter(
      (s) =>
        s.mode === 'focus' &&
        !s.taskId &&
        (!s.taskIds || s.taskIds.length === 0) &&
        s.tags &&
        s.tags.length > 0
    );
    const sessionSec = autonomousTaggedSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    return taskSec + sessionSec;
  }, [tasks, focusSessions]);

  // Action: Copy markdown report
  const handleCopyReport = () => {
    const topTasks = taskPeriodItems
      .filter((i) => i.periodFocusSeconds > 0)
      .sort((a, b) => b.periodFocusSeconds - a.periodFocusSeconds)
      .slice(0, 10)
      .map((i) => ({
        title: i.task.title,
        focusTime: formatSecondsToHoursMinutes(i.periodFocusSeconds),
      }));

    const report = generateMarkdownSummary({
      horizonLabel: HORIZON_LABELS[timeHorizon].title,
      focusSeconds: horizonFocusSeconds,
      pomodoroCount: horizonPomodoroCount,
      taskVelocityPercent: horizonCompletionRate,
      completedTasks: horizonCompletedTasks,
      totalTasks: horizonTotalTasks,
      topTasks,
    });

    navigator.clipboard.writeText(report).catch((err) => {
      console.warn('Failed to copy to clipboard:', err);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 select-none">
      {/* Header with Title, Horizon Selector, Tag Filter, and Copy Action */}
      <AnalyticsHeader
        timeHorizon={timeHorizon}
        setTimeHorizon={setTimeHorizon}
        availableTags={availableTags}
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        totalTaskCount={tasks.length}
        onCopyReport={handleCopyReport}
      />

      {/* Decluttered Core Focus KPIs (Clean, quiet Apple/SwiftUI aesthetic) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 card-enter">
        {/* Card 1: Total Focus Time */}
        <div className="p-4 sm:p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Total Focus Time</span>
            <Clock className="h-4 w-4 text-sky-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {formatSecondsToHoursMinutes(horizonFocusSeconds)}
            </span>
            {timeHorizon !== 'tomorrow' && horizonDeltas.focusSecondsPercent !== 0 && (
              <span
                className={`text-[11px] font-mono font-medium flex items-center gap-0.5 ${
                  horizonDeltas.focusSecondsPercent > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400'
                }`}
                title={`Change vs prior period`}
              >
                {horizonDeltas.focusSecondsPercent > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {horizonDeltas.focusSecondsPercent > 0
                    ? `+${horizonDeltas.focusSecondsPercent}%`
                    : `${horizonDeltas.focusSecondsPercent}%`}
                </span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-zinc-500 font-mono block">
            {horizonPomodoroCount} sessions • {focusStats.totalSessionsCount} all-time
          </span>
        </div>

        {/* Card 2: Task Velocity */}
        <div className="p-4 sm:p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Task Velocity</span>
            <CheckSquare className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {horizonCompletionRate}%
            </span>
            {timeHorizon !== 'tomorrow' && horizonDeltas.completedTasksPercent !== 0 && (
              <span
                className={`text-[11px] font-mono font-medium flex items-center gap-0.5 ${
                  horizonDeltas.completedTasksPercent > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400'
                }`}
              >
                {horizonDeltas.completedTasksPercent > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {horizonDeltas.completedTasksPercent > 0
                    ? `+${horizonDeltas.completedTasksPercent}%`
                    : `${horizonDeltas.completedTasksPercent}%`}
                </span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-zinc-500 font-mono block">
            {horizonCompletedTasks} completed / {horizonTotalTasks} total tasks
          </span>
        </div>

        {/* Card 3: Habit Adherence */}
        <div className="p-4 sm:p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Habit Adherence</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>

          <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {avgHabitStreak} days
          </span>

          <span className="text-[10px] text-zinc-500 font-mono block">
            {activeHabits.length > 0 ? `${activeHabits.length} active habits • ` : ''}{focusStats.streakDays} day focus streak
          </span>
        </div>

        {/* Card 4: Peak Focus Window */}
        <div className="p-4 sm:p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Peak Focus Window</span>
            <Target className="h-4 w-4 text-purple-500" />
          </div>

          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 block truncate">
            {peakFocusWindow.windowName}
          </span>

          <span className="text-[10px] text-zinc-500 font-mono block">
            {peakFocusWindow.hoursRange} {peakFocusWindow.percentage > 0 ? `(${peakFocusWindow.percentage}% focus)` : ''}
          </span>
        </div>
      </div>

      {/* Daily / Hourly Focus Distribution Chart */}
      <FocusAnalyticsSection
        timeHorizon={timeHorizon}
        maxFocusSec={maxFocusSec}
        past7DaysFocus={past7DaysFocus}
        singleDayHourlyDistribution={singleDayHourlyDistribution}
        tomorrowProjectedBlocks={tomorrowProjectedBlocks}
        tomorrowTasksCount={tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr).length}
        tomorrowStr={tomorrowStr}
        tagScopedTasks={tagScopedTasks}
        tagScopedSessions={tagScopedSessions}
      />

      {/* Comprehensive Task Focus Breakdown (Shows EVERY Task with Period Focus Time!) */}
      <TaskFocusBreakdown
        taskPeriodItems={taskPeriodItems}
        timeHorizon={timeHorizon}
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        horizonTotalFocusSec={horizonFocusSeconds}
      />

      {/* Tag Performance & Time Allocation */}
      <TaskVelocitySection
        tagAnalytics={tagAnalytics}
        sortedTagAnalytics={sortedTagAnalytics}
        tagSortBy={tagSortBy}
        setTagSortBy={setTagSortBy}
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        mostFocusedTag={mostFocusedTag}
        highestVelocityTag={highestVelocityTag}
        totalTaggedFocusSeconds={totalTaggedFocusSeconds}
        tasks={tasks}
      />
    </div>
  );
};
export default AnalyticsView;
