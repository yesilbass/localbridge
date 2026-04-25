import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { Bell, LogOut, User, Settings, Sparkles, Menu, X, ChevronRight } from 'lucide-react';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const asMentor = user ? isMentorAccount(user) : false;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    setMobileOpen(false);
    try { await logout(); } catch { /* ignore */ }
    navigate('/');
  }

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Build nav items based on account type
  const navItems = asMentor
    ? [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/pricing', label: 'Pricing' },
        { path: '/about', label: 'About', desktopOnly: true },
      ]
    : [
        { path: '/mentors', label: 'Mentors' },
        ...(user ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
        { path: '/resume', label: 'Resume', ai: true },
        { path: '/pricing', label: 'Pricing' },
        { path: '/about', label: 'About', desktopOnly: true },
      ];

  function DesktopNavLink({ path, label, ai = false }) {
    const active = isActive(path);
    return (
      <Link
        to={path}
        className={`group relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-150 ${
          active
            ? 'text-stone-950 dark:text-stone-50'
            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
        }`}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-stone-100 ring-1 ring-stone-200/70 dark:bg-white/[0.08] dark:ring-white/10"
          />
        )}
        {!active && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100 bg-stone-100/70 dark:bg-white/[0.05]"
          />
        )}
        <span className="relative z-10">{label}</span>
        {ai && (
          <span
            aria-label="AI powered"
            className="relative z-10 inline-flex items-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_2px_8px_-1px_rgba(234,88,12,0.5)]"
          >
            AI
          </span>
        )}
        {active && (
          <span
            aria-hidden
            className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-orange-500/55 to-transparent"
          />
        )}
      </Link>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200/75 bg-white/92 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/75 dark:border-white/[0.07] dark:bg-stone-950/88">
        {/* Brand glow — always-on top edge accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
        />

        <nav className="relative mx-auto flex h-[3.75rem] max-w-bridge items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="group relative flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-[0_4px_14px_-3px_rgba(234,88,12,0.52)] transition-all duration-300 group-hover:shadow-[0_8px_24px_-4px_rgba(234,88,12,0.68)] group-hover:brightness-105">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/28 to-transparent opacity-60 transition group-hover:opacity-95"
              />
              <span className="relative text-[1.05rem] font-bold">B</span>
            </span>
            <div className="hidden flex-col sm:flex">
              <span className="font-display text-[1.05rem] font-bold leading-tight tracking-tight text-stone-900 dark:text-stone-50">
                Bridge
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] leading-none text-orange-600/75 dark:text-orange-400/75">
                Mentorship
              </span>
            </div>
          </Link>

          {/* ── Desktop center nav ── */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <DesktopNavLink key={item.path} {...item} />
            ))}
          </div>

          {/* ── Right: auth controls + mobile toggle ── */}
          <div className="flex items-center gap-1.5">

            {/* Desktop auth */}
            {loading ? (
              <div className="hidden h-9 w-24 animate-pulse rounded-full bg-stone-200/70 dark:bg-white/[0.06] sm:block" aria-hidden />
            ) : user ? (
              <div className="hidden items-center gap-0.5 sm:flex">
                {/* Notification bell */}
                <button
                  type="button"
                  onClick={() => alert('No new notifications.')}
                  className="relative rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-400 dark:hover:bg-white/[0.07] dark:hover:text-stone-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                    <span aria-hidden className="absolute inline-flex h-full w-full rounded-full bg-orange-400/70 opacity-75 animate-pulse-soft" />
                    <span className="relative inline-flex h-2 w-2 rounded-full border-2 border-white bg-orange-500 dark:border-stone-900" />
                  </span>
                </button>

                {/* Avatar + dropdown */}
                <div className="relative ml-1">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-bold text-stone-800 ring-2 ring-white transition-all hover:ring-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:bg-stone-700 dark:text-stone-100 dark:ring-stone-800"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-80"
                      style={{
                        background: 'conic-gradient(from 140deg, rgba(251,146,60,0.9), rgba(234,88,12,0.35), rgba(253,230,138,0.85), rgba(251,146,60,0.9))',
                        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        padding: '1.5px',
                      }}
                    />
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="relative">{getInitials(user.user_metadata?.full_name || user.email)}</span>
                    )}
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/96 shadow-[0_28px_60px_-18px_rgba(28,25,23,0.28)] backdrop-blur-xl animate-pop-in dark:border-white/10 dark:bg-stone-900/96 dark:shadow-[0_28px_80px_-18px_rgba(234,88,12,0.28)]"
                    >
                      <div className="relative border-b border-stone-100 px-4 py-3 dark:border-white/[0.08]">
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
                        <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50" title={user.user_metadata?.full_name ?? user.email}>
                          {user.user_metadata?.full_name ?? user.email}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
                        <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                          asMentor
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 ring-1 ring-amber-300/60 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-200 dark:ring-amber-400/30'
                            : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200 dark:bg-white/[0.06] dark:text-stone-300 dark:ring-white/10'
                        }`}>
                          {asMentor ? <><Sparkles className="h-3 w-3" aria-hidden /> Mentor</> : 'Member'}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link to="/profile" onClick={() => setMenuOpen(false)} className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-orange-50/60 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                          <User className="h-4 w-4 text-stone-400 transition group-hover:text-orange-500 dark:text-stone-500 dark:group-hover:text-orange-400" />
                          Profile
                        </Link>
                        <Link to="/settings" onClick={() => setMenuOpen(false)} className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-orange-50/60 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                          <Settings className="h-4 w-4 text-stone-400 transition group-hover:text-orange-500 dark:text-stone-500 dark:group-hover:text-orange-400" />
                          Settings
                        </Link>
                        {!asMentor && (
                          <Link to="/mentors" onClick={() => setMenuOpen(false)} className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-orange-50/60 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                            <Sparkles className="h-4 w-4 text-stone-400 transition group-hover:text-orange-500 dark:text-stone-500 dark:group-hover:text-orange-400" />
                            Find a mentor
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-stone-100 dark:border-white/[0.08]">
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/[0.08]">
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex sm:gap-2.5">
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  data-magnet="6"
                  className="magnetic btn-sheen relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(234,88,12,0.48)] hover:shadow-[0_10px_28px_-6px_rgba(234,88,12,0.65)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* ── Mobile hamburger ── */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/80 bg-stone-50/80 text-stone-700 transition hover:border-stone-300 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 md:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08]"
            >
              <span className={`absolute transition-all duration-250 ${mobileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <X className="h-5 w-5" />
              </span>
              <span className={`absolute transition-all duration-250 ${mobileOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                <Menu className="h-5 w-5" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-stone-950/55 backdrop-blur-[3px]" aria-hidden />

          {/* Drawer panel */}
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,22rem)] flex-col bg-white shadow-[0_0_80px_-20px_rgba(28,25,23,0.5)] dark:bg-stone-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            {/* Drawer header */}
            <div className="flex shrink-0 items-center justify-between border-b border-stone-200/80 px-5 py-4 dark:border-white/[0.08]">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white shadow-[0_4px_12px_-2px_rgba(234,88,12,0.45)]">B</span>
                <span className="font-display text-lg font-bold text-stone-900 dark:text-stone-50">Bridge</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/[0.08]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-0.5">
                {navItems.filter(item => !item.desktopOnly).map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? 'bg-orange-50 text-orange-900 dark:bg-orange-500/15 dark:text-orange-100'
                          : 'text-stone-700 hover:bg-stone-50/80 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-white/[0.05] dark:hover:text-stone-100'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {item.label}
                        {item.ai && (
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
                            AI
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`h-4 w-4 transition ${active ? 'text-orange-500' : 'text-stone-400'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-3 h-px bg-stone-100 dark:bg-white/[0.07]" />

              <div className="space-y-0.5">
                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-white/[0.05]"
                >
                  About
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </Link>
              </div>
            </nav>

            {/* Auth section at bottom */}
            <div className="shrink-0 border-t border-stone-200/80 p-4 dark:border-white/[0.08]">
              {user ? (
                <div className="space-y-1">
                  {/* User card */}
                  <div className="mb-2 flex items-center gap-3 rounded-2xl bg-stone-50 p-3 dark:bg-white/[0.04]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        getInitials(user.user_metadata?.full_name || user.email)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {user.user_metadata?.full_name ?? user.email}
                      </p>
                      <p className="truncate text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/[0.05]"
                  >
                    <User className="h-4 w-4 text-stone-400" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/[0.05]"
                  >
                    <Settings className="h-4 w-4 text-stone-400" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/[0.08]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-[0_6px_18px_-4px_rgba(234,88,12,0.45)] transition hover:brightness-105"
                  >
                    Get started free
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/[0.05]"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
