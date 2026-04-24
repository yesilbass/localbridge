import { useEffect } from 'react';

/**
 * Fixed scroll-progress bar across the top of the viewport.
 * Writes to CSS var --bridge-scroll-progress on <html>; the .bridge-scroll-progress
 * utility consumes it via transform: scaleX().
 */
export default function ScrollProgress() {
  useEffect(() => {
    let ticking = false;
    const root = document.documentElement;
    const update = () => {
      const h = root.scrollHeight - root.clientHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      root.style.setProperty('--bridge-scroll-progress', p.toString());
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div aria-hidden className="bridge-scroll-progress" />;
}
