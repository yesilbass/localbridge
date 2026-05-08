import { applyCors } from './_lib/allowedOrigins.js';
import { verifyAuthUser } from './_lib/auth.js';
import { bookCalendarEventForMentor } from './_lib/calendarBook.js';
import { jsonError, validateJsonBody } from './_lib/security.js';
import supabase from './_lib/supabase.js';
import { z } from 'zod';

const CALENDAR_BOOK_SCHEMA = z.object({
  mentor_profile_id: z.string().uuid(),
  mentee_email: z.string().email().max(320).optional().or(z.literal('')),
  mentee_name: z.string().max(120).optional().or(z.literal('')),
  session_type: z.enum(['career_advice', 'interview_prep', 'resume_review', 'networking']),
  scheduled_date: z.string().datetime({ offset: true }),
  duration_minutes: z.number().int().positive().max(240).optional(),
});

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, CALENDAR_BOOK_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);

  const {
    mentor_profile_id,
    mentee_email,
    mentee_name,
    session_type,
    scheduled_date,
    duration_minutes,
  } = body.data;

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('id, user_id')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (profileError || !profile) return jsonError(res, 404, 'Mentor profile not found');
  if (profile.user_id !== user.id) return jsonError(res, 403, 'You do not own this mentor profile');

  const result = await bookCalendarEventForMentor({
    mentor_profile_id,
    mentee_email,
    mentee_name,
    session_type,
    scheduled_date,
    duration_minutes,
  });

  if (!result.ok) {
    return jsonError(res, result.status || 500, result.error);
  }
  return res.json({ google_event_id: result.google_event_id });
}
