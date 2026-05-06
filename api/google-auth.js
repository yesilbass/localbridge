import { getOAuth2Client } from './_lib/oauth.js';
import { getClientUrl } from './_lib/allowedOrigins.js';
import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const { mentor_profile_id } = req.query;
  if (!mentor_profile_id) {
    return res.status(400).json({ error: 'mentor_profile_id is required' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('user_id')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(404).json({ error: 'Mentor profile not found' });
  }
  if (profile.user_id !== user.id) {
    return res.status(403).json({ error: 'You do not own this mentor profile' });
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
