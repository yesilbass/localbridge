import { getOAuth2Client } from './_lib/oauth.js';
import supabase from './_lib/supabase.js';
import { getClientUrl } from './_lib/allowedOrigins.js';

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

    // Google only returns refresh_token on the first authorization (or after explicit
    // revocation). On a re-consent without a refresh_token we cannot perform offline
    // calendar operations, so do NOT mark the mentor as connected — bounce them back
    // with an error so they reconnect via account.google.com revoke + reauthorize.
    if (!tokens.refresh_token) {
      console.warn('OAuth callback: no refresh_token returned for profile', profileId);
      return res.redirect(`${clientUrl}/dashboard?calendar=error&reason=no_refresh_token`);
    }

    const { error } = await supabase
      .from('mentor_profiles')
      .update({
        calendar_connected: true,
        google_refresh_token: tokens.refresh_token,
      })
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
