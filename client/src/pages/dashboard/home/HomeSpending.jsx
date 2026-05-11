import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowRight } from 'lucide-react';
import { usePastSessions, formatCurrency } from '../dashboardHooks.js';

/**
 * Mentee-only monthly spending summary. Renders nothing when there are no
 * billed sessions this month so the home stays calm by default.
 */
export default function HomeSpending() {
  const { sessions } = usePastSessions({ limit: 100 });

  const monthly = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const inMonth = sessions.filter((s) => {
      const t = new Date(s.scheduled_date ?? s.created_at).getTime();
      return t >= start && String(s.status).toLowerCase() === 'completed';
    });
    const totals = inMonth.map((s) => s._mentor?.session_rate ?? 0);
    const total = totals.reduce((a, b) => a + b, 0);
    const avg = inMonth.length ? Math.round(total / inMonth.length) : 0;
    return { count: inMonth.length, total, avg };
  }, [sessions]);

  if (monthly.count === 0) return null;

  return (
    <section
      aria-labelledby="spending-heading"
      className="flex min-w-0 items-center gap-4 rounded-3xl p-6 sm:p-7"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
          <h2
            id="spending-heading"
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            Spending this month
          </h2>
        </div>
        <p
          className="truncate font-display font-black tabular-nums"
          style={{
            fontSize: 'clamp(24px, 2.4vw, 30px)',
            letterSpacing: '-0.025em',
            color: 'var(--bridge-text)',
          }}
        >
          ${formatCurrency(monthly.total)}
        </p>
        <p className="truncate text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
          {monthly.count} session{monthly.count === 1 ? '' : 's'} · avg ${formatCurrency(monthly.avg)}
        </p>
      </div>
      <Link
        to="/dashboard/billing"
        className="bridge-focus inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold transition-colors"
        style={{
          color: 'var(--bridge-text-secondary)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
        }}
      >
        View billing <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}
