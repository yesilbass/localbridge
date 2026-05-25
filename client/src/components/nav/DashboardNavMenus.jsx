import { NavLink } from 'react-router-dom';
import { isDashboardPathActive } from './dashboardNavModel';
import { navFocus, navLinkDesktop } from './navChrome';

const dashLink = navLinkDesktop;

function dashboardLinkClass(isActive) {
  return `${dashLink} ${isActive ? 'border-[var(--color-primary)] text-[var(--bridge-text)]' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'}`;
}

export function DashboardNavMenusDesktop({ model, pathname, onNavigate }) {
  return (
    <nav aria-label="Dashboard" className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto md:flex lg:gap-5">
      {model.links.map(({ to, end, label, icon: Icon }) => {
        const active = isDashboardPathActive(pathname, to);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={dashboardLinkClass(active)}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function DashboardNavMenusMobile({ model, onNavigate }) {
  return (
    <nav aria-label="Dashboard mobile" className="flex flex-col gap-0.5">
      {model.links.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2 border-l-2 py-2.5 pl-3 text-[15px] font-medium ${navFocus} ${
              isActive
                ? 'border-[var(--color-primary)] text-[var(--bridge-text)]'
                : 'border-transparent text-[var(--bridge-text-secondary)]'
            }`
          }
        >
          <Icon className="h-3.5 w-3.5 opacity-60" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
