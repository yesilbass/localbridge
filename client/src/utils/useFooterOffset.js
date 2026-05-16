import { useEffect, useRef } from 'react';

/**
 * Keeps a fixed-position element above the footer.
 *
 * Problems with the naïve scroll-listener approach:
 *  1. On initial mount, page content hasn't loaded yet → body is short →
 *     footer is already in the viewport → overlap is huge → FAB flies to top.
 *  2. Fast scroll jank: a single rAF fires up to 16 ms late while the footer
 *     is partially in view, causing the button to visibly lag upward.
 *  3. No ResizeObserver → when async content inflates the page the FAB never
 *     recalculates.
 *
 * Fixes:
 *  – Guard: only apply footer avoidance when the page is actually taller than
 *    the viewport (content has loaded). While the page is short, sit at base.
 *  – Defer initial calc by one tick so React has committed all children.
 *  – ResizeObserver on <body> and <footer> recalculates on any layout change.
 *  – Scroll listener still deduplicates via rAF (no change there).
 */
export function useFooterOffset(base = 24) {
  const ref = useRef(null);

  useEffect(() => {
    let rafId = null;

    const update = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;

      // If the page is not yet taller than the viewport (content still loading),
      // just stay at the default position — don't react to the footer being on
      // screen because it will move once real content renders.
      if (document.body.scrollHeight <= window.innerHeight + 4) {
        el.style.bottom = `${base}px`;
        return;
      }

      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      const overlap = Math.max(0, window.innerHeight - footerTop);
      el.style.bottom = `${base + overlap}px`;
    };

    const scheduleUpdate = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    // Re-run whenever any layout changes (content load, route change, etc.)
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(document.body);
    const footer = document.querySelector('footer');
    if (footer) ro.observe(footer);

    // Defer initial call by one tick so all children have mounted.
    const t = setTimeout(scheduleUpdate, 0);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      ro.disconnect();
      clearTimeout(t);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [base]);

  return ref;
}
