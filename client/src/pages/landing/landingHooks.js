import { useRef, useState, useEffect } from 'react';

export function useCountUp(target, duration = 1200) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setGo(true); obs.disconnect(); } },
      { threshold: 0.2, rootMargin: '50px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!go) return;
    let s = null;
    let frame = 0;
    const tick = (now) => {
      if (!s) s = now;
      const t = Math.min((now - s) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * e));
      if (t < 1) { frame = requestAnimationFrame(tick); }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [go, target, duration]);

  return [ref, val];
}

// Detects low-power devices so we can skip GPU-heavy effects (blurs, shimmers, big SVG, infinite anims).
// Tier: 'low' | 'mid' | 'high'.
export function usePerfTier() {
  const [tier, setTier] = useState(() => {
    if (typeof window === 'undefined') return 'high';
    return computeTier();
  });
  useEffect(() => {
    setTier(computeTier());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setTier(computeTier());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return tier;
}

function computeTier() {
  if (typeof window === 'undefined') return 'high';
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return 'low';
  const conn = navigator.connection || navigator.webkitConnection;
  if (conn?.saveData) return 'low';
  if (conn?.effectiveType && /^(slow-2g|2g|3g)$/.test(conn.effectiveType)) return 'low';
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const narrow = window.innerWidth < 640;
  if (mem <= 2 || cores <= 2) return 'low';
  if (mem <= 4 || cores <= 4 || (isMobile && narrow)) return 'mid';
  return 'high';
}

export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return p;
}
