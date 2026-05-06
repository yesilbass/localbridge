import { useState, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePerfTier } from './landingHooks';

const LETTERS = ['B', 'R', 'I', 'D', 'G', 'E'];

// Deterministic entry vectors for each letter (no Math.random so SSR-safe)
const VECTORS = [
  { lx: '-260px', ly: '-110px', rx:  '65deg', ry: '-85deg' },
  { lx:  '230px', ly: '-150px', rx: '-55deg', ry:  '75deg' },
  { lx:  '-55px', ly:  '190px', rx:  '85deg', ry: '-38deg' },
  { lx:  '190px', ly:  '130px', rx: '-75deg', ry: '-100deg'},
  { lx: '-260px', ly:   '75px', rx:  '48deg', ry:  '115deg'},
  { lx:  '240px', ly: '-190px', rx: '-95deg', ry:  '-55deg'},
];

// Warm-gold gradient used on the wordmark — hardcoded so it works even before
// LANDING_PALETTE_CSS vars are resolved.
const MOLTEN =
  'linear-gradient(90deg,#F97316 0%,#FB923C 20%,#FBBF24 40%,#FFF7ED 55%,#FBBF24 70%,#FB923C 85%,#F97316 100%)';

const CSS = `
  @keyframes brLetIn{
    0%  { opacity:0; transform:translate3d(var(--lx),var(--ly),0) scale(0.18) rotate(var(--rx,0)); filter:blur(18px); }
    55% { opacity:1; filter:blur(3px); }
    80% { transform:translate3d(0,0,0) scale(1.05) rotate(0deg); filter:blur(0); }
    100%{ opacity:1; transform:translate3d(0,0,0) scale(1) rotate(0deg); filter:blur(0); }
  }
  @keyframes brAccIn{
    0%  { transform:scaleX(0); opacity:0; }
    100%{ transform:scaleX(1); opacity:1; }
  }
  @keyframes brTagIn{
    0%  { opacity:0; transform:translateY(12px); }
    100%{ opacity:1; transform:translateY(0); }
  }
  @keyframes brFadeIn{
    0%  { opacity:0; }
    100%{ opacity:1; }
  }
  @keyframes brGold{
    0%,100%{ background-position:0% 50%; }
    50%    { background-position:100% 50%; }
  }
  @media(prefers-reduced-motion:reduce){
    *{ animation-duration:0.01ms!important; animation-iteration-count:1!important; }
  }
`;

// Durations per tier (ms)
const TOTAL  = { high: 2000, mid: 1200, low: 550 };
// When exit animation begins (ms before total ends)
const EXIT_D = { high:  420, mid:  360, low: 280 };

export default function IntroLoader() {
  const tier  = usePerfTier();
  const isLow = tier === 'low';
  const isMid = tier === 'mid';

  const totalMs  = TOTAL[tier];
  const exitMs   = EXIT_D[tier];

  const [done,    setDone]    = useState(false);
  const [exiting, setExiting] = useState(false);
  // mounted is set synchronously via useLayoutEffect so the overlay renders
  // on the very first paint — no flash of page content before the intro.
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem('bridge_intro_seen') === '1') setDone(true);
    } catch {
      // Private browsing / storage blocked → skip intro
      setDone(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || done) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const finish = () => {
      try { sessionStorage.setItem('bridge_intro_seen', '1'); } catch {}
      document.body.style.overflow = prevOverflow;
      setDone(true);
    };

    const exitTimer = setTimeout(() => setExiting(true), totalMs - exitMs);
    const doneTimer = setTimeout(finish, totalMs);

    const onKey = () => skip();
    window.addEventListener('keydown', onKey, { once: true });

    function skip() {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      setExiting(true);
      setTimeout(finish, exitMs);
    }

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, done, totalMs, exitMs]);

  if (!mounted || done) return null;

  function dismiss() {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      try { sessionStorage.setItem('bridge_intro_seen', '1'); } catch {}
      document.body.style.overflow = '';
      setDone(true);
    }, exitMs);
  }

  // Stagger delays for each letter entrance
  const letterDelay = (i) => (isLow ? 0 : isMid ? 0.06 : 0.08) * i + (isLow ? 0.05 : 0.12);

  return createPortal(
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[10000] cursor-pointer select-none overflow-hidden"
      style={{
        opacity:    exiting ? 0 : 1,
        transform:  exiting ? 'scale(1.05)' : 'scale(1)',
        transition: exiting
          ? `opacity ${exitMs}ms cubic-bezier(0.65,0,0.35,1), transform ${exitMs}ms cubic-bezier(0.65,0,0.35,1)`
          : 'none',
        willChange: exiting ? 'opacity,transform' : 'auto',
      }}
    >
      <style>{CSS}</style>

      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 130% 100% at 50% 55%, #1a0c05 0%, #0a0402 50%, #000 100%)' }}
      />

      {/* Ambient glows — high tier only, skipped on low/mid for performance */}
      {!isLow && !isMid && (
        <>
          <div aria-hidden className="absolute pointer-events-none rounded-full" style={{
            left: '22%', top: '28%', width: '52vmin', height: '52vmin',
            background: 'radial-gradient(circle, rgba(249,115,22,0.28) 0%, transparent 65%)',
            filter: 'blur(48px)',
            animation: 'brFadeIn 1s ease-out 0.1s both',
          }} />
          <div aria-hidden className="absolute pointer-events-none rounded-full" style={{
            left: '60%', top: '48%', width: '42vmin', height: '42vmin',
            background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 65%)',
            filter: 'blur(48px)',
            animation: 'brFadeIn 1s ease-out 0.2s both',
          }} />
        </>
      )}

      {/* Vignette */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 75% at 50% 50%, transparent 30%, rgba(0,0,0,0.90) 100%)',
      }} />

      {/* Center stage */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        {/* Wordmark */}
        {isLow ? (
          // Low-tier: single element, no 3D, simple fade
          <p
            className="font-display font-black"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              letterSpacing: '-0.045em',
              background: MOLTEN,
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'brFadeIn 0.35s ease-out both',
            }}
          >
            BRIDGE
          </p>
        ) : isMid ? (
          // Mid-tier: single element with subtle gold shimmer
          <p
            className="font-display font-black"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              letterSpacing: '-0.045em',
              background: MOLTEN,
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'brFadeIn 0.45s cubic-bezier(0.22,1,0.36,1) 0.08s both, brGold 3s ease-in-out infinite',
            }}
          >
            BRIDGE
          </p>
        ) : (
          // High-tier: individual 3D letter entrance
          <div
            className="flex items-baseline font-display font-black"
            style={{
              fontSize: 'clamp(3.2rem, 8vw, 6.2rem)',
              letterSpacing: '-0.045em',
              perspective: '1400px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {LETTERS.map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  background: MOLTEN,
                  backgroundSize: '300% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  opacity: 0,
                  '--lx': VECTORS[i].lx,
                  '--ly': VECTORS[i].ly,
                  '--rx': VECTORS[i].rx,
                  filter: 'drop-shadow(0 0 14px rgba(249,115,22,0.40))',
                  animation: `brLetIn 0.75s cubic-bezier(0.22,1,0.36,1) ${letterDelay(i)}s forwards, brGold 3.2s ease-in-out ${0.7}s infinite`,
                  willChange: 'transform,opacity',
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        )}

        {/* Underline accent — mid and high only */}
        {!isLow && (
          <div
            aria-hidden
            style={{
              height: '1.5px',
              width: 'clamp(110px, 17vw, 190px)',
              background: 'rgba(255,255,255,0.04)',
              marginTop: '1.4rem',
              overflow: 'hidden',
            }}
          >
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.9) 25%, rgba(255,247,237,0.95) 50%, rgba(251,191,36,0.85) 75%, transparent)',
              transformOrigin: 'left',
              transform: 'scaleX(0)',
              opacity: 0,
              animation: `brAccIn 0.55s cubic-bezier(0.22,1,0.36,1) ${isMid ? 0.38 : 0.62}s forwards`,
            }} />
          </div>
        )}

        {/* Tagline — high tier only */}
        {!isLow && !isMid && (
          <div
            style={{
              marginTop: '1.1rem',
              padding: '0.45rem 1.1rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              opacity: 0,
              animation: 'brTagIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.82s forwards',
            }}
          >
            <p
              className="text-center font-display font-semibold uppercase"
              style={{
                fontSize: 'clamp(0.5rem, 0.85vw, 0.62rem)',
                letterSpacing: '0.40em',
                color: 'rgba(255,255,255,0.58)',
              }}
            >
              Mentorship · Networking · Outcomes
            </p>
          </div>
        )}

        {/* Skip hint */}
        <p
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '2rem',
            opacity: 0,
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 600,
            animation: `brFadeIn 0.5s ease-out ${isLow ? 0.18 : isMid ? 0.45 : 0.95}s both`,
          }}
        >
          Click to skip
        </p>
      </div>
    </div>,
    document.body
  );
}
