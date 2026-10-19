import { FocusSession, TaskItem } from '@/types';
import { TimeHorizon } from '@/views/AnalyticsView';
import { HorizonDelta, TaskPeriodFocusItem } from './types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

/**
 * Calculates percentage change between current and previous values
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculates period-over-period differences for focus time, task completion, and pomodoro count
 */
export function calculateHorizonDeltas(
  currentFocusSec: number,
  previousFocusSec: number,
  currentCompletedTasks: number,
  previousCompletedTasks: number,
  currentPomodoroCount: number,
  previousPomodoroCount: number
): HorizonDelta {
  return {
    focusSecondsDiff: currentFocusSec - previousFocusSec,
    focusSecondsPercent: calculatePercentChange(currentFocusSec, previousFocusSec),
    completedTasksDiff: currentCompletedTasks - previousCompletedTasks,
    completedTasksPercent: calculatePercentChange(currentCompletedTasks, previousCompletedTasks),
    pomodoroCountDiff: currentPomodoroCount - previousPomodoroCount,
  };
}

/**
 * Analyzes focus session completion timestamps to find the user's peak focus window
 */
export function detectPeakFocusWindow(sessions: FocusSession[]): {
  windowName: string;
  hoursRange: string;
  percentage: number;
  totalSeconds: number;
} {
  if (!sessions || sessions.length === 0) {
    return {
      windowName: 'Not enough data',
      hoursRange: '--',
      percentage: 0,
      totalSeconds: 0,
    };
  }

  const buckets = [
    { name: 'Early Morning', range: '05:00 - 09:00', start: 5, end: 9, seconds: 0 },
    { name: 'Late Morning', range: '09:00 - 13:00', start: 9, end: 13, seconds: 0 },
    { name: 'Afternoon', range: '13:00 - 18:00', start: 13, end: 18, seconds: 0 },
    { name: 'Evening / Night', range: '18:00 - 05:00', start: 18, end: 29, seconds: 0 },
  ];

  let totalLoggedSec = 0;

  sessions.forEach((s) => {
    if (s.mode !== 'focus') return;
    try {
      const dt = new Date(s.completedAt);
      const hour = dt.getHours();
      totalLoggedSec += s.durationSeconds;

      if (hour >= 5 && hour < 9) {
        buckets[0].seconds += s.durationSeconds;
      } else if (hour >= 9 && hour < 13) {
        buckets[1].seconds += s.durationSeconds;
      } else if (hour >= 13 && hour < 18) {
        buckets[2].seconds += s.durationSeconds;
      } else {
        buckets[3].seconds += s.durationSeconds;
      }
    } catch {
      // ignore date parse errors
    }
  });

  if (totalLoggedSec === 0) {
    return {
      windowName: 'No focus logged',
      hoursRange: '--',
      percentage: 0,
      totalSeconds: 0,
    };
  }

  const top = [...buckets].sort((a, b) => b.seconds - a.seconds)[0];
  const pct = Math.round((top.seconds / totalLoggedSec) * 100);

  return {
    windowName: top.name,
    hoursRange: top.range,
    percentage: pct,
    totalSeconds: top.seconds,
  };
}

export function formatSessionTimeRange(startedAt?: string, completedAt?: string): string {
  if (!completedAt) return '';
  try {
    const end = parseISO(completedAt);
    let start: Date;
    if (startedAt) {
      start = parseISO(startedAt);
    } else {
      start = new Date(end.getTime() - 25 * 60 * 1000);
    }
    return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  } catch {
    return completedAt;
  }
}

export function formatSessionDate(completedAt?: string): string {
  if (!completedAt) return '';
  try {
    const d = parseISO(completedAt);
    return format(d, 'EEE, MMM d, yyyy');
  } catch {
    return completedAt.slice(0, 10);
  }
}

/**
 * Maps each task to its exact focus time and pomodoro count within the selected time horizon
 * Without any artificial 4-5 task truncation.
 */
export function calculateTaskPeriodFocus(
  tasks: TaskItem[],
  sessions: FocusSession[],
  timeHorizon: TimeHorizon
): TaskPeriodFocusItem[] {
  const focusOnlySessions = sessions.filter((s) => s.mode === 'focus');
  const totalPeriodSeconds = focusOnlySessions.reduce((sum, s) => sum + (s.durationSeconds || 1500), 0);

  // Map to store per-task focus seconds, pomodoros, and contributing sessions
  const taskFocusMap = new Map<string, { seconds: number; pomodoros: number; sessions: FocusSession[] }>();

  const recordTaskContribution = (taskId: string, seconds: number, session: FocusSession) => {
    const cur = taskFocusMap.get(taskId) || { seconds: 0, pomodoros: 0, sessions: [] };
    cur.seconds += seconds;
    cur.pomodoros += 1;
    if (!cur.sessions.some((existing) => existing.id === session.id)) {
      cur.sessions.push(session);
    }
    taskFocusMap.set(taskId, cur);
  };

  focusOnlySessions.forEach((s) => {
    // 1. Explicit multi-task allocations
    if (s.taskTimeAllocations && Object.keys(s.taskTimeAllocations).length > 0) {
      Object.entries(s.taskTimeAllocations).forEach(([taskId, allocatedSec]) => {
        if (allocatedSec > 0) {
          recordTaskContribution(taskId, allocatedSec, s);
        }
      });
    } else if (s.taskIds && s.taskIds.length > 0) {
      const splitSec = Math.round((s.durationSeconds || 1500) / s.taskIds.length);
      s.taskIds.forEach((taskId) => {
        recordTaskContribution(taskId, splitSec, s);
      });
    } else if (s.taskId) {
      recordTaskContribution(s.taskId, s.durationSeconds || 1500, s);
    }
  });

  const knownTasksMap = new Map<string, TaskItem>();
  tasks.forEach((t) => knownTasksMap.set(t.id, t));

  // Synthesize task entries for tasks present in focus sessions but missing from tasks array
  focusOnlySessions.forEach((s) => {
    const checkAndAdd = (tid: string, fallbackTitle?: string | null) => {
      if (!knownTasksMap.has(tid)) {
        knownTasksMap.set(tid, {
          id: tid,
          taskListId: '@default',
          title: fallbackTitle || s.taskTitle || 'Linked Task',
          status: 'completed',
          completed: true,
          priority: 'medium',
          tags: s.tags || [],
          totalFocusSeconds: s.durationSeconds || 1500,
          pomodoroCount: 1,
          createdAt: s.completedAt || new Date().toISOString(),
          updatedAt: s.completedAt || new Date().toISOString(),
        });
      }
    };

    if (s.taskTimeAllocations) {
      Object.keys(s.taskTimeAllocations).forEach((tid, idx) => {
        const title = s.taskTitles && s.taskTitles[idx] ? s.taskTitles[idx] : s.taskTitle;
        checkAndAdd(tid, title);
      });
    }
    if (s.taskIds) {
      s.taskIds.forEach((tid, idx) => {
        const title = s.taskTitles && s.taskTitles[idx] ? s.taskTitles[idx] : s.taskTitle;
        checkAndAdd(tid, title);
      });
    }
    if (s.taskId) {
      checkAndAdd(s.taskId, s.taskTitle);
    }

    // Also match standalone focus sessions having non-generic title to existing tasks by title
    if (!s.taskId && (!s.taskIds || s.taskIds.length === 0) && s.taskTitle) {
      const normTitle = s.taskTitle.trim().toLowerCase();
      if (normTitle !== 'focus session' && normTitle !== 'universal focus session' && normTitle !== 'linked task') {
        const matchingTask = Array.from(knownTasksMap.values()).find(
          (t) => (t.title || '').trim().toLowerCase() === normTitle
        );
        if (matchingTask) {
          recordTaskContribution(matchingTask.id, s.durationSeconds || 1500, s);
        } else {
          const synthId = `task_synth_${normTitle.replace(/\s+/g, '_')}`;
          checkAndAdd(synthId, s.taskTitle);
          recordTaskContribution(synthId, s.durationSeconds || 1500, s);
        }
      }
    }
  });

  const allTasks = Array.from(knownTasksMap.values());

  return allTasks.map((task) => {
    const sessionStat = taskFocusMap.get(task.id);
    let periodFocusSeconds = sessionStat ? sessionStat.seconds : 0;
    let periodPomodoroCount = sessionStat ? sessionStat.pomodoros : 0;
    const taskSessions = sessionStat ? sessionStat.sessions : [];

    // For all-time horizon, fallback to task's lifetime total if greater
    if (timeHorizon === 'all' && (task.totalFocusSeconds || 0) > periodFocusSeconds) {
      periodFocusSeconds = task.totalFocusSeconds || 0;
      periodPomodoroCount = Math.max(periodPomodoroCount, task.pomodoroCount || 0);
    }

    const percent =
      totalPeriodSeconds > 0
        ? Math.round((periodFocusSeconds / totalPeriodSeconds) * 100)
        : 0;

    return {
      task,
      periodFocusSeconds,
      periodPomodoroCount,
      percentOfTotalFocus: percent,
      sessions: taskSessions,
    };
  });
}

/**
 * Builds a clean Markdown executive summary report for clipboard copying
 */
export function generateMarkdownSummary(params: {
  horizonLabel: string;
  focusSeconds: number;
  pomodoroCount: number;
  taskVelocityPercent: number;
  completedTasks: number;
  totalTasks: number;
  topTasks: Array<{ title: string; focusTime: string }>;
}): string {
  const {
    horizonLabel,
    focusSeconds,
    pomodoroCount,
    taskVelocityPercent,
    completedTasks,
    totalTasks,
    topTasks,
  } = params;

  return `# NAYRA Productivity Summary
**Time Horizon**: ${horizonLabel}
**Exported**: ${new Date().toLocaleDateString()}

---

## Focus & Execution
- **Total Focus Time**: ${formatSecondsToHoursMinutes(focusSeconds)}
- **Pomodoro Cycles**: ${pomodoroCount} completed
- **Task Velocity**: ${taskVelocityPercent}% (${completedTasks}/${totalTasks} tasks completed)

## Top Task Focus Allocations
${topTasks.length > 0 ? topTasks.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.focusTime}`).join('\n') : '- No task focus logged in this period'}
`;
}
