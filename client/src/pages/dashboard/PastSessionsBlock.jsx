import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Star } from 'lucide-react';
import { usePastSessions } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';
import ReviewModal from '../../components/ReviewModal.jsx';
import { getMyReviewedSessionIds } from '../../api/reviews';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PastRow({ session, isFirst, onReview, reviewed }) {
  const mentor = session._mentor;
  const initials = (mentor?.name || session.mentor_name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
  const topic = (session.message || '').trim() || (session.session_type || '').replace('_', ' ');
  return (
    <li
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--bridge-surface-muted)]"
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--bridge-border)' }}
    >
      {mentor?.image_url ? (
        <img
          src={mentor.image_url}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="bridge-photo h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="bridge-photo grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-black"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          {initials}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
          {mentor?.name || session.mentor_name || 'Mentor'}
        </span>
        <span className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {[topic, formatDate(session.scheduled_date)].filter(Boolean).join(' · ')}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {reviewed ? (
          <span
            className="inline-flex items-center gap-1 text-[12px] font-bold"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            <Star aria-hidden className="h-3.5 w-3.5" fill="#F59E0B" stroke="#F59E0B" />
            Reviewed
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onReview?.(session)}
            className="bridge-focus rounded-md text-[12px] font-semibold transition-colors hover:text-[var(--color-primary)]"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Leave a review
          </button>
        )}
        {(mentor?.id || session.mentor_id) && (
          <Link
            to={`/mentors/${mentor?.id ?? session.mentor_id}`}
            className="bridge-focus rounded-lg px-3 py-1.5 text-[12px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            Book again
          </Link>
        )}
      </div>
    </li>
  );
}

export default function PastSessionsBlock() {
  const { sessions, isLoading } = usePastSessions({ limit: 5 });
  const [reviewed, setReviewed] = useState(new Set());
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyReviewedSessionIds().then(({ data }) => {
      if (!cancelled && data) setReviewed(data);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section aria-labelledby="past-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="past-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Past sessions
        </h2>
        <Link
          to="/dashboard/sessions"
          className="bridge-focus inline-flex items-center gap-1 rounded-md text-[12px] font-semibold transition-colors hover:text-[var(--color-primary)]"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {isLoading ? (
          <ul>
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bridge-border)' }}
              >
                <div className="bridge-skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bridge-skeleton h-3.5 w-1/3 rounded" />
                  <div className="bridge-skeleton h-3 w-1/2 rounded" />
                </div>
              </li>
            ))}
          </ul>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No past sessions yet"
            description="Your session history will appear here."
            ctaLabel="Find your first mentor"
            ctaHref="/mentors"
          />
        ) : (
          <ul>
            {sessions.map((s, i) => (
              <PastRow
                key={s.id}
                session={s}
                isFirst={i === 0}
                onReview={(session) => setReviewing(session)}
                reviewed={reviewed.has(s.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {reviewing && (
        <ReviewModal
          sessionId={reviewing.id}
          mentorId={reviewing.mentor_id}
          mentorName={reviewing._mentor?.name ?? reviewing.mentor_name ?? 'your mentor'}
          mentorEmail={reviewing._mentor?.email ?? null}
          onClose={() => setReviewing(null)}
          onSubmitted={() => {
            const id = reviewing.id;
            setReviewed((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
            setReviewing(null);
          }}
        />
      )}
    </section>
  );
}
