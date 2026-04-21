import { Link } from 'react-router-dom';

const TEAM = [
  'Muaz Sadique',
  'Ahmet',
  'Omar',
  'Irshad',
  'Aayush',
];

const AVATAR_COLORS = [
  'bg-orange-100 text-orange-800',
  'bg-amber-100 text-amber-800',
  'bg-violet-100 text-violet-800',
  'bg-sky-100 text-sky-800',
  'bg-emerald-100 text-emerald-800',
];

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';

export default function About() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#fef9f1] via-[#fdf7ef] to-[#faf4eb]">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-stone-200/60 bg-gradient-to-b from-white/70 via-orange-50/30 to-transparent px-4 pt-16 pb-14 sm:px-6 sm:pt-20 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-10 h-72 w-72 rounded-full bg-gradient-to-br from-amber-300/20 via-orange-200/10 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
            About Bridge
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Connecting graduates with{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              professionals
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Bridge exists to make the right career conversation available to anyone — not just those who already know the right people.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">

        {/* ── Our Story ───────────────────────────────────────────────────────── */}
        <section aria-labelledby="story-heading" className="mb-16">
          <h2
            id="story-heading"
            className="mb-6 font-display text-2xl font-semibold text-stone-900"
          >
            Our Story
          </h2>
          <div className="space-y-5 text-base leading-relaxed text-stone-600">
            <p>
              Bridge started from a shared frustration. Getting into a field you care about is hard enough — but doing it without access to someone who has walked that road is even harder. Job boards and university careers services only go so far. The real edge comes from people: a thirty-minute conversation with the right professional can reframe everything.
            </p>
            <p>
              We built Bridge because that kind of conversation should not be limited to whoever you happen to know. Graduates from well-connected backgrounds have always had informal networks opening doors for them. We want to change that equation — making one-on-one mentorship as normal and accessible as a lecture or a library.
            </p>
            <p>
              Today, Bridge connects students and early-career professionals with mentors across technology, finance, healthcare, law, and beyond. Every booking is a step toward a career shaped by genuine guidance rather than guesswork.
            </p>
          </div>
        </section>

        {/* ── The Team ────────────────────────────────────────────────────────── */}
        <section aria-labelledby="team-heading" className="mb-16">
          <h2
            id="team-heading"
            className="mb-6 font-display text-2xl font-semibold text-stone-900"
          >
            The Team
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {TEAM.map((name, i) => (
              <div
                key={name}
                className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/95 px-4 py-6 shadow-sm"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold shadow-sm ring-2 ring-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                  aria-hidden
                >
                  {getInitials(name)}
                </div>
                <p className="font-semibold text-stone-900 leading-snug text-center">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-orange-50/60 px-7 py-10 text-center shadow-sm">
          <p className="font-display text-xl font-semibold text-stone-900">
            Ready to find your mentor?
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Browse professionals who are ready to talk.
          </p>
          <Link
            to="/mentors"
            className={`mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-6 py-3 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
          >
            Browse Mentors →
          </Link>
        </section>

      </div>
    </main>
  );
}
