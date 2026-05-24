import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

const VIDEOS = [
  { name: 'Tyler N.',    company: 'Senior Engineer @ B2B SaaS',       tone: 'sky',
    quote: '"I didn\'t know what I was leaving on the table. Two sessions later, twenty percent over my last comp."',
    bg: 'linear-gradient(160deg,#0c2340 0%,#1a3a5c 40%,#0f2a45 100%)' },
  { name: 'Sofia C.',    company: 'Growth Lead @ SaaS Startup',        tone: 'violet',
    quote: '"Twenty minutes in, she spotted exactly what we were misreading in our funnel. 3× ROAS in eight weeks."',
    bg: 'linear-gradient(160deg,#1a0a2e 0%,#2d1055 40%,#1e0a3c 100%)' },
  { name: 'Jordan E.',   company: 'Staff Engineer @ Dev Tools',        tone: 'emerald',
    quote: '"Four years stuck at Senior. My mentor called out exactly what wasn\'t counting. Promoted next cycle."',
    bg: 'linear-gradient(160deg,#042a1a 0%,#065438 40%,#032016 100%)' },
  { name: 'Aisha R.',    company: 'Founder @ Climate Tech',            tone: 'rose',
    quote: '"Closed our seed round three months after our first session. The framing was exactly what we were missing."',
    bg: 'linear-gradient(160deg,#1e0a2e 0%,#3b1060 40%,#27083e 100%)' },
  { name: 'Marcus T.',   company: 'Engineering Manager @ E-commerce',  tone: 'teal',
    quote: '"IC → EM in one conversation. So specific to my situation it felt almost unfair."',
    bg: 'linear-gradient(160deg,#031e1e 0%,#073d3a 40%,#042828 100%)' },
  { name: 'Priya S.',    company: 'Product Manager @ Fintech',         tone: 'indigo',
    quote: '"One session with someone who made the exact same jump saved me six months of second-guessing."',
    bg: 'linear-gradient(160deg,#0f0e2a 0%,#1e1c4a 40%,#141230 100%)' },
  { name: 'Dev P.',      company: 'VP Engineering @ Series B',         tone: 'amber',
    quote: '"Real talk about managing boards, not just people. Nothing I could read anywhere gave me this."',
    bg: 'linear-gradient(160deg,#1a0f02 0%,#3a2206 40%,#251600 100%)' },
  { name: 'Rosa L.',     company: 'Data Scientist @ Health Tech',      tone: 'sky',
    quote: '"Academia → industry in eight weeks. She mapped exactly which skills transferred and which didn\'t."',
    bg: 'linear-gradient(160deg,#041830 0%,#0a3258 40%,#061e3a 100%)' },
  { name: 'Omar J.',     company: 'Founder @ B2B SaaS',                tone: 'violet',
    quote: '"Knew exactly where our pitch was failing before I finished explaining it. Closed the round the next month."',
    bg: 'linear-gradient(160deg,#160826 0%,#2a0e50 40%,#1c0a30 100%)' },
];

const ACCENT = {
  sky:     '#38bdf8', violet: '#a78bfa', emerald: '#34d399',
  rose:    '#c084fc', teal:   '#2dd4bf', indigo:  '#818cf8',
  amber:   'var(--color-primary)',
};

function ini(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function VideoCard({ v, index, revealed }) {
  const accent = ACCENT[v.tone] || '#818cf8';

  return (
    <motion.div
      initial={false}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.55, delay: revealed ? (index % 3) * 0.08 : 0, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden lp-anim-layer"
      style={{
        borderRadius: 14,
        background: v.bg,
        aspectRatio: '3/4',
        cursor: 'pointer',
      }}
    >
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '180px' }} />

      {/* Bottom gradient for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />

      {/* Top: play button + name */}
      <div className="absolute top-0 left-0 right-0 flex items-start gap-2.5 p-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.22)' }}
          aria-hidden
        >
          <Play size={12} fill="white" strokeWidth={0} style={{ marginLeft: 1 }} />
        </div>
        <div>
          <p className="font-bold text-white leading-tight" style={{ fontSize: 13, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            {v.name}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {v.company}
          </p>
        </div>
      </div>

      {/* Center: avatar (subtle) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full font-black text-white opacity-20 group-hover:opacity-30 transition-opacity duration-300"
          style={{ background: `${accent}30`, border: `2px solid ${accent}40`, fontSize: 22, letterSpacing: '-0.04em' }}
          aria-hidden
        >
          {ini(v.name)}
        </div>
      </div>

      {/* Bottom: quote */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p
          className="font-medium text-white"
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            textShadow: '0 1px 6px rgba(0,0,0,0.7)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {v.quote}
        </p>
      </div>
    </motion.div>
  );
}

export default function VideoTestimonialsSection() {
  const [showAll, setShowAll] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef(null);
  const visible = showAll ? VIDEOS : VIDEOS.slice(0, 6);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: '80px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      {/* Heading */}
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8 mb-12">
        <p className="text-[10px] font-black uppercase" style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}>
          Social proof
        </p>
        <h2
          id="testimonials-heading"
          className="mt-3 font-display font-black"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.9rem)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--bridge-text)' }}
        >
          The word on the street
        </h2>
        <p className="mt-4 mx-auto max-w-md" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--bridge-text-secondary)' }}>
          What people are saying about their sessions on mentorshipbridge.
        </p>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((v, i) => (
            <VideoCard key={v.name} v={v} index={i} revealed={revealed} />
          ))}
        </div>

        {/* Show more */}
        {!showAll && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="font-semibold transition-all duration-200"
              style={{
                fontSize: 14,
                padding: '12px 28px',
                borderRadius: 999,
                background: 'var(--bridge-surface)',
                border: '1px solid var(--bridge-border)',
                color: 'var(--bridge-text-secondary)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bridge-surface-muted)';
                e.currentTarget.style.color = 'var(--bridge-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bridge-surface)';
                e.currentTarget.style.color = 'var(--bridge-text-secondary)';
              }}
            >
              Show more reviews
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
