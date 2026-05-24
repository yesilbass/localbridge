import { useState } from 'react';
import HowItWorksHero from './HowItWorksHero.jsx';
import HowItWorksSteps from './HowItWorksSteps.jsx';
import HowItWorksContrast, { HowItWorksIncluded, HowItWorksClose } from './HowItWorksContrast.jsx';

export default function HowItWorksPage() {
  const [track, setTrack] = useState('sessions');

  return (
    <main
      className="relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)]"
      aria-labelledby="hiw-hero-heading"
    >
      <HowItWorksHero track={track} onTrackChange={setTrack} />
      <HowItWorksSteps track={track} />
      <HowItWorksContrast />
      <HowItWorksIncluded />
      <HowItWorksClose />
    </main>
  );
}
