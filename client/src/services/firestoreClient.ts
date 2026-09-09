import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import type { 
  Habit, 
  MealEntry, 
  DailyNutritionTarget, 
  Task, 
  KeepNote, 
  TimeLog 
} from '../types/index.js';

export class FirestoreClient {
  // --- Habits ---
  async getHabits(): Promise<Habit[] | null> {
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
      return null;
    }
  }

  async saveHabit(habit: Habit): Promise<Habit | null> {
    try {
      const ref = doc(db, 'habits', habit.id);
      await setDoc(ref, habit, { merge: true });
      return habit;
    } catch (e) {
      console.warn('Firestore saveHabit error:', e);
      return null;
    }
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

  // --- Meals & Nutrition ---
  async getMealEntries(dateStr?: string): Promise<MealEntry[] | null> {
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
      return null;
    }
  }

  async saveMealEntry(meal: MealEntry): Promise<MealEntry | null> {
    try {
      const ref = doc(db, 'meal_entries', meal.id);
      await setDoc(ref, meal, { merge: true });
      return meal;
    } catch (e) {
      console.warn('Firestore saveMealEntry error:', e);
      return null;
    }
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

  async getDailyTarget(dateStr?: string): Promise<DailyNutritionTarget | null> {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    try {
      const ref = doc(db, 'nutrition_targets', targetDate);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as DailyNutritionTarget;
      }
      return null;
    } catch (e) {
      console.warn('Firestore getDailyTarget error:', e);
      return null;
    }
  }

  async updateDailyTarget(target: DailyNutritionTarget): Promise<DailyNutritionTarget | null> {
    try {
      const targetDate = target.date || new Date().toISOString().split('T')[0];
      const ref = doc(db, 'nutrition_targets', targetDate);
      await setDoc(ref, target, { merge: true });
      return target;
    } catch (e) {
      console.warn('Firestore updateDailyTarget error:', e);
      return null;
    }
  }

  // --- Tasks ---
  async getTasks(): Promise<Task[] | null> {
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
      return null;
    }
  }

  async saveTask(task: Task): Promise<Task | null> {
    try {
      const ref = doc(db, 'tasks', task.id);
      await setDoc(ref, task, { merge: true });
      return task;
    } catch (e) {
      console.warn('Firestore saveTask error:', e);
      return null;
    }
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

  // --- Keep Notes ---
  async getNotes(): Promise<KeepNote[] | null> {
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
      return null;
    }
  }

  async saveNote(note: KeepNote): Promise<KeepNote | null> {
    try {
      const ref = doc(db, 'keep_notes', note.id);
      await setDoc(ref, note, { merge: true });
      return note;
    } catch (e) {
      console.warn('Firestore saveNote error:', e);
      return null;
    }
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

  // --- Time Logs ---
  async getTimeLogs(): Promise<TimeLog[] | null> {
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
      return null;
    }
  }

  async saveTimeLog(log: TimeLog): Promise<TimeLog | null> {
    try {
      const ref = doc(db, 'time_logs', log.id);
      await setDoc(ref, log, { merge: true });
      return log;
    } catch (e) {
      console.warn('Firestore saveTimeLog error:', e);
      return null;
    }
  }
}

export const firestoreClient = new FirestoreClient();
