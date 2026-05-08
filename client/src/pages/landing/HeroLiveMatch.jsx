import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { MATCH_GOALS, findMentor } from './landingData';
import {
  EASE,
  DUR_SHORT,
  DUR_MED,
  STAGGER,
  usePerfTier,
} from './landingHooks';

const MATCHING_MS = 1500;
const RESULTS_MS  = 5000;

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

export default function HeroLiveMatch() {
  const reduced = useReducedMotion();
  const tier    = usePerfTier();
  const flat    = reduced || tier === 'low';

  const [status, setStatus]               = useState('matching');
  const [goalIndex, setGoalIndex]         = useState(0);
  const [isUserDriven, setIsUserDriven]   = useState(false);
  const [cycleComplete, setCycleComplete] = useState(false);

  const rootRef = useRef(null);

  // Single in-flight timer. We track when it started and how long it was meant
  // to run so we can freeze it on pause and resume with the remaining slice.
  const timerRef    = useRef(null);
  const startedAtRef = useRef(0);
  const durationRef  = useRef(0);
  const remainingRef = useRef(0);
  const onFireRef    = useRef(null);

  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const inViewRef  = useRef(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleTimer = useCallback((ms, onFire) => {
    clearTimer();
    onFireRef.current = onFire;
    durationRef.current = ms;
    remainingRef.current = ms;
    if (pausedRef.current) return;
    startedAtRef.current = performance.now();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onFireRef.current?.();
    }, ms);
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    if (timerRef.current) {
      const elapsed = performance.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, durationRef.current - elapsed);
      clearTimer();
    }
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    if (onFireRef.current && remainingRef.current > 0) {
      startedAtRef.current = performance.now();
      durationRef.current  = remainingRef.current;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        onFireRef.current?.();
      }, remainingRef.current);
    }
  }, []);

  // Visibility + intersection — combined into one pause flag.
  useEffect(() => {
    const onVis = () => {
      visibleRef.current = !document.hidden;
      if (!visibleRef.current || !inViewRef.current) pause(); else resume();
    };
    document.addEventListener('visibilitychange', onVis);

    const el = rootRef.current;
    let io;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          inViewRef.current = entry.isIntersecting;
          if (!visibleRef.current || !inViewRef.current) pause(); else resume();
        },
        { threshold: 0.15 }
      );
      io.observe(el);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    };
  }, [pause, resume]);

  // State machine — schedules the next transition every time status changes.
  useEffect(() => {
    if (status === 'matching') {
      scheduleTimer(MATCHING_MS, () => setStatus('results'));
      return;
    }

    // status === 'results'
    if (cycleComplete) {
      // Final resting state — no auto-advance.
      clearTimer();
      return;
    }

    scheduleTimer(RESULTS_MS, () => {
      const next = goalIndex + 1;
      if (next >= MATCH_GOALS.length) {
        // Cycle reaches the last goal — stay there.
        setCycleComplete(true);
        return;
      }
      setGoalIndex(next);
      setStatus('matching');
    });
  }, [status, goalIndex, cycleComplete, scheduleTimer, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleChipClick = useCallback((idx) => {
    setIsUserDriven(true);
    setCycleComplete(true);
    setGoalIndex(idx);
    setStatus('matching');
  }, []);

  const handleTryDifferent = useCallback(() => {
    setIsUserDriven(true);
    setCycleComplete(true);
    setStatus('matching');
  }, []);

  const goal = MATCH_GOALS[goalIndex];
  const mentors = useMemo(
    () => goal.mentorIds.map(findMentor).filter(Boolean),
    [goal]
  );

  return (
    <div
      ref={rootRef}
      data-hero-live-match
      className="relative w-full rounded-3xl p-7"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 30px 60px -28px color-mix(in srgb, var(--color-primary) 28%, transparent)',
        minHeight: 400,
      }}
    >
      <style>{`
        @media (min-width: 640px) { [data-hero-live-match] { min-height: 440px !important; } }
        @media (min-width: 1024px) { [data-hero-live-match] { min-height: 520px !important; } }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          aria-hidden="true"
          className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: '#10b981' }}
        />
        <p
          className="text-[12px] font-semibold uppercase"
          style={{ color: 'var(--bridge-text-faint)', letterSpacing: '0.18em' }}
        >
          Bridge Match
        </p>
        <p
          className="ml-auto text-[11px]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          live
        </p>
      </div>

      {/* Heading */}
      <p
        className="font-display font-black"
        style={{ fontSize: 18, color: 'var(--bridge-text)', letterSpacing: '-0.02em' }}
      >
        What do you want to figure out?
      </p>

      {/* Chip row */}
      <div className="mt-5 flex flex-wrap gap-2">
        {MATCH_GOALS.map((g, idx) => {
          const active = idx === goalIndex;
          return (
            <button
              key={g.chip}
              type="button"
              onClick={() => handleChipClick(idx)}
              className="px-3 py-2 rounded-full text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: active
                  ? 'var(--color-primary)'
                  : 'var(--bridge-surface-muted)',
                color: active
                  ? 'var(--color-on-primary)'
                  : 'var(--bridge-text-secondary)',
                boxShadow: active
                  ? 'inset 0 0 0 1px transparent'
                  : 'inset 0 0 0 1px var(--bridge-border)',
                transition: `background-color ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), color ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
                outlineColor: 'var(--color-primary)',
              }}
              onMouseEnter={(e) => {
                if (active) return;
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                if (active) return;
                e.currentTarget.style.backgroundColor = 'var(--bridge-surface-muted)';
                e.currentTarget.style.color = 'var(--bridge-text-secondary)';
              }}
            >
              {g.chip}
            </button>
          );
        })}
      </div>

      {/* Body — matching | results */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {status === 'matching' ? (
            <motion.div
              key="matching"
              initial={flat ? false : { opacity: 0 }}
              animate={flat ? undefined : { opacity: 1 }}
              exit={flat ? undefined : { opacity: 0 }}
              transition={{ duration: DUR_SHORT, ease: EASE }}
              className="flex flex-col items-center justify-center gap-4 py-10"
            >
              {flat ? (
                <Loader2
                  className="h-6 w-6"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2
                    className="h-6 w-6"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                </motion.div>
              )}
              <p
                className="text-[13px]"
                style={{ color: 'var(--bridge-text-muted)' }}
              >
                Matching against 2,400+ mentors…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={flat ? false : { opacity: 0 }}
              animate={flat ? undefined : { opacity: 1 }}
              exit={flat ? undefined : { opacity: 0 }}
              transition={{ duration: DUR_SHORT, ease: EASE }}
              className="flex flex-col gap-3"
            >
              {mentors.map((mentor, i) => (
                <ResultCard
                  key={mentor.id}
                  mentor={mentor}
                  index={i}
                  flat={flat}
                />
              ))}

              <button
                type="button"
                onClick={handleTryDifferent}
                className="self-start mt-2 text-[12px] font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
              >
                Try a different goal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mark isUserDriven referenced — used to keep cycleComplete sticky on user input. */}
      <span hidden aria-hidden="true">{isUserDriven ? '1' : '0'}</span>
    </div>
  );
}

function ResultCard({ mentor, index, flat }) {
  const motionProps = flat
    ? {}
    : {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: DUR_MED, delay: index * STAGGER, ease: EASE },
      };

  return (
    <motion.div {...motionProps}>
      <Link
        to={`/mentors/${mentor.id}`}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: 'var(--bridge-surface-muted)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          transition: `box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
          outlineColor: 'var(--color-primary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Avatar mentor={mentor} />
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-bold truncate"
            style={{ color: 'var(--bridge-text)' }}
          >
            {mentor.name}
          </p>
          <p
            className="text-[11px] truncate"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            {mentor.title} · {mentor.company}
          </p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p
            className="text-[14px] font-black"
            style={{
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            ${mentor.rate}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bridge-text-faint)' }}>
            / session
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function Avatar({ mentor }) {
  if (mentor.avatarUrl) {
    return (
      <img
        src={mentor.avatarUrl}
        alt={`${mentor.name}, ${mentor.title}`}
        width={40}
        height={40}
        loading="lazy"
        className="h-10 w-10 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
      style={{
        background: TONE_GRADIENTS[mentor.tone] || 'var(--color-primary)',
      }}
      aria-hidden="true"
    >
      {initialsOf(mentor.name)}
    </div>
  );
}
