import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  memoryLocalCache,
  Firestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { cleanupLocalStorageQuota } from './utils';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyDC7zjTuvEIRV-e-dntemxNu6zXVL0DX1I',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'nayra-platform-2026.firebaseapp.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'nayra-platform-2026',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'nayra-platform-2026.firebasestorage.app',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '413144887088',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:413144887088:web:bd35b4bdd1bfb682bc22f5',
};

if (!firebaseConfig.apiKey && import.meta.env?.DEV) {
  console.warn('[NAYRA Security] VITE_FIREBASE_API_KEY is not defined in environment. Ensure .env is loaded.');
}

// Singleton Firebase App Initialization
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Clean up bloated/zombie localStorage keys on startup to ensure abundant quota
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    cleanupLocalStorageQuota();
  } catch (e) {
    console.warn('Storage cleanup notice:', e);
  }
}

// Persistent Firestore Initialization using persistentSingleTabManager to prevent localStorage exhaustion
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager(undefined),
    }),
  });
} catch (e) {
  console.warn('Persistent cache initialization notice, attempting memory fallback:', e);
  try {
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
  } catch {
    firestoreInstance = getFirestore(app);
  }
}

import { getFunctions, Functions, httpsCallable } from 'firebase/functions';

export const db: Firestore = firestoreInstance;
export const auth: Auth = getAuth(app);
export const functions: Functions = getFunctions(app);

// Google Auth Provider setup with progressive scopes
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/calendar');
googleAuthProvider.addScope('https://www.googleapis.com/auth/tasks');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export const GUEST_USER_ID = 'nayra_guest_user';

/**
 * Strips undefined properties so Firestore writes never error out
 */
export function sanitizeForFirestore<T>(data: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}

// User-scoped Firestore Collection Helpers
export const getUserDoc = (userId: string) => doc(db, 'users', userId);
export const getUserSettingsDoc = (userId: string) => doc(db, 'users', userId, 'config', 'settings');
export const getUserCalendarsCollection = (userId: string) => collection(db, 'users', userId, 'calendars');
export const getUserEventsCollection = (userId: string) => collection(db, 'users', userId, 'events');
export const getUserTaskListsCollection = (userId: string) => collection(db, 'users', userId, 'taskLists');
export const getUserTasksCollection = (userId: string) => collection(db, 'users', userId, 'tasks');
export const getUserFocusSessionsCollection = (userId: string) => collection(db, 'users', userId, 'focusSessions');
export const getUserHabitsCollection = (userId: string) => collection(db, 'users', userId, 'habits');
export const getUserCalorieEntriesCollection = (userId: string) => collection(db, 'users', userId, 'calorieEntries');
export const getUserCATopicsCollection = (userId: string) => collection(db, 'users', userId, 'caTopics');
export const getUserCATestsCollection = (userId: string) => collection(db, 'users', userId, 'caTests');
export const getUserCARevisionsCollection = (userId: string) => collection(db, 'users', userId, 'caRevisions');

// User-scoped Optimized Query Helpers
/**
 * Active-Only Tasks Query: Only retrieves non-completed tasks (status: 'needsAction')
 * to eliminate streaming and downloading completed tasks repeatedly.
 */
export const getActiveTasksQuery = (userId: string) =>
  query(getUserTasksCollection(userId), where('status', '==', 'needsAction'));

/**
 * Recent Focus Sessions Query: Only retrieves recent sessions (ordered by completedAt desc, limited count)
 * to eliminate downloading historical sessions while ensuring newly logged sessions stream instantly.
 */
export const getRecentFocusSessionsQuery = (userId: string, count = 30) =>
  query(getUserFocusSessionsCollection(userId), orderBy('completedAt', 'desc'), limit(count));

/**
 * On-demand Completed Tasks Query: Only used when user explicitly requests historical completed tasks
 */
export const getCompletedTasksQuery = (userId: string, count = 50) =>
  query(getUserTasksCollection(userId), where('status', '==', 'completed'), limit(count));

export const OPERATOR_UID = 'yApeiNzo23bPTvpEXHgNIgiTX0y1';

export interface ActiveTasksCloudDoc {
  tasks: any[];
  updatedAt: string;
  source: 'googleTasks' | 'webApp' | 'tab' | 'extension' | 'androidApp';
  completedTaskIds?: string[];
}

export const getUserActiveTasksDoc = (userId: string) => doc(db, 'users', userId, 'config', 'activeTasks');

const TASKS_STORAGE_HASH_KEY = 'nayra_last_synced_tasks_hash';
const TIMER_STORAGE_HASH_KEY = 'nayra_last_synced_timer_hash';

function getStoredHash(key: string): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key) || '';
    }
  } catch {}
  return '';
}

function setStoredHash(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, val);
    }
  } catch {}
}

// Debounce and signature guard for active tasks sync to avoid write loops and excessive billing
let lastSyncedTasksHash = getStoredHash(TASKS_STORAGE_HASH_KEY);
let pendingTasksSyncTimer: any = null;
let lastSyncedTasksTimestamp = 0;
const TASKS_SYNC_DEBOUNCE_MS = 2000;
const MIN_TASKS_SYNC_COOLDOWN_MS = 10000;

/**
 * Persists the clean active task list to users/{uid}/config/activeTasks in Firestore.
 * Guarded with structural signature hashing and cooldown debounce.
 */
export async function syncActiveTasksToFirestore(
  uid: string = OPERATOR_UID,
  tasks: any[],
  source: 'googleTasks' | 'webApp' | 'tab' | 'extension' | 'androidApp' = 'webApp'
): Promise<void> {
  if (!uid) return;

  const activeOnly = (Array.isArray(tasks) ? tasks : [])
    .filter((t) => !t.archived && t.status !== 'completed' && !t.completed)
    .map((t) => sanitizeForFirestore(t));

  // Compute signature based on structural identity and content, excluding live focus second increments
  const currentHash = activeOnly
    .map((t) => `${t.id}:${t.status}:${t.googleTaskId || ''}:${t.title || ''}`)
    .sort()
    .join('|');

  if (currentHash === lastSyncedTasksHash) {
    return;
  }

  const executeSync = async () => {
    try {
      lastSyncedTasksHash = currentHash;
      setStoredHash(TASKS_STORAGE_HASH_KEY, currentHash);
      lastSyncedTasksTimestamp = Date.now();
      const ref = getUserActiveTasksDoc(uid);
      await setDoc(ref, {
        tasks: activeOnly,
        updatedAt: new Date().toISOString(),
        source,
      });
    } catch (err) {
      console.warn('[Firebase] Could not sync active tasks to Firestore:', err);
    }
  };

  if (pendingTasksSyncTimer) {
    clearTimeout(pendingTasksSyncTimer);
    pendingTasksSyncTimer = null;
  }

  const timeSinceLast = Date.now() - lastSyncedTasksTimestamp;
  if (timeSinceLast < MIN_TASKS_SYNC_COOLDOWN_MS) {
    pendingTasksSyncTimer = setTimeout(() => {
      pendingTasksSyncTimer = null;
      executeSync();
    }, TASKS_SYNC_DEBOUNCE_MS);
  } else {
    await executeSync();
  }
}

/**
 * Real-time subscription to users/{uid}/config/activeTasks
 */
export function subscribeActiveTasksFromFirestore(
  uid: string = OPERATOR_UID,
  onUpdate: (doc: ActiveTasksCloudDoc) => void
): () => void {
  try {
    const ref = getUserActiveTasksDoc(uid);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as ActiveTasksCloudDoc);
        }
      },
      (err) => {
        console.warn('[Firebase] ActiveTasks realtime subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup active tasks subscription:', err);
    return () => {};
  }
}

/**
 * Fetches active tasks from users/{uid}/config/activeTasks
 */
export async function fetchActiveTasksFromFirestore(
  uid: string = OPERATOR_UID
): Promise<any[]> {
  try {
    const ref = getUserActiveTasksDoc(uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as ActiveTasksCloudDoc;
      if (Array.isArray(data.tasks)) {
        return data.tasks.filter((t) => !t.archived && t.status !== 'completed' && !t.completed);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Could not fetch active tasks from Firestore:', err);
  }
  return [];
}

// In-memory guard to prevent redundant / rapid loop timer writes
let lastSyncedTimerStateHash = getStoredHash(TIMER_STORAGE_HASH_KEY);
let lastSyncedTimerTimestamp = 0;
let pendingTimerSyncTimeout: any = null;
const TIMER_SYNC_DEBOUNCE_MS = 300;
const MIN_TIMER_SYNC_INTERVAL_MS = 15000;

/**
 * Sync active timer state across extension, tab, and web app via users/{uid}/config/activeTimer
 * Guarded against redundant 1-second countdown writes, rapid consecutive task-selection/start transitions,
 * and rapid cross-client loops via a 300ms trailing debounce and state hash verification.
 */
export async function syncActiveTimerToFirestore(
  uid: string = OPERATOR_UID,
  state: any
): Promise<void> {
  if (!uid || !state) return;

  if (pendingTimerSyncTimeout) {
    clearTimeout(pendingTimerSyncTimeout);
    pendingTimerSyncTimeout = null;
  }

  return new Promise<void>((resolve) => {
    pendingTimerSyncTimeout = setTimeout(async () => {
      pendingTimerSyncTimeout = null;
      try {
        // When timer is running, remainingSeconds decrements every second, but targetEndTime remains constant.
        // We only need to write to the cloud when mode, timerState, targetEndTime, or selectedTaskId changes.
        const stateHash = state.timerState === 'running'
          ? `${state.timerState}:${state.mode}:${state.targetEndTime || 0}:${state.selectedTaskId || ''}:${(state.activeTaskIds || []).sort().join(',')}`
          : `${state.timerState}:${state.mode}:${state.remainingSeconds ?? ''}:${state.selectedTaskId || ''}:${(state.activeTaskIds || []).sort().join(',')}`;

        const storedHash = getStoredHash(TIMER_STORAGE_HASH_KEY);
        const isStateTransition = stateHash !== (storedHash || lastSyncedTimerStateHash);

        // Suppress redundant writes: ONLY write to Firestore if the state has genuinely transitioned
        if (!isStateTransition) {
          resolve();
          return;
        }

        lastSyncedTimerStateHash = stateHash;
        setStoredHash(TIMER_STORAGE_HASH_KEY, stateHash);
        lastSyncedTimerTimestamp = Date.now();

        const ref = doc(db, 'users', uid, 'config', 'activeTimer');
        await setDoc(ref, state, { merge: true });
        resolve();
      } catch (err) {
        console.warn('[Firebase] Could not sync active timer to Firestore:', err);
        resolve();
      }
    }, TIMER_SYNC_DEBOUNCE_MS);
  });
}

/**
 * Real-time subscription to activeTimer document
 */
export function subscribeActiveTimerFromFirestore(
  uid: string = OPERATOR_UID,
  onUpdate: (state: any) => void
): () => void {
  try {
    const ref = doc(db, 'users', uid, 'config', 'activeTimer');
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data) {
            // Absorb incoming remote state hash into local cache so this client does not echo it back
            const stateHash = data.timerState === 'running'
              ? `${data.timerState}:${data.mode}:${data.targetEndTime || 0}:${data.selectedTaskId || ''}:${(data.activeTaskIds || []).sort().join(',')}`
              : `${data.timerState}:${data.mode}:${data.remainingSeconds ?? ''}:${data.selectedTaskId || ''}:${(data.activeTaskIds || []).sort().join(',')}`;
            lastSyncedTimerStateHash = stateHash;
            setStoredHash(TIMER_STORAGE_HASH_KEY, stateHash);
          }
          onUpdate(data);
        }
      },
      (err) => {
        console.warn('[Firebase] ActiveTimer realtime subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup active timer subscription:', err);
    return () => {};
  }
}

export {
  reauthenticateWithPopup,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  fbSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  httpsCallable,
};
export type { FirebaseUser };
