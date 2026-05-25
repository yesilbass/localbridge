import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { getMentorPosts } from '../../api/mentorPosts';

export default function MentorProfilePosts({ mentorProfileId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!mentorProfileId) return;
    void getMentorPosts({ mentor_id: mentorProfileId, limit: 20 }).then(({ data }) => setPosts(data ?? []));
  }, [mentorProfileId]);

  return (
    <section id="posts" className="mt-24 scroll-mt-[calc(var(--profile-primary-nav-h,5.25rem)+3.5rem)]">
      <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>Posts</h2>
      {posts.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>No posts yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              <h3 className="font-bold" style={{ color: 'var(--bridge-text)' }}>{post.title}</h3>
              <div className="mt-2 text-sm prose prose-sm max-w-none" style={{ color: 'var(--bridge-text-secondary)' }} dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
