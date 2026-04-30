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
.custom-cursor-dot{position:fixed;left:0;top:0;z-index:10001;width:6px;height:6px;border-radius:50%;background:rgba(234,88,12,.95);pointer-events:none;mix-blend-mode:plus-lighter;opacity:0;transition:opacity 240ms ease;will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%)}
.custom-cursor-dot.is-ready{opacity:1}
.custom-cursor-ring{position:fixed;left:0;top:0;z-index:10000;width:38px;height:38px;border-radius:50%;border:1.5px solid rgba(234,88,12,.55);pointer-events:none;opacity:0;transition:opacity 240ms ease,width 280ms cubic-bezier(.16,1,.3,1),height 280ms cubic-bezier(.16,1,.3,1),background 280ms ease,border-color 280ms ease;display:flex;align-items:center;justify-content:center;will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%);box-shadow:0 0 18px rgba(234,88,12,.18)}
.custom-cursor-ring.is-ready{opacity:1}
.custom-cursor-ring.cursor-active{width:74px;height:74px;background:rgba(234,88,12,.18);border-color:rgba(234,88,12,.85);box-shadow:0 0 32px rgba(234,88,12,.45)}
.custom-cursor-ring.cursor-press{transform-origin:center;width:30px;height:30px;background:rgba(234,88,12,.32);border-color:rgba(234,88,12,1)}
.custom-cursor-label{font-family:var(--font-display,sans-serif);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#fff;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 200ms ease}
.custom-cursor-ring.cursor-active .custom-cursor-label{opacity:1}
@media(hover:none){.custom-cursor-dot,.custom-cursor-ring{display:none}}
body:has(.custom-cursor-ring.is-ready){cursor:none}
body:has(.custom-cursor-ring.is-ready) a,body:has(.custom-cursor-ring.is-ready) button,body:has(.custom-cursor-ring.is-ready) [data-cursor]{cursor:none}
@media (prefers-reduced-motion: reduce){.custom-cursor-ring,.custom-cursor-dot{transition:opacity 200ms ease!important}}
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

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!ready) {
        ready = true;
        rx = mx;
        ry = my;
        dotEl.classList.add('is-ready');
        ringEl.classList.add('is-ready');
      }
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseenter', move, { passive: true });

    let id;
    const tick = () => {
      id = requestAnimationFrame(tick);
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      dotEl.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
      ringEl.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
    };
    id = requestAnimationFrame(tick);

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
      cancelAnimationFrame(id);
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
        <span ref={labelRef} className="custom-cursor-label" />
      </div>
    </>,
    document.body,
  );
}
