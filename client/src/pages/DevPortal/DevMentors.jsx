import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import {
  Search, RefreshCw, CheckCircle, XCircle,
  Link, Star, CalendarDays, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

function MentorRow({ mentor, onToggle, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    setToggling(true);
    await onToggle(mentor.id, !mentor.available);
    setToggling(false);
  }

  return (
    <>
      <tr className="border-b border-white/4 hover:bg-white/2 transition-colors">
        <td className="py-3.5 pl-5 pr-3">
          <div className="flex items-center gap-3">
            {mentor.image_url ? (
              <img src={mentor.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white">
                {(mentor.name || '?')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-stone-200">{mentor.name}</p>
              <p className="text-[10px] text-stone-500">{mentor.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3.5 px-3 text-xs text-stone-400">{mentor.title}</td>
        <td className="py-3.5 px-3 text-xs text-stone-400">{mentor.company}</td>
        <td className="py-3.5 px-3 text-xs text-stone-400">{mentor.industry}</td>
        <td className="py-3.5 px-3">
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <Star className="h-3 w-3" />
            {Number(mentor.rating || 0).toFixed(1)}
          </div>
        </td>
        <td className="py-3.5 px-3">
          <div className="flex items-center gap-1 text-xs text-stone-400">
            <CalendarDays className="h-3 w-3" />
            {mentor.total_sessions}
          </div>
        </td>
        <td className="py-3.5 px-3">
          <div className="flex items-center gap-1.5">
            {mentor.google_refresh_token
              ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><CheckCircle className="h-3 w-3" /> Cal</span>
              : <span className="flex items-center gap-1 text-[10px] text-stone-600"><XCircle className="h-3 w-3" /> No Cal</span>
            }
          </div>
        </td>
        <td className="py-3.5 px-3">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 ${
              mentor.available
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-stone-600/30 bg-stone-700/20 text-stone-500 hover:bg-stone-700/30'
            }`}
          >
            {mentor.available ? 'Active' : 'Hidden'}
          </button>
        </td>
        <td className="py-3.5 pl-3 pr-5">
          <button onClick={() => setExpanded(e => !e)} className="text-stone-600 hover:text-stone-300 transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-white/4 bg-white/1">
          <td colSpan={9} className="px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-1">Bio</p>
                <p className="text-xs text-stone-400 leading-relaxed">{mentor.bio || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-1">Expertise</p>
                <div className="flex flex-wrap gap-1">
                  {(mentor.expertise || []).map(e => (
                    <span key={e} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-1">Links</p>
                <div className="space-y-1">
                  {mentor.linkedin_url && (
                    <a href={mentor.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-sky-400 hover:underline">
                      <Link className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-stone-600 mt-2">
                  ID: <span className="font-mono text-stone-500">{mentor.id}</span>
                </p>
                <p className="text-[10px] text-stone-600">
                  Joined: {new Date(mentor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function DevMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterAvailable) params.set('available', filterAvailable);
      const r = await devFetch(`/mentors?${params}`);
      if (!r.ok) throw new Error(await r.text());
      setMentors(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterAvailable]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(id, available) {
    try {
      const r = await devFetch(`/mentors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ available }),
      });
      if (!r.ok) throw new Error(await r.text());
      const updated = await r.json();
      setMentors(ms => ms.map(m => m.id === id ? { ...m, available: updated.available } : m));
    } catch (e) {
      alert(`Failed: ${e.message}`);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mentors</h1>
          <p className="text-xs text-stone-500 mt-0.5">{mentors.length} profiles</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mentors…"
              className="rounded-xl border border-white/8 bg-white/4 pl-8 pr-3 py-2 text-xs text-white placeholder-stone-600 outline-none focus:border-orange-500/50 focus:bg-white/6 w-48"
            />
          </div>
          <select
            value={filterAvailable}
            onChange={e => setFilterAvailable(e.target.value)}
            className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-stone-300 outline-none focus:border-orange-500/50"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Hidden</option>
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-stone-400 hover:text-white hover:bg-white/6 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/6">
                {['Mentor', 'Title', 'Company', 'Industry', 'Rating', 'Sessions', 'Calendar', 'Status', ''].map(h => (
                  <th key={h} className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-600 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-stone-600">Loading…</td>
                </tr>
              )}
              {!loading && mentors.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-stone-600">No mentors found.</td>
                </tr>
              )}
              {mentors.map(m => (
                <MentorRow key={m.id} mentor={m} onToggle={handleToggle} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
