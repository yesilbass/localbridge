import { useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { useContent } from '../../content';
import { ARTICLES, CATEGORIES, POPULAR_KEYS, RELATED_KEYS, normalize } from './helpContent';
import { renderArticleBody } from './helpRender';

const EYEBROW = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'var(--color-primary)',
};

const HAIRLINE = { borderBottom: '1px solid var(--bridge-border)' };

function ArticleList({ keys, onSelect }) {
  return (
    <ul className="mt-4 border-t border-[var(--bridge-border)] pb-5">
      {keys.map((key, i) => {
        const article = ARTICLES[key];
        const last = i === keys.length - 1;
        return (
          <li key={key} style={!last ? HAIRLINE : undefined}>
            <button
              type="button"
              onClick={() => onSelect(key)}
              className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:underline"
            >
              <span className="text-base font-semibold text-[var(--bridge-text)]">{article.title}</span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HelpArticle({ articleKey, onBack, onSelect }) {
  const { s } = useContent();
  const article = ARTICLES[articleKey];
  const related = RELATED_KEYS[articleKey] || [];
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [articleKey]);

  return (
    <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
      <article className="mx-auto max-w-[860px]">
        <nav className="mb-8 flex items-center gap-2 text-[13px]" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 font-medium text-[var(--bridge-text-muted)] transition hover:text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Help center
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)]" aria-hidden />
          <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{article.category}</span>
        </nav>

        <p className="mb-4" style={EYEBROW}>
          {article.category}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)] focus:outline-none"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', lineHeight: 1.08 }}
        >
          {article.title}
        </h1>

        <div className="mt-8 space-y-5 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-[17px]">
          {renderArticleBody(article.body, onSelect)}
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t border-[var(--bridge-border)] pt-10">
            <p className="mb-4 text-base font-semibold text-[var(--bridge-text)]">Related articles</p>
            <ul>
              {related.map((key, i) => {
                const rel = ARTICLES[key];
                const last = i === related.length - 1;
                return (
                  <li key={key} style={!last ? HAIRLINE : undefined}>
                    <button
                      type="button"
                      onClick={() => onSelect(key)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
                    >
                      {rel.title}
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)]" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="mt-12 border-t border-[var(--bridge-border)] pt-10 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-lg">
          Policy questions?{' '}
          <Link
            to="/faq"
            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            Read the FAQ
          </Link>
          . Safety concern?{' '}
          <Link
            to="/trust"
            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            Trust & Safety
          </Link>
          . Still need help?{' '}
          <a
            href="/contact"
            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            {s.common.contactSupport}
          </a>
          .
        </p>
      </article>
    </main>
  );
}

function HelpIndex({ search, onSearchChange, onSelect }) {
  // Object.entries(ARTICLES) re-runs per keystroke. Trivial at 24 articles;
  // promote to a precomputed search index if the catalogue grows materially.
  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = normalize(search);
    return Object.entries(ARTICLES).filter(
      ([, a]) => normalize(a.title).includes(q) || normalize(a.body).includes(q),
    );
  }, [search]);

  const showBrowse = !search.trim();

  return (
    <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-12 border-b border-[var(--bridge-border)] pb-12">
          <span className="mb-3 block" style={EYEBROW}>
            Guides
          </span>
          <h1
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', lineHeight: 1.08 }}
          >
            Help center
          </h1>
          <p className="mt-3 max-w-xl text-base leading-[1.7] text-[var(--bridge-text-muted)]">
            Step-by-step guides for using Bridge. Policy questions and platform overviews →{' '}
            <Link to="/faq" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
              FAQ
            </Link>
            .
          </p>

          <div className="relative mt-8">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--bridge-text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search — video call, no-show, Calendly, refund, AI matching…"
              aria-label="Search help articles"
              className="w-full rounded-lg border border-[var(--bridge-border)] bg-transparent py-4 pl-12 pr-4 text-lg text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </Reveal>

        {!showBrowse ? (
          <div>
            {results.length === 0 ? (
              <p
                role="status"
                aria-live="polite"
                className="py-10 text-base text-[var(--bridge-text-secondary)]"
              >
                Nothing matched &ldquo;{search}&rdquo;. Try the{' '}
                <Link to="/faq" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  FAQ
                </Link>{' '}
                or{' '}
                <Link to="/contact" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  contact us
                </Link>
                .
              </p>
            ) : (
              <>
                <p
                  role="status"
                  aria-live="polite"
                  className="mb-6 text-base text-[var(--bridge-text-muted)]"
                >
                  {results.length} result{results.length !== 1 && 's'}
                </p>
                <ul className="border-t border-[var(--bridge-border)]">
                  {results.map(([key, a], i) => {
                    const last = i === results.length - 1;
                    return (
                      <li key={key} style={!last ? HAIRLINE : undefined}>
                        <button
                          type="button"
                          onClick={() => onSelect(key)}
                          className="group flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:underline"
                        >
                          <div className="min-w-0">
                            <p style={EYEBROW}>{a.category}</p>
                            <p className="mt-1 text-base font-semibold text-[var(--bridge-text)]">{a.title}</p>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        ) : (
          <>
            <Reveal className="mb-10">
              <p
                className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: 'var(--color-primary)' }}
              >
                Popular articles
              </p>
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                {POPULAR_KEYS.map((key, i) => {
                  const article = ARTICLES[key];
                  const last = i === POPULAR_KEYS.length - 1;
                  return (
                    <div key={key} style={!last ? HAIRLINE : undefined}>
                      <button
                        type="button"
                        onClick={() => onSelect(key)}
                        className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:underline"
                      >
                        <div className="min-w-0">
                          <p
                            className="text-[11px] font-bold uppercase tracking-[0.14em]"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {article.category}
                          </p>
                          <p className="mt-0.5 text-[15px] font-semibold text-[var(--bridge-text)]">
                            {article.title}
                          </p>
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2">
              {CATEGORIES.map((cat, ci) => {
                const Icon = cat.Icon;
                const isLastOdd = ci === CATEGORIES.length - 1 && CATEGORIES.length % 2 === 1;
                return (
                  <Reveal
                    key={cat.id}
                    delay={ci * 40}
                    className={isLastOdd ? 'sm:col-span-2 sm:mx-auto sm:w-[calc(50%-12px)]' : undefined}
                  >
                    <div
                      className="overflow-hidden rounded-2xl"
                      style={{
                        backgroundColor: 'var(--bridge-surface)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                      }}
                    >
                      <div className="px-5 pt-5 pb-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                              }}
                            >
                              <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                            </span>
                            <h2 className="font-display text-lg font-bold text-[var(--bridge-text)]">
                              {cat.name}
                            </h2>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                              color: 'var(--bridge-text-muted)'
                            }}
                          >
                            {cat.keys.length}
                          </span>
                        </div>
                        <p className="text-[13px] text-[var(--bridge-text-muted)]">{cat.sub}</p>
                      </div>
                      <ArticleList keys={cat.keys} onSelect={onSelect} />
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={160}>
              <div
                className="mt-14 rounded-2xl p-8 sm:p-10"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  Still need help?
                </h2>
                <p className="mt-3 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                  Can't find what you're looking for? A real person reads every message — we'll get
                  back to you within 24–48 hours.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    Contact us
                  </Link>
                  <Link
                    to="/trust"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      boxShadow:
                        'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                    }}
                  >
                    Trust & Safety
                  </Link>
                </div>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </main>
  );
}

export default function Help() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const active = articleId && ARTICLES[articleId] ? articleId : null;

  useEffect(() => {
    if (articleId && !ARTICLES[articleId]) {
      navigate('/help', { replace: true });
    }
  }, [articleId, navigate]);

  const handleSelect = useCallback(
    (key) => {
      setSearchParams({}, { replace: false });
      navigate(`/help/${key}`);
    },
    [navigate, setSearchParams],
  );

  const handleBack = useCallback(() => {
    navigate('/help');
  }, [navigate]);

  const handleSearchChange = useCallback(
    (value) => {
      if (value) setSearchParams({ q: value }, { replace: true });
      else setSearchParams({}, { replace: true });
    },
    [setSearchParams],
  );

  if (active) {
    return <HelpArticle articleKey={active} onBack={handleBack} onSelect={handleSelect} />;
  }
  return <HelpIndex search={search} onSearchChange={handleSearchChange} onSelect={handleSelect} />;
}
