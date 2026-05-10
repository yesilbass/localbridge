import { useEffect, useMemo, useState } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast.jsx';
import supabase from '../../api/supabase';
import { useDashboardRole, useActiveRole } from './dashboardHooks.js';
import DashboardShell from './DashboardShell.jsx';
import NextSessionCard from './NextSessionCard.jsx';
import ActivityFeed from './ActivityFeed.jsx';
import MenteeSection from './MenteeSection.jsx';
import MentorSection from './MentorSection.jsx';
import SessionsPage from './SessionsPage.jsx';
import AvailabilityPage from './AvailabilityPage.jsx';
import SavedPage from './SavedPage.jsx';
import EarningsPage from './EarningsPage.jsx';
import ReviewsPage from './ReviewsPage.jsx';
import BillingPage from './BillingPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import { useI18n } from '../../i18n';

// ─── home content ─────────────────────────────────────────────────────────

function DashboardHome({ activeRole }) {
  return (
    <>
      <NextSessionCard activeRole={activeRole} />
      <ActivityFeed activeRole={activeRole} />
      <div className="mt-8">
        {activeRole === 'mentor' ? <MentorSection /> : <MenteeSection />}
      </div>
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
        style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
      >
        {t('dashboard.retry', 'Retry')}
      </button>
    </div>
  );
}

function usePageTitle() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  return useMemo(() => {
    const translated = {
      '': t('common.home', 'Home'),
      sessions: t('common.sessions', 'Sessions'),
      availability: t('common.availability', 'Availability'),
      saved: t('common.saved', 'Saved'),
      calendar: 'Calendar',
      earnings: t('common.earnings', 'Earnings'),
      reviews: t('common.reviews', 'Reviews'),
      billing: t('common.billing', 'Billing'),
      profile: t('nav.profile', 'Profile'),
      settings: t('nav.settings', 'Settings'),
    };
    const tail = pathname.replace(/^\/dashboard\/?/, '').split('/')[0] ?? '';
    return translated[tail] ?? t('common.home', 'Home');
  }, [pathname, t]);
}

// ─── page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role, isLoading, user } = useDashboardRole();
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [checking, setChecking] = useState(role === 'mentor');
  const [errored, setErrored] = useState(false);
  const pageTitle = usePageTitle();

  useEffect(() => {
    let cancelled = false;
    if (!user || role !== 'mentor') { setChecking(false); return undefined; }
    setChecking(true);
    void (async () => {
      try {
        const { data } = await supabase
          .from('mentor_profiles')
          .select('onboarding_complete')
          .eq('user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        setOnboardingComplete(data?.onboarding_complete ?? false);
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

  if (isLoading || checking) {
    return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'mentor' && !onboardingComplete) return <Navigate to="/onboarding" replace />;

  return (
    <DashboardShell
      pageTitle={pageTitle}
      activeRole={activeRole}
      hasBothRoles={hasBothRoles}
      onSwitchRole={() => setActiveRole(activeRole === 'mentor' ? 'mentee' : 'mentor')}
    >
      {errored ? (
        <DashboardError onRetry={() => window.location.reload()} />
      ) : (
        <Routes>
          <Route index element={<DashboardHome activeRole={activeRole} />} />
          <Route path="sessions" element={<SessionsPage />} />
          {activeRole === 'mentor' && <Route path="availability" element={<AvailabilityPage />} />}
          {activeRole === 'mentee' && <Route path="saved" element={<SavedPage />} />}
          {activeRole === 'mentor' && <Route path="calendar" element={<Navigate to="/dashboard/sessions" replace />} />}
          {activeRole === 'mentor' && <Route path="earnings" element={<EarningsPage />} />}
          {activeRole === 'mentor' && <Route path="reviews" element={<ReviewsPage />} />}
          {activeRole === 'mentee' && <Route path="billing" element={<BillingPage />} />}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundStub />} />
        </Routes>
      )}
      <OnboardingModal />
      <CalendarSuccessToast />
    </DashboardShell>
  );
}
