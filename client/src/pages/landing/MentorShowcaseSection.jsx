import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { findMentor } from './landingData';
import { DUR_SHORT } from './landingHooks';
import { useI18n } from '../../i18n';

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

const FEATURED_BIO =
  'Twelve years in product, four product launches at Linear. I help PMs sharpen scope, ship faster, and tell the story that gets them promoted.';
const FEATURED_QUOTE =
  '“Most PMs aren\u2019t stuck on craft \u2014 they\u2019re stuck on narrative. We fix that in one session.”';
const FEATURED_FOCUS = ['PM Strategy', 'Promotion', 'Scoping', 'Roadmaps'];

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function MentorShowcaseSection() {
  const { t } = useI18n();
  const featured = findMentor(FEATURED_ID);
  const smalls = SMALL_IDS.map(findMentor).filter(Boolean);

  return (
    <section
      id="mentors"
      aria-labelledby="mentors-heading"
      className="relative py-12 lg:py-16"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}
          >
            {t('landing.showcase.eyebrow', "This week's spotlight")}
          </p>
          <h2
            id="mentors-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(1.75rem, 4.2vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            {t('landing.showcase.heading1', 'One mentor,')}{' '}<span style={{ color: 'var(--color-primary)' }}>{t('landing.showcase.heading2', 'up close.')}</span>
          </h2>
          <p
            className="mt-6 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 'clamp(0.95rem, 1.6vw, 1.0625rem)',
              lineHeight: 1.55,
            }}
          >
            {t('landing.showcase.subCopy', 'Every profile on Bridge looks like this — real bio, real numbers, real booking.')}
          </p>
        </RevealOnScroll>

        {featured && (
          <div className="mt-10">
            <Centerpiece mentor={featured} t={t} />
          </div>
        )}

        <RevealOnScroll>
          <div className="mt-14">
            <p
              className="text-[10px] font-bold uppercase"
              style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
            >
              {t('landing.showcase.alsoBooking', 'Also booking this week')}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {smalls.map((m) => (
                <MentorChip key={m.id} mentor={m} />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                {t('landing.showcase.count', '5 of 2,400+ vetted mentors.')}
              </p>
              <Link
                to="/mentors"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
              >
                {t('landing.showcase.seeEvery', 'See every mentor')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Centerpiece({ mentor, t }) {
  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-12"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow:
          'inset 0 0 0 1px var(--bridge-border), 0 22px 60px -28px color-mix(in srgb, var(--color-primary) 30%, transparent)',
      }}
    >
      {/* Left: dark identity panel (40%) */}
      <div
        className="flex flex-col gap-5 p-7 sm:p-9 lg:col-span-5"
        style={{
          background:
            'linear-gradient(160deg, #0A0A14 0%, #1A1A2E 100%)',
          color: 'color-mix(in srgb, white 92%, transparent)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full font-display font-black text-white"
              style={{
                background: TONE_GRADIENTS[mentor.tone] || 'var(--color-primary)',
                fontSize: 24,
                letterSpacing: '-0.04em',
              }}
              aria-hidden="true"
            >
              {initialsOf(mentor.name)}
            </div>
            {mentor.online && (
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-success)',
                  boxShadow: '0 0 0 2px #0A0A14',
                }}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display font-black" style={{ fontSize: 20, letterSpacing: '-0.02em' }}>
              {mentor.name}
            </p>
            <p className="text-[13px]" style={{ color: 'color-mix(in srgb, white 70%, transparent)' }}>
              {mentor.title} · {mentor.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[13px]" style={{ color: 'color-mix(in srgb, white 85%, transparent)' }}>
          <span className="inline-flex items-center gap-0.5" style={{ color: 'var(--color-primary)' }}>
            {[0,1,2,3,4].map(i => (
              <Star key={i} className="h-3.5 w-3.5" style={{ fill: 'currentColor' }} aria-hidden="true" />
            ))}
          </span>
          <span style={{ fontFeatureSettings: '"tnum" 1' }}>
            <b>{mentor.rating}</b> · {mentor.sessions} sessions
          </span>
        </div>

        <blockquote
          className="rounded-xl p-4 text-[14px] italic"
          style={{
            backgroundColor: 'color-mix(in srgb, white 6%, transparent)',
            color: 'color-mix(in srgb, white 85%, transparent)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, white 8%, transparent)',
            lineHeight: 1.55,
          }}
        >
          {FEATURED_QUOTE}
        </blockquote>
      </div>

      {/* Right: light info panel (60%) */}
      <div className="flex flex-col gap-5 p-7 sm:p-9 lg:col-span-7">
        <div>
          <p
            className="text-[10px] font-bold uppercase"
            style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
          >
            {t('landing.showcase.about', 'About')}
          </p>
          <p
            className="mt-2 text-[15px]"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}
          >
            {FEATURED_BIO}
          </p>
        </div>

        <div>
          <p
            className="text-[10px] font-bold uppercase"
            style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
          >
            {t('landing.showcase.focusAreas', 'Focus areas')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEATURED_FOCUS.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div
          className="grid grid-cols-2 rounded-xl"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <Stat label={t('landing.showcase.rating', 'Rating')} value={mentor.rating.toFixed(1)} />
          <Stat label={t('landing.showcase.sessions', 'Sessions')} value={String(mentor.sessions)} divider />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Link
            to={`/mentors/${mentor.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 14px 32px -14px color-mix(in srgb, var(--color-primary) 60%, transparent)',
              outlineColor: 'var(--color-primary)',
              transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {t('landing.showcase.openProfile', 'Open full profile')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, divider }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-3 py-4"
      style={divider ? { borderLeft: '1px solid var(--bridge-border)' } : undefined}
    >
      <p
        className="font-display font-black"
        style={{
          fontSize: 18,
          color: 'var(--bridge-text)',
          letterSpacing: '-0.02em',
          fontFeatureSettings: '"tnum" 1',
        }}
      >
        {value}
      </p>
      <p
        className="mt-0.5 text-[10px] font-bold uppercase"
        style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.18em' }}
      >
        {label}
      </p>
    </div>
  );
}

function MentorChip({ mentor }) {
  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className="group flex items-center gap-3 rounded-2xl p-3 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        outlineColor: 'var(--color-primary)',
        transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-black text-white"
        style={{
          background: TONE_GRADIENTS[mentor.tone] || 'var(--color-primary)',
          fontSize: 14,
          letterSpacing: '-0.04em',
        }}
        aria-hidden="true"
      >
        {initialsOf(mentor.name)}
      </div>
      <div className="min-w-0">
        <p
          className="truncate font-display font-black"
          style={{ fontSize: 13, color: 'var(--bridge-text)' }}
        >
          {mentor.name}
        </p>
        <p
          className="truncate text-[11px]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {mentor.title}
        </p>
      </div>
    </Link>
  );
}
