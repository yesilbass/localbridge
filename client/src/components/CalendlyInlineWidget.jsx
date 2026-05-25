import { useCallback, useEffect, useRef, useState } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';

function readCssVarColor(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw.replace('#', '');
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = raw;
    const computed = ctx.fillStyle;
    if (/^#([0-9a-f]{6})$/i.test(computed)) return computed.replace('#', '');
    if (/^#([0-9a-f]{3})$/i.test(computed)) {
      const [, r, g, b] = computed.match(/^#(.)(.)(.)$/i) || [];
      if (r && g && b) return `${r}${r}${g}${g}${b}${b}`;
    }
  } catch { /* fall back */ }
  return fallback;
}

function buildPageSettings() {
  return {
    backgroundColor: readCssVarColor('--bridge-surface', 'ffffff'),
    primaryColor: readCssVarColor('--color-primary', 'f97316'),
    textColor: readCssVarColor('--bridge-text', '0c0a09'),
    hideEventTypeDetails: false,
    hideLandingPageDetails: true,
    hideGdprBanner: true,
  };
}

function usePageSettings() {
  const [pageSettings, setPageSettings] = useState(buildPageSettings);

  useEffect(() => {
    const refresh = () => setPageSettings(buildPageSettings());
    window.addEventListener('bridge-theme-change', refresh);
    const obs = new MutationObserver(refresh);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-palette'],
    });
    return () => {
      window.removeEventListener('bridge-theme-change', refresh);
      obs.disconnect();
    };
  }, []);

  return pageSettings;
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
  const [widgetHeight, setWidgetHeight] = useState(minHeight);
  const reduced = useReducedMotion();
  const pageSettings = usePageSettings();
  const surfaceHex = pageSettings.backgroundColor;

  useEffect(() => {
    setWidgetHeight(minHeight);
  }, [url, minHeight]);

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

  const onCalendlyMessage = useCallback((event) => {
    if (event.origin !== 'https://calendly.com') return;
    if (event.data?.event !== 'calendly.page_height') return;
    const next = Number(event.data?.payload?.height);
    if (!Number.isFinite(next) || next <= 0) return;
    setWidgetHeight(Math.max(Math.ceil(next), 420));
  }, []);

  useEffect(() => {
    window.addEventListener('message', onCalendlyMessage);
    return () => window.removeEventListener('message', onCalendlyMessage);
  }, [onCalendlyMessage]);

  return (
    <div
      ref={containerRef}
      className="bridge-calendly-shell relative overflow-hidden rounded-3xl"
      style={{
        backgroundColor: `#${surfaceHex}`,
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        height: widgetHeight,
        minHeight: widgetHeight,
      }}
    >
      {!visible || !url ? (
        <Skeleton minHeight={widgetHeight} reduced={reduced} />
      ) : (
        <>
          <Listener onScheduled={onScheduled} />
          <InlineWidget
            key={`${url}-${pageSettings.backgroundColor}-${pageSettings.primaryColor}-${pageSettings.textColor}`}
            url={url}
            prefill={prefill}
            utm={utm}
            pageSettings={pageSettings}
            styles={{ height: `${widgetHeight}px`, minWidth: '100%', width: '100%' }}
          />
        </>
      )}
    </div>
  );
}
