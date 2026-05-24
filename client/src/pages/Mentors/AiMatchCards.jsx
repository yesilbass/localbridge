import { useState } from 'react';
import AppLink from '../../components/AppLink';
import MentorAvatar from '../../components/MentorAvatar';
import { focusRing } from '../../ui';
import { StarRating } from './MentorCard';
import { useContent } from '../../content';

function MatchChip({ label }) {
  const c = label === 'Strong Match'
    ? 'bg-emerald-500/12 text-emerald-600 ring-emerald-400/30 dark:text-emerald-300'
    : label === 'Good Match'
    ? 'bg-sky-500/12 text-sky-600 ring-sky-400/30 dark:text-sky-300'
    : 'bg-amber-500/12 text-amber-600 ring-amber-400/30 dark:text-amber-300';
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${c}`}>{label}</span>;
}

export function AiMatchCard({ mentor, match }) {
  const { s } = useContent();
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="group relative overflow-hidden rounded-[1.35rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/35"
      style={{
        boxShadow: '0 1px 2px var(--bridge-shadow-soft), 0 16px 40px -22px color-mix(in srgb, var(--color-primary) 28%, transparent)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-r-full" style={{ background: 'linear-gradient(180deg, var(--color-primary), #8b5cf6)' }} />

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6">
        <div className="relative shrink-0 self-start">
          <MentorAvatar name={mentor.name} size="xl" className="rounded-2xl ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-[1.125rem] font-black text-[var(--bridge-text)]">{mentor.name}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-2.5 py-1 text-[11px] font-bold text-white">
                  {match.match_score}% match
                </span>
                <MatchChip label={match.match_label} />
              </div>
              <p className="mt-1 text-[14px] font-semibold text-[var(--bridge-text-secondary)]">
                {mentor.title}
                {mentor.company ? <span className="font-medium text-[var(--bridge-text-muted)]"> · {mentor.company}</span> : null}
              </p>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-[var(--bridge-text-secondary)]">{mentor.bio}</p>

          <div className="mt-4 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60">
            <button type="button" onClick={() => setExpanded(v => !v)}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[12px] font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400 ${focusRing}`}>
              {s.mentors.whyThisMentor}
              <svg className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expanded && (
              <ul className="space-y-1.5 border-t border-[var(--bridge-border)] px-3.5 pb-3 pt-2.5">
                {match.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--bridge-text-secondary)]">
                    <span className="mt-0.5 shrink-0 text-violet-500">•</span>{r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-[var(--bridge-border)] pt-4 sm:w-[13.5rem] sm:flex-col sm:items-stretch sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <div className="space-y-2">
            <StarRating rating={mentor.rating} />
            <p className="text-[12px] text-[var(--bridge-text-faint)]">{s.mentors.totalSessions.replace('{n}', mentor.total_sessions)}</p>
          </div>
          <AppLink
            to={`/mentors/${mentor.id}`}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-[var(--color-on-primary)] transition hover:-translate-y-0.5 sm:mt-auto ${focusRing}`}
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {s.mentors.viewProfile}
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </AppLink>
        </div>
      </div>
    </article>
  );
}

export function AiHonorableCard({ mentor, match }) {
  return (
    <div className="group flex items-center gap-4 rounded-[1.15rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)]">
      <MentorAvatar name={mentor.name} size="lg" className="rounded-xl ring-2 ring-[var(--bridge-canvas)] shadow" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-display text-[14px] font-bold text-[var(--bridge-text)]">{mentor.name}</h4>
          <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">{match.match_score}%</span>
        </div>
        <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title} · {mentor.company}</p>
        {match.reason && <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--bridge-text-faint)]">{match.reason}</p>}
      </div>
      <AppLink
        to={`/mentors/${mentor.id}`}
        className={`shrink-0 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3.5 py-2 text-[12px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-raised)] ${focusRing}`}
      >
        View
      </AppLink>
    </div>
  );
}
