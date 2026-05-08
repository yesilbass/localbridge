import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Heart, UserRound, CreditCard, Settings,
  Calendar, DollarSign, Star, PanelLeftClose, PanelLeftOpen, ChevronDown, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';

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
  { to: '/dashboard/sessions', label: 'Sessions', icon: CalendarCheck },
  { to: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { to: '/dashboard/reviews',  label: 'Reviews',  icon: Star },
  { to: '/dashboard/profile',  label: 'Profile',  icon: UserRound },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function getInitials(name = '', email = '') {
  const src = (name || email || '').trim();
  if (!src) return '?';
  return src.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || src[0].toUpperCase();
}

export default function Sidebar({ activeRole, isCollapsed, onToggleCollapsed, hasBothRoles, onSwitchRole }) {
  const links = activeRole === 'mentor' ? MENTOR_LINKS : MENTEE_LINKS;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!popoverOpen) return;
    function onDoc(e) {
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setPopoverOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setPopoverOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [popoverOpen]);

  const fullName = user?.user_metadata?.full_name || user?.email || 'Account';
  const email = user?.email || '';

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
        top: 0,
        height: '100vh',
        alignSelf: 'start',
        zIndex: 30,
      }}
    >
      {/* Top — wordmark (matches Navbar) */}
      <div
        className="flex h-14 items-center px-5"
        style={{ borderBottom: '1px solid var(--bridge-border)' }}
      >
        <Link to="/dashboard" className="bridge-focus rounded-md flex items-baseline gap-1 min-w-0">
          <span
            className="font-display text-[1.05rem] font-black leading-none tracking-[-0.035em]"
            style={{ color: 'var(--bridge-text)' }}
          >
            Bridge
          </span>
          {!isCollapsed && (
            <span
              className="font-display text-[1.05rem] font-medium leading-none tracking-[-0.04em]"
              style={{ color: 'var(--bridge-text)' }}
            >
              Mentorship
            </span>
          )}
        </Link>
      </div>

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

      {/* Bottom — account + collapse */}
      <div
        className="px-3 pb-4 pt-3 flex flex-col gap-2"
        style={{ borderTop: '1px solid var(--bridge-border)' }}
      >
        <div className="relative">
          <button
            ref={btnRef}
            type="button"
            onClick={() => setPopoverOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={popoverOpen}
            className={`bridge-focus flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            style={{ color: 'var(--bridge-text)' }}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-black"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff',
              }}
              aria-hidden
            >
              {getInitials(fullName, email)}
            </span>
            {!isCollapsed && (
              <>
                <span className="flex min-w-0 flex-col items-start">
                  <span
                    className="truncate text-[13px] font-bold"
                    style={{ color: 'var(--bridge-text)' }}
                  >
                    {fullName}
                  </span>
                  <span
                    className="truncate text-[11px]"
                    style={{ color: 'var(--bridge-text-muted)' }}
                  >
                    {email}
                  </span>
                </span>
                <ChevronDown
                  className="ml-auto h-3.5 w-3.5"
                  style={{ color: 'var(--bridge-text-muted)' }}
                />
              </>
            )}
          </button>

          {popoverOpen && (
            <div
              ref={popRef}
              role="menu"
              className="animate-pop-in absolute bottom-full left-0 right-0 mb-2 rounded-xl p-2 shadow-bridge-glow"
              style={{
                backgroundColor: 'var(--bridge-surface-raised)',
                border: '1px solid var(--bridge-border-strong)',
              }}
            >
              <Link
                to="/dashboard/profile"
                role="menuitem"
                onClick={() => setPopoverOpen(false)}
                className="bridge-focus flex items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--bridge-text)_6%,transparent)]"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                <UserRound className="h-3.5 w-3.5" aria-hidden /> My profile
              </Link>
              {hasBothRoles && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onSwitchRole?.(); setPopoverOpen(false); }}
                  className="bridge-focus flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--bridge-text)_6%,transparent)]"
                  style={{ color: 'var(--bridge-text-secondary)' }}
                >
                  Switch role
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={async () => { await logout(); setPopoverOpen(false); navigate('/'); }}
                className="bridge-focus flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--bridge-text)_6%,transparent)]"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
              </button>
            </div>
          )}
        </div>

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
