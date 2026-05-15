import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LANDING_CSS } from '../landing/landingStyles';
import { buildLandingPaletteCSS } from '../landing/landingPalette';
import WhyUsHero from './WhyUsHero';
import ContrarianBeliefsSection from './ContrarianBeliefsSection';
import SideBySideSection from './SideBySideSection';
import ReceiptsSection from './ReceiptsSection';
import MechanismSection from './MechanismSection';
import CommitmentsSection from './CommitmentsSection';
import AudienceSection from './AudienceSection';
import WhyUsFinalCtaSection from './WhyUsFinalCtaSection';

export default function WhyUs() {
  const location = useLocation();

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-whyus-route');
    return () =>
      document.documentElement.classList.remove('is-whyus-route');
  }, []);

  useEffect(() => {
    if (location.hash !== '#receipts') return;
    const id = location.hash.slice(1);
    const run = () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [location.pathname, location.hash]);

  return (
    <main
      id="whyus-main"
      tabIndex={-1}
      className="landing-root relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)] focus:outline-none"
    >
      <style>{LANDING_CSS}</style>
      <style>{buildLandingPaletteCSS('html.is-whyus-route')}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[100vh] overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, var(--lp-bg-top) 0%, var(--lp-bg-bottom) 100%)',
          }}
        />
        <div
          className="absolute -top-[18%] left-[12%] h-[58%] w-[58%] rounded-full blur-[90px]"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, transparent 70%)',
            opacity: 'var(--lp-glow-opacity)',
            transform: 'translate3d(0,0,0)',
          }}
        />
        <div
          className="absolute top-[8%] right-[6%] h-[42%] w-[42%] rounded-full blur-[90px]"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--lp-counter) 55%, transparent) 0%, transparent 70%)',
            opacity: 'var(--lp-glow-opacity-soft)',
            transform: 'translate3d(0,0,0)',
          }}
        />
      </div>

      <WhyUsHero />
      <ContrarianBeliefsSection />
      <SideBySideSection />
      <ReceiptsSection />
      <MechanismSection />
      <CommitmentsSection />
      <AudienceSection />
      <WhyUsFinalCtaSection />
    </main>
  );
}
