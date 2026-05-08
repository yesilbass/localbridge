import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import EarningsCard from './EarningsCard.jsx';
import ProfileHealthCard from './ProfileHealthCard.jsx';
import UpcomingSessionsBlock from './UpcomingSessionsBlock.jsx';
import ReviewsRecentBlock from './ReviewsRecentBlock.jsx';
import supabase from '../../api/supabase';
import { useDashboardSessions } from './dashboardHooks.js';
import { normalizeAvailabilitySchedule } from '../../utils/mentorAvailability';

/**
 * Compact one-liner that only renders when the mentor has *no* hours set
 * (which means their profile is hidden from search). Quietly disappears
 * once availability is configured — no nag.
 */
function NoAvailabilityBanner() {
  const { mentorProfileId } = useDashboardSessions();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!mentorProfileId) return;
    supabase
      .from('mentor_profiles')
      .select('availability_schedule')
      .eq('id', mentorProfileId)
      .maybeSingle()
      .then(({ data }) => {
        const norm = normalizeAvailabilitySchedule(data?.availability_schedule ?? null);
        const total = Object.values(norm.weekly).reduce((s, arr) => s + arr.length, 0);
        setHidden(total > 0);
      });
  }, [mentorProfileId]);

  if (hidden) return null;

  return (
    <Link
      to="/dashboard/sessions"
      className="bridge-focus flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 32%, transparent)',
      }}
    >
      <AlertTriangle
        className="h-4 w-4 shrink-0"
        style={{ color: 'var(--color-warning)' }}
        aria-hidden
      />
      <span className="flex-1 text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
        You haven't set any hours — mentees can't book you yet.
      </span>
      <span
        className="inline-flex items-center gap-1 text-[12px] font-bold"
        style={{ color: 'var(--color-warning)' }}
      >
        Set availability <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  );
}

export default function MentorSection() {
  return (
    <div className="flex flex-col gap-8">
      <NoAvailabilityBanner />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <EarningsCard />
        <ProfileHealthCard />
      </div>
      <UpcomingSessionsBlock />
      <ReviewsRecentBlock />
    </div>
  );
}
