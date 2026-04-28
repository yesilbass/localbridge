import { getOAuth2Client } from './_lib/oauth.js';
import { ALLOWED_ORIGINS, getClientUrl } from './_lib/allowedOrigins.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { mentor_profile_id } = req.query;
  if (!mentor_profile_id) {
    return res.status(400).json({ error: 'mentor_profile_id is required' });
  }

  const origin = req.headers.origin || '';
  const safeOrigin = getClientUrl(origin);
  const state = JSON.stringify({ profileId: mentor_profile_id, origin: safeOrigin });

  const oauth2Client = getOAuth2Client();

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state,
  });

  return res.json({ url });
}
