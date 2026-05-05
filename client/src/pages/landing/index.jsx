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
      // Lite: just snap them visible — no scroll-triggered animation overhead.
      document.querySelectorAll('[data-gsap-fade]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }
    const els = document.querySelectorAll('[data-gsap-fade]');
    els.forEach(el => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [isLow]);

  return (
    <div className="relative overflow-x-hidden">
      <style>{LANDING_CSS}</style>

      <IntroLoader />
      <ScrollProgressBar />
      <FloatingDock />

      {/* Brand trust strip */}
      <section className="relative border-y border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/92 py-5 backdrop-blur-xl">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_-20%,rgba(234,88,12,.08),transparent_62%)]" />
        <div className="relative mx-auto max-w-bridge px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.34em] text-[var(--bridge-text-muted)]">
            Mentors from the world's best companies
          </p>
          <BrandStrip />
        </div>
      </section>

      <HeroSection user={user} isDark={isDark} ready={ready} />
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
