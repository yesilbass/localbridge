import { Star } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

export default function ManifestoSection() {
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  const PRINCIPLES = [
    {
      number: '01',
      title: "Only people who've done your job.",
      body:
        "Every mentor has lived the exact role you're targeting. We filter on outcome, not credentials.",
      visual: <P1Chips />,
    },
    {
      number: '02',
      title: 'One hour, one price.',
      body:
        'No packages. No lock-ins. No “contact us for pricing.” Every rate on every profile, always.',
      visual: <P2Pricing />,
    },
    {
      number: '03',
      title: 'Booked in the time it takes to make coffee.',
      body:
        'Calendar-native. Real-time availability. No “when are you free” email loops, no scheduling assistants, no waiting two weeks for a reply.',
      visual: <P3Calendar weekday={weekday} />,
    },
    {
      number: '04',
      title: 'All reviews, unfiltered.',
      body: 'Good and critical, side by side. No curation, no censoring, no removed posts.',
      visual: <P4Reviews />,
    },
  ];

  return (
    <section
      id="manifesto"
      aria-labelledby="manifesto-heading"
      className="relative py-24 lg:py-32"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.32em' }}
          >
            What we built differently
          </p>
          <h2
            id="manifesto-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            Built differently,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)',
              }}
            >
              by design.
            </span>
          </h2>
          <p
            className="mt-7 max-w-xl"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
          >
            We started because every alternative was broken. This is what we fixed.
          </p>
        </RevealOnScroll>

        <div className="mt-14">
          {PRINCIPLES.map((p, i) => {
            const isEven = i % 2 === 1;
            return (
              <RevealOnScroll key={p.number}>
                <div
                  className="grid lg:grid-cols-2 gap-12 items-center py-14"
                  style={i > 0 ? { borderTop: '1px solid var(--bridge-border)' } : undefined}
                >
                  <div className={isEven ? 'lg:order-2' : ''}>
                    <PrincipleText {...p} />
                  </div>
                  <div className={isEven ? 'lg:order-1' : ''}>{p.visual}</div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PrincipleText({ number, title, body }) {
  return (
    <div>
      <p
        className="font-display font-black"
        style={{
          fontSize: 'clamp(3rem, 6vw, 5rem)',
          lineHeight: 1,
          color: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          fontFeatureSettings: '"tnum" 1',
          letterSpacing: '-0.04em',
        }}
      >
        {number}
      </p>
      <h3
        className="mt-4 font-display font-black"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          color: 'var(--bridge-text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
        }}
      >
        {title}
      </h3>
      <p
        className="mt-4 max-w-md"
        style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
      >
        {body}
      </p>
    </div>
  );
}

/* ─── P1: filter chips ────────────────────────────────────────────────── */

function P1Chips() {
  const chips = [
    'PMs at Series B+',
    'Eng Managers at hyperscalers',
    'Designers at unicorns',
    'Founders of YC companies',
  ];
  return (
    <div className="flex flex-wrap gap-2.5">
      {chips.map((c) => (
        <span
          key={c}
          className="px-4 py-2 rounded-full text-[14px] font-semibold"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* ─── P2: stacked price cards ─────────────────────────────────────────── */

function P2Pricing() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <p
          className="text-[11px] uppercase font-bold"
          style={{ color: 'var(--bridge-text-faint)', letterSpacing: '0.18em' }}
        >
          Other coaching
        </p>
        <p
          className="text-[20px] font-bold line-through mt-1"
          style={{
            color: 'var(--bridge-text-muted)',
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          $1,200 / 3 months
        </p>
      </div>
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
          boxShadow:
            'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)',
        }}
      >
        <p
          className="text-[11px] uppercase font-bold"
          style={{ color: 'var(--color-primary)', letterSpacing: '0.18em' }}
        >
          Bridge
        </p>
        <p
          className="text-[24px] font-black mt-1"
          style={{
            color: 'var(--bridge-text)',
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          $60 / 1 hour
        </p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--bridge-text-muted)' }}>
          Cancel anytime. Rate visible on every profile.
        </p>
      </div>
    </div>
  );
}

/* ─── P3: calendar mock ───────────────────────────────────────────────── */

function P3Calendar({ weekday }) {
  const SLOTS = [
    { time: '9:00',    highlight: false },
    { time: '10:30',   highlight: false },
    { time: '2:00 PM', highlight: true  },
    { time: '1:30',    highlight: false },
    { time: '3:30',    highlight: false },
    { time: '5:00',    highlight: false },
  ];
  return (
    <div
      className="rounded-2xl p-5 max-w-md"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[13px] font-bold"
          style={{ color: 'var(--bridge-text)' }}
        >
          Today, {weekday}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
          8 slots open
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((s) => (
          <div
            key={s.time}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold text-center"
            style={
              s.highlight
                ? {
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    boxShadow:
                      '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                    fontFeatureSettings: '"tnum" 1',
                  }
                : {
                    backgroundColor: 'var(--bridge-surface-muted)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    color: 'var(--bridge-text-muted)',
                    textDecoration: 'line-through',
                    fontFeatureSettings: '"tnum" 1',
                  }
            }
          >
            {s.time}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: '#10b981' }}
        />
        <p
          className="text-[12px] font-semibold"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          Maya is online — book this slot in one click.
        </p>
      </div>
    </div>
  );
}

/* ─── P4: review chips with stars ─────────────────────────────────────── */

function P4Reviews() {
  const REVIEWS = [
    {
      rating: 5,
      quote: 'Got the offer the same week.',
      attribution: 'Jordan R., Senior PM in B2B SaaS',
    },
    {
      rating: 4,
      quote: 'Tough but fair. Reframed my whole pitch.',
      attribution: 'Priya K., Founder raising seed',
    },
    {
      rating: 3,
      quote: 'Solid call but not the right match for me.',
      attribution: 'Sam D., switching from design to PM',
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {REVIEWS.map((r, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <div className="flex gap-0.5 shrink-0">
            {[0, 1, 2, 3, 4].map((idx) => (
              <Star
                key={idx}
                className="h-3.5 w-3.5"
                style={
                  idx < r.rating
                    ? { fill: '#F59E0B', color: '#F59E0B' }
                    : { color: 'var(--bridge-text-muted)' }
                }
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="italic font-display text-[13px]"
              style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.5 }}
            >
              {r.quote}
            </p>
            <p
              className="text-[11px] mt-1"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {r.attribution}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
