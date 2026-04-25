/**
 * Dashboard — shell with sidebar (desktop) + tab bar (mobile).
 * Auth gates, role detection, data fetching, and layout only.
 */

import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Settings,
  Plus, X, AlertCircle, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import { useDashboardData } from './useDashboardData.js';
import { getFirstName, getTimeGreeting, getTodayLabel, getAvatarColor, getInitials } from './dashboardUtils.js';
import { MentorDashboardContent } from './MentorDashboardContent.jsx';
import { MenteeDashboardContent } from './MenteeDashboardContent.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = isMentorAccount(user);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const initialReviewSession = location.state?.reviewSession ?? null;
  const dash = useDashboardData(user, authLoading);

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dash.dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" size="lg" />;
  if (isMentor && !dash.mentorOnboardingComplete) return <Navigate to="/onboarding" replace />;

  const firstName = getFirstName(user);
  const greeting  = getTimeGreeting();
  const avatarColor = getAvatarColor(user?.user_metadata?.full_name ?? user?.email ?? '');
  const avatarInits = getInitials(user?.user_metadata?.full_name ?? user?.email ?? '');
  const upcomingCount = dash.upcomingSessions?.length ?? 0;

  const TABS = [
    { id: 'overview',     label: 'Overview',                    icon: LayoutDashboard },
    { id: 'sessions',     label: 'Sessions',                    icon: CalendarDays,   count: upcomingCount },
    { id: 'connections',  label: isMentor ? 'Mentees' : 'My Mentors', icon: Users   },
    { id: 'settings',     label: 'Settings',                    icon: Settings        },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] selection:bg-orange-200/50 selection:text-stone-900 dark:selection:bg-orange-900/50">
      {/* subtle page tint */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-60 dark:opacity-30"
        style={{ background: 'radial-gradient(ellipse 100% 60% at 70% -10%, rgba(251,146,60,0.06), transparent 70%)' }}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-[15rem] xl:w-[16.5rem] shrink-0">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto border-r border-[var(--bridge-border)] bg-[var(--bridge-canvas)] py-5">

            {/* User card */}
            <div className="px-3 xl:px-4">
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--bridge-surface)] p-3 ring-1 ring-[var(--bridge-border)]">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${avatarColor}`}>
                  {avatarInits}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[var(--bridge-text)]">{firstName}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${
                    isMentor
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                  }`}>
                    <span className={`h-1 w-1 rounded-full animate-pulse-soft ${isMentor ? 'bg-orange-500' : 'bg-sky-500'}`} />
                    {isMentor ? 'Mentor' : 'Mentee'}
                  </span>
                </div>
              </div>
            </div>

            {/* Date */}
            <p className="mt-5 mb-2 px-4 xl:px-5 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--bridge-text-muted)]">
              {getTodayLabel()}
            </p>

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 px-2 xl:px-3" aria-label="Dashboard navigation">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50/60 text-orange-700 font-semibold dark:from-orange-500/20 dark:to-amber-500/10 dark:text-orange-300'
                        : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface)] hover:text-[var(--bridge-text)]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-transform ${active ? '' : 'group-hover:scale-105'}`} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                        active ? 'bg-orange-500 text-white' : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto" />

            {/* Bottom CTAs */}
            <div className="mt-4 flex flex-col gap-1 px-2 xl:px-3">
              {!isMentor && (
                <Link to="/mentors"
                  className="flex items-center gap-2.5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:text-stone-950">
                  <Plus className="h-4 w-4" />
                  Find a Mentor
                </Link>
              )}
              <button type="button" onClick={logout}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface)] hover:text-[var(--bridge-text)]">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content area ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Mobile sticky header */}
          <div className="lg:hidden sticky top-16 z-30 border-b border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-canvas)_88%,transparent)] backdrop-blur-xl">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent opacity-0 dark:opacity-100" />
            <div className="px-4 sm:px-6">
              <div className="flex items-center justify-between gap-3 pt-4 pb-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--bridge-text)] sm:text-3xl">
                  Good {greeting},{' '}
                  <span className="font-editorial italic text-gradient-bridge">{firstName}</span>
                </h1>
                {!isMentor && (
                  <Link to="/mentors"
                    className="hidden shrink-0 items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-orange-500 dark:text-stone-950 sm:inline-flex">
                    <Plus className="h-3.5 w-3.5" />Find a Mentor
                  </Link>
                )}
              </div>
              {/* Mobile tab bar */}
              <div className="-mb-px mt-2 flex gap-0.5 overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex shrink-0 items-center gap-1.5 rounded-t-xl px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm whitespace-nowrap ${
                        active ? 'text-orange-700 dark:text-orange-300' : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`flex h-4 min-w-[1rem] items-center justify-center rounded-full px-0.5 text-[9px] font-bold tabular-nums ${
                          active ? 'bg-orange-500 text-white' : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)]'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                      {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop greeting bar */}
          <div className="hidden lg:flex items-center justify-between border-b border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-canvas)_88%,transparent)] backdrop-blur-xl px-8 py-5">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent opacity-0 dark:opacity-100" />
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--bridge-text)]">
                Good {greeting},{' '}
                <span className="font-editorial italic text-gradient-bridge">{firstName}</span>
              </h1>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">{getTodayLabel()}</p>
            </div>
          </div>

          {/* Page content */}
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {dash.error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm dark:border-red-400/30 dark:bg-red-500/10">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="flex-1 text-red-800 dark:text-red-200">{dash.error}</p>
                <button type="button" onClick={() => dash.setError(null)}
                  className="shrink-0 rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {isMentor ? (
              <MentorDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} user={user} />
            ) : (
              <MenteeDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} user={user} initialReviewSession={initialReviewSession} />
            )}
          </main>
        </div>
      </div>

      <OnboardingModal />
      <CalendarSuccessToast />
    </div>
  );
}
