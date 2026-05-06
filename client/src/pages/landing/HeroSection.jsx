import { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import MagneticWrapper from './MagneticWrapper';

export default function HeroSection({ user, isDark, ready }) {
  const headRef = useRef(null);

  useEffect(() => {
    if (!ready || !headRef.current) return;
    const letters = headRef.current.querySelectorAll('.hero-letter');
    gsap.fromTo(letters, 
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, stagger: 0.02, ease: 'power3.out' }
    );
  }, [ready]);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[95vh] overflow-hidden text-center px-5 pt-32 pb-24 sm:px-8">
      {/* Dynamic ambient background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] rounded-full blur-[160px] opacity-30 animate-pulse ${isDark ? 'bg-gradient-to-b from-orange-500/20 to-amber-500/5' : 'bg-gradient-to-b from-orange-400/20 to-amber-300/5'}`} style={{ animationDuration: '8s' }} />
        <div className={`absolute inset-0 b-grid-drift opacity-20 ${isDark ? 'bg-[url("data:image/svg+xml,%3Csvg width=\'32\' height=\'32\' viewBox=\'0 0 32 32\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 32V0H32\' stroke=\'rgba(255,255,255,0.08)\' stroke-width=\'1\'/%3E%3C/svg%3E")]' : 'bg-[url("data:image/svg+xml,%3Csvg width=\'32\' height=\'32\' viewBox=\'0 0 32 32\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 32V0H32\' stroke=\'rgba(0,0,0,0.03)\' stroke-width=\'1\'/%3E%3C/svg%3E")]'}`} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Simple live badge */}
        <div className={`mb-10 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-sm ${isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-gray-200 bg-white/50 text-gray-600'}`}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          2,400+ vetted mentors ready
        </div>

        <div ref={headRef}>
          <h1 className={`font-display font-black leading-[1.02] tracking-[-0.03em] ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: 'clamp(3.5rem, min(9vw, 6.5rem), 6.5rem)' }}>
            <span className="hero-letter block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 pb-2">Get unstuck.</span>
            <span className="hero-letter block">Talk to someone</span>
            <span className="hero-letter block">who's been there.</span>
          </h1>
        </div>

        <p className={`mt-10 max-w-2xl text-lg sm:text-xl leading-relaxed animate-fade-in-up delay-300 opacity-0 fill-mode-forwards ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          Book a 1-on-1 with a vetted professional who's already held the exact role you're targeting. No packages, no cold DMs — just the right advice from the right person.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-5 animate-fade-in-up delay-500 opacity-0 fill-mode-forwards relative z-20">
          <Link
            to={user ? '/mentors' : '/register'}
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-8 py-4.5 text-[17px] font-bold text-white shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] transition-all duration-300 hover:bg-orange-600 hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.7)] hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
            <span className="relative z-10 flex items-center gap-2">
              Book your first session
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </span>
          </Link>
          <Link
            to="/mentors"
            className={`group inline-flex items-center justify-center gap-2 rounded-full border px-8 py-4.5 text-[17px] font-semibold transition-all duration-300 hover:-translate-y-1 ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20' : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'}`}
          >
            Browse mentors
          </Link>
        </div>

        <div className={`mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium animate-fade-in-up delay-700 opacity-0 fill-mode-forwards ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            No packages · pay per session
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            First session guaranteed
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Cancel anytime
          </span>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-700 { animation-delay: 700ms; }
        .fill-mode-forwards { animation-fill-mode: forwards; }
      `}</style>
    </section>
  );
}
