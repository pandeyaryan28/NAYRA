import { db, isFirestoreConnected } from '../config/firebase.js';
import { Task, CalendarEvent, KeepNote, TimeLog, MealEntry, Project, DailyNutritionTarget } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory persistent cache to ensure instant reactivity and offline/local resilience
class DataStore {
  private tasks: Map<string, Task> = new Map();
  private calendarEvents: Map<string, CalendarEvent> = new Map();
  private keepNotes: Map<string, KeepNote> = new Map();
  private timeLogs: Map<string, TimeLog> = new Map();
  private mealEntries: Map<string, MealEntry> = new Map();
  private projects: Map<string, Project> = new Map();
  private dailyTargets: Map<string, DailyNutritionTarget> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Default Projects
    const p1: Project = {
      id: 'proj-1',
      name: 'Nayra Core Development',
      description: 'Building the ultimate personal command center',
      color: '#38bdf8',
      status: 'active',
      progressPercent: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const p2: Project = {
      id: 'proj-2',
      name: 'Fitness & Health Ops',
      description: 'Daily nutrition, calorie tracking, and workouts',
      color: '#10b981',
      status: 'active',
      progressPercent: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.set(p1.id, p1);
    this.projects.set(p2.id, p2);

    // Default Tasks
    const t1: Task = {
      id: 'task-1',
      title: 'Complete Nayra Command Center Full-Stack Integration',
      notes: 'Sync with Firebase, Google Tasks, Google Calendar, Pomodoro, and Nutrition AI.',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: todayStr,
      dueTime: '18:00',
      estimatedMinutes: 120,
      loggedMinutes: 75,
      tags: ['Nayra', 'Backend', 'Firebase'],
      projectId: p1.id,
      projectName: p1.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const t2: Task = {
      id: 'task-2',
      title: 'Review Google Calendar Schedule & Meetings',
      notes: 'Ensure two-way sync reflects upcoming deadlines',
      status: 'todo',
      priority: 'high',
      dueDate: todayStr,
      dueTime: '20:00',
      estimatedMinutes: 30,
      loggedMinutes: 0,
      tags: ['Calendar', 'Planning'],
      projectId: p1.id,
      projectName: p1.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const t3: Task = {
      id: 'task-3',
      title: 'Log Today\'s Calorie & Macro Target',
      notes: 'Send meal breakdown to Antigravity AI',
      status: 'completed',
      priority: 'medium',
      dueDate: todayStr,
      completedAt: new Date().toISOString(),
      estimatedMinutes: 15,
      loggedMinutes: 15,
      tags: ['Nutrition', 'Health'],
      projectId: p2.id,
      projectName: p2.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(t1.id, t1);
    this.tasks.set(t2.id, t2);
    this.tasks.set(t3.id, t3);

    // Default Calendar Events
    const now = new Date();
    const eventStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0);
    const eventEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0);
    const c1: CalendarEvent = {
      id: 'event-1',
      title: 'Nayra Command Architecture Sync',
      description: 'Reviewing real-time synchronization and Pomodoro tracking',
      startTime: eventStart.toISOString(),
      endTime: eventEnd.toISOString(),
      isAllDay: false,
      location: 'Virtual HUD',
      category: 'work',
      color: '#38bdf8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.calendarEvents.set(c1.id, c1);

    // Default Keep Notes
    const n1: KeepNote = {
      id: 'note-1',
      title: '💡 Nayra Vision & Directives',
      content: '1. Fast, unified command center dashboard\n2. Real-time 2-way Google ecosystem integration\n3. Zero-friction AI calorie tracking by telling Antigravity\n4. Focused Pomodoro work sessions',
      isPinned: true,
      isArchived: false,
      color: '#0284c7',
      tags: ['Vision', 'Core'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.keepNotes.set(n1.id, n1);

    // Default Nutrition / Meal Entry
    const m1: MealEntry = {
      id: 'meal-1',
      mealType: 'breakfast',
      date: todayStr,
      rawText: '2 boiled eggs, 2 slices whole grain toast with butter, 1 cup black coffee',
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
    this.mealEntries.set(m1.id, m1);

    // Default Nutrition Target
    const target: DailyNutritionTarget = {
      date: todayStr,
      targetCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 65,
      waterIntakeMl: 2500
    };
    this.dailyTargets.set(todayStr, target);

    // Default Time Log
    const tl1: TimeLog = {
      id: 'time-1',
      taskId: t1.id,
      taskTitle: t1.title,
      projectId: p1.id,
      projectName: p1.name,
      durationMinutes: 50,
      sessionType: 'pomodoro',
      notes: 'Initial setup of Firebase and Express backend structure',
      timestamp: new Date().toISOString()
    };
    this.timeLogs.set(tl1.id, tl1);
  }

  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('tasks').get();
        if (!snapshot.empty) {
          const list: Task[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Task));
          // Update in-memory
          list.forEach(t => this.tasks.set(t.id, t));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to memory):', e);
      }
    }
    return Array.from(this.tasks.values());
  }

  async saveTask(task: Task): Promise<Task> {
    if (!task.id) task.id = uuidv4();
    task.updatedAt = new Date().toISOString();
    if (!task.createdAt) task.createdAt = task.updatedAt;

    this.tasks.set(task.id, task);

    if (db && isFirestoreConnected) {
      try {
        await db.collection('tasks').doc(task.id).set(task, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    this.tasks.delete(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('tasks').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return true;
  }

  // --- Calendar Events ---
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('calendar_events').get();
        if (!snapshot.empty) {
          const list: CalendarEvent[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as CalendarEvent));
          list.forEach(e => this.calendarEvents.set(e.id, e));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error:', e);
      }
    }
    return Array.from(this.calendarEvents.values());
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
    if (!event.id) event.id = uuidv4();
    event.updatedAt = new Date().toISOString();
    if (!event.createdAt) event.createdAt = event.updatedAt;

    this.calendarEvents.set(event.id, event);

    if (db && isFirestoreConnected) {
      try {
        await db.collection('calendar_events').doc(event.id).set(event, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return event;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    this.calendarEvents.delete(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('calendar_events').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return true;
  }

  // --- Keep Notes ---
  async getKeepNotes(): Promise<KeepNote[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('keep_notes').get();
        if (!snapshot.empty) {
          const list: KeepNote[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as KeepNote));
          list.forEach(n => this.keepNotes.set(n.id, n));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error:', e);
      }
    }
    return Array.from(this.keepNotes.values());
  }

  async saveKeepNote(note: KeepNote): Promise<KeepNote> {
    if (!note.id) note.id = uuidv4();
    note.updatedAt = new Date().toISOString();
    if (!note.createdAt) note.createdAt = note.updatedAt;

    this.keepNotes.set(note.id, note);

    if (db && isFirestoreConnected) {
      try {
        await db.collection('keep_notes').doc(note.id).set(note, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return note;
  }

  async deleteKeepNote(id: string): Promise<boolean> {
    this.keepNotes.delete(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('keep_notes').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return true;
  }

  // --- Time Logs ---
  async getTimeLogs(): Promise<TimeLog[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('time_logs').get();
        if (!snapshot.empty) {
          const list: TimeLog[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as TimeLog));
          list.forEach(t => this.timeLogs.set(t.id, t));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error:', e);
      }
    }
    return Array.from(this.timeLogs.values());
  }

  async saveTimeLog(log: TimeLog): Promise<TimeLog> {
    if (!log.id) log.id = uuidv4();
    if (!log.timestamp) log.timestamp = new Date().toISOString();

    this.timeLogs.set(log.id, log);

    // Update loggedMinutes on associated task if present
    if (log.taskId && this.tasks.has(log.taskId)) {
      const task = this.tasks.get(log.taskId)!;
      task.loggedMinutes = (task.loggedMinutes || 0) + log.durationMinutes;
      await this.saveTask(task);
    }

    if (db && isFirestoreConnected) {
      try {
        await db.collection('time_logs').doc(log.id).set(log, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return log;
  }

  // --- Meal Entries & Nutrition ---
  async getMealEntries(date?: string): Promise<MealEntry[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('meal_entries').where('date', '==', targetDate).get();
        if (!snapshot.empty) {
          const list: MealEntry[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as MealEntry));
          list.forEach(m => this.mealEntries.set(m.id, m));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error:', e);
      }
    }
    return Array.from(this.mealEntries.values()).filter(m => m.date === targetDate);
  }

  async getAllMealEntries(): Promise<MealEntry[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('meal_entries').get();
        if (!snapshot.empty) {
          const list: MealEntry[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as MealEntry));
          list.forEach(m => this.mealEntries.set(m.id, m));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error:', e);
      }
    }
    return Array.from(this.mealEntries.values());
  }

  async saveMealEntry(meal: MealEntry): Promise<MealEntry> {
    if (!meal.id) meal.id = uuidv4();
    if (!meal.timestamp) meal.timestamp = new Date().toISOString();
    if (!meal.date) meal.date = new Date().toISOString().split('T')[0];

    this.mealEntries.set(meal.id, meal);

    if (db && isFirestoreConnected) {
      try {
        await db.collection('meal_entries').doc(meal.id).set(meal, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return meal;
  }

  async deleteMealEntry(id: string): Promise<boolean> {
    this.mealEntries.delete(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('meal_entries').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return true;
  }

  async getDailyTarget(date?: string): Promise<DailyNutritionTarget> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (this.dailyTargets.has(targetDate)) {
      return this.dailyTargets.get(targetDate)!;
    }
    const defaultTarget: DailyNutritionTarget = {
      date: targetDate,
      targetCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 65,
      waterIntakeMl: 2500
    };
    this.dailyTargets.set(targetDate, defaultTarget);
    return defaultTarget;
  }

  async updateDailyTarget(target: DailyNutritionTarget): Promise<DailyNutritionTarget> {
    this.dailyTargets.set(target.date, target);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('nutrition_targets').doc(target.date).set(target, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return target;
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async saveProject(proj: Project): Promise<Project> {
    if (!proj.id) proj.id = uuidv4();
    proj.updatedAt = new Date().toISOString();
    if (!proj.createdAt) proj.createdAt = proj.updatedAt;
    this.projects.set(proj.id, proj);
    return proj;
  }
}

export const firestoreService = new DataStore();
