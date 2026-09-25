import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export type TabType = 'overview' | 'tasks' | 'calendar' | 'habits' | 'pomodoro' | 'nutrition' | 'keep' | 'assistant' | 'ca-tracker' | 'scint-engine';

export type FocusSessionType = 'focus' | 'deep_focus' | 'short_break' | 'long_break';

export interface FocusTimerState {
  timeLeft: number;
  isRunning: boolean;
  sessionType: FocusSessionType;
  selectedTaskId: string;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setSessionType: (type: FocusSessionType) => void;
  setSelectedTaskId: (id: string) => void;
  completeTimer: () => Promise<void>;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  uiStyle: UIStyle;
  setUiStyle: (style: UIStyle) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;
  focusTimer: FocusTimerState;
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

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (pathname: string): TabType => {
    if (pathname === '/') return 'overview';
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/calendar')) return 'calendar';
    if (pathname.startsWith('/habits')) return 'habits';
    if (pathname.startsWith('/focus')) return 'pomodoro';
    if (pathname.startsWith('/nutrition')) return 'nutrition';
    if (pathname.startsWith('/notes')) return 'keep';
    if (pathname.startsWith('/ca-tracker')) return 'ca-tracker';
    if (pathname.startsWith('/chipchain')) return 'scint-engine';
    return 'overview';
  };

  const activeTab = getTabFromPath(location.pathname);

  const tabToRoute: Record<TabType, string> = {
    overview: '/',
    tasks: '/tasks',
    calendar: '/calendar',
    habits: '/habits',
    pomodoro: '/focus',
    nutrition: '/nutrition',
    keep: '/notes',
    assistant: '/',
    'ca-tracker': '/ca-tracker',
    'scint-engine': '/chipchain'
  };

  const handleSetActiveTab = (tab: TabType) => {
    if (tab === 'assistant') {
      setIsAssistantOpen(true);
    } else if (tabToRoute[tab]) {
      navigate(tabToRoute[tab]);
    }
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nayra_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [uiStyle, setUiStyle] = useState<UIStyle>(() => {
    const saved = localStorage.getItem('nayra_ui_style') as UIStyle;
    if (saved === ('glass' as any) || saved === 'glassmorphism') {
      return 'glassmorphism';
    }
    if (['minimal', 'neumorphism', 'claymorphism', 'brutalism', 'cyberpunk'].includes(saved)) {
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
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nayra_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('nayra_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleAssistant = () => {
    setIsAssistantOpen(prev => !prev);
  };

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3800);
  }, []);

  const refreshAll = useCallback(async () => {
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
  }, []);

  // --- Ambient Wall-Clock Focus Timer State (Drift-Free & Persisted) ---
  const focusPresets: Record<FocusSessionType, number> = {
    focus: 25 * 60,
    deep_focus: 50 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const [sessionType, setSessionType] = useState<FocusSessionType>(() => {
    try {
      const saved = localStorage.getItem('nayra_focus_session') as FocusSessionType;
      if (saved && focusPresets[saved]) return saved;
    } catch {}
    return 'focus';
  });

  const [selectedTimerTaskId, setSelectedTimerTaskId] = useState<string>(() => {
    try {
      return localStorage.getItem('nayra_focus_task') || '';
    } catch {
      return '';
    }
  });

  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('nayra_focus_target_end');
      if (saved) {
        const end = Number(saved);
        if (!isNaN(end) && end > Date.now()) return end;
      }
    } catch {}
    return null;
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    try {
      const savedEnd = localStorage.getItem('nayra_focus_target_end');
      if (savedEnd) {
        const end = Number(savedEnd);
        if (!isNaN(end) && end > Date.now()) {
          return Math.max(0, Math.ceil((end - Date.now()) / 1000));
        }
      }
      const savedLeft = localStorage.getItem('nayra_focus_time_left');
      if (savedLeft) {
        const val = Number(savedLeft);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    return 25 * 60;
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    try {
      const savedEnd = localStorage.getItem('nayra_focus_target_end');
      if (savedEnd) {
        const end = Number(savedEnd);
        return !isNaN(end) && end > Date.now();
      }
    } catch {}
    return false;
  });

  // Keep refs for callbacks to avoid closure staleness
  const timerStateRef = useRef({
    sessionType,
    timeLeft,
    isTimerRunning,
    targetEndTime,
    selectedTimerTaskId,
    tasks
  });
  timerStateRef.current = {
    sessionType,
    timeLeft,
    isTimerRunning,
    targetEndTime,
    selectedTimerTaskId,
    tasks
  };

  const handleSetSessionType = (type: FocusSessionType) => {
    setSessionType(type);
    setIsTimerRunning(false);
    setTargetEndTime(null);
    const newSeconds = focusPresets[type];
    setTimeLeft(newSeconds);
    try {
      localStorage.setItem('nayra_focus_session', type);
      localStorage.setItem('nayra_focus_time_left', String(newSeconds));
      localStorage.removeItem('nayra_focus_target_end');
    } catch {}
  };

  const handleSetSelectedTaskId = (id: string) => {
    setSelectedTimerTaskId(id);
    try {
      localStorage.setItem('nayra_focus_task', id);
    } catch {}
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTargetEndTime(null);
    const newSeconds = focusPresets[sessionType];
    setTimeLeft(newSeconds);
    try {
      localStorage.setItem('nayra_focus_time_left', String(newSeconds));
      localStorage.removeItem('nayra_focus_target_end');
    } catch {}
  };

  const handleStartTimer = () => {
    const end = Date.now() + timeLeft * 1000;
    setTargetEndTime(end);
    setIsTimerRunning(true);
    try {
      localStorage.setItem('nayra_focus_target_end', String(end));
    } catch {}
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    setTargetEndTime(null);
    try {
      localStorage.removeItem('nayra_focus_target_end');
      localStorage.setItem('nayra_focus_time_left', String(timeLeft));
    } catch {}
  };

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      handlePauseTimer();
    } else {
      handleStartTimer();
    }
  };

  const handleCompleteTimer = useCallback(async () => {
    const { sessionType: currSession, timeLeft: currLeft, selectedTimerTaskId: currTaskId, tasks: currTasks } = timerStateRef.current;
    setIsTimerRunning(false);
    setTargetEndTime(null);
    try {
      localStorage.removeItem('nayra_focus_target_end');
    } catch {}

    const totalSeconds = focusPresets[currSession];
    const durationMinutes = Math.max(1, Math.round((totalSeconds - currLeft) / 60)) || Math.round(totalSeconds / 60);
    const selectedTask = currTasks.find(t => t.id === currTaskId);

    try {
      await api.logTime({
        taskId: currTaskId || undefined,
        taskTitle: selectedTask?.title || `${currSession.replace('_', ' ').toUpperCase()} Session`,
        durationMinutes,
        sessionType: currSession.includes('break') ? 'short_break' : 'pomodoro',
        timestamp: new Date().toISOString()
      });
      showToast(`Completed ${durationMinutes}m focus session`, 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      const resetSeconds = focusPresets[currSession];
      setTimeLeft(resetSeconds);
      try {
        localStorage.setItem('nayra_focus_time_left', String(resetSeconds));
      } catch {}
    }
  }, [refreshAll, showToast]);

  // Wall-clock countdown sync (interval + visibility/focus listeners)
  useEffect(() => {
    if (!isTimerRunning || !targetEndTime) return;

    const checkTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
      setTimeLeft(remaining);
      try {
        localStorage.setItem('nayra_focus_time_left', String(remaining));
      } catch {}
      if (remaining <= 0) {
        handleCompleteTimer();
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 500);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTime();
      }
    };
    const onFocus = () => checkTime();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [isTimerRunning, targetEndTime, handleCompleteTimer]);

  const focusTimer: FocusTimerState = {
    timeLeft,
    isRunning: isTimerRunning,
    sessionType,
    selectedTaskId: selectedTimerTaskId,
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    toggleTimer: handleToggleTimer,
    resetTimer: handleResetTimer,
    setSessionType: handleSetSessionType,
    setSelectedTaskId: handleSetSelectedTaskId,
    completeTimer: handleCompleteTimer,
  };

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

  const updateTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    api.saveUserSettings({ theme: newTheme }).catch(() => {});
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      api.saveUserSettings({ theme: next }).catch(() => {});
      return next;
    });
  };

  const updateUiStyle = (style: UIStyle) => {
    const normalized = (style === ('glass' as any) ? 'glassmorphism' : style) as UIStyle;
    setUiStyle(normalized);
    api.saveUserSettings({ uiStyle: normalized }).catch(() => {});
  };

  const updateAccentColor = (color: AccentColor) => {
    setAccentColor(color);
    api.saveUserSettings({ accentColor: color }).catch(() => {});
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

    // Live Cross-Device Cloud Sync via Firestore
    const unsubHabits = api.subscribeHabits(cloudHabits => {
      if (Array.isArray(cloudHabits)) {
        setHabits(cloudHabits);
      }
    });

    const unsubTasks = api.subscribeTasks(cloudTasks => {
      if (Array.isArray(cloudTasks)) {
        setTasks(cloudTasks);
      }
    });

    const unsubCalendar = api.subscribeCalendarEvents(cloudEvents => {
      if (Array.isArray(cloudEvents)) {
        setCalendarEvents(cloudEvents);
      }
    });

    const unsubNotes = api.subscribeNotes(cloudNotes => {
      if (Array.isArray(cloudNotes)) {
        setNotes(cloudNotes);
      }
    });

    const unsubLogs = api.subscribeTimeLogs(cloudLogs => {
      if (Array.isArray(cloudLogs)) {
        setTimeLogs(cloudLogs);
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const unsubMeals = api.subscribeMeals(todayStr, async () => {
      const nut = await api.getNutritionSummary(todayStr);
      if (nut) setNutritionData(nut);
    });

    const unsubSettings = api.subscribeUserSettings(cloudSettings => {
      if (cloudSettings) {
        if (cloudSettings.theme && (cloudSettings.theme === 'dark' || cloudSettings.theme === 'light')) {
          setTheme(cloudSettings.theme);
        }
        if (cloudSettings.uiStyle) {
          const normalized = (cloudSettings.uiStyle === 'glass' ? 'glassmorphism' : cloudSettings.uiStyle) as UIStyle;
          setUiStyle(normalized);
        }
        if (cloudSettings.accentColor) {
          setAccentColor(cloudSettings.accentColor as AccentColor);
        }
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === ',' || e.key === 'p')) {
        e.preventDefault();
        setIsSettingsOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleAssistant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubHabits();
      unsubTasks();
      unsubCalendar();
      unsubNotes();
      unsubLogs();
      unsubMeals();
      unsubSettings();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab: handleSetActiveTab,
        theme,
        setTheme: updateTheme,
        toggleTheme,
        uiStyle,
        setUiStyle: updateUiStyle,
        accentColor,
        setAccentColor: updateAccentColor,
        isSettingsOpen,
        setIsSettingsOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isAssistantOpen,
        setIsAssistantOpen,
        toggleAssistant,
        focusTimer,
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
        isNayraChatOpen: isAssistantOpen,
        setIsNayraChatOpen: setIsAssistantOpen,
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
