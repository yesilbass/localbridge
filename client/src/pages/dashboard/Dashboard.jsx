/**
 * Dashboard — full top-tab layout (no sidebar).
 * Header band with greeting + stats, then horizontal tabs, then content.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Settings,
  Plus, X, AlertCircle, LogOut, Sparkles, TrendingUp,
  Clock, Star, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import { useDashboardData } from './useDashboardData.js';
import {
  getFirstName, getTimeGreeting, getTodayLabel,
  getAvatarColor, getInitials,
} from './dashboardUtils.js';
import { MentorDashboardContent } from './MentorDashboardContent.jsx';
import { MenteeDashboardContent } from './MenteeDashboardContent.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast';

// ─── Animated tab indicator ────────────────────────────────────────────────────
function TabBar({ tabs, activeTab, setActiveTab }) {
  const tabRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0 });

  // Use offsetLeft so measurement is always relative to the same scroll container
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (!el) return;
    setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab, tabs]);

  return (
    <div className="border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/95 backdrop-blur-xl">
      {/* Scrollable row — position:relative so the indicator is scoped here */}
      <div className="relative mx-auto flex max-w-[90rem] overflow-x-auto px-4 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Sliding underline — lives inside the same relative container as the tabs */}
        <div aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(234,88,12,0.55)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: pill.left, width: pill.width }} />

        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button"
              ref={el => { tabRefs.current[tab.id] = el; }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 sm:px-5 ${
                active
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
              }`}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums transition-colors ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)] ring-1 ring-[var(--bridge-border)]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, value, label, accent = false }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 transition hover:ring-orange-400/40 ${
      accent
        ? 'bg-orange-500/10 text-orange-600 ring-orange-400/25 dark:text-orange-300'
        : 'bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] ring-[var(--bridge-border)]'
    }`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-bold text-[var(--bridge-text)]">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = isMentorAccount(user);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const initialReviewSession = location.state?.reviewSession ?? null;
  const dash = useDashboardData(user, authLoading);

  if (authLoading)      return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  if (!user)            return <Navigate to="/login" replace />;
  if (dash.dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" size="lg" />;
  if (isMentor && !dash.mentorOnboardingComplete) return <Navigate to="/onboarding" replace />;

  const firstName    = getFirstName(user);
  const greeting     = getTimeGreeting();
  const avatarColor  = getAvatarColor(user?.user_metadata?.full_name ?? user?.email ?? '');
  const avatarInits  = getInitials(user?.user_metadata?.full_name ?? user?.email ?? '');
  const upcomingCount = dash.upcomingSessions?.length ?? 0;
  const totalSessions = dash.sessions?.length ?? 0;
  const pendingCount  = dash.sessions?.filter(s => s.status === 'pending').length ?? 0;

  const TABS = [
    { id: 'overview',    label: 'Overview',                         icon: LayoutDashboard              },
    { id: 'sessions',    label: 'Sessions',                         icon: CalendarDays, count: upcomingCount },
    { id: 'connections', label: isMentor ? 'Mentees' : 'My Mentors', icon: Users                      },
    { id: 'settings',   label: 'Settings',                          icon: Settings                     },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] selection:bg-orange-200/50 selection:text-stone-900 dark:selection:bg-orange-900/50">

      {/* ── Ambient background radial ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 60% -10%, rgba(251,146,60,0.07), transparent 65%)' }} />

      {/* ═══════════════════════════════════════════════════════
          DASHBOARD HEADER — sticky under main navbar
      ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-[3.75rem] z-30 sm:top-16">

        {/* Greeting + actions band */}
        <div className="relative border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/95 backdrop-blur-xl">
          {/* Top accent */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 dark:opacity-100"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.18) 40%, rgba(251,146,60,0.18) 60%, transparent)' }} />
          {/* Noise */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.015]" />

          <div className="relative mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">

            {/* Left: greeting + meta */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ring-2 ring-[var(--bridge-border)] sm:flex ${avatarColor}`}>
                {user.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                  : avatarInits}
              </div>

              <div className="min-w-0">
                {/* Greeting */}
                <h1 className="truncate font-display text-xl font-black tracking-tight text-[var(--bridge-text)] sm:text-2xl">
                  Good {greeting},{' '}
                  <span className="text-gradient-bridge">{firstName}</span>
                  {greeting === 'morning' ? ' ☀️' : greeting === 'afternoon' ? ' 🌤' : ' 🌙'}
                </h1>
                {/* Date + role */}
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[var(--bridge-text-faint)]">{getTodayLabel()}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-bold uppercase tracking-[0.12em] ${
                    isMentor
                      ? 'bg-orange-500/12 text-orange-600 dark:text-orange-300'
                      : 'bg-sky-500/10 text-sky-600 dark:text-sky-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse-soft ${isMentor ? 'bg-orange-500' : 'bg-sky-500'}`} />
                    {isMentor ? 'Mentor' : 'Mentee'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: stat chips + CTA */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mini stat chips */}
              <div className="hidden items-center gap-1.5 sm:flex">
                <StatChip icon={CalendarDays} value={totalSessions}  label="total sessions" />
                <StatChip icon={Clock}        value={upcomingCount}  label="upcoming"       accent={upcomingCount > 0} />
                {isMentor && pendingCount > 0 && (
                  <StatChip icon={TrendingUp} value={pendingCount}   label="pending"        accent />
                )}
              </div>

              {/* Primary action */}
              {!isMentor ? (
                <Link to="/mentors"
                  className="btn-sheen flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_16px_-4px_rgba(234,88,12,0.5)] transition hover:shadow-[0_8px_24px_-4px_rgba(234,88,12,0.65)] hover:brightness-105">
                  <Plus className="h-3.5 w-3.5" />
                  Find a Mentor
                </Link>
              ) : (
                <button type="button" onClick={() => setActiveTab('sessions')}
                  className="btn-sheen flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_16px_-4px_rgba(234,88,12,0.5)] transition hover:shadow-[0_8px_24px_-4px_rgba(234,88,12,0.65)] hover:brightness-105">
                  <CalendarDays className="h-3.5 w-3.5" />
                  View Schedule
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ═══════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════ */}
      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Error banner */}
        {dash.error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3.5 text-sm shadow-sm dark:border-red-400/25 dark:bg-red-500/10">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="flex-1 text-red-700 dark:text-red-200">{dash.error}</p>
            <button type="button" onClick={() => dash.setError(null)}
              className="shrink-0 rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isMentor ? (
          <MentorDashboardContent
            dash={dash} activeTab={activeTab} setActiveTab={setActiveTab}
            logout={logout} user={user} />
        ) : (
          <MenteeDashboardContent
            dash={dash} activeTab={activeTab} setActiveTab={setActiveTab}
            logout={logout} user={user} initialReviewSession={initialReviewSession} />
        )}
      </main>

      <OnboardingModal />
      <CalendarSuccessToast />
    </div>
  );
}
