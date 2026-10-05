import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  GUEST_USER_ID,
  getUserDoc,
  setDoc,
  sanitizeForFirestore,
} from '@/lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';
import { UserProfile } from '@/types';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';
import { fetchFreshGoogleTokenFromCloud } from '@/lib/cloudSync';

export interface AuthContextValue {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  googleAccessToken: string | null;
  isGoogleTokenExpired: boolean;
  setIsGoogleTokenExpired: (expired: boolean) => void;
  reconnectGoogle: () => Promise<string | null>;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nayra_user_profile';
const TOKEN_STORAGE_KEY = 'nayra_google_token';
const TOKEN_TIMESTAMP_KEY = 'nayra_google_token_time';
const TOKEN_EXPIRY_MS = 55 * 60 * 1000; // 55 minutes (Google tokens expire in 60 min)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialUser = (): UserProfile | null => {
    const stored = safeLocalStorageGet<UserProfile | null>(AUTH_STORAGE_KEY, null);
    if (stored) return stored;
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'test' &&
      !(window as any).__NAYRA_TEST_UNAUTHENTICATED__
    ) {
      return {
        uid: 'test_operator_id',
        email: 'test@nayra.internal',
        displayName: 'Test Operator',
        photoURL: null,
        isGuest: false,
        hasGoogleCalendarScope: true,
        hasGoogleTasksScope: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
    }
    return null;
  };

  const initialUser = getInitialUser();
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() =>
    safeLocalStorageGet<string | null>(TOKEN_STORAGE_KEY, null)
  );
  const [isGoogleTokenExpired, setIsGoogleTokenExpired] = useState<boolean>(() => {
    const token = safeLocalStorageGet<string | null>(TOKEN_STORAGE_KEY, null);
    const time = safeLocalStorageGet<number | null>(TOKEN_TIMESTAMP_KEY, null);
    if (!token || !time) return false;
    return Date.now() - time > TOKEN_EXPIRY_MS;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return false;
    }
    return !initialUser;
  });
  const [error, setError] = useState<string | null>(null);

  // Attempt silent cloud token refresh on boot if user is signed in
  useEffect(() => {
    if (user && !user.isGuest) {
      fetchFreshGoogleTokenFromCloud().then((freshToken) => {
        if (freshToken) {
          setTokenWithTimestamp(freshToken);
          setIsGoogleTokenExpired(false);
        }
      }).catch(console.warn);
    }
  }, [user?.uid]);

  const setTokenWithTimestamp = (token: string | null) => {
    setGoogleAccessToken(token);
    if (token) {
      const now = Date.now();
      safeLocalStorageSet(TOKEN_STORAGE_KEY, token);
      safeLocalStorageSet(TOKEN_TIMESTAMP_KEY, now);
      setIsGoogleTokenExpired(false);
    } else {
      safeLocalStorageSet(TOKEN_STORAGE_KEY, null);
      safeLocalStorageSet(TOKEN_TIMESTAMP_KEY, null);
      setIsGoogleTokenExpired(false);
    }
  };

  // Sync state changes with localStorage
  useEffect(() => {
    safeLocalStorageSet(AUTH_STORAGE_KEY, user);
  }, [user]);

  useEffect(() => {
    safeLocalStorageSet(TOKEN_STORAGE_KEY, googleAccessToken);
  }, [googleAccessToken]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'NAYRA Operator',
          photoURL: fbUser.photoURL,
          isGuest: false,
          hasGoogleCalendarScope: Boolean(googleAccessToken),
          hasGoogleTasksScope: Boolean(googleAccessToken),
          createdAt: user?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(profile);

        // Sync profile to Firestore
        try {
          await setDoc(getUserDoc(fbUser.uid), sanitizeForFirestore(profile), { merge: true });
        } catch (e) {
          console.warn('Could not sync user profile to Firestore:', e);
        }
      } else if (!user?.isGuest && !(typeof process !== 'undefined' && process.env.NODE_ENV === 'test' && !(window as any).__NAYRA_TEST_UNAUTHENTICATED__)) {
        setUser(null);
        setTokenWithTimestamp(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [googleAccessToken]);

  const reconnectGoogle = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Attempt silent background refresh via Cloud Function (zero user interaction)
      const silentToken = await fetchFreshGoogleTokenFromCloud();
      if (silentToken) {
        setTokenWithTimestamp(silentToken);
        setIsGoogleTokenExpired(false);
        return silentToken;
      }

      // 2. Fall back to fast client popup if Cloud Function is not configured
      let token: string | null = null;
      let fbUser = auth.currentUser;

      try {
        if (fbUser) {
          const result = await reauthenticateWithPopup(fbUser, googleAuthProvider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          token = credential?.accessToken || null;
        }
      } catch (reauthErr) {
        console.warn('reauthenticateWithPopup failed, falling back to signInWithPopup:', reauthErr);
      }

      if (!token) {
        const result = await signInWithPopup(auth, googleAuthProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        token = credential?.accessToken || null;
        fbUser = result.user;
      }

      if (token) {
        setTokenWithTimestamp(token);
        setIsGoogleTokenExpired(false);

        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || 'NAYRA Operator',
            photoURL: fbUser.photoURL,
            isGuest: false,
            hasGoogleCalendarScope: true,
            hasGoogleTasksScope: true,
            createdAt: user?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(profile);
          try {
            await setDoc(getUserDoc(fbUser.uid), sanitizeForFirestore(profile), { merge: true });
          } catch (e) {
            console.warn('Could not sync user profile to Firestore:', e);
          }
        }
        return token;
      }
      return null;
    } catch (err: any) {
      console.error('Google Reconnect Error:', err);
      const msg = err?.message || 'Failed to reconnect Google account.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;

      if (token) {
        setTokenWithTimestamp(token);
      }

      const fbUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'NAYRA Operator',
        photoURL: fbUser.photoURL,
        isGuest: false,
        hasGoogleCalendarScope: Boolean(token),
        hasGoogleTasksScope: Boolean(token),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(profile);
      try {
        await setDoc(getUserDoc(fbUser.uid), sanitizeForFirestore(profile), { merge: true });
      } catch (e) {
        console.warn('Could not write user profile to Firestore:', e);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const msg = err?.message || 'Google Sign-in failed. Please check popup blockers or continue as guest.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = cred.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || email.split('@')[0],
        photoURL: fbUser.photoURL,
        isGuest: false,
        hasGoogleCalendarScope: Boolean(googleAccessToken),
        hasGoogleTasksScope: Boolean(googleAccessToken),
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(profile);
      try {
        await setDoc(getUserDoc(fbUser.uid), sanitizeForFirestore(profile), { merge: true });
      } catch (e) {
        console.warn('Could not write user profile to Firestore:', e);
      }
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      let msg = 'Authentication failed. Please verify your credentials.';
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password'
      ) {
        msg = 'Invalid email or password.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = cred.user;
      if (name.trim()) {
        try {
          await updateProfile(fbUser, { displayName: name.trim() });
        } catch (e) {
          console.warn('Could not update display name:', e);
        }
      }
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: name.trim() || fbUser.displayName || email.split('@')[0],
        photoURL: fbUser.photoURL,
        isGuest: false,
        hasGoogleCalendarScope: false,
        hasGoogleTasksScope: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(profile);
      try {
        await setDoc(getUserDoc(fbUser.uid), sanitizeForFirestore(profile), { merge: true });
      } catch (e) {
        console.warn('Could not write user profile to Firestore:', e);
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      let msg = 'Registration failed.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const msg = err?.message || 'Failed to send password reset email.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const continueAsGuest = () => {
    const guestProfile: UserProfile = {
      uid: GUEST_USER_ID,
      email: null,
      displayName: 'Guest Operator',
      photoURL: null,
      isGuest: true,
      hasGoogleCalendarScope: false,
      hasGoogleTasksScope: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(guestProfile);
    setTokenWithTimestamp(null);
    setError(null);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    setTokenWithTimestamp(null);
    safeLocalStorageSet(AUTH_STORAGE_KEY, null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        googleAccessToken,
        isGoogleTokenExpired,
        setIsGoogleTokenExpired,
        reconnectGoogle,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        continueAsGuest,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
