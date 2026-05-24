import { useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast.jsx';
import ReviewModal from '../../components/ReviewModal.jsx';
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
import Mentors from '../Mentors/index.jsx';
import MentorProfile from '../mentor-profile/index.jsx';
import Pricing from '../Pricing/index.jsx';

import PageHeader from './home/PageHeader.jsx';
import HomeHeader from './home/HomeHeader.jsx';
import HomeNowStrip from './home/HomeNowStrip.jsx';
import HomeAtAGlance from './home/HomeAtAGlance.jsx';
import NextSessionCard from './NextSessionCard.jsx';
import ProfileHealthCard from './ProfileHealthCard.jsx';
import { useProfileHealth } from './dashboardHooks.js';

// ─── home content ─────────────────────────────────────────────────────────

function MentorHome({ activeRole }) {
  const { score, isLoading: healthLoading } = useProfileHealth();
  const showHealth = !healthLoading && score < 100;
  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      <HomeHeader activeRole={activeRole} />
      <HomeNowStrip activeRole={activeRole} />
      <NextSessionCard activeRole={activeRole} />
      <HomeAtAGlance activeRole={activeRole} />
      {showHealth ? <ProfileHealthCard /> : null}
    </div>
  );
}

function MenteeHome({ activeRole }) {
  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      <HomeHeader activeRole={activeRole} />
      <HomeNowStrip activeRole={activeRole} />
      <NextSessionCard activeRole={activeRole} />
      <HomeAtAGlance activeRole={activeRole} />
    </div>
  );
}

function DashboardHome({ activeRole }) {
  return activeRole === 'mentor'
    ? <MentorHome activeRole={activeRole} />
    : <MenteeHome activeRole={activeRole} />;
}

function PlanRoute() {
  return (
    <>
      <PageHeader title="Plans" subtitle="Upgrade platform access — mentor sessions stay free." />
      <Pricing embedded />
    </>
  );
}

function ResumeRoute() {
  return <ResumeReview embedded />;
}

function MentorsBrowseRoute() {
  return <Mentors embedded />;
}

function MentorProfileRoute() {
  return <MentorProfile embedded />;
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

// ─── page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role, isLoading, user } = useDashboardRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [postCallReview, setPostCallReview] = useState(null);

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

  const { active: activeRole } = useActiveRole(role || 'mentee');

  if (!user && isLoading) {
    return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  }
  if (!isLoading && !user) return <Navigate to="/login" replace />;

  return (
    <DashboardShell
      activeRole={activeRole}
    >
      <Routes>
        <Route index element={<DashboardHome activeRole={activeRole} />} />
        <Route path="sessions" element={<SessionsRoute />} />
        {activeRole === 'mentor' && <Route path="availability" element={<AvailabilityRoute />} />}
        {activeRole === 'mentee' && <Route path="saved" element={<SavedRoute />} />}
        {activeRole === 'mentee' && <Route path="mentors" element={<MentorsBrowseRoute />} />}
        {activeRole === 'mentee' && <Route path="mentors/:id" element={<MentorProfileRoute />} />}
        {activeRole === 'mentee' && <Route path="resume" element={<ResumeRoute />} />}
        {activeRole === 'mentor' && <Route path="calendar" element={<Navigate to="/dashboard/sessions" replace />} />}
        {activeRole === 'mentor' && <Route path="earnings" element={<EarningsRoute />} />}
        {activeRole === 'mentor' && <Route path="reviews" element={<ReviewsRoute />} />}
        {activeRole === 'mentee' && <Route path="plan" element={<PlanRoute />} />}
        {activeRole === 'mentee' && <Route path="billing" element={<BillingRoute />} />}
        <Route path="profile" element={<ProfileRoute isMentor={activeRole === 'mentor'} />} />
        <Route path="settings" element={<SettingsRoute />} />
        <Route path="*" element={<NotFoundStub />} />
      </Routes>
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
