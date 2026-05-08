import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, ExternalLink, Clock } from 'lucide-react';
import MentorAvailabilityModal from './MentorAvailabilityModal.jsx';
import { useAuth } from '../../context/useAuth.js';
import { getCalendarAuthUrl } from '../../api/calendar';
import {
  BOOKING_TIME_SLOTS,
  WEEKDAY_LABELS,
  normalizeAvailabilitySchedule,
} from '../../utils/mentorAvailability';
import supabase from '../../api/supabase';

function formatTimeLabel(hhmm) {
  const [h] = hhmm.split(':').map(Number);
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function WeeklyGrid({ schedule }) {
  const norm = useMemo(() => normalizeAvailabilitySchedule(schedule), [schedule]);
  const totalActive = Object.values(norm.weekly).reduce((s, arr) => s + arr.length, 0);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Weekly availability
        </h3>
        <span className="text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
          {totalActive} bookable hour{totalActive === 1 ? '' : 's'} per week · {norm.timezone}
        </span>
      </div>

      {totalActive === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
        >
          <p className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            You haven't picked any hours yet.
          </p>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
            Until you do, your profile is hidden from search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[420px] gap-1"
            style={{ gridTemplateColumns: 'auto repeat(7, minmax(0, 1fr))' }}
          >
            <div />
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--bridge-text-muted)' }}
              >
                {label}
              </div>
            ))}

            {BOOKING_TIME_SLOTS.map((time) => (
              <Row key={time} time={time} norm={norm} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ time, norm }) {
  return (
    <>
      <div
        className="pr-2 text-right text-[11px] font-bold tabular-nums"
        style={{ color: 'var(--bridge-text-muted)', alignSelf: 'center' }}
      >
        {formatTimeLabel(time)}
      </div>
      {WEEKDAY_LABELS.map((_, i) => {
        const active = (norm.weekly[String(i)] ?? []).includes(time);
        return (
          <div
            key={i}
            className="rounded-md transition-colors"
            style={{
              height: 26,
              backgroundColor: active
                ? 'color-mix(in srgb, var(--color-primary) 78%, transparent)'
                : 'var(--bridge-surface-muted)',
              boxShadow: active
                ? 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent)'
                : 'inset 0 0 0 1px var(--bridge-border)',
            }}
            title={active ? `${WEEKDAY_LABELS[i]} ${formatTimeLabel(time)} — bookable` : `${WEEKDAY_LABELS[i]} ${formatTimeLabel(time)} — off`}
          />
        );
      })}
    </>
  );
}

function GoogleCalendarCard({ connected, onConnect, busy }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <h3
        className="text-[10px] font-black uppercase tracking-[0.32em]"
        style={{ color: 'var(--color-primary)' }}
      >
        Google Calendar
      </h3>
      <div className="mt-3 flex items-start gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: connected
              ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
              : 'var(--bridge-surface-muted)',
            color: connected ? 'var(--color-success)' : 'var(--bridge-text-muted)',
          }}
        >
          {connected ? <Check className="h-5 w-5" aria-hidden /> : <CalendarIcon className="h-5 w-5" aria-hidden />}
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {connected ? 'Calendar connected' : 'Calendar not connected'}
          </p>
          <p className="mt-0.5 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {connected
              ? "Bridge syncs busy times so mentees can only book when you're actually free."
              : 'Connect Google Calendar to expose real-time busy times to mentees.'}
          </p>
        </div>
        {!connected && (
          <button
            type="button"
            onClick={onConnect}
            disabled={busy}
            className="bridge-focus inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff', opacity: busy ? 0.5 : 1 }}
          >
            {busy ? 'Connecting…' : <>Connect <ExternalLink className="h-3.5 w-3.5" aria-hidden /></>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MentorAvailabilityPanel({ mentorProfileId, calendarConnected, onSaved }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    if (!mentorProfileId) return;
    supabase
      .from('mentor_profiles')
      .select('availability_schedule')
      .eq('id', mentorProfileId)
      .maybeSingle()
      .then(({ data }) => setSchedule(data?.availability_schedule ?? null));
  }, [mentorProfileId, open]);

  async function handleConnect() {
    if (!mentorProfileId) return;
    setBusy(true);
    try {
      const url = await getCalendarAuthUrl(mentorProfileId);
      window.location.href = url;
    } catch (e) {
      console.error('Connect calendar failed:', e);
      setBusy(false);
    }
  }

  if (!mentorProfileId) return null;

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex flex-col items-start justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="max-w-md">
          <p
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Availability
          </p>
          <h2
            className="font-display mt-1 text-[20px] font-black tracking-[-0.02em]"
            style={{ color: 'var(--bridge-text)' }}
          >
            Set the hours you take sessions.
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.5 }}>
            Mentees see exactly these slots on your public profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bridge-focus inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[14px] font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Clock className="h-4 w-4" aria-hidden />
          Update availability
        </button>
      </div>

      <WeeklyGrid schedule={schedule} />
      <GoogleCalendarCard connected={calendarConnected} onConnect={handleConnect} busy={busy} />

      <MentorAvailabilityModal
        open={open}
        onClose={() => setOpen(false)}
        mentorProfileId={mentorProfileId}
        userId={user?.id}
        onSaved={() => { onSaved?.(); setOpen(false); }}
      />
    </div>
  );
}
