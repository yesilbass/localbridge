import { useState } from 'react';
import { devLogout } from './devAuth.js';
import {
  LayoutDashboard, Users, CalendarDays, Star,
  ClipboardList, CalendarPlus, LogOut, ChevronRight,
  Terminal, AlertTriangle, ShieldCheck, Menu, X, RefreshCw,
} from 'lucide-react';

const NAV = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'mentors',       label: 'Mentors',        icon: Users           },
  { id: 'mentor-queue',  label: 'Mentor Queue',   icon: ShieldCheck     },
  { id: 'sessions',      label: 'Sessions',       icon: CalendarDays    },
  { id: 'reviews',       label: 'Reviews',        icon: Star            },
  { id: 'users',         label: 'Users',          icon: ClipboardList   },
  { id: 'schedule',      label: 'Schedule',       icon: CalendarPlus    },
  { id: 'cancellations', label: 'Cancellations',  icon: AlertTriangle   },
];

export default function DevLayout({ children, activeTab, setActiveTab, navBadges = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    devLogout();
    window.location.reload();
  }

  const activeLabel = NAV.find(n => n.id === activeTab)?.label ?? '';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-white/6 bg-[#0d0d14]">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_16px_rgba(249,115,22,0.3)]">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">Dev Portal</p>
            <p className="text-[9px] text-stone-500 mt-0.5">Bridge Internal</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const badge = navBadges[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-orange-500/12 text-orange-400 border border-orange-500/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-white/4'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white">
                    {badge}
                  </span>
                )}
                {active && !(badge > 0) && <ChevronRight className="h-3 w-3 opacity-60" />}
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-4 border-t border-white/6 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-500 hover:text-stone-300 hover:bg-white/4 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b border-white/6 bg-[#0d0d14] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Terminal className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-white">Dev Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="text-stone-400 hover:text-white transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile nav drawer — full viewport */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-[#0a0a0f] flex flex-col">
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                <Terminal className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Dev Portal</p>
                <p className="text-[9px] text-stone-500 mt-0.5">Bridge Internal</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-stone-400 hover:text-white transition-colors"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              const badge = navBadges[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active ? 'bg-orange-500/12 text-orange-400' : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/6 px-3 py-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky desktop top bar */}
        <div className="hidden lg:flex sticky top-0 z-20 h-12 items-center justify-between border-b border-white/6 bg-[#0d0d14]/90 backdrop-blur-md px-6">
          <p className="text-sm font-semibold text-white">{activeLabel}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-semibold text-emerald-400">Live</span>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-1.5 text-[10px] font-medium text-stone-400 hover:text-white hover:bg-white/6 transition-all"
              aria-label="Refresh"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-8 pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
