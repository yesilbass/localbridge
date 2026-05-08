import { BRANDS } from './landingData';

export default function BrandStrip() {
  return (
    <section className="relative py-14 sm:py-16" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-7 flex flex-col items-center gap-2 text-center">
          <p
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Trusted by professionals from
          </p>
          <p
            className="text-[12.5px]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            Mentors at the companies our users want to work at — and the ones they&rsquo;re leaving them for.
          </p>
        </div>

        <div className="b-marq relative">
          <div className="overflow-hidden b-mask-x">
            <div className="b-ticker flex w-max gap-14 pr-14 items-center">
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <span
                  key={i}
                  className="font-display text-[20px] sm:text-[22px] font-black uppercase tracking-tight whitespace-nowrap transition-colors"
                  style={{
                    color: 'var(--bridge-text-muted)',
                    opacity: 0.62,
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
