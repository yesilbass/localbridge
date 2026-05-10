import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import RevealOnScroll from '../../landing/RevealOnScroll';
import { usePerfTier } from '../../landing/landingHooks';
import SavedMentorsBlock from '../SavedMentorsBlock.jsx';
import RecommendationsBlock from '../RecommendationsBlock.jsx';
import PastSessionsBlock from '../PastSessionsBlock.jsx';
import { usePastSessions, formatCurrency } from '../dashboardHooks.js';

function PanelCard({ eyebrow, title, viewAllTo, children }) {
  return (
    <section
      className="rounded-3xl p-6 sm:p-7"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: 'var(--color-primary)' }}
          >
            {eyebrow}
          </p>
          <h3
            className="font-display mt-1 text-[18px] font-black"
            style={{ color: 'var(--bridge-text)', letterSpacing: '-0.015em' }}
          >
            {title}
          </h3>
        </div>
        {viewAllTo ? (
          <Link
            to={viewAllTo}
            className="bridge-focus inline-flex shrink-0 items-center gap-1 rounded-md text-[12px] font-semibold transition-colors hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Reveal({ children, delay, flat }) {
  if (flat) return <>{children}</>;
  return <RevealOnScroll variant="up" delay={delay}>{children}</RevealOnScroll>;
}

function SpendingSummary() {
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

  return (
    <article
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <DollarSign className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          This month
        </span>
      </div>
      <p
        className="font-display mt-2 font-black tabular-nums"
        style={{
          fontSize: 'clamp(28px, 2.6vw, 34px)',
          letterSpacing: '-0.025em',
          color: 'var(--bridge-text)',
          fontFeatureSettings: '"tnum" 1, "kern" 1',
        }}
      >
        ${formatCurrency(monthly.total)}
      </p>
      <p className="text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
        {monthly.count} session{monthly.count === 1 ? '' : 's'}
        {monthly.count > 0 ? ` · avg $${formatCurrency(monthly.avg)}` : ''}
      </p>
    </article>
  );
}

export default function HomeMenteePanel() {
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
      <div className="flex flex-col gap-5 lg:gap-6">
        <Reveal delay={0} flat={flat}>
          <PanelCard
            eyebrow="Saved"
            title="Mentors you're tracking"
            viewAllTo="/dashboard/saved"
          >
            <SavedMentorsBlock />
          </PanelCard>
        </Reveal>
        <Reveal delay={80} flat={flat}>
          <PanelCard
            eyebrow="History"
            title="Hours you've already invested"
            viewAllTo="/dashboard/sessions"
          >
            <PastSessionsBlock />
          </PanelCard>
        </Reveal>
      </div>

      <div className="flex flex-col gap-5 lg:gap-6">
        <Reveal delay={40} flat={flat}>
          <PanelCard
            eyebrow="Suggested"
            title="People worth an hour of yours"
          >
            <RecommendationsBlock />
          </PanelCard>
        </Reveal>
        <Reveal delay={120} flat={flat}>
          <PanelCard eyebrow="Spending" title="What you've put in" viewAllTo="/dashboard/billing">
            <SpendingSummary />
          </PanelCard>
        </Reveal>
      </div>
    </div>
  );
}
