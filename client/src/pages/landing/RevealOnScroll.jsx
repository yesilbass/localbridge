import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VARIANTS = {
  up:           { h: { y: 44 },                             v: { y: 0 } },
  down:         { h: { y: -44 },                            v: { y: 0 } },
  left:         { h: { x: -72 },                            v: { x: 0 } },
  right:        { h: { x: 72 },                             v: { x: 0 } },
  scale:        { h: { scale: 0.86 },                       v: { scale: 1 } },
  flip:         { h: { rotationX: -30, scale: 0.96, transformPerspective: 900 }, v: { rotationX: 0, scale: 1, transformPerspective: 900 } },
  'flip-right': { h: { rotationY: -24, x: -40, transformPerspective: 900 }, v: { rotationY: 0, x: 0, transformPerspective: 900 } },
  'flip-left':  { h: { rotationY: 24, x: 40, transformPerspective: 900 },   v: { rotationY: 0, x: 0, transformPerspective: 900 } },
  zoom:         { h: { scale: 0.78, y: 30 },                v: { scale: 1, y: 0 } },
};

export default function RevealOnScroll({
  children,
  delay   = 0,
  className = '',
  variant = 'up',
  duration = 900,
}) {
  const r = useRef(null);

  useEffect(() => {
    const el = r.current;
    if (!el) return;
    
    const vt = VARIANTS[variant] || VARIANTS.up;

    // Convert duration from ms to seconds
    const durationSec = duration / 1000;
    const delaySec = delay / 1000;

    const anim = gsap.fromTo(el,
      { ...vt.h, opacity: 0 },
      {
        ...vt.v,
        opacity: 1,
        duration: durationSec,
        delay: delaySec,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );

    return () => {
      anim.kill();
    };
  }, [variant, delay, duration]);

  return (
    <div ref={r} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
