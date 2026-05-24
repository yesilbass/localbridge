import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { appUrl, shouldNavigateToApp } from '../utils/appUrl';
import { LogOut, User, Settings, Sparkles, Menu, X, ChevronRight, Zap } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useI18n } from '../i18n';

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const asMentor = user ? isMentorAccount(user) : false;
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMobileOpen(false);
      setMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      const currentY = Math.max(window.scrollY, 0);

      setScrolled(currentY > 12);

      if (currentY < lastY - 4 || currentY <= 24) {
        setHeaderHidden(false);
      } else if (currentY > 72 && currentY > lastY + 4) {
        setHeaderHidden(true);
      }

      lastY = currentY;
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

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

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLanding = location.pathname === '/';

  const isActive = path =>
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = asMentor
    ? [
        { path: '/dashboard', label: t('nav.dashboard', 'Dashboard') },
        { path: '/company', label: t('nav.company', 'Company') },
        { path: '/pricing', label: t('nav.pricing', 'Pricing') },
      ]
    : [
        { path: '/mentors', label: t('nav.mentors', 'Mentors') },
        ...(user ? [{ path: '/dashboard', label: t('nav.dashboard', 'Dashboard') }] : []),
        { path: '/company', label: t('nav.company', 'Company') },
        { path: '/resume', label: t('nav.resume', 'Resume'), ai: true },
        { path: '/pricing', label: t('nav.pricing', 'Pricing') },
      ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          MAIN HEADER
      ═══════════════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 isolate transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          headerHidden && !mobileOpen && !isDashboard && !isLanding ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'transparent',
          border: 0,
          boxShadow: 'none',
          outline: 0,
          transform: headerHidden && !mobileOpen && !isDashboard && !isLanding ? 'translateY(-1.5rem)' : 'translateY(0)',
        }}
      >

        {/* Background layer — glass on scroll (non-auth), warm amber on auth */}
        <div
          className="relative transition-all duration-300"
          style={
            isAuthPage
              ? { border: 0, outline: 0, boxShadow: 'none', background: 'transparent' }
              : scrolled
              ? {
                  border: 0,
                  outline: 0,
                  background: 'color-mix(in srgb, var(--bridge-canvas) 82%, transparent)',
                  backdropFilter: 'blur(20px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                  boxShadow: '0 1px 0 color-mix(in srgb, var(--color-primary) 8%, transparent), 0 8px 32px -12px color-mix(in srgb, var(--color-secondary) 14%, transparent)',
                }
              : { border: 0, outline: 0, boxShadow: 'none', background: 'transparent' }
          }
        >
          <nav
            className="relative mx-auto flex h-[5.25rem] max-w-[112rem] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12"
            style={{ border: 0, boxShadow: 'none', outline: 0 }}
          >

            <div className="flex min-w-0 items-center gap-8">
              {/* ── Wordmark ── */}
              <Link to="/"
                className="group relative flex shrink-0 items-center rounded-full outline-none transition-opacity duration-200 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]">
                <span
                  className="font-display text-[1.22rem] font-black leading-none tracking-[-0.04em] sm:text-[1.32rem]"
                  style={{ color: isAuthPage ? '#0c0a09' : 'var(--bridge-text)' }}
                >
                  mentorshipbridge
                </span>
              </Link>

              {/* ── Inline nav ── */}
              <div className="hidden items-center gap-7 md:flex">
                {navItems.map(item => {
                  const active = isActive(item.path);
                  const useAppHref = shouldNavigateToApp(item.path);
                  const linkClass = `group relative inline-flex items-center gap-1.5 rounded-full py-2 text-[15px] font-medium tracking-[-0.015em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:-inset-x-3 before:inset-y-1 before:scale-75 before:rounded-full before:opacity-0 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[''] hover:-translate-y-0.5 hover:before:scale-100 hover:before:opacity-[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bridge-canvas)] ${
                    isAuthPage
                      ? active ? 'text-[#0c0a09] before:bg-[#0c0a09]' : 'text-[#78716c] before:bg-[#0c0a09] hover:text-[#0c0a09]'
                      : active
                      ? 'text-[var(--bridge-text)] before:bg-[var(--bridge-text)]'
                      : 'text-[var(--bridge-text-secondary)] before:bg-[var(--bridge-text)] hover:text-[var(--bridge-text)]'
                  }`;
                  const inner = (
                    <>
                      <span
                        aria-hidden
                        className={`absolute -bottom-0.5 left-1/2 h-px w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent to-transparent transition-all duration-300 ease-out ${
                          active ? 'scale-x-100 opacity-80' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70'
                        }`}
                        style={{ backgroundImage: isAuthPage ? 'linear-gradient(to right, transparent, #0c0a09, transparent)' : 'linear-gradient(to right, transparent, var(--color-primary), transparent)' }}
                      />
                      <span className="relative z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-px">{item.label}</span>
                      {item.ai && (
                        <span className="relative z-10 inline-flex items-center rounded-full bg-[var(--bridge-surface-muted)] px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-105">
                          <Zap className="mr-0.5 h-2 w-2" />AI
                        </span>
                      )}
                    </>
                  );
                  return useAppHref ? (
                    <a key={item.path} href={appUrl(item.path)}
                      aria-current={active ? 'page' : undefined}
                      className={linkClass}
                    >{inner}</a>
                  ) : (
                    <Link key={item.path} to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={linkClass}
                    >{inner}</Link>
                  );
                })}
              </div>
            </div>

            {/* ── Right ── */}
            <div className="flex shrink-0 items-center gap-2">

              {loading ? (
                <div
                  className="hidden h-9 w-28 animate-pulse rounded-full ring-1 sm:block"
                  style={{
                    backgroundColor: isAuthPage ? 'rgba(120,79,43,0.08)' : 'var(--bridge-surface-muted)',
                    boxShadow: isAuthPage ? '0 0 0 1px rgba(120,79,43,0.12)' : '0 0 0 1px var(--bridge-border)',
                  }}
                  aria-hidden
                />
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
                              {asMentor ? t('nav.mentorAccount', 'Mentor Account') : t('nav.memberAccount', 'Member Account')}
                            </span>
                          </div>
                        </div>

                        <div className="mx-3 border-t border-[var(--bridge-border)]/60" />

                        {/* Menu items */}
                        <div className="py-1.5">
                          {[
                            {
                              to: '/profile',
                              icon: <User className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition-colors group-hover:text-[var(--color-primary)]" />,
                              label: t('nav.myProfile', 'My Profile'),
                            },
                            {
                              to: '/settings',
                              icon: <Settings className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition-colors group-hover:text-[var(--color-primary)]" />,
                              label: t('nav.settings', 'Settings'),
                            },
                            ...(!asMentor ? [{
                              to: '/mentors',
                              icon: <Sparkles className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition-colors group-hover:text-[var(--color-primary)]" />,
                              label: t('nav.findMentor', 'Find a Mentor'),
                            }] : []),
                          ].map(({ to, icon, label }) => (
                            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                              className="group mx-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-[var(--bridge-text-secondary)] transition-all hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                              {icon}
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="mx-3 border-t border-[var(--bridge-border)]/60" />
                        <div className="py-1.5">
                          <button type="button" onClick={handleLogout}
                            className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition-colors hover:bg-red-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-500/10">
                            <LogOut className="h-4 w-4 shrink-0" />
                            {t('nav.logout', 'Log out')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  {shouldNavigateToApp('/login') ? (
                  <a href={appUrl('/login')}
                    className="group relative rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:-inset-x-1 before:inset-y-1 before:scale-75 before:rounded-full before:opacity-0 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[''] hover:-translate-y-0.5 hover:before:scale-100 hover:before:opacity-[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bridge-canvas)]"
                    style={{ color: isAuthPage ? '#78716c' : 'var(--bridge-text-secondary)' }}
                  >
                    <span className="relative z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-px" style={{ color: 'inherit' }}>{t('nav.login', 'Log in')}</span>
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-1/2 h-px w-[calc(100%-2rem)] -translate-x-1/2 scale-x-0 rounded-full opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-70"
                      style={{ backgroundImage: isAuthPage ? 'linear-gradient(to right, transparent, #0c0a09, transparent)' : 'linear-gradient(to right, transparent, var(--color-primary), transparent)' }}
                    />
                  </a>
                  ) : (
                  <Link to="/login"
                    className="group relative rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:-inset-x-1 before:inset-y-1 before:scale-75 before:rounded-full before:opacity-0 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[''] hover:-translate-y-0.5 hover:before:scale-100 hover:before:opacity-[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bridge-canvas)]"
                    style={{ color: isAuthPage ? '#78716c' : 'var(--bridge-text-secondary)' }}
                  >
                    <span className="relative z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-px" style={{ color: 'inherit' }}>{t('nav.login', 'Log in')}</span>
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-1/2 h-px w-[calc(100%-2rem)] -translate-x-1/2 scale-x-0 rounded-full opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-70"
                      style={{ backgroundImage: isAuthPage ? 'linear-gradient(to right, transparent, #0c0a09, transparent)' : 'linear-gradient(to right, transparent, var(--color-primary), transparent)' }}
                    />
                  </Link>
                  )}
                  {shouldNavigateToApp('/register') ? (
                  <a href={appUrl('/register')} data-magnet="6"
                    className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 text-[14px] font-semibold transition hover:-translate-y-0.5 hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4"
                    style={{
                      color: isAuthPage ? '#78716c' : 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    {t('nav.getStarted', 'Get started')}
                  </a>
                  ) : (
                  <Link to="/register" data-magnet="6"
                    className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 text-[14px] font-semibold transition hover:-translate-y-0.5 hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4"
                    style={{
                      color: isAuthPage ? '#78716c' : 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    {t('nav.getStarted', 'Get started')}
                  </Link>
                  )}
                  {shouldNavigateToApp('/mentors') ? (
                  <a href={appUrl('/mentors')}
                    className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 text-[14px] font-bold transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0c0a09',
                      boxShadow: '0 14px 32px -14px color-mix(in srgb, #ffffff 55%, transparent)',
                    }}
                  >
                    {t('auth.browseMentors', 'Browse mentors')}
                  </a>
                  ) : (
                  <Link to="/mentors"
                    className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 text-[14px] font-bold transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0c0a09',
                      boxShadow: '0 14px 32px -14px color-mix(in srgb, #ffffff 55%, transparent)',
                    }}
                  >
                    {t('auth.browseMentors', 'Browse mentors')}
                  </Link>
                  )}
                </div>
              )}

              {/* Mobile toggle */}
              <button type="button"
                onClick={() => setMobileOpen(v => !v)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? t('nav.closeMenu', 'Close menu') : t('nav.openMenu', 'Open menu')}
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] md:hidden"
                style={{
                  color: isAuthPage ? '#0c0a09' : 'var(--bridge-text)',
                  backgroundColor: mobileOpen || scrolled ? (isAuthPage ? 'rgba(120,79,43,0.08)' : 'color-mix(in srgb, var(--bridge-surface) 76%, transparent)') : 'transparent',
                  backdropFilter: mobileOpen || scrolled ? 'blur(16px)' : 'none',
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
              <Link to="/" onClick={() => setMobileOpen(false)} className="group flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                <span className="font-display text-xl font-black leading-none tracking-[-0.04em] text-[var(--bridge-text)]">mentorshipbridge</span>
              </Link>
              <button type="button" onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bridge-border)]/80 text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                aria-label={t('common.close', 'Close')}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="relative flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {navItems.filter(i => !i.desktopOnly).map(item => {
                  const active = isActive(item.path);
                  const useAppHref = shouldNavigateToApp(item.path);
                  const itemClass = `group relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                    active
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'
                  }`;
                  const itemStyle = active
                    ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent) inset, 0 10px 28px -18px color-mix(in srgb, var(--color-primary) 50%, transparent)' }
                    : undefined;
                  const itemInner = (
                    <>
                      {active && (
                        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-r"
                          style={{ backgroundColor: 'var(--color-primary)' }} />
                      )}
                      <span className="flex items-center gap-2.5">
                        {item.label}
                        {item.ai && (
                          <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[8px] font-black uppercase tracking-[0.12em] bg-[var(--bridge-surface-muted)] text-[var(--color-primary)]">
                            <Zap className="h-2 w-2" />AI
                          </span>
                        )}
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        style={{ color: active ? 'var(--color-primary)' : 'var(--bridge-text-faint)' }} />
                    </>
                  );
                  return useAppHref ? (
                    <a key={item.path} href={appUrl(item.path)}
                      onClick={() => setMobileOpen(false)}
                      className={itemClass} style={itemStyle}
                    >{itemInner}</a>
                  ) : (
                    <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                      className={itemClass} style={itemStyle}
                    >{itemInner}</Link>
                  );
                })}
              </div>

              <div className="my-4 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--bridge-border), transparent)' }} />

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
                    {
                      to: '/profile',
                      icon: <User className="h-4 w-4 text-[var(--bridge-text-faint)]" />,
                      label: t('nav.profile', 'Profile'),
                    },
                    {
                      to: '/settings',
                      icon: <Settings className="h-4 w-4 text-[var(--bridge-text-faint)]" />,
                      label: t('nav.settings', 'Settings'),
                    },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                      {icon}
                      {label}
                    </Link>
                  ))}
                  <button type="button" onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition hover:bg-red-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400">
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout', 'Log out')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {shouldNavigateToApp('/register') ? (
                  <a href={appUrl('/register')}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    {t('nav.getStartedFree', 'Get started free')}
                  </a>
                  ) : (
                  <Link to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    {t('nav.getStartedFree', 'Get started free')}
                  </Link>
                  )}
                  {shouldNavigateToApp('/mentors') ? (
                  <a href={appUrl('/mentors')}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-sm font-black transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0c0a09',
                      boxShadow: '0 12px 30px -12px color-mix(in srgb, #ffffff 50%, transparent)',
                    }}
                  >
                    {t('auth.browseMentors', 'Browse mentors')}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  ) : (
                  <Link to="/mentors"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-sm font-black transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0c0a09',
                      boxShadow: '0 12px 30px -12px color-mix(in srgb, #ffffff 50%, transparent)',
                    }}
                  >
                    {t('auth.browseMentors', 'Browse mentors')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  )}
                  {shouldNavigateToApp('/login') ? (
                  <a href={appUrl('/login')}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{ borderColor: 'var(--bridge-border)' }}
                  >
                    {t('nav.login', 'Log in')}
                  </a>
                  ) : (
                  <Link to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    style={{ borderColor: 'var(--bridge-border)' }}
                  >
                    {t('nav.login', 'Log in')}
                  </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
