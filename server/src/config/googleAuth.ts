import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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

const DATA_DIR = path.resolve(__dirname, '../../data');
const TOKEN_FILE = path.join(DATA_DIR, 'google_tokens.json');

export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export interface TokenStore {
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: number;
  idToken?: string;
  userEmail?: string;
  userName?: string;
  userPicture?: string;
  isMock?: boolean;
}

let storedTokens: TokenStore = {
  isMock: false,
  userEmail: 'aryan@nayra.command',
  userName: 'Aryan Pandey',
  userPicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
};

function loadStoredTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      storedTokens = {
        ...storedTokens,
        ...parsed,
        isMock: false
      };
      console.log('🔑 Loaded Google OAuth tokens from disk for:', storedTokens.userEmail || 'User');
    }
  } catch (e: any) {
    console.warn('Could not read google_tokens.json:', e.message);
  }
}

function persistTokens() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(storedTokens, null, 2), 'utf-8');
  } catch (e: any) {
    console.error('Failed to persist google_tokens.json:', e.message);
  }
}

// Load tokens on init
loadStoredTokens();

export const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    return null;
  }
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.on('tokens', (tokens) => {
    if (tokens.access_token) {
      storedTokens.accessToken = tokens.access_token;
    }
    if (tokens.refresh_token) {
      storedTokens.refreshToken = tokens.refresh_token;
    }
    if (tokens.expiry_date) {
      storedTokens.expiryDate = tokens.expiry_date;
    }
    persistTokens();
  });

  return oauth2Client;
};

export const generateAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    return null;
  }
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: OAUTH_SCOPES,
    prompt: 'consent',
    include_granted_scopes: true
  });
};

export const saveTokens = (tokens: any, userInfo?: any) => {
  storedTokens = {
    accessToken: tokens.access_token || storedTokens.accessToken,
    refreshToken: tokens.refresh_token || storedTokens.refreshToken,
    expiryDate: tokens.expiry_date || storedTokens.expiryDate,
    idToken: tokens.id_token || storedTokens.idToken,
    userEmail: userInfo?.email || storedTokens.userEmail,
    userName: userInfo?.name || storedTokens.userName,
    userPicture: userInfo?.picture || storedTokens.userPicture,
    isMock: false
  };
  persistTokens();
  return storedTokens;
};

export const getStoredTokens = () => storedTokens;

export const clearTokens = () => {
  storedTokens = {
    isMock: false,
    userEmail: 'aryan@nayra.command',
    userName: 'Aryan Pandey',
    userPicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
  };
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
  } catch (e) {}
};

export const isGoogleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const isGoogleAuthenticated = () => Boolean(storedTokens.accessToken || storedTokens.refreshToken);

export const getAuthenticatedGoogleClient = () => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || (!storedTokens.accessToken && !storedTokens.refreshToken)) {
    return null;
  }
  oauth2Client.setCredentials({
    access_token: storedTokens.accessToken,
    refresh_token: storedTokens.refreshToken,
    expiry_date: storedTokens.expiryDate
  });
  return oauth2Client;
};
