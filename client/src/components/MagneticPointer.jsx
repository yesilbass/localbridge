import { useEffect } from 'react';

/**
 * Global pointer-driven interactions (cheap, passive, respects reduced-motion):
 *  - Any element with `data-tilt` gets a 3D tilt that follows the cursor.
 *  - Any element with `data-magnet` gets a small magnetic pull toward the cursor.
 *  - Any element with `data-cursor-glow` gets a CSS-var (--mx, --my) set on hover
 *    so it can render a cursor-following radial gradient.
 */
export default function MagneticPointer() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tiltTargets = new WeakMap();

    function onMove(e) {
      const t = e.target.closest?.('[data-tilt], [data-magnet], [data-cursor-glow]');
      if (!t) return;
      const r = t.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width; // 0..1
      const relY = (e.clientY - r.top) / r.height;
      const dx = relX - 0.5; // -0.5..0.5
      const dy = relY - 0.5;

      if (t.matches('[data-tilt]')) {
        const max = Number(t.getAttribute('data-tilt')) || 6; // deg
        const rotY = dx * max;
        const rotX = -dy * max;
        t.style.setProperty('--tilt-x', `${rotX.toFixed(2)}deg`);
        t.style.setProperty('--tilt-y', `${rotY.toFixed(2)}deg`);
        tiltTargets.set(t, true);
      }

      if (t.matches('[data-magnet]')) {
        const max = Number(t.getAttribute('data-magnet')) || 8; // px
        t.style.setProperty('--mag-x', `${(dx * 2 * max).toFixed(2)}px`);
        t.style.setProperty('--mag-y', `${(dy * 2 * max).toFixed(2)}px`);
      }

      if (t.matches('[data-cursor-glow]')) {
        t.style.setProperty('--mx', `${(relX * 100).toFixed(1)}%`);
        t.style.setProperty('--my', `${(relY * 100).toFixed(1)}%`);
      }
    }

    function onLeave(e) {
      const t = e.target.closest?.('[data-tilt], [data-magnet]');
      if (!t) return;
      if (t.matches('[data-tilt]')) {
        t.style.setProperty('--tilt-x', '0deg');
        t.style.setProperty('--tilt-y', '0deg');
      }
      if (t.matches('[data-magnet]')) {
        t.style.setProperty('--mag-x', '0px');
        t.style.setProperty('--mag-y', '0px');
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave, true);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onLeave, true);
    };
  }, []);

  return null;
}
