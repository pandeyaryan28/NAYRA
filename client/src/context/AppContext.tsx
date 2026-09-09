import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  Task, 
  CalendarEvent, 
  KeepNote, 
  TimeLog, 
  OverviewStats, 
  NutritionSummaryResponse,
  Habit 
} from '../types/index.js';
import type { UIStyle, AccentColor } from '../types/theme.js';
import { api } from '../services/api.js';
import { googleClientSync } from '../services/googleClientSync.js';

export type TabType = 'overview' | 'tasks' | 'calendar' | 'habits' | 'pomodoro' | 'nutrition' | 'keep' | 'assistant';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  uiStyle: UIStyle;
  setUiStyle: (style: UIStyle) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  notes: KeepNote[];
  timeLogs: TimeLog[];
  habits: Habit[];
  nutritionData: NutritionSummaryResponse | null;
  stats: OverviewStats | null;
  authStatus: any;
  isAuthenticated: boolean;
  isGuestMode: boolean;
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
  connectGoogle: () => Promise<void>;
  connectGoogleManual: (token: string) => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  enterGuestMode: () => void;
  logout: () => Promise<void>;
  submitManualGoogleCode: (code: string) => Promise<void>;
  toggleHabit: (id: string, date?: string) => Promise<void>;
  createHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
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

  const [uiStyle, setUiStyle] = useState<UIStyle>(() => {
    const saved = localStorage.getItem('nayra_ui_style') as UIStyle;
    if (['minimal', 'glassmorphism', 'neumorphism', 'claymorphism', 'brutalism', 'cyberpunk'].includes(saved)) {
      return saved;
    }
    return 'glassmorphism';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('nayra_accent_color') as AccentColor;
    if (['indigo', 'cyan', 'emerald', 'amber', 'rose', 'violet'].includes(saved)) {
      return saved;
    }
    return 'indigo';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionSummaryResponse | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nayra_guest_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isNayraChatOpen, setIsNayraChatOpen] = useState<boolean>(false);

  const isAuthenticated = Boolean(
    authStatus?.googleConnected || 
    googleClientSync.isConnected() || 
    isGuestMode
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nayra_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-style', uiStyle);
    localStorage.setItem('nayra_ui_style', uiStyle);
  }, [uiStyle]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem('nayra_accent_color', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3800);
  };

  const refreshAll = async () => {
    try {
      const [tasksRes, calRes, notesRes, logsRes, habitsRes, nutRes, statsRes, authRes] = await Promise.all([
        api.getTasks().catch(() => ({ tasks: [] })),
        api.getCalendarEvents().catch(() => ({ events: [] })),
        api.getNotes().catch(() => ({ notes: [] })),
        api.getTimeLogs().catch(() => ({ logs: [] })),
        api.getHabits().catch(() => ({ habits: [] })),
        api.getNutritionSummary().catch(() => null),
        api.getOverviewStats().catch(() => null),
        api.getAuthStatus().catch(() => null)
      ]);

      if (tasksRes?.tasks) setTasks(tasksRes.tasks);
      if (calRes?.events) setCalendarEvents(calRes.events);
      if (notesRes?.notes) setNotes(notesRes.notes);
      if (logsRes?.logs) setTimeLogs(logsRes.logs);
      if (habitsRes?.habits) setHabits(habitsRes.habits);
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
      showToast(err.message || 'Google Tasks sync failed', 'error');
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
      showToast(err.message || 'Google Calendar sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const connectGoogle = async () => {
    try {
      // 1. Direct browser Google Identity Services popup
      try {
        const { user } = await api.connectGoogleGIS();
        localStorage.removeItem('nayra_guest_mode');
        setIsGuestMode(false);
        showToast(`Google connected as ${user.email}! Syncing live tasks & calendar...`, 'success');
        await Promise.allSettled([syncGoogleTasks(), syncGoogleCalendar()]);
        await refreshAll();
        return;
      } catch (gisErr: any) {
        console.warn('GIS popup note:', gisErr);
        if (gisErr?.message && !gisErr.message.includes('initializing')) {
          showToast(gisErr.message, 'warning');
          return;
        }
      }

      // 2. Fallback to server auth URL if server is configured
      const res = await api.getGoogleAuthUrl();
      if (res.url) {
        window.location.href = res.url;
      } else {
        showToast('Click Connect Google to sign in, or paste an Access Token directly.', 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'Error connecting Google account', 'error');
      throw e;
    }
  };

  const connectGoogleManual = async (token: string) => {
    try {
      const res = await api.connectGoogleManual(token);
      localStorage.removeItem('nayra_guest_mode');
      setIsGuestMode(false);
      showToast(`Google Account linked: ${res.user.email}!`, 'success');
      await Promise.allSettled([syncGoogleTasks(), syncGoogleCalendar()]);
      await refreshAll();
    } catch (e: any) {
      showToast(e.message || 'Invalid or expired Google token', 'error');
      throw e;
    }
  };

  const enterGuestMode = () => {
    localStorage.setItem('nayra_guest_mode', 'true');
    setIsGuestMode(true);
    showToast('Entered Command Center in Offline Terminal mode.', 'info');
    refreshAll();
  };

  const logout = async () => {
    googleClientSync.disconnect();
    localStorage.removeItem('nayra_guest_mode');
    setIsGuestMode(false);
    try {
      await api.logoutGoogle();
    } catch {}
    setAuthStatus({
      authenticated: false,
      isGuest: false,
      googleConnected: false,
      user: null
    });
    showToast('Terminal session locked. Signed out.', 'info');
    await refreshAll();
  };

  const disconnectGoogle = async () => {
    await logout();
  };

  const submitManualGoogleCode = async (code: string) => {
    try {
      const res = await api.manualGoogleConnect(code);
      showToast(res.message || 'Google Account linked successfully!', 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message || 'Failed to exchange authorization code', 'error');
      throw e;
    }
  };

  // --- Habits Actions ---
  const toggleHabit = async (id: string, date?: string) => {
    try {
      const res = await api.toggleHabit(id, date);
      if (res.habit) {
        setHabits(prev => prev.map(h => h.id === id ? res.habit : h));
        const targetDate = date || new Date().toISOString().split('T')[0];
        const isDone = res.habit.completedDates.includes(targetDate);
        showToast(
          isDone ? `Completed "${res.habit.title}"! 🔥 Streak: ${res.habit.streak} days` : `Unchecked "${res.habit.title}"`,
          'success'
        );
        api.getOverviewStats().then(s => setStats(s)).catch(() => {});
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to toggle habit', 'error');
    }
  };

  const createHabit = async (habitData: Partial<Habit>) => {
    try {
      const res = await api.createHabit(habitData);
      if (res.habit) {
        setHabits(prev => [...prev, res.habit]);
        showToast(`Habit "${res.habit.title}" created!`, 'success');
        api.getOverviewStats().then(s => setStats(s)).catch(() => {});
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to create habit', 'error');
    }
  };

  const updateHabit = async (id: string, habitData: Partial<Habit>) => {
    try {
      const res = await api.updateHabit(id, habitData);
      if (res.habit) {
        setHabits(prev => prev.map(h => h.id === id ? res.habit : h));
        showToast(`Habit updated`, 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update habit', 'error');
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await api.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
      showToast('Habit removed', 'info');
      api.getOverviewStats().then(s => setStats(s)).catch(() => {});
    } catch (e: any) {
      showToast(e.message || 'Failed to delete habit', 'error');
    }
  };

  useEffect(() => {
    // Check URL parameters for OAuth redirect results
    const params = new URLSearchParams(window.location.search);
    const authStatusParam = params.get('auth');
    if (authStatusParam === 'success') {
      showToast('Google Account linked successfully! Real sync active.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatusParam === 'failed' || authStatusParam === 'error') {
      const msg = params.get('msg');
      showToast(msg ? `Google Link Error: ${msg}` : 'Google Authentication was cancelled or failed.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    refreshAll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === ',' || e.key === 'p')) {
        e.preventDefault();
        setIsSettingsOpen(prev => !prev);
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
        uiStyle,
        setUiStyle,
        accentColor,
        setAccentColor,
        isSettingsOpen,
        setIsSettingsOpen,
        tasks,
        calendarEvents,
        notes,
        timeLogs,
        habits,
        nutritionData,
        stats,
        authStatus,
        isAuthenticated,
        isGuestMode,
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
        connectGoogle,
        connectGoogleManual,
        disconnectGoogle,
        enterGuestMode,
        logout,
        submitManualGoogleCode,
        toggleHabit,
        createHabit,
        updateHabit,
        deleteHabit,
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
