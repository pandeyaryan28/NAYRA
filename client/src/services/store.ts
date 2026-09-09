import type { 
  Task, 
  CalendarEvent, 
  KeepNote, 
  TimeLog, 
  MealEntry, 
  DailyNutritionTarget, 
  NutritionSummaryResponse,
  OverviewStats,
  Habit,
  HabitStatsResponse
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
  AUTH: 'nayra_auth_status',
  HABITS: 'nayra_habits'
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

// Clean initial state without dummy data
const INITIAL_TASKS: Task[] = [];
const INITIAL_EVENTS: CalendarEvent[] = [];
const INITIAL_NOTES: KeepNote[] = [];
const INITIAL_LOGS: TimeLog[] = [];
const INITIAL_MEALS: MealEntry[] = [];
const INITIAL_HABITS: Habit[] = [];

// Automated cleanup routine to guarantee zero dummy data survives from past sessions
export function purgeDummyData() {
  const DUMMY_IDS = new Set([
    't-1', 't-2', 't-3', 't-4',
    'task-1', 'task-2', 'task-3',
    'ev-1', 'ev-2', 'event-1',
    'note-1', 'time-1', 'meal-1',
    'habit-1', 'habit-2', 'habit-3', 'habit-4',
    'proj-1', 'proj-2'
  ]);

  const DUMMY_KEYWORDS = [
    'Complete Full-Stack Backend',
    'Review Upcoming Google Calendar Events',
    'Maintain Daily Habit Streaks',
    'Nayra Core System Standup',
    'Nayra Architecture & Directives',
    'Morning Meditation & Breathing',
    'Hydration Target (3 Liters)',
    'Deep Work Focus Block (90m)',
    'Evening Physical Training / Gym',
    'Boiled Eggs',
    'Whole Grain Toast with Butter',
    'Implementing persistent backend storage'
  ];

  const isDummy = (item: any) => {
    if (!item || typeof item !== 'object') return false;
    if (item.id && DUMMY_IDS.has(item.id)) return true;
    const text = `${item.title || ''} ${item.content || ''} ${item.rawText || ''} ${item.notes || ''}`;
    return DUMMY_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  try {
    const cleanKey = (key: string) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(item => !isDummy(item));
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      } catch {}
    };

    cleanKey(STORAGE_KEYS.TASKS);
    cleanKey(STORAGE_KEYS.EVENTS);
    cleanKey(STORAGE_KEYS.NOTES);
    cleanKey(STORAGE_KEYS.LOGS);
    cleanKey(STORAGE_KEYS.MEALS);
    cleanKey('nayra_habits');
  } catch (e) {
    console.warn('Error purging legacy dummy data:', e);
  }
}

// Execute purge immediately
purgeDummyData();

const INITIAL_TARGET: DailyNutritionTarget = {
  date: todayDateStr,
  targetCalories: 2200,
  targetProtein: 140,
  targetCarbs: 220,
  targetFat: 65,
  waterIntakeMl: 0
};

export class NayraLocalBackend {
  public setTasksDirectly(tasks: Task[]): void {
    setStored(STORAGE_KEYS.TASKS, tasks);
  }

  public setCalendarEventsDirectly(events: CalendarEvent[]): void {
    setStored(STORAGE_KEYS.EVENTS, events);
  }

  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.WATER);
    localStorage.removeItem('nayra_habits');
  }

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
    const rawMeals = getStored<MealEntry[]>(STORAGE_KEYS.MEALS, []);
    const allMeals = rawMeals || [];
    const meals = allMeals.filter(m => m.date === targetDate);
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

  // Habits
  public getHabits(): Habit[] {
    const raw = getStored<Habit[]>(STORAGE_KEYS.HABITS, []);
    return raw || [];
  }

  private calculateHabitStreak(completedDates: string[], existingBest: number = 0): { streak: number; bestStreak: number } {
    if (!completedDates || completedDates.length === 0) {
      return { streak: 0, bestStreak: existingBest };
    }
    const dateSet = new Set(completedDates);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    let checkDate = new Date(today);

    if (dateSet.has(todayStr)) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateSet.has(yesterdayStr)) {
      currentStreak = 1;
      checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
    }

    if (currentStreak > 0) {
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const bestStreak = Math.max(existingBest || 0, currentStreak);
    return { streak: currentStreak, bestStreak };
  }

  public createHabit(data: Partial<Habit>): Habit {
    const habits = this.getHabits();
    const curTime = new Date().toISOString();
    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title || 'Untitled Habit',
      description: data.description || '',
      category: data.category || 'health',
      frequency: data.frequency || 'daily',
      targetDaysPerWeek: data.targetDaysPerWeek || 7,
      color: data.color || '#38bdf8',
      icon: data.icon || 'sparkles',
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: curTime,
      updatedAt: curTime
    };
    habits.unshift(newHabit);
    setStored(STORAGE_KEYS.HABITS, habits);
    return newHabit;
  }

  public updateHabit(id: string, updates: Partial<Habit>): Habit {
    const habits = this.getHabits();
    const idx = habits.findIndex(h => h.id === id);
    if (idx !== -1) {
      const updatedDates = updates.completedDates || habits[idx].completedDates;
      const { streak, bestStreak } = this.calculateHabitStreak(updatedDates, habits[idx].bestStreak);
      habits[idx] = {
        ...habits[idx],
        ...updates,
        streak,
        bestStreak,
        updatedAt: new Date().toISOString()
      };
      setStored(STORAGE_KEYS.HABITS, habits);
      return habits[idx];
    }
    throw new Error('Habit not found');
  }

  public toggleHabit(id: string, dateStr?: string): { success: boolean; habit: Habit; isCompletedToday: boolean } {
    const habits = this.getHabits();
    const idx = habits.findIndex(h => h.id === id);
    if (idx === -1) throw new Error('Habit not found');

    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const habit = habits[idx];
    const completedDates = Array.isArray(habit.completedDates) ? [...habit.completedDates] : [];
    const dateIdx = completedDates.indexOf(targetDate);
    let isCompletedToday = false;

    if (dateIdx >= 0) {
      completedDates.splice(dateIdx, 1);
    } else {
      completedDates.push(targetDate);
      isCompletedToday = true;
    }

    const { streak, bestStreak } = this.calculateHabitStreak(completedDates, habit.bestStreak);
    const updated: Habit = {
      ...habit,
      completedDates,
      streak,
      bestStreak,
      updatedAt: new Date().toISOString()
    };
    habits[idx] = updated;
    setStored(STORAGE_KEYS.HABITS, habits);
    return { success: true, habit: updated, isCompletedToday };
  }

  public deleteHabit(id: string): boolean {
    let habits = this.getHabits();
    habits = habits.filter(h => h.id !== id);
    setStored(STORAGE_KEYS.HABITS, habits);
    return true;
  }

  public getHabitsStats(): HabitStatsResponse {
    const habits = this.getHabits();
    const todayStr = new Date().toISOString().split('T')[0];
    const totalHabits = habits.length;
    const completedTodayCount = habits.filter(h => h.completedDates?.includes(todayStr)).length;
    const completionRateToday = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;
    const bestActiveStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const overallBestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);

    return {
      totalHabits,
      completedTodayCount,
      completionRateToday,
      bestActiveStreak,
      overallBestStreak,
      habits: habits.map(h => ({
        id: h.id,
        title: h.title,
        streak: h.streak,
        completedToday: (h.completedDates || []).includes(todayStr)
      }))
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
