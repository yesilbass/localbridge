import Reveal from '../../components/Reveal';

export default function OutcomeReel({ mentor }) {
  const outcomes = mentor?.outcomes;
  if (!Array.isArray(outcomes) || outcomes.length < 3) return null;

  const firstName = mentor.firstName ?? mentor.name?.split(/\s+/)[0] ?? '';

  return (
    <section aria-labelledby="outcomes-heading" className="mt-14">
      <p
        className="font-black uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
      >
        What this looks like in practice
      </p>
      <p className="mt-2" style={{ fontSize: '14px', color: 'var(--bridge-text-secondary)' }}>
        Recent operators {firstName} has worked with.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {outcomes.map((outcome, i) => (
          <Reveal key={i} delay={i * 60}>
            <article
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <p
                className="italic font-display"
                style={{
                  fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)',
                  lineHeight: 1.55,
                  color: 'var(--bridge-text)',
                }}
              >
                {outcome.quote}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
                <p style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}>
                  {outcome.attribution}
                </p>
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-black uppercase"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {outcome.metric}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
