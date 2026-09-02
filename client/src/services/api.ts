import { Task, CalendarEvent, KeepNote, TimeLog, MealEntry, DailyNutritionTarget, OverviewStats, NutritionSummaryResponse } from '../types/index.js';

const API_BASE = '/api';

export const api = {
  // --- Auth ---
  async getAuthStatus() {
    const res = await fetch(`${API_BASE}/auth/status`);
    return res.json();
  },
  async getGoogleAuthUrl() {
    const res = await fetch(`${API_BASE}/auth/google/url`);
    return res.json();
  },
  async mockConnect() {
    const res = await fetch(`${API_BASE}/auth/mock-connect`, { method: 'POST' });
    return res.json();
  },
  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    return res.json();
  },

  // --- Tasks ---
  async getTasks(): Promise<{ tasks: Task[] }> {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },
  async createTask(task: Partial<Task>): Promise<{ task: Task }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.json();
  },
  async updateTask(id: string, task: Partial<Task>): Promise<{ task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.json();
  },
  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async syncTasks(): Promise<{ success: boolean; syncedCount: number; message: string; tasks: Task[] }> {
    const res = await fetch(`${API_BASE}/tasks/sync`, { method: 'POST' });
    return res.json();
  },

  // --- Calendar ---
  async getCalendarEvents(): Promise<{ events: CalendarEvent[] }> {
    const res = await fetch(`${API_BASE}/calendar`);
    return res.json();
  },
  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    const res = await fetch(`${API_BASE}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return res.json();
  },
  async updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    const res = await fetch(`${API_BASE}/calendar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return res.json();
  },
  async deleteCalendarEvent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/calendar/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async syncCalendar(): Promise<{ success: boolean; syncedCount: number; message: string; events: CalendarEvent[] }> {
    const res = await fetch(`${API_BASE}/calendar/sync`, { method: 'POST' });
    return res.json();
  },

  // --- Keep Notes ---
  async getNotes(): Promise<{ notes: KeepNote[] }> {
    const res = await fetch(`${API_BASE}/keep`);
    return res.json();
  },
  async createNote(note: Partial<KeepNote>): Promise<{ note: KeepNote }> {
    const res = await fetch(`${API_BASE}/keep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    return res.json();
  },
  async updateNote(id: string, note: Partial<KeepNote>): Promise<{ note: KeepNote }> {
    const res = await fetch(`${API_BASE}/keep/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    return res.json();
  },
  async deleteNote(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/keep/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // --- Pomodoro & Time Tracking ---
  async getTimeLogs(): Promise<{ logs: TimeLog[] }> {
    const res = await fetch(`${API_BASE}/pomodoro/logs`);
    return res.json();
  },
  async logTime(entry: Partial<TimeLog>): Promise<{ log: TimeLog }> {
    const res = await fetch(`${API_BASE}/pomodoro/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.json();
  },
  async getPomodoroStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/pomodoro/stats`);
    return res.json();
  },

  // --- Nutrition & Calorie Tracking ---
  async getNutritionSummary(date?: string): Promise<NutritionSummaryResponse> {
    const url = date ? `${API_BASE}/calories?date=${date}` : `${API_BASE}/calories`;
    const res = await fetch(url);
    return res.json();
  },
  async addMealFromText(text: string, mealType?: string): Promise<{ success: boolean; message: string; meal: MealEntry }> {
    const res = await fetch(`${API_BASE}/calories/add-meal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mealType })
    });
    return res.json();
  },
  async deleteMeal(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/calories/meal/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async updateDailyTarget(target: Partial<DailyNutritionTarget>): Promise<{ target: DailyNutritionTarget }> {
    const res = await fetch(`${API_BASE}/calories/target`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target)
    });
    return res.json();
  },
  async logWater(amountMl: number = 250): Promise<{ success: boolean; waterIntakeMl: number }> {
    const res = await fetch(`${API_BASE}/calories/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountMl })
    });
    return res.json();
  },

  // --- Assistant & Briefing ---
  async getBriefing(): Promise<any> {
    const res = await fetch(`${API_BASE}/assistant/briefing`);
    return res.json();
  },
  async chatWithNayra(message: string): Promise<{ reply: string; actionTaken?: any; timestamp: string }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  // --- Global Stats ---
  async getOverviewStats(): Promise<OverviewStats> {
    const res = await fetch(`${API_BASE}/stats/overview`);
    return res.json();
  }
};
