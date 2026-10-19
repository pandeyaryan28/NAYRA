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
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  sanitizeForFirestore,
  GUEST_USER_ID,
  syncActiveTasksToFirestore,
  subscribeActiveTasksFromFirestore,
  fetchActiveTasksFromFirestore,
  OPERATOR_UID,
} from '@/lib/firebase';
import { generateId, safeLocalStorageGet, safeLocalStorageSet, getTodayDateString } from '@/lib/utils';
import { extractHashtags, cleanTitleWithHashtags, mergeTags } from '@/lib/tagUtils';
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

  // Filter ONLY true default "My Tasks" lists. NEVER treat a custom list as "My Tasks" just because isDefault was corrupted!
  const myTasksLists = lists.filter(
    (l) =>
      (l.title && l.title.trim().toLowerCase() === 'my tasks') ||
      l.id === 'list_default' ||
      l.googleTaskListId === '@default'
  );

  let canonicalDefault: TaskList | null = null;
  if (myTasksLists.length > 0) {
    const withGtl = myTasksLists.find(
      (l) => l.googleTaskListId && l.googleTaskListId !== '@default' && l.googleTaskListId !== 'list_default'
    );
    const base = withGtl || myTasksLists[0];
    canonicalDefault = {
      id: 'list_default',
      googleTaskListId: withGtl?.googleTaskListId || base.googleTaskListId || '@default',
      title: 'My Tasks',
      isDefault: true,
      updatedAt: base.updatedAt || new Date().toISOString(),
    };
    cleanLists.push(canonicalDefault);
    if (canonicalDefault.googleTaskListId && canonicalDefault.googleTaskListId !== '@default') {
      seenGtl.add(canonicalDefault.googleTaskListId);
    }
    seenTitles.add('my tasks');

    myTasksLists.forEach((l) => {
      if (l.id !== 'list_default') {
        idRemap.set(l.id, 'list_default');
      }
      if (l.googleTaskListId && l.googleTaskListId !== '@default') {
        if (l.googleTaskListId === canonicalDefault?.googleTaskListId) {
          idRemap.set(l.googleTaskListId, 'list_default');
          idRemap.set(`gtl_${l.googleTaskListId}`, 'list_default');
        }
      }
    });
  } else {
    canonicalDefault = {
      id: 'list_default',
      googleTaskListId: '@default',
      title: 'My Tasks',
      isDefault: true,
      updatedAt: new Date().toISOString(),
    };
    cleanLists.push(canonicalDefault);
    seenTitles.add('my tasks');
  }

  lists.forEach((l) => {
    const normTitle = (l.title || '').trim().toLowerCase();
    // Skip My Tasks entries as they were already handled
    if (normTitle === 'my tasks' || l.id === 'list_default' || l.googleTaskListId === '@default') {
      return;
    }

    // Force isDefault to false on all custom lists to heal any previous corruption
    const sanitizedList: TaskList = {
      ...l,
      isDefault: false,
      id: l.id.startsWith('gtl_') || l.googleTaskListId
        ? (l.id.startsWith('gtl_') ? l.id : `gtl_${l.googleTaskListId}`)
        : l.id,
    };

    if (sanitizedList.googleTaskListId && seenGtl.has(sanitizedList.googleTaskListId)) {
      const existing = cleanLists.find((el) => el.googleTaskListId === sanitizedList.googleTaskListId);
      if (existing && existing.id !== sanitizedList.id) {
        idRemap.set(sanitizedList.id, existing.id);
      }
      return;
    }

    if (seenTitles.has(normTitle)) {
      const existing = cleanLists.find((el) => (el.title || '').trim().toLowerCase() === normTitle);
      if (existing) {
        if (existing.id !== sanitizedList.id) {
          idRemap.set(sanitizedList.id, existing.id);
        }
        if (!existing.googleTaskListId && sanitizedList.googleTaskListId) {
          existing.googleTaskListId = sanitizedList.googleTaskListId;
        }
      }
      return;
    }

    if (sanitizedList.googleTaskListId) seenGtl.add(sanitizedList.googleTaskListId);
    seenTitles.add(normTitle);
    cleanLists.push(sanitizedList);
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
    setTokenWithTimestamp,
  } = useAuth();
  const userId = user?.uid || GUEST_USER_ID;
  const effectiveUid = user?.uid && !user.isGuest ? user.uid : OPERATOR_UID;

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
  const authFailureRetryCountRef = useRef<number>(0);
  const lastAuthFailureTimeRef = useRef<number>(0);
  const lastSyncedActiveTasksSignatureRef = useRef<string>('');
  const eventsRef = useRef(events);
  const tasksRef = useRef(tasks);
  const taskListsRef = useRef(taskLists);
  const calendarsRef = useRef(calendars);
  const deletedTaskListIdsRef = useRef<Set<string>>(new Set());

  // Load tombstoned deleted list IDs on mount
  useEffect(() => {
    const storedDeleted = safeLocalStorageGet<string[]>(
      `nayra_${user?.uid || GUEST_USER_ID}_deleted_task_lists`,
      []
    );
    if (Array.isArray(storedDeleted)) {
      storedDeleted.forEach((id) => deletedTaskListIdsRef.current.add(id));
    }
  }, [user?.uid]);

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

  const persistActiveTasks = useCallback(
    (taskList: TaskItem[], source: 'googleTasks' | 'webApp' = 'webApp') => {
      const activeOnly = (taskList || []).filter((t) => !t.archived && t.status !== 'completed' && !t.completed);
      const signature = activeOnly
        .map((t) => `${t.id}:${t.status}:${t.googleTaskId || ''}:${t.totalFocusSeconds || 0}`)
        .sort()
        .join('|');
      if (signature !== lastSyncedActiveTasksSignatureRef.current) {
        lastSyncedActiveTasksSignatureRef.current = signature;
        syncActiveTasksToFirestore(effectiveUid, activeOnly, source).catch(console.warn);
      }
    },
    [effectiveUid]
  );

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
      const unsubs: Array<() => void> = [];

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

          // 3. Tasks (Real-time snapshot listener with merge)
          try {
            const unsubTasks = onSnapshot(
              getUserTasksCollection(uid),
              (tSnap) => {
                if (active) {
                  const fTasks = tSnap.docs
                    .map((d) => {
                      const data = d.data() as TaskItem;
                      if (data.taskListId && deletedTaskListIdsRef.current.has(data.taskListId)) {
                        deleteDoc(doc(getUserTasksCollection(uid), d.id)).catch(console.warn);
                        return null;
                      }
                      const gId = data.googleTaskId || (d.id.startsWith('gtask_') ? d.id.replace('gtask_', '') : undefined);
                      const matchingList = taskListsRef.current.find(
                        (l) =>
                          (data.taskListId && (l.id === data.taskListId || l.googleTaskListId === data.taskListId || l.id === `gtl_${data.taskListId}`)) ||
                          (data.taskListName && (l.title || '').trim().toLowerCase() === data.taskListName.trim().toLowerCase())
                      );
                      const resolvedListId = matchingList ? matchingList.id : (data.taskListId || 'list_default');
                      const resolvedListName = matchingList ? matchingList.title : (data.taskListName || (resolvedListId === 'list_default' ? 'My Tasks' : undefined));
                      return {
                        ...data,
                        id: d.id,
                        googleTaskId: gId,
                        taskListId: resolvedListId,
                        taskListName: resolvedListName,
                      } as TaskItem;
                    })
                    .filter(Boolean) as TaskItem[];
                  setTasks((prev) => {
                    const localMetrics = new Map(
                      prev.map((t) => [t.id, { totalFocusSeconds: t.totalFocusSeconds || 0, pomodoroCount: t.pomodoroCount || 0 }])
                    );
                    const merged = fTasks.map((item) => {
                      const local = localMetrics.get(item.id);
                      if (local && local.totalFocusSeconds > (item.totalFocusSeconds || 0)) {
                        return {
                          ...item,
                          totalFocusSeconds: local.totalFocusSeconds,
                          pomodoroCount: Math.max(local.pomodoroCount, item.pomodoroCount || 0),
                        };
                      }
                      return item;
                    });
                    tasksRef.current = merged;
                    const activeOnly = merged.filter((t) => !t.archived && t.status !== 'completed' && !t.completed);
                    const activeSignature = activeOnly
                      .map((t) => `${t.id}:${t.status}:${t.googleTaskId || ''}:${t.totalFocusSeconds || 0}`)
                      .sort()
                      .join('|');
                    if (activeSignature !== lastSyncedActiveTasksSignatureRef.current) {
                      lastSyncedActiveTasksSignatureRef.current = activeSignature;
                      syncActiveTasksToFirestore(uid, activeOnly, 'webApp').catch(console.warn);
                    }

                    // Forward any task created in Firestore (from Android/Ext) or completed in Firestore to Google Tasks
                    if (googleAccessToken && !isGoogleTokenExpired) {
                      merged.forEach((item) => {
                        const prevItem = prev.find((p) => p.id === item.id);
                        if (item.googleTaskId) {
                          if (item.status === 'completed' || item.completed || item.archived) {
                            if (prevItem && prevItem.status !== 'completed' && !prevItem.completed && !prevItem.archived) {
                              const gtlId = resolveGoogleTaskListId(item.taskListId || '@default', taskListsRef.current);
                              updateGoogleTaskStatus(googleAccessToken, gtlId, item.googleTaskId, 'completed', taskListsRef.current).catch(console.warn);
                            }
                          } else if (item.status === 'needsAction' && !item.completed && !item.archived) {
                            if (prevItem && (prevItem.status === 'completed' || prevItem.completed)) {
                              const gtlId = resolveGoogleTaskListId(item.taskListId || '@default', taskListsRef.current);
                              updateGoogleTaskStatus(googleAccessToken, gtlId, item.googleTaskId, 'needsAction', taskListsRef.current).catch(console.warn);
                            }
                          }
                        } else if (!item.archived && !item.completed && item.status !== 'completed' && (!prevItem || !prevItem.googleTaskId)) {
                          // Brand new task created in Firestore without googleTaskId
                          const gtlId = resolveGoogleTaskListId(item.taskListId || '@default', taskListsRef.current);
                          createGoogleTask(googleAccessToken, gtlId, item, taskListsRef.current)
                            .then((created) => {
                              if (created?.id) {
                                setTasks((curr) => curr.map((t) => (t.id === item.id ? { ...t, googleTaskId: created.id } : t)));
                                tasksRef.current = tasksRef.current.map((t) => (t.id === item.id ? { ...t, googleTaskId: created.id } : t));
                                setDoc(doc(getUserTasksCollection(uid), item.id), { googleTaskId: created.id }, { merge: true }).catch(console.warn);
                              }
                            })
                            .catch((err: any) => {
                              if ((err instanceof GoogleApiError && err.status === 401) || err?.status === 401 || err?.message?.includes('401')) {
                                setIsGoogleTokenExpired(true);
                              }
                              console.warn('Realtime sync to Google Tasks notice:', err);
                            });
                        }
                      });
                    }

                    return merged;
                  });
                }
              },
              (err) => console.warn('Tasks realtime sync warning:', err)
            );
            unsubs.push(unsubTasks);

            const unsubActiveTasks = subscribeActiveTasksFromFirestore(uid, (activeDoc) => {
              if (!active || !activeDoc || !Array.isArray(activeDoc.tasks)) return;
              if (activeDoc.source === 'extension' || activeDoc.source === 'tab' || activeDoc.source === 'androidApp') {
                const incomingActive = activeDoc.tasks;
                const completedTaskIds = new Set<string>(
                  Array.isArray((activeDoc as any).completedTaskIds) ? ((activeDoc as any).completedTaskIds as string[]) : []
                );

                setTasks((prev) => {
                  const prevMap = new Map(prev.map((t) => [t.id, t]));
                  let changed = false;
                  const newTasksForGoogle: TaskItem[] = [];

                  // Process explicit task completions from peer if any
                  if (completedTaskIds.size > 0) {
                    completedTaskIds.forEach((doneId) => {
                      const existing = prevMap.get(doneId);
                      if (existing && existing.status !== 'completed' && !existing.completed && !existing.archived) {
                        changed = true;
                        const now = new Date().toISOString();
                        const updated = {
                          ...existing,
                          status: 'completed' as const,
                          completed: true,
                          completedAt: now,
                          archived: Boolean(existing.archived),
                          archivedAt: existing.archived ? existing.archivedAt : undefined,
                          updatedAt: now,
                        };
                        prevMap.set(doneId, updated);
                        if (user && !user.isGuest) {
                          setDoc(doc(getUserTasksCollection(uid), doneId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
                        }
                        if (googleAccessToken && existing.googleTaskId) {
                          const gtlId = resolveGoogleTaskListId(existing.taskListId || '@default', taskListsRef.current);
                          updateGoogleTaskStatus(googleAccessToken, gtlId, existing.googleTaskId, 'completed', taskListsRef.current).catch(console.warn);
                        }
                      }
                    });
                  }

                  // Additively reconcile incoming active tasks
                  incomingActive.forEach((inc) => {
                    const existing = prevMap.get(inc.id);
                    if (!existing) {
                      prevMap.set(inc.id, inc);
                      changed = true;
                      if (!inc.googleTaskId) {
                        newTasksForGoogle.push(inc);
                      }
                    } else {
                      const rf = inc.totalFocusSeconds || 0;
                      const rc = inc.pomodoroCount || 0;
                      const lf = existing.totalFocusSeconds || 0;
                      const lc = existing.pomodoroCount || 0;
                      const isExistingCustom =
                        existing.taskListId &&
                        existing.taskListId !== 'list_default' &&
                        existing.taskListId !== '@default';
                      const isIncomingDefault =
                        !inc.taskListId ||
                        inc.taskListId === 'list_default' ||
                        inc.taskListId === '@default';
                      const preservedListId =
                        isExistingCustom && isIncomingDefault ? existing.taskListId : inc.taskListId || existing.taskListId;
                      const preservedListName =
                        isExistingCustom && isIncomingDefault ? existing.taskListName : inc.taskListName || existing.taskListName;
                      const isRemoteComplete = inc.status === 'completed' || inc.completed === true || inc.archived === true;

                      if (
                        rf > lf ||
                        rc > lc ||
                        inc.title !== existing.title ||
                        inc.status !== existing.status ||
                        (isRemoteComplete && !existing.completed)
                      ) {
                        prevMap.set(inc.id, {
                          ...existing,
                          ...inc,
                          taskListId: preservedListId,
                          taskListName: preservedListName,
                          totalFocusSeconds: Math.max(lf, rf),
                          pomodoroCount: Math.max(lc, rc),
                          ...(isRemoteComplete ? { status: 'completed', completed: true, archived: Boolean(inc.archived ?? existing.archived) } : {}),
                        });
                        changed = true;
                      }
                    }
                  });

                  if (changed) {
                    const next = Array.from(prevMap.values());
                    tasksRef.current = next;

                    // If user is connected to Google Tasks, sync new tasks directly
                    if (googleAccessToken && newTasksForGoogle.length > 0) {
                      newTasksForGoogle.forEach(async (t) => {
                        try {
                          const gtlId = resolveGoogleTaskListId(t.taskListId || '@default', taskListsRef.current);
                          const created = await createGoogleTask(googleAccessToken, gtlId, t, taskListsRef.current);
                          if (created?.id) {
                            setTasks((p) => {
                              const updated = p.map((item) => (item.id === t.id ? { ...item, googleTaskId: created.id } : item));
                              tasksRef.current = updated;
                              const activeOnly = updated.filter((item) => !item.archived && item.status !== 'completed' && !item.completed);
                              syncActiveTasksToFirestore(uid, activeOnly, 'webApp').catch(console.warn);
                              return updated;
                            });
                            setDoc(doc(getUserTasksCollection(uid), t.id), { googleTaskId: created.id }, { merge: true }).catch(console.warn);
                          }
                        } catch (err) {
                          console.warn('[DataContext] Syncing incoming task to Google failed:', err);
                        }
                      });
                    }

                    return next;
                  }
                  return prev;
                });
              }
            });
            unsubs.push(unsubActiveTasks);
          } catch (tErr) {
            const tSnap = await getDocs(getUserTasksCollection(uid));
            if (!tSnap.empty && active) {
              const fTasks = tSnap.docs.map((d) => {
                const data = d.data() as TaskItem;
                const gId = data.googleTaskId || (d.id.startsWith('gtask_') ? d.id.replace('gtask_', '') : undefined);
                const matchingList = taskListsRef.current.find(
                  (l) =>
                    (data.taskListId && (l.id === data.taskListId || l.googleTaskListId === data.taskListId || l.id === `gtl_${data.taskListId}`)) ||
                    (data.taskListName && (l.title || '').trim().toLowerCase() === data.taskListName.trim().toLowerCase())
                );
                const resolvedListId = matchingList ? matchingList.id : (data.taskListId || 'list_default');
                const resolvedListName = matchingList ? matchingList.title : (data.taskListName || (resolvedListId === 'list_default' ? 'My Tasks' : undefined));
                return {
                  ...data,
                  id: d.id,
                  googleTaskId: gId,
                  taskListId: resolvedListId,
                  taskListName: resolvedListName,
                } as TaskItem;
              });
              setTasks((prev) => {
                const localMetrics = new Map(
                  prev.map((t) => [t.id, { totalFocusSeconds: t.totalFocusSeconds || 0, pomodoroCount: t.pomodoroCount || 0 }])
                );
                const merged = fTasks.map((item) => {
                  const local = localMetrics.get(item.id);
                  if (local && local.totalFocusSeconds > (item.totalFocusSeconds || 0)) {
                    return {
                      ...item,
                      totalFocusSeconds: local.totalFocusSeconds,
                      pomodoroCount: Math.max(local.pomodoroCount, item.pomodoroCount || 0),
                    };
                  }
                  return item;
                });
                tasksRef.current = merged;
                return merged;
              });
            }
          }

          // 4. Task Lists (Real-time snapshot listener)
          try {
            const unsubTaskLists = onSnapshot(
              getUserTaskListsCollection(uid),
              (tlSnap) => {
                if (active && !tlSnap.empty) {
                  const loadedLists = tlSnap.docs
                    .map((d) => d.data() as TaskList)
                    .filter((l) => !deletedTaskListIdsRef.current.has(l.id) && (!l.googleTaskListId || !deletedTaskListIdsRef.current.has(l.googleTaskListId)));
                  const { cleanLists } = deduplicateTaskLists(loadedLists);
                  setTaskLists(cleanLists);
                  taskListsRef.current = cleanLists;
                  if (cleanLists.length > 0) {
                    setActiveTaskListId((prev) => {
                      const stillExists = cleanLists.some((l) => l.id === prev);
                      return stillExists ? prev : (cleanLists.find((l) => l.isDefault)?.id || cleanLists[0].id);
                    });
                  }
                }
              },
              (err) => console.warn('Task lists realtime sync warning:', err)
            );
            unsubs.push(unsubTaskLists);
          } catch (tlErr) {
            const tlSnap = await getDocs(getUserTaskListsCollection(uid));
            if (!tlSnap.empty && active) {
              const loadedLists = tlSnap.docs
                .map((d) => d.data() as TaskList)
                .filter((l) => !deletedTaskListIdsRef.current.has(l.id) && (!l.googleTaskListId || !deletedTaskListIdsRef.current.has(l.googleTaskListId)));
              const { cleanLists } = deduplicateTaskLists(loadedLists);
              setTaskLists(cleanLists);
              taskListsRef.current = cleanLists;
              if (cleanLists.length > 0) {
                setActiveTaskListId((prev) => {
                  const stillExists = cleanLists.some((l) => l.id === prev);
                  return stillExists ? prev : (cleanLists.find((l) => l.isDefault)?.id || cleanLists[0].id);
                });
              }
            }
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

          // 8. Focus Sessions (Real-time snapshot listener)
          try {
            const unsubFocus = onSnapshot(
              getUserFocusSessionsCollection(uid),
              (fSnap) => {
                if (!fSnap.empty && active) {
                  setFocusSessions(deduplicateFocusSessions(fSnap.docs.map((d) => d.data() as FocusSession)));
                }
              },
              (err) => console.warn('Focus sessions realtime sync warning:', err)
            );
            unsubs.push(unsubFocus);
          } catch (fErr) {
            const fSnap = await getDocs(getUserFocusSessionsCollection(uid));
            if (!fSnap.empty && active) {
              setFocusSessions(deduplicateFocusSessions(fSnap.docs.map((d) => d.data() as FocusSession)));
            }
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
        unsubs.forEach((unsub) => {
          try {
            unsub();
          } catch {
            // ignore
          }
        });
      };
    }
  }, [user?.uid, user?.isGuest]);

  // Real-time synchronization of Focus Sessions and Active Tasks with Cloud Firestore & BroadcastChannel
  useEffect(() => {
    let active = true;
    const unsubs: Array<() => void> = [];
    const syncUid = effectiveUid;
    if (!syncUid) return;

    // 1. Initial active tasks fetch
    fetchActiveTasksFromFirestore(syncUid).then((cloudActive) => {
      if (!active || !Array.isArray(cloudActive) || cloudActive.length === 0) return;
      setTasks((prev) => {
        const prevMap = new Map(prev.map((t) => [t.id, t]));
        let changed = false;
        cloudActive.forEach((t) => {
          if (!prevMap.has(t.id)) {
            prevMap.set(t.id, t);
            changed = true;
          } else {
            const existing = prevMap.get(t.id)!;
            const cloudFocus = t.totalFocusSeconds || 0;
            const cloudPomodoro = t.pomodoroCount || 0;
            if (cloudFocus > (existing.totalFocusSeconds || 0) || cloudPomodoro > (existing.pomodoroCount || 0)) {
              prevMap.set(t.id, {
                ...existing,
                totalFocusSeconds: Math.max(existing.totalFocusSeconds || 0, cloudFocus),
                pomodoroCount: Math.max(existing.pomodoroCount || 0, cloudPomodoro),
              });
              changed = true;
            }
          }
        });
        return changed ? Array.from(prevMap.values()) : prev;
      });
    }).catch(console.warn);

    // 2. Real-time active tasks listener
    const unsubActive = subscribeActiveTasksFromFirestore(syncUid, (activeDoc) => {
      if (!active || !activeDoc || !Array.isArray(activeDoc.tasks)) return;
      const incoming = activeDoc.tasks;
      setTasks((prev) => {
        const prevMap = new Map(prev.map((t) => [t.id, t]));
        let changed = false;
        incoming.forEach((t) => {
          if (!prevMap.has(t.id)) {
            prevMap.set(t.id, t);
            changed = true;
          } else {
            const existing = prevMap.get(t.id)!;
            const incFocus = t.totalFocusSeconds || 0;
            const incCount = t.pomodoroCount || 0;
            if (incFocus > (existing.totalFocusSeconds || 0) || incCount > (existing.pomodoroCount || 0)) {
              prevMap.set(t.id, {
                ...existing,
                totalFocusSeconds: Math.max(existing.totalFocusSeconds || 0, incFocus),
                pomodoroCount: Math.max(existing.pomodoroCount || 0, incCount),
              });
              changed = true;
            }
          }
        });
        return changed ? Array.from(prevMap.values()) : prev;
      });
    });
    unsubs.push(unsubActive);

    // 3. Real-time focus sessions listener
    try {
      const unsubFocus = onSnapshot(
        getUserFocusSessionsCollection(syncUid),
        (fSnap) => {
          if (!active) return;
          const cloudSessions = fSnap.docs.map((d) => d.data() as FocusSession);
          if (cloudSessions.length > 0) {
            setFocusSessions((prev) => deduplicateFocusSessions([...cloudSessions, ...prev]));
          }
        },
        (err) => console.warn('Focus sessions realtime sync warning:', err)
      );
      unsubs.push(unsubFocus);
    } catch (fErr) {
      getDocs(getUserFocusSessionsCollection(syncUid)).then((fSnap) => {
        if (!active || fSnap.empty) return;
        const cloudSessions = fSnap.docs.map((d) => d.data() as FocusSession);
        setFocusSessions((prev) => deduplicateFocusSessions([...cloudSessions, ...prev]));
      }).catch(console.warn);
    }

    // 4. Also listen to OPERATOR_UID if syncUid is different
    if (syncUid !== OPERATOR_UID) {
      try {
        const unsubOperatorFocus = onSnapshot(
          getUserFocusSessionsCollection(OPERATOR_UID),
          (opSnap) => {
            if (!active) return;
            const opSessions = opSnap.docs.map((d) => d.data() as FocusSession);
            if (opSessions.length > 0) {
              setFocusSessions((prev) => deduplicateFocusSessions([...opSessions, ...prev]));
            }
          },
          () => {}
        );
        unsubs.push(unsubOperatorFocus);
      } catch {}
    }

    // 5. BroadcastChannel listener for local peer tabs and extensions
    let peerChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        peerChannel = new BroadcastChannel('nayra_focus_sync');
        peerChannel.onmessage = (event) => {
          if (!active) return;
          const data = event.data;
          if (!data || data.source === 'web') return;

          if ((data.type === 'SESSION_LOGGED' || data.type === 'SESSION_COMPLETED') && data.session) {
            const s = data.session as FocusSession;
            if (s.mode === 'focus') {
              setFocusSessions((prev) => deduplicateFocusSessions([s, ...prev]));
            }
          }
        };
      } catch {
        // ignore
      }
    }

    return () => {
      active = false;
      if (peerChannel) {
        try { peerChannel.close(); } catch {}
      }
      unsubs.forEach((u) => {
        try { u(); } catch {}
      });
    };
  }, [effectiveUid]);

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

      // Reset retry count on fresh manual/scheduled syncs if 60s cooldown elapsed
      if (!overrideToken && Date.now() - lastAuthFailureTimeRef.current > 60000) {
        authFailureRetryCountRef.current = 0;
      }

      const handleAuthFailure = async () => {
        const now = Date.now();
        // Strict guard: Allow maximum 1 automatic refresh per 60 seconds to eliminate infinite 100ms loops
        if (authFailureRetryCountRef.current >= 1 || (now - lastAuthFailureTimeRef.current < 60000)) {
          console.warn('Google API authentication error (401): Retry cap reached or cooldown active. Pausing sync until next window.');
          setIsGoogleTokenExpired(true);
          return false;
        }

        authFailureRetryCountRef.current += 1;
        lastAuthFailureTimeRef.current = now;
        console.warn('Google API authentication error (401). Attempting single silent background refresh...');
        const freshToken = await fetchFreshGoogleTokenFromCloud();
        if (freshToken) {
          setTokenWithTimestamp(freshToken);
          setIsGoogleTokenExpired(false);
          // Wait 1000ms before retrying once with fresh token
          setTimeout(() => {
            syncWithGoogle(freshToken).catch(console.warn);
          }, 1000);
          return true;
        }
        setIsGoogleTokenExpired(true);
        return false;
      };

      if (!token || (!overrideToken && isGoogleTokenExpired)) {
        const silentToken = await fetchFreshGoogleTokenFromCloud();
        if (silentToken) {
          token = silentToken;
          setTokenWithTimestamp(silentToken);
          setIsGoogleTokenExpired(false);
        } else {
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

          const remoteGtlIds = new Set(
            remoteLists.map((l) => l.googleTaskListId || (l.id.startsWith('gtl_') ? l.id.replace('gtl_', '') : l.id)).filter(Boolean)
          );

          // Purge any local task lists that were deleted on Google Tasks
          const deletedRemotely = taskListsRef.current.filter((l) => {
            const isDef = l.isDefault || l.id === 'list_default' || (l.title || '').trim().toLowerCase() === 'my tasks';
            if (isDef) return false;
            const gtlId = l.googleTaskListId || (l.id.startsWith('gtl_') ? l.id.replace('gtl_', '') : undefined);
            return gtlId && !remoteGtlIds.has(gtlId);
          });

          if (deletedRemotely.length > 0) {
            deletedRemotely.forEach((dl) => {
              deletedTaskListIdsRef.current.add(dl.id);
              if (dl.googleTaskListId) {
                deletedTaskListIdsRef.current.add(dl.googleTaskListId);
                deletedTaskListIdsRef.current.add(`gtl_${dl.googleTaskListId}`);
              }
              if (user && !user.isGuest) {
                deleteDoc(doc(getUserTaskListsCollection(user.uid), dl.id)).catch(console.warn);
                // Also clean up any orphan tasks in Firestore for this deleted list
                tasksRef.current
                  .filter((t) => t.taskListId === dl.id || (dl.googleTaskListId && t.taskListId === dl.googleTaskListId))
                  .forEach((t) => {
                    deleteDoc(doc(getUserTasksCollection(user.uid), t.id)).catch(console.warn);
                  });
              }
            });
            safeLocalStorageSet(
              getUserStorageKey('deleted_task_lists'),
              Array.from(deletedTaskListIdsRef.current)
            );
          }

          const survivingLocal = taskListsRef.current.filter((l) => {
            if (deletedTaskListIdsRef.current.has(l.id)) return false;
            if (l.googleTaskListId && deletedTaskListIdsRef.current.has(l.googleTaskListId)) return false;
            const isDef = l.isDefault || l.id === 'list_default' || (l.title || '').trim().toLowerCase() === 'my tasks';
            if (isDef) return true;
            const gtlId = l.googleTaskListId || (l.id.startsWith('gtl_') ? l.id.replace('gtl_', '') : undefined);
            return !gtlId || remoteGtlIds.has(gtlId);
          });

          const previousListsMap = new Map(taskListsRef.current.map((l) => [l.id, l]));
          // Google remote lists placed first so canonical Google Task List IDs take precedence
          const combined = [...listsToProcess, ...survivingLocal];
          const { cleanLists, idRemap } = deduplicateTaskLists(combined);
          // Push any local custom task lists to Google Tasks if they don't have a googleTaskListId yet
          for (let i = 0; i < cleanLists.length; i++) {
            const list = cleanLists[i];
            const isDef = list.isDefault || list.id === 'list_default' || (list.title || '').trim().toLowerCase() === 'my tasks';
            if (!isDef && !list.googleTaskListId && !list.id.startsWith('gtl_')) {
              try {
                const resp = await createGoogleTaskList(token, list.title);
                if (resp?.id) {
                  const newGtlId = resp.id;
                  const newLocalId = `gtl_${newGtlId}`;
                  const oldId = list.id;
                  cleanLists[i] = {
                    ...list,
                    id: newLocalId,
                    googleTaskListId: newGtlId,
                  };
                  idRemap.set(oldId, newLocalId);
                  if (user && !user.isGuest) {
                    deleteDoc(doc(getUserTaskListsCollection(user.uid), oldId)).catch(console.warn);
                    setDoc(doc(getUserTaskListsCollection(user.uid), newLocalId), sanitizeForFirestore(cleanLists[i]), { merge: true }).catch(console.warn);
                  }
                }
              } catch (listCreateErr: any) {
                if (
                  (listCreateErr instanceof GoogleApiError && listCreateErr.status === 401) ||
                  listCreateErr?.status === 401 ||
                  listCreateErr?.message?.includes('401')
                ) {
                  await handleAuthFailure();
                  return;
                }
                console.warn(`Failed to push local list ${list.title} to Google Tasks:`, listCreateErr);
              }
            }
          }

          taskListsRef.current = cleanLists;
          setTaskLists(cleanLists);

          if (user && !user.isGuest) {
            cleanLists.forEach((l) => {
              const existing = previousListsMap.get(l.id);
              if (!existing || existing.title !== l.title || existing.isDefault !== l.isDefault || existing.googleTaskListId !== l.googleTaskListId) {
                setDoc(doc(getUserTaskListsCollection(user.uid), l.id), sanitizeForFirestore(l), { merge: true }).catch(console.warn);
              }
            });
          }

          if (idRemap.size > 0) {
            setTasks((prevTasks) => {
              let changed = false;
              const updated = prevTasks.map((t) => {
                const mappedId = idRemap.get(t.taskListId);
                if (mappedId && mappedId !== t.taskListId) {
                  changed = true;
                  const updatedTask = { ...t, taskListId: mappedId };
                  if (user && !user.isGuest) {
                    setDoc(doc(getUserTasksCollection(user.uid), t.id), { taskListId: mappedId }, { merge: true }).catch(console.warn);
                  }
                  return updatedTask;
                }
                return t;
              });
              if (changed) {
                tasksRef.current = updated;
              }
              return changed ? updated : prevTasks;
            });
            setActiveTaskListId((prevId) => idRemap.get(prevId) || prevId);
          }

          const activeLists = cleanLists;
          const isMatchingList = (t: TaskItem, targetList: TaskList) => {
            if (t.taskListId === targetList.id) return true;
            if (targetList.googleTaskListId && t.taskListId === targetList.googleTaskListId) return true;
            if (targetList.id.startsWith('gtl_') && t.taskListId === targetList.id.replace('gtl_', '')) return true;
            if (targetList.isDefault && (t.taskListId === 'list_default' || t.taskListId === '@default')) return true;
            return false;
          };

          const isTaskDirty = (incoming: TaskItem, existing?: TaskItem) => {
            if (!existing) return true;
            return (
              incoming.title !== existing.title ||
              incoming.status !== existing.status ||
              incoming.completed !== existing.completed ||
              incoming.archived !== existing.archived ||
              incoming.taskListId !== existing.taskListId ||
              incoming.taskListName !== existing.taskListName ||
              incoming.googleTaskId !== existing.googleTaskId ||
              incoming.due !== existing.due ||
              incoming.notes !== existing.notes ||
              incoming.priority !== existing.priority ||
              (incoming.subtasks?.length ?? 0) !== (existing.subtasks?.length ?? 0)
            );
          };

          const initialTasks = [...tasksRef.current];
          const initialTasksMap = new Map(initialTasks.map((t) => [t.id, t]));

          const resolveGoogleId = (t: TaskItem): string | undefined =>
            t.googleTaskId || (t.id.startsWith('gtask_') ? t.id.replace('gtask_', '') : undefined);

          const googleIdToLocalMap = new Map<string, TaskItem>();
          initialTasks.forEach((t) => {
            const gid = resolveGoogleId(t);
            if (gid) googleIdToLocalMap.set(gid, t);
          });

          const unifiedMap = new Map<string, TaskItem>();
          initialTasks.forEach((t) => {
            const key = resolveGoogleId(t) || t.id;
            unifiedMap.set(key, t);
          });
          const allDeletedTaskIds: string[] = [];

          const allRemoteTasks: { rt: TaskItem; list: TaskList }[] = [];
          const allRemoteGoogleTaskIds = new Set<string>();
          let allListsFetchedSuccessfully = true;

          for (const list of activeLists) {
            if (deletedTaskListIdsRef.current.has(list.id)) continue;
            if (list.googleTaskListId && deletedTaskListIdsRef.current.has(list.googleTaskListId)) continue;

            const isDefaultList = list.isDefault || list.id === 'list_default' || (list.title || '').trim().toLowerCase() === 'my tasks';
            const gtlId = list.googleTaskListId && list.googleTaskListId !== '@default'
              ? list.googleTaskListId
              : list.id.startsWith('gtl_')
              ? list.id.replace('gtl_', '')
              : isDefaultList
              ? '@default'
              : undefined;

            if (!gtlId) {
              continue;
            }

            try {
              const remoteTasks = await fetchGoogleTasks(token, gtlId, list.id, cleanLists);
              for (const rt of remoteTasks) {
                if (rt.googleTaskId) {
                  allRemoteGoogleTaskIds.add(rt.googleTaskId);
                }
                allRemoteTasks.push({ rt, list });
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
              if (listErr?.status === 404 || listErr?.message?.includes('404')) {
                // List was deleted on Google Tasks! Prune it from local state and Firestore
                deletedTaskListIdsRef.current.add(list.id);
                if (list.googleTaskListId) deletedTaskListIdsRef.current.add(list.googleTaskListId);
                if (user && !user.isGuest) {
                  deleteDoc(doc(getUserTaskListsCollection(user.uid), list.id)).catch(console.warn);
                }
                console.info(`[Sync] Pruned remotely deleted task list ${list.title} (404 Not Found)`);
                continue;
              }
              allListsFetchedSuccessfully = false;
              console.warn(`Failed to fetch tasks for list ${list.title}:`, listErr);
            }
          }

          // Only delete tasks if all lists were successfully fetched, avoiding false deletions on transient network errors.
          // Check across ALL remote lists so moving a task between lists on Google Tasks doesn't trigger deletion.
          if (allListsFetchedSuccessfully) {
            initialTasks.forEach((t) => {
              if (t.googleTaskId && !allRemoteGoogleTaskIds.has(t.googleTaskId)) {
                allDeletedTaskIds.push(t.id);
                unifiedMap.delete(t.googleTaskId);
                unifiedMap.delete(t.id);
              }
            });
          }

          allRemoteTasks.forEach(({ rt, list }) => {
            const rGid = rt.googleTaskId!;
            const existing = unifiedMap.get(rGid) || googleIdToLocalMap.get(rGid) || initialTasksMap.get(rt.id);
            if (existing) {
              if (existing.id !== rGid && unifiedMap.has(existing.id)) {
                unifiedMap.delete(existing.id);
              }
              unifiedMap.set(rGid, {
                ...existing,
                ...rt,
                id: existing.id,
                googleTaskId: rGid,
                taskListId: list.id,
                taskListName: list.title,
                tags: existing.tags || (rt as any).tags || [],
                subtasks: existing.subtasks?.length ? existing.subtasks : rt.subtasks,
                totalFocusSeconds: Math.max(existing.totalFocusSeconds || 0, rt.totalFocusSeconds || 0),
                pomodoroCount: Math.max(existing.pomodoroCount || 0, rt.pomodoroCount || 0),
                priority: existing.priority || 'medium',
                archived: rt.archived ? true : Boolean(existing.archived),
                archivedAt: rt.archived ? (rt.archivedAt || existing.archivedAt) : existing.archivedAt,
              });
            } else {
              unifiedMap.set(rGid, {
                ...rt,
                tags: (rt as any).tags || [],
                taskListId: list.id,
                taskListName: list.title,
              });
            }
          });

          if (user && !user.isGuest && allDeletedTaskIds.length > 0) {
            allDeletedTaskIds.forEach((delId) => {
              deleteDoc(doc(getUserTasksCollection(user.uid), delId)).catch(console.warn);
            });
          }

          const newArr = Array.from(unifiedMap.values());
          tasksRef.current = newArr;
          setTasks(newArr);

          if (user && !user.isGuest) {
            // Write ONLY tasks that have actual field changes compared to initial state
            const dirtyTasks = newArr.filter((item) => {
              const existing = initialTasksMap.get(item.id) || (item.googleTaskId ? googleIdToLocalMap.get(item.googleTaskId) : undefined);
              return isTaskDirty(item, existing);
            });

            dirtyTasks.forEach((taskItem) => {
              setDoc(doc(getUserTasksCollection(user.uid), taskItem.id), sanitizeForFirestore(taskItem), { merge: true }).catch(console.warn);
            });

            const activeOnly = newArr.filter((t) => !t.archived && t.status !== 'completed' && !t.completed);
            const activeSignature = activeOnly
              .map((t) => `${t.id}:${t.status}:${t.googleTaskId || ''}:${t.totalFocusSeconds || 0}`)
              .sort()
              .join('|');
            if (activeSignature !== lastSyncedActiveTasksSignatureRef.current) {
              lastSyncedActiveTasksSignatureRef.current = activeSignature;
              syncActiveTasksToFirestore(user.uid, activeOnly, 'googleTasks').catch(console.warn);
            }
          }

          // Two-way sync: Push local tasks that are missing Google Task IDs
          const currentTasks = [...tasksRef.current];
          const currentLists = taskListsRef.current;
          let anyPushed = false;
          for (const t of currentTasks) {
            if (!t.googleTaskId && !t.archived) {
              try {
                const gtlId = resolveGoogleTaskListId(t.taskListId || '@default', currentLists);
                const created = await createGoogleTask(token, gtlId, t, currentLists);
                if (created?.id) {
                  anyPushed = true;
                  const resolvedName = currentLists.find((l) => l.id === t.taskListId)?.title || t.taskListName;
                  setTasks((prev) =>
                    prev.map((item) => (item.id === t.id ? { ...item, googleTaskId: created.id, taskListName: resolvedName } : item))
                  );
                  tasksRef.current = tasksRef.current.map((item) => (item.id === t.id ? { ...item, googleTaskId: created.id, taskListName: resolvedName } : item));
                  if (user && !user.isGuest) {
                    setDoc(doc(getUserTasksCollection(user.uid), t.id), { googleTaskId: created.id, taskListName: resolvedName }, { merge: true }).catch(console.warn);
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
          if (anyPushed && user && !user.isGuest) {
            persistActiveTasks(tasksRef.current, 'googleTasks');
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
    [googleAccessToken, isGoogleTokenExpired, setIsGoogleTokenExpired, setTokenWithTimestamp, user]
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

    const titleExtract = cleanTitleWithHashtags(eventData.title || '');
    const descTags = extractHashtags(eventData.description || '');
    const combinedTags = mergeTags(eventData.tags, [...titleExtract.extractedTags, ...descTags]);
    const eventPayload = {
      ...eventData,
      title: titleExtract.cleanTitle || eventData.title,
      tags: combinedTags,
    };

    if (googleAccessToken && eventPayload.calendarId) {
      try {
        const gcalId = resolveGoogleCalendarId(eventPayload.calendarId, calendarsRef.current);
        const resp = await createGoogleEvent(googleAccessToken, gcalId, eventPayload);
        googleEventId = resp?.id;
      } catch (e) {
        console.warn('Failed to create event in Google Calendar directly:', e);
      }
    }

    const newEvent: CalendarEvent = {
      ...eventPayload,
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

    const titleExtract = partial.title !== undefined ? cleanTitleWithHashtags(partial.title) : undefined;
    const descTags = partial.description !== undefined ? extractHashtags(partial.description) : [];
    const rawTags = partial.tags !== undefined ? partial.tags : existing?.tags;
    const combinedTags = (partial.title !== undefined || partial.description !== undefined || partial.tags !== undefined)
      ? mergeTags(rawTags, [...(titleExtract?.extractedTags || []), ...descTags])
      : existing?.tags;

    const sanitizedPartial = {
      ...partial,
      ...(titleExtract ? { title: titleExtract.cleanTitle || partial.title } : {}),
      ...(combinedTags !== undefined ? { tags: combinedTags } : {}),
    };

    if (existing && googleAccessToken) {
      const gcalId = resolveGoogleCalendarId(sanitizedPartial.calendarId || existing.calendarId, calendarsRef.current);
      if (existing.googleEventId) {
        updateGoogleEvent(googleAccessToken, gcalId, existing.googleEventId, sanitizedPartial).catch(console.warn);
      } else {
        createGoogleEvent(googleAccessToken, gcalId, { ...existing, ...sanitizedPartial })
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
          const updated = { ...e, ...sanitizedPartial, updatedAt: now };
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
      } catch (e: any) {
        if (
          (e instanceof GoogleApiError && e.status === 401) ||
          e?.status === 401 ||
          e?.message?.includes('401')
        ) {
          setIsGoogleTokenExpired(true);
        }
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
    taskListsRef.current = [...taskListsRef.current, newList];
    setActiveTaskListId(newList.id);
    if (user && !user.isGuest) {
      setDoc(doc(getUserTaskListsCollection(user.uid), newList.id), sanitizeForFirestore(newList)).catch(console.warn);
    }
    return newList;
  };

  const deleteTaskList = async (listId: string) => {
    const list = taskLists.find((l) => l.id === listId);
    if (!list || list.isDefault) return; // Do not delete default task list

    const gtlId =
      list.googleTaskListId && list.googleTaskListId !== '@default' && list.googleTaskListId !== 'list_default'
        ? list.googleTaskListId
        : list.id.startsWith('gtl_')
        ? list.id.replace('gtl_', '')
        : undefined;

    // Record tombstone so neither Firestore snapshot nor Google sync can resurrect it
    deletedTaskListIdsRef.current.add(listId);
    if (gtlId) {
      deletedTaskListIdsRef.current.add(gtlId);
      deletedTaskListIdsRef.current.add(`gtl_${gtlId}`);
    }
    safeLocalStorageSet(
      getUserStorageKey('deleted_task_lists'),
      Array.from(deletedTaskListIdsRef.current)
    );

    if (googleAccessToken && gtlId) {
      deleteGoogleTaskList(googleAccessToken, gtlId).catch(console.warn);
    }

    setTaskLists((prev) => prev.filter((l) => l.id !== listId && (!gtlId || l.googleTaskListId !== gtlId)));
    taskListsRef.current = taskListsRef.current.filter((l) => l.id !== listId && (!gtlId || l.googleTaskListId !== gtlId));
    if (user && !user.isGuest) {
      deleteDoc(doc(getUserTaskListsCollection(user.uid), listId)).catch(console.warn);
      if (gtlId && listId !== `gtl_${gtlId}`) {
        deleteDoc(doc(getUserTaskListsCollection(user.uid), `gtl_${gtlId}`)).catch(console.warn);
      }
    }

    // Delete tasks belonging to this deleted list so they NEVER leak into 'My Tasks'
    const tasksToDelete = tasksRef.current.filter(
      (t) => t.taskListId === listId || (gtlId && (t.taskListId === gtlId || t.taskListId === `gtl_${gtlId}`))
    );
    if (user && !user.isGuest && tasksToDelete.length > 0) {
      tasksToDelete.forEach((t) => {
        deleteDoc(doc(getUserTasksCollection(user.uid), t.id)).catch(console.warn);
      });
    }

    setTasks((prev) => {
      const remainingTasks = prev.filter(
        (t) => t.taskListId !== listId && (!gtlId || (t.taskListId !== gtlId && t.taskListId !== `gtl_${gtlId}`))
      );
      tasksRef.current = remainingTasks;
      persistActiveTasks(remainingTasks, 'webApp');
      return remainingTasks;
    });

    if (activeTaskListId === listId || (gtlId && (activeTaskListId === gtlId || activeTaskListId === `gtl_${gtlId}`))) {
      const remaining = taskLists.filter((l) => l.id !== listId && (!gtlId || l.googleTaskListId !== gtlId));
      if (remaining.length > 0) setActiveTaskListId(remaining[0].id);
      else setActiveTaskListId('list_default');
    }
  };

  const createTask = async (taskData: Partial<TaskItem>): Promise<TaskItem> => {
    const newId = generateId('task');
    const now = new Date().toISOString();

    const rawListId = taskData.taskListId || activeTaskListId;
    const isVirtualList = !rawListId || ['all', 'starred', 'today', 'upcoming', 'archived_view'].includes(rawListId);
    const targetListId = isVirtualList
      ? (taskListsRef.current.find((l) => l.isDefault)?.id || taskListsRef.current[0]?.id || 'list_default')
      : rawListId;
    const targetList = taskListsRef.current.find(
      (l) =>
        l.id === targetListId ||
        (targetListId.startsWith('gtl_') && l.googleTaskListId === targetListId.replace('gtl_', '')) ||
        (l.googleTaskListId && l.googleTaskListId === targetListId)
    );

    const isTaskCompleted = taskData.status === 'completed' || Boolean(taskData.completed);

    const titleExtract = cleanTitleWithHashtags(taskData.title || 'New Task');
    const notesTags = extractHashtags(taskData.notes);
    const combinedTags = mergeTags(taskData.tags, [...titleExtract.extractedTags, ...notesTags]);
    const cleanTaskTitle = titleExtract.cleanTitle || (taskData.title || 'New Task').trim();

    const newTask: TaskItem = {
      id: newId,
      googleTaskId: undefined,
      taskListId: targetList?.id || targetListId,
      taskListName: targetList?.title || (targetListId === 'list_default' ? 'My Tasks' : undefined),
      title: cleanTaskTitle,
      notes: taskData.notes || '',
      status: isTaskCompleted ? 'completed' : 'needsAction',
      completed: isTaskCompleted,
      archived: Boolean(taskData.archived),
      archivedAt: taskData.archivedAt,
      due: taskData.due || undefined,
      priority: taskData.priority || 'medium',
      starred: Boolean(taskData.starred),
      subtasks: taskData.subtasks || [],
      tags: combinedTags,
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Optimistic immediate state update so task appears with zero latency
    setTasks((prev) => {
      const next = [newTask, ...prev];
      tasksRef.current = next;
      return next;
    });
    persistActiveTasks(tasksRef.current, 'webApp');

    setDoc(doc(getUserTasksCollection(effectiveUid), newId), sanitizeForFirestore(newTask)).catch(console.warn);

    // 2. Asynchronous Google Tasks synchronization without blocking the UI
    if (googleAccessToken && targetListId) {
      const pushTask = async (tokenToUse: string) => {
        try {
          const gtlId = resolveGoogleTaskListId(targetListId, taskListsRef.current);
          const resp = await createGoogleTask(tokenToUse, gtlId, newTask, taskListsRef.current);
          if (resp?.id) {
            setTasks((prev) => prev.map((t) => (t.id === newId ? { ...t, googleTaskId: resp.id } : t)));
            tasksRef.current = tasksRef.current.map((t) => (t.id === newId ? { ...t, googleTaskId: resp.id } : t));
            persistActiveTasks(tasksRef.current, 'webApp');
            setDoc(doc(getUserTasksCollection(effectiveUid), newId), { googleTaskId: resp.id }, { merge: true }).catch(console.warn);
          }
        } catch (e: any) {
          if (
            (e instanceof GoogleApiError && e.status === 401) ||
            e?.status === 401 ||
            e?.message?.includes('401')
          ) {
            setIsGoogleTokenExpired(true);
            const fresh = await fetchFreshGoogleTokenFromCloud();
            if (fresh) {
              setTokenWithTimestamp(fresh);
              setIsGoogleTokenExpired(false);
              try {
                const retryGtlId = resolveGoogleTaskListId(targetListId, taskListsRef.current);
                const retryResp = await createGoogleTask(fresh, retryGtlId, newTask, taskListsRef.current);
                if (retryResp?.id) {
                  setTasks((prev) => prev.map((t) => (t.id === newId ? { ...t, googleTaskId: retryResp.id } : t)));
                  tasksRef.current = tasksRef.current.map((t) => (t.id === newId ? { ...t, googleTaskId: retryResp.id } : t));
                  persistActiveTasks(tasksRef.current, 'webApp');
                  if (user && !user.isGuest) {
                    setDoc(doc(getUserTasksCollection(user.uid), newId), { googleTaskId: retryResp.id }, { merge: true }).catch(console.warn);
                  }
                }
              } catch (retryErr) {
                console.warn('Retry Google Tasks direct create notice:', retryErr);
              }
            }
          } else {
            console.warn('Google Tasks direct create notice:', e);
          }
        }
      };
      pushTask(googleAccessToken);
    }

    return newTask;
  };

  const updateTask = async (id: string, partial: Partial<TaskItem>) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (existing && googleAccessToken) {
      const gtlId = resolveGoogleTaskListId(partial.taskListId || existing.taskListId, taskListsRef.current);
      if (existing.googleTaskId) {
        updateGoogleTask(googleAccessToken, gtlId, existing.googleTaskId, partial, taskListsRef.current).catch((err) => {
          if (
            (err instanceof GoogleApiError && err.status === 401) ||
            err?.status === 401 ||
            err?.message?.includes('401')
          ) {
            setIsGoogleTokenExpired(true);
          }
          console.warn('Google Tasks direct update notice:', err);
        });
      } else {
        createGoogleTask(googleAccessToken, gtlId, { ...existing, ...partial }, taskListsRef.current)
          .then((created) => {
            if (created?.id) {
              setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, googleTaskId: created.id } : t)));
              tasksRef.current = tasksRef.current.map((t) => (t.id === id ? { ...t, googleTaskId: created.id } : t));
              persistActiveTasks(tasksRef.current, 'webApp');
              if (user && !user.isGuest) {
                setDoc(doc(getUserTasksCollection(user.uid), id), { googleTaskId: created.id }, { merge: true }).catch(console.warn);
              }
            }
          })
          .catch((err) => {
            if (
              (err instanceof GoogleApiError && err.status === 401) ||
              err?.status === 401 ||
              err?.message?.includes('401')
            ) {
              setIsGoogleTokenExpired(true);
            }
            console.warn('Google Tasks direct create notice:', err);
          });
      }
    }

    const now = new Date().toISOString();
    let updatedSnapshot: TaskItem | null = null;

    setTasks((prev) => {
      const nextTasks = prev.map((t) => {
        if (t.id === id) {
          const targetListId = partial.taskListId || t.taskListId;
          const targetList = taskListsRef.current.find(
            (l) =>
              l.id === targetListId ||
              (targetListId.startsWith('gtl_') && l.googleTaskListId === targetListId.replace('gtl_', '')) ||
              (l.googleTaskListId && l.googleTaskListId === targetListId)
          );
          const taskListName = partial.taskListName || (partial.taskListId ? targetList?.title : t.taskListName || targetList?.title);
          const canonicalListId = partial.taskListId ? (targetList?.id || targetListId) : t.taskListId;

          const titleExtract = partial.title !== undefined ? cleanTitleWithHashtags(partial.title) : undefined;
          const notesTags = partial.notes !== undefined ? extractHashtags(partial.notes) : [];
          const rawTags = partial.tags !== undefined ? partial.tags : t.tags;
          const combinedTags = (partial.title !== undefined || partial.notes !== undefined || partial.tags !== undefined)
            ? mergeTags(rawTags, [...(titleExtract?.extractedTags || []), ...notesTags])
            : t.tags;
          const updatedTitle = titleExtract ? (titleExtract.cleanTitle || partial.title?.trim() || t.title) : (partial.title !== undefined ? partial.title : t.title);

          const updated = {
            ...t,
            ...partial,
            title: updatedTitle,
            tags: combinedTags,
            taskListId: canonicalListId,
            taskListName,
            updatedAt: now,
          };
          updatedSnapshot = updated;
          return updated;
        }
        return t;
      });
      tasksRef.current = nextTasks;
      return nextTasks;
    });

    if (updatedSnapshot) {
      persistActiveTasks(tasksRef.current, 'webApp');
      if (effectiveUid) {
        setDoc(doc(getUserTasksCollection(effectiveUid), id), sanitizeForFirestore(updatedSnapshot), { merge: true }).catch(console.warn);
      }
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (!existing) return;
    const isCompleted = existing.status === 'completed' || Boolean(existing.completed);
    const nextStatus = isCompleted ? 'needsAction' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

    // Completing a task marks it completed, but does NOT immediately archive it.
    // It remains in the list / completed section until the user explicitly archives it or clicks "Archive Completed".
    const archived = nextStatus === 'completed' ? Boolean(existing.archived) : false;
    const archivedAt = nextStatus === 'completed' ? (existing.archived ? existing.archivedAt : null) : null;

    await updateTask(id, {
      status: nextStatus,
      completed: nextStatus === 'completed',
      completedAt: completedAt as any,
      archived,
      archivedAt: archivedAt as any,
    });
  };

  const archiveTask = async (id: string) => {
    const existing = tasksRef.current.find((t) => t.id === id) || tasks.find((t) => t.id === id);
    if (!existing) return;
    const now = new Date().toISOString();
    await updateTask(id, {
      archived: true,
      archivedAt: now,
      status: 'completed',
      completed: true,
      completedAt: existing.completedAt || now,
    });
  };

  const unarchiveTask = async (id: string) => {
    await updateTask(id, {
      archived: false,
      archivedAt: null as any,
      status: 'needsAction',
      completed: false,
      completedAt: null as any,
    });
  };

  const archiveCompletedTasks = async (taskListId?: string) => {
    const now = new Date().toISOString();
    const currentTasks = tasksRef.current;
    const targetTasks = currentTasks.filter((t) => {
      const isDone = t.status === 'completed' || Boolean(t.completed);
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

    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      tasksRef.current = next;
      persistActiveTasks(next, 'webApp');
      return next;
    });
    if (effectiveUid) {
      deleteDoc(doc(getUserTasksCollection(effectiveUid), id)).catch(console.warn);
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
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = [...(t.subtasks || []), subtask];
          const updated = { ...t, subtasks, updatedAt: new Date().toISOString() };
          if (effectiveUid) {
            setDoc(doc(getUserTasksCollection(effectiveUid), taskId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      });
      tasksRef.current = next;
      persistActiveTasks(next, 'webApp');
      return next;
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const updated = { ...t, subtasks, updatedAt: new Date().toISOString() };
          if (effectiveUid) {
            setDoc(doc(getUserTasksCollection(effectiveUid), taskId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      });
      tasksRef.current = next;
      persistActiveTasks(next, 'webApp');
      return next;
    });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = (t.subtasks || []).filter((s) => s.id !== subtaskId);
          const updated = { ...t, subtasks, updatedAt: new Date().toISOString() };
          if (effectiveUid) {
            setDoc(doc(getUserTasksCollection(effectiveUid), taskId), sanitizeForFirestore(updated), { merge: true }).catch(console.warn);
          }
          return updated;
        }
        return t;
      });
      tasksRef.current = next;
      persistActiveTasks(next, 'webApp');
      return next;
    });
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
    setFocusSessions((prev) => deduplicateFocusSessions([newSession, ...prev]));

    // Update credited tasks in memory and Firestore
    if (sessionData.taskTimeAllocations && Object.keys(sessionData.taskTimeAllocations).length > 0) {
      for (const [taskId, allocatedSeconds] of Object.entries(sessionData.taskTimeAllocations)) {
        if (allocatedSeconds > 0) {
          const currentTask = tasksRef.current.find((t) => t.id === taskId) || tasks.find((t) => t.id === taskId);
          const newSec = (currentTask?.totalFocusSeconds || 0) + allocatedSeconds;
          const newCnt = (currentTask?.pomodoroCount || 0) + 1;
          updateTask(taskId, {
            totalFocusSeconds: newSec,
            pomodoroCount: newCnt,
          });
          setDoc(
            doc(getUserTasksCollection(effectiveUid), taskId),
            { totalFocusSeconds: newSec, pomodoroCount: newCnt, updatedAt: new Date().toISOString() },
            { merge: true }
          ).catch(console.warn);
        }
      }
    } else if (sessionData.taskIds && sessionData.taskIds.length > 0) {
      const splitSec = Math.round(sessionData.durationSeconds / sessionData.taskIds.length);
      for (const taskId of sessionData.taskIds) {
        const currentTask = tasksRef.current.find((t) => t.id === taskId) || tasks.find((t) => t.id === taskId);
        const newSec = (currentTask?.totalFocusSeconds || 0) + splitSec;
        const newCnt = (currentTask?.pomodoroCount || 0) + 1;
        updateTask(taskId, {
          totalFocusSeconds: newSec,
          pomodoroCount: newCnt,
        });
        setDoc(
          doc(getUserTasksCollection(effectiveUid), taskId),
          { totalFocusSeconds: newSec, pomodoroCount: newCnt, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(console.warn);
      }
    } else if (sessionData.taskId) {
      const currentTask = tasksRef.current.find((t) => t.id === sessionData.taskId) || tasks.find((t) => t.id === sessionData.taskId);
      const newSec = (currentTask?.totalFocusSeconds || 0) + sessionData.durationSeconds;
      const newCnt = (currentTask?.pomodoroCount || 0) + 1;
      updateTask(sessionData.taskId, {
        totalFocusSeconds: newSec,
        pomodoroCount: newCnt,
      });
      setDoc(
        doc(getUserTasksCollection(effectiveUid), sessionData.taskId),
        { totalFocusSeconds: newSec, pomodoroCount: newCnt, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(console.warn);
    }

    setDoc(doc(getUserFocusSessionsCollection(effectiveUid), newSession.id), sanitizeForFirestore(newSession)).catch(console.warn);
  };

  // Computed Focus Statistics with dynamic consecutive-day streak calculation (local calendar timezone safe)
  const focusStats = useMemo<FocusStats>(() => {
    const todayStr = getTodayDateString();
    const getLocalSessionDate = (completedAt: string): string => {
      try {
        return format(parseISO(completedAt), 'yyyy-MM-dd');
      } catch {
        return completedAt.slice(0, 10);
      }
    };

    const todaySessions = focusSessions.filter((s) => s.mode === 'focus' && getLocalSessionDate(s.completedAt) === todayStr);
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
        .map((s) => getLocalSessionDate(s.completedAt))
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
    tasksRef.current = [];
    persistActiveTasks([], 'webApp');
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
