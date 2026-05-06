import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { Sparkles, ArrowRight, Star, Calendar, ShieldCheck } from 'lucide-react';

export default function HeroSection({ user, ready }) {
  const [firstLineComplete, setFirstLineComplete] = useState(false);
  const [heroDeployed, setHeroDeployed] = useState(false);

  const flyRestState = {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    filter: 'blur(0px)',
  };

  const flyTransition = {
    type: 'spring',
    stiffness: 92,
    damping: 15,
    mass: 0.82,
  };

  const flyIn = (from, delay = 0) => ({
    initial: from,
    animate: heroDeployed ? flyRestState : from,
    transition: { ...flyTransition, delay },
  });

  const eyebrowFly = flyIn(
    { opacity: 0, x: -150, y: -18, rotate: -4, scale: 0.92, filter: 'blur(14px)' },
    0.04,
  );
  const taglineFly = flyIn(
    { opacity: 0, x: -86, y: 38, rotate: -3, scale: 0.96, filter: 'blur(12px)' },
    0.08,
  );
  const copyFly = flyIn(
    { opacity: 0, x: -180, y: 34, rotate: -2, scale: 0.96, filter: 'blur(16px)' },
    0.2,
  );
  const ctaFly = flyIn(
    { opacity: 0, x: -42, y: 128, rotate: 3, scale: 0.9, filter: 'blur(16px)' },
    0.32,
  );
  const trustFly = flyIn(
    { opacity: 0, x: 44, y: 118, rotate: 2.5, scale: 0.92, filter: 'blur(14px)' },
    0.44,
  );
  const cardFly = flyIn(
    { opacity: 0, x: 260, y: 54, rotate: 7, rotateY: -16, scale: 0.86, filter: 'blur(18px)' },
    0.16,
  );

  return (
    <section className="relative flex min-h-[94vh] items-center overflow-hidden px-5 pt-28 pb-24 sm:px-8 lg:pt-36">
      {/* Soft vignette overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 35%, transparent 0%, var(--bridge-canvas) 90%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
        {/* ── Left: copy ─────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          {/* Eyebrow / status pill */}
          <motion.div
            {...eyebrowFly}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
              color: 'var(--bridge-text-secondary)',
              boxShadow: '0 0 0 1px var(--bridge-border) inset, 0 4px 14px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span style={{ color: 'var(--bridge-text-muted)' }}>2,400+ vetted mentors live now</span>
            <span className="mx-0.5 h-3 w-px" style={{ backgroundColor: 'var(--bridge-border-strong)' }} />
            <span className="font-bold" style={{ color: 'var(--color-primary)' }}>YC-backed</span>
          </motion.div>

          {/* Headline */}
          <h1
            className="font-display font-black leading-[0.96] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(2.85rem, 7.6vw, 6rem)', color: 'var(--bridge-text)' }}
          >
            <TypingAnimation
              as="span"
              className="block min-h-[1em]"
              text="The fastest path"
              typeSpeed={42}
              delay={ready ? 180 : 999999}
              showCursor={!firstLineComplete}
              cursorClassName="text-[var(--color-primary)]"
              onComplete={() => setFirstLineComplete(true)}
            />
            <TypingAnimation
              as="span"
              className="block min-h-[1em] bg-clip-text text-transparent"
              text="to your next role."
              typeSpeed={42}
              delay={120}
              start={firstLineComplete}
              showCursor={!heroDeployed}
              cursorClassName="text-[var(--color-primary)]"
              onComplete={() => setHeroDeployed(true)}
              style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
            />
            <motion.span
              className="block pt-3 font-editorial italic font-normal"
              {...taglineFly}
              style={{
                fontSize: 'clamp(1.5rem, 3.4vw, 2.4rem)',
                color: 'color-mix(in srgb, var(--bridge-text) 60%, transparent)',
                letterSpacing: '-0.01em',
              }}
            >
              One conversation. Real outcomes.
            </motion.span>
          </h1>

          {/* Sub */}
          <motion.p
            {...copyFly}
            className="mt-7 max-w-xl text-base leading-relaxed sm:text-[17px] sm:leading-[1.65]"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Bridge connects ambitious professionals with mentors who&rsquo;ve already done the job.
            AI-matched in seconds. Booked in a click. No subscriptions, no packages — just one
            session that moves your career forward.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...ctaFly}
            className="mt-9 flex flex-col items-start gap-3.5 sm:flex-row sm:items-center"
          >
            <Link
              to={user ? '/mentors' : '/register'}
              className="lp-cta group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
              }}
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2">
                Get started — free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              to="/mentors"
              className="group inline-flex items-center gap-2 rounded-full px-4 py-3 text-[14px] font-semibold transition-colors"
              style={{
                color: 'var(--bridge-text-secondary)',
                boxShadow: '0 0 0 1px var(--bridge-border) inset',
              }}
            >
              Browse mentors
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            {...trustFly}
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            <Trust icon={<ShieldCheck className="h-3.5 w-3.5" />} text="No credit card" />
            <Trust icon={<Calendar className="h-3.5 w-3.5" />} text="Book in 60 seconds" />
            <Trust icon={<Star className="h-3.5 w-3.5" style={{ fill: 'currentColor' }} />} text={<><b style={{ color: 'var(--bridge-text)' }}>4.9</b>/5 across 4,800+ sessions</>} />
          </motion.div>
        </div>

        {/* ── Right: mentor preview card with floating chips ──────────── */}
        <motion.div
          initial={cardFly.initial}
          animate={heroDeployed ? flyRestState : cardFly.initial}
          transition={cardFly.transition}
          className="relative lg:col-span-5"
          style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
        >
          <HeroPreviewCard />
        </motion.div>
      </div>

      <style>{`
        @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .hero-float-a { animation: heroFloat 6.5s ease-in-out infinite; }
        .hero-float-b { animation: heroFloat 7.5s ease-in-out -2s infinite; }
        @keyframes heroTypeCursorBlink { 0%, 45% { opacity: 1; } 46%, 100% { opacity: 0; } }
        .animate-hero-type-cursor { animation: heroTypeCursorBlink 0.9s steps(1, end) infinite; }
      `}</style>
    </section>
  );
}

const motionElements = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  section: motion.section,
  span: motion.span,
};

function joinClassNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TypingAnimation({
  text = '',
  className,
  cursorClassName,
  typeSpeed = 100,
  delay = 0,
  as: Component = 'span',
  start = true,
  startOnView = true,
  showCursor = true,
  blinkCursor = true,
  cursorStyle = 'line',
  onComplete,
  ...props
}) {
  const MotionComponent = motionElements[Component] ?? motion.span;
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { amount: 0.3, once: true });
  const graphemes = useMemo(() => Array.from(text), [text]);
  const shouldStart = start && (startOnView ? isInView : true);

  useEffect(() => {
    if (!shouldStart || completed) return undefined;

    const timeoutDelay = delay > 0 && displayedText === '' ? delay : typeSpeed;
    const timeout = window.setTimeout(() => {
      if (currentCharIndex < graphemes.length) {
        setDisplayedText(graphemes.slice(0, currentCharIndex + 1).join(''));
        setCurrentCharIndex(currentCharIndex + 1);
        return;
      }

      setCompleted(true);
      onComplete?.();
    }, timeoutDelay);

    return () => window.clearTimeout(timeout);
  }, [completed, currentCharIndex, delay, displayedText, graphemes, onComplete, shouldStart, typeSpeed]);

  const cursorChar = cursorStyle === 'block' ? '▌' : cursorStyle === 'underscore' ? '_' : '|';
  const shouldShowCursor = showCursor && !completed;

  return (
    <MotionComponent
      ref={elementRef}
      className={joinClassNames(Component === 'span' && 'inline-block', className)}
      {...props}
    >
      {displayedText}
      {shouldShowCursor && (
        <span
          className={joinClassNames('inline-block', blinkCursor && 'animate-hero-type-cursor', cursorClassName)}
        >
          {cursorChar}
        </span>
      )}
    </MotionComponent>
  );
}

function Trust({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
            }}>
        {icon}
      </span>
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HeroPreviewCard — Mentor preview with floating AI-match + booked chips.
   ───────────────────────────────────────────────────────────────────────── */
function HeroPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* ambient glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2.25rem] blur-3xl"
        style={{
          background: 'radial-gradient(60% 60% at 50% 50%, color-mix(in srgb, var(--color-primary) 28%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* AI Match floating chip — top-left */}
      <div
        className="hero-float-a absolute -left-3 -top-7 z-20 inline-flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 backdrop-blur"
        style={{
          backgroundColor: 'var(--lp-chip-bg)',
          boxShadow: '0 18px 36px -12px rgba(0,0,0,0.5)',
          border: '1px solid var(--lp-chip-border)',
        }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from) 0%, var(--lp-grad-to) 100%)',
            color: '#FFFFFF',
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-white">98% AI Match</p>
          <p className="text-[10px] text-white/60">Maya · PM Strategy</p>
        </div>
      </div>

      {/* Session booked chip — top-right */}
      <div
        className="hero-float-b absolute -right-3 top-3 z-20 inline-flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 backdrop-blur"
        style={{
          backgroundColor: 'var(--lp-chip-bg)',
          boxShadow: '0 18px 36px -12px rgba(0,0,0,0.5)',
          border: '1px solid var(--lp-chip-border)',
        }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
          style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <Calendar className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-white">Session booked</p>
          <p className="text-[10px] text-white/60">Tomorrow · 2:00 PM</p>
        </div>
      </div>

      {/* Mentor card */}
      <div
        className="relative overflow-hidden rounded-3xl p-7"
        style={{ backgroundColor: 'var(--lp-card-bg)', boxShadow: 'var(--lp-card-shadow)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
          style={{ backgroundImage: 'var(--lp-card-glow)' }}
        />

        {/* Header */}
        <div className="relative flex items-center gap-3.5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-black"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from) 0%, var(--lp-grad-to) 100%)',
              color: '#FFFFFF',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.20) inset, 0 8px 24px -8px color-mix(in srgb, var(--color-primary) 50%, transparent)',
            }}
          >
            MC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold" style={{ color: 'var(--bridge-text)' }}>
              Maya Chen
            </p>
            <p className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
              Director of Product · Linear
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em]"
            style={{
              backgroundColor: 'color-mix(in srgb, #10b981 12%, transparent)',
              color: '#059669',
              boxShadow: '0 0 0 1px color-mix(in srgb, #10b981 30%, transparent) inset',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>

        {/* Skill chips */}
        <div className="relative mt-5 flex flex-wrap gap-1.5">
          {['PM Strategy', 'Frameworks', 'Roadmapping', 'OKRs'].map((t) => (
            <span
              key={t}
              className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
                boxShadow: '0 0 0 1px var(--bridge-border) inset',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div
          className="relative mt-6 grid grid-cols-3 rounded-2xl px-2 py-3.5"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: '0 0 0 1px var(--bridge-border) inset',
          }}
        >
          <Stat label="Rating" value={<span className="inline-flex items-center gap-1">4.9 <Star className="h-3 w-3" style={{ fill: '#F59E0B', color: '#F59E0B' }} /></span>} divider />
          <Stat label="Sessions" value="86" divider />
          <Stat label="Rate" value="$95/hr" />
        </div>

        {/* Mock CTA inside card */}
        <div
          className="relative mt-5 flex items-center justify-between rounded-xl px-3.5 py-2.5"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
            boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 24%, transparent) inset',
          }}
        >
          <div>
            <p className="text-[11px] font-bold" style={{ color: 'var(--bridge-text)' }}>Next available</p>
            <p className="text-[10.5px]" style={{ color: 'var(--bridge-text-muted)' }}>Today 4:30 PM · 60 min</p>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Book
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, divider }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-2"
      style={divider ? { borderRight: '1px solid var(--bridge-border)' } : undefined}
    >
      <p className="text-[14px] font-extrabold tabular-nums" style={{ color: 'var(--bridge-text)' }}>{value}</p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--bridge-text-muted)' }}>{label}</p>
    </div>
  );
}
