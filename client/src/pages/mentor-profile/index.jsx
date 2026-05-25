import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import { addRecentlyViewedMentor } from '../../utils/recentlyViewed';
import { getMentorById } from '../../api/mentors';
import { getReviewsForMentor } from '../../api/reviews';
import { getOrCreateConversation } from '../../api/messages';
import { AuroraBg } from '../dashboard/dashboardCinematic.jsx';
import supabase from '../../api/supabase';
import { ArrowLeft, BadgeCheck, Heart, MessageCircle } from 'lucide-react';
import AppLink from '../../components/AppLink';
import { useContent } from '../../content';
import { useSubscription } from '../../hooks/useSubscription';

import {
  useFavoriteMentor,
  normalizeMentor,
} from './profileHooks';
import MentorshipDescriptionSection from './MentorshipDescriptionSection';
import MentorshipAreasSection from './MentorshipAreasSection';
import WhyIMentorBlock from './WhyIMentorBlock';
import ImpactStatsStrip from './ImpactStatsStrip';
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
import MentorBookingSnapshot from './MentorBookingSnapshot';
import HeroBookModal from './HeroBookModal';
import SubscribeUnlockModal from './SubscribeUnlockModal';
import MentorSectionNav from './MentorSectionNav';
import { formatRoleHeadline } from './mentorMeta';
import { bodyClass, sectionTitleClass, sectionTitleStyle } from './profileType';
import { PUBLIC_NAVBAR_H, primaryNavHeight, PROFILE_SECTION_NAV_H } from '../../utils/mentorProfileLayout';

// ─── Constants ───────────────────────────────────────────────────────
const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const DARK_BG = 'linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 50%, black), color-mix(in srgb, var(--color-primary) 22%, black))';

// ─── Helpers ──────────────────────────────────────────────────────────
const HERO_SHELL_BG = 'color-mix(in srgb, var(--bridge-surface) 72%, var(--bridge-canvas))';

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
  mentorsListPath = '/mentors',
  embedded = false,
  menteesHelped = 0,
}) {
  const { s } = useContent();
  const roleHeadline = formatRoleHeadline(mentor.title, mentor.company);
  const gatedLabel = subscriptionLoading ? 'Checking plan…' : 'Book a session →';

  return (
    <section aria-labelledby="profile-heading" className={`relative pb-16 lg:pb-20 ${embedded ? 'pt-4 sm:pt-6' : 'pt-6 sm:pt-8'}`}>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Back nav */}
        <nav className="mb-10" aria-label="Back to mentors">
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

        <div className="grid items-start gap-10 lg:grid-cols-[420px_1fr] lg:gap-20">
          {/* Photo */}
          <div className="relative max-w-[360px] lg:max-w-none">
            <div
              className="aspect-[3/4] overflow-hidden rounded-[2rem]"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: '0 32px 72px -16px rgba(0,0,0,0.18)',
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
                    style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', outlineColor: 'var(--color-primary)' }}
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
                    style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', outlineColor: 'var(--color-primary)' }}
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
            </div>

            {/* Name */}
            <h1
              id="profile-heading"
              className="font-display font-black leading-none"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
            >
              {mentor.name}
            </h1>

            {/* Role @ company */}
            {roleHeadline && (
              <p
                className="mt-2.5 font-normal leading-snug"
                style={{ fontSize: 'clamp(17px, 1.5vw, 20px)', color: 'var(--bridge-text-secondary)' }}
              >
                {roleHeadline}
              </p>
            )}

            <ImpactStatsStrip mentor={mentor} rawMentor={rawMentor} menteesHelped={menteesHelped} />

            <MentorHeroMeta mentor={mentor} />

            {canEngage && <MentorBookingSnapshot mentor={mentor} subscriberReady={subscriberReady} />}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {canEngage && (
                <>
                  <button
                    ref={heroCtaRef}
                    type="button"
                    onClick={onBook}
                    disabled={subscriptionLoading}
                    className={`rounded-full px-9 py-4 text-[15px] font-black tracking-wide transition-all disabled:opacity-60 ${ring}`}
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      boxShadow: '0 14px 36px -6px color-mix(in srgb, var(--color-primary) 58%, transparent)',
                      outlineColor: 'var(--color-primary)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {subscriberReady ? 'Book a session →' : gatedLabel}
                  </button>

                  <button
                    type="button"
                    onClick={onMessage}
                    disabled={subscriptionLoading || messageLoading}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-all disabled:opacity-60 ${ring}`}
                    style={{
                      background: 'var(--bridge-surface-muted)',
                      color: 'var(--bridge-text-secondary)',
                      outlineColor: 'var(--color-primary)',
                    }}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {messageLoading ? 'Opening…' : subscriberReady ? 'Message' : 'Message'}
                  </button>
                  {messageError && (
                    <p className="w-full text-sm" style={{ color: 'var(--color-error)' }} role="alert">
                      {messageError}
                    </p>
                  )}
                </>
              )}

              <button
                type="button"
                aria-pressed={isFavorited}
                aria-label={isFavorited ? 'Remove from saved' : 'Save mentor'}
                onClick={onToggleFavorite}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition-all ${ring}`}
                style={{
                  background: 'var(--bridge-surface-muted)',
                  color: isFavorited ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
                  outlineColor: 'var(--color-primary)'
                }}
              >
                <Heart className="h-4 w-4" style={{ fill: isFavorited ? 'currentColor' : 'none' }} aria-hidden />
                {isFavorited ? s.mentorProfile.savedToFavorites : s.mentorProfile.saveToFavorites}
              </button>
            </div>

          </div>
        </div>
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isActive: subscriberReady, loading: subscriptionLoading } = useSubscription();
  const heroCtaRef = useRef(null);

  const [rawMentor, setRawMentor] = useState(null);
  const [rawReviews, setRawReviews] = useState([]);
  const [menteesHelped, setMenteesHelped] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [unlockModal, setUnlockModal] = useState({ open: false, intent: 'book' });
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

  const planPath = embedded ? '/dashboard/plan' : '/pricing';
  const loginReturn = location.pathname;

  function openUnlockModal(intent) {
    if (!user) {
      navigate('/login', { state: { from: loginReturn } });
      return false;
    }
    if (subscriptionLoading) return false;
    if (!subscriberReady) {
      setUnlockModal({ open: true, intent });
      return false;
    }
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
  const rootStyle = embedded
    ? { backgroundColor: 'var(--bridge-canvas)' }
    : { backgroundColor: 'var(--bridge-canvas)', paddingTop: PUBLIC_NAVBAR_H };

  return (
    <Root
      role={embedded ? undefined : 'main'}
      className={embedded ? 'relative isolate overflow-x-hidden' : 'relative isolate min-h-screen overflow-x-hidden'}
      style={rootStyle}
    >
      {!embedded && <AuroraBg />}

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
      <div
        className="w-full border-t"
        style={{
          borderColor: 'var(--bridge-border)',
          backgroundColor: HERO_SHELL_BG,
        }}
      >
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
          subscriberReady={subscriberReady}
          subscriptionLoading={subscriptionLoading}
          mentorsListPath={embedded ? '/dashboard/mentors' : '/mentors'}
          embedded={embedded}
          menteesHelped={menteesHelped}
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

      <SubscribeUnlockModal
        open={unlockModal.open}
        intent={unlockModal.intent}
        mentor={mentor}
        user={user}
        pricingPath={planPath}
        onClose={() => setUnlockModal((prev) => ({ ...prev, open: false }))}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-20">
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
