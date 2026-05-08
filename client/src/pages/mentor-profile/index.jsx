import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
import { ArrowLeft, BadgeCheck, Heart, Share } from 'lucide-react';

import {
  useFavoriteMentor,
  useShareLink,
  normalizeMentor,
  useProfileReducedMotion,
  formatJoinedDate,
} from './profileHooks';
import TrackRecord from './TrackRecord';
import ReviewsBlock from './ReviewsBlock';
import ComparableMentors from './ComparableMentors';
import BookingDrawer from './BookingDrawer';

// ─── Constants ───────────────────────────────────────────────────────
const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const ringWhite = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
const DARK_BG = 'linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 50%, black), color-mix(in srgb, var(--color-primary) 22%, black))';

// ─── SessionTypeIcon ──────────────────────────────────────────────────
function SessionTypeIcon({ typeKey, className = 'h-5 w-5' }) {
  const c = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, viewBox: '0 0 24 24', 'aria-hidden': true };
  switch (typeKey) {
    case 'career_advice':  return <svg {...c}><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-3 5-5 3 3-5 5-3Z"/></svg>;
    case 'interview_prep': return <svg {...c}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>;
    case 'resume_review':  return <svg {...c}><path strokeLinecap="round" strokeLinejoin="round" d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M8 13h8M8 17h5"/></svg>;
    case 'networking':     return <svg {...c}><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M14 20v-1a5 5 0 0 1 5-5h0a3 3 0 0 1 3 3v3"/></svg>;
    default:               return <svg {...c}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function toNewYorkUtcIso(dateStr, timeStr) {
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const [hr, mn] = timeStr.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(yr, mo - 1, dy, hr, mn, 0));
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(utcGuess);
  const nyH = parseInt(parts.find((p) => p.type === 'hour').value) % 24;
  const nyM = parseInt(parts.find((p) => p.type === 'minute').value);
  const diffMs = ((hr * 60 + mn) - (nyH * 60 + nyM)) * 60_000;
  return new Date(utcGuess.getTime() + diffMs).toISOString();
}

function computeSlots(baseSlots, calBusy, pickedDate) {
  const now = new Date();
  return baseSlots.map(({ time, available }) => {
    if (!available) return { time, available: false };
    if (pickedDate) {
      const [h, m] = time.split(':').map(Number);
      const slotDate = new Date(pickedDate); slotDate.setHours(h, m, 0, 0);
      if (slotDate <= now) return { time, available: false };
    }
    if (calBusy?.length > 0 && pickedDate) {
      const [h, m] = time.split(':').map(Number);
      const s = new Date(pickedDate); s.setHours(h, m, 0, 0);
      const e = new Date(pickedDate); e.setHours(h + 1, m, 0, 0);
      if (calBusy.some(({ start, end }) => s < new Date(end) && e > new Date(start))) return { time, available: false, calendarBusy: true };
    }
    return { time, available: true };
  });
}

// ─── MentorHero ───────────────────────────────────────────────────────
function MentorHero({ mentor, rawMentor, isFavorited, onToggleFavorite, onShare, shareCopied, onBook, heroCtaRef, flat }) {
  const rate = rawMentor?.session_rate ?? null;
  const joinedLabel = formatJoinedDate(mentor.joinedAt);
  const bio = rawMentor?.bio ?? null;
  const bioExcerpt = bio ? (bio.length > 240 ? bio.slice(0, 237).trimEnd() + '…' : bio) : null;
  const expertise = Array.isArray(rawMentor?.expertise) ? rawMentor.expertise.slice(0, 9) : [];

  return (
    <section aria-labelledby="profile-heading" className="relative overflow-hidden pt-10 pb-20 lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-2/3"
        style={{ background: 'radial-gradient(ellipse 65% 75% at 100% 0%, color-mix(in srgb, var(--color-primary) 9%, transparent), transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Back nav */}
        <nav className="mb-10" aria-label="Back to mentors">
          <Link
            to="/mentors"
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${ring}`}
            style={{ color: 'var(--bridge-text-muted)', outlineColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All mentors
          </Link>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[420px_1fr] lg:gap-20">
          {/* Photo */}
          <div className="relative max-w-[360px] lg:max-w-none">
            <div
              className="aspect-[3/4] overflow-hidden rounded-[2rem]"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: '0 32px 72px -16px rgba(0,0,0,0.22), inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              {mentor.avatarUrl ? (
                <img
                  src={mentor.avatarUrl}
                  alt={`${mentor.name}${mentor.title ? `, ${mentor.title}` : ''}`}
                  width={840}
                  height={1120}
                  loading="eager"
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center" style={{ background: DARK_BG }}>
                  <span className="font-display font-black select-none" style={{ fontSize: '80px', color: 'rgba(255,255,255,0.88)' }}>
                    {(mentor.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Social links */}
            {(rawMentor?.linkedin_url || rawMentor?.website_url) && (
              <div className="mt-4 flex items-center gap-2">
                {rawMentor.linkedin_url && (
                  <a
                    href={rawMentor.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn profile"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${ring}`}
                    style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)', outlineColor: 'var(--color-primary)' }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {rawMentor.website_url && (
                  <a
                    href={rawMentor.website_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Personal website"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${ring}`}
                    style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)', outlineColor: 'var(--color-primary)' }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex flex-col lg:pt-2">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5" style={{ fontSize: '13px', color: 'var(--bridge-text-muted)' }}>
              {mentor.isVerified && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase"
                  style={{ fontSize: '11px', letterSpacing: '0.16em', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Verified
                </span>
              )}
              {joinedLabel && <span>On Bridge since {joinedLabel}</span>}
            </div>

            {/* Name */}
            <h1
              id="profile-heading"
              className="font-display font-black leading-none"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
            >
              {mentor.name}
            </h1>

            {/* Title + Company */}
            {(mentor.title || mentor.company) && (
              <p className="mt-3" style={{ fontSize: 'clamp(16px, 1.4vw, 20px)', color: 'var(--bridge-text-secondary)' }}>
                {[mentor.title, mentor.company].filter(Boolean).join(' · ')}
              </p>
            )}

            {/* Stats row — rating · sessions · years · top companies */}
            <div className="mt-5 flex flex-wrap items-center gap-4" style={{ fontSize: '14px' }}>
              {mentor.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" aria-hidden style={{ fill: '#F59E0B' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>{mentor.rating.toFixed(1)}</span>
                  {mentor.reviewCount > 0 && <span style={{ color: 'var(--bridge-text-muted)' }}>({mentor.reviewCount})</span>}
                </span>
              )}
              {mentor.totalSessions > 0 && (
                <>
                  <span className="h-4 w-px" style={{ background: 'var(--bridge-border)' }} aria-hidden />
                  <span style={{ color: 'var(--bridge-text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--bridge-text)' }}>{mentor.totalSessions}</span> sessions
                  </span>
                </>
              )}
              {mentor.yearsExperience && (
                <>
                  <span className="h-4 w-px" style={{ background: 'var(--bridge-border)' }} aria-hidden />
                  <span style={{ color: 'var(--bridge-text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--bridge-text)' }}>{mentor.yearsExperience}+</span> yrs exp
                  </span>
                </>
              )}
              {mentor.companies?.length > 0 && (
                <>
                  <span className="h-4 w-px" style={{ background: 'var(--bridge-border)' }} aria-hidden />
                  <span className="font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
                    {mentor.companies.slice(0, 2).join(' · ')}
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="my-7" style={{ height: '1px', background: 'var(--bridge-border)' }} />

            {/* Bio excerpt */}
            {bioExcerpt && (
              <p
                className="mb-6 leading-relaxed"
                style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--bridge-text-secondary)', maxWidth: '60ch' }}
              >
                {bioExcerpt}
              </p>
            )}

            {/* Expertise chips */}
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {expertise.map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Prominent price display */}
            {rate != null && (
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display font-black tabular-nums leading-none"
                    style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', letterSpacing: '-0.04em', color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}
                  >
                    ${rate}
                  </span>
                  <span style={{ fontSize: '15px', color: 'var(--bridge-text-muted)', fontWeight: 500 }}>/session</span>
                </div>
                <p className="mt-1" style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}>
                  60 min · Video call · Notes follow-up
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                ref={heroCtaRef}
                type="button"
                onClick={onBook}
                className={`rounded-full px-9 py-4 text-[15px] font-black tracking-wide transition-all ${ring}`}
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  boxShadow: '0 14px 36px -6px color-mix(in srgb, var(--color-primary) 58%, transparent)',
                  outlineColor: 'var(--color-primary)',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 44px -6px color-mix(in srgb, var(--color-primary) 68%, transparent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 14px 36px -6px color-mix(in srgb, var(--color-primary) 58%, transparent)'; }}
              >
                Book a session →
              </button>

              <button
                type="button"
                aria-pressed={isFavorited}
                aria-label={isFavorited ? 'Remove from saved' : 'Save mentor'}
                onClick={onToggleFavorite}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition-all ${ring}`}
                style={{
                  background: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  color: isFavorited ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
                  outlineColor: 'var(--color-primary)',
                }}
              >
                <Heart className="h-4 w-4" style={{ fill: isFavorited ? 'currentColor' : 'none' }} aria-hidden />
                {isFavorited ? 'Saved' : 'Save'}
              </button>

              <button
                type="button"
                onClick={onShare}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition-all ${ring}`}
                style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)', outlineColor: 'var(--color-primary)' }}
              >
                <Share className="h-4 w-4" aria-hidden />
                {shareCopied ? 'Copied' : 'Share'}
              </button>
            </div>

            {/* Social proof */}
            {mentor.totalSessions >= 3 && (
              <div className="mt-5 flex items-center gap-2">
                <span className="bridge-pulse h-2 w-2 rounded-full shrink-0" style={{ background: 'var(--color-primary)', display: 'inline-block' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {mentor.totalSessions} sessions completed on Bridge
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── StickyBar ────────────────────────────────────────────────────────
function StickyBar({ mentor, rawMentor, isFavorited, onToggleFavorite, onBook, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed left-0 right-0 z-40"
          style={{ top: '64px' }}
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              background: 'color-mix(in srgb, var(--bridge-surface) 92%, transparent)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--bridge-border)',
              boxShadow: '0 4px 24px -8px rgba(0,0,0,0.12)',
            }}
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-4">
              <div
                className="h-9 w-9 shrink-0 overflow-hidden rounded-full"
                style={{ background: DARK_BG, boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
              >
                {mentor.avatarUrl
                  ? <img src={mentor.avatarUrl} alt="" className="h-full w-full object-cover object-top" aria-hidden />
                  : (
                    <span className="h-full w-full flex items-center justify-center font-black text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {(mentor.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                    </span>
                  )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold truncate leading-tight" style={{ fontSize: '14px', color: 'var(--bridge-text)' }}>{mentor.name}</p>
                {mentor.title && (
                  <p className="truncate text-xs leading-tight mt-0.5" style={{ color: 'var(--bridge-text-muted)' }}>
                    {mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}
                  </p>
                )}
              </div>

              {rawMentor?.session_rate != null && (
                <span className="hidden sm:block shrink-0 font-black tabular-nums" style={{ fontSize: '17px', color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>
                  ${rawMentor.session_rate}
                  <span className="font-normal text-xs ml-0.5" style={{ color: 'var(--bridge-text-muted)' }}>/session</span>
                </span>
              )}

              <button
                type="button"
                aria-pressed={isFavorited}
                aria-label={isFavorited ? 'Saved' : 'Save mentor'}
                onClick={onToggleFavorite}
                className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${ring}`}
                style={{
                  background: 'var(--bridge-surface-muted)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  color: isFavorited ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
                  outlineColor: 'var(--color-primary)',
                }}
              >
                <Heart className="h-4 w-4" style={{ fill: isFavorited ? 'currentColor' : 'none' }} aria-hidden />
              </button>

              <button
                type="button"
                onClick={onBook}
                className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-black transition-all ${ring}`}
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  outlineColor: 'var(--color-primary)',
                  boxShadow: '0 6px 20px -4px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
              >
                Book a session
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── AboutSection ─────────────────────────────────────────────────────
function AboutSection({ mentor, rawMentor }) {
  const bio = rawMentor?.bio ?? null;
  const [expanded, setExpanded] = useState(false);
  if (!bio?.trim()) return null;

  const isLong = bio.length > 420;
  const display = isLong && !expanded ? bio.slice(0, 417).trimEnd() + '…' : bio;

  return (
    <section aria-labelledby="about-heading" className="mt-16 pt-14" style={{ borderTop: '1px solid var(--bridge-border)' }}>
      <p className="font-black uppercase" style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--color-primary)' }}>
        About
      </p>
      <h2
        id="about-heading"
        className="mt-3 font-display font-black tracking-tight"
        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em', color: 'var(--bridge-text)' }}
      >
        {mentor.firstName}'s story
      </h2>
      <p
        className="mt-5 whitespace-pre-line leading-relaxed"
        style={{ fontSize: '16px', lineHeight: '1.85', color: 'var(--bridge-text-secondary)', maxWidth: '68ch' }}
      >
        {display}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`mt-3 text-sm font-semibold transition-colors ${ring}`}
          style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
        >
          {expanded ? 'Show less' : 'Read more →'}
        </button>
      )}
    </section>
  );
}

// ─── FocusAreasSection ────────────────────────────────────────────────
function FocusAreasSection({ mentor, rawMentor }) {
  const expertise = Array.isArray(rawMentor?.expertise) ? rawMentor.expertise : [];
  const industry = rawMentor?.industry ?? null;
  if (!expertise.length && !industry) return null;

  return (
    <section aria-labelledby="focus-heading" className="mt-16 pt-14" style={{ borderTop: '1px solid var(--bridge-border)' }}>
      <p className="font-black uppercase" style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--color-primary)' }}>
        Focus Areas
      </p>
      <h2
        id="focus-heading"
        className="mt-3 font-display font-black tracking-tight"
        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em', color: 'var(--bridge-text)' }}
      >
        What {mentor.firstName} helps with
      </h2>

      {/* Expertise chips */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        {expertise.map((tag) => (
          <span
            key={tag}
            className="px-4 py-2 rounded-full font-medium"
            style={{ fontSize: '14px', background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)' }}
          >
            {tag}
          </span>
        ))}
        {industry && !expertise.includes(industry) && (
          <span
            className="px-4 py-2 rounded-full font-semibold"
            style={{
              fontSize: '14px',
              background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            {industry}
          </span>
        )}
      </div>

      {/* Session types */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SESSION_TYPES.map((type) => (
          <div
            key={type.key}
            className="flex items-start gap-3.5 rounded-2xl p-4"
            style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: `color-mix(in srgb, ${type.hueVar} 13%, var(--bridge-surface-muted))` }}
              aria-hidden
            >
              {type.icon}
            </span>
            <div>
              <p className="flex items-center gap-2 font-bold" style={{ fontSize: '14px', color: 'var(--bridge-text)' }}>
                {type.name}
                {type.popular && (
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${type.hueVar} 12%, transparent)`, color: type.hueVar }}
                  >
                    Popular
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>{type.duration} · Video call</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── BookingFlow ──────────────────────────────────────────────────────
function BookingFlow({ mentor, sessionType, onReset, onRequestConfirm, user, navigate, mentorId, preselectedDate }) {
  const [pickedDate, setPickedDate] = useState(preselectedDate ?? null);
  const [pickedTime, setPickedTime] = useState(null);
  const [calBusy, setCalBusy] = useState(null);
  const [calLoading, setCalLoading] = useState(false);

  const scheduleNorm = useMemo(() => normalizeAvailabilitySchedule(mentor.availability_schedule), [mentor.availability_schedule]);
  const acceptingBookings = mentor.available !== false;
  const availability = useMemo(() => buildAvailabilityCalendar(scheduleNorm, acceptingBookings, 14), [scheduleNorm, acceptingBookings]);
  const baseSlots = useMemo(() => getSlotsForDate(scheduleNorm, pickedDate, acceptingBookings), [scheduleNorm, pickedDate, acceptingBookings]);
  const slots = useMemo(() => computeSlots(baseSlots, calBusy, pickedDate), [baseSlots, calBusy, pickedDate]);
  const hasAnyWeeklySlots = useMemo(() => Object.values(scheduleNorm.weekly).some((a) => Array.isArray(a) && a.length > 0), [scheduleNorm]);

  useEffect(() => { setPickedTime(null); }, [pickedDate]);

  useEffect(() => {
    if (!pickedDate || !mentor.calendar_connected) { setCalBusy(null); return; }
    setCalLoading(true); setCalBusy(null);
    getMentorAvailability(mentor.id, localDateStr(pickedDate))
      .then(({ busy, notConnected }) => { setCalBusy(notConnected ? null : (busy ?? [])); setCalLoading(false); })
      .catch(() => { setCalBusy(null); setCalLoading(false); });
  }, [pickedDate, mentor.calendar_connected, mentor.id]);

  const canBook = Boolean(sessionType && pickedDate && pickedTime);

  function handleBookClick() {
    if (!canBook) return;
    if (!user) { navigate('/login', { state: { from: `/mentors/${mentorId}` } }); return; }
    const iso = toNewYorkUtcIso(localDateStr(pickedDate), pickedTime);
    onRequestConfirm({ sessionType, isoDate: iso, prettyDate: pickedDate, prettyTime: pickedTime });
  }

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem]"
      style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', backgroundColor: 'var(--bridge-surface)' }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--color-primary), transparent)` }} />

      <div className="grid gap-0 lg:grid-cols-12">
        {/* Left: session summary dark panel */}
        <div className="relative overflow-hidden p-7 text-white lg:col-span-4 lg:p-8" style={{ background: DARK_BG }}>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 22%, transparent)' }}
          />
          <p className="relative text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: 'color-mix(in srgb, var(--color-primary) 65%, white)' }}>
            Your session
          </p>
          <div className="relative mt-4 flex items-start gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 20%, rgba(255,255,255,0.07))' }}
              aria-hidden
            >
              {sessionType.icon}
            </span>
            <div>
              <p className="font-display text-xl font-black tracking-tight text-white">{sessionType.name}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{sessionType.duration} · with {mentor.name?.split(' ')[0]}</p>
            </div>
          </div>

          {mentor.session_rate ? (
            <div
              className="relative mt-6 overflow-hidden rounded-2xl p-4"
              style={{
                border: '1px solid color-mix(in srgb, var(--color-primary) 30%, rgba(255,255,255,0.1))',
                background: 'color-mix(in srgb, var(--color-primary) 10%, rgba(255,255,255,0.04))',
              }}
            >
              <p className="relative text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'color-mix(in srgb, var(--color-primary) 65%, white)' }}>
                Total
              </p>
              <p className="relative mt-1 font-display text-[2.4rem] font-black tabular-nums text-white leading-none">
                $<KineticNumber to={Number(mentor.session_rate)} ms={900} />
              </p>
            </div>
          ) : null}

          <div className="relative mt-5 pt-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Date</dt>
                <dd className="text-right font-bold" style={{ color: pickedDate ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)' }}>
                  {pickedDate ? pickedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Pick a day →'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Time</dt>
                <dd className="text-right font-bold" style={{ color: pickedTime ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)' }}>
                  {pickedTime ?? 'Pick a time →'}
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={handleBookClick}
            disabled={!canBook}
            className={`mt-6 relative w-full rounded-2xl px-6 py-4 text-sm font-black tracking-wide transition-all duration-300 ${ringWhite}`}
            style={{
              background: canBook ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
              color: canBook ? 'var(--color-on-primary)' : 'rgba(255,255,255,0.25)',
              cursor: canBook ? 'pointer' : 'not-allowed',
              boxShadow: canBook ? '0 12px 32px -6px color-mix(in srgb, var(--color-primary) 55%, transparent)' : 'none',
            }}
            onMouseEnter={(e) => { if (canBook) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
          >
            {canBook ? (mentor.session_rate ? 'Continue to payment →' : 'Book session →') : 'Pick a date & time'}
          </button>

          <button
            type="button"
            onClick={onReset}
            className={`relative mt-3 w-full rounded-lg py-2 text-center text-xs font-bold transition-colors ${ringWhite}`}
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            ← Change session type
          </button>
        </div>

        {/* Right: date + time picker */}
        <div className="relative p-7 lg:col-span-8 lg:p-8">
          <div className="relative mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>Step 2 of 2</p>
            <h3 className="mt-1.5 font-display font-black tracking-[-0.02em]" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.85rem)', lineHeight: '1.05', color: 'var(--bridge-text)' }}>
              When works for you?
            </h3>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--bridge-text-muted)' }}>Next 14 days</p>

          {!acceptingBookings ? (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{ border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)', background: 'color-mix(in srgb, var(--color-warning) 8%, var(--bridge-surface-muted))', color: 'var(--color-warning)' }}
            >
              This mentor is not accepting new session requests right now.
            </div>
          ) : !hasAnyWeeklySlots ? (
            <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}>
              This mentor has not published open hours yet. Check back later.
            </div>
          ) : null}

          <div className="mb-3 flex items-center gap-3 text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-success)' }} /> Open</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-warning)' }} /> Limited</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--bridge-border-strong)' }} /> Booked</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {availability.map(({ date, status }) => {
              const iso = localDateStr(date);
              const isSelected = pickedDate ? localDateStr(pickedDate) === iso : false;
              const isClickable = status !== 'booked';
              let bg, shadow, color, cursor;
              if (isSelected) {
                bg = 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
                shadow = 'inset 0 0 0 2px var(--color-primary)';
                color = 'var(--bridge-text)';
                cursor = 'pointer';
              } else if (status === 'free') {
                bg = 'color-mix(in srgb, var(--color-success) 10%, var(--bridge-surface-muted))';
                shadow = 'inset 0 0 0 1px color-mix(in srgb, var(--color-success) 35%, transparent)';
                color = 'var(--bridge-text-secondary)';
                cursor = 'pointer';
              } else if (status === 'limited') {
                bg = 'color-mix(in srgb, var(--color-warning) 10%, var(--bridge-surface-muted))';
                shadow = 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 35%, transparent)';
                color = 'var(--bridge-text-secondary)';
                cursor = 'pointer';
              } else {
                bg = 'var(--bridge-surface-muted)';
                shadow = 'inset 0 0 0 1px var(--bridge-border)';
                color = 'var(--bridge-text-faint)';
                cursor = 'not-allowed';
              }
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => setPickedDate(date)}
                  aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} — ${status}`}
                  aria-pressed={isSelected}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all ${isClickable ? ring : ''}`}
                  style={{ background: bg, boxShadow: shadow, color, cursor, outlineColor: 'var(--color-primary)' }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 500, opacity: 0.7 }}>{date.toLocaleDateString(undefined, { weekday: 'short' })[0]}</span>
                  <span className="font-bold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>

          {mentor.calendar_connected && pickedDate && (
            <div className="mt-3 text-xs">
              {calLoading
                ? <span style={{ color: 'var(--bridge-text-muted)' }}>Checking calendar…</span>
                : calBusy !== null
                  ? calBusy.length === 0
                    ? <span className="font-medium" style={{ color: 'var(--color-success)' }}>All day available</span>
                    : <span style={{ color: 'var(--color-warning)' }}>Busy: {calBusy.map((b) => `${fmtTime(b.start)}–${fmtTime(b.end)}`).join(', ')}</span>
                  : null}
            </div>
          )}

          <div className={`mt-6 overflow-hidden transition-all duration-300 ${pickedDate ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}>
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--bridge-text-muted)' }}>Available times</p>
                {pickedDate && <p className="text-xs font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>{pickedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(({ time, available, calendarBusy }) => {
                  const isSelected = pickedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={!available}
                      onClick={() => setPickedTime(time)}
                      aria-pressed={isSelected}
                      title={calendarBusy ? 'Blocked by calendar' : undefined}
                      className={`relative rounded-lg px-2 py-2.5 text-sm font-semibold transition-all ${available ? ring : ''}`}
                      style={{
                        background: isSelected ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : available ? 'var(--bridge-surface)' : 'transparent',
                        boxShadow: isSelected ? 'inset 0 0 0 2px var(--color-primary)' : 'inset 0 0 0 1px var(--bridge-border)',
                        color: isSelected ? 'var(--bridge-text)' : available ? 'var(--bridge-text)' : 'var(--bridge-text-faint)',
                        cursor: available ? 'pointer' : 'not-allowed',
                        outlineColor: 'var(--color-primary)',
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              {slots.every((s) => !s.available) && <p className="mt-3 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>No open slots this day — try another date.</p>}
            </div>
          </div>
          {!pickedDate && <p className="mt-4 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Pick a day above to see available times.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────
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
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title"
    >
      <EmbeddedCheckoutPanel clientSecret={checkoutClientSecret} onClose={() => setCheckoutClientSecret(null)} />
      <button type="button" className="absolute inset-0 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.72)' }} aria-label="Close" onClick={handleClose} />
      <div
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] sm:rounded-3xl"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.45), inset 0 0 0 1px var(--bridge-border)' }}
      >
        {result?.ok ? (
          <div className="relative flex flex-col items-center px-8 py-14 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 18px 44px -8px rgba(16,185,129,0.55)' }}>✓</div>
            <h2 id="confirm-modal-title" className="relative font-display text-3xl font-black tracking-[-0.025em]" style={{ color: 'var(--bridge-text)' }}>Request sent</h2>
            <p className="relative mx-auto mt-3 max-w-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
              {mentorFirst} will confirm or suggest another time. We'll email you as soon as they do.
            </p>
            <button type="button" onClick={handleClose}
              className={`relative mt-8 inline-flex items-center gap-2 rounded-full px-10 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${ring}`}
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 8px 28px -6px color-mix(in srgb, var(--color-primary) 65%, transparent)', outlineColor: 'var(--color-primary)' }}
            >Done</button>
          </div>
        ) : (
          <>
            <header className="relative shrink-0 overflow-hidden px-6 pb-6 pt-6 sm:px-7" style={{ background: DARK_BG }}>
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--color-primary) 22%, transparent)' }} />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: 'color-mix(in srgb, var(--color-primary) 65%, white)' }}>Confirm & pay</p>
                  <h2 id="confirm-modal-title" className="mt-1.5 font-display text-2xl font-black tracking-[-0.025em] text-white sm:text-[1.7rem]">Ready to book?</h2>
                </div>
                <button type="button" onClick={handleClose}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-white transition ${ringWhite}`}
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  aria-label="Close"
                >×</button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-5 px-6 py-5 sm:px-7">
                <div className="relative overflow-hidden rounded-2xl p-4" style={{ border: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}>
                  <dl className="space-y-3 text-sm">
                    {[
                      { label: 'Mentor', value: mentor.name },
                      { label: 'Format', value: confirmation.sessionType.name },
                      { label: 'Date', value: prettyDate },
                      { label: 'Time', value: confirmation.prettyTime },
                    ].map(({ label, value }, i) => (
                      <div key={label} className={`flex items-start justify-between gap-3 ${i > 0 ? 'pt-3' : ''}`} style={i > 0 ? { borderTop: '1px solid var(--bridge-border)' } : {}}>
                        <dt className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>{label}</dt>
                        <dd className="text-right font-bold" style={{ color: 'var(--bridge-text)' }}>{value}</dd>
                      </div>
                    ))}
                    {mentor.session_rate ? (
                      <div className="flex items-end justify-between gap-3 pt-3" style={{ borderTop: '1px solid var(--bridge-border)' }}>
                        <dt className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>Total</dt>
                        <dd className="font-display text-2xl font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>${mentor.session_rate}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div>
                  <label htmlFor="booking-note" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
                    Add context <span className="font-normal normal-case" style={{ color: 'var(--bridge-text-faint)' }}>(optional)</span>
                  </label>
                  <textarea
                    id="booking-note"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`What do you want to get out of this session with ${mentorFirst}?`}
                    className={`w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed transition ${ring}`}
                    style={{
                      backgroundColor: 'var(--bridge-surface-muted)',
                      border: '1px solid var(--bridge-border)',
                      color: 'var(--bridge-text)',
                      outlineColor: 'var(--color-primary)',
                    }}
                  />
                </div>

                {result && !result.ok && (
                  <p className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface-muted))', border: '1px solid color-mix(in srgb, var(--color-error) 25%, transparent)', color: 'var(--color-error)' }}>
                    {result.message}
                  </p>
                )}
              </div>
            </div>

            <footer className="shrink-0 px-6 py-4 sm:px-7" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className={`w-full rounded-2xl py-3.5 text-sm font-black tracking-wide transition-all ${ring}`}
                style={{
                  background: submitting ? 'var(--bridge-surface-muted)' : 'var(--color-primary)',
                  color: submitting ? 'var(--bridge-text-faint)' : 'var(--color-on-primary)',
                  boxShadow: submitting ? 'none' : '0 8px 24px -6px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                  outlineColor: 'var(--color-primary)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
              >
                {submitting ? 'Opening checkout…' : `Pay $${mentor.session_rate ?? 25} & request`}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── ProfileSkeleton ──────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <AuroraBg />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-10">
        <div className="h-4 w-28 bridge-skeleton rounded-full mb-10" />
        <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-20">
          <div className="aspect-[3/4] bridge-skeleton rounded-[2rem] max-w-[360px] lg:max-w-none" />
          <div className="space-y-5 lg:pt-2">
            <div className="h-3 w-36 bridge-skeleton rounded" />
            <div className="h-16 w-80 bridge-skeleton rounded-xl" />
            <div className="h-5 w-56 bridge-skeleton rounded" />
            <div className="h-5 w-48 bridge-skeleton rounded" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-24 bridge-skeleton rounded-full" />
              <div className="h-6 w-20 bridge-skeleton rounded-full" />
              <div className="h-6 w-28 bridge-skeleton rounded-full" />
            </div>
            <div className="flex gap-3 mt-8">
              <div className="h-14 w-48 bridge-skeleton rounded-full" />
              <div className="h-14 w-24 bridge-skeleton rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────
export default function MentorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const flat = useProfileReducedMotion();
  const bookingRef = useRef(null);
  const heroCtaRef = useRef(null);

  const [rawMentor, setRawMentor] = useState(null);
  const [rawReviews, setRawReviews] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

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

  // Sticky bar: observe hero CTA
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  const mentor = useMemo(() => normalizeMentor(rawMentor, rawReviews), [rawMentor, rawReviews]);
  const { isFavorited, toggle: onToggleFavorite } = useFavoriteMentor(id);
  const { share: onShare, copied: shareCopied } = useShareLink();

  const viewerIsMentor = user ? isMentorAccount(user) : false;
  const isOwnMentorProfile = Boolean(user && rawMentor?.user_id && rawMentor.user_id === user.id);
  const bookingDisabledForMentor = viewerIsMentor && !isOwnMentorProfile;
  const canBook = !isOwnMentorProfile && !bookingDisabledForMentor;

  useEffect(() => {
    if (mentor) document.title = `${mentor.name} — ${mentor.title ?? 'Mentor'} · Bridge`;
    return () => { document.title = 'Bridge'; };
  }, [mentor]);

  function handleBookCta() {
    if (!canBook) return;
    if (window.innerWidth < 1024) {
      setDrawerOpen(true);
    } else {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (loading) return <ProfileSkeleton />;

  if (loadError || !rawMentor) {
    return (
      <main className="relative min-h-screen px-4 py-16 sm:px-6" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        <AuroraBg />
        <div className="relative mx-auto max-w-lg rounded-[2rem] p-14 text-center" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
          <p className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
            {loadError ? "Couldn't load this profile" : "This mentor isn't here"}
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            {loadError ?? 'The link may be outdated or the profile was removed.'}
          </p>
          <Link
            to="/mentors"
            className={`mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${ring}`}
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 8px 28px -6px color-mix(in srgb, var(--color-primary) 65%, transparent)', outlineColor: 'var(--color-primary)' }}
          >
            Browse all mentors
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main role="main" className="relative isolate min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <AuroraBg />

      {/* Sticky scroll bar */}
      {canBook && (
        <StickyBar
          mentor={mentor}
          rawMentor={rawMentor}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          onBook={handleBookCta}
          visible={stickyVisible}
        />
      )}

      {/* Checkout notices */}
      {(checkoutError || checkoutNotice) && (
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-4">
          {checkoutError && (
            <p className="rounded-2xl px-4 py-3 text-sm" style={{ border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)', background: 'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface-muted))', color: 'var(--color-error)' }}>
              {checkoutError}
            </p>
          )}
          {checkoutNotice && (
            <p className="rounded-2xl px-4 py-3 text-sm" style={{ border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)', background: 'color-mix(in srgb, var(--color-success) 8%, var(--bridge-surface-muted))', color: 'var(--color-success)' }}>
              {checkoutNotice}
            </p>
          )}
        </div>
      )}

      {/* Hero */}
      <MentorHero
        mentor={mentor}
        rawMentor={rawMentor}
        isFavorited={isFavorited}
        onToggleFavorite={onToggleFavorite}
        onShare={onShare}
        shareCopied={shareCopied}
        onBook={handleBookCta}
        heroCtaRef={heroCtaRef}
        flat={flat}
      />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-10">
        <AboutSection mentor={mentor} rawMentor={rawMentor} />
        <FocusAreasSection mentor={mentor} rawMentor={rawMentor} />
        <TrackRecord mentor={mentor} />

        {isOwnMentorProfile && (
          <div
            className="mt-16 relative overflow-hidden rounded-[1.75rem] p-7 sm:p-9"
            style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: 'var(--color-success)' }}>Your public profile</p>
            <h2 className="mt-2 font-display font-black tracking-[-0.025em]" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)', lineHeight: '1.05', color: 'var(--bridge-text)' }}>
              This is what mentees see before they book
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
              Session requests and your availability are managed from your dashboard.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${ring}`}
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 8px 28px -6px color-mix(in srgb, var(--color-primary) 65%, transparent)', outlineColor: 'var(--color-primary)' }}
              >
                Open mentor dashboard
              </Link>
            </div>
          </div>
        )}

        <ReviewsBlock mentor={mentor} />
      </div>

      {/* Full-width booking section */}
      {canBook && (
        <div ref={bookingRef} id="book" className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-4 mb-24 scroll-mt-28">
          <div className="mb-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
              Book a session
            </p>
            <h2 className="mt-2 font-display font-black tracking-[-0.025em]" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--bridge-text)' }}>
              What kind of session with {mentor.firstName}?
            </h2>
          </div>

          {!selectedType ? (
            <div
              className="relative overflow-hidden rounded-[1.75rem]"
              style={{ background: DARK_BG, boxShadow: '0 8px 48px -8px rgba(0,0,0,0.4)', outline: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px)`,
                  backgroundSize: '48px 48px',
                  opacity: 0.5,
                }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--color-primary), transparent)` }} />

              <div className="relative p-7 sm:p-10">
                <div className="grid gap-3 sm:grid-cols-2">
                  {SESSION_TYPES.map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 ${ringWhite}`}
                      style={{ background: 'rgba(255,255,255,0.06)', outline: '1px solid rgba(255,255,255,0.1)', outlineOffset: '-1px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; }}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: `radial-gradient(ellipse 80% 80% at 50% 120%, color-mix(in srgb, ${type.hueVar} 15%, transparent), transparent)` }}
                      />
                      <div className="relative flex items-start gap-4">
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                          style={{ background: `color-mix(in srgb, ${type.hueVar} 18%, rgba(255,255,255,0.08))` }}
                          aria-hidden
                        >
                          {type.icon}
                        </span>
                        <div>
                          <p className="flex items-center gap-2 font-display font-black text-white" style={{ fontSize: '17px' }}>
                            {type.name}
                            {type.popular && (
                              <span
                                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ background: `color-mix(in srgb, ${type.hueVar} 20%, rgba(255,255,255,0.1))`, color: 'white' }}
                              >
                                Popular
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{type.duration} · Video call</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  All sessions include a video call and notes follow-up
                  {rawMentor?.session_rate != null && ` · $${rawMentor.session_rate}/session`}
                </p>
              </div>
            </div>
          ) : (
            <BookingFlow
              mentor={rawMentor}
              sessionType={selectedType}
              onReset={() => setSelectedType(null)}
              onRequestConfirm={setPendingConfirm}
              user={user}
              navigate={navigate}
              mentorId={id}
            />
          )}
        </div>
      )}

      {/* Comparable mentors */}
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        <ComparableMentors mentor={mentor} />
      </div>

      {/* Mobile booking drawer */}
      <BookingDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {!selectedType ? (
          <div className="pt-2">
            <h2 className="font-display font-black tracking-tight mb-4" style={{ fontSize: '1.5rem', color: 'var(--bridge-text)' }}>
              Choose a session type
            </h2>
            <div className="space-y-2">
              {SESSION_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => { setSelectedType(type); setDrawerOpen(false); bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  className={`w-full flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all ${ring}`}
                  style={{ background: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', outlineColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 0 0 1.5px color-mix(in srgb, ${type.hueVar} 45%, transparent)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)'; }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `color-mix(in srgb, ${type.hueVar} 12%, var(--bridge-surface))` }} aria-hidden>{type.icon}</span>
                  <div>
                    <p className="font-bold" style={{ fontSize: '14px', color: 'var(--bridge-text)' }}>{type.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--bridge-text-muted)' }}>{type.duration}</p>
                  </div>
                  <ArrowLeft className="h-4 w-4 ml-auto -rotate-180" style={{ color: 'var(--bridge-text-faint)' }} aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ) : null}
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
