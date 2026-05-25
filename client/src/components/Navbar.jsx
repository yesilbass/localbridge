import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { appUrl, shouldNavigateToApp } from '../utils/appUrl';
import { presentAsMarketingGuest, resolveAuthEntryPath } from '../utils/authNav';
import { isPublicMentorProfileDetail } from '../utils/mentorProfileRoute';
import { useMentorProfileNavHidden } from '../hooks/useMentorProfileNavHidden';
import { LogOut, User, Settings, Sparkles, Menu, X } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useI18n } from '../i18n';
import { buildMainNavModel } from './nav/mainNavModel';
import { NavMenusDesktop, NavMenusMobile } from './nav/NavMenus';

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
  const [mobileSections, setMobileSections] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const asMentor = user ? isMentorAccount(user) : false;
  const isDashboard = location.pathname.startsWith('/dashboard');
  const showGuestChrome = presentAsMarketingGuest(user, location.pathname);
  const loginPath = resolveAuthEntryPath('/login', user);
  const mentorsBrowsePath = resolveAuthEntryPath('/mentors', user);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLanding = location.pathname === '/';
  const isMentorProfileDetail = isPublicMentorProfileDetail(location.pathname);
  const profileBarHidden = useMentorProfileNavHidden(isMentorProfileDetail);

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

      if (!isMentorProfileDetail) {
        if (currentY < lastY - 4 || currentY <= 24) {
          setHeaderHidden(false);
        } else if (currentY > 72 && currentY > lastY + 4) {
          setHeaderHidden(true);
        }
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
  }, [location.pathname, isMentorProfileDetail]);

  const headerHiddenEffective = isMentorProfileDetail ? profileBarHidden : headerHidden;

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

  const navModel = buildMainNavModel({
    showGuestChrome,
    asMentor,
    resolve: (path) => resolveAuthEntryPath(path, user),
    t,
  });

  const closeMobile = () => setMobileOpen(false);

  const toggleMobileSection = (id) => {
    setMobileSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          MAIN HEADER
      ═══════════════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 isolate transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          headerHiddenEffective && !mobileOpen && !isDashboard && !isLanding ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'transparent',
          border: 0,
          boxShadow: 'none',
          outline: 0,
          transform: headerHiddenEffective && !mobileOpen && !isDashboard && !isLanding ? 'translateY(-1.5rem)' : 'translateY(0)',
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
                  background: 'color-mix(in srgb, var(--bridge-canvas) 92%, transparent)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 1px 0 var(--bridge-border)',
                }
              : { border: 0, outline: 0, boxShadow: 'none', background: 'transparent' }
          }
        >
          <nav
            className="relative mx-auto flex h-[6.25rem] max-w-[112rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12"
            style={{ border: 0, boxShadow: 'none', outline: 0 }}
          >

            <div className="flex min-w-0 items-center gap-10">
              {/* ── Wordmark ── */}
              <Link to="/"
                className="flex shrink-0 items-center outline-none transition-opacity duration-200 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]">
                <span
                  className="font-display text-[1.35rem] font-black leading-none tracking-[-0.04em] sm:text-[1.48rem]"
                  style={{ color: isAuthPage ? '#0c0a09' : 'var(--bridge-text)' }}
                >
                  mentorshipbridge
                </span>
              </Link>

              <NavMenusDesktop
                model={navModel}
                pathname={location.pathname}
                isAuthPage={isAuthPage}
              />
            </div>

            {/* ── Right ── */}
            <div className="flex shrink-0 items-center gap-3">

              {loading ? (
                <div
                  className="hidden h-8 w-24 animate-pulse sm:block"
                  style={{
                    backgroundColor: isAuthPage ? 'rgba(120,79,43,0.08)' : 'var(--bridge-surface-muted)',
                    boxShadow: isAuthPage ? '0 0 0 1px rgba(120,79,43,0.12)' : '0 0 0 1px var(--bridge-border)',
                  }}
                  aria-hidden
                />
              ) : user && !showGuestChrome ? (
                <div className="hidden items-center gap-2 sm:flex">

                  {/* Notification panel */}
                  <NotificationPanel />

                  {/* Avatar + dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen(v => !v)}
                      onBlur={() => setTimeout(() => setMenuOpen(false), 160)}
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:h-10 sm:w-10 sm:text-xs"
                      style={{
                        background: 'var(--color-primary)',
                        boxShadow: '0 0 0 1px var(--bridge-border)',
                      }}
                    >
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        getInitials(user.user_metadata?.full_name || user.email)
                      )}
                    </button>

                    {menuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden border py-1"
                        style={{
                          backgroundColor: 'var(--bridge-surface-raised)',
                          borderColor: 'var(--bridge-border)',
                          borderRadius: '6px',
                          boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--bridge-text) 18%, transparent)',
                        }}
                      >
                        <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--bridge-border)' }}>
                          <p className="truncate text-[13px] font-semibold text-[var(--bridge-text)]">
                            {user.user_metadata?.full_name ?? user.email}
                          </p>
                          <p className="truncate text-[11px] text-[var(--bridge-text-faint)]">{user.email}</p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--bridge-text-faint)]">
                            {asMentor ? t('nav.mentorAccount', 'Mentor') : t('nav.memberAccount', 'Member')}
                          </p>
                        </div>
                        {[
                          { to: '/profile', icon: User, label: t('nav.myProfile', 'My Profile') },
                          { to: '/settings', icon: Settings, label: t('nav.settings', 'Settings') },
                          ...(!asMentor ? [{ to: mentorsBrowsePath, icon: Sparkles, label: t('nav.findMentor', 'Find a Mentor') }] : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition-colors hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                          >
                            <Icon className="h-4 w-4 opacity-60" aria-hidden />
                            {label}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 border-t px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 dark:text-red-400"
                          style={{ borderColor: 'var(--bridge-border)' }}
                        >
                          <LogOut className="h-4 w-4" aria-hidden />
                          {t('nav.logout', 'Log out')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-5 sm:flex">
                  {shouldNavigateToApp(loginPath) ? (
                    <a
                      href={appUrl(loginPath)}
                      className="text-[15px] font-medium transition-colors hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                      style={{ color: isAuthPage ? '#78716c' : 'var(--bridge-text-secondary)' }}
                    >
                      {t('nav.login', 'Log in')}
                    </a>
                  ) : (
                    <Link
                      to={loginPath}
                      className="text-[15px] font-medium transition-colors hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                      style={{ color: isAuthPage ? '#78716c' : 'var(--bridge-text-secondary)' }}
                    >
                      {t('nav.login', 'Log in')}
                    </Link>
                  )}
                  {shouldNavigateToApp(mentorsBrowsePath) ? (
                    <a
                      href={appUrl(mentorsBrowsePath)}
                      data-magnet="6"
                      className="inline-flex items-center rounded-md px-4 py-2.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--bridge-on-primary, #fff)',
                      }}
                    >
                      {t('nav.browseMentors', 'Browse mentors')}
                    </a>
                  ) : (
                    <Link
                      to={mentorsBrowsePath}
                      data-magnet="6"
                      className="inline-flex items-center rounded-md px-4 py-2.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--bridge-on-primary, #fff)',
                      }}
                    >
                      {t('nav.browseMentors', 'Browse mentors')}
                    </Link>
                  )}
                </div>
              )}

              {/* Mobile toggle */}
              <button type="button"
                onClick={() => setMobileOpen(v => !v)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? t('nav.closeMenu', 'Close menu') : t('nav.openMenu', 'Open menu')}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] md:hidden"
                style={{ color: isAuthPage ? '#0c0a09' : 'var(--bridge-text-secondary)' }}
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
              boxShadow: '-4px 0 24px -8px color-mix(in srgb, var(--bridge-text) 12%, transparent)',
            }}
            onClick={e => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="Navigation">

            <div className="relative flex shrink-0 items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--bridge-border)' }}>
              <Link to="/" onClick={() => setMobileOpen(false)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
                <span className="font-display text-lg font-black leading-none tracking-[-0.04em] text-[var(--bridge-text)]">mentorshipbridge</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[var(--bridge-text-muted)] transition-colors hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                aria-label={t('common.close', 'Close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="relative flex-1 overflow-y-auto px-3 py-4">
              <NavMenusMobile
                model={navModel}
                pathname={location.pathname}
                onNavigate={closeMobile}
                openSections={mobileSections}
                onSectionToggle={toggleMobileSection}
              />
              <div className="my-4 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--bridge-border), transparent)' }} />
            </nav>

            {/* Auth bottom */}
            <div className="relative shrink-0 border-t p-4" style={{ borderColor: 'var(--bridge-border)' }}>
              {user && !showGuestChrome ? (
                <div className="space-y-0.5">
                  <p className="mb-2 truncate px-3 text-[13px] font-semibold text-[var(--bridge-text)]">
                    {user.user_metadata?.full_name ?? user.email}
                  </p>
                  {[
                    { to: '/profile', icon: User, label: t('nav.profile', 'Profile') },
                    { to: '/settings', icon: Settings, label: t('nav.settings', 'Settings') },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 border-l-2 border-transparent py-2 pl-3 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition-colors hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      <Icon className="h-4 w-4 opacity-60" aria-hidden />
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 py-2 pl-3 text-[13px] font-medium text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    {t('nav.logout', 'Log out')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {shouldNavigateToApp(mentorsBrowsePath) ? (
                    <a
                      href={appUrl(mentorsBrowsePath)}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center rounded-md py-3 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bridge-on-primary, #fff)' }}
                    >
                      {t('nav.browseMentors', 'Browse mentors')}
                    </a>
                  ) : (
                    <Link
                      to={mentorsBrowsePath}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center rounded-md py-3 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bridge-on-primary, #fff)' }}
                    >
                      {t('nav.browseMentors', 'Browse mentors')}
                    </Link>
                  )}
                  {shouldNavigateToApp(loginPath) ? (
                    <a
                      href={appUrl(loginPath)}
                      onClick={() => setMobileOpen(false)}
                      className="text-center text-sm font-medium text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
                    >
                      {t('nav.login', 'Log in')}
                    </a>
                  ) : (
                    <Link
                      to={loginPath}
                      onClick={() => setMobileOpen(false)}
                      className="text-center text-sm font-medium text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
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
