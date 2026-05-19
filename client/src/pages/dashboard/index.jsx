import { useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast.jsx';
import ReviewModal from '../../components/ReviewModal.jsx';
import supabase from '../../api/supabase';
import { useDashboardRole, useActiveRole } from './dashboardHooks.js';
import DashboardShell from './DashboardShell.jsx';
import SessionsPage from './SessionsPage.jsx';
import AvailabilityPage from './AvailabilityPage.jsx';
import SavedPage from './SavedPage.jsx';
import EarningsPage from './EarningsPage.jsx';
import ReviewsPage from './ReviewsPage.jsx';
import BillingPage from './BillingPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import { useI18n } from '../../i18n';

import PageHeader from './home/PageHeader.jsx';
import HomeHeader from './home/HomeHeader.jsx';
import HomeNowStrip from './home/HomeNowStrip.jsx';
import HomeAtAGlance from './home/HomeAtAGlance.jsx';
import HomeSpending from './home/HomeSpending.jsx';
import NextSessionCard from './NextSessionCard.jsx';
import RecommendationsBlock from './RecommendationsBlock.jsx';
import UpcomingSessionsBlock from './UpcomingSessionsBlock.jsx';
import ProfileHealthCard from './ProfileHealthCard.jsx';
import { useProfileHealth } from './dashboardHooks.js';
import MentorApplicationPending from '../../components/MentorApplicationPending.jsx';

// ─── home content ─────────────────────────────────────────────────────────

function MentorHome({ activeRole }) {
  const { score, isLoading: healthLoading } = useProfileHealth();
  const showHealth = !healthLoading && score < 100;
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <HomeHeader activeRole={activeRole} />
      <HomeNowStrip activeRole={activeRole} />
      <NextSessionCard activeRole={activeRole} />
      <HomeAtAGlance activeRole={activeRole} />
      <UpcomingSessionsBlock />
      {showHealth ? <ProfileHealthCard /> : null}
    </div>
  );
}

function MenteeHome({ activeRole }) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <HomeHeader activeRole={activeRole} />
      <HomeNowStrip activeRole={activeRole} />
      <NextSessionCard activeRole={activeRole} />
      <HomeAtAGlance activeRole={activeRole} />
      <UpcomingSessionsBlock />
      <RecommendationsBlock limit={2} />
      <HomeSpending />
    </div>
  );
}

function DashboardHome({ activeRole }) {
  return activeRole === 'mentor'
    ? <MentorHome activeRole={activeRole} />
    : <MenteeHome activeRole={activeRole} />;
}

// ─── sub-page wrappers (PageHeader + body) ────────────────────────────────

function SessionsRoute() {
  return (
    <>
      <PageHeader title="Sessions" subtitle="Past, upcoming, and pending." />
      <SessionsPage />
    </>
  );
}

function AvailabilityRoute() {
  return (
    <>
      <PageHeader
        title="Hours"
        subtitle="Set when mentees can book you."
      />
      <AvailabilityPage />
    </>
  );
}

function EarningsRoute() {
  return (
    <>
      <PageHeader title="Earnings" subtitle="Tracked nightly. Paid weekly." />
      <EarningsPage />
    </>
  );
}

function ReviewsRoute() {
  return (
    <>
      <PageHeader title="Reviews" subtitle="Every review, including the threes." />
      <ReviewsPage />
    </>
  );
}

function SavedRoute() {
  return (
    <>
      <PageHeader title="Saved mentors" subtitle="Your shortlist." />
      <SavedPage />
    </>
  );
}

function BillingRoute() {
  return (
    <>
      <PageHeader title="Billing" subtitle="Payment methods and receipts." />
      <BillingPage />
    </>
  );
}

function ProfileRoute({ isMentor }) {
  return (
    <>
      <PageHeader
        title={isMentor ? 'Your profile' : 'Your account'}
        subtitle={isMentor ? 'What mentees see when they find you.' : undefined}
      />
      <ProfilePage />
    </>
  );
}

function SettingsRoute() {
  return (
    <>
      <PageHeader title="Settings" />
      <SettingsPage />
    </>
  );
}

// ─── 404 inside dashboard (rare) ──────────────────────────────────────────

function NotFoundStub() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <p
        className="font-display text-[28px] font-black tracking-[-0.02em]"
        style={{ color: 'var(--bridge-text)' }}
      >
        {t('dashboard.pageMissingTitle', "That page doesn't exist.")}
      </p>
      <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
        {t('dashboard.pageMissingBody', 'Use the sidebar to navigate.')}
      </p>
    </div>
  );
}

// ─── error wrapper ────────────────────────────────────────────────────────

function DashboardError({ onRetry }) {
  const { t } = useI18n();
  return (
    <div
      className="rounded-3xl p-8 text-center"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <p
        className="font-display text-[20px] font-black tracking-[-0.02em]"
        style={{ color: 'var(--bridge-text)' }}
      >
        {t('dashboard.loadErrorTitle', "We couldn't load your dashboard.")}
      </p>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
        {t('dashboard.loadErrorBody', "That's on us, not you.")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="bridge-focus mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
      >
        {t('dashboard.retry', 'Retry')}
      </button>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role, isLoading, user } = useDashboardRole();
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [mentorStatus, setMentorStatus] = useState('active');
  const [applicationSubmittedAt, setApplicationSubmittedAt] = useState(null);
  const [checking, setChecking] = useState(role === 'mentor');
  const [errored, setErrored] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [postCallReview, setPostCallReview] = useState(null);

  // Mentee post-call review trigger: VideoCall navigates here with state.reviewSession.
  useEffect(() => {
    const rs = location.state?.reviewSession;
    if (!rs || !rs.sessionId || !rs.mentorId) return;
    setPostCallReview({
      sessionId: rs.sessionId,
      mentorId: rs.mentorId,
      mentorName: rs.mentorName || 'your mentor',
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;
    if (!user || role !== 'mentor') { setChecking(false); return undefined; }
    setChecking(true);
    void (async () => {
      try {
        const { data } = await supabase
          .from('mentor_profiles')
          .select('onboarding_complete, mentor_status, application_submitted_at')
          .eq('user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        setOnboardingComplete(data?.onboarding_complete ?? false);
        setMentorStatus(data?.mentor_status ?? null);
        setApplicationSubmittedAt(data?.application_submitted_at ?? null);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, role]);

  const hasBothRoles = false;
  const { active: activeRole, set: setActiveRole } = useActiveRole(role || 'mentee');

  // Show the full-page spinner only when we genuinely have no idea who the
  // user is (cold visit, no cached session). If `user` is already hydrated
  // from localStorage, render the dashboard shell immediately and let the
  // mentor onboarding check resolve in the background.
  if (!user && isLoading) {
    return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  }
  if (!isLoading && !user) return <Navigate to="/login" replace />;
  // Block render until the mentor status check resolves — prevents routing on stale defaults.
  if (role === 'mentor' && checking) {
    return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  }
  // Not yet submitted — redirect to application form regardless of status
  if (role === 'mentor' && !applicationSubmittedAt && mentorStatus !== 'active') {
    return <Navigate to="/onboarding/mentor" replace />;
  }
  // Submitted and in-flight — show waiting screen
  if (role === 'mentor' && applicationSubmittedAt && (mentorStatus === 'pending' || mentorStatus === 'under_review' || mentorStatus === 'suspended')) {
    return <MentorApplicationPending status={mentorStatus} />;
  }
  // Rejected — show re-apply screen
  if (role === 'mentor' && mentorStatus === 'rejected') {
    return <MentorApplicationPending status="rejected" />;
  }
  // Approved but profile not yet completed — go to onboarding (profile completion phase)
  if (role === 'mentor' && mentorStatus === 'active' && !onboardingComplete) {
    return <Navigate to="/onboarding/mentor" replace />;
  }

  return (
    <DashboardShell
      activeRole={activeRole}
      hasBothRoles={hasBothRoles}
      onSwitchRole={() => setActiveRole(activeRole === 'mentor' ? 'mentee' : 'mentor')}
    >
      {errored ? (
        <DashboardError onRetry={() => window.location.reload()} />
      ) : (
        <Routes>
          <Route index element={<DashboardHome activeRole={activeRole} />} />
          <Route path="sessions" element={<SessionsRoute />} />
          {activeRole === 'mentor' && <Route path="availability" element={<AvailabilityRoute />} />}
          {activeRole === 'mentee' && <Route path="saved" element={<SavedRoute />} />}
          {activeRole === 'mentor' && <Route path="calendar" element={<Navigate to="/dashboard/sessions" replace />} />}
          {activeRole === 'mentor' && <Route path="earnings" element={<EarningsRoute />} />}
          {activeRole === 'mentor' && <Route path="reviews" element={<ReviewsRoute />} />}
          {activeRole === 'mentee' && <Route path="billing" element={<BillingRoute />} />}
          <Route path="profile" element={<ProfileRoute isMentor={activeRole === 'mentor'} />} />
          <Route path="settings" element={<SettingsRoute />} />
          <Route path="*" element={<NotFoundStub />} />
        </Routes>
      )}
      <OnboardingModal />
      <CalendarSuccessToast />
      {postCallReview && (
        <ReviewModal
          sessionId={postCallReview.sessionId}
          mentorId={postCallReview.mentorId}
          mentorName={postCallReview.mentorName}
          onClose={() => setPostCallReview(null)}
          onSubmitted={() => setPostCallReview(null)}
        />
      )}
    </DashboardShell>
  );
}
