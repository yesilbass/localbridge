import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/useAuth';

import { LANDING_CSS } from './landingStyles';
import { usePerfTier } from './landingHooks';
import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import FinalCtaSection from './FinalCtaSection';
import IntroLoader from './IntroLoader';
import FloatingDock from './FloatingDock';
import ScrollProgressBar from './ScrollProgressBar';
import StatsBentoSection from './StatsBentoSection';
import MentorMarqueeSection from './MentorMarqueeSection';
import ManifestoSection from './ManifestoSection';
import ComparisonSection from './ComparisonSection';
import OutcomesSection from './OutcomesSection';

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

    // h2 headings
    document.querySelectorAll('section h2').forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [isLow]);

  return (
    <div className="relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)]">
      <IntroLoader />
      <ScrollProgressBar />
      <FloatingDock />
      <style>{LANDING_CSS}</style>

      {/* Clean atmospheric background for Hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[100vh] overflow-hidden">
        <div className="absolute inset-0" style={isDark
          ? { background: 'linear-gradient(180deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 95%, var(--color-primary)) 100%)' }
          : { background: 'linear-gradient(180deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 97%, var(--color-primary)) 100%)' }
        } />
        {/* Subtle top glow */}
        <div className={`absolute -top-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDark ? 'bg-[var(--color-primary)]/10' : 'bg-[var(--color-primary)]/5'}`} />
      </div>

      <HeroSection user={user} isDark={isDark} ready={ready} />

      <MentorMarqueeSection />
      
      <StatsBentoSection />

      <ManifestoSection />

      <HowItWorksSection />
      
      <ComparisonSection />

      <OutcomesSection />

      {/* Minimal spacing before CTA */}
      <div className="h-16 w-full" />

      <FinalCtaSection user={user} />
    </div>
  );
}
