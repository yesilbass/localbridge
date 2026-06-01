import { useLayoutEffect } from 'react';

import { LANDING_CSS } from './landingStyles';
import { buildLandingPaletteCSS } from './landingPalette';
import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import MentorRosterSection from './MentorRosterSection';
import IsThisForYouSection from './IsThisForYouSection';

export default function Landing() {
  useLayoutEffect(() => {
    document.documentElement.classList.add('is-landing-route');
    return () => document.documentElement.classList.remove('is-landing-route');
  }, []);

  return (
    <div className="landing-root relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)]">
      <style>{LANDING_CSS}</style>
      <style>{buildLandingPaletteCSS('html.is-landing-route')}</style>

      <HeroSection />
      <HowItWorksSection />
      <IsThisForYouSection />
      <MentorRosterSection />
    </div>
  );
}
