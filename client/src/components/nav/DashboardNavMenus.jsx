import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { isDashboardGroupActive, isDashboardPathActive } from './dashboardNavModel';
import { navFocus, navLinkDesktop, navMenuItem, navMenuPanel, navMenuPanelStyle, navTriggerDesktop } from './navChrome';

const dashTrigger = navTriggerDesktop;
const dashLink = navLinkDesktop;

export function DashboardNavDropdown({ group, pathname, onNavigate, openId, setOpenId }) {
  const menuId = useId();
  const rootRef = useRef(null);
  const open = openId === group.id;
  const active = isDashboardGroupActive(pathname, group);

  const close = useCallback(() => setOpenId(null), [setOpenId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpenId(group.id)}
      onMouseLeave={() => setOpenId((id) => (id === group.id ? null : id))}
    >
      <button
        type="button"
        className={`${dashTrigger} ${active || open ? 'border-[var(--color-primary)] text-[var(--bridge-text)]' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpenId((id) => (id === group.id ? null : group.id))}
      >
        {group.label}
        <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <div id={menuId} role="menu" className={navMenuPanel} style={navMenuPanelStyle}>
          {group.items.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              role="menuitem"
              onClick={() => { close(); onNavigate?.(); }}
              className={({ isActive }) =>
                `${navMenuItem} flex items-center gap-2 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'}`
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardNavMenusDesktop({ model, pathname, onNavigate }) {
  const [openId, setOpenId] = useState(null);
  const primaryActive = isDashboardPathActive(pathname, model.primary.to);

  return (
    <nav aria-label="Dashboard" className="hidden min-w-0 flex-1 items-center gap-5 md:flex">
      <NavLink
        to={model.primary.to}
        end
        onClick={onNavigate}
        className={`${dashLink} ${primaryActive ? 'border-[var(--color-primary)] text-[var(--bridge-text)]' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'}`}
      >
        {model.primary.label}
      </NavLink>
      {model.groups.map((group) => (
        <DashboardNavDropdown
          key={group.id}
          group={group}
          pathname={pathname}
          onNavigate={onNavigate}
          openId={openId}
          setOpenId={setOpenId}
        />
      ))}
    </nav>
  );
}

export function DashboardNavMenusMobile({ model, pathname, onNavigate, openSections, onSectionToggle }) {
  return (
    <nav aria-label="Dashboard mobile" className="flex flex-col gap-4">
      <NavLink
        to={model.primary.to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `border-l-2 py-2 pl-3 text-[15px] font-medium ${navFocus} ${
            isActive
              ? 'border-[var(--color-primary)] text-[var(--bridge-text)]'
              : 'border-transparent text-[var(--bridge-text-secondary)]'
          }`
        }
      >
        {model.primary.label}
      </NavLink>
      {model.groups.map((group) => {
        const expanded = openSections[group.id] ?? false;
        const groupActive = isDashboardGroupActive(pathname, group);
        return (
          <div key={group.id}>
            <button
              type="button"
              onClick={() => onSectionToggle(group.id)}
              className={`flex w-full items-center justify-between py-1 text-xs font-bold uppercase tracking-[0.16em] ${navFocus} ${
                groupActive ? 'text-[var(--color-primary)]' : 'text-[var(--bridge-text-faint)]'
              }`}
            >
              {group.label}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {expanded && (
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-2 border-l-2 py-2 pl-3 text-[14px] font-medium ${navFocus} ${
                        isActive
                          ? 'border-[var(--color-primary)] text-[var(--bridge-text)]'
                          : 'border-transparent text-[var(--bridge-text-secondary)]'
                      }`
                    }
                  >
                    <item.icon className="h-3.5 w-3.5 opacity-60" aria-hidden />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
