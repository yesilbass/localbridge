import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Heart, UserRound, Settings,
  Calendar, Clock, DollarSign,
} from 'lucide-react';
import { useI18n } from '../../i18n';

const MENTEE_TABS = [
  { to: '/dashboard',          label: 'Home',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/sessions', label: 'Sessions', icon: CalendarCheck },
  { to: '/dashboard/saved',    label: 'Saved',    icon: Heart },
  { to: '/dashboard/profile',  label: 'Profile',  icon: UserRound },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const MENTOR_TABS = [
  { to: '/dashboard',          label: 'Home',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/sessions',     label: 'Sessions',     icon: CalendarCheck },
  { to: '/dashboard/availability', label: 'Hours',        icon: Clock },
  { to: '/dashboard/earnings',     label: 'Earnings',     icon: DollarSign },
  { to: '/dashboard/profile',      label: 'Profile',      icon: UserRound },
];

export default function MobileTabBar({ activeRole }) {
  const { t } = useI18n();
  const menteeTabs = [
    { ...MENTEE_TABS[0], label: t('common.home', 'Home') },
    { ...MENTEE_TABS[1], label: t('common.sessions', 'Sessions') },
    { ...MENTEE_TABS[2], label: t('common.saved', 'Saved') },
    { ...MENTEE_TABS[3], label: t('nav.profile', 'Profile') },
    { ...MENTEE_TABS[4], label: t('nav.settings', 'Settings') },
  ];
  const mentorTabs = [
    { ...MENTOR_TABS[0], label: t('common.home', 'Home') },
    { ...MENTOR_TABS[1], label: t('common.sessions', 'Sessions') },
    { ...MENTOR_TABS[2], label: t('common.hours', 'Hours') },
    { ...MENTOR_TABS[3], label: t('common.earnings', 'Earnings') },
    { ...MENTOR_TABS[4], label: t('nav.profile', 'Profile') },
  ];
  const tabs = activeRole === 'mentor' ? mentorTabs : menteeTabs;
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around lg:hidden"
      style={{
        backgroundColor: 'var(--bridge-surface)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--bridge-border) 50%, transparent 100%)',
        }}
      />
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <NavLink
            key={t.to + t.label}
            to={t.to}
            end={t.end}
            className="bridge-focus flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[10px] font-semibold"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
            })}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{t.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
