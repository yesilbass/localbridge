import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Heart, UserRound, CreditCard, Settings,
  Clock, DollarSign, Star, PanelLeftClose, PanelLeftOpen, Search, FileText,
} from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useI18n } from '../../i18n';
import { useNextSession, useLiveCountdown } from './dashboardHooks.js';
import { usePerfTier, EASE, DUR_SHORT } from '../landing/landingHooks';

const MENTEE_LINKS = [
  { to: '/dashboard',          label: 'Home',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/mentors',  label: 'Browse',   icon: Search },
  { to: '/dashboard/sessions', label: 'Sessions', icon: CalendarCheck },
  { to: '/dashboard/saved',    label: 'Saved',    icon: Heart },
  { to: '/dashboard/resume',   label: 'Resume',   icon: FileText },
  { to: '/dashboard/billing',  label: 'Billing',  icon: CreditCard },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const MENTOR_LINKS = [
  { to: '/dashboard',          label: 'Home',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/sessions',     label: 'Sessions',     icon: CalendarCheck },
  { to: '/dashboard/availability', label: 'Availability', icon: Clock },
  { to: '/dashboard/earnings',     label: 'Earnings',     icon: DollarSign },
  { to: '/dashboard/reviews',  label: 'Reviews',  icon: Star },
  { to: '/dashboard/profile',  label: 'Profile',  icon: UserRound },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function formatNextUp(scheduledAt, now) {
  const delta = new Date(scheduledAt).getTime() - now;
  if (delta <= 0) return 'live now';
  const mins = Math.floor(delta / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins - hours * 60;
  return rem > 0 ? `in ${hours}h ${rem}m` : `in ${hours}h`;
}

function NextUpCard() {
  const { session } = useNextSession();
  const now = useLiveCountdown(session?.scheduledAt);
  // Hide when there is no session OR when the session has no concrete time
  // (mentee just booked, Calendly slot not yet picked) — the 1969-epoch bug.
  if (!session || !session.scheduledAt) return null;
  const delta = new Date(session.scheduledAt).getTime() - now;
  // Only show when within 24h.
  if (delta > 24 * 60 * 60 * 1000 || delta < -30 * 60 * 1000) return null;

  return (
    <NavLink
      to="/dashboard/sessions"
      className="bridge-focus block rounded-xl p-3 transition-colors"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: 'var(--bridge-text-muted)' }}
      >
        Next up
      </p>
      <p
        className="mt-0.5 text-[12px] font-semibold tabular-nums"
        style={{ color: 'var(--bridge-text)' }}
      >
        {formatNextUp(session.scheduledAt, now)}
      </p>
    </NavLink>
  );
}

export default function Sidebar({ activeRole, isCollapsed, onToggleCollapsed }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  const menteeLinks = [
    { ...MENTEE_LINKS[0], label: t('common.home', 'Home') },
    { ...MENTEE_LINKS[1], label: t('nav.mentors', 'Browse') },
    { ...MENTEE_LINKS[2], label: t('common.sessions', 'Sessions') },
    { ...MENTEE_LINKS[3], label: t('common.saved', 'Saved') },
    { ...MENTEE_LINKS[4], label: t('nav.resume', 'Resume') },
    { ...MENTEE_LINKS[5], label: t('common.billing', 'Billing') },
    { ...MENTEE_LINKS[6], label: t('nav.settings', 'Settings') },
  ];
  const mentorLinks = [
    { ...MENTOR_LINKS[0], label: t('common.home', 'Home') },
    { ...MENTOR_LINKS[1], label: t('common.sessions', 'Sessions') },
    { ...MENTOR_LINKS[2], label: t('common.availability', 'Availability') },
    { ...MENTOR_LINKS[3], label: t('common.earnings', 'Earnings') },
    { ...MENTOR_LINKS[4], label: t('common.reviews', 'Reviews') },
    { ...MENTOR_LINKS[5], label: t('nav.profile', 'Profile') },
    { ...MENTOR_LINKS[6], label: t('nav.settings', 'Settings') },
  ];
  const links = activeRole === 'mentor' ? mentorLinks : menteeLinks;

  return (
    <aside
      className="sidebar hidden flex-col lg:flex"
      style={{
        width: 'var(--sidebar-w)',
        backgroundColor: 'var(--bridge-surface)',
        borderRight: '1px solid var(--bridge-border)',
        transition: 'width 220ms cubic-bezier(0.16,1,0.3,1)',
        gridColumn: 1,
        position: 'sticky',
        top: 'var(--navbar-h)',
        height: 'calc(100vh - var(--navbar-h))',
        alignSelf: 'start',
        zIndex: 30,
      }}
    >
      {/* Nav */}
      <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-5">
        {links.map((link, i) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              end={link.end}
              title={isCollapsed ? link.label : undefined}
              className={({ isActive }) =>
                `bridge-focus group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  isActive ? 'is-active' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                backgroundColor: isActive
                  ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  : 'transparent',
                animation: flat ? 'none' : `bridge-page-enter 360ms cubic-bezier(0.16,1,0.3,1) both`,
                animationDelay: flat ? '0ms' : `${i * 30}ms`,
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 w-[2px] -translate-y-1/2 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      height: isActive ? '100%' : '0%',
                      transition: flat
                        ? 'none'
                        : `height ${DUR_SHORT * 1000}ms cubic-bezier(${EASE.join(',')})`,
                    }}
                  />
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="flex flex-col gap-3 px-3 pb-4 pt-3"
        style={{ borderTop: '1px solid var(--bridge-border)' }}
      >
        {!isCollapsed ? <NextUpCard /> : null}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? t('dashboard.expandSidebar', 'Expand sidebar') : t('dashboard.collapseSidebar', 'Collapse sidebar')}
          aria-expanded={!isCollapsed}
          className="bridge-focus mx-auto grid h-7 w-7 place-items-center rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            color: 'var(--bridge-text-muted)',
          }}
        >
          {isCollapsed
            ? <PanelLeftOpen className="h-4 w-4" aria-hidden />
            : <PanelLeftClose className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </aside>
  );
}
