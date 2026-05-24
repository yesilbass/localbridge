import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, ScanSearch, Compass } from 'lucide-react';
import { EASE } from './landingHooks';

const LOGOS = [
  'Google', 'Stripe', 'Linear', 'Airbnb', 'Meta', 'Notion',
  'Spotify', 'Figma', 'Vercel', 'Shopify', 'Salesforce', 'OpenAI',
  'Anthropic', 'Databricks', 'Snowflake', 'Airtable', 'Loom', 'Twilio',
];

const STATS = [
  {
    pct: 71,
    label: 'Book a follow-up within 30 days',
    detail: 'Most mentees come back while momentum is still fresh.',
    Icon: CalendarCheck
  },
  {
    pct: 87,
    label: 'Say their mentor spotted something they\'d missed',
    detail: 'An outside read on blind spots you cannot see alone.',
    Icon: ScanSearch
  },
  {
    pct: 93,
    label: 'Leave their first call with a clear next step',
    detail: 'Not vague advice — one concrete move to make this week.',
    Icon: Compass
  },
];

function useCountUp(target, triggered, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!triggered) return undefined;
    let start = null;
    let raf = 0;
    const timeout = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [triggered, target, duration, delay]);
  return value;
}

function ProgressRing({ pct, triggered, delay = 0, index = 0 }) {
  const gradId = `trust-ring-grad-${index}`;
  const size = 92;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);

  useEffect(() => {
    if (!triggered) return;
    const t = setTimeout(() => setOffset(c * (1 - pct / 100)), 120 + delay);
    return () => clearTimeout(t);
  }, [triggered, pct, c, delay]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bridge-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: `stroke-dashoffset 1.35s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms` }}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--lp-grad-from, var(--color-primary))" />
            <stop offset="100%" stopColor="var(--lp-grad-to, var(--color-primary))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function StatCard({ stat, index, triggered }) {
  const count = useCountUp(stat.pct, triggered, 1200, index * 120);
  const Icon = stat.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={triggered ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.08 + index * 0.1, ease: EASE }}
      className="flex h-full flex-col gap-5 rounded-2xl p-5 sm:p-6"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface-muted))',
            color: 'var(--color-primary)'
          }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </span>
        <span
          className="font-display text-[11px] font-black tabular-nums tracking-[0.18em]"
          style={{ color: 'var(--bridge-text-faint)' }}
        >
          0{index + 1}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing pct={stat.pct} triggered={triggered} delay={index * 120} index={index} />
        <span
          className="font-display font-black tabular-nums"
          style={{
            fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-to, var(--color-primary)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {count}%
        </span>
      </div>

      <div>
        <p className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--bridge-text)' }}>
          {stat.label}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--bridge-text-muted)' }}>
          {stat.detail}
        </p>
      </div>
    </motion.article>
  );
}

export default function TrustBandSection() {
  const sectionRef = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section
      ref={sectionRef}
      aria-label="Trust indicators"
      className="relative overflow-hidden py-16 lg:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[420px] -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse 70% 80% at 50% 50%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)'
        }}
      />

      <style>{`
        @keyframes logo-scroll { 0%{transform:translate3d(0,0,0)} 100%{transform:translate3d(-50%,0,0)} }
      `}</style>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Logo marquee */}
        <div
          className="relative mb-12 overflow-hidden lg:mb-14"
          style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}
        >
          <div
            className="flex items-center whitespace-nowrap lp-anim-layer"
            style={{ animation: 'logo-scroll 30s linear infinite', width: 'max-content' }}
          >
            {doubled.map((name, i) => (
              <span
                key={i}
                className="mx-7 font-display font-black sm:mx-8"
                style={{
                  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                  letterSpacing: '-0.02em',
                  color: 'var(--bridge-text)',
                  opacity: 0.22 + (i % 4) * 0.06
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Outcomes panel */}
        <div
          className="overflow-hidden rounded-[1.75rem] p-6 sm:p-8 lg:p-10"
          style={{
            backgroundColor: 'var(--bridge-surface-raised)',
            boxShadow: '0 0 0 1px var(--bridge-border), 0 28px 72px -40px color-mix(in srgb, var(--bridge-text) 18%, transparent)'
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none mb-8 h-px w-full lg:mb-10"
            style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={triggered ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: EASE }}
            className="max-w-2xl"
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: 'var(--color-primary)' }}
            >
              Post-session outcomes
            </p>
            <h2
              className="mt-4 font-display font-black"
              style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.25rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                color: 'var(--bridge-text)'
              }}
            >
              What actually
              <br />
              happens{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-to, var(--color-primary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                after.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
              Self-reported by mentees within two weeks of their first session on mentorshipbridge — not vanity funnel metrics.
            </p>
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{
                color: 'var(--bridge-text-muted)',
                backgroundColor: 'var(--bridge-surface-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden />
              n = 1,200+ first sessions
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} triggered={triggered} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
