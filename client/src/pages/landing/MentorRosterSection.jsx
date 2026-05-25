import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { ALL_MENTORS } from './landingData';

const TONE_GRAD = {
  amber:   'linear-gradient(135deg,#4F46E5 0%,#818CF8 100%)',
  emerald: 'linear-gradient(135deg,#059669 0%,#34d399 100%)',
  sky:     'linear-gradient(135deg,#0EA5E9 0%,#38BDF8 100%)',
  rose:    'linear-gradient(135deg,#6D28D9 0%,#C084FC 100%)',
  violet:  'linear-gradient(135deg,#5B21B6 0%,#A78BFA 100%)',
  teal:    'linear-gradient(135deg,#0D9488 0%,#2dd4bf 100%)',
  orange:  'linear-gradient(135deg,#4338CA 0%,#6366F1 100%)',
  pink:    'linear-gradient(135deg,#312E81 0%,#818CF8 100%)'
};

// Same layout positions as the original orbs — top row + bottom row
const CARD_LAYOUT = [
  { x:  2,  y:  5,  anim: 'a', dur: 4.2, delay:  0   },
  { x: 16,  y:  2,  anim: 'b', dur: 3.8, delay: -1.2 },
  { x: 32,  y:  7,  anim: 'c', dur: 5.0, delay: -0.6 },
  { x: 50,  y:  2,  anim: 'a', dur: 4.5, delay: -1.8 },
  { x: 66,  y:  8,  anim: 'b', dur: 3.6, delay: -0.4 },
  { x: 81,  y:  3,  anim: 'c', dur: 4.8, delay: -2.1 },
  { x:  1,  y: 65,  anim: 'b', dur: 4.0, delay: -1.0 },
  { x: 18,  y: 72,  anim: 'c', dur: 3.7, delay: -2.4 },
  { x: 35,  y: 67,  anim: 'a', dur: 4.6, delay: -0.8 },
  { x: 54,  y: 71,  anim: 'b', dur: 5.2, delay: -1.6 },
  { x: 70,  y: 66,  anim: 'c', dur: 4.1, delay: -0.3 },
  { x: 83,  y: 73,  anim: 'a', dur: 3.9, delay: -2.7 },
];

const FLOAT_CSS = `
@keyframes gfloat-a { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-7px,0)} }
@keyframes gfloat-b { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-5px,0)} }
@keyframes gfloat-c { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-9px,0)} }
`;

function initials(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function MentorCard({ mentor, layout, index, triggered, animActive }) {
  const { x, y, anim, dur, delay } = layout;
  const grad = TONE_GRAD[mentor.tone] || TONE_GRAD.amber;

  return (
    <AppLink
      to={`/mentors/${mentor.id}`}
      aria-hidden="true"
      tabIndex={-1}
      className="absolute"
      style={{
        left: `${x}%`,
        top:  `${y}%`,
        opacity: triggered ? 1 : 0,
        transform: triggered ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.65s ease ${index * 55}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${index * 55}ms`,
        textDecoration: 'none',
        zIndex: 1
      }}
    >
      <div
        className={animActive ? '' : 'lp-anim-paused'}
        style={{
        animation: triggered && animActive ? `gfloat-${anim} ${dur}s ${delay}s ease-in-out infinite` : 'none'
      }}>
        <div
          style={{
            width: 168,
            background: 'var(--bridge-surface)',
            border: '1px solid var(--bridge-border)',
            borderRadius: 14,
            padding: '12px 14px',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.10)'
          }}
        >
          {/* Avatar + name row */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-white"
              style={{ background: grad, fontSize: 10.5, letterSpacing: '-0.04em' }}
              aria-hidden
            >
              {initials(mentor.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold" style={{ fontSize: 11.5, color: 'var(--bridge-text)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {mentor.name}
              </p>
              <p className="truncate" style={{ fontSize: 10, color: 'var(--bridge-text-muted)', marginTop: 1 }}>
                {mentor.title}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={9}
                  fill={i < Math.round(mentor.rating) ? 'var(--color-primary)' : 'none'}
                  stroke={i < Math.round(mentor.rating) ? 'var(--color-primary)' : 'var(--bridge-border-strong)'}
                />
              ))}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--bridge-text)' }}>{mentor.rating.toFixed(1)}</span>
            {mentor.online && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-label="Online" />
            )}
          </div>

          {/* Tag */}
          <div className="mt-2">
            <span style={{
              fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
              background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)',
              border: '1px solid var(--bridge-border)'
            }}>
              {mentor.tags[0]}
            </span>
          </div>
        </div>
      </div>
    </AppLink>
  );
}

export default function MentorRosterSection() {
  const sectionRef = useRef(null);
  const [triggered, setTriggered] = useState(false);
  const [animActive, setAnimActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setAnimActive(entry.isIntersecting);
        if (entry.isIntersecting) setTriggered(true);
      },
      { threshold: 0.05, rootMargin: '120px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const mentors = ALL_MENTORS.slice(0, 12);

  return (
    <section
      ref={sectionRef}
      id="roster"
      aria-labelledby="roster-heading"
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--bridge-canvas)', minHeight: 580 }}
    >
      <style>{FLOAT_CSS}</style>

      {/* Ambient tint */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-0 h-[45%] w-[40%] rounded-full lp-anim-layer"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 72%)' }} />
        <div className="absolute right-[5%] bottom-0 h-[40%] w-[38%] rounded-full lp-anim-layer"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 60%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 72%)' }} />
      </div>

      {/* Floating mentor cards */}
      <div className="absolute inset-0">
        {mentors.map((mentor, i) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            layout={CARD_LAYOUT[i]}
            index={i}
            triggered={triggered}
            animActive={animActive}
          />
        ))}
      </div>

      {/* CTA — centered */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-5 py-32 text-center sm:px-8"
        style={{ minHeight: 580 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={triggered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-5 text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}>
            The Roster
          </p>
          <h2
            id="roster-heading"
            className="font-display font-black"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.9rem)', lineHeight: 1.0, letterSpacing: '-0.04em', color: 'var(--bridge-text)' }}
          >
            Every mentor.<br />
            <span style={{ color: 'var(--color-primary)' }}>One conversation away.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[26rem]"
            style={{ fontSize: 'clamp(0.88rem, 1.6vw, 1rem)', lineHeight: 1.68, color: 'var(--bridge-text-secondary)' }}>
            Every mentor is hand-reviewed — real role, real company, real outcomes.
          </p>
        </motion.div>

        <motion.div
          className="mt-9"
          initial={{ opacity: 0, y: 14 }}
          animate={triggered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <AppLink
            to="/mentors"
            className="group inline-flex items-center gap-2 rounded-full font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              fontSize: 15.5,
              padding: '14px 32px',
              boxShadow: '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
          >
            Find your mentor
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </AppLink>
        </motion.div>

        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          initial={{ opacity: 0 }}
          animate={triggered ? { opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.52 }}
        >
          <p className="text-[11px] font-medium" style={{ color: 'var(--bridge-text-faint)' }}>
            Cancel any time
          </p>
        </motion.div>
      </div>
    </section>
  );
}
