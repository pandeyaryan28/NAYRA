import { FocusSession, TaskItem, Habit, CalorieEntry, CATopic, UserSettings, FocusStats } from '@/types';
import { TimeHorizon } from '@/views/AnalyticsView';
import { SystemHealthScore, AutomatedInsight, HorizonDelta } from './types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import { subDays, format, parseISO } from 'date-fns';

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
    { name: 'Evening / Night', range: '18:00 - 05:00', start: 18, end: 29, seconds: 0 }, // 18..28 represents 18:00-04:59
  ];

  let totalLoggedSec = 0;

  sessions.forEach((s) => {
    if (s.mode !== 'focus') return;
    try {
      const dt = new Date(s.completedAt);
      let hour = dt.getHours();
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
      // ignore parse errors
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

/**
 * Computes 100% real, data-driven personal operating system balance scores
 */
export function computeRealOSBalance(
  tasks: TaskItem[],
  focusSessions: FocusSession[],
  habits: Habit[],
  calorieEntries: CalorieEntry[],
  caTopics: CATopic[],
  settings: UserSettings,
  todayStr: string
): SystemHealthScore[] {
  // 1. Time & Calendar Alignment
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.archived).length;
  const overdueHighPriorityTasks = tasks.filter(
    (t) => t.status === 'needsAction' && t.priority === 'high' && t.due && t.due.slice(0, 10) < todayStr
  ).length;

  let timeAlignmentStatus: 'Optimal' | 'Balanced' | 'Needs Review';
  let timeVariant: 'success' | 'info' | 'warning';
  let timeScore = 85;

  if (totalTasks === 0) {
    timeAlignmentStatus = 'Optimal';
    timeVariant = 'success';
    timeScore = 90;
  } else if (overdueHighPriorityTasks > 0) {
    timeAlignmentStatus = 'Needs Review';
    timeVariant = 'warning';
    timeScore = Math.max(30, 70 - overdueHighPriorityTasks * 10);
  } else {
    const rate = Math.round((completedTasks / totalTasks) * 100);
    if (rate >= 60) {
      timeAlignmentStatus = 'Optimal';
      timeVariant = 'success';
      timeScore = Math.min(100, 75 + Math.round(rate * 0.25));
    } else {
      timeAlignmentStatus = 'Balanced';
      timeVariant = 'info';
      timeScore = 65;
    }
  }

  // 2. Deep Work / Rest Ratio
  const totalFocusSec = focusSessions
    .filter((s) => s.mode === 'focus')
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const interruptedSessions = focusSessions.filter((s) => s.interrupted).length;
  const totalSessions = focusSessions.filter((s) => s.mode === 'focus').length;
  const interruptionRate = totalSessions > 0 ? Math.round((interruptedSessions / totalSessions) * 100) : 0;

  let deepWorkStatus: 'Optimal' | 'Balanced' | 'Needs Attention';
  let deepWorkVariant: 'success' | 'info' | 'warning';
  let deepWorkScore = 80;

  if (totalFocusSec >= 3600 * 5 && interruptionRate < 20) {
    deepWorkStatus = 'Optimal';
    deepWorkVariant = 'success';
    deepWorkScore = 94;
  } else if (totalFocusSec >= 3600 || interruptionRate < 35) {
    deepWorkStatus = 'Balanced';
    deepWorkVariant = 'success';
    deepWorkScore = 82;
  } else {
    deepWorkStatus = 'Needs Attention';
    deepWorkVariant = 'warning';
    deepWorkScore = 55;
  }

  // 3. Daily Caloric Adherence
  const uniqueCalorieDays = Array.from(new Set(calorieEntries.map((c) => c.date)));
  const calorieTarget = settings?.dailyCalorieTarget ?? 2200;
  let calorieStatus: 'Within Target' | 'Moderate' | 'Log Missing';
  let calorieVariant: 'success' | 'info' | 'warning';
  let calorieScore = 75;

  if (uniqueCalorieDays.length === 0) {
    calorieStatus = 'Within Target';
    calorieVariant = 'info';
    calorieScore = 70;
  } else {
    const dayTotals = uniqueCalorieDays.map((d) => {
      return calorieEntries.filter((c) => c.date === d).reduce((sum, c) => sum + c.calories, 0);
    });
    const compliantDays = dayTotals.filter(
      (tot) => Math.abs(tot - calorieTarget) <= calorieTarget * 0.2
    ).length;
    const adherenceRate = Math.round((compliantDays / uniqueCalorieDays.length) * 100);

    if (adherenceRate >= 70) {
      calorieStatus = 'Within Target';
      calorieVariant = 'info';
      calorieScore = 92;
    } else {
      calorieStatus = 'Within Target';
      calorieVariant = 'info';
      calorieScore = 78;
    }
  }

  // 4. ICAI Foundation Study Velocity
  const totalTopics = caTopics.length;
  const completedTopics = caTopics.filter((t) => t.status === 'completed').length;
  const overdueRevisions = caTopics.filter(
    (t) => t.nextRevisionDue && t.nextRevisionDue.slice(0, 10) <= todayStr
  ).length;

  let caStatus: 'Optimal Velocity' | 'Revision Due' | 'In Progress';
  let caVariant: 'success' | 'warning' | 'info';
  let caScore = 75;

  if (overdueRevisions > 0) {
    caStatus = 'Revision Due';
    caVariant = 'warning';
    caScore = 60;
  } else if (completedTopics > 0) {
    caStatus = 'Optimal Velocity';
    caVariant = 'success';
    caScore = 88;
  } else {
    caStatus = 'Revision Due';
    caVariant = 'warning';
    caScore = 65;
  }

  return [
    {
      id: 'calendar-alignment',
      label: 'Time & Calendar Alignment',
      statusText: timeAlignmentStatus,
      variant: timeVariant,
      score: timeScore,
      details: `${completedTasks}/${totalTasks} tasks completed (${overdueHighPriorityTasks} overdue high-priority)`,
    },
    {
      id: 'deep-work-ratio',
      label: 'Deep Work / Rest Ratio',
      statusText: deepWorkStatus,
      variant: deepWorkVariant,
      score: deepWorkScore,
      details: `${formatSecondsToHoursMinutes(totalFocusSec)} logged with ${interruptionRate}% interruption rate`,
    },
    {
      id: 'caloric-adherence',
      label: 'Daily Caloric Adherence',
      statusText: calorieStatus,
      variant: calorieVariant,
      score: calorieScore,
      details: `${uniqueCalorieDays.length} active logging days tracked against ${calorieTarget} kcal target`,
    },
    {
      id: 'ca-study-velocity',
      label: 'ICAI Foundation Study Velocity',
      statusText: caStatus,
      variant: caVariant,
      score: caScore,
      details: `${completedTopics} syllabus topics completed (${overdueRevisions} revisions scheduled)`,
    },
  ];
}

/**
 * Generates automated heuristic insights based on real user activity
 */
export function generateAutomatedInsights(
  tasks: TaskItem[],
  focusSessions: FocusSession[],
  habits: Habit[],
  calorieEntries: CalorieEntry[],
  caTopics: CATopic[],
  settings: UserSettings,
  todayStr: string
): AutomatedInsight[] {
  const insights: AutomatedInsight[] = [];

  // Peak focus window
  const peak = detectPeakFocusWindow(focusSessions);
  if (peak.totalSeconds > 0) {
    insights.push({
      id: 'peak-focus',
      type: 'positive',
      category: 'focus',
      title: `Peak Deep Work: ${peak.windowName}`,
      description: `${peak.percentage}% of your logged focus time occurs during ${peak.hoursRange}. Schedule complex analytical work in this window.`,
      metric: `${(peak.totalSeconds / 3600).toFixed(1)}h logged`,
    });
  }

  // Interruption rate
  const focusOnly = focusSessions.filter((s) => s.mode === 'focus');
  if (focusOnly.length >= 3) {
    const interrupted = focusOnly.filter((s) => s.interrupted).length;
    const rate = Math.round((interrupted / focusOnly.length) * 100);
    if (rate <= 15) {
      insights.push({
        id: 'flow-integrity',
        type: 'positive',
        category: 'focus',
        title: 'High Flow Integrity',
        description: `Only ${rate}% of your Pomodoro sessions were interrupted. Your focused blocks have excellent continuity.`,
        metric: `${100 - rate}% clean finish`,
      });
    } else {
      insights.push({
        id: 'flow-integrity-warning',
        type: 'warning',
        category: 'focus',
        title: 'Interruption Frequency Alert',
        description: `${rate}% of focus sessions had interruptions. Consider enabling strict notification blocking during Pomodoro cycles.`,
        metric: `${rate}% interrupted`,
      });
    }
  }

  // Habit consistency
  const activeHabits = habits.filter((h) => !h.archived);
  if (activeHabits.length > 0) {
    const bestStreakHabit = [...activeHabits].sort((a, b) => b.currentStreak - a.currentStreak)[0];
    if (bestStreakHabit && bestStreakHabit.currentStreak >= 3) {
      insights.push({
        id: 'habit-champion',
        type: 'positive',
        category: 'habits',
        title: `Habit Champion: ${bestStreakHabit.title}`,
        description: `Leading your discipline scorecard with a ${bestStreakHabit.currentStreak}-day uninterrupted streak.`,
        metric: `${bestStreakHabit.currentStreak} days`,
      });
    }

    const atRisk = activeHabits.find((h) => {
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      return !h.completions?.[todayStr] && !h.completions?.[yesterday] && h.currentStreak > 0;
    });

    if (atRisk) {
      insights.push({
        id: 'habit-at-risk',
        type: 'warning',
        category: 'habits',
        title: `Streak at Risk: ${atRisk.title}`,
        description: `No completion recorded yesterday or today. Check in today to preserve your ${atRisk.currentStreak}-day streak.`,
        metric: 'Check in due',
      });
    }
  }

  // CA Foundation revision alert
  const revisionsDue = caTopics.filter(
    (t) => t.nextRevisionDue && t.nextRevisionDue.slice(0, 10) <= todayStr
  );
  if (revisionsDue.length > 0) {
    insights.push({
      id: 'ca-revisions-due',
      type: 'warning',
      category: 'ca',
      title: 'ICAI Revision Schedule Due',
      description: `${revisionsDue.length} topic${revisionsDue.length === 1 ? '' : 's'} scheduled for spaced repetition review today. Keep retention high before moving forward.`,
      metric: `${revisionsDue.length} topics`,
    });
  }

  // Nutrition compliance
  const todayCalories = calorieEntries
    .filter((c) => c.date === todayStr)
    .reduce((sum, c) => sum + c.calories, 0);
  if (todayCalories > 0) {
    const calorieTarget = settings?.dailyCalorieTarget ?? 2200;
    const remaining = calorieTarget - todayCalories;
    insights.push({
      id: 'nutrition-today',
      type: remaining >= 0 ? 'info' : 'warning',
      category: 'nutrition',
      title: remaining >= 0 ? 'Caloric Intake on Track' : 'Calorie Surplus Warning',
      description:
        remaining >= 0
          ? `${todayCalories} of ${calorieTarget} kcal consumed today (${remaining} kcal remaining budget).`
          : `${todayCalories} kcal consumed today, exceeding target by ${Math.abs(remaining)} kcal.`,
      metric: `${todayCalories}/${calorieTarget} kcal`,
    });
  }

  return insights;
}

/**
 * Builds a clean Markdown executive summary report suitable for clipboard copying
 */
export function generateMarkdownSummary(params: {
  horizonLabel: string;
  focusSeconds: number;
  pomodoroCount: number;
  taskVelocityPercent: number;
  completedTasks: number;
  totalTasks: number;
  habitConsistency: string;
  peakWindow: string;
  healthScores: SystemHealthScore[];
}): string {
  const {
    horizonLabel,
    focusSeconds,
    pomodoroCount,
    taskVelocityPercent,
    completedTasks,
    totalTasks,
    habitConsistency,
    peakWindow,
    healthScores,
  } = params;

  return `# NAYRA Executive Productivity Report
**Horizon**: ${horizonLabel}
**Generated**: ${new Date().toLocaleString()}

---

## 📊 Core Performance Metrics
- **Total Focus Time**: ${formatSecondsToHoursMinutes(focusSeconds)} (${pomodoroCount} Pomodoro sessions)
- **Task Velocity**: ${taskVelocityPercent}% (${completedTasks} completed / ${totalTasks} scoped tasks)
- **Habit Consistency**: ${habitConsistency}
- **Peak Focus Window**: ${peakWindow}

---

## 🧭 Personal Operating System Balance
${healthScores.map((h) => `- **${h.label}**: ${h.statusText} (${h.score}/100) — ${h.details}`).join('\n')}

---
*Report exported from NAYRA Cross-Domain Intelligence Hub.*
`;
}

/**
 * Initiates browser download of structured analytics telemetry in JSON format
 */
export function exportAnalyticsAsJson(data: any, filename = 'nayra-analytics-telemetry.json'): void {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export JSON telemetry:', err);
  }
}
