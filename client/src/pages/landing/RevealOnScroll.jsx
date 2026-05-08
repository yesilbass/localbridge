import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VARIANTS = {
  up:           { h: { y: 40,  opacity: 0 },                                              v: { y: 0,  opacity: 1 } },
  down:         { h: { y: -40, opacity: 0 },                                              v: { y: 0,  opacity: 1 } },
  left:         { h: { x: -60, opacity: 0 },                                              v: { x: 0,  opacity: 1 } },
  right:        { h: { x:  60, opacity: 0 },                                              v: { x: 0,  opacity: 1 } },
  scale:        { h: { scale: 0.88, opacity: 0 },                                         v: { scale: 1, opacity: 1 } },
  flip:         { h: { rotationX: -26, scale: 0.96, opacity: 0, transformPerspective: 900 }, v: { rotationX: 0, scale: 1, opacity: 1 } },
  'flip-right': { h: { rotationY: -20, x: -36, opacity: 0, transformPerspective: 900 },  v: { rotationY: 0, x: 0, opacity: 1 } },
  'flip-left':  { h: { rotationY:  20, x:  36, opacity: 0, transformPerspective: 900 },  v: { rotationY: 0, x: 0, opacity: 1 } },
  zoom:         { h: { scale: 0.82, y: 24, opacity: 0 },                                  v: { scale: 1, y: 0, opacity: 1 } },
};

// WeakSet to track which elements have been fully revealed, so the safety
// timeout doesn't reset elements that GSAP already animated correctly.
const revealed = new WeakSet();

export default function RevealOnScroll({
  children,
  delay    = 0,
  className = '',
  variant  = 'up',
  duration = 1100,
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const vt = VARIANTS[variant] || VARIANTS.up;

    // Set the hidden state synchronously before the browser paints so there
    // is never a flash of visible content before the animation starts.
    gsap.set(el, vt.h);

    const anim = gsap.to(el, {
      ...vt.v,
      duration: duration / 1000,
      delay:    delay    / 1000,
      ease:     'power3.out',
      scrollTrigger: {
        trigger: el,
        start:   'top 83%',
        once:    true,
        onEnter: () => revealed.add(el),
      },
      onComplete: () => revealed.add(el),
    });

    // Safety net: force full visibility after 4 s + delay if GSAP hasn't
    // triggered yet (slow device, JS error, element never scrolled into view).
    const safety = setTimeout(() => {
      if (!revealed.has(el)) {
        gsap.set(el, { clearProps: 'all' });
        revealed.add(el);
      }
    }, 4000 + delay);

    return () => {
      clearTimeout(safety);
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [variant, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
