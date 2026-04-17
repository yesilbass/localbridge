import { Link } from 'react-router-dom';

export default function Pricing() {
  function handlePaidClick() {
    alert('Payment integration coming soon');
  }

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      blurb: 'Click around, read bios, send one booking a month.',
      features: ['Stalk profiles all you want', 'See ratings', 'One session request / month'],
      cta: 'Sign up free',
      href: '/register',
      primary: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      blurb: 'For when you’re actually using this—not just bookmarking it.',
      features: ['Book as much as you need', 'Get matched faster when we turn that on', 'DMs with mentors', 'Short recap after sessions'],
      cta: 'Subscribe',
      onClick: handlePaidClick,
      primary: true,
      badge: 'Most popular',
    },
    {
      name: 'Premium',
      price: '$49',
      period: '/month',
      blurb: 'Heavy user energy. Same product, more hand-holding.',
      features: ['Everything in Pro', 'Closer relationship with one mentor', 'Resume pass included', 'We answer your emails faster'],
      cta: 'Subscribe',
      onClick: handlePaidClick,
      primary: false,
    },
  ];

  const faq = [
    {
      q: 'Can I switch plans later?',
      a: 'Yeah. Start free, upgrade when it feels worth it—we’re not trapping you in a tier.',
    },
    {
      q: 'Do mentors set their own rates?',
      a: 'This page is about Bridge access. Session specifics still go through booking—details stay on profiles and confirmations.',
    },
    {
      q: 'What about refunds?',
      a: 'We’ll publish a real policy before we take money. For now paid buttons are placeholders.',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden pb-24 pt-10 sm:pt-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-amber-300/28 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-14 grid gap-10 lg:mb-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-orange-800 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Pricing
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Pay if you’re on here all the time
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
              Otherwise don’t. Free is real free—we’re not going to nag you with fake countdown timers.
            </p>
            <p className="mt-6">
              <Link
                to="/mentors"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-800 transition hover:gap-3"
              >
                Not ready to decide? Browse mentors first
                <span aria-hidden>→</span>
              </Link>
            </p>
          </div>

          <div className="relative lg:justify-self-end lg:pb-1">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-orange-400/15 via-transparent to-amber-200/20 blur-xl"
            />
            <div className="relative rounded-[1.75rem] border border-stone-200/80 bg-white/80 px-6 py-6 shadow-bridge-card backdrop-blur-md sm:px-7 sm:py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Heads up</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">
                Paid tiers are wired for later—buttons will pop a placeholder until checkout is hooked up. Free signup works
                today.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-white/90 p-8 shadow-bridge-card backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-bridge-glow ${
                tier.primary
                  ? 'border-orange-400/55 ring-2 ring-orange-400/20 md:z-[1] md:scale-[1.02]'
                  : 'border-stone-200/80 hover:border-orange-200/50'
              }`}
            >
              <div
                aria-hidden
                className={`absolute inset-x-0 top-0 h-1 ${
                  tier.primary
                    ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-stone-200 via-stone-300/80 to-stone-200 opacity-80 group-hover:from-orange-200/90 group-hover:via-amber-200/80 group-hover:to-orange-200/90'
                }`}
              />

              {tier.badge ? (
                <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
                  {tier.badge}
                </span>
              ) : null}

              <h2 className="pr-24 text-lg font-semibold text-stone-900">{tier.name}</h2>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tabular-nums tracking-tight text-stone-900 sm:text-[2.75rem]">
                  {tier.price}
                </span>
                <span className="text-sm text-stone-500">{tier.period}</span>
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-400">Billed monthly · cancel anytime</p>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">{tier.blurb}</p>

              <ul className="mt-8 flex flex-1 flex-col gap-3.5 text-sm text-stone-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        tier.primary ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80'
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              {tier.href ? (
                <Link
                  to={tier.href}
                  className={`mt-8 block w-full rounded-full py-3.5 text-center text-sm font-semibold transition ${
                    tier.primary
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:from-orange-500 hover:to-amber-400'
                      : 'border-2 border-stone-900/12 bg-white text-stone-900 hover:border-orange-300/60 hover:shadow-md'
                  }`}
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={tier.onClick}
                  className={`mt-8 w-full rounded-full py-3.5 text-sm font-semibold transition ${
                    tier.primary
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:from-orange-500 hover:to-amber-400'
                      : 'border-2 border-stone-900/12 bg-white text-stone-900 hover:border-orange-300/60 hover:shadow-md'
                  }`}
                >
                  {tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <section className="relative mt-16 overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/75 p-8 shadow-bridge-card backdrop-blur-md sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"
          />
          <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">Fine print, in plain English</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Quick answers so you’re not guessing. If something’s missing, we’ll add it when billing goes live.
          </p>
          <dl className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {faq.map(({ q, a }) => (
              <div key={q}>
                <dt className="text-sm font-semibold text-stone-900">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-stone-600">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12 text-center text-sm text-stone-500">
          Still deciding? Start free. Bump up later if it sticks.
        </p>
      </div>
    </main>
  );
}
