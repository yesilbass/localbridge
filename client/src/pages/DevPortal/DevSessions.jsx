import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import { Search, RefreshCw, AlertCircle, Video } from 'lucide-react';

const STATUS_COLOR = {
  pending:   'border-amber-500/30 bg-amber-500/10 text-amber-400',
  accepted:  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  declined:  'border-red-500/30 bg-red-500/10 text-red-400',
  completed: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  cancelled: 'border-stone-600/30 bg-stone-700/20 text-stone-500',
};

const TYPE_LABEL = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

const TYPE_DOT = {
  career_advice:  'bg-amber-400',
  interview_prep: 'bg-emerald-400',
  resume_review:  'bg-sky-400',
  networking:     'bg-violet-400',
};


export default function DevSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('type', filterType);
      const r = await devFetch(`/sessions?${params}`);
      if (!r.ok) throw new Error(await r.text());
      setSessions(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      const r = await devFetch(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error(await r.text());
      setSessions(ss => ss.map(s => s.id === id ? { ...s, status } : s));
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = sessions.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.id?.toLowerCase().includes(q) ||
      s.mentor_profiles?.name?.toLowerCase().includes(q) ||
      s.session_type?.includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-400">{filtered.length} sessions</p>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="rounded-xl border border-white/8 bg-white/4 pl-8 pr-3 py-2 text-xs text-white placeholder-stone-600 outline-none focus:border-orange-500/50 w-36"
              />
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-stone-400 hover:text-white hover:bg-white/6 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1">
            {[['', 'All'], ['pending', 'Pending'], ['accepted', 'Accepted'], ['completed', 'Completed'], ['declined', 'Declined'], ['cancelled', 'Cancelled']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${
                  filterStatus === val
                    ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/25'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/4'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {[['', 'All'], ['career_advice', 'Career'], ['interview_prep', 'Interview'], ['resume_review', 'Resume'], ['networking', 'Network']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterType(val)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${
                  filterType === val
                    ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/25'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/4'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400 transition-colors text-base leading-none">×</button>
        </div>
      )}

      <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/6">
                {['Type', 'Mentor', 'Date', 'Status', 'Video', 'Override'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-600 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-stone-600">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-stone-600">No sessions found.</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="py-3.5 pl-5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${TYPE_DOT[s.session_type] || 'bg-stone-600'}`} />
                      <span className="text-xs font-medium text-stone-300">{TYPE_LABEL[s.session_type] || s.session_type}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-stone-400">
                    {s.mentor_profiles?.name || '—'}
                    {s.mentor_profiles?.company && (
                      <span className="block text-[10px] text-stone-600">{s.mentor_profiles.company}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-stone-400 whitespace-nowrap">
                    {s.scheduled_date ? new Date(s.scheduled_date).toLocaleString() : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[s.status] || 'text-stone-400'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.video_room_url
                      ? <a href={s.video_room_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300"><Video className="h-4 w-4" /></a>
                      : <span className="text-stone-700">—</span>
                    }
                  </td>
                  <td className="py-3.5 pl-4 pr-5">
                    <select
                      value={s.status}
                      disabled={updatingId === s.id}
                      onChange={e => handleStatusChange(s.id, e.target.value)}
                      className="rounded-lg border border-white/8 bg-white/4 px-2 py-1.5 text-[10px] text-stone-300 outline-none focus:border-orange-500/50 disabled:opacity-40"
                    >
                      {['pending', 'accepted', 'completed', 'declined', 'cancelled'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
