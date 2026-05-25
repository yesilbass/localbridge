import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MENTORSHIP_CATEGORIES } from '../../constants/mentorshipCategories';
import { getCategoryIcon } from '../../utils/mentorshipCategoryIcons';
import {
  getCommunityPosts,
  getCategoryPostCounts,
  getCategoryLastActivity,
  getUserUpvotes,
  togglePostUpvote,
  deleteCommunityPost,
  getComments,
  createComment,
  deleteComment,
} from '../../api/community';
import { formatRelativeTime } from '../dashboard/dashboardHooks.js';
import { useAuth } from '../../context/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CommunityPostCard, CreatePostForm, useCommunityPaths } from './communityShared';

const PAGE_SIZE = 20;

function relativeActivity(iso) {
  if (!iso) return 'Be the first to post';
  return `Last active ${formatRelativeTime(iso)}`;
}

export default function CommunityHub() {
  const { user } = useAuth();
  const { embedded, categoryPath } = useCommunityPaths();
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [lastActivity, setLastActivity] = useState({});
  const [upvoted, setUpvoted] = useState(new Set());
  const [bodyExpanded, setBodyExpanded] = useState({});
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [justPostedId, setJustPostedId] = useState(null);

  const loadPosts = useCallback(async (nextOffset, append = false) => {
    setLoading(true);
    const { data, totalCount: total } = await getCommunityPosts({ limit: PAGE_SIZE, offset: nextOffset });
    setPosts((prev) => (append ? [...prev, ...data] : data));
    setTotalCount(total);
    setOffset(nextOffset);
    setUpvoted(await getUserUpvotes(data.map((p) => p.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPosts(0, false);
    void getCategoryPostCounts().then(({ data }) => setCounts(data ?? {}));
    void getCategoryLastActivity().then(({ data }) => setLastActivity(data ?? {}));
  }, [loadPosts]);

  async function handleUpvote(postId) {
    const prev = upvoted.has(postId);
    setUpvoted((s) => {
      const next = new Set(s);
      if (prev) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((list) => list.map((p) => (
      p.id === postId ? { ...p, upvotes: (p.upvotes ?? 0) + (prev ? -1 : 1) } : p
    )));
    const { count, upvoted: nowUp } = await togglePostUpvote(postId, user?.id);
    setPosts((list) => list.map((p) => (p.id === postId ? { ...p, upvotes: count } : p)));
    setUpvoted((s) => {
      const next = new Set(s);
      if (nowUp) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  async function toggleComments(postId) {
    const open = !commentsOpen[postId];
    setCommentsOpen((m) => ({ ...m, [postId]: open }));
    if (open && !commentsByPost[postId]) {
      const { data } = await getComments(postId);
      setCommentsByPost((m) => ({ ...m, [postId]: data ?? [] }));
    }
  }

  async function submitComment(postId) {
    const body = commentDrafts[postId]?.trim();
    if (!body) return;
    const { data } = await createComment({ post_id: postId, body });
    if (data) {
      setCommentsByPost((m) => ({ ...m, [postId]: [...(m[postId] ?? []), data] }));
      setPosts((list) => list.map((p) => (
        p.id === postId ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p
      )));
      setCommentDrafts((m) => ({ ...m, [postId]: '' }));
    }
  }

  function handleCreated(post) {
    setPosts((prev) => [post, ...prev]);
    setShowForm(false);
    setJustPostedId(post.id);
    window.setTimeout(() => setJustPostedId(null), 2000);
  }

  const hasMore = posts.length < totalCount;
  const Root = embedded ? 'div' : 'main';

  return (
    <Root className={embedded ? 'min-w-0' : 'mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10'}>
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
        <section className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
              What&apos;s happening on Bridge
            </h1>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold lg:hidden"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
            >
              <Plus className="h-4 w-4" /> New post
            </button>
          </div>

          {showForm && (
            <CreatePostForm onCancel={() => setShowForm(false)} onCreated={handleCreated} />
          )}

          <div className="-mx-5 mb-6 flex gap-3 overflow-x-auto px-5 pb-2 lg:hidden">
            {MENTORSHIP_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={categoryPath(cat.id)}
                  className="flex min-w-[200px] shrink-0 flex-col gap-2 rounded-xl p-4"
                  style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  <span className="text-sm font-bold" style={{ color: 'var(--bridge-text)' }}>{cat.label}</span>
                  <span className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
                    {counts[cat.id] ?? 0} posts · {relativeActivity(lastActivity[cat.id])}
                  </span>
                </Link>
              );
            })}
          </div>

          {loading && posts.length === 0 ? (
            <LoadingSpinner label="Loading feed…" className="min-h-[30vh]" />
          ) : posts.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>
              <p className="font-semibold" style={{ color: 'var(--bridge-text)' }}>Nothing here yet. Be the first to post.</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm font-bold underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Start a discussion →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  upvoted={upvoted.has(post.id)}
                  onUpvote={() => handleUpvote(post.id)}
                  bodyExpanded={Boolean(bodyExpanded[post.id])}
                  onToggleBody={() => setBodyExpanded((m) => ({ ...m, [post.id]: !m[post.id] }))}
                  commentsExpanded={Boolean(commentsOpen[post.id])}
                  onToggleComments={() => toggleComments(post.id)}
                  comments={commentsByPost[post.id] ?? []}
                  commentDraft={commentDrafts[post.id] ?? ''}
                  onCommentDraftChange={(v) => setCommentDrafts((m) => ({ ...m, [post.id]: v }))}
                  onSubmitComment={() => submitComment(post.id)}
                  onDeletePost={async () => {
                    await deleteCommunityPost(post.id);
                    setPosts((list) => list.filter((p) => p.id !== post.id));
                  }}
                  onDeleteComment={async (commentId) => {
                    await deleteComment(commentId);
                    setCommentsByPost((m) => ({
                      ...m,
                      [post.id]: (m[post.id] ?? []).filter((c) => c.id !== commentId),
                    }));
                    setPosts((list) => list.map((p) => (
                      p.id === post.id ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) } : p
                    )));
                  }}
                  currentUserId={user?.id}
                  justPosted={justPostedId === post.id}
                />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <button
              type="button"
              onClick={() => loadPosts(offset + PAGE_SIZE, true)}
              className="mt-6 w-full rounded-full py-3 text-sm font-bold"
              style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text-secondary)' }}
            >
              Load more
            </button>
          )}
        </section>

        <aside className="hidden lg:block">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            <Plus className="h-4 w-4" /> New post
          </button>
          <div className="flex flex-col gap-3">
            {MENTORSHIP_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={categoryPath(cat.id)}
                  className="flex flex-col gap-2 rounded-xl p-4 transition hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-bold leading-tight" style={{ color: 'var(--bridge-text)' }}>{cat.label}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
                    {counts[cat.id] ?? 0} posts · {relativeActivity(lastActivity[cat.id])}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </Root>
  );
}
