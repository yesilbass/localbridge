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

        {/* Background layer */}
        <div
          className={`relative transition-[background-color,backdrop-filter] duration-500 ${
            scrolled
              ? 'bg-[color-mix(in_srgb,var(--bridge-canvas)_78%,transparent)] backdrop-blur-2xl'
              : 'bg-transparent'
          }`}
        >
          {/* Bottom dissolve */}
          <div aria-hidden
            className={`pointer-events-none absolute inset-x-0 -bottom-8 h-8 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--bridge-canvas) 65%, transparent) 0%, transparent 100%)' }} />

          <nav className="relative mx-auto flex h-[4rem] max-w-bridge items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">

            {/* ── Wordmark ── */}
            <Link to="/"
              className="group relative flex shrink-0 flex-col justify-center rounded-2xl outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]">
              <span className="font-display text-[1.3rem] font-black leading-none tracking-[-0.04em] text-[var(--bridge-text)] sm:text-[1.45rem]">
                Bridge
              </span>
              <span
                className="mt-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.26em]"
                style={{ color: 'var(--color-primary)' }}
              >
                Mentorship
              </span>
            </Link>

            {/* ── Center pill nav ── */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div
                className="relative flex items-center gap-1 rounded-full p-1.5"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 65%, transparent)',
                  boxShadow: '0 0 0 1px var(--bridge-border) inset, 0 14px 34px -24px color-mix(in srgb, var(--color-secondary) 60%, transparent)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                }}
              >
                {navItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] ${
                        active
                          ? 'text-[var(--color-on-primary)]'
                          : 'text-[var(--bridge-text-muted)] hover:-translate-y-px hover:bg-[var(--bridge-surface)]/80 hover:text-[var(--bridge-text)]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--color-primary)',
                              boxShadow: '0 8px 24px -10px color-mix(in srgb, var(--color-primary) 70%, transparent), 0 0 0 1px rgba(255,255,255,0.2) inset',
                            }
                          : undefined
                      }
                    >
                      {active && (
                        <span aria-hidden className="absolute left-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/60" />
                      )}
                      <span className="relative z-10">{item.label}</span>
                      {item.ai && (
                        <span
                          className={`relative inline-flex items-center rounded-full px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] ${
                            active
                              ? 'bg-white/25 text-[var(--color-on-primary)]'
                              : 'bg-[var(--bridge-surface-muted)] text-[var(--color-primary)]'
                          }`}
                        >
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
                <div className="hidden h-9 w-28 animate-pulse rounded-full bg-[var(--bridge-surface-muted)] ring-1 ring-[var(--bridge-border)] sm:block" aria-hidden />
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
                      className="group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:h-10 sm:w-10"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                        boxShadow: '0 8px 24px -12px color-mix(in srgb, var(--color-primary) 70%, transparent)',
                        ring: '2px solid var(--bridge-border)',
                      }}
                    >
                      {/* Conic spinner on open */}
                      <span aria-hidden
                        className={`pointer-events-none absolute -inset-[2px] rounded-full transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        style={{
                          background: 'conic-gradient(from 0deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, transparent), var(--color-accent), var(--color-primary))',
                          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          padding: '2px',
                          animation: menuOpen ? 'bridge-gradient-spin 2s linear infinite' : 'none',
                        }} />
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="relative h-full w-full object-cover" />
                      ) : (
                        <span className="relative text-[10px] font-bold">
                          {getInitials(user.user_metadata?.full_name || user.email)}
                        </span>
                      )}
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                      <div role="menu"
                        className="animate-pop-in absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-3xl border backdrop-blur-2xl"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--bridge-surface-raised) 97%, transparent)',
                          borderColor: 'var(--bridge-border)',
                          boxShadow: '0 28px 80px -20px color-mix(in srgb, var(--color-secondary) 35%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 6%, transparent)',
                        }}>
                        {/* Top accent line */}
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
                          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-primary) 60%, transparent 100%)', opacity: 0.5 }} />

                        {/* User header */}
                        <div className="relative overflow-hidden px-4 pb-4 pt-4">
                          <div aria-hidden className="pointer-events-none absolute inset-0"
                            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 60%)' }} />
                          <div className="relative flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-black text-white"
                              style={{
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                                boxShadow: '0 8px 24px -12px color-mix(in srgb, var(--color-primary) 70%, transparent)',
                              }}
                            >
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
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                              style={
                                asMentor
                                  ? {
                                      background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 15%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))',
                                      color: 'var(--color-primary)',
                                      boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                                    }
                                  : {
                                      backgroundColor: 'var(--bridge-surface-muted)',
                                      color: 'var(--bridge-text-secondary)',
                                      boxShadow: '0 0 0 1px var(--bridge-border)',
                                    }
                              }
                            >
                              <span className={`h-1.5 w-1.5 rounded-full animate-pulse-soft ${asMentor ? '' : 'bg-sky-500'}`}
                                style={asMentor ? { backgroundColor: 'var(--color-primary)' } : undefined} />
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
                              className="group mx-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-[var(--bridge-text-secondary)] transition-all hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                              <Icon className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition-colors group-hover:text-[var(--color-primary)]" />
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
                <div className="hidden items-center gap-2 sm:flex">
                  <Link to="/login"
                    className="rounded-full px-4 py-2 text-[13px] font-bold text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]">
                    Log in
                  </Link>
                  <Link to="/register" data-magnet="6"
                    className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-black text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                      boxShadow: '0 10px 28px -10px color-mix(in srgb, var(--color-primary) 70%, transparent), 0 0 0 1px rgba(255,255,255,0.2) inset',
                    }}
                  >
                    Get started
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button type="button"
                onClick={() => setMobileOpen(v => !v)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border text-[var(--bridge-text-muted)] transition hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] md:hidden"
                style={{
                  borderColor: 'var(--bridge-border)',
                  backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 75%, transparent)',
                }}
              >
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
          <div className="absolute inset-0 bg-[var(--color-bg)]/60 backdrop-blur-sm" aria-hidden />

          {/* Panel */}
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,22rem)] flex-col overflow-hidden"
            style={{
              animation: 'bridge-slide-x 220ms cubic-bezier(0.16,1,0.3,1)',
              backgroundColor: 'var(--bridge-surface-raised)',
              boxShadow: '0 28px 90px -24px color-mix(in srgb, var(--color-secondary) 50%, transparent)',
            }}
            onClick={e => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="Navigation">

            {/* Accent top line */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-primary) 50%, transparent 100%)', opacity: 0.5 }} />

            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-[var(--bridge-border)]/80 px-5 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="group flex flex-col justify-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                <span className="font-display text-xl font-black leading-none tracking-[-0.04em] text-[var(--bridge-text)]">Bridge</span>
                <span className="mt-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.26em]"
                  style={{ color: 'var(--color-primary)' }}>Mentorship</span>
              </Link>
              <button type="button" onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bridge-border)]/80 text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
                      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                        active
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                              boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent) inset, 0 10px 28px -18px color-mix(in srgb, var(--color-primary) 50%, transparent)',
                            }
                          : undefined
                      }
                    >
                      {active && (
                        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-r"
                          style={{ backgroundColor: 'var(--color-primary)' }} />
                      )}
                      <span className="flex items-center gap-2.5">
                        {item.label}
                        {item.ai && (
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] ${
                              active
                                ? 'bg-[var(--bridge-surface-muted)] text-[var(--color-primary)]'
                                : 'bg-[var(--bridge-surface-muted)] text-[var(--color-primary)]'
                            }`}
                          >
                            <Zap className="h-2 w-2" />AI
                          </span>
                        )}
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        style={{ color: active ? 'var(--color-primary)' : 'var(--bridge-text-faint)' }} />
                    </Link>
                  );
                })}
              </div>

              <div className="my-4 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--bridge-border), transparent)' }} />

              <Link to="/about" onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                About
                <ChevronRight className="h-4 w-4 text-[var(--bridge-text-faint)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </nav>

            {/* Auth bottom */}
            <div className="relative shrink-0 border-t border-[var(--bridge-border)]/80 p-4"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 40%, transparent)', backdropFilter: 'blur(20px)' }}>
              {user ? (
                <div className="space-y-1">
                  {/* User card */}
                  <div className="mb-3 flex items-center gap-3 rounded-3xl border p-3"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--bridge-surface-raised) 80%, transparent)',
                      borderColor: 'var(--bridge-border)',
                      boxShadow: '0 14px 32px -24px color-mix(in srgb, var(--color-secondary) 70%, transparent)',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black text-white"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                    >
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
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
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
                    className="flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                      boxShadow: '0 12px 30px -12px color-mix(in srgb, var(--color-primary) 70%, transparent)',
                    }}
                  >
                    Get started free
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{ borderColor: 'var(--bridge-border)' }}
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
