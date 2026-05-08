import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Home, Users } from 'lucide-react';

function NotificationsPopover({ onClose }) {
  return (
    <div
      role="menu"
      className="animate-pop-in absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-bridge-glow"
      style={{
        backgroundColor: 'var(--bridge-surface-raised)',
        border: '1px solid var(--bridge-border-strong)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          Notifications
        </span>
        <button
          type="button"
          onClick={onClose}
          className="bridge-focus rounded-md text-[11px] font-semibold"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          Close
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-6 pb-6 pt-2 text-center">
        <Bell aria-hidden className="h-8 w-8" style={{ color: 'var(--bridge-text-faint)' }} />
        <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>You're all caught up.</p>
        <p className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
          We'll let you know when something needs you.
        </p>
      </div>
    </div>
  );
}

const topNavLinkStyle = ({ isActive }) => ({
  backgroundColor: isActive
    ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
    : 'transparent',
  color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
  boxShadow: isActive ? 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'none',
});

export default function Topbar({ pageTitle = 'Home' }) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!notifOpen) return;
    function onDoc(e) {
      if (notifRef.current?.contains(e.target)) return;
      setNotifOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [notifOpen]);

  return (
    <header
      className="topbar flex h-14 items-center justify-between gap-4 px-5 sm:px-6"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--bridge-border)',
        gridColumn: 2,
        gridRow: 1,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <h1
          id="page-heading"
          className="font-display truncate text-[18px] font-black tracking-[-0.02em]"
          style={{ color: 'var(--bridge-text)' }}
        >
          {pageTitle}
        </h1>

        <nav aria-label="Quick links" className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            end
            className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors"
            style={topNavLinkStyle}
          >
            <Home className="h-3.5 w-3.5" aria-hidden /> Home
          </NavLink>
          <NavLink
            to="/mentors"
            className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors"
            style={topNavLinkStyle}
          >
            <Users className="h-3.5 w-3.5" aria-hidden /> Mentors
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Desktop search trigger */}
        <button
          type="button"
          onClick={() => navigate('/mentors')}
          className="bridge-focus hidden h-9 w-64 items-center gap-2 rounded-lg px-3 text-[13px] lg:flex"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text-muted)',
          }}
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="flex-1 text-left">Search mentors…</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-mono"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              color: 'var(--bridge-text-faint)',
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Mobile search icon */}
        <button
          type="button"
          aria-label="Search mentors"
          onClick={() => navigate('/mentors')}
          className="bridge-focus grid h-9 w-9 place-items-center rounded-lg lg:hidden"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text-muted)',
          }}
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
            className="bridge-focus relative grid h-9 w-9 place-items-center rounded-lg"
            style={{
              backgroundColor: 'var(--bridge-surface-muted)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              color: 'var(--bridge-text-muted)',
            }}
          >
            <Bell className="h-4 w-4" aria-hidden />
          </button>
          {notifOpen && <NotificationsPopover onClose={() => setNotifOpen(false)} />}
        </div>

      </div>
    </header>
  );
}
