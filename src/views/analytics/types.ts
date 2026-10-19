import { TaskItem, FocusSession } from '@/types';

export interface HorizonDelta {
  focusSecondsDiff: number;
  focusSecondsPercent: number;
  completedTasksDiff: number;
  completedTasksPercent: number;
  pomodoroCountDiff: number;
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

export interface TaskPeriodFocusItem {
  task: TaskItem;
  periodFocusSeconds: number;
  periodPomodoroCount: number;
  percentOfTotalFocus: number;
  sessions?: FocusSession[];
}
