import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { useAuth } from '../../context/useAuth';
import { getPublishedPosts, fmtDate, BLOG_CATEGORIES } from '../../api/blog';

const CATEGORIES = ['All', ...BLOG_CATEGORIES];

const CATEGORY_COLORS = {
  Career:  { bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', bar: 'var(--color-primary)' },
  Craft:   { bg: 'color-mix(in srgb, #6366f1 10%, transparent)',             bar: '#6366f1' },
  Mentors: { bg: 'color-mix(in srgb, #0ea5e9 10%, transparent)',             bar: '#0ea5e9' },
  Stories: { bg: 'color-mix(in srgb, #10b981 10%, transparent)',             bar: '#10b981' },
  Product: { bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',             bar: 'var(--color-primary)' },
};

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 480);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${focusRing}`}
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 12px color-mix(in srgb, var(--bridge-text) 8%, transparent)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 12V4M4 8l4-4 4 4" stroke="var(--bridge-text)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function CardSkeleton() {
  return (
    <div
      className="flex h-64 flex-col gap-3 rounded-2xl p-8 animate-pulse"
      style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      <div className="h-3 w-16 rounded-full" style={{ backgroundColor: 'var(--bridge-border)' }} />
      <div className="h-5 w-3/4 rounded-full" style={{ backgroundColor: 'var(--bridge-border)' }} />
      <div className="h-4 w-full rounded-full" style={{ backgroundColor: 'var(--bridge-border)' }} />
      <div className="h-4 w-2/3 rounded-full" style={{ backgroundColor: 'var(--bridge-border)' }} />
      <div className="mt-auto h-3 w-1/2 rounded-full" style={{ backgroundColor: 'var(--bridge-border)' }} />
    </div>
  );
}

function ArticleView({ post, onBack }) {
  const color = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Career;
  return (
    <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`} style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <article className="mx-auto max-w-2xl">
        <Reveal>
          <button
            onClick={onBack}
            className={`mb-10 inline-flex items-center gap-2 text-[13px] font-semibold transition-opacity hover:opacity-70 ${focusRing} rounded-lg`}
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All posts
          </button>
        </Reveal>

        <Reveal delay={60}>
          <div className="mb-8 rounded-2xl p-8 sm:p-10" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
            <div className="mb-5 flex items-center gap-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                style={{ letterSpacing: '0.32em', backgroundColor: color.bg, color: color.bar }}
              >
                {post.category}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>{post.read_time} read</span>
            </div>

            <h1
              className="font-display font-black"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
            >
              {post.title}
            </h1>

            <div className="mt-5 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ backgroundColor: color.bg, color: color.bar }}
              >
                {post.author_name[0]}
              </div>
              <span className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                {post.author_name} · {fmtDate(post.published_at)}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="space-y-5">
            {post.body.split('\n\n').map((para, i) => (
              <p key={i} className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
                {para}
              </p>
            ))}
          </div>
        </Reveal>
      </article>
      <BackToTop />
    </main>
  );
}

export default function Blog() {
  const { user } = useAuth();
  const isMentor = user?.user_metadata?.role === 'mentor';

  const [category, setCategory] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublishedPosts(category).then((data) => {
      if (!cancelled) { setPosts(data); setLoading(false); }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [category]);

  const active = posts.find((p) => p.id === open);
  if (active) return <ArticleView post={active} onBack={() => setOpen(null)} />;

  return (
    <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`} style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <div className="mx-auto max-w-5xl">

        <Reveal className="mb-12 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-black uppercase" style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}>
              Blog
            </p>
            <h1
              className="mt-3 font-display font-black"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
            >
              Essays on careers,<br />craft, and mentorship.
            </h1>
          </div>
          {isMentor && (
            <Link
              to="/blog/write"
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${focusRing}`}
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              Write for Bridge
            </Link>
          )}
        </Reveal>

        <Reveal delay={60} className="mb-10">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ${focusRing}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bridge-surface)',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
                    boxShadow: isActive ? 'none' : 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Reveal>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-[15px] font-semibold" style={{ color: 'var(--bridge-text)' }}>No posts yet in this category.</p>
            <button onClick={() => setCategory('All')} className={`text-sm font-semibold underline underline-offset-2 ${focusRing} rounded-sm`} style={{ color: 'var(--color-primary)' }}>
              View all posts
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const color = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Career;
              return (
                <Reveal key={post.id} delay={i * 50}>
                  <button
                    onClick={() => setOpen(post.id)}
                    className={`group flex h-full w-full flex-col rounded-2xl p-8 text-left transition-all duration-200 hover:-translate-y-1 ${focusRing}`}
                    style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                  >
                    <div className="mb-5 flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                        style={{ letterSpacing: '0.32em', backgroundColor: color.bg, color: color.bar }}
                      >
                        {post.category}
                      </span>
                      <span className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
                        {post.read_time} read
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-semibold sm:text-2xl" style={{ color: 'var(--bridge-text)', lineHeight: 1.2 }}>
                      {post.title}
                    </h2>

                    <p className="mt-3 flex-1 text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                        {post.author_name} · {fmtDate(post.published_at)}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[12px] font-semibold transition-all duration-150 group-hover:gap-2"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Read
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
      <BackToTop />
    </main>
  );
}
