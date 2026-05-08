import { google } from 'googleapis';
import supabase from './supabase.js';

const SAFE_REDIRECT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'bridge-eight-lemon.vercel.app',
  'bridge-git-main-muazsads-projects.vercel.app',
]);

function configuredHost(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

export function getGoogleRedirectUri() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const host = configuredHost(redirectUri);
  const clientHost = configuredHost(process.env.CLIENT_URL);
  const prodHost = configuredHost(process.env.CLIENT_URL_PROD);
  const vercelHost = process.env.VERCEL_URL || null;
  const allowedHosts = new Set([clientHost, prodHost, vercelHost, ...SAFE_REDIRECT_HOSTS].filter(Boolean));

  if (!redirectUri || !host || !allowedHosts.has(host)) {
    throw new Error('Google redirect URI is not allowlisted');
  }
  return redirectUri;
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri()
  );
}

export function buildAuthedClient(refreshToken, mentorProfileId) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await supabase
        .from('mentor_profiles')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('id', mentorProfileId);
    }
  });
  return oauth2Client;
}
