import { TimeHorizon } from '@/views/AnalyticsView';

export type AnalyticsPerspective =
  | 'overview'
  | 'focus'
  | 'tasks'
  | 'habits'
  | 'nutrition'
  | 'ca';

export interface HorizonDelta {
  focusSecondsDiff: number;
  focusSecondsPercent: number;
  completedTasksDiff: number;
  completedTasksPercent: number;
  pomodoroCountDiff: number;
}

export interface AutomatedInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  category: 'focus' | 'tasks' | 'habits' | 'nutrition' | 'ca';
  title: string;
  description: string;
  metric?: string;
}

export interface SystemHealthScore {
  id: string;
  label: string;
  score: number; // 0 - 100
  statusText: string;
  variant: 'success' | 'info' | 'warning' | 'danger';
  details: string;
}

export interface DayFocusItem {
  dateStr: string;
  dayName: string;
  totalSeconds: number;
  hours: string;
  pomodoroCount: number;
}

export interface HourlyFocusItem {
  label: string;
  name: string;
  totalSeconds: number;
  hours: string;
  pomodoroCount: number;
}

export interface MacroNutrientSummary {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  totalCalories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  calorieTarget: number;
  loggedDaysCount: number;
  avgCaloriesPerDay: number;
}
