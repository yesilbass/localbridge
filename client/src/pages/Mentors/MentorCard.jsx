import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { focusRing } from '../../ui';
import { DUR_SHORT, DUR_MED, EASE } from '../../lib/motion';
import { usePerfTier } from '../landing/landingHooks';

export function StarRating({ rating }) {
  const uid = useId().replace(/:/g, '');
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          const gid = `${uid}-s${i}`;
          return (
            <svg key={i} className="h-3 w-3" viewBox="0 0 20 20" aria-hidden>
              <defs>
                <linearGradient id={gid}>
                  <stop offset={fill} stopColor="#f59e0b" />
                  <stop offset={fill} stopColor="currentColor" className="text-[var(--bridge-border-strong)]" />
                </linearGradient>
              </defs>
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                fill={`url(#${gid})`}
              />
            </svg>
          );
        })}
      </span>
      <span
        className="text-[11px] font-bold tabular-nums"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export function MentorGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <div
            className="bridge-skeleton"
            style={{ aspectRatio: '4/5', backgroundColor: 'var(--bridge-surface-muted)' }}
          />
          <div className="p-5 flex flex-col gap-2">
            <div
              className="bridge-skeleton h-5 w-3/4 rounded-full"
              style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
            />
            <div
              className="bridge-skeleton h-4 w-1/2 rounded-full"
              style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
            />
            <div className="flex items-center justify-between mt-3">
              <div
                className="bridge-skeleton h-4 w-16 rounded-full"
                style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
              />
              <div
                className="bridge-skeleton h-5 w-12 rounded-full"
                style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MentorCard({ mentor, featured, index = 0 }) {
  const tier = usePerfTier();
  const flat = tier === 'low';

  const initials = mentor.name
    ? mentor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  const tags = (mentor.expertise || []).slice(0, 3);

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={`group block ${focusRing} rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2`}
      style={{ outlineColor: 'var(--color-primary)' }}
      aria-labelledby={`mentor-${mentor.id}-name`}
    >
      <motion.article
        layoutId={`mentor-${mentor.id}`}
        className={`relative overflow-hidden rounded-3xl flex flex-col h-full ${featured ? 'lg:col-span-2' : ''}`}
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
        initial={flat ? undefined : { opacity: 0, y: 12 }}
        animate={flat ? undefined : { opacity: 1, y: 0 }}
        transition={flat ? { duration: 0 } : {
          duration: DUR_MED,
          delay: Math.min(index * 0.05, 0.4),
          ease: EASE,
        }}
        whileHover={flat ? undefined : {
          y: -3,
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent), 0 14px 32px -16px color-mix(in srgb, var(--color-primary) 30%, transparent)',
        }}
      >
        {/* Avatar block */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: featured ? '16/10' : '4/5' }}
        >
          {mentor.image_url ? (
            <img
              src={mentor.image_url}
              alt={`${mentor.name}, ${mentor.title}`}
              width={400}
              height={500}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-[400ms] group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center font-display font-black"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
              }}
            >
              {initials}
            </div>
          )}

          {featured && (
            <span
              className="absolute top-4 left-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
              }}
            >
              Booked most this week
            </span>
          )}

          {mentor.available && (
            <span
              className="absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 90%, transparent)',
                backdropFilter: 'blur(6px)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                color: 'var(--bridge-text-secondary)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" aria-hidden />
              Available this week
            </span>
          )}
        </div>

        {/* Body block */}
        <div className="p-5 flex flex-col gap-1 flex-1">
          <h3
            id={`mentor-${mentor.id}-name`}
            className={`font-display font-black tracking-[-0.02em] leading-tight ${featured ? 'text-[22px] sm:text-[26px]' : 'text-[18px] sm:text-[20px]'}`}
            style={{ color: 'var(--bridge-text)' }}
          >
            {mentor.name}
          </h3>
          <p
            className="text-[13px] truncate"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            {mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" fill="#F59E0B" stroke="#F59E0B" aria-hidden />
              <span
                className="text-[13px] font-bold tabular-nums"
                style={{ color: 'var(--bridge-text)' }}
              >
                {(mentor.rating || 0).toFixed(1)}
              </span>
              <span
                className="text-[11px] tabular-nums"
                style={{ color: 'var(--bridge-text-muted)' }}
              >
                ({mentor.total_sessions || 0})
              </span>
            </div>
            <div className="text-right shrink-0">
              <span
                className="text-[15px] font-black tabular-nums"
                style={{ color: 'var(--bridge-text)' }}
              >
                {mentor.session_rate ? `$${mentor.session_rate}` : 'Free'}
              </span>
              <span
                className="text-[10px] ml-0.5"
                style={{ color: 'var(--bridge-text-faint)' }}
              >
                / session
              </span>
            </div>
          </div>

          {/* Hover-reveal tags */}
          {tags.length > 0 && (
            <div
              className="grid group-hover:grid-rows-[1fr]"
              style={{
                gridTemplateRows: '0fr',
                transition: flat ? 'none' : 'grid-template-rows 260ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <div className="overflow-hidden">
                <div
                  className="pt-3 mt-3 flex flex-wrap gap-1.5"
                  style={{ borderTop: '1px solid var(--bridge-border)' }}
                >
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {featured && (
            <div
              className="opacity-0 group-hover:opacity-100 mt-2 self-end text-[12px] font-semibold inline-flex items-center gap-1"
              style={{
                color: 'var(--color-primary)',
                transition: flat ? 'none' : `opacity ${DUR_SHORT}s`,
              }}
            >
              View profile →
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
