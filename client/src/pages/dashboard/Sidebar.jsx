import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Heart, UserRound, CreditCard, Settings,
  Clock, DollarSign, Star, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

const MENTEE_LINKS = [
  { to: '/dashboard',          label: 'Home',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/sessions', label: 'Sessions', icon: CalendarCheck },
  { to: '/dashboard/saved',    label: 'Saved',    icon: Heart },
  { to: '/dashboard/profile',  label: 'Profile',  icon: UserRound },
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

export default function Sidebar({ activeRole, isCollapsed, onToggleCollapsed }) {
  const links = activeRole === 'mentor' ? MENTOR_LINKS : MENTEE_LINKS;

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
      <nav aria-label="Dashboard" className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {links.map((link, i) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              end={link.end}
              title={isCollapsed ? link.label : undefined}
              className={({ isActive }) =>
                `bridge-focus group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold transition-colors ${
                  isActive ? 'is-active' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                backgroundColor: isActive
                  ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  : 'transparent',
                boxShadow: isActive ? 'inset 2px 0 0 var(--color-primary)' : 'none',
                animation: `bridge-page-enter 360ms cubic-bezier(0.16,1,0.3,1) both`,
                animationDelay: `${i * 30}ms`,
              })}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom — collapse only (Navbar owns the account menu) */}
      <div
        className="px-3 pb-4 pt-3 flex flex-col gap-2"
        style={{ borderTop: '1px solid var(--bridge-border)' }}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
