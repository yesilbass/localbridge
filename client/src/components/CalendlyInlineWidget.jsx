import { useEffect, useMemo, useRef, useState } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';

function readCssVarColor(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw.replace('#', '');
  // Convert rgb()/oklch() etc. into hex via canvas
  try {
    const c = document.createElement('canvas').getContext('2d');
    c.fillStyle = raw;
    const computed = c.fillStyle;
    if (/^#([0-9a-f]{6})$/i.test(computed)) return computed.replace('#', '');
  } catch { /* fall back */ }
  return fallback;
}

function usePageSettings() {
  return useMemo(() => ({
    backgroundColor: readCssVarColor('--bridge-surface', 'ffffff'),
    primaryColor: readCssVarColor('--color-primary', 'f97316'),
    textColor: readCssVarColor('--bridge-text', '0c0a09'),
    hideEventTypeDetails: false,
    hideLandingPageDetails: true,
    hideGdprBanner: true,
  }), []);
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      : false
  ));
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function Skeleton({ minHeight, reduced }) {
  return (
    <div
      aria-hidden
      className="rounded-3xl"
      style={{
        minHeight,
        background: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!reduced && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(110deg, transparent 30%, color-mix(in srgb, var(--bridge-text) 6%, transparent) 50%, transparent 70%)',
            animation: 'bridge-shimmer 1.6s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      )}
    </div>
  );
}

function Listener({ onScheduled }) {
  useCalendlyEventListener({
    onEventScheduled: (e) => {
      try { onScheduled?.(e?.data?.payload ?? null); } catch { /* swallow */ }
    },
  });
  return null;
}

export default function CalendlyInlineWidget({
  url,
  prefill,
  utm,
  onScheduled,
  minHeight = 720,
}) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const pageSettings = usePageSettings();

  useEffect(() => {
    if (visible) return;
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: '200px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 24px 48px -24px rgba(0,0,0,0.18)',
        minHeight,
      }}
    >
      {!visible || !url ? (
        <Skeleton minHeight={minHeight} reduced={reduced} />
      ) : (
        <>
          <Listener onScheduled={onScheduled} />
          <InlineWidget
            url={url}
            prefill={prefill}
            utm={utm}
            pageSettings={pageSettings}
            styles={{ height: `${minHeight}px`, minWidth: '320px' }}
          />
        </>
      )}
    </div>
  );
}
