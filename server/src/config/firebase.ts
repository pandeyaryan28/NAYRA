import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db: admin.firestore.Firestore | null = null;
let isFirestoreConnected = false;

try {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'nayra-ap28-2026';
    
    // Check if service account key is provided via env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId
      });
    } else {
      // Use application default credentials or project config
      admin.initializeApp({
        projectId
      });
    }
  }
  
  db = admin.firestore();
  isFirestoreConnected = true;
  console.log('✅ Firebase Admin initialized with project:', process.env.FIREBASE_PROJECT_ID || 'nayra-ap28-2026');
} catch (err: any) {
  console.warn('⚠️ Firebase Admin init notice:', err.message);
  console.log('ℹ️ Running with active Firestore bridge mode.');
}

export { admin, db, isFirestoreConnected };
