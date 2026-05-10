import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RevealOnScroll from '../../landing/RevealOnScroll';
import { useReducedMotion } from 'motion/react';
import { usePerfTier } from '../../landing/landingHooks';
import EarningsCard from '../EarningsCard.jsx';
import ProfileHealthCard from '../ProfileHealthCard.jsx';
import UpcomingSessionsBlock from '../UpcomingSessionsBlock.jsx';
import ReviewsRecentBlock from '../ReviewsRecentBlock.jsx';

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

export default function HomeMentorPanel() {
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
      <div className="flex flex-col gap-5 lg:gap-6">
        <Reveal delay={0} flat={flat}>
          <PanelCard
            eyebrow="Earnings"
            title="This month at a glance"
            viewAllTo="/dashboard/earnings"
          >
            <EarningsCard />
          </PanelCard>
        </Reveal>
        <Reveal delay={80} flat={flat}>
          <PanelCard
            eyebrow="Upcoming"
            title="Next three on the books"
            viewAllTo="/dashboard/sessions"
          >
            <UpcomingSessionsBlock />
          </PanelCard>
        </Reveal>
      </div>

      <div className="flex flex-col gap-5 lg:gap-6">
        <Reveal delay={40} flat={flat}>
          <PanelCard eyebrow="Profile" title="What mentees see">
            <ProfileHealthCard />
          </PanelCard>
        </Reveal>
        <Reveal delay={120} flat={flat}>
          <PanelCard
            eyebrow="Reviews"
            title="Latest from your mentees"
            viewAllTo="/dashboard/reviews"
          >
            <ReviewsRecentBlock />
          </PanelCard>
        </Reveal>
      </div>
    </div>
  );
}
