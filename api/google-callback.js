import { getOAuth2Client } from './_lib/oauth.js';
import supabase from './_lib/supabase.js';
import { ALLOWED_ORIGINS, getClientUrl } from './_lib/allowedOrigins.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { code, state: rawState, error: oauthError } = req.query;

  let profileId, clientUrl;
  try {
    const parsed = JSON.parse(rawState);
    profileId = parsed.profileId;
    clientUrl = getClientUrl(parsed.origin);
  } catch {
    profileId = rawState;
    clientUrl = getClientUrl('');
  }

  if (oauthError || !code || !profileId) {
    return res.redirect(`${clientUrl}/dashboard?calendar=error`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const updates = { calendar_connected: true };
    if (tokens.refresh_token) {
      updates.google_refresh_token = tokens.refresh_token;
    }

    const { error } = await supabase
      .from('mentor_profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) {
      console.error('Failed to store tokens:', error);
      return res.redirect(`${clientUrl}/dashboard?calendar=error`);
    }

    return res.redirect(`${clientUrl}/dashboard?calendar=connected`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.redirect(`${clientUrl}/dashboard?calendar=error`);
  }
}
