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

const API_BASE = '/api';

export const api = {
  // --- Auth & Google Link ---
  async getAuthStatus() {
    try {
      const res = await fetch(`${API_BASE}/auth/status`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      authenticated: true,
      isMock: false,
      googleConnected: false,
      googleConfigured: true,
      user: {
        name: 'Aryan Pandey',
        email: 'aryan@nayra.command',
        picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
      }
    };
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
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true };
  },

  // --- Tasks ---
  async getTasks(): Promise<{ tasks: Task[] }> {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { tasks: nayraBackend.getTasks() };
  },

  async createTask(task: Partial<Task>): Promise<{ task: Task }> {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { task: nayraBackend.createTask(task) };
  },

  async updateTask(id: string, task: Partial<Task>): Promise<{ task: Task }> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { task: nayraBackend.updateTask(id, task) };
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: nayraBackend.deleteTask(id) };
  },

  async syncTasks(): Promise<{ success: boolean; syncedCount: number; message: string; tasks?: Task[] }> {
    try {
      const res = await fetch(`${API_BASE}/tasks/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    const tasks = nayraBackend.getTasks();
    return { success: true, syncedCount: tasks.length, message: `Local snapshot synchronized.`, tasks };
  },

  // --- Calendar ---
  async getCalendarEvents(): Promise<{ events: CalendarEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/calendar`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { events: nayraBackend.getCalendarEvents() };
  },

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    try {
      const res = await fetch(`${API_BASE}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { event: nayraBackend.createCalendarEvent(event) };
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
    try {
      const res = await fetch(`${API_BASE}/calendar/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: nayraBackend.deleteCalendarEvent(id) };
  },

  async syncCalendar(): Promise<{ success: boolean; syncedCount: number; message: string; events?: CalendarEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/calendar/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    const events = nayraBackend.getCalendarEvents();
    return { success: true, syncedCount: events.length, message: `Local snapshot synchronized.`, events };
  },

  // --- Habits ---
  async getHabits(): Promise<{ habits: Habit[] }> {
    try {
      const res = await fetch(`${API_BASE}/habits`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { habits: [] };
  },

  async createHabit(habit: Partial<Habit>): Promise<{ habit: Habit }> {
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    throw new Error('Failed to create habit');
  },

  async updateHabit(id: string, habit: Partial<Habit>): Promise<{ habit: Habit }> {
    try {
      const res = await fetch(`${API_BASE}/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    throw new Error('Failed to update habit');
  },

  async toggleHabit(id: string, date?: string): Promise<{ success: boolean; habit: Habit; isCompletedToday: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/habits/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    throw new Error('Failed to toggle habit');
  },

  async deleteHabit(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/habits/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: false };
  },

  async getHabitsStats(): Promise<HabitStatsResponse> {
    try {
      const res = await fetch(`${API_BASE}/habits/stats`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      totalHabits: 0,
      completedTodayCount: 0,
      completionRateToday: 0,
      bestActiveStreak: 0,
      overallBestStreak: 0,
      habits: []
    };
  },

  // --- Keep Notes ---
  async getNotes(): Promise<{ notes: KeepNote[] }> {
    try {
      const res = await fetch(`${API_BASE}/keep`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { notes: nayraBackend.getNotes() };
  },

  async createNote(note: Partial<KeepNote>): Promise<{ note: KeepNote }> {
    try {
      const res = await fetch(`${API_BASE}/keep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { note: nayraBackend.createNote(note) };
  },

  async updateNote(id: string, note: Partial<KeepNote>): Promise<{ note: KeepNote }> {
    try {
      const res = await fetch(`${API_BASE}/keep/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { note: nayraBackend.updateNote(id, note) };
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/keep/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: nayraBackend.deleteNote(id) };
  },

  // --- Pomodoro & Time Tracking ---
  async getTimeLogs(): Promise<{ logs: TimeLog[] }> {
    try {
      const res = await fetch(`${API_BASE}/pomodoro/logs`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { logs: nayraBackend.getTimeLogs() };
  },

  async logTime(entry: Partial<TimeLog>): Promise<{ log: TimeLog }> {
    try {
      const res = await fetch(`${API_BASE}/pomodoro/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { log: nayraBackend.logTime(entry) };
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
    try {
      const url = date ? `${API_BASE}/calories?date=${date}` : `${API_BASE}/calories`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}
    return nayraBackend.getNutritionSummary(date);
  },

  async addMealFromText(text: string, mealType?: string): Promise<{ success: boolean; message: string; meal: MealEntry }> {
    try {
      const res = await fetch(`${API_BASE}/calories/add-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mealType })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return nayraBackend.addMealFromText(text, mealType);
  },

  async deleteMeal(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/calories/meal/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: nayraBackend.deleteMeal(id) };
  },

  async updateDailyTarget(target: Partial<DailyNutritionTarget>): Promise<{ target: DailyNutritionTarget }> {
    try {
      const res = await fetch(`${API_BASE}/calories/target`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { target: target as DailyNutritionTarget };
  },

  async logWater(amountMl: number = 250): Promise<{ success: boolean; waterIntakeMl: number }> {
    try {
      const res = await fetch(`${API_BASE}/calories/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return nayraBackend.logWater(amountMl);
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
        total: 0,
        completedToday: 0,
        completionRate: 0,
        bestStreak: 0
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
