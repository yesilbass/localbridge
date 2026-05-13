import { Link } from 'react-router-dom';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useDashboardSessions } from './dashboardHooks.js';

const SESSION_TYPE_LABEL = {
  career_advice: 'Career advice',
  mock_interview: 'Mock interview',
  resume_review: 'Resume review',
  technical: 'Technical session',
  general: 'Mentorship session',
};

function formatPrice(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `$${n.toFixed(0)}`;
}

function getInitials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?';
}

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
  const { isMentor, sessions, isLoading, mentorMap } = useDashboardSessions();

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
    .filter((s) => !!s.stripe_session_id) // only actual paid bookings, not legacy/free rows
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalSpent = purchases.reduce((sum, s) => {
    const rate = Number(mentorMap?.[s.mentor_id]?.session_rate ?? 0);
    return sum + (Number.isFinite(rate) ? rate : 0);
  }, 0);

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
        className="rounded-2xl p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4" style={{ color: 'var(--bridge-text-muted)' }} aria-hidden />
            <h2
              className="text-[10px] font-black uppercase tracking-[0.32em]"
              style={{ color: 'var(--color-primary)' }}
            >
              Receipts &amp; purchases
            </h2>
          </div>
          {purchases.length > 0 && (
            <span className="text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
              {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'} · ${totalSpent.toFixed(0)} total
            </span>
          )}
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
              const timeLabel = s.scheduled_date
                ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : 'Time TBD';
              const typeLabel = SESSION_TYPE_LABEL[s.session_type] ?? (s.session_type ?? 'Session').replace(/_/g, ' ');
              const mentor = mentorMap?.[s.mentor_id];
              const mentorName = mentor?.name || 'Mentor';
              const price = formatPrice(mentor?.session_rate);
              return (
                <li
                  key={s.id}
                  className="flex min-w-0 items-center gap-3 py-3.5"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bridge-border)' }}
                >
                  {mentor?.image_url ? (
                    <img
                      src={mentor.image_url}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="bridge-photo grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-black"
                      style={{ color: 'var(--bridge-text-secondary)' }}
                      aria-hidden
                    >
                      {getInitials(mentorName)}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
                      {typeLabel} <span className="font-normal" style={{ color: 'var(--bridge-text-muted)' }}>· with {mentorName}</span>
                    </span>
                    <span className="truncate text-[11.5px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
                      {dateLabel} · {timeLabel}
                      {s.stripe_session_id ? <> · <span className="font-mono text-[10.5px]">{s.stripe_session_id.slice(-8)}</span></> : null}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {price && (
                      <span className="text-[13px] font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>
                        {price}
                      </span>
                    )}
                    <StatusPill status={status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
          A detailed PDF receipt for every paid session is sent to your email by Stripe immediately after checkout.
        </p>
      </section>
    </div>
  );
}
