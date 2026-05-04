import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { LogOut, User, Settings, Sparkles, Menu, X, ChevronRight, Zap } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const asMentor = user ? isMentorAccount(user) : false;

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  async function handleLogout() {
    setMenuOpen(false); setMobileOpen(false);
    try { await logout(); } catch { /* ignore */ }
    navigate('/');
  }

  const isActive = path =>
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = asMentor
    ? [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/pricing',   label: 'Pricing'   },
        { path: '/about',     label: 'About', desktopOnly: true },
      ]
    : [
        { path: '/mentors',  label: 'Mentors'  },
        ...(user ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
        { path: '/resume',   label: 'Resume', ai: true },
        { path: '/pricing',  label: 'Pricing'  },
        { path: '/about',    label: 'About', desktopOnly: true },
      ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          MAIN HEADER
      ═══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 isolate">

        {/* Prismatic top-edge glow */}
        <div aria-hidden
          className="pointer-events-none h-[1.5px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(234,88,12,0.35) 20%, rgba(251,146,60,0.9) 50%, rgba(234,88,12,0.35) 80%, transparent 100%)' }} />

        {/* Glass bar */}
        <div
          className={`relative border-b backdrop-blur-2xl transition-all duration-300 ${
            scrolled
              ? 'border-orange-500/10 bg-[var(--bridge-canvas)]/92 shadow-[0_18px_60px_-42px_rgba(28,25,23,0.7),0_1px_0_rgba(255,255,255,0.42)_inset] dark:shadow-[0_18px_70px_-38px_rgba(234,88,12,0.36)]'
              : 'border-[var(--bridge-border)]/70 bg-[var(--bridge-canvas)]/78'
          }`}
        >
          {/* Noise grain */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.02]" />

          {/* Ambient bottom-edge glow (dark mode only) */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 dark:opacity-100"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.22) 40%, rgba(251,146,60,0.22) 60%, transparent)' }} />

          <nav className="relative mx-auto flex h-[4.25rem] max-w-bridge items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">

            {/* ── Logo ── */}
            <Link to="/"
              className="group relative flex shrink-0 items-center gap-3 rounded-2xl outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]">
              {/* Icon */}
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-white shadow-[0_10px_28px_-10px_rgba(234,88,12,0.85),0_1px_0_rgba(255,255,255,0.35)_inset] ring-1 ring-white/35 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_16px_40px_-12px_rgba(234,88,12,0.95)] group-hover:brightness-105 sm:h-11 sm:w-11">
                <span aria-hidden className="bridge-shine-overlay" />
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                <span className="relative font-display text-[1.18rem] font-black tracking-tight sm:text-[1.28rem]">B</span>
              </span>
              {/* Wordmark */}
              <div className="hidden flex-col sm:flex">
                <span className="font-display text-[1.12rem] font-black leading-none tracking-tight text-[var(--bridge-text)]">Bridge</span>
                <span className="mt-1 text-[9px] font-black uppercase leading-none tracking-[0.26em] text-orange-500/80">Mentorship</span>
              </div>
            </Link>

            {/* ── Center pill nav ── */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="relative flex items-center gap-1 rounded-full border border-[var(--bridge-border)]/80 bg-[var(--bridge-surface-raised)]/72 p-1.5 shadow-[0_12px_34px_-24px_rgba(28,25,23,0.8),0_1px_0_rgba(255,255,255,0.56)_inset] backdrop-blur-xl dark:bg-white/[0.045]">
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/50 via-transparent to-orange-500/5 dark:from-white/10" />
                {navItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] ${
                        active
                          ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_8px_24px_-10px_rgba(234,88,12,0.9),0_0_0_1px_rgba(255,255,255,0.26)_inset]'
                          : 'text-[var(--bridge-text-muted)] hover:-translate-y-px hover:bg-[var(--bridge-surface)]/90 hover:text-[var(--bridge-text)]'
                      }`}>
                      {active && <span aria-hidden className="bridge-shine-overlay rounded-full" />}
                      <span className="relative">{item.label}</span>
                      {item.ai && (
                        <span className={`relative inline-flex items-center rounded-full px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] ${
                          active
                            ? 'bg-white/30 text-white'
                            : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-[0_2px_8px_rgba(234,88,12,0.45)]'
                        }`}>
                          <Zap className="mr-0.5 h-2 w-2" />AI
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Right ── */}
            <div className="flex shrink-0 items-center gap-2">

              {loading ? (
                <div className="hidden h-10 w-32 animate-pulse rounded-full bg-[var(--bridge-surface-muted)] ring-1 ring-[var(--bridge-border)] sm:block" aria-hidden />
              ) : user ? (
                <div className="hidden items-center gap-2 sm:flex">

                  {/* Notification panel */}
                  <NotificationPanel />

                  {/* Avatar + dropdown */}
                  <div className="relative ml-0.5">
                    <button type="button"
                      onClick={() => setMenuOpen(v => !v)}
                      onBlur={() => setTimeout(() => setMenuOpen(false), 160)}
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_10px_24px_-14px_rgba(234,88,12,0.9)] ring-2 ring-[var(--bridge-border)] transition-all duration-200 hover:-translate-y-0.5 hover:ring-orange-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                      {/* Spinning conic ring on open */}
                      <span aria-hidden
                        className={`pointer-events-none absolute -inset-[2px] rounded-full transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        style={{
                          background: 'conic-gradient(from 0deg, rgba(234,88,12,1), rgba(251,146,60,0.6), rgba(253,186,116,1), rgba(234,88,12,1))',
                          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          padding: '2px',
                          animation: menuOpen ? 'bridge-gradient-spin 2s linear infinite' : 'none',
                        }} />
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="relative h-full w-full object-cover" />
                      ) : (
                        <span className="relative text-[11px] font-bold">
                          {getInitials(user.user_metadata?.full_name || user.email)}
                        </span>
                      )}
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                      <div role="menu"
                        className="animate-pop-in absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-3xl border border-[var(--bridge-border)]/80 bg-[var(--bridge-surface-raised)]/97 shadow-[0_24px_70px_-18px_rgba(28,25,23,0.32),0_0_0_1px_rgba(234,88,12,0.06)] backdrop-blur-2xl dark:shadow-[0_24px_90px_-18px_rgba(0,0,0,0.66),0_0_0_1px_rgba(234,88,12,0.1)]">
                        {/* Top accent line */}
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

                        {/* User header */}
                        <div className="relative overflow-hidden px-4 pb-4 pt-4">
                          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/6 via-transparent to-transparent" />
                          <div className="relative flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white shadow-[0_10px_24px_-14px_rgba(234,88,12,0.9)] ring-1 ring-white/35">
                              {user.user_metadata?.avatar_url
                                ? <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                                : getInitials(user.user_metadata?.full_name || user.email)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black text-[var(--bridge-text)]">
                                {user.user_metadata?.full_name ?? user.email}
                              </p>
                              <p className="truncate text-[11px] font-semibold text-[var(--bridge-text-faint)]">{user.email}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                              asMentor
                                ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-600 ring-1 ring-orange-400/30 dark:text-orange-300'
                                : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)]'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full animate-pulse-soft ${asMentor ? 'bg-orange-500' : 'bg-sky-500'}`} />
                              {asMentor ? 'Mentor Account' : 'Member Account'}
                            </span>
                          </div>
                        </div>

                        <div className="mx-3 border-t border-[var(--bridge-border)]/60" />

                        {/* Menu items */}
                        <div className="py-1.5">
                          {[
                            { to: '/profile',  icon: User,     label: 'My Profile'    },
                            { to: '/settings', icon: Settings, label: 'Settings'      },
                            ...(!asMentor ? [{ to: '/mentors', icon: Sparkles, label: 'Find a Mentor' }] : []),
                          ].map(({ to, icon: Icon, label }) => (
                            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                              className="group mx-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-[var(--bridge-text-secondary)] transition-all hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                              <Icon className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition-colors group-hover:text-orange-500" />
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="mx-3 border-t border-[var(--bridge-border)]/60" />
                        <div className="py-1.5">
                          <button type="button" onClick={handleLogout}
                            className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition-colors hover:bg-red-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-500/10">
                            <LogOut className="h-4 w-4 shrink-0" />
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-2.5 sm:flex">
                  <Link to="/login"
                    className="rounded-full px-4 py-2 text-[13px] font-bold text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]">
                    Log in
                  </Link>
                  <Link to="/register" data-magnet="6"
                    className="btn-sheen magnetic relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-5 py-2.5 text-[13px] font-black text-white shadow-[0_12px_30px_-12px_rgba(234,88,12,0.85)] ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-12px_rgba(234,88,12,0.85)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2">
                    Get started
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button type="button"
                onClick={() => setMobileOpen(v => !v)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/76 text-[var(--bridge-text-muted)] shadow-[0_8px_24px_-18px_rgba(28,25,23,0.8)] transition hover:border-orange-400/40 hover:bg-[var(--bridge-surface-raised)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 md:hidden">
                <span className={`absolute transition-all duration-200 ${mobileOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                  <X className="h-5 w-5" />
                </span>
                <span className={`absolute transition-all duration-200 ${mobileOpen ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}`}>
                  <Menu className="h-5 w-5" />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#060403]/60 backdrop-blur-sm" aria-hidden />

          {/* Panel */}
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,23rem)] flex-col overflow-hidden shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)]"
            style={{ animation: 'bridge-slide-x 220ms cubic-bezier(0.16,1,0.3,1)' }}
            onClick={e => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="Navigation">

            {/* Gradient bg */}
            <div className="absolute inset-0 bg-[var(--bridge-surface-raised)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-[var(--bridge-border)]/80 px-5 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="group flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-base font-black text-white shadow-[0_10px_26px_-10px_rgba(234,88,12,0.85)] ring-1 ring-white/35">
                  <span aria-hidden className="bridge-shine-overlay" />
                  <span className="relative">B</span>
                </span>
                <span className="flex flex-col">
                  <span className="font-display text-lg font-black leading-none text-[var(--bridge-text)]">Bridge</span>
                  <span className="mt-1 text-[9px] font-black uppercase leading-none tracking-[0.24em] text-orange-500/80">Mentorship</span>
                </span>
              </Link>
              <button type="button" onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--bridge-border)]/80 bg-[var(--bridge-surface)]/70 text-[var(--bridge-text-muted)] transition hover:border-orange-400/40 hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="relative flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {navItems.filter(i => !i.desktopOnly).map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                        active
                          ? 'bg-gradient-to-r from-orange-500/16 to-amber-500/10 text-orange-600 shadow-[0_10px_28px_-18px_rgba(234,88,12,0.65)] ring-1 ring-orange-400/18 dark:text-orange-300'
                          : 'text-[var(--bridge-text-secondary)] hover:translate-x-0.5 hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'
                      }`}>
                      {active && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-r bg-orange-500" />}
                      <span className="flex items-center gap-2.5">
                        {item.label}
                        {item.ai && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] text-white">
                            <Zap className="h-2 w-2" />AI
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${active ? 'translate-x-0.5 text-orange-500' : 'text-[var(--bridge-text-faint)]'}`} />
                    </Link>
                  );
                })}
              </div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-[var(--bridge-border)] to-transparent" />

              <Link to="/about" onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-[var(--bridge-text-muted)] transition hover:translate-x-0.5 hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                About
                <ChevronRight className="h-4 w-4 text-[var(--bridge-text-faint)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </nav>

            {/* Auth bottom */}
            <div className="relative shrink-0 border-t border-[var(--bridge-border)]/80 bg-[var(--bridge-surface)]/36 p-4 backdrop-blur-xl">
              {user ? (
                <div className="space-y-1">
                  {/* User card */}
                  <div className="mb-3 flex items-center gap-3 rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)]/82 p-3 shadow-[0_14px_32px_-24px_rgba(28,25,23,0.8)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white shadow-[0_10px_24px_-14px_rgba(234,88,12,0.9)] ring-1 ring-white/35">
                      {user.user_metadata?.avatar_url
                        ? <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                        : getInitials(user.user_metadata?.full_name || user.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[var(--bridge-text)]">{user.user_metadata?.full_name ?? user.email}</p>
                      <p className="truncate text-[11px] font-semibold text-[var(--bridge-text-faint)]">{user.email}</p>
                    </div>
                  </div>
                  {[
                    { to: '/profile',  icon: User,     label: 'Profile'   },
                    { to: '/settings', icon: Settings, label: 'Settings'  },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                      <Icon className="h-4 w-4 text-[var(--bridge-text-faint)]" />
                      {label}
                    </Link>
                  ))}
                  <button type="button" onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition hover:bg-red-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="btn-sheen flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_-14px_rgba(234,88,12,0.9)] ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                    Get started free
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)]/60 px-4 py-3 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:border-orange-400/40 hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
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
