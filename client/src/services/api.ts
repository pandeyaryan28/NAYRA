import type { 
  Task, 
  CalendarEvent, 
  KeepNote, 
  TimeLog, 
  MealEntry, 
  DailyNutritionTarget, 
  OverviewStats, 
  NutritionSummaryResponse,
  Habit,
  HabitStatsResponse
} from '../types/index.js';
import { nayraBackend } from './store.js';
import { googleClientSync } from './googleClientSync.js';
import { firestoreClient } from './firestoreClient.js';

const API_BASE = '/api';

export const api = {
  // --- Auth & Google Link ---
  async getAuthStatus() {
    // 1. Client-side GIS Google Token
    if (googleClientSync.isConnected()) {
      const storedUser = googleClientSync.getStoredUser();
      return {
        authenticated: true,
        isGuest: false,
        isMock: false,
        googleConnected: true,
        googleConfigured: true,
        user: {
          name: storedUser?.name || 'Aryan Pandey',
          email: storedUser?.email || 'aaryanpandey28@gmail.com',
          picture: storedUser?.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=AryanPandey'
        }
      };
    }

    // 2. Client-side Guest / Offline terminal mode
    if (typeof localStorage !== 'undefined' && localStorage.getItem('nayra_guest_mode') === 'true') {
      return {
        authenticated: true,
        isGuest: true,
        isMock: false,
        googleConnected: false,
        googleConfigured: true,
        user: {
          name: 'Aryan Pandey (Offline)',
          email: 'offline@nayra.terminal',
          picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=AryanOffline'
        }
      };
    }

    // 3. Server-side session check if backend is running
    try {
      const res = await fetch(`${API_BASE}/auth/status`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {}

    return {
      authenticated: false,
      isGuest: false,
      isMock: false,
      googleConnected: false,
      googleConfigured: true,
      user: null
    };
  },

  async connectGoogleGIS(): Promise<{ accessToken: string; user: any }> {
    return await googleClientSync.promptGoogleLogin();
  },

  async connectGoogleManual(token: string): Promise<{ success: boolean; user: any }> {
    return await googleClientSync.connectWithManualToken(token);
  },

  async getGoogleAuthUrl(): Promise<{ url?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/google/url`);
      if (res.ok) return await res.json();
      const err = await res.json();
      return { error: err.error || 'Failed to generate auth url' };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async manualGoogleConnect(code: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const res = await fetch(`${API_BASE}/auth/google/manual-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to exchange authorization code');
    } catch (e: any) {
      throw e;
    }
  },

  async logoutGoogle() {
    googleClientSync.disconnect();
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {}
    return { success: true };
  },

  // --- Tasks ---
  async getTasks(): Promise<{ tasks: Task[] }> {
    if (googleClientSync.isConnected()) {
      try {
        const googleTasks = await googleClientSync.fetchGoogleTasks();
        if (googleTasks.length > 0 || !nayraBackend.getTasks().length) {
          return { tasks: googleTasks };
        }
      } catch (err) {
        console.warn('Could not fetch from Google Tasks API, using cached tasks:', err);
      }
    }
    // 1. Try local Express API if running
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) {
        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) return data;
      }
    } catch (e) {}

    // 2. Query persistent cloud Firestore backend
    try {
      const fsTasks = await firestoreClient.getTasks();
      if (fsTasks && fsTasks.length > 0) {
        return { tasks: fsTasks };
      }
    } catch (e) {}

    return { tasks: nayraBackend.getTasks() };
  },

  async createTask(task: Partial<Task>): Promise<{ task: Task }> {
    let googleTaskItem: Task | null = null;
    if (googleClientSync.isConnected()) {
      googleTaskItem = await googleClientSync.createGoogleTask(task);
    }
    const finalData = googleTaskItem ? { ...task, ...googleTaskItem } : task;
    const created = nayraBackend.createTask(finalData);

    // Save to Firestore cloud backend
    try {
      await firestoreClient.saveTask(created);
    } catch (e) {}

    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (e) {}

    return { task: created };
  },

  async updateTask(id: string, task: Partial<Task>): Promise<{ task: Task }> {
    const existing = nayraBackend.getTasks().find(t => t.id === id);
    const googleId = task.googleTaskId || existing?.googleTaskId;
    const taskListId = task.googleTaskListId || existing?.googleTaskListId || '@default';
    if (googleClientSync.isConnected() && googleId) {
      googleClientSync.updateGoogleTask(googleId, task, taskListId).catch(() => {});
    }
    const updated = nayraBackend.updateTask(id, task);

    // Save to Firestore cloud backend
    try {
      await firestoreClient.saveTask(updated);
    } catch (e) {}

    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
    } catch (e) {}

    return { task: updated };
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const existing = nayraBackend.getTasks().find(t => t.id === id);
    if (googleClientSync.isConnected() && existing?.googleTaskId) {
      googleClientSync.deleteGoogleTask(existing.googleTaskId, existing.googleTaskListId || '@default').catch(() => {});
    }
    nayraBackend.deleteTask(id);

    // Delete from Firestore cloud backend
    try {
      await firestoreClient.deleteTask(id);
    } catch (e) {}

    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return { success: true };
  },

  async syncTasks(): Promise<{ success: boolean; syncedCount: number; message: string; tasks?: Task[] }> {
    if (googleClientSync.isConnected()) {
      try {
        const tasks = await googleClientSync.fetchGoogleTasks();
        return {
          success: true,
          syncedCount: tasks.length,
          message: `Synchronized ${tasks.length} live Google Tasks.`,
          tasks
        };
      } catch (err: any) {
        return {
          success: false,
          syncedCount: 0,
          message: `Google Tasks sync error: ${err.message}`,
          tasks: nayraBackend.getTasks()
        };
      }
    }
    try {
      const res = await fetch(`${API_BASE}/tasks/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    const tasks = nayraBackend.getTasks();
    return { success: true, syncedCount: tasks.length, message: `Tasks up to date.`, tasks };
  },

  // --- Calendar ---
  async getCalendarEvents(): Promise<{ events: CalendarEvent[] }> {
    if (googleClientSync.isConnected()) {
      try {
        const googleEvents = await googleClientSync.fetchGoogleCalendarEvents();
        if (googleEvents.length > 0 || !nayraBackend.getCalendarEvents().length) {
          return { events: googleEvents };
        }
      } catch (err) {
        console.warn('Could not fetch from Google Calendar API, using cached events:', err);
      }
    }
    try {
      const res = await fetch(`${API_BASE}/calendar`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { events: nayraBackend.getCalendarEvents() };
  },

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    let googleEventItem: CalendarEvent | null = null;
    if (googleClientSync.isConnected()) {
      googleEventItem = await googleClientSync.createGoogleEvent(event);
    }
    const finalData = googleEventItem ? { ...event, ...googleEventItem } : event;
    try {
      const res = await fetch(`${API_BASE}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { event: nayraBackend.createCalendarEvent(finalData) };
  },

  async updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    try {
      const res = await fetch(`${API_BASE}/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { event: nayraBackend.updateCalendarEvent(id, event) };
  },

  async deleteCalendarEvent(id: string): Promise<{ success: boolean }> {
    const existing = nayraBackend.getCalendarEvents().find(e => e.id === id);
    if (googleClientSync.isConnected() && existing?.googleEventId) {
      googleClientSync.deleteGoogleEvent(existing.googleEventId).catch(() => {});
    }
    try {
      const res = await fetch(`${API_BASE}/calendar/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: nayraBackend.deleteCalendarEvent(id) };
  },

  async syncCalendar(): Promise<{ success: boolean; syncedCount: number; message: string; events?: CalendarEvent[] }> {
    if (googleClientSync.isConnected()) {
      try {
        const events = await googleClientSync.fetchGoogleCalendarEvents();
        return {
          success: true,
          syncedCount: events.length,
          message: `Synchronized ${events.length} live Google Calendar events.`,
          events
        };
      } catch (err: any) {
        return {
          success: false,
          syncedCount: 0,
          message: `Google Calendar sync error: ${err.message}`,
          events: nayraBackend.getCalendarEvents()
        };
      }
    }
    try {
      const res = await fetch(`${API_BASE}/calendar/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    const events = nayraBackend.getCalendarEvents();
    return { success: true, syncedCount: events.length, message: `Calendar up to date.`, events };
  },

  // --- Habits ---
  async getHabits(): Promise<{ habits: Habit[] }> {
    // 1. Try local Express API if running
    try {
      const res = await fetch(`${API_BASE}/habits`);
      if (res.ok) {
        const data = await res.json();
        if (data.habits && data.habits.length > 0) return data;
      }
    } catch (e) {}

    // 2. Query persistent cloud Firestore backend
    try {
      const fsHabits = await firestoreClient.getHabits();
      if (fsHabits && fsHabits.length > 0) {
        return { habits: fsHabits };
      }
    } catch (e) {}

    return { habits: nayraBackend.getHabits() };
  },

  async createHabit(habit: Partial<Habit>): Promise<{ habit: Habit }> {
    const created = nayraBackend.createHabit(habit);
    try {
      await firestoreClient.saveHabit(created);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (e) {}
    return { habit: created };
  },

  async updateHabit(id: string, habit: Partial<Habit>): Promise<{ habit: Habit }> {
    const updated = nayraBackend.updateHabit(id, habit);
    try {
      await firestoreClient.saveHabit(updated);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit)
      });
    } catch (e) {}
    return { habit: updated };
  },

  async toggleHabit(id: string, date?: string): Promise<{ success: boolean; habit: Habit; isCompletedToday: boolean }> {
    const res = nayraBackend.toggleHabit(id, date);
    try {
      await firestoreClient.saveHabit(res.habit);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/habits/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
    } catch (e) {}
    return res;
  },

  async deleteHabit(id: string): Promise<{ success: boolean }> {
    nayraBackend.deleteHabit(id);
    try {
      await firestoreClient.deleteHabit(id);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/habits/${id}`, { method: 'DELETE' });
    } catch (e) {}
    return { success: true };
  },

  async getHabitsStats(): Promise<HabitStatsResponse> {
    try {
      const res = await fetch(`${API_BASE}/habits/stats`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return nayraBackend.getHabitsStats();
  },

  // --- Keep Notes ---
  async getNotes(): Promise<{ notes: KeepNote[] }> {
    try {
      const res = await fetch(`${API_BASE}/keep`);
      if (res.ok) {
        const data = await res.json();
        if (data.notes && data.notes.length > 0) return data;
      }
    } catch (e) {}

    try {
      const fsNotes = await firestoreClient.getNotes();
      if (fsNotes && fsNotes.length > 0) {
        return { notes: fsNotes };
      }
    } catch (e) {}

    return { notes: nayraBackend.getNotes() };
  },

  async createNote(note: Partial<KeepNote>): Promise<{ note: KeepNote }> {
    const created = nayraBackend.createNote(note);
    try {
      await firestoreClient.saveNote(created);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/keep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (e) {}
    return { note: created };
  },

  async updateNote(id: string, note: Partial<KeepNote>): Promise<{ note: KeepNote }> {
    const updated = nayraBackend.updateNote(id, note);
    try {
      await firestoreClient.saveNote(updated);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/keep/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
    } catch (e) {}
    return { note: updated };
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    nayraBackend.deleteNote(id);
    try {
      await firestoreClient.deleteNote(id);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/keep/${id}`, { method: 'DELETE' });
    } catch (e) {}
    return { success: true };
  },

  // --- Pomodoro & Time Tracking ---
  async getTimeLogs(): Promise<{ logs: TimeLog[] }> {
    try {
      const res = await fetch(`${API_BASE}/pomodoro/logs`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) return data;
      }
    } catch (e) {}

    try {
      const fsLogs = await firestoreClient.getTimeLogs();
      if (fsLogs && fsLogs.length > 0) {
        return { logs: fsLogs };
      }
    } catch (e) {}

    return { logs: nayraBackend.getTimeLogs() };
  },

  async logTime(entry: Partial<TimeLog>): Promise<{ log: TimeLog }> {
    const created = nayraBackend.logTime(entry);
    try {
      await firestoreClient.saveTimeLog(created);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/pomodoro/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (e) {}
    return { log: created };
  },

  async getPomodoroStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/pomodoro/stats`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const logs = nayraBackend.getTimeLogs();
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.timestamp.startsWith(today));
    const totalMinutesToday = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    return { totalMinutesToday, sessionCount: todayLogs.length };
  },

  // --- Nutrition & Calorie Tracking ---
  async getNutritionSummary(date?: string): Promise<NutritionSummaryResponse> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      const url = `${API_BASE}/calories?date=${targetDate}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.meals && data.meals.length > 0) return data;
      }
    } catch (e) {}

    try {
      const fsMeals = await firestoreClient.getMealEntries(targetDate);
      const fsTarget = await firestoreClient.getDailyTarget(targetDate);
      if (fsMeals && (fsMeals.length > 0 || fsTarget)) {
        const target = fsTarget || {
          date: targetDate,
          targetCalories: 2200,
          targetProtein: 140,
          targetCarbs: 220,
          targetFat: 65,
          waterIntakeMl: 1250
        };

        const consumedCalories = fsMeals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
        const consumedProtein = Number(fsMeals.reduce((acc, m) => acc + (m.totalProtein || 0), 0).toFixed(1));
        const consumedCarbs = Number(fsMeals.reduce((acc, m) => acc + (m.totalCarbs || 0), 0).toFixed(1));
        const consumedFat = Number(fsMeals.reduce((acc, m) => acc + (m.totalFat || 0), 0).toFixed(1));

        const mealBreakdown = {
          breakfast: fsMeals.filter(m => m.mealType === 'breakfast').reduce((acc, m) => acc + (m.totalCalories || 0), 0),
          lunch: fsMeals.filter(m => m.mealType === 'lunch').reduce((acc, m) => acc + (m.totalCalories || 0), 0),
          dinner: fsMeals.filter(m => m.mealType === 'dinner').reduce((acc, m) => acc + (m.totalCalories || 0), 0),
          snack: fsMeals.filter(m => m.mealType === 'snack').reduce((acc, m) => acc + (m.totalCalories || 0), 0)
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
            waterIntakeMl: target.waterIntakeMl,
            mealBreakdown
          },
          meals: fsMeals
        };
      }
    } catch (e) {}

    return nayraBackend.getNutritionSummary(targetDate);
  },

  async addMealFromText(text: string, mealType?: string): Promise<{ success: boolean; message: string; meal: MealEntry }> {
    const res = nayraBackend.addMealFromText(text, mealType);
    try {
      await firestoreClient.saveMealEntry(res.meal);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/calories/add-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mealType })
      });
    } catch (e) {}
    return res;
  },

  async deleteMeal(id: string): Promise<{ success: boolean }> {
    nayraBackend.deleteMeal(id);
    try {
      await firestoreClient.deleteMealEntry(id);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/calories/meal/${id}`, { method: 'DELETE' });
    } catch (e) {}
    return { success: true };
  },

  async updateDailyTarget(target: Partial<DailyNutritionTarget>): Promise<{ target: DailyNutritionTarget }> {
    const targetDate = target.date || new Date().toISOString().split('T')[0];
    const fullTarget: DailyNutritionTarget = {
      date: targetDate,
      targetCalories: target.targetCalories || 2200,
      targetProtein: target.targetProtein || 140,
      targetCarbs: target.targetCarbs || 220,
      targetFat: target.targetFat || 65,
      waterIntakeMl: target.waterIntakeMl || 1250
    };
    try {
      await firestoreClient.updateDailyTarget(fullTarget);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/calories/target`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullTarget)
      });
    } catch (e) {}
    return { target: fullTarget };
  },

  async logWater(amountMl: number = 250): Promise<{ success: boolean; waterIntakeMl: number }> {
    const res = nayraBackend.logWater(amountMl);
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      let target = await firestoreClient.getDailyTarget(todayStr);
      if (!target) {
        target = {
          date: todayStr,
          targetCalories: 2200,
          targetProtein: 140,
          targetCarbs: 220,
          targetFat: 65,
          waterIntakeMl: res.waterIntakeMl
        };
      } else {
        target.waterIntakeMl = res.waterIntakeMl;
      }
      await firestoreClient.updateDailyTarget(target);
    } catch (e) {}
    try {
      await fetch(`${API_BASE}/calories/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl })
      });
    } catch (e) {}
    return res;
  },

  // --- Assistant & Briefing ---
  async getBriefing(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/assistant/briefing`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return nayraBackend.getBriefing();
  },

  async chatWithNayra(message: string): Promise<{ reply: string; actionTaken?: any; timestamp: string }> {
    try {
      const res = await fetch(`${API_BASE}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return nayraBackend.chatWithNayra(message);
  },

  // --- Global Stats ---
  async getOverviewStats(): Promise<OverviewStats> {
    try {
      const res = await fetch(`${API_BASE}/stats/overview`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const tasks = nayraBackend.getTasks();
    const events = nayraBackend.getCalendarEvents();
    const notes = nayraBackend.getNotes();
    const logs = nayraBackend.getTimeLogs();
    const nut = nayraBackend.getNutritionSummary();

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.timestamp.startsWith(today));
    const focusMinutesToday = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;
    const urgentTasks = tasks.filter(t => t.priority === 'urgent').length;
    const habitStats = nayraBackend.getHabitsStats();

    return {
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        urgent: urgentTasks,
        completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
      },
      calendar: {
        totalEvents: events.length,
        todayEvents: events.filter(e => e.startTime.startsWith(today)).length
      },
      notes: {
        totalNotes: notes.length,
        pinnedNotes: notes.filter(n => n.isPinned).length
      },
      habits: {
        total: habitStats.totalHabits,
        completedToday: habitStats.completedTodayCount,
        completionRate: habitStats.completionRateToday,
        bestStreak: habitStats.bestActiveStreak
      },
      pomodoro: {
        focusMinutesToday,
        totalSessions: logs.length
      },
      nutrition: {
        caloriesConsumed: nut.summary.consumedCalories,
        targetCalories: nut.summary.targetCalories,
        proteinConsumed: nut.summary.consumedProtein,
        waterIntakeMl: nut.summary.waterIntakeMl
      },
      projectsCount: 1
    };
  }
};
