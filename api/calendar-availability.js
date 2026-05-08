import { google } from 'googleapis';
import supabase from './_lib/supabase.js';
import { buildAuthedClient } from './_lib/oauth.js';
import { applyCors } from './_lib/allowedOrigins.js';
import { verifyAuthUser } from './_lib/auth.js';
import { jsonError, validateJsonBody } from './_lib/security.js';
import { z } from 'zod';

const AVAILABILITY_SCHEMA = z.object({
  mentor_profile_id: z.string().uuid(),
  date: z.string().date(),
});

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, AVAILABILITY_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);
  const { mentor_profile_id, date } = body.data;

  const { data: profile, error } = await supabase
    .from('mentor_profiles')
    .select('google_refresh_token')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (error || !profile) {
    return jsonError(res, 404, 'Mentor profile not found');
  }

  if (!profile.google_refresh_token) {
    return res.status(200).json({ busy: null, reason: 'Calendar not connected' });
  }

  try {
    const oauth2Client = buildAuthedClient(profile.google_refresh_token, mentor_profile_id);

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: freeBusy } = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busy = freeBusy.calendars?.primary?.busy ?? [];
    return res.json({ busy });
  } catch (err) {
    console.error('Availability error:', err);
    return jsonError(res, 500, 'Could not fetch calendar availability');
  }
}
