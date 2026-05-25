import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HelpCircle, Trophy, MessageCircle, Link as LinkIcon,
  Heart, Trash2,
} from 'lucide-react';
import { MENTORSHIP_CATEGORIES, getCategoryLabel } from '../../constants/mentorshipCategories';
import { formatRelativeTime } from '../dashboard/dashboardHooks.js';
import { createCommunityPost } from '../../api/community';
import { communityPath, getCommunityBase } from './communityPaths';

export function useCommunityPaths() {
  const { pathname } = useLocation();
  const base = getCommunityBase(pathname);
  return {
    embedded: base.startsWith('/dashboard'),
    base,
    hubPath: base,
    categoryPath: (id) => communityPath(pathname, id),
  };
}

export const POST_TYPES = [
  { id: 'question', label: 'Question', icon: HelpCircle },
  { id: 'win', label: 'Win', icon: Trophy },
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  { id: 'resource', label: 'Resource', icon: LinkIcon },
];

export const POST_TYPE_STYLES = {
  question: {
    bg: 'color-mix(in srgb, var(--color-info) 12%, var(--bridge-surface-muted))',
    color: 'var(--color-info)',
  },
  win: {
    bg: 'color-mix(in srgb, var(--color-success) 12%, var(--bridge-surface-muted))',
    color: 'var(--color-success)',
  },
  discussion: {
    bg: 'var(--bridge-surface-muted)',
    color: 'var(--bridge-text-secondary)',
  },
  resource: {
    bg: 'color-mix(in srgb, var(--color-warning) 12%, var(--bridge-surface-muted))',
    color: 'var(--color-warning)',
  },
};

export const TITLE_PLACEHOLDERS = {
  question: 'What do you want to know?',
  win: 'What worked for you?',
  discussion: "What's on your mind?",
  resource: 'What are you sharing?',
};

export function MentorBadge() {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-success) 16%, transparent)',
        color: 'var(--color-success)',
      }}
    >
      Mentor
    </span>
  );
}

export function AuthorAvatar({ name, avatarUrl, size = 'sm' }) {
  const initials = (name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={`${dim} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span
      className={`${dim} grid shrink-0 place-items-center rounded-full font-bold`}
      style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function PostTypePill({ type }) {
  const meta = POST_TYPES.find((t) => t.id === type) ?? POST_TYPES[0];
  const style = POST_TYPE_STYLES[type] ?? POST_TYPE_STYLES.discussion;
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {meta.label}
    </span>
  );
}

function AuthorName({ author }) {
  const inner = (
    <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
      {author.name}
    </span>
  );
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {author.is_mentor && author.mentor_profile_id ? (
        <Link to={`/mentors/${author.mentor_profile_id}`} className="hover:underline">
          {inner}
        </Link>
      ) : inner}
      {author.is_mentor ? <MentorBadge /> : null}
    </span>
  );
}

function PillarSelect({ value, onChange, hidden }) {
  if (hidden) return null;
  return (
    <label className="block text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>
      Pillar
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
      >
        <option value="">Select a pillar…</option>
        {MENTORSHIP_CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
    </label>
  );
}

export function CreatePostForm({
  categoryId = '',
  lockCategory = false,
  onCancel,
  onCreated,
}) {
  const [category_id, setCategoryId] = useState(categoryId);
  const [post_type, setPostType] = useState('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const cat = lockCategory ? categoryId : category_id;
    if (!cat) { setError('Choose a pillar'); return; }
    if (title.trim().length < 1 || title.length > 120) { setError('Title is required (max 120 chars)'); return; }
    if (body.trim().length < 50 || body.length > 2000) { setError('Body must be 50–2000 characters'); return; }

    setSubmitting(true);
    const { data, error: err } = await createCommunityPost({
      category_id: cat,
      post_type,
      title: title.trim(),
      body: body.trim(),
    });
    setSubmitting(false);
    if (err || !data) {
      setError(err?.message ?? 'Could not post');
      return;
    }
    onCreated?.(data);
    setTitle('');
    setBody('');
  }

  const selectedCategoryId = lockCategory ? categoryId : category_id;
  const submitLabel = selectedCategoryId
    ? `Post to ${getCategoryLabel(selectedCategoryId)} community`
    : 'Post to community';

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl p-5"
      style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      <PillarSelect value={category_id} onChange={setCategoryId} hidden={lockCategory} />

      <div className={`flex flex-wrap gap-2 ${lockCategory ? '' : 'mt-4'}`}>
        {POST_TYPES.map(({ id, label, icon: Icon }) => {
          const style = POST_TYPE_STYLES[id];
          const active = post_type === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPostType(id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition"
              style={{
                backgroundColor: active ? style.bg : 'transparent',
                color: active ? style.color : 'var(--bridge-text-muted)',
                boxShadow: active ? 'inset 0 0 0 1px var(--bridge-border)' : 'inset 0 0 0 1px transparent',
              }}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        maxLength={120}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={TITLE_PLACEHOLDERS[post_type]}
        className="mt-4 w-full rounded-xl border px-4 py-2.5 text-[15px] font-semibold outline-none"
        style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
      />

      <textarea
        rows={4}
        maxLength={2000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none"
        style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
        placeholder="Share your question, win, or insight…"
      />
      <p className="mt-1 text-xs tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>{body.length}/2000</p>

      {error && <p className="mt-2 text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
        >
          {submitting ? 'Posting…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-medium underline" style={{ color: 'var(--bridge-text-muted)' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CommunityPostCard({
  post,
  upvoted,
  onUpvote,
  bodyExpanded,
  onToggleBody,
  commentsExpanded,
  onToggleComments,
  comments = [],
  commentDraft = '',
  onCommentDraftChange,
  onSubmitComment,
  onDeletePost,
  onDeleteComment,
  currentUserId,
  showCategoryPill = true,
  justPosted = false,
  commentsLimit = 10,
}) {
  const { categoryPath } = useCommunityPaths();
  const preview = post.body.length > 140 && !bodyExpanded
    ? `${post.body.slice(0, 140)}…`
    : post.body;
  const visibleComments = comments.slice(0, commentsLimit);

  return (
    <article
      className="rounded-2xl p-4 sm:p-5"
      style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      {justPosted && (
        <p className="mb-2 text-xs font-bold" style={{ color: 'var(--color-success)' }}>Posted ✓</p>
      )}
      <div className="flex items-start gap-3">
        <AuthorAvatar name={post.author?.name} avatarUrl={post.author?.avatar} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AuthorName author={post.author ?? { name: 'Member' }} />
            <PostTypePill type={post.post_type} />
            {showCategoryPill && (
              <Link
                to={categoryPath(post.category_id)}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--color-primary)' }}
              >
                {getCategoryLabel(post.category_id)}
              </Link>
            )}
          </div>
          <h3 className="mt-2 text-[15px] font-bold leading-snug" style={{ color: 'var(--bridge-text)' }}>
            {post.title}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            {preview}
            {post.body.length > 140 && !bodyExpanded && (
              <button type="button" onClick={onToggleBody} className="ml-1 font-semibold underline" style={{ color: 'var(--color-primary)' }}>
                Read more
              </button>
            )}
            {bodyExpanded && post.body.length > 140 && (
              <button type="button" onClick={onToggleBody} className="ml-2 text-xs font-semibold underline" style={{ color: 'var(--bridge-text-muted)' }}>
                Show less
              </button>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={onUpvote}
              className="inline-flex items-center gap-1.5 font-semibold"
              style={{ color: upvoted ? 'var(--color-error)' : 'var(--bridge-text-muted)' }}
            >
              <Heart className={`h-4 w-4 ${upvoted ? 'fill-current' : ''}`} aria-hidden />
              {post.upvotes ?? 0}
            </button>
            <button
              type="button"
              onClick={onToggleComments}
              className="inline-flex items-center gap-1.5 font-semibold"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {post.comment_count ?? 0}
            </button>
            <span className="text-xs" style={{ color: 'var(--bridge-text-faint)' }}>
              {formatRelativeTime(post.created_at)}
            </span>
            {currentUserId === post.author_id && (
              <button type="button" onClick={onDeletePost} aria-label="Delete post" style={{ color: 'var(--bridge-text-muted)' }}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {commentsExpanded && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--bridge-border)' }}>
              <ul className="space-y-3">
                {visibleComments.map((c) => (
                  <li key={c.id} className="flex gap-2">
                    <AuthorAvatar name={c.author?.name} avatarUrl={c.author?.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <AuthorName author={c.author ?? { name: 'Member' }} />
                        <span className="text-[10px]" style={{ color: 'var(--bridge-text-faint)' }}>
                          {formatRelativeTime(c.created_at)}
                        </span>
                        {currentUserId === c.author_id && (
                          <button type="button" onClick={() => onDeleteComment?.(c.id)} aria-label="Delete comment">
                            <Trash2 className="h-3 w-3" style={{ color: 'var(--bridge-text-muted)' }} />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {currentUserId && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={commentDraft}
                    onChange={(e) => onCommentDraftChange?.(e.target.value)}
                    placeholder="Write a reply…"
                    className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
                  />
                  <button
                    type="button"
                    onClick={onSubmitComment}
                    className="shrink-0 rounded-full px-4 py-2 text-xs font-bold"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
