import { applyCors } from './_lib/allowedOrigins.js';
import { verifyAuthUser } from './_lib/auth.js';
import { bookCalendarEventForMentor } from './_lib/calendarBook.js';

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const {
    mentor_profile_id,
    mentee_email,
    mentee_name,
    session_type,
    scheduled_date,
    duration_minutes,
  } = req.body ?? {};

  const result = await bookCalendarEventForMentor({
    mentor_profile_id,
    mentee_email,
    mentee_name,
    session_type,
    scheduled_date,
    duration_minutes,
  });

  if (!result.ok) {
    return res.status(result.status || 500).json({ error: result.error });
  }
  return res.json({ google_event_id: result.google_event_id });
}
