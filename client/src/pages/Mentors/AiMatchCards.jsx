import { useState } from 'react';
import { Link } from 'react-router-dom';
import MentorAvatar from '../../components/MentorAvatar';
import { focusRing } from '../../ui';
import { tierBadge } from './constants';
import { StarRating } from './MentorCard';

function MatchChip({ label }) {
  const c = label === 'Strong Match'
    ? 'bg-emerald-500/12 text-emerald-600 ring-emerald-400/30 dark:text-emerald-300'
    : label === 'Good Match'
    ? 'bg-sky-500/12 text-sky-600 ring-sky-400/30 dark:text-sky-300'
    : 'bg-amber-500/12 text-amber-600 ring-amber-400/30 dark:text-amber-300';
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${c}`}>{label}</span>;
}

export function AiMatchCard({ mentor, match }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group relative flex h-full flex-col gap-3.5 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-card transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:shadow-[0_16px_40px_-12px_rgba(139,92,246,0.2)]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-400/8 blur-3xl" />

      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          {match.match_score}%
        </span>
        <MatchChip label={match.match_label} />
      </div>

      <div className="flex items-start gap-3 pr-24">
        <MentorAvatar name={mentor.name} size="card" className="rounded-xl ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate text-[14px] font-bold text-[var(--bridge-text)]">{mentor.name}</h3>
          <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title}</p>
          <p className="mt-0.5 truncate text-[12px] font-medium text-[var(--bridge-text-secondary)]">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        {mentor.tier && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierBadge(mentor.tier)}`}>
            {mentor.tier}
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--bridge-text-secondary)]">{mentor.bio}</p>

      <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60">
        <button type="button" onClick={() => setExpanded(v => !v)}
          className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[12px] font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400 ${focusRing}`}>
          Why this mentor?
          <svg className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expanded && (
          <ul className="border-t border-[var(--bridge-border)] px-3.5 pb-3 pt-2.5 space-y-1.5">
            {match.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--bridge-text-secondary)]">
                <span className="mt-0.5 shrink-0 text-violet-500">•</span>{r}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--bridge-border)] pt-3.5">
        <span className="text-[11px] text-[var(--bridge-text-faint)]">{mentor.total_sessions} sessions</span>
        <Link to={`/mentors/${mentor.id}`}
          className={`inline-flex items-center gap-1 rounded-lg bg-[var(--bridge-surface-muted)] px-3.5 py-2 text-[12px] font-semibold text-[var(--bridge-text)] ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-surface-raised)] hover:ring-violet-400/40 ${focusRing}`}>
          View profile
          <svg className="h-3 w-3 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export function AiHonorableCard({ mentor, match }) {
  return (
    <div className="group flex items-center gap-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-3.5 transition-all hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-card">
      <MentorAvatar name={mentor.name} size="sm" className="ring-2 ring-[var(--bridge-canvas)] shadow" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[13px] font-semibold text-[var(--bridge-text)]">{mentor.name}</h4>
          <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">{match.match_score}%</span>
        </div>
        <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title} · {mentor.company}</p>
        {match.reason && <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--bridge-text-faint)]">{match.reason}</p>}
      </div>
      <Link to={`/mentors/${mentor.id}`}
        className={`shrink-0 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-1.5 text-[11px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-raised)] ${focusRing}`}>
        View
      </Link>
    </div>
  );
}
