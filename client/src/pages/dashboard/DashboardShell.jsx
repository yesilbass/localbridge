import DashboardTopBar from '../../components/DashboardTopBar.jsx';
import { useI18n } from '../../i18n';
import { DASHBOARD_SHELL_MAX, DASHBOARD_SHELL_PAD } from './dashboardLayout.js';

const NAVBAR_H = '3.5rem';

/**
 * Dashboard shell — top bar + main content, no sidebar.
 */
export default function DashboardShell({ activeRole, children }) {
  const { t } = useI18n();

  return (
    <>
      <DashboardTopBar activeRole={activeRole} navbarH={NAVBAR_H} />
      <div
        className="dashboard-shell min-h-screen"
        style={{
          ['--shell-max']: DASHBOARD_SHELL_MAX,
          ['--navbar-h']: NAVBAR_H,
          paddingTop: NAVBAR_H,
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

        <main
          id="dashboard-main"
          role="main"
          className={`relative mx-auto w-full overflow-x-hidden py-8 sm:py-10 lg:py-12 ${DASHBOARD_SHELL_PAD}`}
          style={{ maxWidth: DASHBOARD_SHELL_MAX }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
