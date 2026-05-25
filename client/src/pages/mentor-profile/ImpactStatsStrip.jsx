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

export default function ImpactStatsStrip({ mentor, rawMentor, menteesHelped = 0 }) {
  const sessions = rawMentor?.total_sessions ?? 0;
  const joined = formatJoinedDate(rawMentor?.created_at);

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <StatCard label="Sessions completed" value={sessions} />
      <StatCard label="Mentees helped" value={menteesHelped} />
      {joined && <StatCard label="Member since" value={joined} />}
    </div>
  );
}
