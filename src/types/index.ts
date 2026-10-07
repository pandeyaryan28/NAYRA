// ==========================================
// NAYRA Core Domain Types
// ==========================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
  hasGoogleCalendarScope: boolean;
  hasGoogleTasksScope: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: ThemeMode;
  defaultFocusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // e.g. every 4 pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  dailyCalorieTarget: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatTargetGrams: number;
  defaultCalendarView: 'day' | 'week' | 'month' | 'agenda';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

// ------------------------------------------
// Calendar Types (Google Calendar V3 Model)
// ------------------------------------------
export interface NayraCalendar {
  id: string;
  googleCalendarId?: string;
  summary: string;
  description?: string;
  colorId?: string;
  backgroundColor: string;
  foregroundColor: string;
  primary?: boolean;
  selected: boolean;
  timeZone?: string;
}

export interface CalendarEvent {
  id: string;
  googleEventId?: string;
  calendarId: string;
  title: string;
  description?: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  allDay: boolean;
  location?: string;
  color?: string;
  recurrence?: string[];
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  remindersMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Task Types (Google Tasks V1 Model)
// ------------------------------------------
export interface TaskList {
  id: string;
  googleTaskListId?: string;
  title: string;
  isDefault: boolean;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'needsAction' | 'completed';

export interface TaskItem {
  id: string;
  googleTaskId?: string;
  parentTaskId?: string;
  taskListId: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  archived?: boolean;
  archivedAt?: string;
  due?: string; // ISO 8601 or YYYY-MM-DD
  completedAt?: string;
  priority: TaskPriority;
  order?: number;
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  tags?: string[];
  totalFocusSeconds: number;
  pomodoroCount: number;
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Focus / Pomodoro Types
// ------------------------------------------
export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  taskIds?: string[];
  taskTitles?: string[];
  taskTimeAllocations?: Record<string, number>;
  tags?: string[];
  mode: PomodoroMode;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  interrupted: boolean;
}

export interface FocusStats {
  todayFocusSeconds: number;
  todayPomodoroCount: number;
  weekFocusSeconds: number;
  monthFocusSeconds: number;
  streakDays: number;
  totalSessionsCount: number;
}

export interface TagAnalyticsItem {
  tag: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  totalFocusSeconds: number;
  pomodoroCount: number;
}

// ------------------------------------------
// Habit Tracker Types
// ------------------------------------------
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'learning' | 'work' | 'mind' | 'fitness' | 'general';
  frequency: HabitFrequency;
  targetDaysPerWeek: number; // e.g. 5
  color: string;
  archived: boolean;
  createdAt: string;
  // Map of 'YYYY-MM-DD' => true
  completions: Record<string, boolean>;
  currentStreak: number;
  bestStreak: number;
}

// ------------------------------------------
// Calorie & Nutrition Types
// ------------------------------------------
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface CalorieEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  mealType: MealType;
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  servingSize?: string;
  loggedAt: string;
}

// ------------------------------------------
// CA-Tracker Domain Types (ICAI Foundation)
// ------------------------------------------
export type CASubjectId = 'accounting' | 'business_law' | 'quantitative_aptitude' | 'business_economics';
export type CATopicStatus = 'pending' | 'in_progress' | 'completed';
export type CAConfidence = 'low' | 'medium' | 'high';

export interface CARevisionRecord {
  id: string;
  topicId: string;
  revisionNumber: number; // 1, 2, 3, etc.
  completedAt: string;
  confidence: CAConfidence;
  nextDueDate: string;
  notes?: string;
}

export interface CATestRecord {
  id: string;
  testName: string;
  subjectId: CASubjectId;
  date: string;
  marksObtained: number;
  maxMarks: number;
  notes?: string;
}

export interface CATopic {
  id: string;
  subjectId: CASubjectId;
  chapterId: string;
  chapterName: string;
  topicNumber: number;
  title: string;
  status: CATopicStatus;
  startedAt?: string;
  completedAt?: string;
  confidence?: CAConfidence;
  nextRevisionDue?: string;
  revisionCount: number;
  notes?: string;
}

// ------------------------------------------
// SCInt-Engine Domain Types (Semiconductor)
// ------------------------------------------
export type SCIntTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface SCIntNodeBlueprint {
  id: string;
  nodeNumber: number;
  name: string;
  tier: SCIntTier;
  tierName: string;
  category: string;
  description: string;
  capexModularINR: number; // in Crores
  capexBenchmarkINR: number; // in Crores
  subsidyPercentageISM: number; // e.g. 50
  subsidyPercentageSPECS: number; // e.g. 20
  targetClusters: string[];
  keyMachinery: string[];
  primaryRawMaterials: string[];
  offtakeBuyers: string[];
  ebitdaMarginExpected: string;
  paybackPeriodYears: number;
  techReadinessLevel: number;
}

// ------------------------------------------
// Personal Assistant Types
// ------------------------------------------
export type AssistantMessageRole = 'user' | 'assistant' | 'system';

export interface AssistantActionReceipt {
  type: 'create_task' | 'create_event' | 'start_focus' | 'log_calorie' | 'toggle_habit' | 'query_analytics' | 'daily_briefing';
  summary: string;
  data: any;
  timestamp: string;
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  text: string;
  timestamp: string;
  actionReceipt?: AssistantActionReceipt;
}
