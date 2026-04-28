import { google } from 'googleapis';
import supabase from './_lib/supabase.js';
import { buildAuthedClient } from './_lib/oauth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mentor_profile_id, date } = req.body;

  if (!mentor_profile_id || !date) {
    return res.status(400).json({ error: 'mentor_profile_id and date are required' });
  }

  const { data: profile, error } = await supabase
    .from('mentor_profiles')
    .select('google_refresh_token')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (error || !profile) {
    return res.status(404).json({ error: 'Mentor profile not found' });
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
    return res.status(500).json({ error: err.message });
  }
}
