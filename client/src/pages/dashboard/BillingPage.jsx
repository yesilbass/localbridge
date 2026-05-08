import { Link } from 'react-router-dom';
import { CreditCard, Receipt, ArrowRight } from 'lucide-react';
import { useDashboardSessions, formatCurrency } from './dashboardHooks.js';

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

  const completed = sessions.filter((s) => String(s.status).toLowerCase() === 'completed');
  const totalSpent = sessions
    .filter((s) => ['completed', 'accepted'].includes(String(s.status).toLowerCase()))
    .reduce((sum) => sum, 0); // amount per session unknown client-side; stays 0 unless backed by future ledger

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
        {completed.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
            No purchases yet. Booked sessions will show up here.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--bridge-border)' }}>
            {completed.map((s, i) => {
              const d = s.scheduled_date ? new Date(s.scheduled_date) : new Date(s.created_at);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-3 text-[13px]"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bridge-border)' }}
                >
                  <span style={{ color: 'var(--bridge-text)' }}>
                    {(s.session_type ?? '').replace('_', ' ')} · {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[12px]"
                    style={{ color: 'var(--bridge-text-muted)' }}
                  >
                    <Receipt className="h-3.5 w-3.5" aria-hidden /> Receipt sent by email
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {totalSpent > 0 && (
          <p
            className="mt-4 text-[12px] tabular-nums"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            Lifetime spend on Bridge: ${formatCurrency(totalSpent)}
          </p>
        )}
      </section>
    </div>
  );
}
