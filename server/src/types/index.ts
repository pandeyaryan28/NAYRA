export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface Task {
  id: string;
  userId?: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO string
  dueTime?: string; // HH:mm
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
  startTime: string; // ISO string
  endTime: string; // ISO string
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
  timestamp: string; // ISO string
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
}

export interface MealEntry {
  id: string;
  userId?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD
  rawText?: string;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  source: 'antigravity' | 'assistant' | 'manual';
  timestamp: string; // ISO string
}

export interface DailyNutritionTarget {
  userId?: string;
  date: string; // YYYY-MM-DD
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

export interface SyncStatus {
  googleTasksConnected: boolean;
  googleCalendarConnected: boolean;
  lastSyncedAt?: string;
  error?: string;
}
