import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMentorPosts, getUserUpvotedPostIds, toggleUpvote } from '../../api/mentorPosts';
import MentorPostCard from '../../components/MentorPostsStrip';

export default function MentorPostsPage() {
  const [posts, setPosts] = useState([]);
  const [upvoted, setUpvoted] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    void getMentorPosts({ limit: 50 }).then(async ({ data }) => {
      setPosts(data ?? []);
      setUpvoted(await getUserUpvotedPostIds((data ?? []).map((p) => p.id)));
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link to="/mentors" className="text-sm font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>← Mentors</Link>
      <h1 className="mt-4 text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>From our mentors</h1>
      <div className="mt-8 flex flex-col gap-4">
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
    </main>
  );
}
