import HowItWorksHero from './HowItWorksHero.jsx';
import HowItWorksSteps from './HowItWorksSteps.jsx';
import HowItWorksClose from './HowItWorksContrast.jsx';

export default function HowItWorksPage() {
  return (
    <main
      className="relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)]"
      aria-labelledby="hiw-hero-heading"
    >
      <HowItWorksHero />
      <HowItWorksSteps track="sessions" />
      <HowItWorksClose />
    </main>
  );
}
