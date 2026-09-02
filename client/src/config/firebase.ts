import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBCuAqn3l06s2vOhehEo5a9wjJcCXTCkTI",
  authDomain: "nayra-ap28-2026.firebaseapp.com",
  projectId: "nayra-ap28-2026",
  storageBucket: "nayra-ap28-2026.firebasestorage.app",
  messagingSenderId: "906360138563",
  appId: "1:906360138563:web:437761fd2997b035569df6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
