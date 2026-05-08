import Reveal from '../../components/Reveal';

function CompanyAvatar({ company }) {
  const initials = (company ?? '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center font-black text-sm select-none"
      style={{
        background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)',
        color: 'var(--color-primary)',
        fontFeatureSettings: '"kern" 1',
      }}
      aria-hidden
    >
      {initials || '?'}
    </div>
  );
}

export default function TrackRecord({ mentor }) {
  if (!mentor) return null;

  const careerEntries = (mentor.careerHistory ?? []).slice(0, 6);
  if (!careerEntries.length) return null;

  return (
    <Reveal>
      <section aria-labelledby="career-heading" className="mt-16 pt-14" style={{ borderTop: '1px solid var(--bridge-border)' }}>
        <p className="font-black uppercase" style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--color-primary)' }}>
          Background
        </p>
        <h2
          id="career-heading"
          className="mt-3 font-display font-black tracking-tight"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em', color: 'var(--bridge-text)' }}
        >
          Career journey
        </h2>

        <div className="mt-8 flex flex-col gap-1.5">
          {careerEntries.map((entry, i) => {
            const isCurrent = !entry.endYear;
            return (
              <div
                key={i}
                className="group relative flex items-start gap-4 rounded-2xl px-4 py-4 transition-colors duration-150"
                style={{ margin: '0 -1rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bridge-surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <CompanyAvatar company={entry.company} />

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold leading-snug" style={{ fontSize: '15px', color: 'var(--bridge-text)' }}>
                        {entry.role}
                      </p>
                      <p className="mt-0.5 font-semibold" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                        {entry.company}
                      </p>
                    </div>
                    <span
                      className="shrink-0 mt-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap"
                      style={{
                        background: isCurrent
                          ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                          : 'var(--bridge-surface-muted)',
                        color: isCurrent ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                        boxShadow: isCurrent ? 'none' : 'inset 0 0 0 1px var(--bridge-border)',
                        fontFeatureSettings: '"tnum" 1',
                      }}
                    >
                      {entry.startYear}–{entry.endYear ?? 'Present'}
                    </span>
                  </div>
                  {entry.note && (
                    <p
                      className="mt-1.5 leading-relaxed"
                      style={{ fontSize: '13px', color: 'var(--bridge-text-secondary)', maxWidth: '58ch' }}
                    >
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {(mentor.careerHistory?.length ?? 0) > 6 && (
            <p
              className="mt-2 pl-4 text-xs font-medium"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              + {mentor.careerHistory.length - 6} earlier role{mentor.careerHistory.length - 6 !== 1 ? 's' : ''}
              {mentor.earlierCompanyHighlight ? ` at ${mentor.earlierCompanyHighlight}` : ''}
            </p>
          )}
        </div>
      </section>
    </Reveal>
  );
}
