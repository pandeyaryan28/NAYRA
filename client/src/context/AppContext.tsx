import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, CalendarEvent, KeepNote, TimeLog, OverviewStats, NutritionSummaryResponse } from '../types/index.js';
import { api } from '../services/api.js';

export type TabType = 'overview' | 'tasks' | 'calendar' | 'pomodoro' | 'nutrition' | 'keep' | 'assistant';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  notes: KeepNote[];
  timeLogs: TimeLog[];
  nutritionData: NutritionSummaryResponse | null;
  stats: OverviewStats | null;
  authStatus: { authenticated: boolean; isMock: boolean; user: any } | null;
  isLoading: boolean;
  isSyncing: boolean;
  notification: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNayraChatOpen: boolean;
  setIsNayraChatOpen: (open: boolean) => void;
  refreshAll: () => Promise<void>;
  syncGoogleTasks: () => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nayra_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionSummaryResponse | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isNayraChatOpen, setIsNayraChatOpen] = useState<boolean>(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nayra_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const refreshAll = async () => {
    try {
      const [tasksRes, calRes, notesRes, logsRes, nutRes, statsRes, authRes] = await Promise.all([
        api.getTasks().catch(() => ({ tasks: [] })),
        api.getCalendarEvents().catch(() => ({ events: [] })),
        api.getNotes().catch(() => ({ notes: [] })),
        api.getTimeLogs().catch(() => ({ logs: [] })),
        api.getNutritionSummary().catch(() => null),
        api.getOverviewStats().catch(() => null),
        api.getAuthStatus().catch(() => null)
      ]);

      if (tasksRes?.tasks) setTasks(tasksRes.tasks);
      if (calRes?.events) setCalendarEvents(calRes.events);
      if (notesRes?.notes) setNotes(notesRes.notes);
      if (logsRes?.logs) setTimeLogs(logsRes.logs);
      if (nutRes) setNutritionData(nutRes);
      if (statsRes) setStats(statsRes);
      if (authRes) setAuthStatus(authRes);
    } catch (e) {
      console.error('Error refreshing app state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const syncGoogleTasks = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncTasks();
      if (res.tasks) setTasks(res.tasks);
      showToast(res.message, res.success ? 'success' : 'warning');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncGoogleCalendar = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncCalendar();
      if (res.events) setCalendarEvents(res.events);
      showToast(res.message, res.success ? 'success' : 'warning');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshAll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        tasks,
        calendarEvents,
        notes,
        timeLogs,
        nutritionData,
        stats,
        authStatus,
        isLoading,
        isSyncing,
        notification,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNayraChatOpen,
        setIsNayraChatOpen,
        refreshAll,
        syncGoogleTasks,
        syncGoogleCalendar,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
