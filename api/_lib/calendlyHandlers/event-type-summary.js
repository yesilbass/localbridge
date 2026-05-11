import { z } from 'zod';
import supabase from '../supabase.js';
import { applyCors } from '../allowedOrigins.js';
import { jsonError } from '../security.js';
import {
  getValidAccessToken,
  getEventType,
  getAvailableTimes,
} from '../calendly.js';

const QUERY = z.object({ mentor_profile_id: z.string().uuid() });

export default async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');

  const parsed = QUERY.safeParse(req.query ?? {});
  if (!parsed.success) return jsonError(res, 400, 'mentor_profile_id is required');
  const { mentor_profile_id } = parsed.data;

  const { data: profile, error } = await supabase
    .from('mentor_profiles')
    .select('id, calendly_connected, calendly_event_type_uri, calendly_scheduling_url')
    .eq('id', mentor_profile_id)
    .maybeSingle();
  if (error || !profile) return jsonError(res, 404, 'Mentor not found');

  if (!profile.calendly_connected || !profile.calendly_event_type_uri) {
    return res.json({ ready: false });
  }

  try {
    const accessToken = await getValidAccessToken(mentor_profile_id);
    const eventType = await getEventType(accessToken, profile.calendly_event_type_uri);

    const start = new Date();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const times = await getAvailableTimes(
      accessToken,
      profile.calendly_event_type_uri,
      start.toISOString(),
      end.toISOString(),
    );

    const next = times.find((t) => t.status === 'available' || !t.status);
    return res.json({
      ready: true,
      duration: eventType?.duration ?? null,
      name: eventType?.name ?? null,
      scheduling_url: profile.calendly_scheduling_url,
      next_available: next?.start_time ?? null,
      total_open_slots: times.length,
    });
  } catch (err) {
    console.error('[calendly-event-type-summary] failed', { message: err?.message, status: err?.status });
    return res.json({ ready: true, scheduling_url: profile.calendly_scheduling_url, next_available: null, total_open_slots: 0 });
  }
}
