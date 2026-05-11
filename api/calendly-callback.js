import supabase from './_lib/supabase.js';
import { getClientUrl } from './_lib/allowedOrigins.js';
import { consumeOAuthState } from './_lib/oauthState.js';
import { applySecurityHeaders } from './_lib/security.js';
import {
  exchangeCode,
  getMe,
  writeCredentials,
  ensureWebhookSubscription,
} from './_lib/calendly.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { code, state: rawState, error: oauthError } = req.query;
  let clientUrl = getClientUrl('');
  let state = { ok: false };
  try {
    state = await consumeOAuthState({ supabase, rawState });
    if (state.ok) clientUrl = getClientUrl(state.origin);
  } catch (err) {
    console.error('[calendly-callback] state verify failed', { message: err?.message });
  }

  if (oauthError || !code || !state.ok) {
    return res.redirect(`${clientUrl}/dashboard/availability?calendly=error`);
  }

  try {
    const tokens = await exchangeCode(String(code));
    const me = await getMe(tokens.access_token);
    const userUri = tokens.user_uri || me?.uri;
    const orgUri = tokens.organization_uri || me?.current_organization;
    if (!userUri) {
      return res.redirect(`${clientUrl}/dashboard/availability?calendly=error&reason=no_user`);
    }

    let webhookSubscriptionUri = null;
    try {
      webhookSubscriptionUri = await ensureWebhookSubscription({
        accessToken: tokens.access_token,
        webhookUrl: `${getPublicOrigin()}/api/calendly-webhook`,
        signingKey: process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
        organizationUri: orgUri,
        userUri,
      });
    } catch (err) {
      console.error('[calendly-callback] webhook subscribe failed', { message: err?.message });
    }

    await writeCredentials(state.profileId, {
      user_uri: userUri,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      organization_uri: orgUri,
      webhook_subscription_uri: webhookSubscriptionUri,
    });

    const { error } = await supabase
      .from('mentor_profiles')
      .update({
        calendly_connected: true,
        calendly_user_uri: userUri,
      })
      .eq('id', state.profileId)
      .eq('user_id', state.userId);

    if (error) {
      console.error('[calendly-callback] profile update failed', { message: error.message });
      return res.redirect(`${clientUrl}/dashboard/availability?calendly=error`);
    }

    return res.redirect(`${clientUrl}/dashboard/availability?calendly=connected`);
  } catch (err) {
    console.error('[calendly-callback] exchange failed', { message: err?.message });
    return res.redirect(`${clientUrl}/dashboard/availability?calendly=error`);
  }
}
