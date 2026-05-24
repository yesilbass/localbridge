import RevealOnScroll from '../landing/RevealOnScroll';
import { COMPANY_BELIEFS, COMPANY_PAD } from './companyData';

const DARK_BG =
  'linear-gradient(155deg, color-mix(in srgb, var(--color-primary) 42%, #0a0a0f) 0%, #0c0c12 45%, color-mix(in srgb, var(--color-primary) 28%, #08080c) 100%)';

export default function CompanyBeliefsSection() {
  return (
    <section
      id="beliefs"
      aria-labelledby="beliefs-heading"
      className={COMPANY_PAD}
      style={{ background: DARK_BG }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-white/50">Non-negotiables</p>
            <h2
              id="beliefs-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-white"
            >
              Four beliefs we will not bend on.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/65">
              Every alternative breaks in the same places. We picked the harder side of each one and built the product around it.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl sm:mt-14 sm:grid-cols-2 lg:grid-cols-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          {COMPANY_BELIEFS.map((b, i) => (
            <RevealOnScroll key={b.num} delay={i * 60}>
              <article
                className="flex h-full flex-col p-6 sm:p-7"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="font-display text-4xl font-black tabular-nums text-white/20">{b.num}</span>
                <h3 className="mt-4 text-[17px] font-bold leading-snug text-white">{b.title}</h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-white/60">{b.body}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
