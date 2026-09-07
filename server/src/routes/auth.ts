import { Router } from 'express';
import { 
  generateAuthUrl, 
  getOAuth2Client, 
  getStoredTokens, 
  saveTokens, 
  clearTokens,
  isGoogleAuthenticated,
  isGoogleConfigured
} from '../config/googleAuth.js';
import { google } from 'googleapis';

const router = Router();

router.get('/status', (req, res) => {
  const tokens = getStoredTokens();
  const googleConnected = isGoogleAuthenticated();
  const googleConfigured = isGoogleConfigured();

  res.json({
    authenticated: true, // Single-user local mode is always authenticated
    isMock: false,
    googleConnected,
    googleConfigured,
    user: {
      name: tokens.userName || 'Aryan Pandey',
      email: tokens.userEmail || 'aryan@nayra.command',
      picture: tokens.userPicture || 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
    }
  });
});

router.get('/google/url', (req, res) => {
  const url = generateAuthUrl();
  if (!url) {
    return res.status(400).json({
      error: 'Google OAuth credentials not configured in server .env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).'
    });
  }
  res.json({ url });
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  const oauth2Client = getOAuth2Client();

  if (!oauth2Client || !code) {
    return res.redirect('http://localhost:3000/?auth=failed');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info
    let userInfo: any = null;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userRes = await oauth2.userinfo.get();
      userInfo = userRes.data;
    } catch (uErr) {
      console.warn('Could not fetch userinfo from Google:', uErr);
    }

    saveTokens(tokens, userInfo);
    console.log('✅ Google OAuth successfully linked for user:', userInfo?.email || 'Aryan Pandey');
    res.redirect('http://localhost:3000/?auth=success');
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    res.redirect(`http://localhost:3000/?auth=error&msg=${encodeURIComponent(err.message)}`);
  }
});

// Manual auth code ingestion
router.post('/google/manual-code', async (req, res) => {
  const { code } = req.body;
  const oauth2Client = getOAuth2Client();

  if (!oauth2Client) {
    return res.status(400).json({ error: 'Google OAuth client not configured.' });
  }
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required.' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    oauth2Client.setCredentials(tokens);

    let userInfo: any = null;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userRes = await oauth2.userinfo.get();
      userInfo = userRes.data;
    } catch (uErr) {}

    const saved = saveTokens(tokens, userInfo);
    res.json({
      success: true,
      message: 'Successfully connected Google account with authorization code.',
      user: {
        email: saved.userEmail,
        name: saved.userName
      }
    });
  } catch (err: any) {
    console.error('Manual code exchange error:', err);
    res.status(400).json({ error: err.message || 'Failed to exchange authorization code' });
  }
});

router.post('/logout', (req, res) => {
  clearTokens();
  res.json({ success: true, message: 'Disconnected from Google Account' });
});

export default router;
