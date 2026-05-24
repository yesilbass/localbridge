import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { getCalendlyEventTypeSummary } from '../../api/calendly';
import {
  availabilityToneStyle,
  formatAvailabilityLead,
  formatNextAvailableSlot,
  getAvailabilityDateParts,
  getNextAvailability,
} from '../../utils/mentorDisplay';
import { StarRating } from '../Mentors/MentorCard';

function formatSessionPrice(subscriberReady) {
  if (subscriberReady) return { value: 'Included', accent: 'var(--color-success)' };
  return { value: 'Plus / Pro', accent: 'var(--bridge-text-secondary)' };
}

function StatCell({ value, label, valueStyle }) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <p
        className="font-display text-[1.85rem] font-black leading-none tabular-nums tracking-tight sm:text-[2rem]"
        style={valueStyle}
      >
        {value}
      </p>
      <p
        className="mt-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:text-[13px]"
        style={{ color: 'var(--bridge-text-muted)' }}
      >
        {label}
      </p>
    </div>
  );
}

export default function MentorBookingSnapshot({ mentor, subscriberReady }) {
  const [nextSlot, setNextSlot] = useState(undefined);
  const [durationMin, setDurationMin] = useState(null);
  const [calendarMeta, setCalendarMeta] = useState({ calendarSyncFailed: false, totalOpenSlots: 0 });

  const calendlyReady = Boolean(mentor?.calendly_connected && mentor?.calendly_event_type_uri);
  const accepting = mentor?.available !== false;

  useEffect(() => {
    if (!mentor?.id || !calendlyReady) {
      setNextSlot(null);
      setDurationMin(null);
      setCalendarMeta({ calendarSyncFailed: false, totalOpenSlots: 0 });
      return;
    }

    let cancelled = false;
    setNextSlot(undefined);
    setCalendarMeta({ calendarSyncFailed: false, totalOpenSlots: 0 });

    void getCalendlyEventTypeSummary(mentor.id).then((res) => {
      if (cancelled) return;
      if (!res.ok || !res.ready) {
        setNextSlot(null);
        setDurationMin(null);
        setCalendarMeta({
          calendarSyncFailed: true,
          totalOpenSlots: 0,
        });
        return;
      }
      setNextSlot(res.next_available ?? null);
      setDurationMin(res.duration ?? null);
      setCalendarMeta({
        calendarSyncFailed: Boolean(res.calendar_sync_failed),
        totalOpenSlots: res.total_open_slots ?? 0,
      });
    });

    return () => { cancelled = true; };
  }, [mentor?.id, calendlyReady]);

  const price = formatSessionPrice(subscriberReady);
  const responseLabel = mentor?.responseTime?.trim() || null;
  const hasRating = (mentor?.rating ?? 0) > 0;
  const hasSocialProof = hasRating || (mentor?.reviewCount ?? 0) > 0 || (mentor?.totalSessions ?? 0) > 0;

  const hasContent = accepting && (price || calendlyReady || hasSocialProof || responseLabel);
  if (!hasContent) return null;

  const availability = getNextAvailability(mentor, nextSlot, calendarMeta);
  const availStyle = availabilityToneStyle(availability.tone);
  const dateParts = typeof nextSlot === 'string' ? getAvailabilityDateParts(nextSlot) : null;
  const lead = dateParts ? formatAvailabilityLead(nextSlot) : null;

  const socialLine = [
    mentor.reviewCount > 0 ? `${mentor.reviewCount} review${mentor.reviewCount === 1 ? '' : 's'}` : null,
    mentor.totalSessions > 0 ? `${mentor.totalSessions} session${mentor.totalSessions === 1 ? '' : 's'}` : null,
  ].filter(Boolean).join(' · ');

  const panelBg = 'color-mix(in srgb, var(--bridge-surface) 55%, transparent)';

  return (
    <div className="mt-8">
      {responseLabel && (
        <p
          className="mb-3 flex items-center gap-2 text-base"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          <Zap className="h-4 w-4 shrink-0" style={{ color: 'var(--color-success)' }} aria-hidden />
          <span>{responseLabel}</span>
        </p>
      )}

      <div
        className="rounded-[1.35rem] p-6 sm:p-7"
        style={{ backgroundColor: panelBg }}
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          <StatCell value={price.value} label="With subscription" valueStyle={{ color: price.accent }} />

          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            {durationMin ? (
              <span
                className="inline-flex rounded-full px-4 py-2 text-base font-black tabular-nums"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))',
                  color: 'var(--color-primary)',
                }}
              >
                {durationMin} min
              </span>
            ) : (
              <p
                className={`text-base font-semibold ${nextSlot === undefined && calendlyReady ? 'animate-pulse' : ''}`}
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                {nextSlot === undefined && calendlyReady ? 'Syncing…' : '30–45 min'}
              </p>
            )}
            <p
              className="mt-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:text-[13px]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              Session length
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            {hasRating ? (
              <StarRating rating={mentor.rating} size="lg" />
            ) : (
              <p className="font-display text-xl font-black" style={{ color: 'var(--bridge-text)' }}>New</p>
            )}
            {socialLine ? (
              <p className="mt-2.5 text-sm font-medium sm:text-base" style={{ color: 'var(--bridge-text-muted)' }}>
                {socialLine}
              </p>
            ) : (
              <p
                className="mt-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:text-[13px]"
                style={{ color: 'var(--bridge-text-muted)' }}
              >
                On Bridge
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-start gap-4">
          {dateParts && (
            <div
              className="flex shrink-0 flex-col items-center rounded-xl px-3 py-2 text-center leading-none"
              style={{ backgroundColor: availStyle.bg }}
            >
              <span className="text-[10px] font-bold tracking-wide" style={{ color: availStyle.color }}>
                {dateParts.dow}
              </span>
              <span className="mt-1 text-2xl font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>
                {dateParts.day}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
                {dateParts.mon}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-bold sm:text-[17px]" style={{ color: 'var(--bridge-text)' }}>
                {availability.headline}
              </p>
              {lead && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold capitalize sm:text-[13px]"
                  style={{
                    background: 'color-mix(in srgb, var(--bridge-surface-muted) 80%, transparent)',
                    color: 'var(--bridge-text-secondary)',
                  }}
                >
                  {lead}
                </span>
              )}
            </div>
            <p
              className={`mt-1.5 text-base leading-snug sm:text-[17px] ${availability.loading ? 'animate-pulse' : ''}`}
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              {dateParts ? formatNextAvailableSlot(nextSlot) : availability.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
