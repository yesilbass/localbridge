import Sidebar from './Sidebar.jsx';
import MobileTabBar from './MobileTabBar.jsx';
import Navbar from '../../components/Navbar.jsx';
import { useSidebarCollapsed } from './dashboardHooks.js';
import { useI18n } from '../../i18n';

/**
 * DashboardShell — the workspace chrome (sidebar + main + mobile tab bar).
 * Replaces the public top nav while inside /dashboard. Page titles live inside
 * each route via PageHeader (or HomeHeader for the root).
 */
export default function DashboardShell({
  activeRole,
  hasBothRoles,
  onSwitchRole,
  children,
}) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const { t } = useI18n();

  return (
    <>
      <Navbar />
      <div
        className="dashboard-shell"
        data-sidebar-collapsed={collapsed ? 'true' : 'false'}
        style={{
          ['--sidebar-w']: collapsed ? '64px' : '240px',
          ['--navbar-h']: '5.25rem',
          display: 'grid',
          gridTemplateColumns: 'var(--sidebar-w) 1fr',
          minHeight: 'calc(100vh - var(--navbar-h))',
          paddingTop: 'var(--navbar-h)',
          backgroundColor: 'var(--bridge-canvas)',
        }}
      >
        <a
          href="#dashboard-main"
          className="bridge-focus sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:px-3 focus:py-2 focus:text-[12px] focus:font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
        >
          {t('dashboard.skipToContent', 'Skip to content')}
        </a>

        <Sidebar
          activeRole={activeRole}
          isCollapsed={collapsed}
          onToggleCollapsed={toggle}
          hasBothRoles={hasBothRoles}
          onSwitchRole={onSwitchRole}
        />

        <main
          id="dashboard-main"
          role="main"
          className="relative min-w-0 overflow-x-hidden pb-20 lg:pb-0"
          style={{ gridColumn: 2 }}
        >
          {/* Soft top fade against the Navbar — sits below it, decorative */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-6"
            style={{
              background:
                'linear-gradient(180deg, var(--bridge-canvas) 0%, transparent 100%)',
            }}
          />
          <div className="relative z-10 mx-auto w-full max-w-[1080px] px-5 py-6 sm:px-6 sm:py-8 lg:px-8 xl:max-w-[1200px]">
            {children}
          </div>
        </main>

        <MobileTabBar activeRole={activeRole} />
      </div>
    </>
  );
}
