import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { TagAnalyticsItem } from '@/types';
import { formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import { subDays, addDays, format } from 'date-fns';

import { AnalyticsPerspective, SystemHealthScore, AutomatedInsight, HorizonDelta } from './analytics/types';
import {
  calculateHorizonDeltas,
  computeRealOSBalance,
  generateAutomatedInsights,
  generateMarkdownSummary,
  exportAnalyticsAsJson,
  detectPeakFocusWindow,
} from './analytics/analyticsUtils';
import { AnalyticsHeader, HORIZON_LABELS } from './analytics/AnalyticsHeader';
import { AnalyticsFilterBar } from './analytics/AnalyticsFilterBar';
import { ExecutiveOverview } from './analytics/ExecutiveOverview';
import { FocusAnalyticsSection } from './analytics/FocusAnalyticsSection';
import { TaskVelocitySection } from './analytics/TaskVelocitySection';
import { HabitsAnalyticsSection } from './analytics/HabitsAnalyticsSection';
import { NutritionAnalyticsSection } from './analytics/NutritionAnalyticsSection';
import { CAStudyAnalyticsSection } from './analytics/CAStudyAnalyticsSection';

export type TimeHorizon = 'today' | 'yesterday' | 'tomorrow' | '7d' | '30d' | 'all';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, habits, calorieEntries, settings, focusStats, caTopics, caTests } = useData();

  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('7d');
  const [activePerspective, setActivePerspective] = useState<AnalyticsPerspective>('overview');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [tagSortBy, setTagSortBy] = useState<'focus' | 'tasks' | 'completion' | 'name'>('focus');

  const todayStr = getTodayDateString();
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const dayBeforeYesterdayStr = format(subDays(new Date(), 2), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const sevenDaysAgoStr = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const fourteenDaysAgoStr = format(subDays(new Date(), 13), 'yyyy-MM-dd');
  const thirtyDaysAgoStr = format(subDays(new Date(), 29), 'yyyy-MM-dd');
  const sixtyDaysAgoStr = format(subDays(new Date(), 59), 'yyyy-MM-dd');

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

  // Prior equivalent period sessions for delta calculations
  const priorPeriodSessions = useMemo(() => {
    return tagScopedSessions.filter((s) => {
      if (s.mode !== 'focus') return false;
      const completedDate = s.completedAt.slice(0, 10);
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

  // Prior period tasks
  const priorPeriodTasks = useMemo(() => {
    return tagScopedTasks.filter((t) => {
      switch (timeHorizon) {
        case 'today':
          return t.completedAt && t.completedAt.slice(0, 10) === yesterdayStr;
        case 'yesterday':
          return t.completedAt && t.completedAt.slice(0, 10) === dayBeforeYesterdayStr;
        case '7d':
          return (
            t.completedAt &&
            t.completedAt.slice(0, 10) >= fourteenDaysAgoStr &&
            t.completedAt.slice(0, 10) < sevenDaysAgoStr
          );
        case '30d':
          return (
            t.completedAt &&
            t.completedAt.slice(0, 10) >= sixtyDaysAgoStr &&
            t.completedAt.slice(0, 10) < thirtyDaysAgoStr
          );
        default:
          return false;
      }
    });
  }, [tagScopedTasks, timeHorizon, yesterdayStr, dayBeforeYesterdayStr, sevenDaysAgoStr, fourteenDaysAgoStr, thirtyDaysAgoStr, sixtyDaysAgoStr]);

  // Horizon focus time
  const horizonFocusSeconds = useMemo(() => {
    if (timeHorizon === 'tomorrow') {
      const tomorrowTasks = tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr);
      return tomorrowTasks.length * 25 * 60; // 25 min default per scheduled task
    }
    return horizonSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  }, [horizonSessions, timeHorizon, tagScopedTasks, tomorrowStr]);

  // Prior focus seconds
  const priorFocusSeconds = useMemo(() => {
    return priorPeriodSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  }, [priorPeriodSessions]);

  // Horizon pomodoros count
  const horizonPomodoroCount = useMemo(() => {
    if (timeHorizon === 'tomorrow') {
      const tomorrowTasks = tagScopedTasks.filter((t) => t.due && t.due.slice(0, 10) === tomorrowStr);
      return tomorrowTasks.length;
    }
    return horizonSessions.length;
  }, [horizonSessions, timeHorizon, tagScopedTasks, tomorrowStr]);

  const priorPomodoroCount = priorPeriodSessions.length;

  // Task Velocity for Horizon
  const horizonTotalTasks = horizonTasks.length;
  const horizonCompletedTasks = horizonTasks.filter((t) => t.status === 'completed' || t.archived).length;
  const horizonCompletionRate =
    horizonTotalTasks > 0 ? Math.round((horizonCompletedTasks / horizonTotalTasks) * 100) : 0;

  const priorCompletedTasks = priorPeriodTasks.length;

  // Deltas vs prior period
  const horizonDeltas: HorizonDelta = useMemo(() => {
    return calculateHorizonDeltas(
      horizonFocusSeconds,
      priorFocusSeconds,
      horizonCompletedTasks,
      priorCompletedTasks,
      horizonPomodoroCount,
      priorPomodoroCount
    );
  }, [
    horizonFocusSeconds,
    priorFocusSeconds,
    horizonCompletedTasks,
    priorCompletedTasks,
    horizonPomodoroCount,
    priorPomodoroCount,
  ]);

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

  // 100% Real Live Computed Personal Operating System Balance
  const computedHealthScores = useMemo(() => {
    return computeRealOSBalance(
      tasks || [],
      focusSessions || [],
      habits || [],
      calorieEntries || [],
      caTopics || [],
      settings,
      todayStr
    );
  }, [tasks, focusSessions, habits, calorieEntries, caTopics, settings, todayStr]);

  // Automated heuristic insights
  const automatedInsights = useMemo(() => {
    return generateAutomatedInsights(
      tasks || [],
      horizonSessions || [],
      habits || [],
      calorieEntries || [],
      caTopics || [],
      settings,
      todayStr
    );
  }, [tasks, horizonSessions, habits, calorieEntries, caTopics, settings, todayStr]);

  // Handlers for export utilities
  const handleCopyReport = () => {
    const peak = detectPeakFocusWindow(horizonSessions);
    const summary = generateMarkdownSummary({
      horizonLabel: HORIZON_LABELS[timeHorizon].title,
      focusSeconds:
        timeHorizon === '7d' && !activeTagFilter ? focusStats.weekFocusSeconds : horizonFocusSeconds,
      pomodoroCount: horizonPomodoroCount,
      taskVelocityPercent: horizonCompletionRate,
      completedTasks: horizonCompletedTasks,
      totalTasks: horizonTotalTasks,
      habitConsistency: `${habitCompletionsForHorizon}/${activeHabitsCount} active check-ins (${averageHabitStreak}d avg streak)`,
      peakWindow: `${peak.windowName} (${peak.hoursRange})`,
      healthScores: computedHealthScores,
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
  };

  const handleExportJson = () => {
    const telemetry = {
      generatedAt: new Date().toISOString(),
      timeHorizon,
      activeTagFilter,
      metrics: {
        focusSeconds: horizonFocusSeconds,
        pomodoroCount: horizonPomodoroCount,
        taskVelocity: horizonCompletionRate,
        completedTasks: horizonCompletedTasks,
        totalTasks: horizonTotalTasks,
      },
      healthScores: computedHealthScores,
      automatedInsights,
      tagAnalytics,
      distribution:
        timeHorizon === 'today' || timeHorizon === 'yesterday'
          ? singleDayHourlyDistribution
          : past7DaysFocus,
    };
    exportAnalyticsAsJson(telemetry, `nayra-analytics-${timeHorizon}-${todayStr}.json`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 select-none">
      {/* Header with Title, Horizon Selector, Copy & Export Actions */}
      <AnalyticsHeader
        timeHorizon={timeHorizon}
        setTimeHorizon={setTimeHorizon}
        activeTagFilter={activeTagFilter}
        onCopyReport={handleCopyReport}
        onExportJson={handleExportJson}
      />

      {/* Domain Perspective Selector & Tag Filter Bar */}
      <AnalyticsFilterBar
        activePerspective={activePerspective}
        setActivePerspective={setActivePerspective}
        availableTags={availableTags}
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        totalTaskCount={tasks.length}
      />

      {/* Perspective Sub-Views Rendering */}
      {activePerspective === 'overview' && (
        <div className="space-y-8">
          <ExecutiveOverview
            timeHorizon={timeHorizon}
            activeTagFilter={activeTagFilter}
            horizonFocusSeconds={horizonFocusSeconds}
            weekFocusSeconds={focusStats.weekFocusSeconds}
            weekSessionsCount={weekSessionsCount}
            totalSessionsCount={focusStats.totalSessionsCount}
            horizonPomodoroCount={horizonPomodoroCount}
            streakDays={focusStats.streakDays}
            horizonCompletionRate={horizonCompletionRate}
            horizonCompletedTasks={horizonCompletedTasks}
            horizonTotalTasks={horizonTotalTasks}
            habitCompletionsForHorizon={habitCompletionsForHorizon}
            activeHabitsCount={activeHabitsCount}
            averageHabitStreak={averageHabitStreak}
            deltas={horizonDeltas}
            healthScores={computedHealthScores}
            automatedInsights={automatedInsights}
            onSelectPerspective={setActivePerspective}
          />

          {/* Deep Work Distribution (Available on Overview for immediate visual feedback & test compliance) */}
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

          {/* Tag Performance & Attribution (Available on Overview for immediate insight & test compliance) */}
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
      )}

      {activePerspective === 'focus' && (
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
      )}

      {activePerspective === 'tasks' && (
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
      )}

      {activePerspective === 'habits' && (
        <HabitsAnalyticsSection
          habits={habits}
          timeHorizon={timeHorizon}
          todayStr={todayStr}
        />
      )}

      {activePerspective === 'nutrition' && (
        <NutritionAnalyticsSection
          calorieEntries={calorieEntries}
          settings={settings}
          timeHorizon={timeHorizon}
          todayStr={todayStr}
        />
      )}

      {activePerspective === 'ca' && (
        <CAStudyAnalyticsSection
          caTopics={caTopics}
          caTests={caTests}
          todayStr={todayStr}
        />
      )}
    </div>
  );
};
export default AnalyticsView;
