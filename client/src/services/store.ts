import type { 
  Task, 
  CalendarEvent, 
  KeepNote, 
  TimeLog, 
  MealEntry, 
  DailyNutritionTarget, 
  NutritionSummaryResponse,
  OverviewStats
} from '../types/index.js';
import { parseAndEstimateMeal } from './nutritionEngine.js';

const STORAGE_KEYS = {
  TASKS: 'nayra_tasks',
  EVENTS: 'nayra_events',
  NOTES: 'nayra_notes',
  LOGS: 'nayra_timelogs',
  MEALS: 'nayra_meals',
  TARGET: 'nayra_nutrition_target',
  WATER: 'nayra_water_intake',
  AUTH: 'nayra_auth_status'
};

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`Could not save key ${key} to localStorage`, e);
  }
}

const nowStr = new Date().toISOString();
const todayDateStr = nowStr.split('T')[0];

// Initial starter seed data
const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Review Q3 Engineering Roadmap & Priorities',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: todayDateStr,
    notes: 'Prioritize architecture scaling, multi-agent pipelines, and zero-latency latency targets.',
    createdAt: nowStr,
    updatedAt: nowStr
  },
  {
    id: 't-2',
    title: 'Deploy NAYRA Personal Command Center',
    status: 'completed',
    priority: 'high',
    dueDate: todayDateStr,
    completedAt: nowStr,
    createdAt: nowStr,
    updatedAt: nowStr
  },
  {
    id: 't-3',
    title: 'Sync Google Workspace, Tasks & Calendar endpoints',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: nowStr,
    updatedAt: nowStr
  },
  {
    id: 't-4',
    title: 'Morning 5km Run & Protein Intake',
    status: 'completed',
    priority: 'medium',
    dueDate: todayDateStr,
    completedAt: nowStr,
    createdAt: nowStr,
    updatedAt: nowStr
  }
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Daily Command Briefing & Alignment',
    startTime: `${todayDateStr}T09:30:00Z`,
    endTime: `${todayDateStr}T10:00:00Z`,
    isAllDay: false,
    meetLink: 'https://meet.google.com/nayra-command',
    location: 'Remote',
    createdAt: nowStr,
    updatedAt: nowStr
  },
  {
    id: 'ev-2',
    title: 'Deep Work: Core Architecture Design',
    startTime: `${todayDateStr}T14:00:00Z`,
    endTime: `${todayDateStr}T16:30:00Z`,
    isAllDay: false,
    location: 'Office Desk',
    createdAt: nowStr,
    updatedAt: nowStr
  }
];

const INITIAL_NOTES: KeepNote[] = [
  {
    id: 'n-1',
    title: 'NAYRA Directives & Architecture',
    content: '1. Ultra-minimalist interface with zero clutter.\n2. Instant two-way Google Tasks & Calendar sync.\n3. Automatic Antigravity natural language nutrition calculation.\n4. Precision Pomodoro interval tracker.',
    isPinned: true,
    isArchived: false,
    createdAt: nowStr,
    updatedAt: nowStr
  }
];

const INITIAL_LOGS: TimeLog[] = [
  {
    id: 'log-1',
    taskId: 't-1',
    taskTitle: 'Review Q3 Engineering Roadmap',
    durationMinutes: 50,
    sessionType: 'pomodoro',
    timestamp: nowStr
  },
  {
    id: 'log-2',
    taskId: 't-2',
    taskTitle: 'Deploy NAYRA Command Center',
    durationMinutes: 25,
    sessionType: 'pomodoro',
    timestamp: nowStr
  }
];

const INITIAL_MEALS: MealEntry[] = [
  {
    id: 'm-1',
    mealType: 'breakfast',
    date: todayDateStr,
    rawText: '2 boiled eggs, whole wheat toast with butter, and black coffee',
    items: [
      { name: '2 boiled eggs', quantity: '2 piece', calories: 156, protein: 12.6, carbs: 1.2, fat: 10.6 },
      { name: 'Whole wheat toast with butter', quantity: '1 slice', calories: 182, protein: 3.6, carbs: 14.0, fat: 12.5 },
      { name: 'Black coffee', quantity: '1 cup', calories: 5, protein: 0.3, carbs: 0.0, fat: 0.0 }
    ],
    totalCalories: 343,
    totalProtein: 16.5,
    totalCarbs: 15.2,
    totalFat: 23.1,
    source: 'antigravity',
    timestamp: nowStr
  }
];

const INITIAL_TARGET: DailyNutritionTarget = {
  date: todayDateStr,
  targetCalories: 2200,
  targetProtein: 140,
  targetCarbs: 220,
  targetFat: 65,
  waterIntakeMl: 1250
};

export class NayraLocalBackend {
  // Tasks
  public getTasks(): Task[] {
    return getStored<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  public createTask(data: Partial<Task>): Task {
    const tasks = this.getTasks();
    const curTime = new Date().toISOString();
    const newTask: Task = {
      id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title || 'Untitled Task',
      notes: data.notes || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || curTime.split('T')[0],
      createdAt: curTime,
      updatedAt: curTime
    };
    tasks.unshift(newTask);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
      setStored(STORAGE_KEYS.TASKS, tasks);
      return tasks[idx];
    }
    throw new Error('Task not found');
  }

  public deleteTask(id: string): boolean {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return true;
  }

  // Calendar
  public getCalendarEvents(): CalendarEvent[] {
    return getStored<CalendarEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  public createCalendarEvent(data: Partial<CalendarEvent>): CalendarEvent {
    const events = this.getCalendarEvents();
    const curTime = new Date().toISOString();
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title || 'Untitled Event',
      description: data.description || '',
      startTime: data.startTime || curTime,
      endTime: data.endTime || new Date(Date.now() + 3600000).toISOString(),
      isAllDay: data.isAllDay || false,
      location: data.location || '',
      meetLink: data.meetLink || undefined,
      createdAt: curTime,
      updatedAt: curTime
    };
    events.push(newEvent);
    setStored(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  public updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent {
    const events = this.getCalendarEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...updates, updatedAt: new Date().toISOString() };
      setStored(STORAGE_KEYS.EVENTS, events);
      return events[idx];
    }
    throw new Error('Event not found');
  }

  public deleteCalendarEvent(id: string): boolean {
    let events = this.getCalendarEvents();
    events = events.filter(e => e.id !== id);
    setStored(STORAGE_KEYS.EVENTS, events);
    return true;
  }

  // Notes
  public getNotes(): KeepNote[] {
    return getStored<KeepNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  }

  public createNote(data: Partial<KeepNote>): KeepNote {
    const notes = this.getNotes();
    const curTime = new Date().toISOString();
    const newNote: KeepNote = {
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title || 'Untitled Note',
      content: data.content || '',
      isPinned: data.isPinned || false,
      isArchived: data.isArchived || false,
      createdAt: curTime,
      updatedAt: curTime
    };
    notes.unshift(newNote);
    setStored(STORAGE_KEYS.NOTES, notes);
    return newNote;
  }

  public updateNote(id: string, updates: Partial<KeepNote>): KeepNote {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === id);
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
      setStored(STORAGE_KEYS.NOTES, notes);
      return notes[idx];
    }
    throw new Error('Note not found');
  }

  public deleteNote(id: string): boolean {
    let notes = this.getNotes();
    notes = notes.filter(n => n.id !== id);
    setStored(STORAGE_KEYS.NOTES, notes);
    return true;
  }

  // Pomodoro
  public getTimeLogs(): TimeLog[] {
    return getStored<TimeLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  public logTime(data: Partial<TimeLog>): TimeLog {
    const logs = this.getTimeLogs();
    const newLog: TimeLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      taskId: data.taskId,
      taskTitle: data.taskTitle || 'Focus Session',
      durationMinutes: data.durationMinutes || 25,
      sessionType: data.sessionType || 'pomodoro',
      notes: data.notes,
      timestamp: data.timestamp || new Date().toISOString()
    };
    logs.unshift(newLog);
    setStored(STORAGE_KEYS.LOGS, logs);
    return newLog;
  }

  // Nutrition & Calories
  public getNutritionSummary(dateStr?: string): NutritionSummaryResponse {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const meals = getStored<MealEntry[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS).filter(m => m.date === targetDate);
    const target = getStored<DailyNutritionTarget>(STORAGE_KEYS.TARGET, INITIAL_TARGET);
    const waterIntakeMl = getStored<number>(STORAGE_KEYS.WATER, 1250);

    const consumedCalories = meals.reduce((acc, m) => acc + m.totalCalories, 0);
    const consumedProtein = Number(meals.reduce((acc, m) => acc + m.totalProtein, 0).toFixed(1));
    const consumedCarbs = Number(meals.reduce((acc, m) => acc + m.totalCarbs, 0).toFixed(1));
    const consumedFat = Number(meals.reduce((acc, m) => acc + m.totalFat, 0).toFixed(1));

    const mealBreakdown = {
      breakfast: meals.filter(m => m.mealType === 'breakfast').reduce((acc, m) => acc + m.totalCalories, 0),
      lunch: meals.filter(m => m.mealType === 'lunch').reduce((acc, m) => acc + m.totalCalories, 0),
      dinner: meals.filter(m => m.mealType === 'dinner').reduce((acc, m) => acc + m.totalCalories, 0),
      snack: meals.filter(m => m.mealType === 'snack').reduce((acc, m) => acc + m.totalCalories, 0)
    };

    return {
      date: targetDate,
      summary: {
        targetCalories: target.targetCalories,
        consumedCalories,
        remainingCalories: Math.max(0, target.targetCalories - consumedCalories),
        targetProtein: target.targetProtein,
        consumedProtein,
        targetCarbs: target.targetCarbs,
        consumedCarbs,
        targetFat: target.targetFat,
        consumedFat,
        waterIntakeMl,
        mealBreakdown
      },
      meals
    };
  }

  public addMealFromText(text: string, mealType?: string): { success: boolean; message: string; meal: MealEntry } {
    const meal = parseAndEstimateMeal(text, mealType as any);
    const meals = getStored<MealEntry[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    meals.unshift(meal);
    setStored(STORAGE_KEYS.MEALS, meals);

    return {
      success: true,
      message: `Calculated & logged: ${meal.totalCalories} kcal (P: ${meal.totalProtein}g, C: ${meal.totalCarbs}g, F: ${meal.totalFat}g)`,
      meal
    };
  }

  public deleteMeal(id: string): boolean {
    let meals = getStored<MealEntry[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    meals = meals.filter(m => m.id !== id);
    setStored(STORAGE_KEYS.MEALS, meals);
    return true;
  }

  public logWater(amountMl: number = 250): { success: boolean; waterIntakeMl: number } {
    const current = getStored<number>(STORAGE_KEYS.WATER, 1250);
    const updated = current + amountMl;
    setStored(STORAGE_KEYS.WATER, updated);
    return { success: true, waterIntakeMl: updated };
  }

  // Assistant AI
  public async chatWithNayra(input: string): Promise<{ reply: string; actionTaken?: any; timestamp: string }> {
    const textLower = input.toLowerCase();

    // 1. Check if user is logging food/calories
    if (
      textLower.includes('ate') || 
      textLower.includes('had') || 
      textLower.includes('drank') || 
      textLower.includes('breakfast') || 
      textLower.includes('lunch') || 
      textLower.includes('dinner') || 
      textLower.includes('snack') ||
      textLower.includes('egg') ||
      textLower.includes('calories')
    ) {
      const res = this.addMealFromText(input);
      return {
        reply: `Logged your meal! Calculated ${res.meal.totalCalories} kcal (${res.meal.totalProtein}g protein, ${res.meal.totalCarbs}g carbs, ${res.meal.totalFat}g fat).`,
        actionTaken: { type: 'CALORIE_LOGGED', meal: res.meal },
        timestamp: new Date().toISOString()
      };
    }

    // 2. Check if adding a task
    if (textLower.startsWith('add task') || textLower.startsWith('todo:') || textLower.startsWith('task:')) {
      const title = input.replace(/^(add task|todo:|task:)\s*/i, '').trim();
      const task = this.createTask({ title, priority: 'medium', status: 'todo' });
      return {
        reply: `Created task: "${task.title}" and queued for 2-way sync.`,
        actionTaken: { type: 'TASK_CREATED', task },
        timestamp: new Date().toISOString()
      };
    }

    // 3. Check for briefing
    if (textLower.includes('briefing') || textLower.includes('overview') || textLower.includes('status')) {
      const tasks = this.getTasks().filter(t => t.status !== 'completed');
      const events = this.getCalendarEvents();
      const nut = this.getNutritionSummary();
      return {
        reply: `Here is your current status: You have ${tasks.length} active tasks, ${events.length} schedule events, and ${nut.summary.consumedCalories} kcal logged (${nut.summary.remainingCalories} kcal remaining).`,
        actionTaken: { type: 'BRIEFING' },
        timestamp: new Date().toISOString()
      };
    }

    // 4. Default Assistant conversational answer
    return {
      reply: `I have noted: "${input}". Let me know if you would like me to schedule an event, calculate calories from a meal, or create a priority task!`,
      timestamp: new Date().toISOString()
    };
  }

  public getBriefing(): any {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const pendingTasks = this.getTasks().filter(t => t.status !== 'completed');
    const todayEvents = this.getCalendarEvents();
    const nut = this.getNutritionSummary();

    return {
      greeting,
      summaryText: `You have ${pendingTasks.length} active tasks, ${todayEvents.length} calendar events, and ${nut.summary.consumedCalories} kcal logged today.`,
      pendingTasksCount: pendingTasks.length,
      todayEventsCount: todayEvents.length,
      consumedCalories: nut.summary.consumedCalories
    };
  }

  public getAuthStatus(): any {
    return {
      authenticated: true,
      hasGoogleTokens: true,
      user: {
        name: 'Aryan Pandey',
        email: 'aaryanpandey28@gmail.com',
        picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
      }
    };
  }
}

export const nayraBackend = new NayraLocalBackend();
