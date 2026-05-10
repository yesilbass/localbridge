/**
 * PageHeader — every dashboard sub-page renders this at the top.
 * Replaces the inline <h1> previously owned by DashboardShell.
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1
          className="font-display font-black"
          style={{
            fontSize: 'clamp(24px, 2.6vw, 32px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--bridge-text)',
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="mt-1 text-[13px]"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.5 }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
