import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function computePerfTier() {
  if (typeof window === 'undefined') return 'high';
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'low';
  const conn = navigator.connection || navigator.webkitConnection;
  if (conn?.saveData || /^(slow-2g|2g|3g)$/.test(conn?.effectiveType)) return 'low';
  const cores = navigator.hardwareConcurrency || 8;
  const mem   = navigator.deviceMemory || 8;
  if (mem <= 2 || cores <= 2) return 'low';
  if (mem <= 4 || cores <= 4 || window.innerWidth < 640) return 'mid';
  return 'high';
}

/**
 * BridgeGlobalAtmosphere — fixed ambient layer behind every route.
 * Aurora blobs are skipped on low-perf devices (mobile, slow CPUs, reduced-motion)
 * to avoid GPU thrash from large blurred animated gradients.
 */
export default function BridgeGlobalAtmosphere() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const [tier, setTier]   = useState(() => computePerfTier());
  const [paused, setPaused] = useState(typeof document !== 'undefined' ? document.hidden : false);

  useEffect(() => {
    setTier(computePerfTier());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq  = () => setTier(computePerfTier());
    const onVis = () => setPaused(document.hidden);
    mq.addEventListener?.('change', onMq);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      mq.removeEventListener?.('change', onMq);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const playState = paused ? 'paused' : 'running';
  const showAurora = tier !== 'low' && !isLanding;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {showAurora && (
        <>
          <div
            className="absolute left-[-20%] top-[-30%] h-[60vmax] w-[60vmax] rounded-full opacity-70 animate-bridge-aurora dark:opacity-90"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 22%, transparent), color-mix(in srgb, var(--color-primary-hover) 8%, transparent) 50%, transparent 72%)',
              filter: tier === 'high' ? 'blur(35px)' : 'blur(20px)',
              willChange: 'transform',
              animationPlayState: playState,
            }}
          />
          <div
            className="absolute right-[-25%] top-[8%] h-[55vmax] w-[55vmax] rounded-full opacity-60 dark:opacity-80"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary-hover) 20%, transparent), color-mix(in srgb, var(--color-primary-hover) 8%, transparent) 50%, transparent 72%)',
              filter: tier === 'high' ? 'blur(40px)' : 'blur(22px)',
              animation: 'bridge-aurora 28s ease-in-out infinite reverse',
              animationPlayState: playState,
            }}
          />
          {tier === 'high' && (
            <div
              className="absolute bottom-[-20%] left-[30%] h-[50vmax] w-[50vmax] rounded-full opacity-45 dark:opacity-70"
              style={{
                background:
                  'radial-gradient(closest-side, color-mix(in srgb, var(--color-secondary) 12%, transparent), color-mix(in srgb, var(--color-primary) 6%, transparent) 50%, transparent 70%)',
                filter: 'blur(35px)',
                animation: 'bridge-aurora 34s ease-in-out infinite',
                animationPlayState: playState,
              }}
            />
          )}
        </>
      )}

      <div className="absolute inset-0 bg-bridge-noise opacity-[0.05] dark:opacity-[0.1]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bridge-canvas)] to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent opacity-80" />
    </div>
  );
}
