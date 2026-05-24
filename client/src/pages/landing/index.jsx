import { useLayoutEffect } from 'react';

import { LANDING_CSS } from './landingStyles';
import { buildLandingPaletteCSS } from './landingPalette';
import HeroSection from './HeroSection';
import VideoTestimonialsSection from './VideoTestimonialsSection';
import MentorRosterSection from './MentorRosterSection';
import TrustBandSection from './TrustBandSection';
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

      {/* Hero band ambient — gradient-only (no filter blur repaint cost) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden lg:h-screen">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--lp-bg-top) 0%, var(--lp-bg-bottom) 100%)' }} />
        <div
          className="absolute -top-[18%] left-[12%] h-[58%] w-[58%] rounded-full"
          style={{
            background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 28%, transparent) 0%, transparent 72%)',
            opacity: 'var(--lp-glow-opacity)',
            transform: 'translate3d(0,0,0)',
          }}
        />
        <div
          className="absolute top-[8%] right-[6%] h-[42%] w-[42%] rounded-full"
          style={{
            background: 'radial-gradient(closest-side, color-mix(in srgb, var(--lp-counter) 22%, transparent) 0%, transparent 72%)',
            opacity: 'var(--lp-glow-opacity-soft)',
            transform: 'translate3d(0,0,0)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--bridge-canvas) 100%)' }}
        />
      </div>

      <HeroSection />
      <TrustBandSection />
      <VideoTestimonialsSection />
      <IsThisForYouSection />
      <MentorRosterSection />
    </div>
  );
}
