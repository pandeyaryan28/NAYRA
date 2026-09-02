import { Router } from 'express';
import { generateAuthUrl, getOAuth2Client, getStoredTokens, saveTokens, clearTokens } from '../config/googleAuth.js';
import { google } from 'googleapis';

const router = Router();

router.get('/status', (req, res) => {
  const tokens = getStoredTokens();
  res.json({
    authenticated: Boolean(tokens.accessToken || tokens.isMock),
    isMock: Boolean(tokens.isMock),
    user: {
      name: tokens.userName || 'Commander',
      email: tokens.userEmail || 'commander@nayra.hub',
      picture: tokens.userPicture || 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'
    }
  });
});

router.get('/google/url', (req, res) => {
  const url = generateAuthUrl();
  if (!url) {
    return res.status(400).json({
      error: 'Google OAuth credentials not configured in server .env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).',
      mockAvailable: true
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
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    saveTokens(tokens, userInfo.data);
    res.redirect('http://localhost:3000/?auth=success');
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    res.redirect(`http://localhost:3000/?auth=error&msg=${encodeURIComponent(err.message)}`);
  }
});

router.post('/logout', (req, res) => {
  clearTokens();
  res.json({ success: true, message: 'Disconnected from Google Account' });
});

router.post('/mock-connect', (req, res) => {
  const tokens = getStoredTokens();
  tokens.isMock = true;
  tokens.userName = 'Aryan Pandey';
  tokens.userEmail = 'aryan@nayra.command';
  tokens.userPicture = 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander';
  res.json({ success: true, message: 'Connected in simulated cloud mode.' });
});

export default router;
