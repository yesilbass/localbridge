import Reveal from '../../components/Reveal';

function StatCell({ value, label }) {
  return (
    <div
      className="flex flex-col gap-1 p-5"
      style={{ backgroundColor: 'var(--bridge-surface)' }}
    >
      <p
        className="font-display font-black leading-none tabular-nums"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          color: 'var(--bridge-text)',
          letterSpacing: '-0.025em',
          fontFeatureSettings: '"tnum" 1, "kern" 1',
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}>{label}</p>
    </div>
  );
}

export default function TrackRecord({ mentor }) {
  if (!mentor) return null;

  const stats = [];

  if (mentor.yearsExperience != null) {
    stats.push({ value: `${mentor.yearsExperience}+`, label: 'Years experience' });
  }
  if (mentor.companies?.length) {
    stats.push({ value: mentor.companies.length, label: 'Companies built at' });
  }
  if (mentor.ipoCount) {
    stats.push({ value: `${mentor.ipoCount} IPO${mentor.ipoCount > 1 ? 's' : ''}`, label: 'Public exits' });
  } else if (mentor.acquiredCount) {
    stats.push({ value: `${mentor.acquiredCount}`, label: `Acquisition${mentor.acquiredCount > 1 ? 's' : ''}` });
  } else if (mentor.teamsLed) {
    stats.push({ value: `${mentor.teamsLed}`, label: `Team${mentor.teamsLed > 1 ? 's' : ''} led` });
  } else if (mentor.totalSessions) {
    stats.push({ value: mentor.totalSessions, label: 'Sessions delivered' });
  }

  const visibleStats = stats.slice(0, 3);
  const hasCareer = mentor.careerHistory?.length > 0;

  if (!visibleStats.length && !hasCareer) return null;

  const careerEntries = (mentor.careerHistory ?? []).slice(0, 5);
  const remaining = (mentor.careerHistory?.length ?? 0) - 5;

  return (
    <Reveal>
      <section aria-labelledby="record-heading" className="mt-14">
        <p
          id="record-heading"
          className="font-black uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
        >
          Track record
        </p>

        {visibleStats.length > 0 && (
          <div
            className="mt-4"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${visibleStats.length}, 1fr)`,
              gap: '1px',
              backgroundColor: 'var(--bridge-border)',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {visibleStats.map((s, i) => (
              <StatCell key={i} value={s.value} label={s.label} />
            ))}
          </div>
        )}

        {hasCareer && (
          <div className="mt-6 flex flex-col">
            {careerEntries.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-3"
                style={i > 0 ? { borderTop: '1px solid var(--bridge-border)' } : {}}
              >
                <span
                  className="shrink-0 mt-0.5 tabular-nums"
                  style={{ fontSize: '12px', color: 'var(--bridge-text-muted)', width: '100px', fontFeatureSettings: '"tnum" 1' }}
                >
                  {entry.startYear}–{entry.endYear ?? 'Now'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold" style={{ fontSize: '14px', color: 'var(--bridge-text)' }}>
                    {entry.role} · {entry.company}
                  </p>
                  {entry.note && (
                    <p className="mt-1" style={{ fontSize: '13px', color: 'var(--bridge-text-secondary)' }}>
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {remaining > 0 && (
              <p
                className="pt-3"
                style={{
                  fontSize: '12px',
                  color: 'var(--bridge-text-muted)',
                  borderTop: '1px solid var(--bridge-border)',
                }}
              >
                + {remaining} earlier role{remaining !== 1 ? 's' : ''}
                {mentor.earlierCompanyHighlight ? ` at ${mentor.earlierCompanyHighlight}` : ''}
              </p>
            )}
          </div>
        )}
      </section>
    </Reveal>
  );
}
