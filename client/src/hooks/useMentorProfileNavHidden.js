import { useState, useEffect } from 'react';

/** Visible at page top; stays hidden once scrolled past — never re-shows on scroll-up mid-page. */
export function useMentorProfileNavHidden(enabled, topThreshold = 48) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return undefined;
    }

    let frame = 0;

    const update = () => {
      setHidden(Math.max(window.scrollY, 0) > topThreshold);
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, topThreshold]);

  return hidden;
}
