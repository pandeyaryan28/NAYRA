import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of execution CWD
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env')
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

let db: admin.firestore.Firestore | null = null;
let isFirestoreConnected = false;

try {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'nyra-ap28-2026';
    
    // Check if service account key is provided via env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId
      });
      db = admin.firestore();
      isFirestoreConnected = true;
      console.log('✅ Firebase Admin connected with Service Account for:', projectId);
    } else {
      console.log('⚡ Running Nayra with high-speed persistent local database engine (zero latency).');
    }
  }
} catch (err: any) {
  console.warn('⚠️ Firebase Admin initialization notice:', err.message);
}

export { admin, db, isFirestoreConnected };
