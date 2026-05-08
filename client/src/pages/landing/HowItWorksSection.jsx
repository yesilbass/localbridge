import RevealOnScroll from './RevealOnScroll';

const STEPS = [
  {
    num: '01',
    title: 'Tell us what you need.',
    body:
      'Two questions, sixty seconds. Our matching reads your goal and surfaces the right operators in real time.',
    chip: 'Sixty seconds',
  },
  {
    num: '02',
    title: 'Pick someone who has done it.',
    body:
      'Real role, real company, real outcomes. Pricing, calendar, and reviews on every profile — no DMs, no waiting.',
    chip: 'Pick a mentor',
  },
  {
    num: '03',
    title: 'Talk. Walk away with momentum.',
    body:
      'One hour, one focused conversation. Notes, action items, and a follow-up path stay with you after the call.',
    chip: 'Live in one click',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="relative py-24 lg:py-32"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.32em' }}
          >
            How it works
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            Three steps.
            <br />
            <span style={{ color: 'var(--color-primary)' }}>Real momentum.</span>
          </h2>
          <p
            className="mt-7 max-w-xl"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
          >
            From profile to booked session in under five minutes.
          </p>
        </RevealOnScroll>

        <div className="mt-12">
          {STEPS.map((step, i) => (
            <RevealOnScroll key={step.num}>
              <div
                className="grid grid-cols-[80px_1fr] sm:grid-cols-[140px_1fr] gap-6 sm:gap-12 py-12 sm:py-14"
                style={i > 0 ? { borderTop: '1px solid var(--bridge-border)' } : undefined}
              >
                <div
                  className="border-l-2 pl-4 sm:pl-6"
                  style={{
                    borderColor:
                      'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  }}
                >
                  <p
                    className="font-display font-black"
                    style={{
                      fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                      lineHeight: 1,
                      color:
                        'color-mix(in srgb, var(--color-primary) 25%, transparent)',
                      letterSpacing: '-0.04em',
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {step.num}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <h3
                    className="font-display font-black"
                    style={{
                      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                      color: 'var(--bridge-text)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="max-w-xl"
                    style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
                  >
                    {step.body}
                  </p>
                  <div className="mt-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        color: 'var(--color-primary)',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {step.chip}
                    </span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
