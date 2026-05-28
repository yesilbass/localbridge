import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import { addRecentlyViewedMentor } from '../../utils/recentlyViewed';
import { getMentorById } from '../../api/mentors';
import { getReviewsForMentor } from '../../api/reviews';
import { getOrCreateConversation } from '../../api/messages';
import supabase from '../../api/supabase';
import { ArrowLeft, BadgeCheck, Star } from 'lucide-react';
import { getNextAvailability, availabilityToneStyle } from '../../utils/mentorDisplay';
import AvailabilityPanel from '../../components/mentor/AvailabilityPanel';
import AppLink from '../../components/AppLink';
import { useContent } from '../../content';

import {
  useFavoriteMentor,
  normalizeMentor,
  useCalendlySummary,
} from './profileHooks';
import MentorshipDescriptionSection from './MentorshipDescriptionSection';
import MentorshipAreasSection from './MentorshipAreasSection';
import WhyIMentorBlock from './WhyIMentorBlock';
import MentorProfilePosts from './MentorProfilePosts';
import MentorBadgesSection from './MentorBadgesSection';
import TrackRecord from './TrackRecord';
import ReviewsBlock from './ReviewsBlock';
import ComparableMentors from './ComparableMentors';
import FeaturedReviewSpotlight from './FeaturedReviewSpotlight';
import ExpertiseToolkitSection from './ExpertiseToolkitSection';
import ToolkitSection from './ToolkitSection';
import IndustriesSection from './IndustriesSection';
import MentorHeroMeta from './MentorHeroMeta';
import MentorHeroActions from './MentorHeroActions';
import MentorProfileAtmosphere from './MentorProfileAtmosphere';
import AtAGlance from './AtAGlance';
import HeroBookModal from './HeroBookModal';
import MentorSectionNav from './MentorSectionNav';
import { formatRoleHeadline } from './mentorMeta';
import { getCategoryLabels } from '../../constants/mentorshipCategories';
import { bodyClass, sectionTitleClass, sectionTitleStyle } from './profileType';
import { PUBLIC_NAVBAR_H, primaryNavHeight, PROFILE_SECTION_NAV_H } from '../../utils/mentorProfileLayout';

// ─── Constants ───────────────────────────────────────────────────────
const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const DARK_BG = 'linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 50%, black), color-mix(in srgb, var(--color-primary) 22%, black))';

// ─── Helpers ──────────────────────────────────────────────────────────
function MentorHeroAvatar({ mentor }) {
  return (
    <div
      className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full sm:h-[112px] sm:w-[112px]"
      style={{
        boxShadow: '0 0 0 4px var(--bridge-surface), 0 0 0 6px color-mix(in srgb, var(--color-primary) 22%, var(--bridge-border))',
      }}
    >
      {mentor.avatarUrl ? (
        <img
          src={mentor.avatarUrl}
          alt={`${mentor.name}${mentor.title ? `, ${mentor.title}` : ''}`}
          width={224}
          height={224}
          loading="eager"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center" style={{ background: DARK_BG }}>
          <span className="font-display select-none text-[28px] font-black sm:text-[36px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {(mentor.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function HeroMentorshipPills({ rawMentor, className = '' }) {
  const labels = getCategoryLabels(rawMentor?.mentorship_categories).filter(Boolean).slice(0, 3);
  if (!labels.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} aria-label="Mentorship focus areas">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 9%, var(--bridge-surface))',
            color: 'var(--color-primary)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, var(--bridge-border))',
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function MentorSocialLinks({ rawMentor }) {
  const hasSocials = rawMentor?.linkedin_url || rawMentor?.github_url || rawMentor?.website_url;
  if (!hasSocials) return null;

  const linkClass = `inline-flex h-8 w-8 items-center justify-center rounded-xl transition hover:opacity-80 ${ring}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {rawMentor.linkedin_url && (
        <a href={rawMentor.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn"
          className={linkClass}
          style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', border: '1px solid var(--bridge-border)', outlineColor: 'var(--color-primary)' }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      )}
      {rawMentor.github_url && (
        <a href={rawMentor.github_url} target="_blank" rel="noreferrer" aria-label="GitHub"
          className={linkClass}
          style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', border: '1px solid var(--bridge-border)', outlineColor: 'var(--color-primary)' }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      )}
      {rawMentor.website_url && (
        <a href={rawMentor.website_url} target="_blank" rel="noreferrer" aria-label="Website"
          className={linkClass}
          style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', border: '1px solid var(--bridge-border)', outlineColor: 'var(--color-primary)' }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>
      )}
    </div>
  );
}

// ─── HeroStatsBlock ───────────────────────────────────────────────────
function HeroStatsBlock({ mentor, rawMentor }) {
  const rating = mentor?.rating ?? 0;
  const reviewCount = mentor?.reviewCount ?? 0;
  const totalSessions = rawMentor?.total_sessions ?? mentor?.totalSessions ?? 0;

  if (!rating && !reviewCount && !totalSessions) return null;

  return (
    <div className="flex shrink-0 flex-col items-end gap-1 text-right">
      {rating > 0 ? (
        <>
          <div className="flex items-center gap-2">
            <Star
              className="h-5 w-5 shrink-0"
              style={{ fill: 'var(--color-primary)', color: 'var(--color-primary)' }}
              aria-hidden
            />
            <span
              className="font-display font-black tabular-nums leading-none"
              style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.04em', color: 'var(--bridge-text)' }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
          <div className="space-y-0.5">
            {reviewCount > 0 && (
              <p className="text-sm font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            )}
            {totalSessions > 0 && (
              <p className="text-xs font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
                {totalSessions} sessions
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-0.5">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 font-black uppercase"
            style={{ fontSize: '10px', letterSpacing: '0.14em', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}
          >
            New mentor
          </span>
          {totalSessions > 0 && (
            <p className="text-xs font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
              {totalSessions} sessions
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HeroBottomBar ────────────────────────────────────────────────────
function HeroBottomBar({
  mentor, rawMentor, nextSlot, calendarMeta, durationMin,
  user, subscriberReady, subscriptionLoading, showBookingGate,
  onBook, onMessage, isFavorited, onToggleFavorite, favoritedLabel,
  heroCtaRef, messageLoading, messageError, signInPath,
}) {
  const accepting = mentor?.available !== false;
  const availability = getNextAvailability(mentor, nextSlot, calendarMeta);
  const availStyle = availabilityToneStyle(availability.tone);
  const slotIso = typeof nextSlot === 'string' ? nextSlot : null;

  return (
    <div
      className="mt-10 pt-8 border-t"
      style={{ borderColor: 'color-mix(in srgb, var(--bridge-border) 55%, transparent)' }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6 lg:gap-8">
        {accepting && (
          <div
            className="flex-1 rounded-2xl p-5 sm:p-6"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-surface-muted) 65%, var(--bridge-surface))' }}
          >
            <AvailabilityPanel
              availability={availability}
              nextAvailableIso={slotIso}
              availStyle={availStyle}
              context="profile"
              size="lg"
            />
          </div>
        )}

        <div className={`flex flex-col justify-center gap-3 ${accepting ? 'sm:w-[280px] lg:w-[300px]' : 'w-full'}`}>
          <MentorHeroActions
            layout="panel"
            user={user}
            subscriberReady={subscriberReady}
            onBook={onBook}
            onMessage={onMessage}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
            favoritedLabel={favoritedLabel}
            heroCtaRef={heroCtaRef}
            subscriptionLoading={subscriptionLoading}
            messageLoading={messageLoading}
            showBookingGate={showBookingGate}
            signInPath={signInPath}
          />
          {messageError && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }} role="alert">{messageError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MentorHero ───────────────────────────────────────────────────────
function MentorHero({
  mentor,
  rawMentor,
  isFavorited,
  onToggleFavorite,
  onBook,
  onMessage,
  messageLoading,
  messageError,
  heroCtaRef,
  canEngage,
  subscriberReady,
  subscriptionLoading,
  user,
  mentorsListPath = '/mentors',
  embedded = false,
}) {
  const { s } = useContent();
  const roleHeadline = formatRoleHeadline(mentor.title, mentor.company);
  const showBookingGate = canEngage && user && !subscriberReady && !subscriptionLoading;
  const { nextSlot, durationMin, calendarMeta } = useCalendlySummary(mentor);

  return (
    <section aria-labelledby="profile-heading" className={`relative ${embedded ? 'pt-6 pb-12 sm:pt-8 sm:pb-16' : 'pt-8 pb-16 sm:pt-12 sm:pb-24'}`}>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        <nav className="mb-10 lg:mb-12" aria-label="Back to mentors">
          <Link
            to={mentorsListPath}
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${ring}`}
            style={{ color: 'var(--bridge-text-muted)', outlineColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {s.mentorProfile.allMentors}
          </Link>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
          <MentorHeroAvatar mentor={mentor} />

          <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1
                    id="profile-heading"
                    className="font-display font-black leading-[1.05]"
                    style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.625rem)', letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
                  >
                    {mentor.name}
                  </h1>
                  {mentor.isVerified && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-black uppercase whitespace-nowrap"
                      style={{ fontSize: '10px', letterSpacing: '0.14em', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
                    >
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Verified
                    </span>
                  )}
                </div>

                {roleHeadline && (
                  <p style={{ fontSize: 'clamp(15px, 1.25vw, 17px)', color: 'var(--bridge-text-secondary)' }}>
                    {roleHeadline}
                  </p>
                )}
              </div>

              <HeroStatsBlock mentor={mentor} rawMentor={rawMentor} />
            </div>

            <HeroMentorshipPills rawMentor={rawMentor} className="mt-4" />

            <div className="mt-5 space-y-3.5 sm:mt-6">
              <MentorHeroMeta mentor={mentor} rawMentor={rawMentor} />
              <AtAGlance mentor={mentor} roleHeadline={roleHeadline} className="" />
              <MentorSocialLinks rawMentor={rawMentor} />
            </div>
          </div>
        </div>

        {canEngage && (
          <HeroBottomBar
            mentor={mentor}
            rawMentor={rawMentor}
            nextSlot={nextSlot}
            calendarMeta={calendarMeta}
            durationMin={durationMin}
            user={user}
            subscriberReady={subscriberReady}
            subscriptionLoading={subscriptionLoading}
            showBookingGate={showBookingGate}
            onBook={onBook}
            onMessage={onMessage}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
            favoritedLabel={isFavorited ? s.mentorProfile.savedToFavorites : s.mentorProfile.saveToFavorites}
            heroCtaRef={heroCtaRef}
            messageLoading={messageLoading}
            messageError={messageError}
            signInPath={typeof window !== 'undefined' ? window.location.pathname : '/mentors'}
          />
        )}

      </div>
    </section>
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
    <section id="about" aria-labelledby="about-heading" className="mt-24 max-w-3xl scroll-mt-[calc(var(--profile-primary-nav-h,5.25rem)+3.5rem)]">
      <h2 id="about-heading" className={sectionTitleClass} style={sectionTitleStyle}>
        {mentor.firstName}'s story
      </h2>
      <p
        className={`mt-6 whitespace-pre-line ${bodyClass}`}
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {display}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`mt-4 text-base font-semibold transition-colors ${ring}`}
          style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
        >
          {expanded ? 'Show less' : 'Read more →'}
        </button>
      )}
    </section>
  );
}

// ─── ProfileSkeleton ──────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <MentorProfileAtmosphere embedded={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12 pb-28">
        <div className="h-4 w-28 bridge-skeleton rounded-full mb-14" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="h-[88px] w-[88px] shrink-0 bridge-skeleton rounded-full sm:h-[112px] sm:w-[112px]" />
            <div className="min-w-0 flex-1 space-y-5 pt-1">
              <div className="space-y-3">
                <div className="h-10 w-64 bridge-skeleton rounded-xl" />
                <div className="h-5 w-48 bridge-skeleton rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bridge-skeleton rounded-full" />
                <div className="h-6 w-24 bridge-skeleton rounded-full" />
              </div>
              <div className="h-4 w-56 bridge-skeleton rounded" />
              <div className="flex gap-2">
                <div className="h-7 w-24 bridge-skeleton rounded-full" />
                <div className="h-7 w-28 bridge-skeleton rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex min-h-[22rem] flex-col gap-6 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-9 border-[color-mix(in_srgb,var(--bridge-border)_60%,transparent)]">
            <div className="h-8 w-32 bridge-skeleton rounded-lg" />
            <div className="h-24 bridge-skeleton rounded-2xl" />
            <div className="h-12 bridge-skeleton rounded-xl" />
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isSubscribed, settingsLoading } = useAuth();
  const heroCtaRef = useRef(null);

  const [rawMentor, setRawMentor] = useState(null);
  const [rawReviews, setRawReviews] = useState([]);
  const [menteesHelped, setMenteesHelped] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState(null);

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
        setMenteesHelped(mentorRes.data.menteesHelped ?? 0);
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

  const mentor = useMemo(() => normalizeMentor(rawMentor, rawReviews), [rawMentor, rawReviews]);
  const { isFavorited, toggle: onToggleFavorite } = useFavoriteMentor(id);

  const viewerIsMentor = user ? isMentorAccount(user) : false;
  const isOwnMentorProfile = Boolean(user && rawMentor?.user_id && rawMentor.user_id === user.id);
  const bookingDisabledForMentor = viewerIsMentor && !isOwnMentorProfile;
  const canEngage = !isOwnMentorProfile && !bookingDisabledForMentor;

  const loginReturn = location.pathname;

  function openUnlockModal(intent) {
    if (!user) {
      navigate('/login', { state: { from: loginReturn } });
      return false;
    }
    if (settingsLoading) return false;
    if (!isSubscribed) return false;
    return true;
  }

  function handleBookCta() {
    if (!canEngage) return;
    if (openUnlockModal('book')) setBookModalOpen(true);
  }

  async function handleMessage() {
    if (!canEngage) return;
    if (!openUnlockModal('message')) return;
    if (!rawMentor?.id) return;

    setMessageError(null);
    setMessageLoading(true);
    const menteeName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Mentee';
    const { data, error, message } = await getOrCreateConversation(rawMentor.id, menteeName);
    setMessageLoading(false);

    if (error || !data?.id) {
      setMessageError(message ?? error?.message ?? 'Could not open messages. Try again.');
      return;
    }
    navigate(`/dashboard/messages/${data.id}`);
  }

  useEffect(() => {
    if (mentor) document.title = `${mentor.name} — ${mentor.title ?? 'Mentor'} · Bridge`;
    return () => { document.title = 'Bridge'; };
  }, [mentor]);

  useEffect(() => {
    const navH = primaryNavHeight(embedded);
    document.documentElement.style.setProperty('--profile-primary-nav-h', navH);
    document.documentElement.style.scrollPaddingTop = `calc(${navH} + ${PROFILE_SECTION_NAV_H})`;
    return () => {
      document.documentElement.style.removeProperty('--profile-primary-nav-h');
      document.documentElement.style.scrollPaddingTop = '';
    };
  }, [embedded]);

  if (loading) return <ProfileSkeleton />;

  if (loadError || !rawMentor) {
    const listPath = embedded ? '/dashboard/mentors' : '/mentors';
    const ErrShell = embedded ? 'div' : 'main';
    return (
      <ErrShell className={embedded ? 'relative py-10' : 'relative min-h-screen px-4 py-16 sm:px-6'} style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        <MentorProfileAtmosphere embedded={embedded} />
        <div className="relative z-10 mx-auto max-w-lg rounded-[2rem] p-14 text-center" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
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
  const rootStyle = embedded
    ? { backgroundColor: 'var(--bridge-canvas)' }
    : { backgroundColor: 'var(--bridge-canvas)', paddingTop: PUBLIC_NAVBAR_H };

  return (
    <Root
      role={embedded ? undefined : 'main'}
      className={embedded ? 'relative isolate overflow-x-hidden' : 'relative isolate min-h-screen overflow-x-hidden'}
      style={rootStyle}
    >
      <MentorProfileAtmosphere embedded={embedded} />

      {/* Checkout notices */}
      {checkoutNotice && (
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 mt-4">
          {checkoutNotice && (
            <p className="rounded-2xl px-4 py-3 text-sm" style={{ border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)', background: 'color-mix(in srgb, var(--color-success) 8%, var(--bridge-surface-muted))', color: 'var(--color-success)' }}>
              {checkoutNotice}
            </p>
          )}
        </div>
      )}

      {/* Hero + section nav */}
      <div className="relative z-10">
        <MentorHero
          mentor={mentor}
          rawMentor={rawMentor}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          onBook={handleBookCta}
          onMessage={handleMessage}
          messageLoading={messageLoading}
          messageError={messageError}
          heroCtaRef={heroCtaRef}
          canEngage={canEngage}
          subscriberReady={isSubscribed}
          subscriptionLoading={settingsLoading}
          user={user}
          mentorsListPath={embedded ? '/dashboard/mentors' : '/mentors'}
          embedded={embedded}
        />

        <MentorSectionNav
          reviewCount={mentor.reviewCount ?? 0}
          heroCtaRef={heroCtaRef}
          inHero
          embedded={embedded}
        />
      </div>

      <HeroBookModal
        open={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        mentor={rawMentor}
        user={user}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-20">
        <FeaturedReviewSpotlight review={mentor?.featuredReview} firstName={mentor?.firstName} />
        <MentorshipDescriptionSection rawMentor={rawMentor} />
        <AboutSection mentor={mentor} rawMentor={rawMentor} />
        <MentorshipAreasSection rawMentor={rawMentor} />
        <WhyIMentorBlock rawMentor={rawMentor} />
        <MentorBadgesSection mentorProfileId={rawMentor?.id} />
        <ExpertiseToolkitSection mentor={mentor} rawMentor={rawMentor} />
        <IndustriesSection mentor={mentor} rawMentor={rawMentor} />
        <ToolkitSection mentor={mentor} rawMentor={rawMentor} />
        <TrackRecord mentor={mentor} />

        {isOwnMentorProfile && (
          <div
            className="mt-16 relative overflow-hidden rounded-[1.75rem] p-8 sm:p-10 lg:p-12"
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
        <MentorProfilePosts mentorProfileId={rawMentor?.id} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-28">
        <ComparableMentors mentor={mentor} />
      </div>
    </Root>
  );
}
