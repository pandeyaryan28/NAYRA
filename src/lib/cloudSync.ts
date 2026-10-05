import { functions, httpsCallable } from './firebase';

export interface FreshTokenResponse {
  accessToken: string;
  expiryDate?: number;
}

/**
 * Attempts to silently fetch a fresh Google OAuth access token from the backend Cloud Function
 * using the server-stored permanent refresh token.
 * Returns null if Cloud Functions are not yet deployed or if user hasn't linked offline access.
 */
export async function fetchFreshGoogleTokenFromCloud(): Promise<string | null> {
  try {
    const getFreshTokenFn = httpsCallable<{}, FreshTokenResponse>(functions, 'getFreshGoogleToken');
    const response = await getFreshTokenFn();
    if (response?.data?.accessToken) {
      return response.data.accessToken;
    }
    return null;
  } catch (err: any) {
    // Expected to fail silently if Cloud Functions are not yet deployed or refresh token not yet stored
    console.debug('Cloud token refresh unavailable, falling back to client flow:', err?.message || err);
    return null;
  }
}

/**
 * Stores a Google OAuth authorization code in the backend Cloud Function
 * to exchange it for a permanent refresh token stored in Firestore system_credentials/{uid}.
 */
export async function storeGoogleAuthorizationCode(code: string): Promise<boolean> {
  try {
    const storeCodeFn = httpsCallable<{ code: string }, { success: boolean }>(functions, 'storeGoogleOfflineCode');
    const response = await storeCodeFn({ code });
    return Boolean(response?.data?.success);
  } catch (err: any) {
    console.warn('Failed to store authorization code in Cloud Functions:', err);
    return false;
  }
}

/**
 * Initiates the Google Identity Services offline code authorization flow
 * to obtain an authorization code and exchange it for a permanent Refresh Token via Cloud Functions.
 */
export async function linkGoogleOfflineAccess(clientId?: string): Promise<boolean> {
  const gClientId =
    clientId ||
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('nayra_google_client_id') : null);
  if (!gClientId) {
    console.warn('Cannot link offline access: Google Client ID is not configured.');
    return false;
  }

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    console.warn('Google Identity Services SDK not loaded yet.');
    return false;
  }

  return new Promise((resolve) => {
    try {
      const codeClient = google.accounts.oauth2.initCodeClient({
        client_id: gClientId,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response?.code) {
            const success = await storeGoogleAuthorizationCode(response.code);
            resolve(success);
          } else {
            resolve(false);
          }
        },
        error_callback: (err: any) => {
          console.warn('GIS Code Client Error:', err);
          resolve(false);
        },
      });

      codeClient.requestCode();
    } catch (err) {
      console.warn('Failed to start code client:', err);
      resolve(false);
    }
  });
}

/**
 * Saves Google OAuth Client ID and Secret in Firestore system_config/google_oauth via Cloud Function
 */
export async function setGoogleOAuthCredentialsOnCloud(
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  try {
    const fn = httpsCallable<{ clientId: string; clientSecret: string }, { success: boolean }>(
      functions,
      'setGoogleOAuthCredentials'
    );
    const res = await fn({ clientId, clientSecret });
    return Boolean(res?.data?.success);
  } catch (err: any) {
    console.warn('Failed to save OAuth credentials on Cloud:', err);
    return false;
  }
}

/**
 * Checks if server OAuth is configured and whether user has linked offline credentials
 */
export async function getGoogleOAuthStatusFromCloud(): Promise<{
  isConfigured: boolean;
  hasUserLinkedOffline: boolean;
  clientId: string | null;
}> {
  try {
    const fn = httpsCallable<
      {},
      { isConfigured: boolean; hasUserLinkedOffline: boolean; clientId: string | null }
    >(functions, 'getGoogleOAuthStatus');
    const res = await fn();
    return res.data || { isConfigured: false, hasUserLinkedOffline: false, clientId: null };
  } catch (err) {
    return { isConfigured: false, hasUserLinkedOffline: false, clientId: null };
  }
}

