import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/useAuth';
import CustomCursor from '../../components/CustomCursor.jsx';

import { LANDING_CSS } from './landingStyles';
import { usePerfTier } from './landingHooks';
import IntroLoader from './IntroLoader';
import ScrollProgressBar from './ScrollProgressBar';
import FloatingDock from './FloatingDock';
import BrandStrip from './BrandStrip';
import HeroSection from './HeroSection';
import StatsBentoSection from './StatsBentoSection';
import MentorMarqueeSection from './MentorMarqueeSection';
import HowItWorksSection from './HowItWorksSection';
import OutcomesSection from './OutcomesSection';
import ManifestoSection from './ManifestoSection';
import ComparisonSection from './ComparisonSection';
import FinalCtaSection from './FinalCtaSection';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const { user } = useAuth();
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(
    () => typeof window !== 'undefined' && document.documentElement.classList.contains('theme-dark')
  );

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('theme-dark'));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isLow) {
      document.querySelectorAll('[data-gsap-fade]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Generic fade-up
    document.querySelectorAll('[data-gsap-fade]').forEach(el => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    // Section label chips — slide in from left with a micro letter-spacing snap
    document.querySelectorAll('section p.uppercase').forEach(el => {
      gsap.fromTo(el,
        { x: -32, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
      );
    });

    // h2 headings — dramatic perspective-X flip from below
    document.querySelectorAll('section h2').forEach(el => {
      gsap.fromTo(el,
        { y: 48, opacity: 0, rotationX: -22, transformOrigin: '50% 100%', transformPerspective: 900 },
        { y: 0, opacity: 1, rotationX: 0, duration: 1.05, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 87%', once: true } }
      );
    });

    // Featured glow-border cards (stats bento, comparison table) — spring scale pop
    document.querySelectorAll('.b-glow-border').forEach(el => {
      gsap.fromTo(el,
        { scale: 0.92, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.85, ease: 'back.out(1.6)',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true } }
      );
    });

    // Outcome + manifesto cards — staggered wave if inside a grid
    document.querySelectorAll('.b-flare').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: (i % 3) * 0.07,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
    });

    // Parallax depth on the top atmospheric orbs while scrolling
    const orbs = document.querySelectorAll('.landing-orb');
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: i === 0 ? '-18%' : i === 1 ? '-11%' : '-7%',
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom top', scrub: 1.5 },
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [isLow]);

  return (
    <div className="relative overflow-x-hidden">
      <style>{LANDING_CSS}</style>

      {/* Full-bleed atmospheric background — covers brand strip + hero as one unified canvas */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[115vh] overflow-hidden">
        <div className="absolute inset-0" style={isDark
          ? { background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 16%, var(--color-bg)) 0%, var(--color-bg) 28%, color-mix(in srgb, var(--color-secondary) 10%, var(--color-bg)) 62%, color-mix(in srgb, var(--color-primary) 8%, var(--color-bg)) 100%)' }
          : { background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 5%, var(--color-bg)) 0%, var(--color-bg) 38%, color-mix(in srgb, var(--color-accent) 3%, var(--color-bg)) 68%, var(--color-bg) 100%)' }
        } />
        {/* Large primary orb — top-left, bleeds above page edge so navbar floats over it */}
        <div className={`landing-orb absolute -top-[15%] -left-[8%] w-[800px] h-[800px] rounded-full blur-[130px] ${isDark ? 'bg-gradient-to-br from-[var(--color-primary)]/28 to-[var(--color-accent)]/8 opacity-90' : 'bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-70'}`} />
        {/* Warm amber orb — top-right */}
        <div className={`landing-orb absolute -top-[5%] -right-[10%] w-[650px] h-[650px] rounded-full blur-[110px] ${isDark ? 'bg-gradient-to-br from-amber-500/22 to-[var(--color-primary)]/8 opacity-80' : 'bg-gradient-to-br from-amber-400/12 to-transparent opacity-60'}`} />
        {/* Secondary depth orb — mid-bottom */}
        <div className={`landing-orb absolute top-[55%] left-[20%] w-[500px] h-[500px] rounded-full blur-[100px] ${isDark ? 'bg-gradient-to-br from-[var(--color-secondary)]/15 to-transparent opacity-55' : 'bg-gradient-to-br from-[var(--color-accent)]/8 to-transparent opacity-40'}`} />
      </div>

      <IntroLoader />
      <ScrollProgressBar />
      <FloatingDock />

      <HeroSection user={user} isDark={isDark} ready={ready} />

      {/* Brand trust strip — below hero, acts as social proof after the hook */}
      <section className="relative py-8 border-y border-[var(--bridge-border)]/40">
        <div className="relative mx-auto max-w-bridge px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-[10px] font-black uppercase tracking-[0.34em] text-[var(--bridge-text-muted)]">
            Mentors currently at
          </p>
          <BrandStrip />
        </div>
      </section>

      <StatsBentoSection />
      <MentorMarqueeSection />
      <HowItWorksSection />
      <OutcomesSection />
      <ManifestoSection />
      <ComparisonSection />

      {/* Gradient transition to dark CTA background */}
      <div aria-hidden className="pointer-events-none h-32 w-full bg-gradient-to-b from-[var(--bridge-canvas)] to-[var(--bridge-hero-bg)]" />

      <FinalCtaSection user={user} />
    </div>
  );
}
