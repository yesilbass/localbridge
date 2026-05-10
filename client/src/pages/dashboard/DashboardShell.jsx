import Sidebar from './Sidebar.jsx';
import MobileTabBar from './MobileTabBar.jsx';
import Navbar from '../../components/Navbar.jsx';
import { useSidebarCollapsed } from './dashboardHooks.js';
import { useI18n } from '../../i18n';

/**
 * DashboardShell — the workspace chrome (sidebar + topbar + main + mobile tab bar).
 * Replaces the public top nav while inside /dashboard.
 */
export default function DashboardShell({
  pageTitle = 'Home',
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
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
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
          className="min-w-0 overflow-x-hidden pb-20 lg:pb-0"
          style={{ gridColumn: 2 }}
        >
          <div className="mx-auto w-full max-w-[1080px] px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
            <h1
              className="font-display mb-6 text-[26px] font-black tracking-[-0.02em] sm:text-[30px]"
              style={{ color: 'var(--bridge-text)' }}
            >
              {pageTitle}
            </h1>
            {children}
          </div>
        </main>

        <MobileTabBar activeRole={activeRole} />
      </div>
    </>
  );
}
