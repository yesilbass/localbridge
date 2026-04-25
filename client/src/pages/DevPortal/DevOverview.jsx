import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import {
  Users, CalendarDays, Star, Heart,
  TrendingUp, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw,
} from 'lucide-react';

const STATUS_COLOR = {
  pending:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
  accepted:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  declined:  'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  cancelled: 'text-stone-400 bg-stone-400/10 border-stone-400/20',
};

const TYPE_LABEL = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <TrendingUp className="h-3.5 w-3.5 text-stone-600" />
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums text-white">{value ?? '—'}</p>
      <p className="mt-0.5 text-xs font-medium text-stone-400">{label}</p>
      {sub && <p className="mt-1 text-[10px] text-stone-600">{sub}</p>}
    </div>
  );
}

function SessionStatusBar({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (!total) return null;

  const ORDER = ['pending', 'accepted', 'completed', 'declined', 'cancelled'];
  const BAR_COLOR = {
    pending:   'bg-amber-400',
    accepted:  'bg-emerald-400',
    completed: 'bg-sky-400',
    declined:  'bg-red-400',
    cancelled: 'bg-stone-500',
  };

  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Sessions by Status</p>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5 mb-4">
        {ORDER.map(s => data[s] ? (
          <div
            key={s}
            className={`h-full ${BAR_COLOR[s]}`}
            style={{ width: `${(data[s] / total) * 100}%` }}
          />
        ) : null)}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {ORDER.filter(s => data[s]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${BAR_COLOR[s]}`} />
            <span className="text-[11px] text-stone-400 capitalize">{s}</span>
            <span className="ml-auto text-[11px] font-bold text-stone-300 tabular-nums">{data[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DevOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await devFetch('/stats');
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setStats(d);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs font-medium text-stone-400 hover:text-white hover:bg-white/6 transition-all disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Mentors" value={stats?.totalMentors} color="bg-orange-500/15 text-orange-400" />
        <StatCard icon={CalendarDays} label="Total Sessions" value={stats?.totalSessions} color="bg-sky-500/15 text-sky-400" />
        <StatCard icon={Star} label="Reviews" value={stats?.totalReviews} color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={Heart} label="Favorites" value={stats?.totalFavorites} color="bg-rose-500/15 text-rose-400" />
      </div>

      {/* Status bar */}
      {stats?.sessionsByStatus && <SessionStatusBar data={stats.sessionsByStatus} />}

      {/* Recent sessions */}
      <div className="rounded-2xl border border-white/6 bg-white/3">
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Recent Sessions</p>
          <Clock className="h-3.5 w-3.5 text-stone-600" />
        </div>
        <div className="divide-y divide-white/4">
          {loading && !stats && (
            <div className="px-5 py-8 text-center text-sm text-stone-600">Loading…</div>
          )}
          {stats?.recentSessions?.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-stone-600">No sessions yet.</div>
          )}
          {(stats?.recentSessions || []).map(s => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-200 truncate">
                  {TYPE_LABEL[s.session_type] || s.session_type}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {s.scheduled_date ? new Date(s.scheduled_date).toLocaleString() : '—'}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[s.status] || 'text-stone-400'}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick health checks */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">System Health</p>
        <div className="space-y-2.5">
          {[
            { label: 'Supabase Connection', ok: !!stats },
            { label: 'Admin API Access', ok: !!stats },
            { label: 'Dev Routes Active', ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2.5">
              {item.ok
                ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              }
              <span className="text-sm text-stone-300">{item.label}</span>
              <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${item.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.ok ? 'OK' : 'ERROR'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
