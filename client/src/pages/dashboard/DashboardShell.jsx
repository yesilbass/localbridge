import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileTabBar from './MobileTabBar.jsx';
import { useSidebarCollapsed } from './dashboardHooks.js';

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

  return (
    <div
      className="dashboard-shell"
      data-sidebar-collapsed={collapsed ? 'true' : 'false'}
      style={{
        ['--sidebar-w']: collapsed ? '64px' : '240px',
        display: 'grid',
        gridTemplateColumns: 'var(--sidebar-w) 1fr',
        minHeight: '100vh',
        backgroundColor: 'var(--bridge-canvas)',
      }}
    >
      <a
        href="#dashboard-main"
        className="bridge-focus sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:px-3 focus:py-2 focus:text-[12px] focus:font-bold"
        style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
      >
        Skip to content
      </a>

      <Sidebar
        activeRole={activeRole}
        isCollapsed={collapsed}
        onToggleCollapsed={toggle}
        hasBothRoles={hasBothRoles}
        onSwitchRole={onSwitchRole}
      />

      <div className="flex min-w-0 flex-col" style={{ gridColumn: 2 }}>
        <Topbar pageTitle={pageTitle} />
        <main
          id="dashboard-main"
          role="main"
          className="flex-1 overflow-x-hidden pb-20 lg:pb-0"
        >
          <div className="mx-auto w-full max-w-[1080px] px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <MobileTabBar activeRole={activeRole} />
    </div>
  );
}
