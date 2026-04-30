/**
 * CustomCursor — drop-in animated mouse cursor.
 *
 * Self-contained: injects its own scoped CSS once on first mount.
 * Drop `<CustomCursor />` anywhere on a page to enable. Auto-disabled on
 * touch devices (`@media (hover: none)`).
 *
 * Optional cursor labels: add `data-cursor="Label"` (or `data-cursor="hover"`
 * for label-less expand) to any element to morph the ring on hover.
 *
 * Performance:
 *  - Single rAF loop, transform-only updates (no React state during animation).
 *  - Listeners mount once (empty dep array). No mouseout-hide (always visible).
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const STYLE_ID = 'bridge-custom-cursor-styles';
const CSS = `
.custom-cursor-dot{position:fixed;left:0;top:0;z-index:10001;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(234,88,12,.95);pointer-events:none;opacity:0;transition:opacity 240ms ease;will-change:transform;transform:translate3d(-100px,-100px,0);contain:layout style paint}
.custom-cursor-dot.is-ready{opacity:1}
.custom-cursor-ring{position:fixed;left:0;top:0;z-index:10000;width:38px;height:38px;margin:-19px 0 0 -19px;pointer-events:none;opacity:0;transition:opacity 240ms ease;will-change:transform;transform:translate3d(-100px,-100px,0);contain:layout style paint}
.custom-cursor-ring.is-ready{opacity:1}
.custom-cursor-ring-inner{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(234,88,12,.55);background:transparent;display:flex;align-items:center;justify-content:center;transform:scale(1);transition:transform 260ms cubic-bezier(.16,1,.3,1),background-color 220ms ease,border-color 220ms ease;will-change:transform}
.custom-cursor-ring.cursor-active .custom-cursor-ring-inner{transform:scale(1.95);background:rgba(234,88,12,.16);border-color:rgba(234,88,12,.85)}
.custom-cursor-ring.cursor-press .custom-cursor-ring-inner{transform:scale(0.78);background:rgba(234,88,12,.28);border-color:rgba(234,88,12,1)}
.custom-cursor-ring.cursor-active.cursor-press .custom-cursor-ring-inner{transform:scale(1.7)}
.custom-cursor-label{font-family:var(--font-display,sans-serif);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#fff;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 200ms ease;transform:scale(0.55);transform-origin:center}
.custom-cursor-ring.cursor-active .custom-cursor-label{opacity:1}
@media(hover:none){.custom-cursor-dot,.custom-cursor-ring{display:none}}
body:has(.custom-cursor-ring.is-ready){cursor:none}
body:has(.custom-cursor-ring.is-ready) a,body:has(.custom-cursor-ring.is-ready) button,body:has(.custom-cursor-ring.is-ready) [data-cursor]{cursor:none}
@media (prefers-reduced-motion: reduce){.custom-cursor-ring-inner{transition:none!important}}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover:none)').matches) return;
    ensureStyles();

    const dotEl = dot.current;
    const ringEl = ring.current;
    const labEl = labelRef.current;
    if (!dotEl || !ringEl) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let ready = false;
    let dirty = false;
    let id = 0;

    const tick = () => {
      const dx = mx - rx;
      const dy = my - ry;
      // Idle skip — once ring has caught up, stop the rAF loop until next move
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        rx = mx; ry = my;
        ringEl.style.transform = `translate3d(${rx}px,${ry}px,0)`;
        dirty = false;
        id = 0;
        return;
      }
      rx += dx * 0.22;
      ry += dy * 0.22;
      ringEl.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      id = requestAnimationFrame(tick);
    };

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      // Dot updates immediately (no easing) — directly in handler avoids waiting for rAF
      dotEl.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (!ready) {
        ready = true;
        rx = mx;
        ry = my;
        dotEl.classList.add('is-ready');
        ringEl.classList.add('is-ready');
      }
      if (!dirty) {
        dirty = true;
        if (!id) id = requestAnimationFrame(tick);
      }
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseenter', move, { passive: true });

    const onOver = (e) => {
      const t = e.target.closest?.('[data-cursor]');
      if (t) {
        ringEl.classList.add('cursor-active');
        const lab = t.getAttribute('data-cursor');
        if (labEl) labEl.textContent = lab && lab !== 'hover' ? lab : '';
      } else {
        ringEl.classList.remove('cursor-active');
        if (labEl) labEl.textContent = '';
      }
    };
    const onDown = () => ringEl.classList.add('cursor-press');
    const onUp = () => ringEl.classList.remove('cursor-press');

    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mousedown', onDown, { passive: true });
    document.addEventListener('mouseup', onUp, { passive: true });

    return () => {
      if (id) cancelAnimationFrame(id);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseenter', move);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div ref={dot} aria-hidden className="custom-cursor-dot" />
      <div ref={ring} aria-hidden className="custom-cursor-ring">
        <div className="custom-cursor-ring-inner">
          <span ref={labelRef} className="custom-cursor-label" />
        </div>
      </div>
    </>,
    document.body,
  );
}
