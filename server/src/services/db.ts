import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  Task, 
  CalendarEvent, 
  KeepNote, 
  TimeLog, 
  MealEntry, 
  DailyNutritionTarget, 
  Habit, 
  Project 
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'nayra_db.json');

export interface DatabaseSchema {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  keepNotes: KeepNote[];
  timeLogs: TimeLog[];
  mealEntries: MealEntry[];
  dailyTargets: Record<string, DailyNutritionTarget>;
  habits: Habit[];
  projects: Project[];
}

export class JsonDatabase {
  private data: DatabaseSchema = {
    tasks: [],
    calendarEvents: [],
    keepNotes: [],
    timeLogs: [],
    mealEntries: [],
    dailyTargets: {},
    habits: [],
    projects: []
  };

  constructor() {
    this.ensureDataDir();
    this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          tasks: parsed.tasks || [],
          calendarEvents: parsed.calendarEvents || [],
          keepNotes: parsed.keepNotes || [],
          timeLogs: parsed.timeLogs || [],
          mealEntries: parsed.mealEntries || [],
          dailyTargets: parsed.dailyTargets || {},
          habits: parsed.habits || [],
          projects: parsed.projects || []
        };
        console.log(`💾 Loaded Nayra persistent database (${this.data.tasks.length} tasks, ${this.data.habits.length} habits, ${this.data.calendarEvents.length} events)`);
      } else {
        this.seedInitialData();
        this.persist();
        console.log('🌱 Initialized and seeded Nayra persistent database at', DB_FILE);
      }
    } catch (err: any) {
      console.warn('⚠️ Error loading database file, re-seeding:', err.message);
      this.seedInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err: any) {
      console.error('❌ Failed to persist database:', err.message);
    }
  }

  private seedInitialData() {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

    // Projects
    const p1: Project = {
      id: 'proj-1',
      name: 'Nayra Command Core',
      description: 'Unified command center with real APIs & cloud synchronization',
      color: '#38bdf8',
      status: 'active',
      progressPercent: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const p2: Project = {
      id: 'proj-2',
      name: 'Health & Vitality Ops',
      description: 'Daily habit streaks, nutrition, and workout logging',
      color: '#10b981',
      status: 'active',
      progressPercent: 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Tasks
    const t1: Task = {
      id: 'task-1',
      title: 'Complete Full-Stack Backend & Google Ecosystem Sync',
      notes: 'Ensure Google Tasks, Google Calendar, Habits, and Pomodoro run on the live server.',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: todayStr,
      dueTime: '18:00',
      estimatedMinutes: 90,
      loggedMinutes: 45,
      tags: ['Backend', 'GoogleSync', 'Nayra'],
      projectId: p1.id,
      projectName: p1.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const t2: Task = {
      id: 'task-2',
      title: 'Review Upcoming Google Calendar Events',
      notes: 'Check scheduled sync and daily briefings',
      status: 'todo',
      priority: 'high',
      dueDate: todayStr,
      dueTime: '20:00',
      estimatedMinutes: 30,
      loggedMinutes: 0,
      tags: ['Calendar', 'Schedule'],
      projectId: p1.id,
      projectName: p1.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const t3: Task = {
      id: 'task-3',
      title: 'Maintain Daily Habit Streaks',
      notes: 'Check off morning meditation, hydration, and deep work',
      status: 'completed',
      priority: 'medium',
      dueDate: todayStr,
      completedAt: new Date().toISOString(),
      estimatedMinutes: 20,
      loggedMinutes: 20,
      tags: ['Habits', 'Health'],
      projectId: p2.id,
      projectName: p2.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calendar Events
    const now = new Date();
    const eventStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0);
    const eventEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);
    const c1: CalendarEvent = {
      id: 'event-1',
      title: 'Nayra Core System Standup',
      description: 'Architecture review & live sync testing',
      startTime: eventStart.toISOString(),
      endTime: eventEnd.toISOString(),
      isAllDay: false,
      location: 'Virtual Command HUD',
      category: 'work',
      color: '#38bdf8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Keep Notes
    const n1: KeepNote = {
      id: 'note-1',
      title: '💡 Nayra Architecture & Directives',
      content: '1. Fast, unified personal command center\n2. Real-time 2-way Google Tasks & Calendar sync\n3. Zero-loss local persistent database with cloud bridge\n4. Dedicated daily habit streaks and macro nutrition',
      isPinned: true,
      isArchived: false,
      color: '#0284c7',
      tags: ['Architecture', 'Core'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Habits
    const h1: Habit = {
      id: 'habit-1',
      title: 'Morning Meditation & Breathing',
      description: '10 minutes mindfulness and calm focus before screens',
      category: 'mindfulness',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      color: '#8b5cf6',
      icon: 'sparkles',
      completedDates: [twoDaysAgo, yesterday, todayStr],
      streak: 3,
      bestStreak: 14,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const h2: Habit = {
      id: 'habit-2',
      title: 'Hydration Target (3 Liters)',
      description: 'Maintain continuous hydration throughout work hours',
      category: 'health',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      color: '#06b6d4',
      icon: 'droplets',
      completedDates: [yesterday, todayStr],
      streak: 2,
      bestStreak: 21,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const h3: Habit = {
      id: 'habit-3',
      title: 'Deep Work Focus Block (90m)',
      description: 'Zero notifications, pure creative flow and coding',
      category: 'productivity',
      frequency: 'daily',
      targetDaysPerWeek: 5,
      color: '#f59e0b',
      icon: 'target',
      completedDates: [twoDaysAgo, yesterday],
      streak: 2,
      bestStreak: 18,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const h4: Habit = {
      id: 'habit-4',
      title: 'Evening Physical Training / Gym',
      description: 'Resistance training or 30-min cardio',
      category: 'fitness',
      frequency: 'daily',
      targetDaysPerWeek: 6,
      color: '#10b981',
      icon: 'activity',
      completedDates: [twoDaysAgo, yesterday],
      streak: 2,
      bestStreak: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Meal Entries
    const m1: MealEntry = {
      id: 'meal-1',
      mealType: 'breakfast',
      date: todayStr,
      rawText: '2 boiled eggs, whole grain toast with butter, black coffee',
      items: [
        { name: 'Boiled Eggs', quantity: '2 large', calories: 156, protein: 12.6, carbs: 1.1, fat: 10.6 },
        { name: 'Whole Grain Toast with Butter', quantity: '2 slices', calories: 210, protein: 7.0, carbs: 26.0, fat: 9.0 },
        { name: 'Black Coffee', quantity: '1 cup', calories: 5, protein: 0.3, carbs: 0.0, fat: 0.0 }
      ],
      totalCalories: 371,
      totalProtein: 19.9,
      totalCarbs: 27.1,
      totalFat: 19.6,
      source: 'antigravity',
      timestamp: new Date().toISOString()
    };

    // Daily Nutrition Target
    const target: DailyNutritionTarget = {
      date: todayStr,
      targetCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 65,
      waterIntakeMl: 2500
    };

    // Time Log
    const tl1: TimeLog = {
      id: 'time-1',
      taskId: t1.id,
      taskTitle: t1.title,
      projectId: p1.id,
      projectName: p1.name,
      durationMinutes: 45,
      sessionType: 'pomodoro',
      notes: 'Implementing persistent backend storage and Google sync integration',
      timestamp: new Date().toISOString()
    };

    this.data = {
      tasks: [t1, t2, t3],
      calendarEvents: [c1],
      keepNotes: [n1],
      timeLogs: [tl1],
      mealEntries: [m1],
      dailyTargets: { [todayStr]: target },
      habits: [h1, h2, h3, h4],
      projects: [p1, p2]
    };
  }

  // --- Tasks ---
  getTasks(): Task[] {
    return [...this.data.tasks];
  }

  saveTask(task: Task): Task {
    if (!task.id) task.id = uuidv4();
    task.updatedAt = new Date().toISOString();
    if (!task.createdAt) task.createdAt = task.updatedAt;

    const idx = this.data.tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...task };
    } else {
      this.data.tasks.push(task);
    }
    this.persist();
    return task;
  }

  deleteTask(id: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    if (this.data.tasks.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Calendar Events ---
  getCalendarEvents(): CalendarEvent[] {
    return [...this.data.calendarEvents];
  }

  saveCalendarEvent(event: CalendarEvent): CalendarEvent {
    if (!event.id) event.id = uuidv4();
    event.updatedAt = new Date().toISOString();
    if (!event.createdAt) event.createdAt = event.updatedAt;

    const idx = this.data.calendarEvents.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      this.data.calendarEvents[idx] = { ...this.data.calendarEvents[idx], ...event };
    } else {
      this.data.calendarEvents.push(event);
    }
    this.persist();
    return event;
  }

  deleteCalendarEvent(id: string): boolean {
    const initialLen = this.data.calendarEvents.length;
    this.data.calendarEvents = this.data.calendarEvents.filter(e => e.id !== id);
    if (this.data.calendarEvents.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Keep Notes ---
  getKeepNotes(): KeepNote[] {
    return [...this.data.keepNotes];
  }

  saveKeepNote(note: KeepNote): KeepNote {
    if (!note.id) note.id = uuidv4();
    note.updatedAt = new Date().toISOString();
    if (!note.createdAt) note.createdAt = note.updatedAt;

    const idx = this.data.keepNotes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.data.keepNotes[idx] = { ...this.data.keepNotes[idx], ...note };
    } else {
      this.data.keepNotes.push(note);
    }
    this.persist();
    return note;
  }

  deleteKeepNote(id: string): boolean {
    const initialLen = this.data.keepNotes.length;
    this.data.keepNotes = this.data.keepNotes.filter(n => n.id !== id);
    if (this.data.keepNotes.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Habits ---
  getHabits(): Habit[] {
    return [...this.data.habits];
  }

  saveHabit(habit: Habit): Habit {
    if (!habit.id) habit.id = uuidv4();
    habit.updatedAt = new Date().toISOString();
    if (!habit.createdAt) habit.createdAt = habit.updatedAt;
    if (!habit.completedDates) habit.completedDates = [];
    
    // Recalculate streak
    const { streak, bestStreak } = this.calculateHabitStreak(habit.completedDates, habit.bestStreak || 0);
    habit.streak = streak;
    habit.bestStreak = bestStreak;

    const idx = this.data.habits.findIndex(h => h.id === habit.id);
    if (idx >= 0) {
      this.data.habits[idx] = { ...this.data.habits[idx], ...habit };
    } else {
      this.data.habits.push(habit);
    }
    this.persist();
    return habit;
  }

  toggleHabitCompletion(id: string, date?: string): Habit | null {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const habit = this.data.habits.find(h => h.id === id);
    if (!habit) return null;

    const completedSet = new Set(habit.completedDates || []);
    if (completedSet.has(targetDate)) {
      completedSet.delete(targetDate);
    } else {
      completedSet.add(targetDate);
    }

    habit.completedDates = Array.from(completedSet).sort();
    const { streak, bestStreak } = this.calculateHabitStreak(habit.completedDates, habit.bestStreak || 0);
    habit.streak = streak;
    habit.bestStreak = bestStreak;
    habit.updatedAt = new Date().toISOString();

    this.persist();
    return habit;
  }

  deleteHabit(id: string): boolean {
    const initialLen = this.data.habits.length;
    this.data.habits = this.data.habits.filter(h => h.id !== id);
    if (this.data.habits.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  /**
   * Calculates consecutive days streak from completed dates
   */
  private calculateHabitStreak(completedDates: string[], existingBest: number): { streak: number; bestStreak: number } {
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

    // Check if streak starts from today or yesterday
    if (dateSet.has(todayStr)) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateSet.has(yesterdayStr)) {
      currentStreak = 1;
      checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      currentStreak = 0;
    }

    // Count backwards while consecutive days exist
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

    const bestStreak = Math.max(existingBest, currentStreak);
    return { streak: currentStreak, bestStreak };
  }

  // --- Time Logs ---
  getTimeLogs(): TimeLog[] {
    return [...this.data.timeLogs];
  }

  saveTimeLog(log: TimeLog): TimeLog {
    if (!log.id) log.id = uuidv4();
    if (!log.timestamp) log.timestamp = new Date().toISOString();

    const idx = this.data.timeLogs.findIndex(l => l.id === log.id);
    if (idx >= 0) {
      this.data.timeLogs[idx] = { ...this.data.timeLogs[idx], ...log };
    } else {
      this.data.timeLogs.push(log);
    }

    // Update loggedMinutes on associated task
    if (log.taskId) {
      const task = this.data.tasks.find(t => t.id === log.taskId);
      if (task) {
        task.loggedMinutes = (task.loggedMinutes || 0) + log.durationMinutes;
      }
    }

    this.persist();
    return log;
  }

  // --- Nutrition & Meals ---
  getMealEntries(date?: string): MealEntry[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.data.mealEntries.filter(m => m.date === targetDate);
  }

  getAllMealEntries(): MealEntry[] {
    return [...this.data.mealEntries];
  }

  saveMealEntry(meal: MealEntry): MealEntry {
    if (!meal.id) meal.id = uuidv4();
    if (!meal.timestamp) meal.timestamp = new Date().toISOString();
    if (!meal.date) meal.date = new Date().toISOString().split('T')[0];

    const idx = this.data.mealEntries.findIndex(m => m.id === meal.id);
    if (idx >= 0) {
      this.data.mealEntries[idx] = { ...this.data.mealEntries[idx], ...meal };
    } else {
      this.data.mealEntries.push(meal);
    }
    this.persist();
    return meal;
  }

  deleteMealEntry(id: string): boolean {
    const initialLen = this.data.mealEntries.length;
    this.data.mealEntries = this.data.mealEntries.filter(m => m.id !== id);
    if (this.data.mealEntries.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  getDailyTarget(date?: string): DailyNutritionTarget {
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (this.data.dailyTargets[targetDate]) {
      return this.data.dailyTargets[targetDate];
    }
    const defaultTarget: DailyNutritionTarget = {
      date: targetDate,
      targetCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 65,
      waterIntakeMl: 2500
    };
    this.data.dailyTargets[targetDate] = defaultTarget;
    this.persist();
    return defaultTarget;
  }

  updateDailyTarget(target: DailyNutritionTarget): DailyNutritionTarget {
    if (!target.date) target.date = new Date().toISOString().split('T')[0];
    this.data.dailyTargets[target.date] = target;
    this.persist();
    return target;
  }

  // --- Projects ---
  getProjects(): Project[] {
    return [...this.data.projects];
  }

  saveProject(project: Project): Project {
    if (!project.id) project.id = uuidv4();
    project.updatedAt = new Date().toISOString();
    if (!project.createdAt) project.createdAt = project.updatedAt;

    const idx = this.data.projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...project };
    } else {
      this.data.projects.push(project);
    }
    this.persist();
    return project;
  }
}

export const jsonDb = new JsonDatabase();
