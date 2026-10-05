import {
  UserSettings,
  NayraCalendar,
  CalendarEvent,
  TaskList,
  TaskItem,
  Habit,
  CalorieEntry,
} from '@/types';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  defaultFocusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  dailyCalorieTarget: 2200,
  proteinTargetGrams: 140,
  carbsTargetGrams: 230,
  fatTargetGrams: 70,
  defaultCalendarView: 'week',
  weekStartsOn: 1, // Monday
};

export const INITIAL_CALENDARS: NayraCalendar[] = [
  {
    id: 'primary',
    googleCalendarId: 'primary',
    summary: 'Personal',
    backgroundColor: '#3b82f6', // blue-500
    foregroundColor: '#ffffff',
    primary: true,
    selected: true,
  },
];

export const INITIAL_EVENTS: CalendarEvent[] = [];

export const INITIAL_TASK_LISTS: TaskList[] = [
  {
    id: 'list_default',
    googleTaskListId: '@default',
    title: 'My Tasks',
    isDefault: true,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TASKS: TaskItem[] = [];

export const INITIAL_HABITS: Habit[] = [];

export const INITIAL_CALORIE_ENTRIES: CalorieEntry[] = [];
