import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { getAdminPosts, publishPost, rejectPost, fmtDate, calcReadTime } from '../../../api/blog';
import { focusRing } from '../../../ui';

const STATUS_FILTERS = ['pending', 'published', 'rejected'];

const CATEGORY_COLORS = {
  Career:  'var(--color-primary)',
  Craft:   '#6366f1',
  Mentors: '#0ea5e9',
  Stories: '#10b981',
  Product: 'var(--color-primary)',
};

export default function AdminBlog() {
  const [filter, setFilter] = useState('pending');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null); setActionMsg('');
    try {
      const data = await getAdminPosts(filter);
      setPosts(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      if (data.length === 0) setSelectedId(null);
    } catch (err) {
      setError(err.message || 'Could not load posts. Admin access required.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelectedId(null); }, [filter]);

  const selected = posts.find((p) => p.id === selectedId) || null;

  async function handlePublish() {
    if (!selectedId) return;
    setBusy(true); setActionMsg('');
    try {
      await publishPost(selectedId);
      setActionMsg('Post published.');
      await load();
    } catch (err) {
      setActionMsg(err.message || 'Could not publish.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!selectedId) return;
    setBusy(true); setActionMsg('');
    try {
      await rejectPost(selectedId, rejectReason.trim() || null);
      setActionMsg('Post returned with feedback.');
      setRejecting(false);
      setRejectReason('');
      await load();
    } catch (err) {
      setActionMsg(err.message || 'Could not reject.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="mx-auto flex gap-4 px-4 py-6 sm:px-6"
      style={{ maxWidth: 1400, height: 'calc(100vh - 5.25rem)' }}
    >
      {/* Queue sidebar */}
      <aside className="flex w-72 shrink-0 flex-col gap-3">
        <header className="flex items-center justify-between">
          <h1 className="text-base font-black" style={{ color: 'var(--bridge-text)' }}>Blog Review</h1>
          <span className="tabular-nums rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-muted)' }}>
            {posts.length}
          </span>
        </header>

        {/* Filter tabs */}
        <div className="flex rounded-xl p-1 gap-1" style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-lg py-1.5 text-[12px] font-semibold capitalize transition ${focusRing}`}
              style={{
                backgroundColor: filter === f ? 'var(--bridge-surface)' : 'transparent',
                color: filter === f ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
                boxShadow: filter === f ? 'inset 0 0 0 1px var(--bridge-border)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--bridge-text-muted)' }} />
            </div>
          ) : error ? (
            <p className="px-2 py-4 text-[13px]" style={{ color: '#ef4444' }}>{error}</p>
          ) : posts.length === 0 ? (
            <p className="px-2 py-4 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>No {filter} posts.</p>
          ) : posts.map((post) => (
            <button
              key={post.id}
              onClick={() => { setSelectedId(post.id); setRejecting(false); setRejectReason(''); setActionMsg(''); }}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${focusRing}`}
              style={{
                backgroundColor: selectedId === post.id ? 'var(--bridge-surface)' : 'var(--bridge-surface-muted)',
                boxShadow: selectedId === post.id ? 'inset 0 0 0 1px var(--bridge-border)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>{post.title || 'Untitled'}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
                    {post.author_name} · {post.category}
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
                    {fmtDate(post.created_at)}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--bridge-text-faint)' }} aria-hidden />
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Detail panel */}
      <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[14px]" style={{ color: 'var(--bridge-text-muted)' }}>Select a post to review.</p>
          </div>
        ) : (
          <>
            {/* Post header */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                  style={{ letterSpacing: '0.28em', backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[selected.category] ?? 'var(--color-primary)'} 12%, transparent)`, color: CATEGORY_COLORS[selected.category] ?? 'var(--color-primary)' }}
                >
                  {selected.category}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>{calcReadTime(selected.body)} read</span>
                <span className="text-[12px]" style={{ color: 'var(--bridge-text-faint)' }}>by {selected.author_name}</span>
              </div>
              <h2 className="font-display text-2xl font-black leading-tight" style={{ color: 'var(--bridge-text)' }}>
                {selected.title}
              </h2>
              {selected.excerpt && (
                <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)', fontStyle: 'italic' }}>
                  {selected.excerpt}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              <p className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--bridge-text-faint)' }}>Full content</p>
              <div className="space-y-4">
                {selected.body.split('\n\n').map((para, i) => (
                  <p key={i} className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>{para}</p>
                ))}
              </div>
            </div>

            {/* Actions */}
            {filter === 'pending' && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--bridge-text-faint)' }}>Decision</p>

                {actionMsg && (
                  <p className="mb-3 text-[13px] font-semibold" style={{ color: '#22c55e' }}>{actionMsg}</p>
                )}

                {!rejecting ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handlePublish}
                      disabled={busy}
                      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${focusRing}`}
                      style={{ backgroundColor: '#22c55e', color: '#fff' }}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
                      Publish
                    </button>
                    <button
                      onClick={() => setRejecting(true)}
                      disabled={busy}
                      className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${focusRing}`}
                      style={{ borderColor: '#fca5a5', color: '#ef4444', backgroundColor: 'color-mix(in srgb, #ef4444 6%, transparent)' }}
                    >
                      <XCircle className="h-4 w-4" aria-hidden />
                      Request changes
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain what needs to change (optional but recommended)…"
                      className={`w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 ${focusRing}`}
                      style={{
                        borderColor: 'var(--bridge-border)',
                        backgroundColor: 'var(--bridge-surface-muted)',
                        color: 'var(--bridge-text)',
                        focusRingColor: '#ef4444',
                      }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        disabled={busy}
                        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${focusRing}`}
                        style={{ backgroundColor: '#ef4444', color: '#fff' }}
                      >
                        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                        Send feedback
                      </button>
                      <button
                        onClick={() => { setRejecting(false); setRejectReason(''); }}
                        className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${focusRing}`}
                        style={{ borderColor: 'var(--bridge-border)', color: 'var(--bridge-text-secondary)', backgroundColor: 'var(--bridge-surface-muted)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rejection reason display for published/rejected views */}
            {filter !== 'pending' && selected.rejection_reason && (
              <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 20%, transparent)' }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>Feedback sent</p>
                <p className="text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>{selected.rejection_reason}</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
