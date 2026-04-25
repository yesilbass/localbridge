import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/useAuth';
import { focusRing } from '../ui';
import MentorAvatar from '../components/MentorAvatar';

const focusRingWhite =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600';

// Persona-driven mentor matches for the hero. Each persona maps to 2 representative
// mentor "preview pills" — this is the identification layer, not a directory.
const PERSONAS = [
  {
    id: 'new_job',
    label: 'Looking for a new job',
    emoji: '🎯',
    blurb: 'Talk to hiring managers and recent switchers.',
    matches: [
      { name: 'Jordan Reeves', role: 'Ex-FAANG Recruiter', tag: 'Interview prep' },
      { name: 'Sasha Kim', role: 'Eng. Manager @ Stripe', tag: 'Tech hiring' },
    ],
  },
  {
    id: 'switch',
    label: 'Switching industries',
    emoji: '🔀',
    blurb: 'Learn from people who already made the pivot.',
    matches: [
      { name: 'Elena Voss', role: 'RN → UX Designer', tag: 'Career switch' },
      { name: 'Marcus Webb', role: 'Banker → Founder', tag: 'Finance to startup' },
    ],
  },
  {
    id: 'interview',
    label: 'Preparing for interviews',
    emoji: '💬',
    blurb: 'Mock interviews with people who run the real ones.',
    matches: [
      { name: 'David Park', role: 'Staff Eng @ Stripe', tag: 'System design' },
      { name: 'Priya Sharma', role: 'PM @ Figma', tag: 'Product sense' },
    ],
  },
  {
    id: 'founding',
    label: 'Starting something',
    emoji: '🚀',
    blurb: 'Founders who\u2019ve shipped, hired, and raised.',
    matches: [
      { name: 'Leah Torres', role: 'Founder @ Seed-stage', tag: 'Early-stage' },
      { name: 'Ahmed Rahim', role: 'Ex-YC, 2 exits', tag: 'Fundraising' },
    ],
  },
];

const TRUST_MARQUEE_ITEMS = [
  { label: 'Product', dot: '#f59e0b' },
  { label: 'Engineering', dot: '#38bdf8' },
  { label: 'Design', dot: '#f472b6' },
  { label: 'Finance', dot: '#34d399' },
  { label: 'Healthcare', dot: '#f87171' },
  { label: 'Startups', dot: '#fb923c' },
  { label: 'Career switchers', dot: '#a78bfa' },
  { label: 'Interview prep', dot: '#facc15' },
  { label: 'Founders', dot: '#fb7185' },
  { label: 'Bootcamps', dot: '#60a5fa' },
];

/**
 * HeroProductPreview — a self-playing, fully designed product showcase.
 * No external video. Cycles through 3 in-product scenes automatically,
 * just like a perfectly directed GIF loop, but rendered in React.
 */
function HeroProductPreview() {
  const SCENES = [
    { id: 'search', label: 'Discover' },
    { id: 'profile', label: 'Profile' },
    { id: 'booked', label: 'Booked' },
  ];
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setScene((s) => (s + 1) % SCENES.length);
    }, 3400);
    return () => clearInterval(id);
  }, [SCENES.length]);

  const mentors = [
    { name: 'Maya Chen', role: 'Director of Product · Linear', rate: '$95', match: 98, tone: 'amber' },
    { name: 'Jordan Reeves', role: 'Ex-FAANG Recruiter', rate: '$60', match: 94, tone: 'orange' },
    { name: 'Elena Voss', role: 'RN → UX Designer', rate: '$45', match: 89, tone: 'rose' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-3xl">
      {/* Ambient aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-orange-400/30 via-amber-300/15 to-transparent opacity-80 blur-3xl dark:from-orange-500/35 dark:via-amber-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/25"
      />

      {/* Floating chat bubble — top left */}
      <div
        aria-hidden
        className="animate-landing-float absolute -left-3 -top-4 z-20 hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-3 py-2 shadow-[0_14px_36px_-12px_rgba(28,25,23,0.25)] backdrop-blur-md sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-[10px] font-bold text-white">M</span>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Match · 98%</p>
            <p className="text-[11px] font-semibold text-[var(--bridge-text)]">Maya is a fit</p>
          </div>
        </div>
      </div>

      {/* Floating pricing chip — bottom right */}
      <div
        aria-hidden
        className="animate-landing-float-delayed absolute -bottom-3 -right-2 z-20 hidden rounded-2xl border border-orange-300/60 bg-gradient-to-br from-orange-500 to-amber-500 px-3.5 py-2 text-stone-950 shadow-[0_14px_36px_-12px_rgba(234,88,12,0.6)] sm:block"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-950/80">First session</p>
        <p className="font-display text-lg font-bold leading-none">45 min · $60</p>
      </div>

      {/* Main frame */}
      <div className="relative">
        <div className="bridge-shine-overlay relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-[0_28px_90px_-28px_rgba(28,25,23,0.35)] ring-1 ring-stone-900/5 dark:shadow-[0_32px_100px_-32px_rgba(234,88,12,0.45)] dark:ring-orange-400/20">
          {/* Window chrome */}
          <div className="flex items-center justify-between border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/80 px-4 py-2.5 backdrop-blur-sm dark:bg-white/[0.03]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-md border border-[var(--bridge-border)] bg-[var(--bridge-canvas)] px-2.5 py-1 text-[10px] font-medium text-[var(--bridge-text-muted)]">
              <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4Z" /></svg>
              <span className="truncate">bridge.app / mentors</span>
            </div>
            <div className="flex items-center gap-1">
              {SCENES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === scene ? 'w-5 bg-orange-500' : 'w-1.5 bg-[var(--bridge-text-faint)]/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Scene stage */}
          <div className="relative aspect-[16/7] w-full bg-gradient-to-br from-[var(--bridge-canvas)] via-[var(--bridge-surface)] to-[var(--bridge-canvas)] p-4 sm:p-5">
            {/* subtle grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, var(--landing-hero-dot) 1px, transparent 0)',
                backgroundSize: '22px 22px',
                maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 45%, transparent 85%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 45%, transparent 85%)',
              }}
            />

            {/* Scene: Search */}
            <div
              className={`absolute inset-0 p-4 transition-all duration-700 sm:p-5 ${scene === 0 ? 'opacity-100 translate-y-0' : 'pointer-events-none -translate-y-3 opacity-0'}`}
            >
              <div className="flex items-center gap-2 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-3 py-2 shadow-sm">
                <svg className="h-3.5 w-3.5 text-[var(--bridge-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
                <span className="text-[11px] font-medium text-[var(--bridge-text)]">Product manager, Series B</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-orange-700 dark:text-orange-300">⌘ K</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {['Product', 'Strategy', 'Promo prep', 'Stripe'].map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                      i === 0
                        ? 'border-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950'
                        : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)]'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-1.5">
                {mentors.map((m, idx) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-2.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-2.5 py-2 shadow-sm"
                    style={{ animation: `bridge-scene-row 620ms cubic-bezier(.2,.9,.32,1) ${idx * 140}ms both` }}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white ${
                        m.tone === 'amber' ? 'from-amber-400 to-orange-500' : m.tone === 'orange' ? 'from-orange-400 to-rose-500' : 'from-rose-400 to-pink-500'
                      }`}
                    >
                      {m.name.split(' ').map((p) => p[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-[var(--bridge-text)]">{m.name}</p>
                      <p className="truncate text-[9px] text-[var(--bridge-text-muted)]">{m.role}</p>
                    </div>
                    <div className="hidden items-center gap-1 sm:flex">
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">{m.match}%</span>
                    </div>
                    <span className="rounded-md bg-stone-900 px-1.5 py-0.5 text-[9px] font-bold text-amber-50 dark:bg-amber-400 dark:text-stone-950">
                      {m.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scene: Profile */}
            <div
              className={`absolute inset-0 p-4 transition-all duration-700 sm:p-5 ${scene === 1 ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-3 opacity-0'}`}
            >
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] p-3 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-stone-950 shadow-md">MC</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[var(--bridge-text)]">Maya Chen</p>
                  <p className="truncate text-[10px] text-[var(--bridge-text-muted)]">Director of Product · Linear</p>
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    {[0,1,2,3,4].map((i) => <span key={i} className="text-[8px]">★</span>)}
                    <span className="ml-1 text-[9px] font-semibold text-[var(--bridge-text-secondary)]">4.9 · 86 sessions</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">Available</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { k: 'Rate', v: '4.9' },
                  { k: 'Exp', v: '11 yrs' },
                  { k: 'Sessions', v: '86' },
                ].map((s, i) => (
                  <div
                    key={s.k}
                    className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-2 text-center"
                    style={{ animation: `bridge-scene-row 520ms cubic-bezier(.2,.9,.32,1) ${100 + i * 100}ms both` }}
                  >
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">{s.k}</p>
                    <p className="mt-0.5 font-display text-sm font-bold text-[var(--bridge-text)]">{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 grid grid-cols-7 gap-1">
                {[0,1,2,3,4,5,6].map((d) => {
                  const state = [0,1,4].includes(d) ? 'emerald' : d === 2 ? 'amber' : d === 5 ? 'amber' : 'stone';
                  const isPicked = d === 2;
                  return (
                    <div
                      key={d}
                      className={`flex aspect-square items-center justify-center rounded-md text-[9px] font-bold transition ${
                        state === 'emerald'
                          ? 'bg-emerald-400/25 text-emerald-700 dark:text-emerald-300'
                          : state === 'amber'
                            ? 'bg-amber-400/30 text-amber-700 dark:text-amber-200'
                            : 'bg-stone-400/15 text-[var(--bridge-text-muted)]'
                      } ${isPicked ? 'ring-2 ring-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]' : ''}`}
                    >
                      {d + 15}
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-2.5 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 py-2 text-[11px] font-bold text-stone-950 shadow-md">
                <span className="relative z-10">Book Tue, 2:00 PM · $60</span>
                <span aria-hidden className="pointer-events-none absolute inset-0 animate-gradient-shift bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.55)_50%,transparent_65%)]" />
              </div>
            </div>

            {/* Scene: Booked */}
            <div
              className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-700 sm:p-5 ${scene === 2 ? 'opacity-100 scale-100' : 'pointer-events-none scale-95 opacity-0'}`}
            >
              <div className="relative w-full rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 text-center shadow-[0_16px_40px_-16px_rgba(16,185,129,0.5)] dark:border-emerald-400/30 dark:from-emerald-950/60 dark:via-stone-900 dark:to-emerald-950/40">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white shadow-lg shadow-emerald-500/35">
                  ✓
                </div>
                <p className="mt-2.5 font-display text-sm font-bold text-[var(--bridge-text)]">Session confirmed</p>
                <p className="text-[10px] text-[var(--bridge-text-muted)]">Tue · 2:00 PM · 45 min over video</p>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)]/90 px-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-stone-950">MC</span>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-[var(--bridge-text)]">Maya Chen</p>
                    <p className="text-[9px] text-[var(--bridge-text-muted)]">Director of Product · Linear</p>
                  </div>
                  <span className="ml-2 rounded-md bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Join</span>
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-3 -top-3 h-8 w-8 rounded-full bg-amber-300/60 blur-xl"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -bottom-3 h-8 w-8 rounded-full bg-emerald-300/60 blur-xl"
                />
              </div>
            </div>

            {/* Live cursor accent */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-6 right-8 hidden items-center gap-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(249,115,22,0.7)] sm:inline-flex"
              style={{ animation: 'bridge-cursor-drift 4.8s ease-in-out infinite' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-soft" />
              You
            </span>
          </div>

          {/* Footer strip */}
          <div className="flex items-center justify-between gap-3 border-t border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/85 px-4 py-2.5 backdrop-blur-sm dark:bg-black/30">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--bridge-text-muted)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-pulse-soft" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Live preview · {SCENES[scene].label}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--bridge-text-muted)]">
              <span className="hidden sm:inline">Sessions this week</span>
              <span className="rounded-md bg-stone-900 px-1.5 py-0.5 font-bold text-amber-50 dark:bg-amber-400 dark:text-stone-950">+842</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustedByMarquee() {
  const items = TRUST_MARQUEE_ITEMS;
  const strip = (
    <div className="flex items-center gap-x-7 gap-y-2 pr-7">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold tracking-tight text-[var(--bridge-text-secondary)]"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.dot }} />
          {item.label}
        </span>
      ))}
    </div>
  );
  return (
    <div className="landing-marquee-hover-pause mt-14 sm:mt-16">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--bridge-text-muted)]">
        Built for people shipping the next step
      </p>
      <div
        className="relative overflow-hidden border-y border-[var(--bridge-border)]/70 bg-[var(--bridge-surface)]/40 py-3.5 dark:bg-white/[0.03]"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex w-max animate-landing-marquee">
          {strip}
          {strip}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { user } = useAuth();

  return (
      <section
          aria-labelledby="landing-heading"
          className="landing-hero relative isolate overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-28"
      >
        {/* Background atmosphere */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[var(--bridge-surface-muted)] via-[var(--bridge-canvas)] to-[var(--bridge-canvas)]" />
        <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-18%] -z-10 h-[80rem] w-[80rem] -translate-x-1/2 opacity-45 dark:opacity-55"
            style={{
              background: 'conic-gradient(from 210deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.16), rgba(251,146,60,0.14))',
              filter: 'blur(90px)',
            }}
        />
        <div
            aria-hidden
            className="absolute inset-0 opacity-[0.75] dark:opacity-[0.85]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, var(--landing-hero-dot) 1px, transparent 0)',
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, #000 40%, transparent 88%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, #000 40%, transparent 88%)',
            }}
        />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-[-5%] h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/12 to-transparent blur-[100px] dark:from-orange-600/25" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-[25%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-tl from-rose-300/16 via-orange-200/10 to-transparent blur-[90px] dark:from-orange-500/18" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.06] mix-blend-overlay dark:opacity-[0.12]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Live badge */}
          <div className="mb-8 flex justify-center">
            <div className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 shadow-sm backdrop-blur-md transition hover:border-emerald-400/50 hover:shadow-[0_8px_24px_-8px_rgba(16,185,129,0.35)] dark:bg-[var(--bridge-surface-raised)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-pulse-soft" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bridge-text-secondary)]">
                Live · 2,400 vetted mentors
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
              id="landing-heading"
              className="animate-scale-in font-editorial text-balance text-[3rem] font-normal leading-[0.97] tracking-[-0.028em] text-[var(--bridge-text)] sm:text-[4.25rem] sm:leading-[0.95] lg:text-[5.5rem] lg:leading-[0.93]"
          >
            The person you need to talk to{' '}
            <span className="relative inline-block">
              <span className="relative z-10 font-editorial italic text-gradient-bridge">has already</span>
              <span
                  aria-hidden
                  className="absolute bottom-1 left-0 right-0 -z-0 h-[0.32em] -rotate-1 bg-[var(--landing-hero-highlight)]"
              />
            </span>{' '}
            done the job.
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-[1.65] text-[var(--bridge-text-secondary)] sm:mt-9 sm:text-xl sm:leading-[1.6]">
            Bridge is a directory of vetted professionals you book by the hour.
            One session with someone who&apos;s lived your exact next step — not a recruiter, not a coach.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
                to="/mentors"
                data-magnet="10"
                className={`magnetic group btn-sheen relative inline-flex w-full min-h-[3.4rem] items-center justify-center gap-2.5 rounded-full bg-stone-900 px-9 py-4 text-[0.95rem] font-semibold tracking-[-0.01em] text-white shadow-[0_14px_44px_-8px_rgba(28,25,23,0.5)] hover:bg-stone-800 hover:shadow-[0_24px_60px_-12px_rgba(28,25,23,0.6)] dark:bg-gradient-to-r dark:from-orange-500 dark:via-amber-500 dark:to-orange-600 dark:text-stone-950 dark:shadow-[0_16px_52px_-8px_rgba(234,88,12,0.65)] dark:hover:brightness-105 sm:w-auto ${focusRing}`}
            >
              Browse 2,400+ mentors
              <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
            {!user ? (
                <Link
                    to="/register?intent=mentor"
                    className={`group inline-flex w-full min-h-[3.25rem] items-center justify-center gap-2 rounded-full border-2 border-stone-300 bg-[var(--bridge-surface)] px-9 py-3.5 text-sm font-semibold text-[var(--bridge-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400/90 hover:bg-[var(--bridge-surface-raised)] hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:text-stone-100 dark:hover:border-orange-400/60 sm:w-auto ${focusRing}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-400/15 dark:text-orange-300">+</span>
                  Become a mentor
                </Link>
            ) : null}
          </div>

          {/* Trust row */}
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--bridge-text-muted)] sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2" aria-hidden>
                {['SK', 'MR', 'LV', 'JE', 'TN'].map((ini, idx) => (
                    <div
                        key={ini}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bridge-canvas)] text-[9px] font-bold shadow-sm ${
                            idx === 0 ? 'bg-amber-200 text-amber-900'
                            : idx === 1 ? 'bg-stone-800 text-amber-50'
                            : idx === 2 ? 'bg-orange-200 text-orange-900'
                            : idx === 3 ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                    >{ini}</div>
                ))}
              </div>
              <span><span className="font-semibold text-[var(--bridge-text)]">4,800+</span> sessions booked</span>
            </div>
            <span className="hidden h-3 w-px bg-[var(--bridge-border-strong)] sm:block" aria-hidden />
            <div className="flex items-center gap-1.5">
              <span className="flex text-amber-500 dark:text-amber-400" aria-hidden>{[0,1,2,3,4].map(i => <span key={i} className="text-xs">★</span>)}</span>
              <span><span className="font-semibold text-[var(--bridge-text)]">4.9</span> avg rating</span>
            </div>
            <span className="hidden h-3 w-px bg-[var(--bridge-border-strong)] sm:block" aria-hidden />
            <span><span className="font-semibold text-[var(--bridge-text)]">From $25</span> / session</span>
          </div>
        </div>

        <TrustedByMarquee />
      </section>
  );
}
/**
 * MetricsRibbon — high-impact numbers between Hero and FeaturedMentor.
 * Live-looking counters, tight spacing, ultra-clean typography.
 */
function MetricsRibbon() {
  const metrics = [
    { value: '2,400+', label: 'Vetted mentors', accent: 'from-orange-500 to-amber-500' },
    { value: '4,800+', label: 'Sessions booked', accent: 'from-amber-500 to-orange-400' },
    { value: '4.9 / 5', label: 'Avg rating', accent: 'from-rose-400 to-orange-500' },
    { value: '< 24h', label: 'First booking', accent: 'from-emerald-400 to-teal-500' },
  ];
  return (
    <section className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-bridge">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/80 p-4 shadow-sm backdrop-blur-md sm:p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-2">
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className="group relative flex flex-col items-start gap-0.5 px-2 py-1 text-left sm:px-4"
                >
                  {i > 0 ? (
                    <span aria-hidden className="absolute -left-px top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[var(--bridge-border)] sm:block" />
                  ) : null}
                  <p className={`font-display text-2xl font-bold tracking-tight text-transparent sm:text-[1.75rem] bg-clip-text bg-gradient-to-r ${m.accent}`}>
                    {m.value}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--bridge-text-muted)]">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * FeaturedMentor — ONE mentor, full attention.
 * Replaces the 3-card "meet a few" grid. Shows what using Bridge actually looks like.
 */
function FeaturedMentor({ mentor, loading }) {
  const hasMentor = !loading && mentor;
  const display = hasMentor
      ? mentor
      : {
        id: 'fallback',
        name: 'Maya Chen',
        title: 'Director of Product',
        company: 'Linear',
        bio: 'Led product at two Series B startups. I help PMs navigate ambiguity, run better discovery, and get promoted without playing politics. Former consultant — I\u2019m blunt about what\u2019s actually working.',
        expertise: ['Product strategy', 'Promotion prep', 'Roadmapping', 'Stakeholder mgmt'],
        rating: 4.9,
        years_experience: 11,
        total_sessions: 86,
      };
  return (
      <section className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-bridge">
          <Reveal className="mb-8 max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700 dark:text-orange-300/95">
              <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
              This week&apos;s spotlight
            </p>
            <h2 className="font-display text-balance text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              One mentor, up close
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
              Every profile on Bridge looks like this — real bio, real numbers, real booking.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-glow transition hover:shadow-[0_32px_90px_-24px_rgba(234,88,12,0.32)]">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

              <div className="grid gap-0 lg:grid-cols-12">
                {/* LEFT: avatar + identity + quote */}
                <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-8 text-amber-50 lg:col-span-5 lg:p-10">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
                  <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,237,213,1) 1px, transparent 0)',
                      backgroundSize: '22px 22px',
                      maskImage: 'radial-gradient(ellipse 80% 60% at 30% 40%, #000 40%, transparent 85%)',
                      WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 30% 40%, #000 40%, transparent 85%)',
                    }}
                  />

                  <div className="relative flex items-start gap-5">
                    <div className="relative">
                      <MentorAvatar name={display.name} size="lg" className="shadow-lg ring-4 ring-white/10" />
                      <span
                        aria-hidden
                        className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-stone-900 bg-emerald-400"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-900 animate-pulse-soft" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-semibold tracking-tight text-white">{display.name}</p>
                      <p className="mt-1 text-sm text-stone-300">
                        {display.title}
                        {display.company ? <span className="text-stone-400"> · {display.company}</span> : null}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                      <span className="flex text-amber-400" aria-hidden>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <span key={i}>★</span>
                        ))}
                      </span>
                        <span className="text-xs font-semibold text-amber-100">
                        {Number(display.rating).toFixed(1)} · {display.total_sessions} sessions
                      </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-8 rounded-2xl border border-orange-400/20 bg-white/[0.04] p-5 backdrop-blur-sm">
                    <span aria-hidden className="mb-2 block font-display text-3xl leading-none text-orange-400/60">&ldquo;</span>
                    <p className="text-base leading-relaxed text-stone-200 sm:text-lg">
                      I don&apos;t do fluff. You tell me what you&apos;re actually trying to figure out, and we work it
                      in one session. If I can&apos;t help, I&apos;ll say so in the first ten minutes.
                    </p>
                  </div>
                </div>

                {/* RIGHT: bio, tags, stats, CTA */}
                <div className="p-8 lg:col-span-7 lg:p-10">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300/95">
                    <span className="h-[3px] w-5 rounded-full bg-orange-500/80" />
                    About
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-[var(--bridge-text-secondary)]">{display.bio}</p>

                  <div className="mt-6">
                    <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300/95">
                      <span className="h-[3px] w-5 rounded-full bg-orange-500/80" />
                      Focus areas
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {display.expertise.slice(0, 5).map((tag) => (
                          <span
                              key={tag}
                              className="rounded-full border border-orange-200/70 bg-orange-50/80 px-3 py-1 text-xs font-medium text-orange-900 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-100"
                          >
                        {tag}
                      </span>
                      ))}
                    </div>
                  </div>

                  <dl className="mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 p-4 dark:bg-white/[0.03]">
                    <div className="text-center">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Rating</dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-[var(--bridge-text)]">
                        {Number(display.rating).toFixed(1)}
                      </dd>
                    </div>
                    <div className="border-x border-[var(--bridge-border)] text-center">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Experience</dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-[var(--bridge-text)]">
                        {display.years_experience} yrs
                      </dd>
                    </div>
                    <div className="text-center">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Sessions</dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-[var(--bridge-text)]">
                        {display.total_sessions}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                        to={`/mentors/${display.id}`}
                        className={`group btn-sheen relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:-translate-y-0.5 hover:from-orange-500 hover:to-amber-400 hover:shadow-lg hover:shadow-orange-500/30 ${focusRing}`}
                    >
                      Open full profile
                      <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                    </Link>
                    <Link
                        to="/mentors"
                        className={`inline-flex items-center justify-center rounded-full border-2 border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-6 py-3.5 text-sm font-semibold text-[var(--bridge-text)] transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:bg-[var(--bridge-surface-raised)] dark:hover:border-orange-500/40 ${focusRing}`}
                    >
                      See more mentors
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

function ProductPreview() {
  return (
    <section
      id="product-preview"
      className="relative scroll-mt-20 overflow-hidden border-y border-[var(--bridge-border)] bg-gradient-to-b from-[var(--bridge-surface)] via-[var(--bridge-surface-muted)] to-[var(--bridge-surface)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[36rem] w-[56rem] -translate-x-1/2 opacity-40"
        style={{
          background: 'conic-gradient(from 190deg at 50% 0%, rgba(251,146,60,0.18), rgba(253,230,138,0.1), rgba(234,88,12,0.2), rgba(251,146,60,0.18))',
          filter: 'blur(80px)',
        }}
      />

      <div className="mx-auto max-w-bridge">
        <Reveal className="mb-8 text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700 dark:text-orange-300/95">
            <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
            See it in action
            <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
          </p>
          <h2 className="font-display text-balance text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
            From search to session booked in minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
            Discover the right mentor, read real bios and reviews, pick a time, and book — all in one place.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <HeroProductPreview />
        </Reveal>
      </div>
    </section>
  );
}
/**
 * WhyBridge — honest comparison vs. the real alternatives a user has in mind.
 */
function WhyBridge() {
  const rows = [
    { label: 'You get a response', dm: '~10% reply rate', coaching: 'Always — they sell hours', bridge: 'Always — mentors opt-in to listings' },
    { label: 'They\u2019ve done your actual job', dm: 'Maybe', coaching: 'Rarely — usually pro coaches', bridge: 'Yes, that\u2019s the filter' },
    { label: 'Session has structure', dm: 'No', coaching: 'Yes', bridge: 'Yes — 4 named formats' },
    { label: 'Price is clear upfront', dm: '—', coaching: 'Often bundled/hidden', bridge: 'On every profile' },
    { label: 'You can see reviews first', dm: 'No', coaching: 'Curated testimonials', bridge: 'All reviews, unfiltered' },
    { label: 'Commitment', dm: 'None', coaching: 'Multi-session packages', bridge: 'One session at a time' },
  ];

  return (
      <section id="why-bridge" className="relative scroll-mt-20 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-bridge">
          <Reveal className="mb-10 max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700 dark:text-orange-300/95">
              <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
              Why Bridge
            </p>
            <h2 className="font-display text-balance text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
              You have three options right now. Here&apos;s how they compare.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
              Most advice lives on LinkedIn DMs or expensive coaching packages. We built Bridge to sit in the middle:
              single-session bookings with people who actually did the thing.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                  <tr className="border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 dark:bg-white/[0.03]">
                    <th scope="col" className="px-4 py-4 font-semibold text-[var(--bridge-text)] sm:px-6" />
                    <th scope="col" className="px-3 py-4 text-center font-semibold text-[var(--bridge-text-muted)] sm:px-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">Cold LinkedIn DMs</span>
                        <span className="text-[10px] font-normal text-[var(--bridge-text-faint)]">Free, slow</span>
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-4 text-center font-semibold text-[var(--bridge-text-muted)] sm:px-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">Coaching platforms</span>
                        <span className="text-[10px] font-normal text-[var(--bridge-text-faint)]">$200–$500/mo</span>
                      </div>
                    </th>
                    <th scope="col" className="relative bg-gradient-to-b from-orange-50/80 to-amber-50/50 px-3 py-4 text-center font-semibold text-orange-950 dark:from-orange-500/15 dark:to-amber-500/10 dark:text-orange-100 sm:px-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse-soft" />
                          Bridge
                        </span>
                        <span className="text-[10px] font-normal text-orange-800/80 dark:text-orange-200/80">$25–$150 / session</span>
                      </div>
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  {rows.map((row, i) => (
                      <tr
                          key={row.label}
                          className={`border-b border-[var(--bridge-border)]/70 transition hover:bg-[var(--bridge-surface-muted)]/60 last:border-0 dark:hover:bg-white/[0.03] ${i % 2 === 1 ? 'bg-[var(--bridge-surface-muted)]/40 dark:bg-white/[0.015]' : ''}`}
                      >
                        <th scope="row" className="px-4 py-4 font-medium text-[var(--bridge-text)] sm:px-6">{row.label}</th>
                        <td className="px-3 py-4 text-center text-xs text-[var(--bridge-text-muted)] sm:px-4 sm:text-sm">{row.dm}</td>
                        <td className="px-3 py-4 text-center text-xs text-[var(--bridge-text-muted)] sm:px-4 sm:text-sm">{row.coaching}</td>
                        <td className="bg-orange-50/40 px-3 py-4 text-center text-xs font-semibold text-[var(--bridge-text)] dark:bg-orange-500/[0.07] sm:px-4 sm:text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/90 text-[9px] font-bold text-white">✓</span>
                            {row.bridge}
                          </span>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

/**
 * Outcomes — testimonials led by result, not quote.
 */
function Outcomes() {
  const outcomes = [
    {
      result: 'Got the offer',
      metric: '+32% comp',
      quote:
          'Two sessions with a former FAANG recruiter. She rewrote my answer to "tell me about yourself" in ten minutes. I got the offer a week later.',
      name: 'Tyler N.',
      role: 'Senior Engineer',
    },
    {
      result: 'Changed industries',
      metric: 'Banking → Startup',
      quote:
          'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.',
      name: 'Priya S.',
      role: 'Ex-Analyst, now PM',
    },
    {
      result: 'Got promoted',
      metric: 'IC → Staff',
      quote:
          'I\u2019d been stuck at senior for four years. My mentor called out exactly which work I was doing that didn\u2019t count. Promoted in the next cycle.',
      name: 'Jordan E.',
      role: 'Staff Engineer',
    },
  ];

  return (
      <section id="outcomes" className="relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950" />
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-1/4 h-[min(480px,70vw)] w-[min(480px,70vw)] rounded-full bg-orange-500/25 blur-3xl" />

        <div className="relative mx-auto max-w-bridge">
          <Reveal className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Outcomes</p>
            <h2 className="font-display text-balance text-3xl font-bold text-white sm:text-4xl lg:text-[2.5rem]">
              What people walked away with
            </h2>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
            {outcomes.map(({ result, metric, quote, name, role }, i) => (
                <Reveal key={name} delay={i * 90}>
                  <figure
                      className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white/[0.07] p-7 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/[0.11] sm:p-8 ${
                          i === 1
                              ? 'border-orange-400/35 shadow-lg shadow-orange-950/40 ring-1 ring-orange-400/25 lg:scale-[1.02] lg:z-10'
                              : 'border-white/10 hover:border-white/20'
                      }`}
                  >
                    {/* Outcome headline — leads with result */}
                    <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white shadow-sm">
                    ✓
                  </span>
                      <div>
                        <p className="text-xs font-medium text-emerald-300">{result}</p>
                        <p className="font-display text-xl font-semibold text-white">{metric}</p>
                      </div>
                    </div>

                    <blockquote className="mt-5 flex-1 text-pretty">
                      <p className="text-sm leading-relaxed text-stone-200 sm:text-base">&ldquo;{quote}&rdquo;</p>
                    </blockquote>

                    <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5 text-sm">
                      <span className="text-stone-300">—</span>
                      <div>
                        <p className="font-semibold text-white">{name}</p>
                        <p className="text-xs text-orange-100/85">{role}</p>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}

/**
 * PricingBlock — transparent price info before the final CTA.
 */
function PricingBlock() {
  return (
      <section className="relative px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative grid gap-5 overflow-hidden rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-card transition hover:shadow-bridge-glow sm:p-10 lg:grid-cols-5 lg:items-center lg:gap-8 lg:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/25 via-amber-300/15 to-transparent blur-3xl dark:from-orange-500/30 dark:via-amber-500/15"
              />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

              <div className="relative lg:col-span-3">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700 dark:text-orange-300/95">
                  <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
                  Pricing, clearly
                </p>
                <h2 className="mt-3 font-display text-balance text-2xl font-semibold text-[var(--bridge-text)] sm:text-3xl lg:text-[2.25rem] lg:leading-tight">
                  No subscription to unlock mentors. You pay per session.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                  Mentors set their own rates — shown on every profile before you book. Optional paid Bridge plans add
                  unlimited requests and extras, but they&apos;re not required to use the product.
                </p>
                <Link
                    to="/pricing"
                    className={`mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-orange-700 underline-offset-4 transition hover:text-orange-600 hover:underline dark:text-orange-300 dark:hover:text-orange-200 ${focusRing}`}
                >
                  See pricing details
                  <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                </Link>
              </div>

              <div className="relative grid grid-cols-3 gap-3 lg:col-span-2">
                <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 p-4 text-center transition hover:-translate-y-0.5 hover:border-orange-300/60 dark:bg-white/[0.03]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">From</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-[var(--bridge-text)]">$25</p>
                  <p className="text-[11px] text-[var(--bridge-text-muted)]">per 30 min</p>
                </div>
                <div className="relative rounded-2xl border border-orange-300/60 bg-gradient-to-br from-orange-50/80 to-amber-50/50 p-4 text-center shadow-[0_10px_28px_-12px_rgba(234,88,12,0.35)] ring-1 ring-orange-300/30 transition hover:-translate-y-1 hover:shadow-[0_18px_36px_-12px_rgba(234,88,12,0.5)] dark:border-orange-400/30 dark:from-orange-500/15 dark:to-amber-500/10">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow">
                    Most
                  </span>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-200">Avg</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-orange-950 dark:text-orange-100">$60</p>
                  <p className="text-[11px] text-orange-900/80 dark:text-orange-200/80">per session</p>
                </div>
                <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 p-4 text-center transition hover:-translate-y-0.5 hover:border-orange-300/60 dark:bg-white/[0.03]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Up to</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-[var(--bridge-text)]">$150</p>
                  <p className="text-[11px] text-[var(--bridge-text-muted)]">senior mentors</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

function FinalCTA() {
  const { user } = useAuth();
  return (
      <section id="get-started" aria-labelledby="final-cta-heading" className="scroll-mt-20 px-4 pb-24 pt-10 sm:px-6 sm:pb-28 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 px-8 py-16 text-center shadow-bridge-glow ring-1 ring-white/20 sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
            <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 animate-gradient-shift bg-[linear-gradient(110deg,transparent_42%,rgba(255,255,255,0.12)_50%,transparent_58%)]"
            />

            <p className="relative mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-50 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 animate-pulse-soft" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              842 sessions this week
            </p>
            <h2
                id="final-cta-heading"
                className="relative mt-4 font-display text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
            >
              One conversation with the right person changes things.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-orange-50/95">
              Free to sign up. Free to browse. Pay only when you book.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                  <>
                    <Link
                        to="/mentors"
                        className={`inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
                    >
                      Browse mentors
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
                    >
                      Go to dashboard
                    </Link>
                  </>
              ) : (
                  <>
                    <Link
                        to="/register"
                        className={`inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
                    >
                      Sign up free
                    </Link>
                    <Link
                        to="/mentors"
                        className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
                    >
                      Just show me mentors
                    </Link>
                  </>
              )}
            </div>
          </div>
        </Reveal>
      </section>
  );
}


export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    void (async () => {
      const { data } = await getFeaturedMentors();
      if (cancelled) return;
      setFeatured(data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const spotlightMentor = useMemo(() => {
    if (!featured || featured.length === 0) return null;
    return featured[0];
  }, [featured]);

  return (
    <main id="main-content" aria-label="Bridge — home" className="overflow-x-hidden">
      <Hero />
      <MetricsRibbon />
      <FeaturedMentor mentor={spotlightMentor} loading={loading} />
      <ProductPreview />
      <WhyBridge />
      <Outcomes />
      <PricingBlock />
      <FinalCTA />
    </main>
  );
}