import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import { SESSION_TYPES } from '../../constants/sessionTypes';
import { addRecentlyViewedMentor } from '../../utils/recentlyViewed';
import {
  buildAvailabilityCalendar,
  getSlotsForDate,
  normalizeAvailabilitySchedule,
  localDateStr,
} from '../../utils/mentorAvailability';
import { getMentorById } from '../../api/mentors';
import { getReviewsForMentor } from '../../api/reviews';
import { getMentorAvailability } from '../../api/calendar';
import { createBookingCheckout, finalizeCheckout } from '../../api/stripe';
import EmbeddedCheckoutPanel from '../../components/EmbeddedCheckoutPanel';
import { AuroraBg, KineticNumber } from '../dashboard/dashboardCinematic.jsx';
import supabase from '../../api/supabase';
import { focusRing } from '../../ui';

import {
  useFavoriteMentor,
  useShareLink,
  useNextAvailableSlots,
  normalizeMentor,
  useProfileReducedMotion,
} from './profileHooks';
import IdentityHero from './IdentityHero';
import AtAGlance from './AtAGlance';
import OutcomeReel from './OutcomeReel';
import SessionPreview from './SessionPreview';
import TrackRecord from './TrackRecord';
import ReviewsBlock from './ReviewsBlock';
import ComparableMentors from './ComparableMentors';
import BookingWidget from './BookingWidget';
import BookingDrawer from './BookingDrawer';

// ─── Session type icon ──────────────────────────────────────────────

function SessionTypeIcon({ typeKey, className = 'h-5 w-5' }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, viewBox: '0 0 24 24', 'aria-hidden': true };
  switch (typeKey) {
    case 'career_advice':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-3 5-5 3 3-5 5-3Z" /></svg>;
    case 'interview_prep':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>;
    case 'resume_review':
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M8 13h8M8 17h5" /></svg>;
    case 'networking':
      return <svg {...common}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M14 20v-1a5 5 0 0 1 5-5h0a3 3 0 0 1 3 3v3" /></svg>;
    default:
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function toNewYorkUtcIso(dateStr, timeStr) {
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const [hr, mn] = timeStr.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(yr, mo - 1, dy, hr, mn, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(utcGuess);
  const nyH = parseInt(parts.find((p) => p.type === 'hour').value) % 24;
  const nyM = parseInt(parts.find((p) => p.type === 'minute').value);
  const diffMs = ((hr * 60 + mn) - (nyH * 60 + nyM)) * 60_000;
  return new Date(utcGuess.getTime() + diffMs).toISOString();
}

// ─── BookingFlow (existing inline flow) ────────────────────────────

function BookingFlow({ mentor, sessionType, onReset, onRequestConfirm, user, navigate, mentorId, preselectedDate }) {
  const [pickedDate, setPickedDate] = useState(preselectedDate ?? null);
  const [pickedTime, setPickedTime] = useState(null);
  const [calBusy, setCalBusy] = useState(null);
  const [calLoading, setCalLoading] = useState(false);

  const scheduleNorm = useMemo(() => normalizeAvailabilitySchedule(mentor.availability_schedule), [mentor.availability_schedule]);
  const acceptingBookings = mentor.available !== false;
  const availability = useMemo(() => buildAvailabilityCalendar(scheduleNorm, acceptingBookings, 14), [scheduleNorm, acceptingBookings]);
  const baseSlots = useMemo(() => getSlotsForDate(scheduleNorm, pickedDate, acceptingBookings), [scheduleNorm, pickedDate, acceptingBookings]);

  const slots = useMemo(() => {
    const now = new Date();
    return baseSlots.map(({ time, available }) => {
      if (!available) return { time, available: false };
      if (pickedDate) {
        const [h, m] = time.split(':').map(Number);
        const slotDate = new Date(pickedDate);
        slotDate.setHours(h, m, 0, 0);
        if (slotDate <= now) return { time, available: false };
      }
      if (calBusy?.length > 0 && pickedDate) {
        const [h, m] = time.split(':').map(Number);
        const slotStart = new Date(pickedDate); slotStart.setHours(h, m, 0, 0);
        const slotEnd = new Date(pickedDate); slotEnd.setHours(h + 1, m, 0, 0);
        const blocked = calBusy.some(({ start, end }) => slotStart < new Date(end) && slotEnd > new Date(start));
        if (blocked) return { time, available: false, calendarBusy: true };
      }
      return { time, available: true };
    });
  }, [baseSlots, calBusy, pickedDate]);

  const hasAnyWeeklySlots = useMemo(() => Object.values(scheduleNorm.weekly).some((a) => Array.isArray(a) && a.length > 0), [scheduleNorm]);

  useEffect(() => { setPickedTime(null); }, [pickedDate]);

  useEffect(() => {
    if (!pickedDate || !mentor.calendar_connected) { setCalBusy(null); return; }
    setCalLoading(true); setCalBusy(null);
    getMentorAvailability(mentor.id, localDateStr(pickedDate))
      .then(({ busy, notConnected }) => {
        setCalBusy(notConnected ? null : (busy ?? []));
        setCalLoading(false);
      })
      .catch(() => { setCalBusy(null); setCalLoading(false); });
  }, [pickedDate, mentor.calendar_connected, mentor.id]);

  const canBook = Boolean(sessionType && pickedDate && pickedTime);

  function handleBookClick() {
    if (!canBook) return;
    if (!user) { navigate('/login', { state: { from: `/mentors/${mentorId}` } }); return; }
    const iso = toNewYorkUtcIso(localDateStr(pickedDate), pickedTime);
    onRequestConfirm({ sessionType, isoDate: iso, prettyDate: pickedDate, prettyTime: pickedTime });
  }

  const focusRingWhite = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem]"
      style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', backgroundColor: 'var(--bridge-surface)' }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
      <div className="grid gap-0 lg:grid-cols-12">
        {/* Left: session summary */}
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 p-7 text-amber-50 lg:col-span-4 lg:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-orange-500/22 blur-3xl" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-orange-300">Your session</p>
          <div className="relative mt-4 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-900">
              <SessionTypeIcon typeKey={sessionType.key} />
            </span>
            <div>
              <p className="font-display text-xl font-black tracking-tight text-white">{sessionType.name}</p>
              <p className="text-sm text-orange-200/85">{sessionType.duration} · with {mentor.name?.split(' ')[0]}</p>
            </div>
          </div>
          {mentor.session_rate ? (
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/12 to-orange-400/6 p-4">
              <p className="relative text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Total</p>
              <p className="relative mt-1 font-display text-[2.4rem] font-black tabular-nums text-white leading-none">
                $<KineticNumber to={Number(mentor.session_rate)} ms={900} />
              </p>
            </div>
          ) : null}
          <div className="relative mt-5 border-t border-white/10 pt-4 text-sm">
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">Date</dt>
                <dd className={`text-right font-bold ${pickedDate ? 'text-white' : 'text-stone-500'}`}>
                  {pickedDate ? pickedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Pick a day →'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">Time</dt>
                <dd className={`text-right font-bold ${pickedTime ? 'text-white' : 'text-stone-500'}`}>{pickedTime ?? 'Pick a time →'}</dd>
              </div>
            </dl>
          </div>
          <button type="button" onClick={handleBookClick} disabled={!canBook}
            className={`mt-6 relative w-full rounded-2xl px-6 py-4 text-sm font-black tracking-wide transition-all duration-300 ${canBook ? `bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 shadow-[0_12px_32px_-6px_color-mix(in srgb, var(--color-primary) 55%, transparent)] hover:-translate-y-0.5 ${focusRing}` : 'cursor-not-allowed bg-white/10 text-stone-500'}`}>
            {canBook ? (mentor.session_rate ? 'Continue to payment →' : 'Book session →') : 'Pick a date & time'}
          </button>
          <button type="button" onClick={onReset}
            className={`relative mt-3 w-full rounded-lg py-2 text-center text-xs font-bold text-stone-400 transition hover:text-stone-200 ${focusRingWhite}`}>
            Change format
          </button>
        </div>

        {/* Right: date + time picker */}
        <div className="relative p-7 lg:col-span-8 lg:p-8">
          <div className="relative mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">Step 2 of 2</p>
            <h3 className="mt-1.5 font-display font-black tracking-[-0.02em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.85rem)', lineHeight: '1.05' }}>
              When works for you?
            </h3>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)] mb-3">Next 14 days</p>

          {!acceptingBookings ? (
            <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
              This mentor is not accepting new session requests right now.
            </div>
          ) : !hasAnyWeeklySlots ? (
            <div className="mb-4 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm text-[var(--bridge-text-secondary)]">
              This mentor has not published open hours yet. Check back later.
            </div>
          ) : null}

          <div className="mb-3 flex items-center gap-3 text-[11px] text-[var(--bridge-text-muted)]">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Open</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Limited</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--bridge-border-strong)]" /> Booked</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {availability.map(({ date, status }) => {
              const iso = localDateStr(date);
              const isSelected = pickedDate ? localDateStr(pickedDate) === iso : false;
              const isClickable = status !== 'booked';
              const base = 'flex aspect-square flex-col items-center justify-center rounded-lg border p-1 text-xs font-semibold transition';
              let tone;
              if (isSelected) tone = 'border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 shadow-md ring-2 ring-orange-400 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-200';
              else if (status === 'free') tone = 'border-emerald-300/70 bg-emerald-50/80 text-emerald-900 hover:border-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
              else if (status === 'limited') tone = 'border-amber-300/70 bg-amber-50/80 text-amber-900 hover:border-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
              else tone = 'border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-faint)] cursor-not-allowed';
              return (
                <button key={iso} type="button" disabled={!isClickable} onClick={() => setPickedDate(date)}
                  aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} — ${status}`}
                  aria-pressed={isSelected} className={`${base} ${tone} ${focusRing}`}>
                  <span className="text-[9px] font-medium opacity-70">{date.toLocaleDateString(undefined, { weekday: 'short' })[0]}</span>
                  <span className="text-sm font-bold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>

          {mentor.calendar_connected && pickedDate && (
            <div className="mt-3 text-xs">
              {calLoading ? <span className="text-[var(--bridge-text-muted)]">Checking calendar…</span>
                : calBusy !== null
                  ? calBusy.length === 0
                    ? <span className="font-medium text-emerald-600 dark:text-emerald-400">All day available</span>
                    : <span className="text-amber-700 dark:text-amber-300">Busy: {calBusy.map(b => `${fmtTime(b.start)}–${fmtTime(b.end)}`).join(', ')}</span>
                  : null}
            </div>
          )}

          <div className={`mt-6 overflow-hidden transition-all duration-300 ${pickedDate ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Available times</p>
                {pickedDate && <p className="text-xs font-medium text-[var(--bridge-text-secondary)]">{pickedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(({ time, available, calendarBusy }) => {
                  const isSelected = pickedTime === time;
                  return (
                    <button key={time} type="button" disabled={!available} onClick={() => setPickedTime(time)}
                      aria-pressed={isSelected} title={calendarBusy ? 'Blocked by calendar' : undefined}
                      className={`relative rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                        isSelected ? `border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 shadow-sm ring-2 ring-orange-400 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-200 ${focusRing}`
                          : available ? `border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text)] hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 ${focusRing}`
                            : calendarBusy ? 'cursor-not-allowed border-amber-200/60 bg-amber-50/60 text-amber-400 dark:border-amber-400/20 dark:bg-amber-500/10'
                              : 'cursor-not-allowed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-faint)]'
                      }`}>
                      {time}
                    </button>
                  );
                })}
              </div>
              {slots.every((s) => !s.available) && <p className="mt-3 text-xs text-[var(--bridge-text-muted)]">No open slots this day — try another date.</p>}
            </div>
          </div>
          {!pickedDate && <p className="mt-4 text-xs text-[var(--bridge-text-muted)]">Pick a day above to see available times.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── ConfirmModal ──────────────────────────────────────────────────

function ConfirmModal({ mentor, user, confirmation, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [handleClose]);

  async function handleConfirm() {
    setSubmitting(true); setResult(null);
    try {
      const res = await createBookingCheckout({
        userId: user?.id, userEmail: user?.email,
        menteeName: user?.user_metadata?.full_name ?? user?.email ?? 'Mentee',
        mentorId: mentor.id, mentorName: mentor.name,
        sessionTypeName: confirmation.sessionType.name,
        sessionTypeKey: confirmation.sessionType.key,
        scheduledDate: confirmation.isoDate,
        sessionPrice: mentor.session_rate ?? 25,
        message,
      });
      if (!res.ok) { setResult({ ok: false, message: res.error || 'Could not start booking checkout.' }); return; }
      setCheckoutClientSecret(res.clientSecret);
    } catch {
      setResult({ ok: false, message: 'Could not connect to payment server.' });
    } finally { setSubmitting(false); }
  }

  const mentorFirst = mentor.name?.split(/\s+/)[0] ?? 'your mentor';
  const prettyDate = confirmation.prettyDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <EmbeddedCheckoutPanel clientSecret={checkoutClientSecret} onClose={() => setCheckoutClientSecret(null)} />
      <button type="button" className="absolute inset-0 bg-stone-950/72 backdrop-blur-md" aria-label="Close" onClick={handleClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">
        {result?.ok ? (
          <div className="relative flex flex-col items-center px-8 py-14 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 text-4xl text-white shadow-[0_18px_44px_-8px_rgba(16,185,129,0.55)] ring-2 ring-white/25">✓</div>
            <h2 id="confirm-modal-title" className="relative font-display text-3xl font-black tracking-[-0.025em] text-[var(--bridge-text)]">Request sent</h2>
            <p className="relative mx-auto mt-3 max-w-sm leading-relaxed text-[var(--bridge-text-secondary)]">{mentorFirst} will confirm or suggest another time. We'll email you as soon as they do.</p>
            <button type="button" onClick={handleClose} className={`relative mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-10 py-3 text-sm font-black text-white shadow-[0_8px_28px_-6px_color-mix(in srgb, var(--color-primary) 65%, transparent)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 ${focusRing}`}>Done</button>
          </div>
        ) : (
          <>
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 px-6 pb-6 pt-6 sm:px-7">
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-amber-500/22 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/95">Confirm & pay</p>
                  <h2 id="confirm-modal-title" className="mt-1.5 font-display text-2xl font-black tracking-[-0.025em] text-white sm:text-[1.7rem]">
                    Ready to book?
                  </h2>
                </div>
                <button type="button" onClick={handleClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20" aria-label="Close">×</button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-5 px-6 py-5 sm:px-7">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4">
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3"><dt className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Mentor</dt><dd className="text-right font-bold text-[var(--bridge-text)]">{mentor.name}</dd></div>
                    <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border)] pt-3"><dt className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Format</dt><dd className="text-right font-bold text-[var(--bridge-text)]">{confirmation.sessionType.name}</dd></div>
                    <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border)] pt-3"><dt className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Date</dt><dd className="text-right font-bold text-[var(--bridge-text)]">{prettyDate}</dd></div>
                    <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border)] pt-3"><dt className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Time</dt><dd className="text-right font-bold text-[var(--bridge-text)]">{confirmation.prettyTime}</dd></div>
                    {mentor.session_rate ? (
                      <div className="flex items-end justify-between gap-3 border-t border-[var(--bridge-border)] pt-3">
                        <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">Total</dt>
                        <dd className="font-display text-2xl font-black tabular-nums text-[var(--bridge-text)]">${mentor.session_rate}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                <div>
                  <label htmlFor="booking-note" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                    Add context <span className="font-normal normal-case text-[var(--bridge-text-faint)]">(optional)</span>
                  </label>
                  <textarea id="booking-note" value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                    placeholder="What do you want to get out of this hour?"
                    className="w-full resize-none rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-2.5 text-sm text-[var(--bridge-text)] transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25" />
                </div>
                {result && !result.ok && <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">{result.message}</p>}
              </div>
            </div>
            <footer className="shrink-0 border-t border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-6 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button type="button" onClick={handleClose} disabled={submitting}
                  className={`rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-sm font-bold text-[var(--bridge-text)] transition-all hover:-translate-y-0.5 disabled:opacity-60 ${focusRing}`}>
                  Cancel
                </button>
                <button type="button" onClick={handleConfirm} disabled={submitting}
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-2.5 text-sm font-black text-white shadow-[0_8px_24px_-6px_color-mix(in srgb, var(--color-primary) 65%, transparent)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 disabled:opacity-60 ${focusRing}`}>
                  {submitting ? 'Opening checkout…' : `Pay $${mentor.session_rate ?? 25} & request`}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <AuroraBg />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-6">
        <div className="h-4 w-28 bridge-skeleton rounded-full mb-8" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="aspect-[4/5] bridge-skeleton rounded-2xl max-w-[260px]" />
          <div className="space-y-4">
            <div className="h-3 w-40 bridge-skeleton rounded" />
            <div className="h-14 w-80 bridge-skeleton rounded-xl" />
            <div className="h-5 w-52 bridge-skeleton rounded" />
            <div className="h-5 w-60 bridge-skeleton rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────

export default function MentorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const flat = useProfileReducedMotion();
  const bookingRef = useRef(null);

  const [rawMentor, setRawMentor] = useState(null);
  const [rawReviews, setRawReviews] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load mentor + reviews
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setLoadError(null);
    Promise.all([getMentorById(id), getReviewsForMentor(id)]).then(([mentorRes, reviewsRes]) => {
      if (cancelled) return;
      if (mentorRes.error || !mentorRes.data?.mentor) {
        setRawMentor(null);
        setLoadError(mentorRes.error?.message ?? 'Could not load mentor.');
      } else {
        setRawMentor(mentorRes.data.mentor);
        setRawReviews(reviewsRes.error ? [] : (reviewsRes.data ?? []));
        addRecentlyViewedMentor(mentorRes.data.mentor);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  // Realtime availability sync
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`mentor-profile-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mentor_profiles', filter: `id=eq.${id}` }, (payload) => {
        if (!payload.new) return;
        setRawMentor((prev) => prev ? { ...prev, availability_schedule: payload.new.availability_schedule, available: payload.new.available } : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Stripe finalization
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      const result = await finalizeCheckout(sessionId);
      if (cancelled) return;
      if (!result.ok) {
        setCheckoutError(result.error || 'Could not verify booking payment.');
      } else {
        setPendingConfirm(null); setSelectedType(null);
        if (result.data?.bridge_session_id) { navigate(`/intake/${result.data.bridge_session_id}`); return; }
        setCheckoutNotice('Booking payment successful. Your session request is in your dashboard.');
      }
      const next = new URLSearchParams(searchParams);
      next.delete('session_id');
      setSearchParams(next, { replace: true });
    })();
    return () => { cancelled = true; };
  }, [searchParams, setSearchParams]);

  // Normalize data
  const mentor = useMemo(() => normalizeMentor(rawMentor, rawReviews), [rawMentor, rawReviews]);
  const slots = useNextAvailableSlots(rawMentor, 4);

  // Favorites + share
  const { isFavorited, toggle: onToggleFavorite } = useFavoriteMentor(id);
  const { share: onShare, copied: shareCopied } = useShareLink();

  // Auth + role guards
  const viewerIsMentor = user ? isMentorAccount(user) : false;
  const isOwnMentorProfile = Boolean(user && rawMentor?.user_id && rawMentor.user_id === user.id);
  const bookingDisabledForMentor = viewerIsMentor && !isOwnMentorProfile;
  const canBook = !isOwnMentorProfile && !bookingDisabledForMentor;

  // Document title
  useEffect(() => {
    if (mentor) {
      document.title = `${mentor.name} — ${mentor.title ?? 'Mentor'} · Bridge`;
    }
    return () => { document.title = 'Bridge'; };
  }, [mentor]);

  function handleBookSlot(slot) {
    if (!user) {
      const redirect = encodeURIComponent(`/mentors/${id}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setDrawerOpen(false);
  }

  // ── States ─────────────────────────────────────────────────────────

  if (loading) return <ProfileSkeleton />;

  if (loadError || !rawMentor) {
    return (
      <main className="relative min-h-screen px-4 py-16 sm:px-6" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        <AuroraBg />
        <div className="relative mx-auto max-w-lg rounded-[2rem] border p-14 text-center"
          style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
          <p className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
            {loadError ? "Couldn't load this profile" : "This mentor isn't here"}
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            {loadError ?? 'The link may be outdated or the profile was removed.'}
          </p>
          <Link to="/mentors" className={`mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-7 py-3 text-sm font-black text-white shadow-[0_8px_28px_-6px_color-mix(in srgb, var(--color-primary) 65%, transparent)] transition-all hover:-translate-y-0.5 ${focusRing}`}>
            Browse all mentors
          </Link>
        </div>
      </main>
    );
  }

  const recentBookings = mentor.totalSessions ?? 0;

  return (
    <main
      role="main"
      className="relative isolate min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <AuroraBg />

      {/* Checkout notices */}
      {(checkoutError || checkoutNotice) && (
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-4">
          {checkoutError && <p className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">{checkoutError}</p>}
          {checkoutNotice && <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">{checkoutNotice}</p>}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pb-32">

        {/* Desktop 2-col grid */}
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12">

          {/* ── LEFT COLUMN ── */}
          <div>
            <IdentityHero
              mentor={mentor}
              isFavorited={isFavorited}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
              shareCopied={shareCopied}
              flat={flat}
            />

            <AtAGlance mentor={mentor} />

            {/* Mobile-only inline BookingWidget */}
            <div className="mt-8 lg:hidden">
              <BookingWidget
                mentor={mentor}
                slots={slots}
                isLoading={loading}
                recentBookings={recentBookings}
                isFavorited={isFavorited}
                onToggleFavorite={onToggleFavorite}
                onShare={onShare}
                shareCopied={shareCopied}
                mode="inline"
                compact
                onBook={handleBookSlot}
              />
            </div>

            <OutcomeReel mentor={mentor} />
            <SessionPreview mentor={mentor} />
            <TrackRecord mentor={mentor} />

            {/* Booking section (inline flow) */}
            {canBook && (
              <div ref={bookingRef} className="mt-16 scroll-mt-28">
                {!selectedType ? (
                  <div
                    className="relative overflow-hidden rounded-[1.75rem]"
                    style={{ backgroundColor: 'var(--bridge-hero-bg, #1c1917)', boxShadow: '0 8px 48px -8px rgba(0,0,0,0.4)', outline: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50"
                      style={{ backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                    <div className="relative p-7 sm:p-10">
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-300">Book a session</p>
                      <h2 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">What kind of hour do you want?</h2>
                      <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {SESSION_TYPES.map((type) => (
                          <button key={type.key} type="button" onClick={() => setSelectedType(type)}
                            className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition duration-300 hover:border-orange-400/55 hover:bg-white/[0.08] ${focusRing}`}
                            style={{ outlineOffset: '2px' }}>
                            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-amber-200 transition duration-300 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-400 group-hover:text-stone-900">
                              <SessionTypeIcon typeKey={type.key} className="h-6 w-6" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white">{type.name}</p>
                              <p className="text-xs text-stone-400">{type.duration}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {!user && (
                        <p className="mt-5 text-xs text-stone-500">
                          <Link to="/login" state={{ from: `/mentors/${id}` }} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">Log in</Link> to book — you can still browse without an account.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <BookingFlow
                    mentor={rawMentor}
                    sessionType={selectedType}
                    onReset={() => setSelectedType(null)}
                    onRequestConfirm={(payload) => setPendingConfirm(payload)}
                    user={user}
                    navigate={navigate}
                    mentorId={id}
                  />
                )}
              </div>
            )}

            {isOwnMentorProfile && (
              <div className="mt-16 relative overflow-hidden rounded-[1.75rem] border p-7 sm:p-9"
                style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">Your public profile</p>
                <h2 className="mt-2 font-display font-black tracking-[-0.025em]" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)', lineHeight: '1.05', color: 'var(--bridge-text)' }}>
                  This is what mentees see before they book
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                  Session requests and your availability are managed from your dashboard.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/dashboard" className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-[0_8px_28px_-6px_color-mix(in srgb, var(--color-primary) 65%, transparent)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 ${focusRing}`}>
                    Open mentor dashboard
                  </Link>
                </div>
              </div>
            )}

            <ReviewsBlock mentor={mentor} />

            <ComparableMentors mentor={mentor} />
          </div>

          {/* ── RIGHT COLUMN (desktop sticky) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-[88px] max-h-[calc(100vh-88px-24px)] overflow-y-auto">
              <BookingWidget
                mentor={mentor}
                slots={slots}
                isLoading={loading}
                recentBookings={recentBookings}
                isFavorited={isFavorited}
                onToggleFavorite={onToggleFavorite}
                onShare={onShare}
                shareCopied={shareCopied}
                mode="sticky"
                onBook={handleBookSlot}
                onOpenDrawer={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      {canBook && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-5 py-3"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            borderTop: '1px solid var(--bridge-border)',
          }}
          aria-label="Booking summary"
        >
          <div>
            <p className="font-black tabular-nums" style={{ fontSize: '20px', color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>
              {mentor.rate != null ? `$${mentor.rate}` : 'Free'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--bridge-text-muted)' }}>/session</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`py-2 px-5 rounded-lg font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
            style={{
              fontSize: '14px',
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
          >
            Book a session
          </button>
        </div>
      )}

      {/* Mobile booking drawer */}
      <BookingDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <BookingWidget
          mentor={mentor}
          slots={slots}
          isLoading={loading}
          recentBookings={recentBookings}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          onShare={onShare}
          shareCopied={shareCopied}
          mode="drawer"
          onBook={handleBookSlot}
        />
      </BookingDrawer>

      {/* Confirm modal */}
      {pendingConfirm && (
        <ConfirmModal
          mentor={rawMentor}
          user={user}
          confirmation={pendingConfirm}
          onClose={() => setPendingConfirm(null)}
        />
      )}
    </main>
  );
}
