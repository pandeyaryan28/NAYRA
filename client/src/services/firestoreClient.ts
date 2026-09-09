import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import type { 
  Habit, 
  MealEntry, 
  DailyNutritionTarget, 
  Task, 
  CalendarEvent,
  KeepNote, 
  TimeLog 
} from '../types/index.js';

export interface UserSettings {
  theme: 'dark' | 'light';
  uiStyle: string;
  accentColor: string;
  updatedAt?: string;
}

export class FirestoreClient {
  // ==========================================
  // --- Habits ---
  // ==========================================
  async getHabits(): Promise<Habit[]> {
    try {
      const snap = await getDocs(collection(db, 'habits'));
      if (snap.empty) return [];
      const list: Habit[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'health',
          frequency: data.frequency || 'daily',
          targetDaysPerWeek: Number(data.targetDaysPerWeek || 7),
          color: data.color || '#38bdf8',
          icon: data.icon || 'sparkles',
          completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
          streak: Number(data.streak || 0),
          bestStreak: Number(data.bestStreak || 0),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        } as Habit);
      });
      return list;
    } catch (e) {
      console.warn('Firestore getHabits error:', e);
      return [];
    }
  }

  async saveHabit(habit: Habit): Promise<Habit> {
    try {
      const ref = doc(db, 'habits', habit.id);
      await setDoc(ref, habit, { merge: true });
    } catch (e) {
      console.warn('Firestore saveHabit error:', e);
    }
    return habit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'habits', id));
      return true;
    } catch (e) {
      console.warn('Firestore deleteHabit error:', e);
      return false;
    }
  }

  subscribeHabits(onUpdate: (habits: Habit[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'habits'), snap => {
      const list: Habit[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'health',
          frequency: data.frequency || 'daily',
          targetDaysPerWeek: Number(data.targetDaysPerWeek || 7),
          color: data.color || '#38bdf8',
          icon: data.icon || 'sparkles',
          completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
          streak: Number(data.streak || 0),
          bestStreak: Number(data.bestStreak || 0),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        } as Habit);
      });
      onUpdate(list);
    }, err => {
      console.warn('Firestore subscribeHabits error:', err);
    });
  }

  // ==========================================
  // --- Tasks ---
  // ==========================================
  async getTasks(): Promise<Task[]> {
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      if (snap.empty) return [];
      const list: Task[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Task);
      });
      return list;
    } catch (e) {
      console.warn('Firestore getTasks error:', e);
      return [];
    }
  }

  async saveTask(task: Task): Promise<Task> {
    try {
      const ref = doc(db, 'tasks', task.id);
      await setDoc(ref, task, { merge: true });
    } catch (e) {
      console.warn('Firestore saveTask error:', e);
    }
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      return true;
    } catch (e) {
      console.warn('Firestore deleteTask error:', e);
      return false;
    }
  }

  subscribeTasks(onUpdate: (tasks: Task[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'tasks'), snap => {
      const list: Task[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Task);
      });
      onUpdate(list);
    }, err => {
      console.warn('Firestore subscribeTasks error:', err);
    });
  }

  // ==========================================
  // --- Calendar Events ---
  // ==========================================
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const snap = await getDocs(collection(db, 'calendar_events'));
      if (snap.empty) return [];
      const list: CalendarEvent[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as CalendarEvent);
      });
      return list;
    } catch (e) {
      console.warn('Firestore getCalendarEvents error:', e);
      return [];
    }
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
    try {
      const ref = doc(db, 'calendar_events', event.id);
      await setDoc(ref, event, { merge: true });
    } catch (e) {
      console.warn('Firestore saveCalendarEvent error:', e);
    }
    return event;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'calendar_events', id));
      return true;
    } catch (e) {
      console.warn('Firestore deleteCalendarEvent error:', e);
      return false;
    }
  }

  subscribeCalendarEvents(onUpdate: (events: CalendarEvent[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'calendar_events'), snap => {
      const list: CalendarEvent[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as CalendarEvent);
      });
      onUpdate(list);
    }, err => {
      console.warn('Firestore subscribeCalendarEvents error:', err);
    });
  }

  // ==========================================
  // --- Meals & Nutrition ---
  // ==========================================
  async getMealEntries(dateStr?: string): Promise<MealEntry[]> {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    try {
      const q = query(collection(db, 'meal_entries'), where('date', '==', targetDate));
      const snap = await getDocs(q);
      const meals: MealEntry[] = [];
      snap.forEach(d => {
        const data = d.data();
        meals.push({
          id: d.id,
          mealType: data.mealType || 'snack',
          date: data.date || targetDate,
          rawText: data.rawText || '',
          items: Array.isArray(data.items) ? data.items : [],
          totalCalories: Number(data.totalCalories || 0),
          totalProtein: Number(data.totalProtein || 0),
          totalCarbs: Number(data.totalCarbs || 0),
          totalFat: Number(data.totalFat || 0),
          source: data.source || 'manual',
          timestamp: data.timestamp || new Date().toISOString()
        } as MealEntry);
      });
      return meals;
    } catch (e) {
      console.warn('Firestore getMealEntries error:', e);
      return [];
    }
  }

  async saveMealEntry(meal: MealEntry): Promise<MealEntry> {
    try {
      const ref = doc(db, 'meal_entries', meal.id);
      await setDoc(ref, meal, { merge: true });
    } catch (e) {
      console.warn('Firestore saveMealEntry error:', e);
    }
    return meal;
  }

  async deleteMealEntry(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'meal_entries', id));
      return true;
    } catch (e) {
      console.warn('Firestore deleteMealEntry error:', e);
      return false;
    }
  }

  subscribeMeals(dateStr: string, onUpdate: (meals: MealEntry[]) => void): Unsubscribe {
    const q = query(collection(db, 'meal_entries'), where('date', '==', dateStr));
    return onSnapshot(q, snap => {
      const meals: MealEntry[] = [];
      snap.forEach(d => {
        const data = d.data();
        meals.push({
          id: d.id,
          mealType: data.mealType || 'snack',
          date: data.date || dateStr,
          rawText: data.rawText || '',
          items: Array.isArray(data.items) ? data.items : [],
          totalCalories: Number(data.totalCalories || 0),
          totalProtein: Number(data.totalProtein || 0),
          totalCarbs: Number(data.totalCarbs || 0),
          totalFat: Number(data.totalFat || 0),
          source: data.source || 'manual',
          timestamp: data.timestamp || new Date().toISOString()
        } as MealEntry);
      });
      onUpdate(meals);
    }, err => {
      console.warn('Firestore subscribeMeals error:', err);
    });
  }

  async getDailyTarget(dateStr?: string): Promise<DailyNutritionTarget> {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const defaultTarget: DailyNutritionTarget = {
      date: targetDate,
      targetCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 65,
      waterIntakeMl: 1250
    };
    try {
      const ref = doc(db, 'nutrition_targets', targetDate);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        return {
          date: targetDate,
          targetCalories: Number(data.targetCalories ?? 2200),
          targetProtein: Number(data.targetProtein ?? 140),
          targetCarbs: Number(data.targetCarbs ?? 220),
          targetFat: Number(data.targetFat ?? 65),
          waterIntakeMl: Number(data.waterIntakeMl ?? 1250)
        };
      }
      // Initialize default if not present
      await setDoc(ref, defaultTarget, { merge: true });
      return defaultTarget;
    } catch (e) {
      console.warn('Firestore getDailyTarget error:', e);
      return defaultTarget;
    }
  }

  async updateDailyTarget(target: DailyNutritionTarget): Promise<DailyNutritionTarget> {
    try {
      const targetDate = target.date || new Date().toISOString().split('T')[0];
      const ref = doc(db, 'nutrition_targets', targetDate);
      await setDoc(ref, target, { merge: true });
    } catch (e) {
      console.warn('Firestore updateDailyTarget error:', e);
    }
    return target;
  }

  // ==========================================
  // --- Keep Notes ---
  // ==========================================
  async getNotes(): Promise<KeepNote[]> {
    try {
      const snap = await getDocs(collection(db, 'keep_notes'));
      if (snap.empty) return [];
      const list: KeepNote[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as KeepNote);
      });
      return list;
    } catch (e) {
      console.warn('Firestore getNotes error:', e);
      return [];
    }
  }

  async saveNote(note: KeepNote): Promise<KeepNote> {
    try {
      const ref = doc(db, 'keep_notes', note.id);
      await setDoc(ref, note, { merge: true });
    } catch (e) {
      console.warn('Firestore saveNote error:', e);
    }
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'keep_notes', id));
      return true;
    } catch (e) {
      console.warn('Firestore deleteNote error:', e);
      return false;
    }
  }

  subscribeNotes(onUpdate: (notes: KeepNote[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'keep_notes'), snap => {
      const list: KeepNote[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as KeepNote);
      });
      onUpdate(list);
    }, err => {
      console.warn('Firestore subscribeNotes error:', err);
    });
  }

  // ==========================================
  // --- Time Logs ---
  // ==========================================
  async getTimeLogs(): Promise<TimeLog[]> {
    try {
      const snap = await getDocs(collection(db, 'time_logs'));
      if (snap.empty) return [];
      const list: TimeLog[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as TimeLog);
      });
      return list;
    } catch (e) {
      console.warn('Firestore getTimeLogs error:', e);
      return [];
    }
  }

  async saveTimeLog(log: TimeLog): Promise<TimeLog> {
    try {
      const ref = doc(db, 'time_logs', log.id);
      await setDoc(ref, log, { merge: true });
    } catch (e) {
      console.warn('Firestore saveTimeLog error:', e);
    }
    return log;
  }

  subscribeTimeLogs(onUpdate: (logs: TimeLog[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'time_logs'), snap => {
      const list: TimeLog[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as TimeLog);
      });
      onUpdate(list);
    }, err => {
      console.warn('Firestore subscribeTimeLogs error:', err);
    });
  }

  // ==========================================
  // --- Cross-Device User Settings ---
  // ==========================================
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const ref = doc(db, 'user_settings', 'preferences');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserSettings;
      }
      return null;
    } catch (e) {
      console.warn('Firestore getUserSettings error:', e);
      return null;
    }
  }

  async saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const ref = doc(db, 'user_settings', 'preferences');
      await setDoc(ref, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore saveUserSettings error:', e);
    }
  }

  subscribeUserSettings(onUpdate: (settings: UserSettings) => void): Unsubscribe {
    return onSnapshot(doc(db, 'user_settings', 'preferences'), snap => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserSettings);
      }
    }, err => {
      console.warn('Firestore subscribeUserSettings error:', err);
    });
  }
}

export const firestoreClient = new FirestoreClient();
