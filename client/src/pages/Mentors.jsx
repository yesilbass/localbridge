import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import { getMyFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from '../context/useAuth';
import { getRecentlyViewedMentors } from '../utils/recentlyViewed';

const PAGE_SIZE = 12;

const INDUSTRIES = [
  { label: 'All', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data Science', value: 'data science' },
  { label: 'Education', value: 'education' },
  { label: 'Law', value: 'law' },
];

const SORT_OPTIONS = [
  { label: 'Best reviews first', value: 'rating' },
  { label: 'Most years in the game', value: 'experience' },
  { label: 'Most sessions logged', value: 'sessions' },
];

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeMentorId(id) {
  return id == null ? '' : String(id).toLowerCase();
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill =
            i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          return (
            <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20">
              <defs>
                <linearGradient id={`star-${i}-${rating}`}>
                  <stop offset={fill} stopColor="#d97706" />
                  <stop offset={fill} stopColor="#d4d4d4" />
                </linearGradient>
              </defs>
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                fill={`url(#star-${i}-${rating})`}
              />
            </svg>
          );
        })}
      </span>
      <span className="text-xs font-medium text-stone-500">{rating.toFixed(1)}</span>
    </span>
  );
}

function MentorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 animate-pulse rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-stone-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-stone-200" />
              <div className="h-3 w-1/2 rounded bg-stone-100" />
            </div>
          </div>
          <div className="h-12 rounded bg-stone-100" />
          <div className="h-8 w-2/3 rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

function HeartButton({ filled, onClick, label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="rounded-full bg-white/95 p-2 text-stone-400 shadow-sm ring-1 ring-stone-200/80 transition hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200/60 disabled:pointer-events-none disabled:opacity-40"
      aria-label={label}
    >
      {filled ? (
        <svg className="h-5 w-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}

function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy }) {
  const avatarColor = getAvatarColor(mentor.name);
  const filled = isFavorite;

  function handleHeart() {
    if (!user) {
      navigate('/login', { state: { from: '/mentors' } });
      return;
    }
    onToggleFavorite(mentor.id);
  }

  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/55 hover:shadow-bridge-glow">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-90"
      />
      <div className="absolute right-4 top-5">
        <HeartButton
          filled={filled}
          disabled={Boolean(favoriteBusy)}
          onClick={handleHeart}
          label={filled ? 'Remove from favorites' : 'Save to favorites'}
        />
      </div>

      <div className="flex items-start gap-4 pr-12">
        {mentor.image_url ? (
          <img
            src={mentor.image_url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-md"
          />
        ) : (
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-md ring-2 ring-white ${avatarColor}`}
          >
            {getInitials(mentor.name)}
          </div>
        )}
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate font-semibold text-stone-900">{mentor.name}</h3>
          <p className="truncate text-sm text-stone-500">{mentor.title}</p>
          <p className="truncate text-sm font-medium text-amber-800">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        <span className="text-xs text-stone-400">{mentor.years_experience} yrs in</span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-0.5 text-xs font-medium text-amber-900"
          >
            {tag}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
            +{mentor.expertise.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-stone-100/90 pt-4">
        <span className="text-xs text-stone-400">{mentor.total_sessions} sessions</span>
        <Link
          to={`/mentors/${mentor.id}`}
          className="rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700"
        >
          Open profile
        </Link>
      </div>
    </div>
  );
}

function FetchErrorBanner({ message, onRetry }) {
  return (
    <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm">
      <p className="font-semibold">Mentors didn&apos;t load</p>
      <p className="mt-1 text-red-800/90">That&apos;s usually us or the Wi‑Fi. Want to try once more?</p>
      <p className="mt-2 font-mono text-xs text-red-800/70">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(0);
  const [mentors, setMentors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState(null);
  const [, setRecentBump] = useState(0);

  const recent = getRecentlyViewedMentors();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- pagination must reset when filters change */
    setPage(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [debouncedSearch, activeIndustry, sortBy]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync favorites with auth session */
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    void getMyFavorites().then(({ data, error: favErr }) => {
      if (favErr) {
        const msg = favErr.message || String(favErr);
        if (msg.includes('favorites') || msg.includes('schema cache') || msg.includes('does not exist')) {
          setFavoriteMessage(
            "Hearts need a favorites table in Supabase. If you're the admin, run bridge_schema.sql — we can't fake that on the frontend.",
          );
        }
        setFavoriteIds(new Set());
        return;
      }
      setFavoriteMessage(null);
      setFavoriteIds(new Set(data ?? []));
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError, totalCount: count } = await getAllMentors({
        search: debouncedSearch,
        industry: activeIndustry,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setMentors([]);
        setTotalCount(0);
        setError(fetchError.message || 'Something went wrong.');
        return;
      }
      setMentors(data ?? []);
      setTotalCount(count ?? 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, activeIndustry, sortBy, page, reloadKey]);

  const loadMentors = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const onToggleFavorite = useCallback(async (mentorId) => {
    const key = normalizeMentorId(mentorId);
    setFavoriteBusyId(key);
    setFavoriteMessage(null);

    const { error: err } = await toggleFavorite(mentorId);

    if (err) {
      const msg = err.message || String(err);
      setFavoriteMessage(
        msg.includes('favorites') || msg.includes('does not exist') || msg.includes('schema cache')
          ? 'Could not save that — favorites table missing in Supabase (see bridge_schema.sql).'
          : msg,
      );
    }

    const { data, error: reloadErr } = await getMyFavorites();
    if (!reloadErr && data) {
      setFavoriteIds(new Set(data));
    }

    setFavoriteBusyId(null);
  }, []);

  const startIdx = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const canPrev = page > 0;
  const canNext = endIdx < totalCount;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-100/45 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <header className="mb-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-orange-800 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Mentor list
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Find someone you&apos;d actually text back
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
              Read bios like you&apos;re picking a teammate. Heart the ones you&apos;d come back to—then open a profile and
              book before you overthink it.
            </p>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-stone-200/80 pt-8">
              <div className="rounded-2xl border border-stone-200/60 bg-white/70 px-3 py-3 text-center backdrop-blur-sm sm:px-4">
                <dt className="font-display text-2xl font-semibold tabular-nums text-stone-900">
                  {loading ? '—' : totalCount}
                </dt>
                <dd className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Matching</dd>
              </div>
              <div className="rounded-2xl border border-stone-200/60 bg-white/70 px-3 py-3 text-center backdrop-blur-sm sm:px-4">
                <dt className="font-display text-2xl font-semibold text-stone-900">♥</dt>
                <dd className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Saved</dd>
              </div>
              <div className="rounded-2xl border border-stone-200/60 bg-white/70 px-3 py-3 text-center backdrop-blur-sm sm:px-4">
                <dt className="font-display text-2xl font-semibold text-stone-900">30–45</dt>
                <dd className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Min sessions</dd>
              </div>
            </dl>
          </div>

          <div className="relative lg:justify-self-end">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-orange-400/25 via-amber-200/15 to-transparent blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-8 shadow-bridge-glow">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl"
              />
              <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-orange-200/90">Small tip</p>
              <p className="relative mt-3 font-display text-xl font-medium leading-snug text-white">
                If you&apos;re new, skim three profiles all the way through before you filter harder. The good stuff is in
                the bio.
              </p>
              <p className="relative mt-4 text-sm leading-relaxed text-stone-400">
                Log in to save hearts. Guest mode still lets you read everything—we&apos;re not hiding people behind a wall.
              </p>
            </div>
          </div>
        </header>

        {recent.length > 0 ? (
          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Recently opened</h2>
                <p className="mt-1 text-sm text-stone-600">Pick up where you left off.</p>
              </div>
            </div>
            <div className="flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recent.map((m) => (
                <Link
                  key={m.id}
                  to={`/mentors/${m.id}`}
                  onClick={() => setRecentBump((b) => b + 1)}
                  className="group w-[200px] shrink-0 snap-start rounded-2xl border border-stone-200/80 bg-white/90 p-5 shadow-bridge-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-orange-200/60 hover:shadow-bridge-glow"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-200 to-amber-100 text-sm font-bold text-orange-900 shadow-inner">
                    {getInitials(m.name)}
                  </div>
                  <p className="truncate font-semibold text-stone-900">{m.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{m.title}</p>
                  <p className="mt-3 text-xs font-semibold text-orange-800 opacity-0 transition group-hover:opacity-100">
                    Open →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {favoriteMessage ? (
          <div
            className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 backdrop-blur-sm"
            role="status"
          >
            {favoriteMessage}
          </div>
        ) : null}

        {error ? <FetchErrorBanner message={error} onRetry={loadMentors} /> : null}

        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/80 p-6 shadow-bridge-glow backdrop-blur-md sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"
          />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">Search &amp; narrow down</h2>
              <p className="mt-1 text-sm text-stone-500">
                Mess with keywords first. If it&apos;s still noisy, chip away with an industry.
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Name, company, title, whatever you remember…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-11 pr-10 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>
            <div className="shrink-0 lg:w-64">
              <label htmlFor="sort-mentors" className="sr-only">
                Sort mentors
              </label>
              <select
                id="sort-mentors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Industry</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(({ label, value }) => (
                <button
                  key={value || 'all'}
                  type="button"
                  onClick={() => setActiveIndustry(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeIndustry === value
                      ? 'border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-md'
                      : 'border-stone-200/80 bg-white/95 text-stone-600 hover:border-orange-200/70 hover:shadow-sm'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {!loading && !error ? (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600">
              Showing{' '}
              <span className="font-semibold text-stone-900">
                {totalCount === 0 ? 0 : `${startIdx}–${endIdx}`}
              </span>{' '}
              of <span className="font-semibold text-stone-900">{totalCount}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-full border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-35"
              >
                Back
              </button>
              <span className="rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-600">
                Page {page + 1}
              </span>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-stone-200 bg-white px-5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-35"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <MentorGridSkeleton />
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                isFavorite={favoriteIds.has(normalizeMentorId(mentor.id))}
                onToggleFavorite={onToggleFavorite}
                user={user}
                navigate={navigate}
                favoriteBusy={favoriteBusyId === normalizeMentorId(mentor.id)}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-stone-300/80 bg-white/65 py-24 text-center shadow-inner backdrop-blur-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-50/40 to-transparent"
            />
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-200 to-amber-100 text-3xl shadow-md">
              🔍
            </div>
            <p className="relative font-display text-xl font-semibold text-stone-900">Nobody fits that combo</p>
            <p className="relative mt-2 max-w-sm text-sm text-stone-600">
              Loosen a filter or kill a keyword—sometimes the good profiles use weird titles.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActiveIndustry('');
                setPage(0);
              }}
              className="relative mt-8 rounded-full border-2 border-stone-900/15 bg-white px-6 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-orange-300/80 hover:shadow-md"
            >
              Reset everything
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
