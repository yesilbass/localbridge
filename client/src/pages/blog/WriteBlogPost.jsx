import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import supabase from '../../api/supabase';
import { upsertDraft, submitForReview, deleteDraft, getMyPosts, slugify, calcReadTime, fmtDate, BLOG_CATEGORIES } from '../../api/blog';
import { focusRing } from '../../ui';
import AppLink from '../../components/AppLink';
import PageGutterAtmosphere from '../../components/PageGutterAtmosphere';

const inputCls = `w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] transition focus:border-[var(--color-primary)] focus:bg-[var(--bridge-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${focusRing}`;
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]';

const STATUS_LABELS = {
  draft:     { label: 'Draft',            color: 'var(--bridge-text-muted)' },
  pending:   { label: 'Under Review',     color: 'var(--color-primary)' },
  published: { label: 'Published',        color: '#22c55e' },
  rejected:  { label: 'Changes Requested', color: '#ef4444' },
};

export default function WriteBlogPost() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [authorName, setAuthorName] = useState('');

  const [myPosts, setMyPosts] = useState([]);
  const [activePostId, setActivePostId] = useState(null);

  const [form, setForm] = useState({ id: null, title: '', category: 'Career', excerpt: '', body: '' });
  const [postStatus, setPostStatus] = useState('draft');
  const [rejectionReason, setRejectionReason] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [preview, setPreview] = useState(false);

  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;
  const readTime = calcReadTime(form.body);

  // Check mentor eligibility
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      const { data: profile } = await supabase
        .from('mentor_profiles')
        .select('id, name, mentor_status, onboarding_complete')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const isAdmin = user.user_metadata?.role === 'admin';
      const isMentor = user.user_metadata?.role === 'mentor';
      const mentorActive = profile?.mentor_status === 'active' && profile?.onboarding_complete;
      setEligible(isAdmin || (isMentor && mentorActive));
      setAuthorName(profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous');
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Load my existing posts
  const loadMyPosts = useCallback(async () => {
    const posts = await getMyPosts();
    setMyPosts(posts);
  }, []);

  useEffect(() => {
    if (eligible) loadMyPosts();
  }, [eligible, loadMyPosts]);

  function pickPost(post) {
    setActivePostId(post.id);
    setForm({ id: post.id, title: post.title, category: post.category, excerpt: post.excerpt, body: post.body });
    setPostStatus(post.status);
    setRejectionReason(post.rejection_reason || '');
    setLastSaved(post.updated_at);
    setSubmitted(post.status === 'pending');
    setValidationError('');
    setSaveError('');
    setPreview(false);
  }

  function newPost() {
    setActivePostId(null);
    setForm({ id: null, title: '', category: 'Career', excerpt: '', body: '' });
    setPostStatus('draft');
    setRejectionReason('');
    setLastSaved(null);
    setSubmitted(false);
    setValidationError('');
    setSaveError('');
    setPreview(false);
  }

  function patch(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaveError('');
    setValidationError('');
  }

  async function saveDraft() {
    if (!form.title.trim()) { setSaveError('Add a title before saving.'); return; }
    setSaving(true); setSaveError('');
    try {
      const payload = {
        ...(form.id ? { id: form.id } : {}),
        title: form.title.trim(),
        slug: slugify(form.title),
        category: form.category,
        excerpt: form.excerpt.trim(),
        body: form.body,
        author_id: user.id,
        author_name: authorName,
        author_role: user.user_metadata?.role === 'admin' ? 'admin' : 'mentor',
        status: 'draft',
        read_time: readTime,
      };
      const result = await upsertDraft(payload);
      setForm((f) => ({ ...f, id: result.id }));
      setActivePostId(result.id);
      setPostStatus('draft');
      setLastSaved(new Date().toISOString());
      await loadMyPosts();
    } catch (err) {
      setSaveError(err.message || 'Could not save draft.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setValidationError('');
    if (!form.title.trim()) { setValidationError('Title is required.'); return; }
    if (form.excerpt.trim().length < 20) { setValidationError('Excerpt must be at least 20 characters.'); return; }
    if (wordCount < 100) { setValidationError(`Body must be at least 100 words (${wordCount} so far).`); return; }

    setSubmitting(true);
    try {
      await saveDraft();
      const id = form.id || activePostId;
      if (!id) throw new Error('Could not save before submitting.');
      await submitForReview(id);
      setPostStatus('pending');
      setSubmitted(true);
      await loadMyPosts();
    } catch (err) {
      setValidationError(err.message || 'Could not submit for review.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(postId) {
    if (!window.confirm('Delete this draft? This cannot be undone.')) return;
    try {
      await deleteDraft(postId);
      if (activePostId === postId) newPost();
      await loadMyPosts();
    } catch {}
  }

  if (authLoading || checking) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner label="Loading…" size="lg" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-[15px] font-semibold" style={{ color: 'var(--bridge-text)' }}>Sign in to write for Bridge.</p>
        <Link to="/login" className={`rounded-full px-5 py-2 text-sm font-bold ${focusRing}`} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>Sign in</Link>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-[15px] font-semibold" style={{ color: 'var(--bridge-text)' }}>Writing for Bridge is available to verified mentors.</p>
        <p className="text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>Complete your mentor application and profile to get access.</p>
        <AppLink to="/dashboard" className={`rounded-full px-5 py-2 text-sm font-bold ${focusRing}`} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>Go to dashboard</AppLink>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <PageGutterAtmosphere />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/blog"
            className={`flex items-center gap-2 text-[13px] font-semibold transition-opacity hover:opacity-70 ${focusRing} rounded-lg`}
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Blog
          </Link>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
                Saved {fmtDate(lastSaved)}
              </span>
            )}
            {postStatus !== 'draft' && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                style={{
                  letterSpacing: '0.2em',
                  backgroundColor: `color-mix(in srgb, ${STATUS_LABELS[postStatus]?.color ?? 'currentColor'} 12%, transparent)`,
                  color: STATUS_LABELS[postStatus]?.color ?? 'var(--bridge-text-muted)',
                }}
              >
                {STATUS_LABELS[postStatus]?.label ?? postStatus}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-6">

          {/* Sidebar — my posts */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-6 flex flex-col gap-2">
              <button
                onClick={newPost}
                className={`w-full rounded-xl border-2 border-dashed px-3 py-2.5 text-left text-[13px] font-semibold transition ${focusRing}`}
                style={{
                  borderColor: 'var(--bridge-border)',
                  color: 'var(--color-primary)',
                  backgroundColor: !activePostId ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'transparent',
                }}
              >
                + New post
              </button>

              {myPosts.length > 0 && (
                <div className="mt-2">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--bridge-text-faint)' }}>My posts</p>
                  <div className="flex flex-col gap-1">
                    {myPosts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => pickPost(p)}
                        className={`w-full rounded-xl px-3 py-2.5 text-left transition ${focusRing}`}
                        style={{
                          backgroundColor: activePostId === p.id ? 'var(--bridge-surface-muted)' : 'transparent',
                          boxShadow: activePostId === p.id ? 'inset 0 0 0 1px var(--bridge-border)' : 'none',
                        }}
                      >
                        <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--bridge-text)' }}>{p.title || 'Untitled'}</p>
                        <p className="mt-0.5 text-[11px] font-semibold" style={{ color: STATUS_LABELS[p.status]?.color ?? 'var(--bridge-text-muted)' }}>
                          {STATUS_LABELS[p.status]?.label ?? p.status}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main editor */}
          <div className="min-w-0 flex-1">

            {submitted && postStatus === 'pending' ? (
              <div className="flex flex-col items-center gap-6 rounded-3xl py-20 text-center" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, #22c55e 12%, transparent)' }}>
                  <CheckCircle2 className="h-8 w-8" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>Submitted for review</h2>
                  <p className="mt-2 text-[15px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                    The Bridge team will review your post and publish it once approved. You'll be notified by email.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={newPost}
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${focusRing}`}
                    style={{ borderColor: 'var(--bridge-border)', color: 'var(--bridge-text-secondary)', backgroundColor: 'var(--bridge-surface-muted)' }}
                  >
                    Write another
                  </button>
                  <Link
                    to="/blog"
                    className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${focusRing}`}
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    View blog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {/* Rejection notice */}
                {postStatus === 'rejected' && (
                  <div className="rounded-2xl border px-5 py-4" style={{ borderColor: '#fca5a5', backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)' }}>
                    <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Changes requested</p>
                    {rejectionReason && <p className="mt-1 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>{rejectionReason}</p>}
                    <p className="mt-2 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Edit your post and resubmit for review.</p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className={labelCls}>Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => patch('title', e.target.value)}
                    className={inputCls}
                    placeholder="Your post title"
                    disabled={postStatus === 'pending' || postStatus === 'published'}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => patch('category', e.target.value)}
                    className={inputCls}
                    disabled={postStatus === 'pending' || postStatus === 'published'}
                  >
                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Excerpt */}
                <div>
                  <label className={labelCls}>
                    Excerpt *
                    <span className="ml-1 normal-case font-normal" style={{ color: 'var(--bridge-text-faint)' }}>
                      — 2–3 sentences shown on the blog index
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.excerpt}
                    onChange={(e) => patch('excerpt', e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="A short hook that makes readers want to read the full post…"
                    maxLength={300}
                    disabled={postStatus === 'pending' || postStatus === 'published'}
                  />
                  <p className="mt-1 text-right text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
                    {form.excerpt.length}/300
                  </p>
                </div>

                {/* Body */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={`${labelCls} mb-0`}>Body *</label>
                    <button
                      type="button"
                      onClick={() => setPreview((p) => !p)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-semibold transition ${focusRing}`}
                      style={{ color: 'var(--bridge-text-secondary)', backgroundColor: 'var(--bridge-surface-muted)' }}
                    >
                      {preview ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
                      {preview ? 'Edit' : 'Preview'}
                    </button>
                  </div>

                  {preview ? (
                    <div
                      className="min-h-[20rem] rounded-xl p-5"
                      style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                    >
                      {form.body.split('\n\n').map((para, i) => (
                        <p key={i} className="mb-4 text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
                          {para}
                        </p>
                      ))}
                      {!form.body.trim() && (
                        <p className="text-sm italic" style={{ color: 'var(--bridge-text-faint)' }}>Nothing to preview yet.</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      rows={20}
                      value={form.body}
                      onChange={(e) => patch('body', e.target.value)}
                      className={`${inputCls} resize-y`}
                      placeholder="Write your full post here. Separate paragraphs with a blank line.

Share your expertise, your story, or your perspective. Be specific and genuine — that's what Bridge readers respond to."
                      disabled={postStatus === 'pending' || postStatus === 'published'}
                    />
                  )}

                  <div className="mt-2 flex items-center gap-3" style={{ color: 'var(--bridge-text-faint)' }}>
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    <span className="text-[12px] tabular-nums">{wordCount} words · {readTime} read</span>
                    {wordCount >= 100
                      ? <span className="text-[12px] font-semibold" style={{ color: '#22c55e' }}>Meets minimum</span>
                      : <span className="text-[12px]">min 100 words</span>
                    }
                  </div>
                </div>

                {/* Error */}
                {(validationError || saveError) && (
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 10%, transparent)', color: '#ef4444' }}>
                    {validationError || saveError}
                  </div>
                )}

                {/* Actions */}
                {postStatus !== 'published' && (
                  <div className="flex items-center justify-between gap-3 border-t pt-5" style={{ borderColor: 'var(--bridge-border)' }}>
                    <div className="flex items-center gap-3">
                      {form.id && postStatus === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(form.id)}
                          className={`text-[13px] font-semibold transition hover:opacity-70 ${focusRing} rounded-lg`}
                          style={{ color: '#ef4444' }}
                        >
                          Delete draft
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {postStatus !== 'pending' && (
                        <button
                          type="button"
                          onClick={saveDraft}
                          disabled={saving}
                          className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${focusRing}`}
                          style={{ borderColor: 'var(--bridge-border)', color: 'var(--bridge-text-secondary)', backgroundColor: 'var(--bridge-surface-muted)' }}
                        >
                          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                          {saving ? 'Saving…' : 'Save draft'}
                        </button>
                      )}
                      {postStatus !== 'pending' && (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting || saving}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${focusRing}`}
                          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        >
                          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                          {submitting ? 'Submitting…' : 'Submit for review'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
