import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { appUrl, shouldNavigateToApp } from '../../utils/appUrl';
import { isGroupActive, isPathActive } from './mainNavModel';
import {
  navCtaDesktop,
  navFocus,
  navLinkActiveBorder,
  navLinkActiveBorderAuth,
  navLinkDesktop,
  navMenuItem,
  navMenuPanel,
  navMenuPanelStyle,
  navTextTone,
  navTriggerDesktop,
} from './navChrome';

function NavHref({ path, className, style, children, onNavigate, ariaCurrent, role }) {
  if (shouldNavigateToApp(path)) {
    return (
      <a href={appUrl(path)} className={className} style={style} role={role} onClick={onNavigate} aria-current={ariaCurrent}>
        {children}
      </a>
    );
  }
  return (
    <Link to={path} className={className} style={style} role={role} onClick={onNavigate} aria-current={ariaCurrent}>
      {children}
    </Link>
  );
}

function AiLabel() {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]" aria-label="AI-powered">
      AI
    </span>
  );
}

export function NavFlatLink({
  path,
  label,
  ai,
  pathname,
  isAuthPage,
  onNavigate,
  variant = 'desktop',
}) {
  const active = isPathActive(pathname, path);
  const isDesktop = variant === 'desktop';

  if (isDesktop) {
    const borderActive = isAuthPage ? navLinkActiveBorderAuth : navLinkActiveBorder;
    return (
      <NavHref
        path={path}
        className={`${navLinkDesktop} ${navTextTone(active, isAuthPage)} ${active ? borderActive : ''}`}
        onNavigate={onNavigate}
        ariaCurrent={active ? 'page' : undefined}
      >
        <span>{label}</span>
        {ai ? <AiLabel /> : null}
      </NavHref>
    );
  }

  return (
    <NavHref
      path={path}
      className={`flex items-center gap-2 border-l-2 py-2.5 pl-3 pr-2 text-[15px] font-medium transition-colors ${navFocus} ${
        active
          ? 'border-[var(--color-primary)] text-[var(--bridge-text)]'
          : 'border-transparent text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'
      }`}
      onNavigate={onNavigate}
      ariaCurrent={active ? 'page' : undefined}
    >
      <span>{label}</span>
      {ai ? <AiLabel /> : null}
    </NavHref>
  );
}

export function NavDropdown({
  group,
  pathname,
  isAuthPage,
  onNavigate,
  openId,
  setOpenId,
}) {
  const menuId = useId();
  const rootRef = useRef(null);
  const open = openId === group.id;
  const active = isGroupActive(pathname, group);

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

  const borderActive = isAuthPage ? navLinkActiveBorderAuth : navLinkActiveBorder;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpenId(group.id)}
      onMouseLeave={() => setOpenId((id) => (id === group.id ? null : id))}
    >
      <button
        type="button"
        className={`${navTriggerDesktop} ${navTextTone(active || open, isAuthPage)} ${active || open ? borderActive : ''}`}
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
          {group.items.map((item) => {
            const itemActive = isPathActive(pathname, item.path);
            return (
              <NavHref
                key={item.path}
                path={item.path}
                role="menuitem"
                onNavigate={() => { close(); onNavigate?.(); }}
                ariaCurrent={itemActive ? 'page' : undefined}
                className={`${navMenuItem} ${itemActive ? 'text-[var(--color-primary)]' : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'}`}
              >
                <span className="flex items-center justify-between gap-2">
                  {item.label}
                  {item.ai ? <AiLabel /> : null}
                </span>
              </NavHref>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NavMenusDesktop({ model, pathname, isAuthPage, onNavigate }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="hidden items-center gap-6 md:flex">
      {model.primary && (
        <NavFlatLink
          path={model.primary.path}
          label={model.primary.label}
          pathname={pathname}
          isAuthPage={isAuthPage}
          onNavigate={onNavigate}
        />
      )}
      {model.groups.map((group) => (
        <NavDropdown
          key={group.id}
          group={group}
          pathname={pathname}
          isAuthPage={isAuthPage}
          onNavigate={onNavigate}
          openId={openId}
          setOpenId={setOpenId}
        />
      ))}
      {model.links.map((link) => (
        <NavFlatLink
          key={link.path}
          path={link.path}
          label={link.label}
          ai={link.ai}
          pathname={pathname}
          isAuthPage={isAuthPage}
          onNavigate={onNavigate}
        />
      ))}
      {model.cta && (
        <NavHref
          path={model.cta.path}
          onNavigate={onNavigate}
          className={navCtaDesktop}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--bridge-on-primary, #fff)',
          }}
        >
          {model.cta.label}
        </NavHref>
      )}
    </div>
  );
}

export function NavMenusMobile({ model, pathname, onNavigate, onSectionToggle, openSections }) {
  return (
    <div className="space-y-4">
      {model.primary && (
        <NavFlatLink
          variant="mobile"
          path={model.primary.path}
          label={model.primary.label}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      )}
      {model.groups.map((group) => {
        const expanded = openSections[group.id] ?? false;
        const groupActive = isGroupActive(pathname, group);
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
                  <NavFlatLink
                    key={item.path}
                    variant="mobile"
                    path={item.path}
                    label={item.label}
                    ai={item.ai}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      {model.links.length > 0 && (
        <div className="space-y-0.5 border-t pt-4" style={{ borderColor: 'var(--bridge-border)' }}>
          {model.links.map((link) => (
            <NavFlatLink
              key={link.path}
              variant="mobile"
              path={link.path}
              label={link.label}
              ai={link.ai}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
      {model.cta && (
        <NavHref
          path={model.cta.path}
          onNavigate={onNavigate}
          className={`mt-2 flex w-full items-center justify-center rounded-md py-2.5 text-sm font-semibold ${navFocus}`}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--bridge-on-primary, #fff)',
          }}
        >
          {model.cta.label}
        </NavHref>
      )}
    </div>
  );
}
