import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import { Star, Trash2, RefreshCw, AlertCircle, Search } from 'lucide-react';

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} />
      ))}
    </div>
  );
}

export default function DevReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await devFetch('/reviews');
      if (!r.ok) throw new Error(await r.text());
      setReviews(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const r = await devFetch(`/reviews/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(await r.text());
      setReviews(rs => rs.filter(rv => rv.id !== id));
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e.message);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = reviews.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.mentor_profiles?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(2)
    : '—';

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-400">
          {filtered.length} of {reviews.length} · avg {avg} ★
        </p>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews…"
              className="rounded-xl border border-white/8 bg-white/4 pl-8 pr-3 py-2 text-xs text-white placeholder-stone-600 outline-none focus:border-orange-500/50 w-44"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-stone-400 hover:text-white hover:bg-white/6 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400 transition-colors text-base leading-none">×</button>
        </div>
      )}

      {loading && <div className="py-16 text-center text-sm text-stone-600">Loading…</div>}

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="rounded-2xl border border-white/6 bg-white/3 p-5 hover:bg-white/4 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Stars n={r.rating} />
                  <span className="text-[10px] text-stone-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-stone-300 leading-relaxed">"{r.comment}"</p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-[10px] text-stone-500">
                    Mentor: <span className="text-stone-400">{r.mentor_profiles?.name || '—'}</span>
                    {r.mentor_profiles?.company && ` · ${r.mentor_profiles.company}`}
                  </span>
                  <span className="text-[10px] font-mono text-stone-600">
                    session: {r.session_id?.slice(0, 8)}…
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                {confirmDeleteId === r.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-400 whitespace-nowrap">Delete permanently?</span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="rounded-lg bg-red-500/15 border border-red-500/25 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-40"
                    >
                      {deletingId === r.id ? 'Deleting…' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-medium text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(r.id)}
                    disabled={deletingId === r.id}
                    className="rounded-xl border border-red-500/20 bg-red-500/8 p-2 text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-40"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-stone-600">
            {search ? 'No reviews match your search.' : 'No reviews yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
