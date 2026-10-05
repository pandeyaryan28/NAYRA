const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { OAuth2Client } = require("google-auth-library");
const logger = require("firebase-functions/logger");

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

/**
 * Creates an authorized OAuth2 Client using server credentials from env or Firestore system_config
 */
async function getOAuth2Client() {
  let clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_FIREBASE_GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    try {
      const configDoc = await db.collection("system_config").doc("google_oauth").get();
      if (configDoc.exists) {
        const data = configDoc.data();
        clientId = clientId || data.clientId;
        clientSecret = clientSecret || data.clientSecret;
      }
    } catch (e) {
      logger.warn("Could not read system_config/google_oauth:", e);
    }
  }

  return new OAuth2Client(clientId, clientSecret, "postmessage");
}

/**
 * Health check endpoint
 */
exports.health = onRequest({ cors: true }, (request, response) => {
  logger.info("NAYRA Cloud Sync health check invoked");
  response.json({
    status: "healthy",
    service: "nayra-cloud-sync",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Callable Function: Securely stores the project's Google OAuth Client ID & Secret
 * in Firestore system_config/google_oauth. Inaccessible to client SDKs.
 */
exports.setGoogleOAuthCredentials = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to configure OAuth.");
  }

  const { clientId, clientSecret } = request.data || {};
  if (!clientId || !clientSecret) {
    throw new HttpsError("invalid-argument", "Missing Google Client ID or Client Secret.");
  }

  await db.collection("system_config").doc("google_oauth").set({
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    configuredBy: request.auth.uid,
    updatedAt: new Date().toISOString(),
  });

  logger.info(`Google OAuth server credentials configured by ${request.auth.uid}`);
  return { success: true };
});

/**
 * Callable Function: Checks if OAuth is configured and whether current user has linked offline access
 */
exports.getGoogleOAuthStatus = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    return { isConfigured: false, hasUserLinkedOffline: false, clientId: null };
  }

  const uid = request.auth.uid;
  let clientId = process.env.GOOGLE_CLIENT_ID || null;
  let isConfigured = Boolean(clientId && process.env.GOOGLE_CLIENT_SECRET);

  if (!isConfigured) {
    try {
      const configDoc = await db.collection("system_config").doc("google_oauth").get();
      if (configDoc.exists) {
        const data = configDoc.data();
        if (data.clientId && data.clientSecret) {
          isConfigured = true;
          clientId = data.clientId;
        }
      }
    } catch (e) {
      logger.warn("Error reading google_oauth status:", e);
    }
  }

  let hasUserLinkedOffline = false;
  try {
    const credDoc = await db.collection("system_credentials").doc(uid).get();
    hasUserLinkedOffline = Boolean(credDoc.exists && credDoc.data().refreshToken);
  } catch (e) {
    logger.warn("Error reading user credentials:", e);
  }

  return { isConfigured, hasUserLinkedOffline, clientId };
});

/**
 * Callable Function: Stores the Google OAuth authorization code, exchanges it
 * for a permanent Refresh Token, and saves it in Firestore system_credentials/{uid}.
 * This collection is inaccessible to client SDKs via firestore.rules.
 */
exports.storeGoogleOfflineCode = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to link Google credentials.");
  }

  const { code } = request.data || {};
  if (!code) {
    throw new HttpsError("invalid-argument", "Missing Google authorization code.");
  }

  const uid = request.auth.uid;
  const oauth2Client = await getOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);

    const docRef = db.collection("system_credentials").doc(uid);
    const existingSnap = await docRef.get();
    const existingRefreshToken = existingSnap.exists ? existingSnap.data().refreshToken : null;

    const refreshTokenToSave = tokens.refresh_token || existingRefreshToken;

    if (!refreshTokenToSave) {
      logger.warn(`No refresh token returned for user ${uid}. Ensure prompt: 'consent' was sent.`);
    }

    await docRef.set(
      {
        uid,
        refreshToken: refreshTokenToSave,
        accessToken: tokens.access_token,
        expiryDate: tokens.expiry_date,
        scopes: [
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/tasks",
        ],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    logger.info(`Successfully stored Google OAuth credentials for user ${uid}`);
    return {
      success: true,
      hasRefreshToken: Boolean(refreshTokenToSave),
      accessToken: tokens.access_token,
      expiresIn: tokens.expiry_date,
    };
  } catch (err) {
    logger.error("Failed to exchange code for Google refresh token:", err);
    throw new HttpsError("internal", err.message || "Failed to exchange authorization code.");
  }
});

/**
 * Callable Function: Automatically generates a fresh Google Access Token on demand
 * using the server-stored permanent Refresh Token.
 * Runs silently in the background whenever the client asks, 24/7, without any popup.
 */
exports.getFreshGoogleToken = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to request an access token.");
  }

  const uid = request.auth.uid;
  const credDoc = await db.collection("system_credentials").doc(uid).get();

  if (!credDoc.exists || !credDoc.data().refreshToken) {
    throw new HttpsError(
      "not-found",
      "No stored Google refresh token found. User must link Google offline access once."
    );
  }

  const { refreshToken } = credDoc.data();
  const oauth2Client = await getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { token, res } = await oauth2Client.getAccessToken();
    const expiryDate = res?.data?.expires_in ? Date.now() + res.data.expires_in * 1000 : null;

    // Cache latest access token in Firestore
    await db.collection("system_credentials").doc(uid).set(
      {
        accessToken: token,
        expiryDate,
        lastRefreshedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      accessToken: token,
      expiryDate,
    };
  } catch (err) {
    logger.error(`Failed to refresh Google token for user ${uid}:`, err);
    throw new HttpsError("internal", "Failed to refresh Google token from stored credentials.");
  }
});
