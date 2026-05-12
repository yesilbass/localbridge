const STATS = [
  { value: '2,400+', label: 'Vetted mentors' },
  { value: '4.9/5',  label: '1,200+ reviews' },
  { value: '97%',    label: 'Would recommend' },
  { value: '$2.1M+', label: 'Comp increases unlocked' },
];

export default function StatsBentoSection() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="relative"
      style={{
        backgroundColor: 'var(--bridge-canvas)',
        borderTop: '1px solid var(--bridge-border)',
        borderBottom: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 pb-5 sm:pt-12 sm:pb-6">
        <p
          id="stats-heading"
          className="text-center text-[10px] font-black uppercase"
          style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}
        >
          By the numbers
        </p>
      </div>
      <div
        className="grid grid-cols-2 lg:grid-cols-4"
        style={{ backgroundColor: 'var(--bridge-border)', gap: '1px' }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center sm:px-6 sm:py-12"
            style={{ backgroundColor: 'var(--bridge-canvas)' }}
          >
            <p
              className="font-display font-black"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1,
                letterSpacing: '-0.025em',
                color: 'var(--bridge-text)',
                fontFeatureSettings: '"tnum" 1, "kern" 1',
              }}
            >
              {s.value}
            </p>
            <p
              className="text-[12.5px] font-medium uppercase"
              style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.04em' }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
