import React, { useMemo, useState } from 'react';
import {
  Activity,
  Clock,
  CheckSquare,
  Flame,
  Award,
  Calendar,
  Tag,
  ArrowUpDown,
  Filter,
  X,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/common/Badge';
import { TagAnalyticsItem } from '@/types';
import { formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import { subDays, addDays, format, parseISO, isSameDay } from 'date-fns';
import { HStack, VStack, Spacer } from '@/components/swiftui/SwiftUIStack';

export type TimeHorizon = 'today' | 'yesterday' | 'tomorrow' | '7d' | '30d' | 'all';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, habits, calorieEntries, settings, focusStats } = useData();

  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('7d');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [tagSortBy, setTagSortBy] = useState<'focus' | 'tasks' | 'completion' | 'name'>('focus');

  const todayStr = getTodayDateString();
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const sevenDaysAgoStr = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const thirtyDaysAgoStr = format(subDays(new Date(), 29), 'yyyy-MM-dd');

  // List of all unique tags in the system
  const availableTags = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((tag) => {
          const clean = tag.trim().toLowerCase();
          if (clean) {
            map.set(clean, (map.get(clean) || 0) + 1);
          }
        });
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  // Tasks scoped by tag filter
  const tagScopedTasks = useMemo(() => {
    if (!activeTagFilter) return tasks;
    return tasks.filter((t) =>
      t.tags && t.tags.some((tg) => tg.trim().toLowerCase() === activeTagFilter.toLowerCase())
    );
  }, [tasks, activeTagFilter]);

  // Tag-scoped focus sessions
  const tagScopedSessions = useMemo(() => {
    if (!activeTagFilter) return focusSessions;
    const allowedTaskIds = new Set(tagScopedTasks.map((t) => t.id));
    return focusSessions.filter((s) => s.taskId && allowedTaskIds.has(s.taskId));
  }, [focusSessions, tagScopedTasks, activeTagFilter]);

  // Horizon-filtered focus sessions
  const horizonSessions = useMemo(() => {
    return tagScopedSessions.filter((s) => {
      if (s.mode !== 'focus') return false;
      const completedDate = s.completedAt.slice(0, 10);
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

  // Horizon-filtered tasks
  const horizonTasks = useMemo(() => {
    return tagScopedTasks.filter((t) => {
      const taskDueDate = t.due ? t.due.slice(0, 10) : undefined;
      switch (timeHorizon) {
        case 'today':
          return (
            taskDueDate === todayStr ||
            (t.completedAt && t.completedAt.slice(0, 10) === todayStr) ||
            (!taskDueDate && t.status !== 'completed')
          );
        case 'yesterday':
          return (
            (t.completedAt && t.completedAt.slice(0, 10) === yesterdayStr) ||
            taskDueDate === yesterdayStr
          );
        case 'tomorrow':
          return taskDueDate === tomorrowStr;
        case '7d':
          return (
            (taskDueDate && taskDueDate >= sevenDaysAgoStr && taskDueDate <= todayStr) ||
            (t.completedAt && t.completedAt.slice(0, 10) >= sevenDaysAgoStr) ||
            (!taskDueDate && t.status !== 'completed')
          );
        case '30d':
          return (
            (taskDueDate && taskDueDate >= thirtyDaysAgoStr && taskDueDate <= todayStr) ||
            (t.completedAt && t.completedAt.slice(0, 10) >= thirtyDaysAgoStr) ||
            (!taskDueDate && t.status !== 'completed')
          );
        case 'all':
        default:
          return true;
      }
    });
  }, [tagScopedTasks, timeHorizon, todayStr, yesterdayStr, tomorrowStr, sevenDaysAgoStr, thirtyDaysAgoStr]);

  // Horizon focus time
  const horizonFocusSeconds = useMemo(() => {
    if (timeHorizon === 'tomorrow') {
      // Estimate projected focus time for tomorrow based on tasks due tomorrow
      const tomorrowTasks = tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr);
      return tomorrowTasks.length * 25 * 60; // 25 min default per scheduled task
    }
    return horizonSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  }, [horizonSessions, timeHorizon, tagScopedTasks, tomorrowStr]);

  // Horizon pomodoros count
  const horizonPomodoroCount = useMemo(() => {
    if (timeHorizon === 'tomorrow') {
      const tomorrowTasks = tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr);
      return tomorrowTasks.length;
    }
    return horizonSessions.length;
  }, [horizonSessions, timeHorizon, tagScopedTasks, tomorrowStr]);

  // Task Velocity for Horizon
  const horizonTotalTasks = horizonTasks.length;
  const horizonCompletedTasks = horizonTasks.filter((t) => t.status === 'completed').length;
  const horizonCompletionRate =
    horizonTotalTasks > 0 ? Math.round((horizonCompletedTasks / horizonTotalTasks) * 100) : 0;

  // Habit metrics for horizon
  const activeHabitsCount = habits.filter((h) => !h.archived).length;
  const habitCompletionsForHorizon = useMemo(() => {
    switch (timeHorizon) {
      case 'today':
        return habits.filter((h) => h.completions && h.completions[todayStr]).length;
      case 'yesterday':
        return habits.filter((h) => h.completions && h.completions[yesterdayStr]).length;
      case 'tomorrow':
        return activeHabitsCount; // Projected habits to complete
      case '7d':
      case '30d':
      case 'all':
      default:
        return habits.reduce((sum, h) => sum + Object.keys(h.completions || {}).length, 0);
    }
  }, [habits, timeHorizon, todayStr, yesterdayStr, activeHabitsCount]);

  const averageHabitStreak =
    habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length) : 0;

  // 7-day focus distribution (reactive to tag filter)
  const past7DaysFocus = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dStr = format(d, 'yyyy-MM-dd');
      const sessions = tagScopedSessions.filter(
        (s) => s.mode === 'focus' && s.completedAt.startsWith(dStr)
      );
      const totalSec = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

      return {
        dateStr: dStr,
        dayName: format(d, 'EEE'),
        totalSeconds: totalSec,
        hours: (totalSec / 3600).toFixed(1),
        pomodoroCount: sessions.length,
      };
    });
  }, [tagScopedSessions]);

  // Hourly distribution for Single Day view (Today / Yesterday)
  const singleDayHourlyDistribution = useMemo(() => {
    const targetDate = timeHorizon === 'yesterday' ? yesterdayStr : todayStr;
    const daySessions = tagScopedSessions.filter(
      (s) => s.mode === 'focus' && s.completedAt.startsWith(targetDate)
    );

    const timeBlocks = [
      { label: '00-03', name: 'Late Night', startHour: 0, endHour: 3 },
      { label: '03-06', name: 'Dawn', startHour: 3, endHour: 6 },
      { label: '06-09', name: 'Early Morning', startHour: 6, endHour: 9 },
      { label: '09-12', name: 'Late Morning', startHour: 9, endHour: 12 },
      { label: '12-15', name: 'Afternoon', startHour: 12, endHour: 15 },
      { label: '15-18', name: 'Late Afternoon', startHour: 15, endHour: 18 },
      { label: '18-21', name: 'Evening', startHour: 18, endHour: 21 },
      { label: '21-24', name: 'Night', startHour: 21, endHour: 24 },
    ];

    return timeBlocks.map((block) => {
      const blockSessions = daySessions.filter((s) => {
        try {
          const dt = new Date(s.completedAt);
          const h = dt.getHours();
          return h >= block.startHour && h < block.endHour;
        } catch {
          return false;
        }
      });
      const totalSec = blockSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      return {
        label: block.label,
        name: block.name,
        totalSeconds: totalSec,
        hours: (totalSec / 3600).toFixed(1),
        pomodoroCount: blockSessions.length,
      };
    });
  }, [tagScopedSessions, timeHorizon, todayStr, yesterdayStr]);

  // Tomorrow's projected task blocks
  const tomorrowProjectedBlocks = useMemo(() => {
    const tomorrowTasks = tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr);
    const priorities = [
      { key: 'high', label: 'High Priority', count: tomorrowTasks.filter((t) => t.priority === 'high').length },
      { key: 'medium', label: 'Medium Priority', count: tomorrowTasks.filter((t) => t.priority === 'medium').length },
      { key: 'low', label: 'Low Priority', count: tomorrowTasks.filter((t) => t.priority === 'low').length },
    ];
    return priorities;
  }, [tagScopedTasks, tomorrowStr]);

  // Tag Performance & Attribution Metrics (Always computes full set for table)
  const tagAnalytics = useMemo<TagAnalyticsItem[]>(() => {
    const tagMap = new Map<
      string,
      {
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        totalFocusSeconds: number;
        pomodoroCount: number;
      }
    >();

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

  const weekSessionsCount = past7DaysFocus.reduce((sum, d) => sum + d.pomodoroCount, 0);

  // Maximum scale for charts
  const maxFocusSec = Math.max(
    ...(timeHorizon === 'today' || timeHorizon === 'yesterday'
      ? singleDayHourlyDistribution.map((d) => d.totalSeconds)
      : past7DaysFocus.map((d) => d.totalSeconds)),
    3600 * 2
  );

  const HORIZON_LABELS: Record<TimeHorizon, { title: string; subtitle: string }> = {
    today: { title: 'Today', subtitle: 'Live activity and progress for today' },
    yesterday: { title: 'Yesterday', subtitle: 'Accomplishments and focus summary from yesterday' },
    tomorrow: { title: 'Tomorrow', subtitle: 'Forward schedule and workload projection for tomorrow' },
    '7d': { title: 'Last 7 Days', subtitle: 'Rolling 7-day deep work and execution velocity' },
    '30d': { title: 'Last 30 Days', subtitle: 'Monthly consistency and task velocity review' },
    all: { title: 'All Time', subtitle: 'Lifetime productivity and execution telemetry' },
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 select-none">
      {/* Header with Title and Time Horizon Segmented Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4 card-enter">
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

        {/* Time Horizon Segmented Control */}
        <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center overflow-x-auto no-scrollbar max-w-full">
          {(['today', 'yesterday', 'tomorrow', '7d', '30d', 'all'] as const).map((h) => {
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

      {/* Interactive Tag Filter Bar */}
      <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md space-y-2 card-enter">
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
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 hover:underline"
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
            All Tags ({tasks.length})
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

      {/* Primary KPI Metrics (Adapts to Selected Time Horizon & Tag) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card liquid-glass-interactive card-enter stagger-1">
          <HStack alignment="center" spacing={2} className="w-full justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              {timeHorizon === 'tomorrow' ? 'Total Focus Time (Projected)' : 'Total Focus Time'}
            </span>
            <Clock className="h-4 w-4 text-zinc-400" />
          </HStack>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {formatSecondsToHoursMinutes(
              timeHorizon === '7d' && !activeTagFilter
                ? focusStats.weekFocusSeconds
                : horizonFocusSeconds
            )}
          </span>
          <span className="text-[10px] text-zinc-500 block">
            {timeHorizon === 'tomorrow'
              ? 'Estimated for tomorrow tasks'
              : timeHorizon === '7d' && !activeTagFilter
              ? `This week (${weekSessionsCount} sessions • ${focusStats.totalSessionsCount} all-time)`
              : `${HORIZON_LABELS[timeHorizon].title} (${horizonPomodoroCount} sessions • ${focusStats.totalSessionsCount} all-time)`}
          </span>
        </div>

        {/* Task Completion Velocity */}
        <div className="p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl space-y-1 interactive-card apple-card-surface liquid-glass-card liquid-glass-interactive card-enter stagger-2">
          <HStack alignment="center" spacing={2} className="w-full justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Task Velocity</span>
            <CheckSquare className="h-4 w-4 text-zinc-400" />
          </HStack>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {horizonCompletionRate}%
          </span>
          <span className="text-[10px] text-zinc-500 block">
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
          <span className="text-[10px] text-zinc-500 block">
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
          <span className="text-[10px] text-zinc-500 block">
            Continuous streak: {focusStats.streakDays} days
          </span>
        </div>
      </div>

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
          <span className="text-xs font-mono text-zinc-500">
            {timeHorizon === 'tomorrow'
              ? `${tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr).length} tasks scheduled`
              : `Peak: ${(maxFocusSec / 3600).toFixed(1)}h`}
          </span>
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
          <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 sm:px-4">
            {singleDayHourlyDistribution.map((b) => {
              const heightPercent =
                maxFocusSec > 0 ? Math.min(100, Math.round((b.totalSeconds / maxFocusSec) * 100)) : 0;
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                    {b.totalSeconds > 0 ? `${b.hours}h` : ''}
                  </span>
                  <div className="w-full max-w-[42px] bg-zinc-100 dark:bg-zinc-800 rounded-t-sm flex items-end h-full">
                    <div
                      className={`w-full rounded-t-sm chart-bar-animated ${
                        b.totalSeconds > 0
                          ? 'bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 transition-opacity'
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
          <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 sm:px-4">
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
                    <span className="text-[9px] text-zinc-400 block">{d.pomodoroCount} p</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tag Performance & Time Allocation Section */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl p-5 space-y-5 card-enter stagger-3 interactive-card apple-card-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Tag className="h-4 w-4 text-sky-500" />
              <span>Tag Performance & Time Allocation</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Task distribution, completion velocity, and deep work time mapped by Pomodoro session tracking. Click any tag to filter.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10 rounded-lg px-2.5 py-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] self-start sm:self-auto swiftui-press">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={tagSortBy}
              onChange={(e) => setTagSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-0 focus:outline-none cursor-pointer"
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
            {sortedTagAnalytics.map((item) => {
              const isTagFiltered = activeTagFilter === item.tag;
              return (
                <div
                  key={item.tag}
                  onClick={() => setActiveTagFilter(isTagFiltered ? null : item.tag)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer swiftui-row ${
                    isTagFiltered
                      ? 'border-sky-500/60 bg-sky-50/50 dark:bg-sky-950/30 shadow-xs'
                      : 'border-zinc-100/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/80 dark:hover:bg-zinc-800/60'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  title={`Click to filter dashboard by #${item.tag}`}
                >
                  {/* Tag Badge & Task Counts */}
                  <div className="space-y-1 min-w-0 sm:w-1/3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md border ${
                          isTagFiltered
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                        }`}
                      >
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
              );
            })}
          </div>
        )}
      </div>

      {/* Task & Domain Focus Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Focus Allocation Tasks */}
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
            {tagScopedTasks
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
