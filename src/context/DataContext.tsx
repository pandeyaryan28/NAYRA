import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  UserSettings,
  NayraCalendar,
  CalendarEvent,
  TaskList,
  TaskItem,
  Habit,
  CalorieEntry,
  CATopic,
  CATestRecord,
  CATopicStatus,
  CAConfidence,
  FocusSession,
  FocusStats,
} from '@/types';
import {
  DEFAULT_USER_SETTINGS,
  INITIAL_CALENDARS,
  INITIAL_EVENTS,
  INITIAL_TASK_LISTS,
  INITIAL_TASKS,
  INITIAL_HABITS,
  INITIAL_CALORIE_ENTRIES,
} from '@/data/defaultData';
import { INITIAL_CA_TOPICS } from '@/data/caFoundationData';
import { useAuth } from './AuthContext';
import {
  fetchGoogleCalendars,
  fetchGoogleEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  fetchGoogleTaskLists,
  createGoogleTaskList,
  deleteGoogleTaskList,
  clearGoogleCompletedTasks,
  fetchGoogleTasks,
  createGoogleTask,
  updateGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  resolveGoogleCalendarId,
  resolveGoogleTaskListId,
  GoogleApiError,
} from '@/lib/googleApi';
import { fetchFreshGoogleTokenFromCloud } from '@/lib/cloudSync';
import {
  db,
  getUserDoc,
  getUserSettingsDoc,
  getUserEventsCollection,
  getUserTasksCollection,
  getUserTaskListsCollection,
  getUserCalendarsCollection,
  getUserHabitsCollection,
  getUserCalorieEntriesCollection,
  getUserFocusSessionsCollection,
  getUserCATopicsCollection,
  getUserCATestsCollection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  sanitizeForFirestore,
  GUEST_USER_ID,
} from '@/lib/firebase';
import { generateId, safeLocalStorageGet, safeLocalStorageSet, getTodayDateString } from '@/lib/utils';
import { subDays, isSameWeek, isSameMonth, parseISO, format } from 'date-fns';

export interface DataContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;

  // Calendar
  calendars: NayraCalendar[];
  events: CalendarEvent[];
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, partial: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleCalendarVisibility: (calendarId: string) => void;

  // Tasks
  taskLists: TaskList[];
  tasks: TaskItem[];
  activeTaskListId: string;
  setActiveTaskListId: (id: string) => void;
  createTaskList: (title: string) => Promise<TaskList>;
  deleteTaskList: (listId: string) => Promise<void>;
  createTask: (task: Partial<TaskItem>) => Promise<TaskItem>;
  updateTask: (id: string, partial: Partial<TaskItem>) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  unarchiveTask: (id: string) => Promise<void>;
  archiveCompletedTasks: (taskListId?: string) => Promise<void>;
  clearArchivedTasks: (taskListId?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Habits
  habits: Habit[];
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completions'>) => void;
  updateHabit: (habitId: string, partial: Partial<Habit>) => void;
  archiveHabit: (habitId: string, archived?: boolean) => void;
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  deleteHabit: (habitId: string) => void;

  // Calories
  calorieEntries: CalorieEntry[];
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id' | 'loggedAt'>) => void;
  updateCalorieEntry: (id: string, partial: Partial<CalorieEntry>) => void;
  deleteCalorieEntry: (id: string) => void;

  // CA-Tracker
  caTopics: CATopic[];
  updateCATopicStatus: (topicId: string, status: CATopicStatus) => void;
  recordCARevision: (topicId: string, confidence: CAConfidence) => void;
  caTests: CATestRecord[];
  addCATestRecord: (test: Omit<CATestRecord, 'id'>) => void;

  // Focus
  focusSessions: FocusSession[];
  logFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  focusStats: FocusStats;

  // Clean Slate Reset
  resetAllDataToCleanSlate: () => Promise<void>;

  // Sync Status
  isSyncing: boolean;
  syncWithGoogle: (overrideToken?: string) => Promise<void>;
  reconnectAndSync: () => Promise<void>;
  isGoogleTokenExpired: boolean;
  lastSyncTime: Date | null;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const CURRENT_DATA_VERSION = 'v1.0.4_clean';

const KEYS = {
  SETTINGS: 'nayra_settings',
  CALENDARS: 'nayra_calendars',
  EVENTS: 'nayra_events',
  TASK_LISTS: 'nayra_task_lists',
  TASKS: 'nayra_tasks',
  HABITS: 'nayra_habits',
  CALORIES: 'nayra_calories',
  CA_TOPICS: 'nayra_ca_topics',
  CA_TESTS: 'nayra_ca_tests',
  FOCUS_SESSIONS: 'nayra_focus_sessions',
};

// Automatic cleanup of legacy dummy seed data from localStorage
if (typeof window !== 'undefined') {
  try {
    const storedVersion = localStorage.getItem('nayra_data_version');
    if (storedVersion !== CURRENT_DATA_VERSION) {
      localStorage.removeItem(KEYS.EVENTS);
      localStorage.removeItem(KEYS.TASKS);
      localStorage.removeItem(KEYS.TASK_LISTS);
      localStorage.removeItem(KEYS.HABITS);
      localStorage.removeItem(KEYS.CALORIES);
      localStorage.removeItem(KEYS.FOCUS_SESSIONS);
      localStorage.removeItem(KEYS.CA_TESTS);
      localStorage.removeItem(KEYS.CA_TOPICS);
      localStorage.removeItem(KEYS.CALENDARS);
      localStorage.setItem('nayra_data_version', CURRENT_DATA_VERSION);
    }
  } catch (err) {
    console.warn('Could not run localStorage data version migration:', err);
  }
}

/**
 * Deduplicates task lists, merging duplicate "My Tasks" or same-named lists
 * and producing an idRemap dictionary to fix existing tasks pointing to duplicate IDs.
 */
export function deduplicateTaskLists(lists: TaskList[]): { cleanLists: TaskList[]; idRemap: Map<string, string> } {
  const idRemap = new Map<string, string>();
  const cleanLists: TaskList[] = [];
  const seenGtl = new Set<string>();
  const seenTitles = new Set<string>();

  const myTasksLists = lists.filter(
    (l) => (l.title && l.title.trim().toLowerCase() === 'my tasks') || l.id === 'list_default' || l.isDefault
  );

  let canonicalDefault: TaskList | null = null;
  if (myTasksLists.length > 0) {
    const withGtl = myTasksLists.find((l) => l.googleTaskListId && l.googleTaskListId !== '@default');
    const base = withGtl || myTasksLists[0];
    canonicalDefault = {
      id: 'list_default',
      googleTaskListId: withGtl?.googleTaskListId || base.googleTaskListId || '@default',
      title: 'My Tasks',
      isDefault: true,
      updatedAt: base.updatedAt || new Date().toISOString(),
    };
    cleanLists.push(canonicalDefault);
    if (canonicalDefault.googleTaskListId) {
      seenGtl.add(canonicalDefault.googleTaskListId);
    }
    seenTitles.add('my tasks');

    myTasksLists.forEach((l) => {
      idRemap.set(l.id, 'list_default');
      if (l.googleTaskListId) {
        idRemap.set(l.googleTaskListId, 'list_default');
        idRemap.set(`gtl_${l.googleTaskListId}`, 'list_default');
      }
    });
  }

  lists.forEach((l) => {
    const normTitle = (l.title || '').trim().toLowerCase();
    if (normTitle === 'my tasks' || l.id === 'list_default' || (canonicalDefault && l.isDefault)) {
      return;
    }

    if (l.googleTaskListId && seenGtl.has(l.googleTaskListId)) {
      const existing = cleanLists.find((el) => el.googleTaskListId === l.googleTaskListId);
      if (existing) idRemap.set(l.id, existing.id);
      return;
    }

    if (seenTitles.has(normTitle)) {
      const existing = cleanLists.find((el) => (el.title || '').trim().toLowerCase() === normTitle);
      if (existing) idRemap.set(l.id, existing.id);
      return;
    }

    if (l.googleTaskListId) seenGtl.add(l.googleTaskListId);
    seenTitles.add(normTitle);
    cleanLists.push(l);
  });

  return { cleanLists, idRemap };
}

export function deduplicateFocusSessions(sessions: FocusSession[]): FocusSession[] {
  if (!Array.isArray(sessions)) return [];
  const clean: FocusSession[] = [];

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
  );

  for (const s of sorted) {
    if (s.mode !== 'focus') continue;

    const sTime = new Date(s.completedAt).getTime();
    const isDuplicate = clean.some((existing) => {
      const eTime = new Date(existing.completedAt).getTime();
      return Math.abs(sTime - eTime) < 60000;
    });

    if (!isDuplicate) {
      clean.push(s);
    }
  }

  return clean;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    googleAccessToken,
    isGoogleTokenExpired,
    setIsGoogleTokenExpired,
    reconnectGoogle,
  } = useAuth();
  const userId = user?.uid || GUEST_USER_ID;

  const isGuest = !user || user.isGuest;

  const getUserStorageKey = useCallback((key: string) => {
    const uid = user?.uid || GUEST_USER_ID;
    return `nayra_${uid}_${key}`;
  }, [user?.uid]);

  // 1. Settings State
  const [settings, setSettings] = useState<UserSettings>(() =>
    safeLocalStorageGet<UserSettings>(
      `nayra_${user?.uid || GUEST_USER_ID}_settings`,
      DEFAULT_USER_SETTINGS
    )
  );

  // 2. Calendar State
  const [calendars, setCalendars] = useState<NayraCalendar[]>(() =>
    safeLocalStorageGet<NayraCalendar[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_calendars`,
      isGuest ? INITIAL_CALENDARS : [{ id: 'primary', summary: 'Personal', backgroundColor: '#0284c7', foregroundColor: '#ffffff', primary: true, selected: true }]
    )
  );
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    safeLocalStorageGet<CalendarEvent[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_events`,
      isGuest ? INITIAL_EVENTS : []
    )
  );

  // 3. Task State
  const [taskLists, setTaskLists] = useState<TaskList[]>(() => {
    const raw = safeLocalStorageGet<TaskList[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_task_lists`,
      isGuest ? INITIAL_TASK_LISTS : [{ id: 'list_default', title: 'My Tasks', isDefault: true, updatedAt: new Date().toISOString() }]
    );
    const { cleanLists } = deduplicateTaskLists(raw);
    return cleanLists.length > 0
      ? cleanLists
      : [{ id: 'list_default', title: 'My Tasks', isDefault: true, updatedAt: new Date().toISOString() }];
  });
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    safeLocalStorageGet<TaskItem[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_tasks`,
      isGuest ? INITIAL_TASKS : []
    )
  );
  const [activeTaskListId, setActiveTaskListId] = useState<string>(() => {
    return taskLists[0]?.id || 'list_default';
  });

  // Purge any stored duplicate task lists and remap affected tasks on startup
  useEffect(() => {
    const { cleanLists, idRemap } = deduplicateTaskLists(taskLists);
    if (cleanLists.length !== taskLists.length || idRemap.size > 0) {
      setTaskLists(cleanLists);
      taskListsRef.current = cleanLists;
      if (idRemap.size > 0) {
        setTasks((prev) =>
          prev.map((t) => {
            const mapped = idRemap.get(t.taskListId);
            return mapped ? { ...t, taskListId: mapped } : t;
          })
        );
        setActiveTaskListId((prev) => idRemap.get(prev) || prev);
      }
    }
  }, []);

  // 4. Habits State
  const [habits, setHabits] = useState<Habit[]>(() =>
    safeLocalStorageGet<Habit[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_habits`,
      isGuest ? INITIAL_HABITS : []
    )
  );

  // 5. Calories State
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>(() =>
    safeLocalStorageGet<CalorieEntry[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_calories`,
      isGuest ? INITIAL_CALORIE_ENTRIES : []
    )
  );

  // 6. CA-Tracker State
  const [caTopics, setCaTopics] = useState<CATopic[]>(() =>
    safeLocalStorageGet<CATopic[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_ca_topics`,
      INITIAL_CA_TOPICS
    )
  );
  const [caTests, setCaTests] = useState<CATestRecord[]>(() =>
    safeLocalStorageGet<CATestRecord[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_ca_tests`,
      []
    )
  );

  // 7. Focus State
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() =>
    deduplicateFocusSessions(
      safeLocalStorageGet<FocusSession[]>(
        `nayra_${user?.uid || GUEST_USER_ID}_focus_sessions`,
        []
      )
    )
  );

  // Sync engine indicators & mutable state refs for reliable sync without infinite loops
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const isSyncingRef = useRef<boolean>(false);
  const eventsRef = useRef(events);
  const tasksRef = useRef(tasks);
  const taskListsRef = useRef(taskLists);
  const calendarsRef = useRef(calendars);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  useEffect(() => {
    taskListsRef.current = taskLists;
  }, [taskLists]);
  useEffect(() => {
    calendarsRef.current = calendars;
  }, [calendars]);

  const prevUserIdRef = useRef<string | null>(null);

  // Per-User Firestore & LocalStorage Loading Effect
  useEffect(() => {
    const uid = user?.uid;
    const isUserGuest = user?.isGuest ?? true;

    // Only reload from localStorage if the user has changed since initial mount
    if (prevUserIdRef.current !== uid) {
      if (!uid) {
        // User logged out: cleanly reset in-memory state
        setSettings(DEFAULT_USER_SETTINGS);
        setCalendars([]);
        setEvents([]);
        setTaskLists([]);
        setTasks([]);
        setActiveTaskListId('list_default');
        setHabits([]);
        setCalorieEntries([]);
        setCaTopics(INITIAL_CA_TOPICS);
        setCaTests([]);
        setFocusSessions([]);
      } else {
        const uSettings = safeLocalStorageGet<UserSettings>(
          `nayra_${uid}_settings`,
          DEFAULT_USER_SETTINGS
        );
        const uCalendars = safeLocalStorageGet<NayraCalendar[]>(
          `nayra_${uid}_calendars`,
          isUserGuest ? INITIAL_CALENDARS : [{ id: 'primary', summary: 'Personal', backgroundColor: '#0284c7', foregroundColor: '#ffffff', primary: true, selected: true }]
        );
        const uEvents = safeLocalStorageGet<CalendarEvent[]>(
          `nayra_${uid}_events`,
          isUserGuest ? INITIAL_EVENTS : []
        );
        const rawTaskLists = safeLocalStorageGet<TaskList[]>(
          `nayra_${uid}_task_lists`,
          isUserGuest ? INITIAL_TASK_LISTS : [{ id: 'list_default', title: 'My Tasks', isDefault: true, updatedAt: new Date().toISOString() }]
        );
        const { cleanLists: uTaskLists, idRemap } = deduplicateTaskLists(rawTaskLists);
        let uTasks = safeLocalStorageGet<TaskItem[]>(
          `nayra_${uid}_tasks`,
          isUserGuest ? INITIAL_TASKS : []
        );
        if (idRemap.size > 0) {
          uTasks = uTasks.map((t) => {
            const mapped = idRemap.get(t.taskListId);
            return mapped ? { ...t, taskListId: mapped } : t;
          });
          safeLocalStorageSet(`nayra_${uid}_task_lists`, uTaskLists);
          safeLocalStorageSet(`nayra_${uid}_tasks`, uTasks);
        }
        const uHabits = safeLocalStorageGet<Habit[]>(
          `nayra_${uid}_habits`,
          isUserGuest ? INITIAL_HABITS : []
        );
        const uCalories = safeLocalStorageGet<CalorieEntry[]>(
          `nayra_${uid}_calories`,
          isUserGuest ? INITIAL_CALORIE_ENTRIES : []
        );
        const uCaTopics = safeLocalStorageGet<CATopic[]>(
          `nayra_${uid}_ca_topics`,
          INITIAL_CA_TOPICS
        );
        const uCaTests = safeLocalStorageGet<CATestRecord[]>(
          `nayra_${uid}_ca_tests`,
          []
        );
        const uFocus = safeLocalStorageGet<FocusSession[]>(
          `nayra_${uid}_focus_sessions`,
          []
        );

        setSettings(uSettings);
        setCalendars(uCalendars);
        setEvents(uEvents);
        setTaskLists(uTaskLists);
        setTasks(uTasks);
        setActiveTaskListId(uTaskLists[0]?.id || 'list_default');
        setHabits(uHabits);
        setCalorieEntries(uCalories);
        setCaTopics(uCaTopics);
        setCaTests(uCaTests);
        setFocusSessions(deduplicateFocusSessions(uFocus));
      }
    }
    prevUserIdRef.current = uid || null;

    // If authenticated user with dedicated Firestore account
    if (user && !user.isGuest && uid) {
      let active = true;
      const loadFromFirestore = async () => {
        try {
          // 1. Settings
          const settingsSnap = await getDoc(getUserSettingsDoc(uid));
          if (settingsSnap.exists() && active) {
            setSettings(settingsSnap.data() as UserSettings);
          } else {
            setDoc(getUserSettingsDoc(uid), sanitizeForFirestore(DEFAULT_USER_SETTINGS)).catch(console.warn);
          }

          // 2. Events
          const evsSnap = await getDocs(getUserEventsCollection(uid));
          if (!evsSnap.empty && active) {
            setEvents(evsSnap.docs.map((d) => d.data() as CalendarEvent));
          }

          // 3. Tasks
          const tSnap = await getDocs(getUserTasksCollection(uid));
          if (!tSnap.empty && active) {
            setTasks(tSnap.docs.map((d) => d.data() as TaskItem));
          }

          // 4. Task Lists
          const tlSnap = await getDocs(getUserTaskListsCollection(uid));
          if (!tlSnap.empty && active) {
            const loadedLists = tlSnap.docs.map((d) => d.data() as TaskList);
            setTaskLists(loadedLists);
            if (loadedLists.length > 0) setActiveTaskListId(loadedLists[0].id);
          }

          // 5. Calendars
          const calSnap = await getDocs(getUserCalendarsCollection(uid));
          if (!calSnap.empty && active) {
            setCalendars(calSnap.docs.map((d) => d.data() as NayraCalendar));
          }

          // 6. Habits
          const hSnap = await getDocs(getUserHabitsCollection(uid));
          if (!hSnap.empty && active) {
            setHabits(hSnap.docs.map((d) => d.data() as Habit));
          }

          // 7. Calories
          const cSnap = await getDocs(getUserCalorieEntriesCollection(uid));
          if (!cSnap.empty && active) {
            setCalorieEntries(cSnap.docs.map((d) => d.data() as CalorieEntry));
          }

          // 8. Focus Sessions
          const fSnap = await getDocs(getUserFocusSessionsCollection(uid));
          if (!fSnap.empty && active) {
            setFocusSessions(deduplicateFocusSessions(fSnap.docs.map((d) => d.data() as FocusSession)));
          }

          // 9. CA Topics
          const ctSnap = await getDocs(getUserCATopicsCollection(uid));
          if (!ctSnap.empty && active) {
            setCaTopics(ctSnap.docs.map((d) => d.data() as CATopic));
          }

          // 10. CA Tests
          const ctestSnap = await getDocs(getUserCATestsCollection(uid));
          if (!ctestSnap.empty && active) {
            setCaTests(ctestSnap.docs.map((d) => d.data() as CATestRecord));
          }
        } catch (err) {
          console.warn('Firestore fetch failed (offline/sandbox):', err);
        }
      };

      loadFromFirestore();
      return () => {
        active = false;
      };
    }
  }, [user?.uid, user?.isGuest]);

  // Sync to user-isolated localStorage immediately on change
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('settings'), settings);
  }, [settings, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('calendars'), calendars);
  }, [calendars, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('events'), events);
  }, [events, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('task_lists'), taskLists);
  }, [taskLists, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('tasks'), tasks);
  }, [tasks, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('habits'), habits);
  }, [habits, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('calories'), calorieEntries);
  }, [calorieEntries, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('ca_topics'), caTopics);
  }, [caTopics, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('ca_tests'), caTests);
  }, [caTests, user, getUserStorageKey]);
  useEffect(() => {
    if (user) safeLocalStorageSet(getUserStorageKey('focus_sessions'), focusSessions);
  }, [focusSessions, user, getUserStorageKey]);

  // Complete Two-Way Google API Sync Engine (Google Calendar V3 & Google Tasks V1)
  const syncWithGoogle = useCallback(
    async (overrideToken?: string) => {
      let token = overrideToken || googleAccessToken;
      const handleAuthFailure = async () => {
        console.warn('Google API authentication error (401). Attempting silent background refresh...');
        const freshToken = await fetchFreshGoogleTokenFromCloud();
        if (freshToken) {
          setIsGoogleTokenExpired(false);
          setTimeout(() => {
            syncWithGoogle(freshToken).catch(console.warn);
          }, 100);
          return true;
        }
        setIsGoogleTokenExpired(true);
        return false;
      };

      if (!token || (!overrideToken && isGoogleTokenExpired)) {
        const silentToken = await fetchFreshGoogleTokenFromCloud();
        if (silentToken) {
          token = silentToken;
          setIsGoogleTokenExpired(false);
        } else if (!token) {
          return;
        }
      }

      isSyncingRef.current = true;
      setIsSyncing(true);
      try {
        // 1. Sync Calendars & Events
        try {
          const remoteCals = await fetchGoogleCalendars(token);
          if (remoteCals.length > 0) {
            setCalendars((prev) => {
              const map = new Map(prev.map((c) => [c.googleCalendarId || c.id, c]));
              remoteCals.forEach((rCal) => {
                const key = rCal.googleCalendarId || rCal.id;
                const existing = map.get(key);
                map.set(key, existing ? { ...existing, ...rCal, id: existing.id, selected: existing.selected } : rCal);
              });
              const newArr = Array.from(map.values());
              calendarsRef.current = newArr;
              return newArr;
            });
          }

          // Sync events across all selected calendars
          const activeCals = (remoteCals.length > 0 ? remoteCals : calendarsRef.current).filter(
            (c) => c.selected !== false
          );
          const calsToSync = activeCals.length > 0 ? activeCals : [{ id: 'primary', googleCalendarId: 'primary', summary: 'Personal' }];
          for (const cal of calsToSync) {
            try {
              const gcalId = cal.googleCalendarId || resolveGoogleCalendarId(cal.id, calendarsRef.current);
              const remoteEvents = await fetchGoogleEvents(token, gcalId, undefined, undefined, calendarsRef.current);
              if (remoteEvents.length > 0) {
                setEvents((prev) => {
                  const map = new Map(prev.map((e) => [e.googleEventId || e.id, e]));
                  remoteEvents.forEach((rev) => {
                    const existing = map.get(rev.googleEventId!);
                    map.set(rev.googleEventId!, existing ? { ...existing, ...rev, id: existing.id } : rev);
                  });
                  const newArr = Array.from(map.values());
                  eventsRef.current = newArr;
                  return newArr;
                });
              }
            } catch (calEventErr: any) {
              if (
                (calEventErr instanceof GoogleApiError && calEventErr.status === 401) ||
                calEventErr?.status === 401 ||
                calEventErr?.message?.includes('401')
              ) {
                await handleAuthFailure();
                return;
              }
              const calLabel = 'summary' in cal && cal.summary ? cal.summary : cal.id;
              console.warn(`Failed to fetch events for calendar ${calLabel}:`, calEventErr);
            }
          }

          // Two-way sync: Push local events that are missing Google Event IDs
          const currentEvents = [...eventsRef.current];
          for (const ev of currentEvents) {
            if (!ev.googleEventId) {
              try {
                const gcalId = resolveGoogleCalendarId(ev.calendarId || 'primary', calendarsRef.current);
                const created = await createGoogleEvent(token, gcalId, ev);
                if (created?.id) {
                  setEvents((prev) =>
                    prev.map((e) => (e.id === ev.id ? { ...e, googleEventId: created.id } : e))
                  );
                  eventsRef.current = eventsRef.current.map((e) => (e.id === ev.id ? { ...e, googleEventId: created.id } : e));
                  if (user && !user.isGuest) {
                    setDoc(doc(getUserEventsCollection(user.uid), ev.id), { googleEventId: created.id }, { merge: true }).catch(console.warn);
                  }
                }
              } catch (err: any) {
                if (
                  (err instanceof GoogleApiError && err.status === 401) ||
                  err?.status === 401 ||
                  err?.message?.includes('401')
                ) {
                  await handleAuthFailure();
                  return;
                }
                console.warn('Could not sync local event to Google Calendar:', err);
              }
            }
          }
        } catch (calErr: any) {
          if (
            (calErr instanceof GoogleApiError && calErr.status === 401) ||
            calErr?.status === 401 ||
            calErr?.message?.includes('401') ||
            calErr?.message?.includes('invalid authentication credentials')
          ) {
            console.warn('Google Calendar authentication failed (401 Unauthorized). Attempting refresh...');
            await handleAuthFailure();
            return;
          }
          console.warn('Google Calendar sync skipped/failed:', calErr);
        }

        // 2. Sync Task Lists & Tasks
        try {
          const remoteLists = await fetchGoogleTaskLists(token);
          const listsToProcess = remoteLists.length > 0 ? remoteLists : [
            { id: 'list_default', googleTaskListId: '@default', title: 'My Tasks', isDefault: true, updatedAt: new Date().toISOString() }
          ];

          let resolvedLocalLists: TaskList[] = [];
          setTaskLists((prev) => {
            const combined = [...prev, ...listsToProcess];
            const { cleanLists, idRemap } = deduplicateTaskLists(combined);
            taskListsRef.current = cleanLists;
            resolvedLocalLists = cleanLists;

            if (idRemap.size > 0) {
              setTasks((prevTasks) => {
                let changed = false;
                const updated = prevTasks.map((t) => {
                  const mappedId = idRemap.get(t.taskListId);
                  if (mappedId && mappedId !== t.taskListId) {
                    changed = true;
                    return { ...t, taskListId: mappedId };
                  }
                  return t;
                });
                return changed ? updated : prevTasks;
              });
              setActiveTaskListId((prevId) => idRemap.get(prevId) || prevId);
            }

            return cleanLists;
          });

          const activeLists = resolvedLocalLists.length > 0 ? resolvedLocalLists : taskListsRef.current;
          for (const list of activeLists) {
            const gtlId = list.googleTaskListId || (list.id.startsWith('gtl_') ? list.id.replace('gtl_', '') : '@default');
            try {
              const remoteTasks = await fetchGoogleTasks(token, gtlId, list.id, taskListsRef.current);
              if (remoteTasks.length > 0) {
                setTasks((prev) => {
                  const map = new Map(prev.map((t) => [t.googleTaskId || t.id, t]));
                  remoteTasks.forEach((rt) => {
                    const existing = map.get(rt.googleTaskId!);
                    if (existing) {
                      map.set(rt.googleTaskId!, {
                        ...existing,
                        ...rt,
                        id: existing.id,
                        taskListId: list.id,
                        tags: existing.tags || (rt as any).tags || [],
                        subtasks: existing.subtasks?.length ? existing.subtasks : rt.subtasks,
                        totalFocusSeconds: existing.totalFocusSeconds || 0,
                        pomodoroCount: existing.pomodoroCount || 0,
                        priority: existing.priority || 'medium',
                        archived: rt.archived ?? existing.archived,
                        archivedAt: rt.archivedAt ?? existing.archivedAt,
                      });
                    } else {
                      map.set(rt.googleTaskId!, {
                        ...rt,
                        tags: (rt as any).tags || [],
                        taskListId: list.id,
                      });
                    }
                  });
                  const newArr = Array.from(map.values());
                  tasksRef.current = newArr;
                  return newArr;
                });
              }
            } catch (listErr: any) {
              if (
                (listErr instanceof GoogleApiError && listErr.status === 401) ||
                listErr?.status === 401 ||
                listErr?.message?.includes('401')
              ) {
                await handleAuthFailure();
                return;
              }
              console.warn(`Failed to fetch tasks for list ${list.title}:`, listErr);
            }
          }

          // Two-way sync: Push local tasks that are missing Google Task IDs
          const currentTasks = [...tasksRef.current];
          const currentLists = taskListsRef.current;
          for (const t of currentTasks) {
            if (!t.googleTaskId) {
              try {
                const gtlId = resolveGoogleTaskListId(t.taskListId || '@default', currentLists);
                const created = await createGoogleTask(token, gtlId, t, currentLists);
                if (created?.id) {
                  setTasks((prev) =>
                    prev.map((item) => (item.id === t.id ? { ...item, googleTaskId: created.id } : item))
                  );
                  tasksRef.current = tasksRef.current.map((item) => (item.id === t.id ? { ...item, googleTaskId: created.id } : item));
                  if (user && !user.isGuest) {
                    setDoc(doc(getUserTasksCollection(user.uid), t.id), { googleTaskId: created.id }, { merge: true }).catch(console.warn);
                  }
                }
              } catch (err: any) {
                if (
                  (err instanceof GoogleApiError && err.status === 401) ||
                  err?.status === 401 ||
                  err?.message?.includes('401')
                ) {
                  await handleAuthFailure();
                  return;
                }
                console.warn('Could not sync local task to Google Tasks:', err);
              }
            }
          }
        } catch (taskErr: any) {
          if (
            (taskErr instanceof GoogleApiError && taskErr.status === 401) ||
            taskErr?.status === 401 ||
            taskErr?.message?.includes('401') ||
            taskErr?.message?.includes('invalid authentication credentials')
          ) {
            console.warn('Google Tasks authentication failed (401 Unauthorized). Attempting refresh...');
            await handleAuthFailure();
            return;
          }
          console.warn('Google Tasks sync skipped/failed:', taskErr);
        }

        setLastSyncTime(new Date());
      } finally {
        isSyncingRef.current = false;
        setIsSyncing(false);
      }
    },
    [googleAccessToken, isGoogleTokenExpired, setIsGoogleTokenExpired, user]
  );

  const reconnectAndSync = useCallback(async () => {
    try {
      const freshToken = await reconnectGoogle();
      if (freshToken) {
        await syncWithGoogle(freshToken);
      }
    } catch (err) {
      console.error('Reconnect and sync failed:', err);
      throw err;
    }
  }, [reconnectGoogle, syncWithGoogle]);

  // Initial sync when token becomes available & periodic background sync (every 5 min)
  useEffect(() => {
    if (googleAccessToken || (user && !user.isGuest)) {
      syncWithGoogle().catch(console.warn);
      const interval = setInterval(() => {
        syncWithGoogle().catch(console.warn);
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [googleAccessToken, user?.uid, syncWithGoogle]);

  // Settings Updater
  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (user && !user.isGuest) {
        setDoc(getUserSettingsDoc(user.uid), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
      }
      return updated;
    });
  };

  // Calendar Actions
  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
    const newId = generateId('ev');
    const now = new Date().toISOString();
    let googleEventId: string | undefined = undefined;

    if (googleAccessToken && eventData.calendarId) {
      try {
        const gcalId = resolveGoogleCalendarId(eventData.calendarId, calendarsRef.current);
        const resp = await createGoogleEvent(googleAccessToken, gcalId, eventData);
        googleEventId = resp?.id;
      } catch (e) {
        console.warn('Failed to create event in Google Calendar directly:', e);
      }
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id: newId,
      googleEventId,
      createdAt: now,
      updatedAt: now,
    };

    setEvents((prev) => [...prev, newEvent]);

    if (user && !user.isGuest) {
      setDoc(doc(getUserEventsCollection(user.uid), newId), sanitizeForFirestore(newEvent)).catch(console.warn);
    }

    return newEvent;
  };

  const updateEvent = async (id: string, partial: Partial<CalendarEvent>) => {
    const existing = eventsRef.current.find((e) => e.id === id) || events.find((e) => e.id === id);
    if (existing && googleAccessToken) {
      const gcalId = resolveGoogleCalendarId(partial.calendarId || existing.calendarId, calendarsRef.current);
      if (existing.googleEventId) {
        updateGoogleEvent(googleAccessToken, gcalId, existing.googleEventId, partial).catch(console.warn);
      } else {
        createGoogleEvent(googleAccessToken, gcalId, { ...existing, ...partial })
          .then((created) => {
            if (created?.id) {
              setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, googleEventId: created.id } : e)));
              if (user && !user.isGuest) {
                setDoc(doc(getUserEventsCollection(user.uid), id), { googleEventId: created.id }, { merge: true }).catch(console.warn);
              }
            }
          })
          .catch(console.warn);
      }
    }

    const now = new Date().toISOString();
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...partial, updatedAt: now };
          if (user && !user.isGuest) {
            setDoc(doc(getUserEventsCollection(user.uid), id), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return e;
      })
    );
  };

  const deleteEvent = async (id: string) => {
    const existing = eventsRef.current.find((e) => e.id === id) || events.find((e) => e.id === id);
    if (existing && googleAccessToken && existing.googleEventId) {
      const gcalId = resolveGoogleCalendarId(existing.calendarId, calendarsRef.current);
      deleteGoogleEvent(googleAccessToken, gcalId, existing.googleEventId).catch(console.warn);
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (user && !user.isGuest) {
      deleteDoc(doc(getUserEventsCollection(user.uid), id)).catch(console.warn);
    }
  };

  const toggleCalendarVisibility = (calendarId: string) => {
    setCalendars((prev) =>
      prev.map((c) => (c.id === calendarId ? { ...c, selected: !c.selected } : c))
    );
  };

  // Task Actions
  const createTaskList = async (title: string): Promise<TaskList> => {
    let googleTaskListId: string | undefined = undefined;
    if (googleAccessToken) {
      try {
        const resp = await createGoogleTaskList(googleAccessToken, title);
        googleTaskListId = resp?.id;
      } catch (e) {
        console.warn('Failed to create task list in Google Tasks directly:', e);
      }
    }

    const newList: TaskList = {
      id: googleTaskListId ? `gtl_${googleTaskListId}` : generateId('list'),
      googleTaskListId,
      title,
      isDefault: false,
      updatedAt: new Date().toISOString(),
    };
    setTaskLists((prev) => [...prev, newList]);
    setActiveTaskListId(newList.id);
    return newList;
  };

  const deleteTaskList = async (listId: string) => {
    const list = taskLists.find((l) => l.id === listId);
    if (!list || list.isDefault) return; // Do not delete default task list

    if (googleAccessToken && list.googleTaskListId) {
      deleteGoogleTaskList(googleAccessToken, list.googleTaskListId).catch(console.warn);
    }

    setTaskLists((prev) => prev.filter((l) => l.id !== listId));
    setTasks((prev) => prev.filter((t) => t.taskListId !== listId));
    if (activeTaskListId === listId) {
      const remaining = taskLists.filter((l) => l.id !== listId);
      if (remaining.length > 0) setActiveTaskListId(remaining[0].id);
    }
  };

  const createTask = async (taskData: Partial<TaskItem>): Promise<TaskItem> => {
    const newId = generateId('task');
    const now = new Date().toISOString();
    let googleTaskId: string | undefined = undefined;

    const targetListId = taskData.taskListId || activeTaskListId;

    if (googleAccessToken && targetListId) {
      try {
        const gtlId = resolveGoogleTaskListId(targetListId, taskListsRef.current);
        const resp = await createGoogleTask(googleAccessToken, gtlId, taskData, taskListsRef.current);
        googleTaskId = resp?.id;
      } catch (e) {
        console.warn('Failed to create task in Google Tasks directly:', e);
      }
    }

    const newTask: TaskItem = {
      id: newId,
      googleTaskId,
      taskListId: targetListId,
      title: taskData.title || 'New Task',
      notes: taskData.notes || '',
      status: taskData.status || 'needsAction',
      archived: taskData.archived || false,
      archivedAt: taskData.archivedAt,
      due: taskData.due || undefined,
      priority: taskData.priority || 'medium',
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [],
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [newTask, ...prev]);

    if (user && !user.isGuest) {
      setDoc(doc(getUserTasksCollection(user.uid), newId), sanitizeForFirestore(newTask)).catch(console.warn);
    }

    return newTask;
  };

  const updateTask = async (id: string, partial: Partial<TaskItem>) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (existing && googleAccessToken) {
      const gtlId = resolveGoogleTaskListId(partial.taskListId || existing.taskListId, taskListsRef.current);
      if (existing.googleTaskId) {
        updateGoogleTask(googleAccessToken, gtlId, existing.googleTaskId, partial, taskListsRef.current).catch(console.warn);
      } else {
        createGoogleTask(googleAccessToken, gtlId, { ...existing, ...partial }, taskListsRef.current)
          .then((created) => {
            if (created?.id) {
              setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, googleTaskId: created.id } : t)));
              if (user && !user.isGuest) {
                setDoc(doc(getUserTasksCollection(user.uid), id), { googleTaskId: created.id }, { merge: true }).catch(console.warn);
              }
            }
          })
          .catch(console.warn);
      }
    }

    const now = new Date().toISOString();
    setTasks((prev) => {
      const nextTasks = prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...partial, updatedAt: now };
          if (user && !user.isGuest) {
            setDoc(doc(getUserTasksCollection(user.uid), id), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      });
      tasksRef.current = nextTasks;
      return nextTasks;
    });
  };

  const toggleTaskComplete = async (id: string) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (!existing) return;
    const isCompleted = existing.status === 'completed';
    const nextStatus = isCompleted ? 'needsAction' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : undefined;
    const archived = nextStatus === 'completed';
    const archivedAt = nextStatus === 'completed' ? completedAt : undefined;

    await updateTask(id, { status: nextStatus, completedAt, archived, archivedAt });
  };

  const archiveTask = async (id: string) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (!existing) return;
    const now = new Date().toISOString();
    await updateTask(id, {
      archived: true,
      archivedAt: now,
      status: 'completed',
      completedAt: existing.completedAt || now,
    });
  };

  const unarchiveTask = async (id: string) => {
    await updateTask(id, {
      archived: false,
      archivedAt: undefined,
      status: 'needsAction',
      completedAt: undefined,
    });
  };

  const archiveCompletedTasks = async (taskListId?: string) => {
    const now = new Date().toISOString();
    const currentTasks = tasksRef.current;
    const targetTasks = currentTasks.filter((t) => {
      const isDone = t.status === 'completed';
      if (!isDone || t.archived) return false;
      if (taskListId && taskListId !== 'all') {
        return t.taskListId === taskListId;
      }
      return true;
    });

    for (const t of targetTasks) {
      await updateTask(t.id, {
        archived: true,
        archivedAt: now,
      });
    }

    if (googleAccessToken) {
      try {
        const listToClear = taskListId && taskListId !== 'all' ? taskListId : '@default';
        await clearGoogleCompletedTasks(googleAccessToken, listToClear, taskListsRef.current);
      } catch (e) {
        console.warn('Google Tasks clear API notice:', e);
      }
    }
  };

  const clearArchivedTasks = async (taskListId?: string) => {
    const toDelete = tasksRef.current.filter((t) => {
      if (!t.archived) return false;
      if (taskListId && taskListId !== 'all') {
        return t.taskListId === taskListId;
      }
      return true;
    });

    for (const t of toDelete) {
      await deleteTask(t.id);
    }
  };

  const deleteTask = async (id: string) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (existing && googleAccessToken && existing.googleTaskId) {
      const gtlId = resolveGoogleTaskListId(existing.taskListId, taskListsRef.current);
      deleteGoogleTask(googleAccessToken, gtlId, existing.googleTaskId, taskListsRef.current).catch(console.warn);
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (user && !user.isGuest) {
      deleteDoc(doc(getUserTasksCollection(user.uid), id)).catch(console.warn);
    }
  };

  // Task Subtask Actions
  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const subtask = {
      id: generateId('subtask'),
      title: title.trim(),
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = [...(t.subtasks || []), subtask];
          const updated = { ...t, subtasks, updatedAt: new Date().toISOString() };
          if (user && !user.isGuest) {
            setDoc(doc(getUserTasksCollection(user.uid), taskId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const updated = { ...t, subtasks, updatedAt: new Date().toISOString() };
          if (user && !user.isGuest) {
            setDoc(doc(getUserTasksCollection(user.uid), taskId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = (t.subtasks || []).filter((s) => s.id !== subtaskId);
          const updated = { ...t, subtasks, updatedAt: new Date().toISOString() };
          if (user && !user.isGuest) {
            setDoc(doc(getUserTasksCollection(user.uid), taskId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      })
    );
  };

  // Habit Actions
  const createHabit = (data: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completions'>) => {
    const newHabit: Habit = {
      ...data,
      id: generateId('habit'),
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      bestStreak: 0,
      completions: {},
    };
    setHabits((prev) => [...prev, newHabit]);
    if (user && !user.isGuest) {
      setDoc(doc(getUserHabitsCollection(user.uid), newHabit.id), sanitizeForFirestore(newHabit)).catch(console.warn);
    }
  };

  const updateHabit = (habitId: string, partial: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const updated = { ...h, ...partial };
          if (user && !user.isGuest) {
            setDoc(doc(getUserHabitsCollection(user.uid), habitId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return h;
      })
    );
  };

  const archiveHabit = (habitId: string, archived: boolean = true) => {
    updateHabit(habitId, { archived });
  };

  const toggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const completions = { ...h.completions };
        if (completions[dateStr]) {
          delete completions[dateStr];
        } else {
          completions[dateStr] = true;
        }

        // Recalculate streak using local date format
        let streak = 0;
        let d = new Date();
        const todayStr = getTodayDateString();
        let cursor = completions[todayStr] ? d : subDays(d, 1);
        while (completions[format(cursor, 'yyyy-MM-dd')]) {
          streak++;
          cursor = subDays(cursor, 1);
        }

        const best = Math.max(h.bestStreak, streak);
        const updated = { ...h, completions, currentStreak: streak, bestStreak: best };

        if (user && !user.isGuest) {
          setDoc(doc(getUserHabitsCollection(user.uid), habitId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
        }
        return updated;
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (user && !user.isGuest) {
      deleteDoc(doc(getUserHabitsCollection(user.uid), habitId)).catch(console.warn);
    }
  };

  // Calorie Actions
  const addCalorieEntry = (entryData: Omit<CalorieEntry, 'id' | 'loggedAt'>) => {
    const newEntry: CalorieEntry = {
      ...entryData,
      id: generateId('cal'),
      loggedAt: new Date().toISOString(),
    };
    setCalorieEntries((prev) => [newEntry, ...prev]);
    if (user && !user.isGuest) {
      setDoc(doc(getUserCalorieEntriesCollection(user.uid), newEntry.id), sanitizeForFirestore(newEntry)).catch(console.warn);
    }
  };

  const updateCalorieEntry = (id: string, partial: Partial<CalorieEntry>) => {
    setCalorieEntries((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...partial };
          if (user && !user.isGuest) {
            setDoc(doc(getUserCalorieEntriesCollection(user.uid), id), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return c;
      })
    );
  };

  const deleteCalorieEntry = (id: string) => {
    setCalorieEntries((prev) => prev.filter((c) => c.id !== id));
    if (user && !user.isGuest) {
      deleteDoc(doc(getUserCalorieEntriesCollection(user.uid), id)).catch(console.warn);
    }
  };

  // CA-Tracker Actions
  const updateCATopicStatus = (topicId: string, status: CATopicStatus) => {
    const now = new Date().toISOString();
    setCaTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const updated = {
            ...t,
            status,
            startedAt: status === 'in_progress' && !t.startedAt ? now : t.startedAt,
            completedAt: status === 'completed' ? now : t.completedAt,
          };
          if (user && !user.isGuest) {
            setDoc(doc(getUserCATopicsCollection(user.uid), topicId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const recordCARevision = (topicId: string, confidence: CAConfidence) => {
    setCaTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const nextCount = (t.revisionCount || 0) + 1;
          return {
            ...t,
            revisionCount: nextCount,
            confidence,
            nextRevisionDue: subDays(new Date(), -7).toISOString().split('T')[0],
          };
        }
        return t;
      })
    );
  };

  const addCATestRecord = (testData: Omit<CATestRecord, 'id'>) => {
    const newRecord: CATestRecord = {
      ...testData,
      id: generateId('catest'),
    };
    setCaTests((prev) => [newRecord, ...prev]);
  };

  // Focus Actions
  const logFocusSession = (sessionData: Omit<FocusSession, 'id'>) => {
    if (sessionData.mode !== 'focus') return;

    const targetTime = new Date(sessionData.completedAt).getTime();

    // Check if an existing session within 60s already exists to prevent duplicate logging
    const isDuplicate = focusSessions.some((s) => {
      const existingTime = new Date(s.completedAt).getTime();
      return Math.abs(targetTime - existingTime) < 60000;
    });

    if (isDuplicate) {
      return;
    }

    const newSession: FocusSession = {
      ...sessionData,
      id: generateId('fs'),
    };
    setFocusSessions((prev) => [newSession, ...prev]);

    // If multi-task allocations are provided, update each credited task
    if (sessionData.taskTimeAllocations && Object.keys(sessionData.taskTimeAllocations).length > 0) {
      for (const [taskId, allocatedSeconds] of Object.entries(sessionData.taskTimeAllocations)) {
        if (allocatedSeconds > 0) {
          const currentTask = tasksRef.current.find((t) => t.id === taskId) || tasks.find((t) => t.id === taskId);
          if (currentTask) {
            updateTask(taskId, {
              totalFocusSeconds: (currentTask.totalFocusSeconds || 0) + allocatedSeconds,
              pomodoroCount: (currentTask.pomodoroCount || 0) + 1,
            });
          }
        }
      }
    } else if (sessionData.taskId) {
      const currentTask = tasksRef.current.find((t) => t.id === sessionData.taskId) || tasks.find((t) => t.id === sessionData.taskId);
      if (currentTask) {
        updateTask(sessionData.taskId, {
          totalFocusSeconds: (currentTask.totalFocusSeconds || 0) + sessionData.durationSeconds,
          pomodoroCount: (currentTask.pomodoroCount || 0) + 1,
        });
      }
    }

    if (user && !user.isGuest) {
      setDoc(doc(getUserFocusSessionsCollection(user.uid), newSession.id), sanitizeForFirestore(newSession)).catch(console.warn);
    }
  };

  // Computed Focus Statistics with dynamic consecutive-day streak calculation
  const focusStats = useMemo<FocusStats>(() => {
    const todayStr = getTodayDateString();
    const todaySessions = focusSessions.filter((s) => s.mode === 'focus' && s.completedAt.startsWith(todayStr));
    const todaySeconds = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || ((s as any).durationMinutes ? (s as any).durationMinutes * 60 : 0) || 0), 0);

    const weekSessions = focusSessions.filter(
      (s) => s.mode === 'focus' && isSameWeek(parseISO(s.completedAt), new Date(), { weekStartsOn: 1 })
    );
    const weekSeconds = weekSessions.reduce((acc, s) => acc + (s.durationSeconds || ((s as any).durationMinutes ? (s as any).durationMinutes * 60 : 0) || 0), 0);

    const monthSessions = focusSessions.filter(
      (s) => s.mode === 'focus' && isSameMonth(parseISO(s.completedAt), new Date())
    );
    const monthSeconds = monthSessions.reduce((acc, s) => acc + (s.durationSeconds || ((s as any).durationMinutes ? (s as any).durationMinutes * 60 : 0) || 0), 0);

    // Dynamic consecutive focus streak calculation
    let streakDays = 0;
    const sessionDays = new Set(
      focusSessions
        .filter((s) => s.mode === 'focus')
        .map((s) => s.completedAt.split('T')[0])
    );
    let checkDate = new Date();
    const todayFormatted = format(checkDate, 'yyyy-MM-dd');
    if (!sessionDays.has(todayFormatted)) {
      checkDate = subDays(checkDate, 1);
    }
    while (sessionDays.has(format(checkDate, 'yyyy-MM-dd'))) {
      streakDays++;
      checkDate = subDays(checkDate, 1);
    }

    return {
      todayFocusSeconds: todaySeconds,
      todayPomodoroCount: todaySessions.length,
      weekFocusSeconds: weekSeconds,
      monthFocusSeconds: monthSeconds,
      streakDays,
      totalSessionsCount: focusSessions.filter((s) => s.mode === 'focus').length,
    };
  }, [focusSessions]);

  // Clean Slate: wipe all local state and cache
  const resetAllDataToCleanSlate = useCallback(async () => {
    setEvents([]);
    setTasks([]);
    setHabits([]);
    setCalorieEntries([]);
    setFocusSessions([]);
    setCaTests([]);
    setCaTopics(INITIAL_CA_TOPICS);
    setTaskLists(INITIAL_TASK_LISTS);
    setCalendars(INITIAL_CALENDARS);

    const uid = user?.uid || GUEST_USER_ID;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(getUserStorageKey('events'));
        localStorage.removeItem(getUserStorageKey('tasks'));
        localStorage.removeItem(getUserStorageKey('habits'));
        localStorage.removeItem(getUserStorageKey('calories'));
        localStorage.removeItem(getUserStorageKey('focus_sessions'));
        localStorage.removeItem(getUserStorageKey('ca_tests'));
        localStorage.removeItem(getUserStorageKey('ca_topics'));
        localStorage.removeItem(getUserStorageKey('task_lists'));
        localStorage.removeItem(getUserStorageKey('calendars'));
        localStorage.removeItem(KEYS.EVENTS);
        localStorage.removeItem(KEYS.TASKS);
        localStorage.removeItem(KEYS.HABITS);
        localStorage.removeItem(KEYS.CALORIES);
        localStorage.removeItem(KEYS.FOCUS_SESSIONS);
        localStorage.removeItem(KEYS.CA_TESTS);
        localStorage.removeItem(KEYS.CA_TOPICS);
        localStorage.removeItem(KEYS.TASK_LISTS);
        localStorage.removeItem(KEYS.CALENDARS);
        localStorage.setItem('nayra_data_version', CURRENT_DATA_VERSION);
      } catch (err) {
        console.warn('Could not clear localStorage:', err);
      }
    }
  }, [user?.uid, getUserStorageKey]);

  return (
    <DataContext.Provider
      value={{
        settings,
        updateSettings,
        calendars,
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        toggleCalendarVisibility,
        taskLists,
        tasks,
        activeTaskListId,
        setActiveTaskListId,
        createTaskList,
        deleteTaskList,
        createTask,
        updateTask,
        toggleTaskComplete,
        archiveTask,
        unarchiveTask,
        archiveCompletedTasks,
        clearArchivedTasks,
        deleteTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        habits,
        createHabit,
        updateHabit,
        archiveHabit,
        toggleHabitDate,
        deleteHabit,
        calorieEntries,
        addCalorieEntry,
        updateCalorieEntry,
        deleteCalorieEntry,
        caTopics,
        updateCATopicStatus,
        recordCARevision,
        caTests,
        addCATestRecord,
        focusSessions,
        logFocusSession,
        focusStats,
        resetAllDataToCleanSlate,
        isSyncing,
        syncWithGoogle,
        reconnectAndSync,
        isGoogleTokenExpired,
        lastSyncTime,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
