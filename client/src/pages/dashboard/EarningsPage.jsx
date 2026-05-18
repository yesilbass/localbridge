import EarningsCard from './EarningsCard.jsx';
import { useDashboardSessions, formatCurrency } from './dashboardHooks.js';
import { useEffect, useState } from 'react';
import supabase from '../../api/supabase';
import { useAuth } from '../../context/useAuth.js';
import { useContent } from '../../content';

function PayoutHistoryTable({ rows, rate }) {
  const { s } = useContent();
  if (!rows.length) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
        {s.dashboard.earningsNoCompletedYet}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--bridge-border)' }}>
            <th
              className="py-2 text-left text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {s.dashboard.earningsDate}
            </th>
            <th
              className="py-2 text-left text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {s.dashboard.earningsMentee}
            </th>
            <th
              className="py-2 text-left text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {s.dashboard.earningsType}
            </th>
            <th
              className="py-2 text-right text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {s.dashboard.earningsAmount}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const d = s.scheduled_date ? new Date(s.scheduled_date) : new Date(s.created_at);
            return (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--bridge-border)' }}>
                <td className="py-3 tabular-nums" style={{ color: 'var(--bridge-text)' }}>
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-3" style={{ color: 'var(--bridge-text)' }}>
                  {s.mentee_name || 'Mentee'}
                </td>
                <td className="py-3 capitalize" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {(s.session_type ?? '').replace('_', ' ')}
                </td>
                <td className="py-3 text-right font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
                  ${formatCurrency(rate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EarningsPage() {
  const { user } = useAuth();
  const { past, sessions } = useDashboardSessions();
  const [rate, setRate] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('mentor_profiles').select('session_rate').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setRate(data?.session_rate ?? 0));
  }, [user]);

  const completed = sessions.filter((s) => String(s.status).toLowerCase() === 'completed');
  const accepted = sessions.filter((s) => String(s.status).toLowerCase() === 'accepted');

  return (
    <div className="flex flex-col gap-6">
      <EarningsCard />

      <section
        className="rounded-2xl p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Payout history
          </h2>
          <span className="text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
            {completed.length} completed · {accepted.length} pending
          </span>
        </div>
        <PayoutHistoryTable rows={[...completed, ...accepted].sort((a, b) => new Date(b.scheduled_date ?? b.created_at) - new Date(a.scheduled_date ?? a.created_at))} rate={rate} />
      </section>

      <section
        className="rounded-2xl p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <h2
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          How payouts work
        </h2>
        <p className="mt-3 text-[13px]" style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}>
          Bridge takes 0% on your session rate during the seed launch. Mentees pay you per session at booking; payouts settle to your connected account once the session is marked completed.
        </p>
      </section>

      {past.filter((s) => String(s.status).toLowerCase() !== 'cancelled' && String(s.status).toLowerCase() !== 'declined').length > 0 && null}
    </div>
  );
}
