import RevealOnScroll from '../landing/RevealOnScroll';
import { COMPANY_PAD_TIGHT } from './companyData';

export default function CompanyStorySection() {
  return (
    <section
      id="origin"
      aria-labelledby="origin-heading"
      className={COMPANY_PAD_TIGHT}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">

        <RevealOnScroll className="lg:col-span-5 lg:self-center">
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
          <div className="space-y-5 text-[17px] leading-[1.7] text-[var(--bridge-text-secondary)]">
            <p>
              The best career advice we ever got came from people who had nothing to sell
              us — just an hour and a willingness to be straight. Those conversations
              changed how we thought about what was possible. Finding them had taken months.
            </p>
            <p>
              When we went looking for more, the options were retainer packages,
              hourly billing, and platforms that required payment before you spoke
              to anyone. Informal networks helped — if you knew the right people.
              Most didn't.
            </p>
            <p>
              We built Bridge to fix the access problem, not to build another
              marketplace. Mentors volunteer their time. Mentees subscribe once.
              Nothing sits between a question and the person who can answer it.
            </p>
            <p
              className="border-l-2 pl-4"
              style={{ borderColor: 'var(--color-primary)' }}
            >
              We're still small. We hand-review every mentor and read every review
              ourselves. That won't change.
            </p>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
}
