import { google } from 'googleapis';
import supabase from './supabase.js';
import { buildAuthedClient } from './oauth.js';

/**
 * Core Google Calendar booking logic, shared between the public
 * /api/calendar-book endpoint and the post-checkout finalize flow.
 *
 * Returns { ok: true, google_event_id } on success,
 * or { ok: false, status, error } on a structured failure.
 * Caller decides whether to surface the failure or swallow it
 * (finalize-checkout treats calendar booking as best-effort).
 */
export async function bookCalendarEventForMentor({
  mentor_profile_id,
  mentee_email,
  mentee_name,
  session_type,
  scheduled_date,
  duration_minutes = 60,
}) {
  if (!mentor_profile_id || !session_type || !scheduled_date) {
    return {
      ok: false,
      status: 400,
      error: 'mentor_profile_id, session_type, and scheduled_date are required',
    };
  }

  const { data: profile, error } = await supabase
    .from('mentor_profiles')
    .select('google_refresh_token')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (error || !profile) {
    return { ok: false, status: 404, error: 'Mentor profile not found' };
  }

  if (!profile.google_refresh_token) {
    return { ok: false, status: 400, error: 'Calendar not connected for this mentor' };
  }

  try {
    const oauth2Client = buildAuthedClient(profile.google_refresh_token, mentor_profile_id);

    const start = new Date(scheduled_date);
    const end = new Date(start.getTime() + duration_minutes * 60 * 1000);

    const attendees = [];
    if (mentee_email) attendees.push({ email: mentee_email, displayName: mentee_name });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: event } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Bridge Mentorship: ${session_type.replace(/_/g, ' ')}`,
        description: `Bridge mentorship session — ${session_type}. Join on Bridge.`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees,
      },
    });

    return { ok: true, google_event_id: event.id };
  } catch (err) {
    console.error('[calendarBook] Google Calendar insert failed:', err);
    return { ok: false, status: 502, error: 'Could not create calendar event' };
  }
}
