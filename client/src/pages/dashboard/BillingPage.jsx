import { Link } from 'react-router-dom';
import { CreditCard, Receipt, ArrowRight } from 'lucide-react';
import { useDashboardSessions } from './dashboardHooks.js';

const STATUS_META = {
  pending:   { label: 'Awaiting mentor', color: 'var(--color-warning)' },
  accepted:  { label: 'Confirmed',       color: 'var(--color-primary)' },
  completed: { label: 'Completed',       color: 'var(--color-success)' },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em]"
      style={{
        backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

export default function BillingPage() {
  const { isMentor, sessions, isLoading } = useDashboardSessions();

  if (isMentor) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Earnings
        </p>
        <p className="mt-2 text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          Mentor earnings live in the Earnings tab.
        </p>
        <Link
          to="/dashboard/earnings"
          className="bridge-focus mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          Open Earnings <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="bridge-skeleton h-48 w-full rounded-2xl" />;
  }

  const PAID_STATUSES = ['pending', 'accepted', 'completed'];
  const purchases = sessions
    .filter((s) => PAID_STATUSES.includes(String(s.status).toLowerCase()))
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex flex-col gap-6">
      <section
        className="rounded-3xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Billing
        </p>
        <p
          className="font-display mt-2 text-[22px] font-black tracking-[-0.02em]"
          style={{ color: 'var(--bridge-text)' }}
        >
          You pay per session, not per month.
        </p>
        <p className="mt-2 text-[13px]" style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}>
          Bridge charges nothing for browsing, saving, or matching. You only pay when you book — directly to your mentor at their per-session rate. We don't store a card on file.
        </p>
      </section>

      <section
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="mb-3 flex items-center gap-3">
          <CreditCard className="h-4 w-4" style={{ color: 'var(--bridge-text-muted)' }} aria-hidden />
          <h2
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Recent purchases
          </h2>
        </div>
        {purchases.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
            No purchases yet. Sessions you book will show up here as soon as payment clears.
          </p>
        ) : (
          <ul>
            {purchases.map((s, i) => {
              const status = String(s.status).toLowerCase();
              const d = s.scheduled_date ? new Date(s.scheduled_date) : new Date(s.created_at);
              const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const sessionTypeLabel = (s.session_type ?? 'session').replace(/_/g, ' ');
              return (
                <li
                  key={s.id}
                  className="flex min-w-0 items-center gap-3 py-3 text-[13px]"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bridge-border)' }}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate capitalize" style={{ color: 'var(--bridge-text)' }}>
                      {sessionTypeLabel}
                    </span>
                    <span
                      className="truncate text-[11.5px] tabular-nums"
                      style={{ color: 'var(--bridge-text-muted)' }}
                    >
                      {dateLabel}
                      {status === 'completed' ? (
                        <>
                          {' · '}
                          <span className="inline-flex items-center gap-1">
                            <Receipt className="h-3 w-3" aria-hidden /> Receipt sent
                          </span>
                        </>
                      ) : null}
                    </span>
                  </div>
                  <StatusPill status={status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
