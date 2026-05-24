import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

const NOT_FIT = [
  "You want someone to validate decisions you've already made.",
  "You'd rather watch a course than think out loud with someone.",
  "You're collecting advice instead of acting on any of it.",
  "You think AI can replace a sharp person who's done it before.",
  "You want a playbook handed over, not a thinking partner.",
];

const GOOD_FIT = [
  "You're mid-move — a promotion, pivot, or fundraise — and the stakes feel real.",
  "You think better when you talk through problems with someone sharp.",
  "You want honest pushback, not polite encouragement.",
  "You've got momentum but aren't sure you're pointed in the right direction.",
  "You'd rather one great conversation than six months of slow figuring-out.",
];

export default function IsThisForYouSection() {
  const sectionRef = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="fit-heading"
      className="relative overflow-hidden py-24 lg:py-32"
    >
      {/* Subtle ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full lp-anim-layer"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 72%)' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">

        {/* Heading */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={triggered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}>
            Honest take
          </p>
          <h2
            id="fit-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: 'var(--bridge-text)'
            }}
          >
            Is this for you?
          </h2>
        </motion.div>

        {/* Two-card layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Not a fit — dark card */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={triggered ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: 22,
              background: 'linear-gradient(160deg, var(--color-midnight) 0%, var(--color-midnight-raised) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '36px 36px 40px',
              boxShadow: '0 24px 60px -16px rgba(0,0,0,0.35)'
            }}
          >
            <p
              className="font-display font-black"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.025em', lineHeight: 1.25 }}
            >
              Probably not the right fit
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 6 }}>
              We'd rather be honest upfront.
            </p>
            <ul className="mt-8 flex flex-col gap-4" role="list">
              {NOT_FIT.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={triggered ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.18 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                    aria-hidden
                  >
                    <X size={11} strokeWidth={2.8} style={{ color: '#ef4444' }} />
                  </span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.58, color: 'rgba(255,255,255,0.62)' }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Good fit — light elevated card */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={triggered ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: 22,
              background: 'var(--bridge-surface)',
              border: '1px solid var(--bridge-border)',
              padding: '36px 36px 40px',
              boxShadow: '0 12px 40px -10px rgba(0,0,0,0.08)'
            }}
          >
            {/* Brand mark */}
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, #a78bfa))' }}
                aria-hidden
              >
                mb
              </div>
              <span className="text-[11px] font-black uppercase" style={{ letterSpacing: '0.18em', color: 'var(--bridge-text-muted)' }}>
                mentorshipbridge
              </span>
            </div>

            <p
              className="font-display font-black"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'var(--bridge-text)', letterSpacing: '-0.025em', lineHeight: 1.25 }}
            >
              You're going to love this
            </p>
            <p style={{ fontSize: 13, color: 'var(--bridge-text-muted)', marginTop: 6 }}>
              If any of these land, you're in the right place.
            </p>
            <ul className="mt-8 flex flex-col gap-4" role="list">
              {GOOD_FIT.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3.5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={triggered ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.26 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
                    aria-hidden
                  >
                    <Check size={11} strokeWidth={2.8} style={{ color: 'var(--color-primary)' }} />
                  </span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.58, color: 'var(--bridge-text-secondary)' }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
