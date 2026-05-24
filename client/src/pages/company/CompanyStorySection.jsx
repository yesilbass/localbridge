import RevealOnScroll from '../landing/RevealOnScroll';
import { COMPANY_PAD } from './companyData';

const PARAS = [
  'Five operators spent the last decade building product, running engineering teams, designing for early-stage companies, and raising venture capital. Every meaningful step came from someone who had already done the next one.',
  'The expensive coaching never delivered it. The free advice on LinkedIn rarely matched the situation. The right person almost never had a way to be hired for an hour.',
  'Bridge is the missing layer — one hour, one operator, booked from their calendar. Free sessions, no packages, no DMs.',
];

export default function CompanyStorySection() {
  return (
    <section
      id="origin"
      aria-labelledby="origin-heading"
      className={COMPANY_PAD}
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <RevealOnScroll className="lg:col-span-5 lg:pt-2">
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Origin
          </p>
          <h2
            id="origin-heading"
            className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-black leading-[1.05] tracking-[-0.03em] text-[var(--bridge-text)]"
          >
            We built Bridge because we needed it first.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-7" delay={80}>
          <div className="space-y-5 text-[16px] leading-[1.7] text-[var(--bridge-text-secondary)] sm:text-[17px]">
            {PARAS.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <figure
            className="mt-10 border-l-[3px] pl-6"
            style={{ borderColor: 'var(--color-primary)' }}
          >
            <blockquote className="font-display text-[clamp(1.125rem,2vw,1.5rem)] font-medium italic leading-snug text-[var(--bridge-text)]">
              The right ten minutes with the right person can alter the trajectory of a life. We made those ten minutes bookable.
            </blockquote>
            <figcaption className="mt-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-faint)]">
              Founding thesis · 2026
            </figcaption>
          </figure>
        </RevealOnScroll>
      </div>
    </section>
  );
}
