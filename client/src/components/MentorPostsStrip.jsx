import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { getMentorPosts, toggleUpvote, getUserUpvotedPostIds } from '../api/mentorPosts';
import { getCategoryLabel } from '../constants/mentorshipCategories';
import MentorAvatar from './MentorAvatar';

function truncate(str, len) {
  if (!str || str.length <= len) return str;
  return `${str.slice(0, len).trimEnd()}…`;
}

export default function MentorPostCard({ post, upvoted, onUpvote, expanded, onToggleExpand }) {
  const mentor = post.mentor_profiles;
  const categoryLabel = post.category_id ? getCategoryLabel(post.category_id) : null;

  return (
    <article
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      <div className="flex items-start gap-3">
        <MentorAvatar name={mentor?.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--bridge-text)' }}>{mentor?.name}</p>
          <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
            {[mentor?.title, mentor?.company].filter(Boolean).join(' · ')}
          </p>
        </div>
        {categoryLabel && (
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}>
            {categoryLabel}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-base font-bold" style={{ color: 'var(--bridge-text)' }}>{truncate(post.title, 80)}</h3>
      {expanded ? (
        <div
          className="prose prose-sm mt-2 max-w-none text-[14px]"
          style={{ color: 'var(--bridge-text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }}
        />
      ) : (
        <p className="mt-2 text-[14px] line-clamp-3" style={{ color: 'var(--bridge-text-secondary)' }}>{post.body}</p>
      )}
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onUpvote}
          className="inline-flex items-center gap-1 text-sm font-semibold"
          style={{ color: upvoted ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }}
        >
          ♥ {post.upvotes ?? 0}
        </button>
        <button type="button" onClick={onToggleExpand} className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      </div>
    </article>
  );
}

export function MentorPostsStrip() {
  const [posts, setPosts] = useState([]);
  const [upvoted, setUpvoted] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    void getMentorPosts({ limit: 6 }).then(async ({ data }) => {
      setPosts(data ?? []);
      const ids = (data ?? []).map((p) => p.id);
      setUpvoted(await getUserUpvotedPostIds(ids));
    });
  }, []);

  if (!posts.length) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--bridge-text-muted)' }}>
          From our mentors
        </h2>
        <Link to="/community/posts" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          View all →
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <MentorPostCard
            key={post.id}
            post={post}
            upvoted={upvoted.has(post.id)}
            expanded={expandedId === post.id}
            onToggleExpand={() => setExpandedId((id) => (id === post.id ? null : post.id))}
            onUpvote={async () => {
              const { upvoted: nowUp, upvotes } = await toggleUpvote(post.id);
              setUpvoted((prev) => {
                const next = new Set(prev);
                if (nowUp) next.add(post.id);
                else next.delete(post.id);
                return next;
              });
              setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, upvotes } : p)));
            }}
          />
        ))}
      </div>
    </section>
  );
}
