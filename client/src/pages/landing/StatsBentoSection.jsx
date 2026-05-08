const STATS = [
  { value: '2,400+', label: 'Vetted mentors' },
  { value: '4.9/5',  label: '1,200+ reviews' },
  { value: '97%',    label: 'Would recommend' },
  { value: '$2.1M+', label: 'Comp increases unlocked' },
];

export default function StatsBentoSection() {
  return (
    <section
      aria-label="Bridge by the numbers"
      className="relative"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border)',
        borderBottom: '1px solid var(--bridge-border)',
      }}
    >
      <div
        className="grid grid-cols-2 lg:grid-cols-4"
        style={{ backgroundColor: 'var(--bridge-border)', gap: '1px' }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 px-6 py-14 sm:px-8 sm:py-16"
            style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p
              className="font-display font-black"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                lineHeight: 1,
                letterSpacing: '-0.025em',
                color: 'var(--bridge-text)',
                fontFeatureSettings: '"tnum" 1, "kern" 1',
              }}
            >
              {s.value}
            </p>
            <p
              className="text-[13px]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
