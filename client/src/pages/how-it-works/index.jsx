import HowItWorksSteps from './HowItWorksSteps.jsx';
import HowItWorksClose from './HowItWorksContrast.jsx';

export default function HowItWorksPage() {
  return (
    <main
      className="relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)]"
    >
      <section className="mx-auto w-full max-w-7xl px-6 pb-0 pt-16 sm:px-10 sm:pt-20 lg:px-14 xl:max-w-[88rem] xl:px-16 text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: 'var(--color-primary)' }}
        >
          How it works
        </p>
        <h1
          className="mt-3 font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
          style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)' }}
        >
          How Bridge Works.
        </h1>
        <p
          className="mt-4 mx-auto max-w-xl leading-[1.7] text-[var(--bridge-text-secondary)]"
          style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
        >
          Browse mentors yourself or let Bridge match you. Book a real calendar slot. Meet over built-in video.
        </p>
      </section>
      <HowItWorksSteps track="sessions" />
      <HowItWorksClose />
    </main>
  );
}
