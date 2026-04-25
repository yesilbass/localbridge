import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import { Search, RefreshCw, AlertCircle, User, Briefcase } from 'lucide-react';

export default function DevUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await devFetch('/users');
      if (!r.ok) throw new Error(await r.text());
      setUsers(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  });

  const mentors = users.filter(u => u.role === 'mentor').length;
  const mentees = users.filter(u => u.role !== 'mentor').length;

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {users.length} total · {mentors} mentors · {mentees} mentees
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="rounded-xl border border-white/8 bg-white/4 pl-8 pr-3 py-2 text-xs text-white placeholder-stone-600 outline-none focus:border-orange-500/50 w-44"
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
                {['User', 'Role', 'Joined', 'Last Sign In', 'ID'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-600 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-stone-600">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-stone-600">No users found.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="py-3.5 pl-5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-stone-700 to-stone-600 flex items-center justify-center text-[10px] font-bold text-stone-300">
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-200">{u.full_name || '—'}</p>
                        <p className="text-[10px] text-stone-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.role === 'mentor' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                        <Briefcase className="h-2.5 w-2.5" />
                        Mentor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                        <User className="h-2.5 w-2.5" />
                        Mentee
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-stone-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-stone-400">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : '—'}
                  </td>
                  <td className="py-3.5 pl-4 pr-5">
                    <span className="font-mono text-[10px] text-stone-600">{u.id?.slice(0, 12)}…</span>
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
