import { formatJoinedDate } from './profileHooks';

function StatCard({ label, value }) {
  return (
    <div
      className="flex flex-1 flex-col gap-1 rounded-2xl px-4 py-3"
      style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--bridge-text-muted)' }}>{label}</span>
    </div>
  );
}

export default function ImpactStatsStrip({ rawMentor, menteesHelped = 0 }) {
  const sessions = rawMentor?.total_sessions ?? 0;
  const joined = formatJoinedDate(rawMentor?.created_at);

  const cards = [
    sessions > 0 && { label: 'Sessions completed', value: sessions },
    menteesHelped > 0 && { label: 'Mentees helped', value: menteesHelped },
    joined && { label: 'Member since', value: joined },
  ].filter(Boolean);

  if (!cards.length) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {cards.map(({ label, value }) => (
        <StatCard key={label} label={label} value={value} />
      ))}
    </div>
  );
}
