import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import LoadingSpinner from '../components/LoadingSpinner';
import useInView from '../utils/useInView';
import SessionTypeCard from '../components/SessionTypeCard';
import { SESSION_TYPES } from '../constants/sessionTypes';

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
  'bg-rose-200 text-rose-900',
  'bg-indigo-200 text-indigo-900',
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-amber-300/40 via-orange-200/30 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-orange-200/35 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-800 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgb(16_185_129_0.5)]" />
            Real people · booking open
          </p>

          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.5rem]">
            Talk to someone who&apos;s already done
            <span className="text-gradient-bridge"> the thing </span>
            you&apos;re trying to do.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
            No motivational poster stuff—just folks who&apos;ve sat in the chair you want, and will tell you what actually
            moved the needle for them.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/mentors"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-xl"
            >
              Browse mentors
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border-2 border-stone-900/10 bg-white/90 px-8 py-4 text-sm font-semibold text-stone-800 shadow-sm backdrop-blur-sm transition hover:border-stone-900/20 hover:shadow-md"
            >
              I want to mentor
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-stone-200/80 pt-10">
            {[
              { k: '2.4k+', l: 'Profiles' },
              { k: '85%', l: 'Got interviews' },
              { k: '50+', l: 'Fields' },
            ].map(({ k, l }) => (
              <div key={l}>
                <dt className="font-display text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">{k}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-500">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Decorative preview stack */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-transparent blur-2xl"
          />
          <div className="relative rounded-3xl border border-white/80 bg-white/90 p-4 shadow-bridge-glow backdrop-blur-md sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-stone-100 pb-4">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="ml-2 text-xs font-medium text-stone-400">bridge.app / mentors</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`mb-3 flex items-center gap-4 rounded-2xl border border-stone-100 bg-gradient-to-r from-stone-50/80 to-white p-4 shadow-sm last:mb-0 ${i === 2 ? 'ring-2 ring-orange-400/40' : ''}`}
              >
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-100" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 max-w-[140px] rounded-full bg-stone-200" style={{ width: '60%' }} />
                  <div className="mt-2 h-2.5 max-w-[100px] rounded-full bg-stone-100" style={{ width: '40%' }} />
                </div>
                <span className="shrink-0 rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-amber-50">
                  Book time
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Say what you’re stuck on',
    desc: 'Interview loop, pivot, promo, first job—whatever. You don’t need a perfect pitch, just a real sentence.',
  },
  {
    n: '02',
    title: 'Stalk profiles until one clicks',
    desc: 'Read bios like you’d pick a teammate. When someone’s story matches yours, that’s the DM you’d actually send.',
  },
  {
    n: '03',
    title: 'Book it, do the homework',
    desc: 'Sessions are short on purpose. You leave with a next step—not a fuzzy “let’s circle back.”',
  },
];

function HowItWorks() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">How it works</p>
          <h2 className="font-display text-3xl font-semibold text-stone-900 sm:text-4xl">
            Less spiraling in your notes app, more one honest hour
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, title, desc }, i) => (
            <Reveal key={n} delay={i * 90}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-stone-200/80 bg-white/90 p-8 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/60 hover:shadow-bridge-glow">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-80" />
                <span className="font-display text-5xl font-semibold text-orange-100 transition group-hover:text-orange-200/90">
                  {n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MentorPreviewCard({ mentor }) {
  const color = avatarColor(mentor.name);
  return (
    <div className="group flex h-full flex-col gap-4 rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/50 hover:shadow-bridge-glow">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${color}`}>
          {initials(mentor.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-stone-900">{mentor.name}</p>
          <p className="truncate text-xs text-stone-500">
            {mentor.title} · {mentor.company}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-xs font-medium text-orange-900"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="flex items-center gap-1 text-xs font-medium text-stone-500">
          <span className="text-amber-500">★</span>
          {mentor.rating.toFixed(1)} · {mentor.years_experience} yrs
        </span>
        <Link
          to={`/mentors/${mentor.id}`}
          className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-amber-50 transition hover:bg-stone-800"
        >
          Open profile
        </Link>
      </div>
    </div>
  );
}

function SessionTypes() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/40 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">Session types</p>
          <h2 className="font-display text-3xl font-semibold text-stone-900 sm:text-4xl">Pick how you want to use the hour</h2>
          <p className="mt-4 text-stone-600">
            Each format has a point. We’re not here to fill time—we’re here so you walk out knowing what to do Monday.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SESSION_TYPES.map((type, i) => (
            <Reveal key={type.key} delay={i * 70}>
              <SessionTypeCard type={type} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedMentors() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError } = await getFeaturedMentors();
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setFeatured([]);
        setError(fetchError.message || 'Could not load featured mentors.');
        return;
      }
      setFeatured(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function loadFeatured() {
    setReloadKey((k) => k + 1);
  }

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">Spotlight</p>
            <h2 className="font-display text-3xl font-semibold text-stone-900 sm:text-4xl">A few people we’d nudge you toward</h2>
          </div>
          <Link
            to="/mentors"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-orange-800 transition hover:gap-3"
          >
            Full directory
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        {loading ? (
          <LoadingSpinner label="Pulling featured mentors…" className="py-12" />
        ) : error ? (
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
            <p className="font-semibold">That didn&apos;t load</p>
            <p className="mt-1 opacity-90">{error}</p>
            <button
              type="button"
              onClick={loadFeatured}
              className="mt-4 rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <MentorPreviewCard mentor={m} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      'Two calls in I stopped rewriting my resume for no one. He basically called out the story I was dodging and we fixed it in an hour.',
    name: 'Tyler N.',
    role: 'Engineer (new gig)',
    initials: 'TN',
  },
  {
    quote:
      'I went to a no-name school and thought finance was closed to me. She’d done the same jump and told me exactly where I was wasting energy.',
    name: 'Priya S.',
    role: 'Analyst',
    initials: 'PS',
  },
  {
    quote:
      'I’d been “fine” at the same job for four years. One session made quitting feel boring instead of terrifying—sounds dramatic but that’s what happened.',
    name: 'Jordan E.',
    role: 'PM',
    initials: 'JE',
  },
];

function Testimonials() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Stories</p>
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">What people say after (not before)</h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials: ini }, i) => (
            <Reveal key={name} delay={i * 90}>
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10">
                <span className="font-display text-4xl leading-none text-orange-400/90">“</span>
                <p className="-mt-2 flex-1 text-sm leading-relaxed text-stone-200">{quote}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-xs font-bold text-white">
                    {ini}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-orange-200/80">{role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 rounded-3xl border border-stone-200/80 bg-white/90 p-10 shadow-bridge-glow sm:flex-row sm:p-12">
          <div>
            <h3 className="font-display text-2xl font-semibold text-stone-900">Poke around free. Pay when it’s a habit.</h3>
            <p className="mt-2 text-stone-600">
              If you’re booking every week, the paid tier pays for itself. If not, stay on free—no guilt trip.
            </p>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 rounded-full border-2 border-stone-900 px-8 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-amber-50"
          >
            See pricing
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-600 px-8 py-20 text-center shadow-bridge-glow sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
          />
          <h2 className="relative font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Stop collecting takes from strangers on LinkedIn
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-orange-50/90">
            Make an account, find one person whose background rhymes with yours, and book. That’s the whole pitch.
          </p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto"
            >
              Sign up free
            </Link>
            <Link
              to="/mentors"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-white/40 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Just show me mentors
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <SessionTypes />
      <FeaturedMentors />
      <Testimonials />
      <PricingTeaser />
      <FinalCTA />
    </>
  );
}
