import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '01',
    chip: '"PM at a Series B"',
    time: '10 sec',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" strokeLinecap="round" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
    title: 'Tell us your goal',
    desc: 'Plain English. Our AI searches 2,400+ professionals and ranks the exact few most likely to move the needle.',
  },
  {
    num: '02',
    chip: '98% match · $60/session',
    time: '30 sec',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Pick your mentor',
    desc: 'Real bios, honest reviews, exact rates — all visible before you commit. No surprises.',
  },
  {
    num: '03',
    chip: 'Session confirmed ✓',
    time: '13 sec',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Book and get unstuck',
    desc: 'Real-time availability. Built-in video room. No Zoom links, no scheduling back-and-forth.',
  },
];

export default function HowItWorksSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const cards = containerRef.current.querySelectorAll('.hiw-card');
    
    gsap.fromTo(cards,
      { y: 60, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          once: true
        }
      }
    );
  }, []);

  return (
    <section id="how" ref={containerRef} className="relative py-24 sm:py-32 bg-[var(--bridge-canvas)]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4">How it works</p>
          <h2 className="font-display font-black leading-tight tracking-tight text-[var(--bridge-text)] text-4xl sm:text-5xl max-w-2xl">
            Three steps.<br />One hour. Real momentum.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={i} className="hiw-card group relative rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 transition-all hover:border-orange-500/30 hover:shadow-lg hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                {step.icon}
              </div>
              
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-display text-xs font-black text-orange-500">{step.num}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-faint)]">• {step.time}</span>
              </div>
              
              <h3 className="mb-3 text-xl font-bold text-[var(--bridge-text)]">{step.title}</h3>
              <p className="text-sm text-[var(--bridge-text-muted)] leading-relaxed">{step.desc}</p>
              
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--bridge-text-secondary)]">
                {step.chip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
