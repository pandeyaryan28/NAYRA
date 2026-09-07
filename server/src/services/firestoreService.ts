import { db, isFirestoreConnected } from '../config/firebase.js';
import { 
  Task, 
  CalendarEvent, 
  KeepNote, 
  TimeLog, 
  MealEntry, 
  Project, 
  DailyNutritionTarget, 
  Habit 
} from '../types/index.js';
import { jsonDb } from './db.js';

class DataService {
  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('tasks').get();
        if (!snapshot.empty) {
          const list: Task[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Task));
          list.forEach(t => jsonDb.saveTask(t));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to persistent local storage):', e);
      }
    }
    return jsonDb.getTasks();
  }

  async saveTask(task: Task): Promise<Task> {
    const saved = jsonDb.saveTask(task);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('tasks').doc(saved.id).set(saved, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return saved;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = jsonDb.deleteTask(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('tasks').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return deleted;
  }

  // --- Calendar Events ---
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('calendar_events').get();
        if (!snapshot.empty) {
          const list: CalendarEvent[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as CalendarEvent));
          list.forEach(e => jsonDb.saveCalendarEvent(e));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to persistent local storage):', e);
      }
    }
    return jsonDb.getCalendarEvents();
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const saved = jsonDb.saveCalendarEvent(event);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('calendar_events').doc(saved.id).set(saved, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return saved;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const deleted = jsonDb.deleteCalendarEvent(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('calendar_events').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return deleted;
  }

  // --- Keep Notes ---
  async getKeepNotes(): Promise<KeepNote[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('keep_notes').get();
        if (!snapshot.empty) {
          const list: KeepNote[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as KeepNote));
          list.forEach(n => jsonDb.saveKeepNote(n));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to persistent local storage):', e);
      }
    }
    return jsonDb.getKeepNotes();
  }

  async saveKeepNote(note: KeepNote): Promise<KeepNote> {
    const saved = jsonDb.saveKeepNote(note);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('keep_notes').doc(saved.id).set(saved, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return saved;
  }

  async deleteKeepNote(id: string): Promise<boolean> {
    const deleted = jsonDb.deleteKeepNote(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('keep_notes').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return deleted;
  }

  // --- Habits ---
  async getHabits(): Promise<Habit[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('habits').get();
        if (!snapshot.empty) {
          const list: Habit[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Habit));
          list.forEach(h => jsonDb.saveHabit(h));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to persistent local storage):', e);
      }
    }
    return jsonDb.getHabits();
  }

  async saveHabit(habit: Habit): Promise<Habit> {
    const saved = jsonDb.saveHabit(habit);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('habits').doc(saved.id).set(saved, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return saved;
  }

  async toggleHabitCompletion(id: string, date?: string): Promise<Habit | null> {
    const updated = jsonDb.toggleHabitCompletion(id, date);
    if (updated && db && isFirestoreConnected) {
      try {
        await db.collection('habits').doc(updated.id).set(updated, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return updated;
  }

  async deleteHabit(id: string): Promise<boolean> {
    const deleted = jsonDb.deleteHabit(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('habits').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return deleted;
  }

  // --- Time Logs ---
  async getTimeLogs(): Promise<TimeLog[]> {
    if (db && isFirestoreConnected) {
      try {
        const snapshot = await db.collection('time_logs').get();
        if (!snapshot.empty) {
          const list: TimeLog[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as TimeLog));
          list.forEach(t => jsonDb.saveTimeLog(t));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to persistent local storage):', e);
      }
    }
    return jsonDb.getTimeLogs();
  }

  async saveTimeLog(log: TimeLog): Promise<TimeLog> {
    const saved = jsonDb.saveTimeLog(log);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('time_logs').doc(saved.id).set(saved, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return saved;
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
          list.forEach(m => jsonDb.saveMealEntry(m));
          return list;
        }
      } catch (e) {
        console.warn('Firestore read error (falling back to persistent local storage):', e);
      }
    }
    return jsonDb.getMealEntries(targetDate);
  }

  async getAllMealEntries(): Promise<MealEntry[]> {
    return jsonDb.getAllMealEntries();
  }

  async saveMealEntry(meal: MealEntry): Promise<MealEntry> {
    const saved = jsonDb.saveMealEntry(meal);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('meal_entries').doc(saved.id).set(saved, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return saved;
  }

  async deleteMealEntry(id: string): Promise<boolean> {
    const deleted = jsonDb.deleteMealEntry(id);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('meal_entries').doc(id).delete();
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }
    return deleted;
  }

  async getDailyTarget(date?: string): Promise<DailyNutritionTarget> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return jsonDb.getDailyTarget(targetDate);
  }

  async updateDailyTarget(target: DailyNutritionTarget): Promise<DailyNutritionTarget> {
    const updated = jsonDb.updateDailyTarget(target);
    if (db && isFirestoreConnected) {
      try {
        await db.collection('nutrition_targets').doc(target.date).set(target, { merge: true });
      } catch (e) {
        console.warn('Firestore write error:', e);
      }
    }
    return updated;
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    return jsonDb.getProjects();
  }

  async saveProject(proj: Project): Promise<Project> {
    return jsonDb.saveProject(proj);
  }
}

export const firestoreService = new DataService();
