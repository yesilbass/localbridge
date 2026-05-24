import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import { SESSION_TYPES } from '../../constants/sessionTypes';
import { addRecentlyViewedMentor } from '../../utils/recentlyViewed';
import { getMentorById } from '../../api/mentors';
import { getReviewsForMentor } from '../../api/reviews';
import CalendlyInlineWidget from '../../components/CalendlyInlineWidget';
import { AuroraBg } from '../dashboard/dashboardCinematic.jsx';
import supabase from '../../api/supabase';
import { ArrowLeft, BadgeCheck, Heart, Share } from 'lucide-react';
import AppLink from '../../components/AppLink';
import { useContent } from '../../content';

import {
  useFavoriteMentor,
  useShareLink,
  normalizeMentor,
  useProfileReducedMotion,
  formatJoinedDate
} from './profileHooks';
import TrackRecord from './TrackRecord';
import ReviewsBlock from './ReviewsBlock';
import ComparableMentors from './ComparableMentors';
import BookingDrawer from './BookingDrawer';
import FeaturedReviewSpotlight from './FeaturedReviewSpotlight';
import ExpertiseToolkitSection from './ExpertiseToolkitSection';
import MentorTagGroups from '../../components/MentorTagGroups';

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
// ─── MentorHero ───────────────────────────────────────────────────────
function MentorHero({ mentor, rawMentor, isFavorited, onToggleFavorite, onShare, shareCopied, onBook, heroCtaRef, flat }) {
  const { s } = useContent();
  const joinedLabel = formatJoinedDate(mentor.joinedAt);
  const bio = rawMentor?.bio ?? null;
  const bioExcerpt = bio ? (bio.length > 240 ? bio.slice(0, 237).trimEnd() + '…' : bio) : null;

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
            {s.mentorProfile.allMentors}
          </Link>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[420px_1fr] lg:gap-20">
          {/* Photo */}
          <div className="relative max-w-[360px] lg:max-w-none">
            <div
              className="aspect-[3/4] overflow-hidden rounded-[2rem]"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: '0 32px 72px -16px rgba(0,0,0,0.22), inset 0 0 0 1px var(--bridge-border)'
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
                  Bridge Verified
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
                  <svg className="h-4 w-4" viewBox="0 0 20 20" aria-hidden style={{ fill: 'var(--color-primary)' }}>
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

            <div className="mb-8">
            <MentorTagGroups mentor={rawMentor} layout="stack" limits={{ expertise: 8, industry: 2, tools: 6 }} />
            </div>

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
                  letterSpacing: '0.01em'
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
                  outlineColor: 'var(--color-primary)'
                }}
              >
                <Heart className="h-4 w-4" style={{ fill: isFavorited ? 'currentColor' : 'none' }} aria-hidden />
                {isFavorited ? s.mentorProfile.savedToFavorites : s.mentorProfile.saveToFavorites}
              </button>

              <button
                type="button"
                onClick={onShare}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition-all ${ring}`}
                style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)', outlineColor: 'var(--color-primary)' }}
              >
                <Share className="h-4 w-4" aria-hidden />
                {shareCopied ? s.mentorProfile.shareCopied : s.mentorProfile.share}
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
              boxShadow: '0 4px 24px -8px rgba(0,0,0,0.12)'
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
                  outlineColor: 'var(--color-primary)'
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
                  boxShadow: '0 6px 20px -4px color-mix(in srgb, var(--color-primary) 45%, transparent)'
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
  const { s } = useContent();
  const bio = rawMentor?.bio ?? null;
  const [expanded, setExpanded] = useState(false);
  if (!bio?.trim()) return null;

  const isLong = bio.length > 420;
  const display = isLong && !expanded ? bio.slice(0, 417).trimEnd() + '…' : bio;

  return (
    <section aria-labelledby="about-heading" className="mt-16 pt-14" style={{ borderTop: '1px solid var(--bridge-border)' }}>
      <p className="font-black uppercase" style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--color-primary)' }}>
        {s.mentorProfile.aboutHeading}
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

// ─── BookingFlow (Calendly) ───────────────────────────────────────────
function BookingFlow({ mentor, sessionType, onReset, user, navigate }) {
  const acceptingBookings = mentor.available !== false;
  const calendlyReady = !!(mentor.calendly_connected && mentor.calendly_event_type_uri && mentor.calendly_scheduling_url);

  const prefill = useMemo(() => ({
    name: user?.user_metadata?.full_name || user?.email || undefined,
    email: user?.email || undefined,
    customAnswers: { a1: 'Booked via Bridge' }
  }), [user]);

  const utm = useMemo(() => ({
    utmSource: 'bridge',
    utmMedium: 'mentor_profile',
    utmCampaign: mentor.id || 'bridge',
    utmContent: sessionType?.key || ''
  }), [mentor.id, sessionType]);

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem]"
      style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', backgroundColor: 'var(--bridge-surface)' }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--color-primary), transparent)` }} />

      <div className="grid gap-0 lg:grid-cols-12">
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

          <div
            className="relative mt-6 overflow-hidden rounded-2xl p-4"
            style={{
              border: '1px solid color-mix(in srgb, var(--color-primary) 30%, rgba(255,255,255,0.1))',
              background: 'color-mix(in srgb, var(--color-primary) 10%, rgba(255,255,255,0.04))'
            }}
          >
            <p className="relative text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'color-mix(in srgb, var(--color-primary) 65%, white)' }}>
              Cost
            </p>
            <p className="relative mt-1 font-display text-[2rem] font-black text-white leading-none">Free</p>
            <p className="relative mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Volunteer mentor · no session fee</p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className={`relative mt-6 w-full rounded-lg py-2 text-center text-xs font-bold transition-colors ${ringWhite}`}
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            ← Change session type
          </button>
        </div>

        <div className="relative p-7 lg:col-span-8 lg:p-8">
          <div className="relative mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>Step 2 of 2</p>
            <h3 className="mt-1.5 font-display font-black tracking-[-0.02em]" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.85rem)', lineHeight: '1.05', color: 'var(--bridge-text)' }}>
              Pick an hour
            </h3>
          </div>

          {!acceptingBookings ? (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)', background: 'color-mix(in srgb, var(--color-warning) 8%, var(--bridge-surface-muted))', color: 'var(--color-warning)' }}
            >
              This mentor is not accepting new bookings right now.
            </div>
          ) : !calendlyReady ? (
            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{ border: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.28em]"
                style={{ color: 'var(--color-warning)' }}
              >
                Calendar not open
              </p>
              <p
                className="font-display mt-2 font-black tracking-[-0.02em]"
                style={{ fontSize: 'clamp(1.25rem, 2.4vw, 1.6rem)', color: 'var(--bridge-text)' }}
              >
                {(mentor.name?.split(' ')[0] || 'This mentor')} hasn't opened their calendar yet.
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                We'll email you the moment booking opens. Until then, you can save them or keep browsing.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/mentors"
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${ring}`}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    outlineColor: 'var(--color-primary)'
                  }}
                >
                  Browse other mentors →
                </Link>
              </div>
            </div>
          ) : (
            <CalendlyInlineWidget
              url={mentor.calendly_scheduling_url}
              prefill={prefill}
              utm={utm}
              minHeight={680}
              onScheduled={() => navigate('/dashboard/sessions?booked=1')}
            />
          )}

          <button
            type="button"
            onClick={onReset}
            className={`mt-4 inline-flex items-center gap-1 text-xs font-bold transition-colors ${ring}`}
            style={{ color: 'var(--bridge-text-muted)', outlineColor: 'var(--color-primary)' }}
          >
            ← Change session type
          </button>
        </div>
      </div>
    </div>
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
export default function MentorProfilePage({ embedded = false }) {
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
  const [checkoutNotice, setCheckoutNotice] = useState(null);
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
        setRawMentor((prev) => prev ? {
          ...prev,
          available: payload.new.available,
          calendly_connected: payload.new.calendly_connected,
          calendly_event_type_uri: payload.new.calendly_event_type_uri,
          calendly_scheduling_url: payload.new.calendly_scheduling_url
        } : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // If we ever land here with a `?booked=1` after the Calendly success
  // callback, surface a transient success banner and strip the param.
  useEffect(() => {
    if (searchParams.get('booked') !== '1') return;
    setCheckoutNotice('Booking confirmed. Check your dashboard for details.');
    const next = new URLSearchParams(searchParams);
    next.delete('booked');
    setSearchParams(next, { replace: true });
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
    const listPath = embedded ? '/dashboard/mentors' : '/mentors';
    const ErrShell = embedded ? 'div' : 'main';
    return (
      <ErrShell className={embedded ? 'relative py-10' : 'relative min-h-screen px-4 py-16 sm:px-6'} style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        {!embedded && <AuroraBg />}
        <div className="relative mx-auto max-w-lg rounded-[2rem] p-14 text-center" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
          <p className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
            {loadError ? "Couldn't load this profile" : "This mentor isn't here"}
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            {loadError ?? 'The link may be outdated or the profile was removed.'}
          </p>
          <Link
            to={listPath}
            className={`mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${ring}`}
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 8px 28px -6px color-mix(in srgb, var(--color-primary) 65%, transparent)', outlineColor: 'var(--color-primary)' }}
          >
            Browse all mentors
          </Link>
        </div>
      </ErrShell>
    );
  }

  const Root = embedded ? 'div' : 'main';
  return (
    <Root
      role={embedded ? undefined : 'main'}
      className={embedded ? 'relative isolate overflow-x-hidden' : 'relative isolate min-h-screen overflow-x-hidden'}
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      {!embedded && <AuroraBg />}

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
      {checkoutNotice && (
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-4">
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
        <FeaturedReviewSpotlight review={mentor?.featuredReview} firstName={mentor?.firstName} />
        <AboutSection mentor={mentor} rawMentor={rawMentor} />
        <ExpertiseToolkitSection mentor={mentor} rawMentor={rawMentor} />
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
              <AppLink
                to="/dashboard"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${ring}`}
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 8px 28px -6px color-mix(in srgb, var(--color-primary) 65%, transparent)', outlineColor: 'var(--color-primary)' }}
              >
                Open mentor dashboard
              </AppLink>
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
                  opacity: 0.5
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
                  All sessions are free · video call and notes follow-up included
                </p>
              </div>
            </div>
          ) : (
            <BookingFlow
              mentor={rawMentor}
              sessionType={selectedType}
              onReset={() => setSelectedType(null)}
              user={user}
              navigate={navigate}
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
    </Root>
  );
}
