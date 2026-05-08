import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BadgeCheck, Heart, Share } from 'lucide-react';
import { EASE, DUR_MED, STAGGER, formatJoinedDate, useProfileReducedMotion } from './profileHooks';

function StarIcon({ filled }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      aria-hidden
      style={{ fill: filled ? '#F59E0B' : 'none', stroke: filled ? '#F59E0B' : 'var(--bridge-text-muted)', strokeWidth: filled ? 0 : 1.5 }}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function SecondaryBtn({ onClick, icon: Icon, label, active, activeStyle = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: active ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
        outlineColor: 'var(--color-primary)',
        ...activeStyle,
      }}
    >
      <Icon className="h-4 w-4" style={{ fill: active ? 'currentColor' : 'none' }} />
      {label}
    </button>
  );
}

export default function IdentityHero({ mentor, isFavorited, onToggleFavorite, onShare, shareCopied, flat }) {
  if (!mentor) return null;

  const joinedLabel = formatJoinedDate(mentor.joinedAt);
  const rating = mentor.rating ?? 0;
  const reviewCount = mentor.reviewCount ?? 0;
  const totalSessions = mentor.totalSessions ?? 0;

  const stagger = (i) => flat ? {} : {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR_MED, delay: 0.10 + i * STAGGER, ease: EASE },
  };

  return (
    <header aria-labelledby="profile-heading" className="pt-6">
      <motion.nav
        aria-label="Back to mentors"
        className="mb-6"
        initial={flat ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR_MED, delay: 0.04, ease: EASE }}
      >
        <Link
          to="/mentors"
          className="inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontSize: '13px',
            color: 'var(--bridge-text-muted)',
            outlineColor: 'var(--color-primary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All mentors
        </Link>
      </motion.nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Photo */}
        <motion.div
          className="shrink-0"
          initial={flat ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR_MED, delay: 0.05, ease: EASE }}
        >
          <div
            className="aspect-[4/5] overflow-hidden rounded-2xl max-w-[260px] lg:max-w-none"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {mentor.avatarUrl ? (
              <img
                src={mentor.avatarUrl}
                alt={`${mentor.name}, ${mentor.title}`}
                width={560}
                height={700}
                loading="eager"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}
              >
                <span
                  className="font-display font-black select-none"
                  style={{ fontSize: '64px', color: 'var(--color-on-primary)' }}
                >
                  {(mentor.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Identity content */}
        <div className="flex flex-col">
          {/* Meta row */}
          <motion.div
            className="flex flex-wrap items-center gap-3 mb-3"
            style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}
            {...stagger(0)}
          >
            {mentor.isVerified && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black uppercase"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
            {mentor.isVerified && joinedLabel && (
              <span style={{ color: 'var(--bridge-text-faint)' }}>·</span>
            )}
            {joinedLabel && (
              <span>On Bridge since {joinedLabel}</span>
            )}
            {mentor.avgResponseHours && (
              <>
                <span style={{ color: 'var(--bridge-text-faint)' }}>·</span>
                <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
                  <span className="bridge-pulse h-1.5 w-1.5 rounded-full" style={{ background: '#10b981', display: 'inline-block' }} />
                  Replies in {mentor.avgResponseHours < 2 ? 'under 2 hours' : mentor.avgResponseHours < 24 ? `${mentor.avgResponseHours} hours` : `${Math.round(mentor.avgResponseHours / 24)} days`}
                </span>
              </>
            )}
          </motion.div>

          {/* Name */}
          <motion.h1
            id="profile-heading"
            className="font-display font-black leading-none"
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              letterSpacing: '-0.025em',
              color: 'var(--bridge-text)',
            }}
            {...stagger(1)}
          >
            {mentor.name}
          </motion.h1>

          {/* Title line */}
          {(mentor.title || mentor.company) && (
            <motion.p
              className="mt-2"
              style={{ fontSize: 'clamp(15px, 1.2vw, 18px)', color: 'var(--bridge-text-secondary)' }}
              {...stagger(2)}
            >
              {[mentor.title, mentor.company].filter(Boolean).join(' · ')}
            </motion.p>
          )}

          {/* Rating + sessions */}
          {(rating > 0 || totalSessions > 0) && (
            <motion.div
              className="flex flex-wrap items-center gap-4 mt-4"
              style={{ fontSize: '14px' }}
              {...stagger(3)}
            >
              {rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <StarIcon filled />
                  <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>
                    {rating.toFixed(1)}
                  </span>
                  {reviewCount > 0 && (
                    <span style={{ color: 'var(--bridge-text-muted)' }}>({reviewCount} reviews)</span>
                  )}
                </span>
              )}
              {rating > 0 && totalSessions > 0 && (
                <span
                  className="inline-block h-4 w-px"
                  style={{ background: 'var(--bridge-border)' }}
                  aria-hidden
                />
              )}
              {totalSessions > 0 && (
                <span>
                  <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>
                    {totalSessions}
                  </span>
                  <span style={{ color: 'var(--bridge-text-muted)' }}> sessions booked</span>
                </span>
              )}
            </motion.div>
          )}

          {/* Italic tagline */}
          {mentor.tagline && (
            <motion.p
              className="italic font-display mt-6 max-w-2xl"
              style={{
                fontSize: 'clamp(1.0625rem, 1.6vw, 1.25rem)',
                lineHeight: 1.5,
                color: 'var(--bridge-text-secondary)',
              }}
              {...stagger(4)}
            >
              {mentor.tagline}
            </motion.p>
          )}

          {/* Mobile-only quick actions */}
          <motion.div className="flex items-center gap-4 mt-5 sm:hidden" {...stagger(4)}>
            <SecondaryBtn
              onClick={onToggleFavorite}
              icon={Heart}
              label={isFavorited ? 'Saved' : 'Save'}
              active={isFavorited}
            />
            <SecondaryBtn
              onClick={onShare}
              icon={Share}
              label={shareCopied ? 'Copied' : 'Share'}
              active={false}
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
}
