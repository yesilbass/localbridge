import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { MENTORSHIP_CATEGORIES, getSubcategoriesForCategory } from '../../constants/mentorshipCategories';
import { createMentorPost, deleteMentorPost, getMentorPosts } from '../../api/mentorPosts';

export default function MentorPostsPanel() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', category_id: '', subcategory_id: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    void getMentorPosts({ limit: 20 }).then(({ data }) => setPosts(data ?? []));
  };

  useEffect(() => { load(); }, []);

  async function handlePublish(e) {
    e.preventDefault();
    if (form.body.length > 2000) return;
    setSaving(true);
    const { data, error } = await createMentorPost(form);
    setSaving(false);
    if (!error && data) {
      setPosts((prev) => [data, ...prev]);
      setForm({ title: '', body: '', category_id: '', subcategory_id: '' });
    }
  }

  const subcats = form.category_id ? getSubcategoriesForCategory(form.category_id) : [];

  return (
    <div className="flex flex-col gap-8">
      <article className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--bridge-text)' }}>Write a post</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>Short-form advice — 100–800 words.</p>
        <form onSubmit={handlePublish} className="mt-4 space-y-3">
          <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="w-full rounded-lg px-3 py-2 text-sm" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }} />
          <textarea required value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value.slice(0, 2000) }))} rows={6} placeholder="Share your advice…" className="w-full rounded-lg px-3 py-2 text-sm" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }} />
          <p className="text-right text-xs tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>{2000 - form.body.length} remaining</p>
          <div className="flex flex-wrap gap-2">
            <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: '' }))} className="rounded-lg px-3 py-2 text-sm" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              <option value="">Category (optional)</option>
              {MENTORSHIP_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {subcats.length > 0 && (
              <select value={form.subcategory_id} onChange={(e) => setForm((f) => ({ ...f, subcategory_id: e.target.value }))} className="rounded-lg px-3 py-2 text-sm" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <option value="">Focus area (optional)</option>
                {subcats.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            )}
          </div>
          <button type="submit" disabled={saving} className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}>
            {saving ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </article>

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold" style={{ color: 'var(--bridge-text)' }}>{post.title}</h3>
              <button type="button" onClick={async () => { await deleteMentorPost(post.id); load(); }} className="text-xs" style={{ color: 'var(--color-error)' }}>Delete</button>
            </div>
            <div className="mt-2 text-sm prose prose-sm max-w-none" style={{ color: 'var(--bridge-text-secondary)' }} dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }} />
          </article>
        ))}
        {posts.length === 0 && <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>No posts yet.</p>}
      </div>
    </div>
  );
}
