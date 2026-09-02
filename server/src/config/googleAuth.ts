import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// In-memory token store (can be persisted to Firestore)
interface TokenStore {
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
  // Pre-populate with active dummy session so user can immediately test sync features
  isMock: !GOOGLE_CLIENT_ID,
  userEmail: 'aryan@nayra.command',
  userName: 'Aryan Pandey',
  userPicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
};

export const getOAuth2Client = () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return null;
  }
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

export const generateAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    return null;
  }
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: OAUTH_SCOPES,
    prompt: 'consent'
  });
};

export const saveTokens = (tokens: any, userInfo?: any) => {
  storedTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || storedTokens.refreshToken,
    expiryDate: tokens.expiry_date,
    idToken: tokens.id_token,
    userEmail: userInfo?.email || storedTokens.userEmail,
    userName: userInfo?.name || storedTokens.userName,
    userPicture: userInfo?.picture || storedTokens.userPicture,
    isMock: false
  };
  return storedTokens;
};

export const getStoredTokens = () => storedTokens;

export const clearTokens = () => {
  storedTokens = {
    isMock: false
  };
};

export const getAuthenticatedGoogleClient = () => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !storedTokens.accessToken) {
    return null;
  }
  oauth2Client.setCredentials({
    access_token: storedTokens.accessToken,
    refresh_token: storedTokens.refreshToken,
    expiry_date: storedTokens.expiryDate
  });
  return oauth2Client;
};
