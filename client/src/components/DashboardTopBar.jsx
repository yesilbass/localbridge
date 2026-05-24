import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut, User, Settings, Menu, X, Search, CalendarCheck, Clock,
  DollarSign, Star, Heart, FileText, CreditCard, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import NotificationPanel from './NotificationPanel';
import { useI18n } from '../i18n';

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const MENTEE_LINKS = [
  { to: '/dashboard/mentors', labelKey: 'nav.mentors', fallback: 'Mentors', icon: Search },
  { to: '/dashboard/sessions', labelKey: 'common.sessions', fallback: 'Sessions', icon: CalendarCheck },
  { to: '/dashboard/saved', labelKey: 'common.saved', fallback: 'Saved', icon: Heart },
  { to: '/dashboard/resume', labelKey: 'nav.resume', fallback: 'Resume', icon: FileText },
];

const MENTOR_LINKS = [
  { to: '/dashboard/sessions', labelKey: 'common.sessions', fallback: 'Sessions', icon: CalendarCheck },
  { to: '/dashboard/availability', labelKey: 'common.availability', fallback: 'Availability', icon: Clock },
  { to: '/dashboard/earnings', labelKey: 'common.earnings', fallback: 'Earnings', icon: DollarSign },
  { to: '/dashboard/reviews', labelKey: 'common.reviews', fallback: 'Reviews', icon: Star },
];

function NavItem({ to, end, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `bridge-focus inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[14px] font-semibold transition-colors sm:px-4 ${
          isActive ? 'is-active' : ''
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
        backgroundColor: isActive
          ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
          : 'transparent',
      })}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

export default function DashboardTopBar({
  activeRole = 'mentee',
  navbarH = '3.5rem',
}) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMentor = activeRole === 'mentor';
  const linkDefs = isMentor ? MENTOR_LINKS : MENTEE_LINKS;
  const navLinks = linkDefs.map((item) => ({
    ...item,
    label: t(item.labelKey, item.fallback),
  }));

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, activeRole]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    setMobileOpen(false);
    try { await logout(); } catch { /* ignore */ }
    navigate('/');
  }

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          height: navbarH,
          backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 96%, transparent)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--bridge-border)',
        }}
      >
        <div className="flex h-full w-full items-center gap-6 px-5 sm:px-8 lg:px-10">
          <Link
            to="/dashboard"
            className="bridge-focus shrink-0 font-display text-[1.05rem] font-black tracking-[-0.04em] sm:text-[1.12rem]"
            style={{ color: 'var(--bridge-text)', lineHeight: 1 }}
          >
            mentorshipbridge
          </Link>

          <nav
            aria-label="Dashboard"
            className="hidden min-w-0 flex-1 items-center gap-1 md:flex lg:gap-2"
          >
            {navLinks.map(({ to, end, label, icon }) => (
              <NavItem key={to} to={to} end={end} label={label} icon={icon} />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:ml-auto">
            <NotificationPanel />

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 160)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="bridge-focus flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                }}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  getInitials(user?.user_metadata?.full_name || user?.email || '')
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="animate-pop-in absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border py-1"
                  style={{
                    backgroundColor: 'var(--bridge-surface-raised)',
                    borderColor: 'var(--bridge-border)',
                    boxShadow: '0 16px 40px -16px color-mix(in srgb, var(--bridge-text) 30%, transparent)',
                  }}
                >
                  <div className="border-b px-3.5 py-2.5" style={{ borderColor: 'var(--bridge-border)' }}>
                    <p className="truncate text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
                      {user?.user_metadata?.full_name ?? user?.email}
                    </p>
                  </div>
                  {[
                    { to: '/dashboard/profile', icon: User, label: t('nav.profile', 'Profile') },
                    ...(!isMentor ? [
                      { to: '/dashboard/plan', icon: Sparkles, label: t('nav.pricing', 'Plans') },
                      { to: '/dashboard/billing', icon: CreditCard, label: t('common.billing', 'Billing') },
                    ] : []),
                    { to: '/dashboard/settings', icon: Settings, label: t('nav.settings', 'Settings') },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      className="bridge-focus flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium transition hover:bg-[var(--bridge-surface-muted)]"
                      style={{ color: 'var(--bridge-text-secondary)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 opacity-70" aria-hidden />
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="bridge-focus flex w-full items-center gap-2 border-t px-3.5 py-2 text-[13px] font-semibold text-red-500 transition hover:bg-red-500/8"
                    style={{ borderColor: 'var(--bridge-border)' }}
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    {t('nav.logout', 'Log out')}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="bridge-focus flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
              style={{ color: 'var(--bridge-text)', backgroundColor: 'var(--bridge-surface-muted)' }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute inset-x-0 top-0 flex max-h-[85vh] flex-col overflow-y-auto rounded-b-2xl border-b px-4 pb-6 pt-[calc(var(--navbar-h,3.5rem)+12px)]"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              borderColor: 'var(--bridge-border)',
              boxShadow: '0 24px 48px -20px color-mix(in srgb, var(--bridge-text) 25%, transparent)',
            }}
          >
            <nav aria-label="Dashboard mobile" className="flex flex-col gap-0.5">
              {navLinks.map(({ to, end, label, icon }) => (
                <NavItem key={to} to={to} end={end} label={label} icon={icon} />
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-0.5 border-t pt-4" style={{ borderColor: 'var(--bridge-border)' }}>
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="bridge-focus flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                <User className="h-4 w-4" aria-hidden />
                {t('nav.profile', 'Profile')}
              </Link>
              {!isMentor && (
                <>
                  <Link
                    to="/dashboard/plan"
                    onClick={() => setMobileOpen(false)}
                    className="bridge-focus flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium"
                    style={{ color: 'var(--bridge-text-secondary)' }}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    {t('nav.pricing', 'Plans')}
                  </Link>
                  <Link
                    to="/dashboard/billing"
                    onClick={() => setMobileOpen(false)}
                    className="bridge-focus flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium"
                    style={{ color: 'var(--bridge-text-secondary)' }}
                  >
                    <CreditCard className="h-4 w-4" aria-hidden />
                    {t('common.billing', 'Billing')}
                  </Link>
                </>
              )}
              <Link
                to="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className="bridge-focus flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                <Settings className="h-4 w-4" aria-hidden />
                {t('nav.settings', 'Settings')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bridge-focus mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-red-500"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {t('nav.logout', 'Log out')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
