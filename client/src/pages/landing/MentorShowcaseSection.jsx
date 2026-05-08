import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { findMentor } from './landingData';
import { DUR_SHORT } from './landingHooks';

const FEATURED_ID = 'm-maya-chen';
const SMALL_IDS = ['m-marcus-lee', 'm-elena-voss', 'm-omar-hassan', 'm-sarah-kim'];

const TONE_GRADIENTS = {
  amber:   'linear-gradient(135deg,#4F46E5,#818CF8)',
  emerald: 'linear-gradient(135deg,#059669,#10b981)',
  sky:     'linear-gradient(135deg,#0EA5E9,#38BDF8)',
  rose:    'linear-gradient(135deg,#6D28D9,#A78BFA)',
  violet:  'linear-gradient(135deg,#5B21B6,#A78BFA)',
  teal:    'linear-gradient(135deg,#0D9488,#14B8A6)',
  orange:  'linear-gradient(135deg,#4F46E5,#6366F1)',
  pink:    'linear-gradient(135deg,#312E81,#818CF8)',
};

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function MentorShowcaseSection() {
  const featured = findMentor(FEATURED_ID);
  const smalls = SMALL_IDS.map(findMentor).filter(Boolean);

  return (
    <section
      id="mentors"
      aria-labelledby="mentors-heading"
      className="relative py-24 lg:py-32"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <h2
            id="mentors-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            People who&rsquo;ve already
            <br />
            <span style={{ color: 'var(--color-primary)' }}>been there.</span>
          </h2>
          <p
            className="mt-7 max-w-xl"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
          >
            Vetted operators, founders and builders. No coaches, no influencers — just people who&rsquo;ve done it.
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-fr gap-4 lg:gap-5">
          {featured && (
            <RevealOnScroll className="sm:col-span-2 lg:col-span-6 lg:row-span-2">
              <FeaturedCard mentor={featured} />
            </RevealOnScroll>
          )}
          {smalls.map((m) => (
            <RevealOnScroll key={m.id} className="lg:col-span-3 lg:row-span-1">
              <SmallCard mentor={m} />
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
              5 of 2,400+ vetted mentors. New profiles every week.
            </p>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
            >
              See every mentor
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function FeaturedCard({ mentor }) {
  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className="group flex flex-col h-full overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 14px 32px -22px rgba(79,70,229,0.18)',
        transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
        outlineColor: 'var(--color-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border), 0 22px 50px -22px color-mix(in srgb, var(--color-primary) 32%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border), 0 14px 32px -22px rgba(79,70,229,0.18)';
      }}
    >
      <FeaturedImage mentor={mentor} />
      <div className="shrink-0 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: '#10b981' }}
          />
          <p
            className="text-[11px] font-bold uppercase"
            style={{ color: 'var(--bridge-text-secondary)', letterSpacing: '0.22em' }}
          >
            Booking this week
          </p>
        </div>
        <p
          className="mt-3 font-display font-black"
          style={{
            fontSize: 'clamp(1.625rem, 3vw, 1.875rem)',
            color: 'var(--bridge-text)',
            letterSpacing: '-0.025em',
          }}
        >
          {mentor.name}
        </p>
        <p
          className="text-[14px]"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          {mentor.title} · {mentor.company}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {mentor.tags.slice(0, 3).map(t => (
            <span
              key={t}
              className="px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p
            className="text-[16px] font-black"
            style={{
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            ${mentor.rate}/session
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            View profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedImage({ mentor }) {
  // Aspect ratios at small viewports; lg+ flex-1 fills remaining grid-cell height.
  const wrapperClass =
    'shrink-0 aspect-[4/5] sm:aspect-[16/9] lg:aspect-auto lg:flex-1 lg:min-h-[280px]';

  if (mentor.avatarUrl) {
    return (
      <div className={wrapperClass}>
        <img
          src={mentor.avatarUrl}
          alt={`${mentor.name}, ${mentor.title}`}
          width={640}
          height={800}
          loading="eager"
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center top' }}
        />
      </div>
    );
  }
  return (
    <div
      className={`${wrapperClass} flex items-center justify-center`}
      style={{
        background: TONE_GRADIENTS[mentor.tone] || 'var(--color-primary)',
      }}
      aria-hidden="true"
    >
      <p
        className="font-display font-black text-white"
        style={{ fontSize: 80, letterSpacing: '-0.04em' }}
      >
        {initialsOf(mentor.name)}
      </p>
    </div>
  );
}

function SmallCard({ mentor }) {
  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className="group flex flex-col h-full overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 14px 32px -22px rgba(79,70,229,0.16)',
        transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
        outlineColor: 'var(--color-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border), 0 18px 40px -22px color-mix(in srgb, var(--color-primary) 28%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border), 0 14px 32px -22px rgba(79,70,229,0.16)';
      }}
    >
      <SmallImage mentor={mentor} />
      <div className="mt-auto p-4">
        <p
          className="font-display font-black"
          style={{ fontSize: 15, color: 'var(--bridge-text)' }}
        >
          {mentor.name}
        </p>
        <p
          className="text-[11px] truncate"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {mentor.title} · {mentor.company}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p
            className="text-[12px] font-bold"
            style={{
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            ${mentor.rate}
          </p>
          {mentor.tags?.[0] && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold truncate"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {mentor.tags[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SmallImage({ mentor }) {
  if (mentor.avatarUrl) {
    return (
      <img
        src={mentor.avatarUrl}
        alt={`${mentor.name}, ${mentor.title}`}
        width={320}
        height={320}
        loading="lazy"
        className="aspect-square w-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      className="aspect-square w-full flex items-center justify-center shrink-0"
      style={{
        background: TONE_GRADIENTS[mentor.tone] || 'var(--color-primary)',
      }}
      aria-hidden="true"
    >
      <p
        className="font-display font-black text-white"
        style={{ fontSize: 56, letterSpacing: '-0.04em' }}
      >
        {initialsOf(mentor.name)}
      </p>
    </div>
  );
}
