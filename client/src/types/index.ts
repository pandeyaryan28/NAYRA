export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface Task {
  id: string;
  userId?: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  loggedMinutes?: number;
  tags?: string[];
  projectId?: string;
  projectName?: string;
  googleTaskId?: string;
  googleTaskListId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  meetLink?: string;
  color?: string;
  category?: 'work' | 'personal' | 'meeting' | 'health' | 'other';
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface KeepNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  color?: string;
  tags?: string[];
  checklist?: Array<{ id: string; text: string; completed: boolean }>;
  googleKeepId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  userId?: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  durationMinutes: number;
  sessionType: 'pomodoro' | 'short_break' | 'long_break' | 'manual';
  notes?: string;
  timestamp: string;
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  userId?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  rawText?: string;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  source: 'antigravity' | 'assistant' | 'manual';
  timestamp: string;
}

export interface DailyNutritionTarget {
  userId?: string;
  date: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterIntakeMl: number;
}

export interface Project {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'on_hold' | 'completed';
  dueDate?: string;
  progressPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewStats {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    urgent: number;
    completionRate: number;
  };
  calendar: {
    totalEvents: number;
    todayEvents: number;
  };
  notes: {
    totalNotes: number;
    pinnedNotes: number;
  };
  pomodoro: {
    focusMinutesToday: number;
    totalSessions: number;
  };
  nutrition: {
    caloriesConsumed: number;
    targetCalories: number;
    proteinConsumed: number;
    waterIntakeMl: number;
  };
  projectsCount: number;
}

export interface NutritionSummaryResponse {
  date: string;
  summary: {
    targetCalories: number;
    consumedCalories: number;
    remainingCalories: number;
    targetProtein: number;
    consumedProtein: number;
    targetCarbs: number;
    consumedCarbs: number;
    targetFat: number;
    consumedFat: number;
    waterIntakeMl: number;
    mealBreakdown: {
      breakfast: number;
      lunch: number;
      dinner: number;
      snack: number;
    };
  };
  meals: MealEntry[];
}
