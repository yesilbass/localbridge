import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getCategoryById } from '../../constants/mentorshipCategories';
import { getCategoryIcon } from '../../utils/mentorshipCategoryIcons';
import {
  getCommunityPosts,
  getUserUpvotes,
  togglePostUpvote,
  deleteCommunityPost,
  getComments,
  createComment,
  deleteComment,
  getCategoryMemberCount,
} from '../../api/community';
import { useAuth } from '../../context/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CommunityPostCard, CreatePostForm, useCommunityPaths } from './communityShared';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'question', label: 'Questions' },
  { id: 'win', label: 'Wins' },
  { id: 'discussion', label: 'Discussions' },
  { id: 'resource', label: 'Resources' },
];

export default function CommunityCategory() {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const { embedded, hubPath } = useCommunityPaths();
  const category = getCategoryById(categoryId);
  const Icon = category ? getCategoryIcon(category.icon) : null;

  const [postType, setPostType] = useState('');
  const [sort, setSort] = useState('recent');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [upvoted, setUpvoted] = useState(new Set());
  const [bodyExpanded, setBodyExpanded] = useState({});
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    const { data } = await getCommunityPosts({
      category_id: categoryId,
      post_type: postType || undefined,
      sort,
      limit: 50,
    });
    setPosts(data);
    setUpvoted(await getUserUpvotes(data.map((p) => p.id)));
    setLoading(false);
  }, [category, categoryId, postType, sort]);

  useEffect(() => {
    void load();
    void getCategoryMemberCount(categoryId).then(({ count }) => setMemberCount(count));
  }, [load, categoryId]);

  if (!category) {
    return <Navigate to={hubPath} replace />;
  }

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
  }

  const Root = embedded ? 'div' : 'main';

  return (
    <Root className={embedded ? 'relative min-w-0' : 'relative mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:py-10'}>
      <Link to={hubPath} className="text-sm font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
        ← All communities
      </Link>

      <header className="mt-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </span>
          )}
          <div>
            <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
              {category.label}
            </h1>
            <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
              {posts.length} posts · {memberCount} members
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              onClick={() => setPostType(f.id)}
              className="rounded-full px-3 py-1.5 text-xs font-bold"
              style={{
                backgroundColor: postType === f.id ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)' : 'var(--bridge-surface-muted)',
                color: postType === f.id ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {['recent', 'top'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className="text-xs font-bold capitalize underline-offset-2"
              style={{ color: sort === s ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }}
            >
              {s === 'recent' ? 'Recent' : 'Top'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="ml-auto hidden rounded-full px-4 py-2 text-xs font-bold sm:inline-flex"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            New post
          </button>
        </div>
      </header>

      {showForm && (
        <div className="mt-6">
          <CreatePostForm
            categoryId={categoryId}
            lockCategory
            onCancel={() => setShowForm(false)}
            onCreated={handleCreated}
          />
        </div>
      )}

      <section className="mt-8 flex flex-col gap-4">
        {loading ? (
          <LoadingSpinner label="Loading…" className="min-h-[30vh]" />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>
            <p className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
              {category.label} is quiet right now. Start the conversation.
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
              Ask a question, share a win, or start a discussion. Someone here has been through what you&apos;re going through.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-bold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Post something →
            </button>
          </div>
        ) : (
          posts.map((post) => (
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
              }}
              currentUserId={user?.id}
              showCategoryPill={false}
            />
          ))
        )}
      </section>

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full shadow-lg sm:hidden"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
        aria-label="New post"
      >
        <Plus className="h-6 w-6" />
      </button>
    </Root>
  );
}
