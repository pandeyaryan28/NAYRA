import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithPopup,
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

// Singleton Firebase App Initialization
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Persistent Multi-Tab Firestore Initialization
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreInstance = getFirestore(app);
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

export {
  reauthenticateWithPopup,
  signInWithPopup,
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
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  httpsCallable,
};
export type { FirebaseUser };
