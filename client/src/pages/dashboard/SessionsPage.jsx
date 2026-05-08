import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Check, X as XIcon, Clock, Video, List, CalendarDays, Star, AlertTriangle } from 'lucide-react';
import { useDashboardSessions } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';
import SessionCalendar from './SessionCalendar.jsx';
import CancellationModal from '../../components/CancellationModal.jsx';
import ReviewModal from '../../components/ReviewModal.jsx';
import { getMyReviewedSessionIds } from '../../api/reviews';
import supabase from '../../api/supabase';
import { normalizeAvailabilitySchedule } from '../../utils/mentorAvailability';

function formatDateTime(iso) {
  if (!iso) return 'Not scheduled';
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

const STATUS_STYLE = {
  pending:   { bg: 'color-mix(in srgb, var(--color-warning) 14%, transparent)', fg: 'var(--color-warning)', label: 'Pending' },
  accepted:  { bg: 'color-mix(in srgb, var(--color-success) 14%, transparent)', fg: 'var(--color-success)', label: 'Accepted' },
  completed: { bg: 'var(--bridge-surface-muted)', fg: 'var(--bridge-text-muted)', label: 'Completed' },
  declined:  { bg: 'color-mix(in srgb, var(--color-error) 14%, transparent)', fg: 'var(--color-error)', label: 'Declined' },
  cancelled: { bg: 'color-mix(in srgb, var(--color-error) 14%, transparent)', fg: 'var(--color-error)', label: 'Cancelled' },
};

function StatusChip({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

function SessionCard({ session, isMentor, mentor, onAccept, onDecline, onCancel, onReview, reviewed, busy }) {
  const status = String(session.status ?? 'pending').toLowerCase();
  const isPast = session.scheduled_date && new Date(session.scheduled_date).getTime() <= Date.now() - 30 * 60 * 1000;
  const otherName = isMentor
    ? (session.mentee_name || 'Mentee')
    : (mentor?.name || 'Mentor');
  const subtitle = isMentor
    ? (session.session_type ?? '').replace('_', ' ')
    : [mentor?.title, mentor?.company].filter(Boolean).join(' · ');

  return (
    <article
      className="flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:gap-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {mentor?.image_url ? (
          <img
            src={mentor.image_url}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            className="bridge-photo h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="bridge-photo grid h-12 w-12 shrink-0 place-items-center rounded-full text-[12px] font-black"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            {(otherName || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold" style={{ color: 'var(--bridge-text)' }}>
              {otherName}
            </p>
            <StatusChip status={status} />
          </div>
          {subtitle && (
            <p className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
              {subtitle}
            </p>
          )}
          <p
            className="mt-1 inline-flex items-center gap-1 text-[12px] tabular-nums"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDateTime(session.scheduled_date)}
          </p>
          {session.message && (
            <p
              className="mt-2 line-clamp-2 text-[12px]"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              “{session.message}”
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {session.video_room_url && (status === 'accepted' || status === 'completed') && (
          <Link
            to={`/session/${session.id}/video`}
            className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            <Video className="h-3.5 w-3.5" aria-hidden /> Join
          </Link>
        )}
        {isMentor && status === 'pending' && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAccept(session.id)}
              className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
              style={{ backgroundColor: 'var(--color-success)', color: '#fff', opacity: busy ? 0.5 : 1 }}
            >
              <Check className="h-3.5 w-3.5" aria-hidden /> Accept
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecline(session.id)}
              className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
              style={{
                boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
                color: 'var(--bridge-text-secondary)',
                opacity: busy ? 0.5 : 1,
              }}
            >
              <XIcon className="h-3.5 w-3.5" aria-hidden /> Decline
            </button>
          </>
        )}
        {(status === 'pending' || status === 'accepted') && !isPast && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel(session)}
            className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
            style={{
              boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
              color: 'var(--bridge-text-secondary)',
              opacity: busy ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
        )}
        {!isMentor && (status === 'completed' || isPast) && status !== 'cancelled' && status !== 'declined' && onReview && !reviewed && (
          <button
            type="button"
            onClick={() => onReview(session)}
            className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            <Star className="h-3.5 w-3.5" aria-hidden /> Leave a review
          </button>
        )}
        {!isMentor && reviewed && (
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
            style={{
              backgroundColor: 'var(--bridge-surface-muted)',
              color: 'var(--bridge-text-muted)',
            }}
          >
            <Star className="h-3.5 w-3.5" aria-hidden /> Reviewed
          </span>
        )}
      </div>
    </article>
  );
}

function SectionHeader({ id, label, count }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2
        id={id}
        className="text-[10px] font-black uppercase tracking-[0.32em]"
        style={{ color: 'var(--color-primary)' }}
      >
        {label}
      </h2>
      {count > 0 && (
        <span className="text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
          {count}
        </span>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const {
    isMentor, upcoming, pending, past, mentorMap, mentorProfileId,
    isLoading, actionLoading, handleStatusUpdate, error,
  } = useDashboardSessions();

  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [cancellingSession, setCancelling] = useState(null);
  const [reviewingSession, setReviewing] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [availabilityEmpty, setAvailabilityEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyReviewedSessionIds().then(({ data }) => {
      if (!cancelled && data) setReviewedIds(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Mentors only: detect empty weekly schedule so we can nudge them to the
  // Availability tab. Profile is hidden from search until at least one slot exists.
  useEffect(() => {
    if (!isMentor || !mentorProfileId) { setAvailabilityEmpty(false); return undefined; }
    let cancelled = false;
    supabase
      .from('mentor_profiles')
      .select('availability_schedule')
      .eq('id', mentorProfileId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const norm = normalizeAvailabilitySchedule(data?.availability_schedule);
        const total = Object.values(norm.weekly).reduce((s, arr) => s + arr.length, 0);
        setAvailabilityEmpty(total === 0);
      });
    return () => { cancelled = true; };
  }, [isMentor, mentorProfileId]);

  // Cancel handler routes through the proper cancellation request flow
  // (server-side rate-limited to 3/month per user) when a session is already
  // accepted; pre-acceptance cancels are penalty-free and go direct.
  function handleCancel(session) {
    const status = String(session.status ?? '').toLowerCase();
    if (status === 'accepted') {
      setCancelling(session);
    } else {
      handleStatusUpdate(session.id, 'cancelled');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="bridge-skeleton h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bridge-skeleton h-4 w-1/3 rounded" />
                <div className="bridge-skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderCard = (session) => (
    <SessionCard
      key={session.id}
      session={session}
      isMentor={isMentor}
      mentor={mentorMap[session.mentor_id]}
      onAccept={(id) => handleStatusUpdate(id, 'accepted')}
      onDecline={(id) => handleStatusUpdate(id, 'declined')}
      onCancel={handleCancel}
      onReview={(s) => setReviewing(s)}
      reviewed={reviewedIds.has(session.id)}
      busy={actionLoading === session.id}
    />
  );

  const showPending = isMentor && pending.length > 0 && (filter === 'all' || filter === 'pending');
  const showUpcoming = (filter === 'all' || filter === 'upcoming') && upcoming.length > 0;
  const showPast = (filter === 'all' || filter === 'past') && past.length > 0;
  const empty = !showPending && !showUpcoming && !showPast;

  return (
    <div className="flex flex-col gap-8">
      {isMentor && availabilityEmpty && (
        <Link
          to="/dashboard/availability"
          className="bridge-focus flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 35%, transparent)',
            color: 'var(--bridge-text)',
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--color-warning)' }} aria-hidden />
          <span className="flex-1 text-[13px]">
            <span className="font-bold">No bookable hours set.</span>{' '}
            <span style={{ color: 'var(--bridge-text-secondary)' }}>
              Your profile is hidden from search until you add availability.
            </span>
          </span>
          <span className="text-[12px] font-bold" style={{ color: 'var(--color-primary)' }}>
            Set availability →
          </span>
        </Link>
      )}

      {/* Filter + view-mode controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 rounded-full p-1"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          {[
            { id: 'all', label: 'All' },
            ...(isMentor ? [{ id: 'pending', label: 'Pending' }] : []),
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              disabled={view === 'calendar'}
              className="bridge-focus rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
              style={{
                backgroundColor: filter === t.id && view === 'list' ? 'var(--bridge-surface)' : 'transparent',
                color: filter === t.id && view === 'list' ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
                boxShadow: filter === t.id && view === 'list' ? 'inset 0 0 0 1px var(--bridge-border-strong)' : 'none',
                opacity: view === 'calendar' ? 0.5 : 1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className="inline-flex items-center gap-1 rounded-full p-1"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          {[
            { id: 'list', label: 'List', icon: List },
            { id: 'calendar', label: 'Calendar', icon: CalendarDays },
          ].map((v) => {
            const Icon = v.icon;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={active}
                className="bridge-focus inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
                style={{
                  backgroundColor: active ? 'var(--bridge-surface)' : 'transparent',
                  color: active ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
                  boxShadow: active ? 'inset 0 0 0 1px var(--bridge-border-strong)' : 'none',
                }}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden /> {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-[13px]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}

      {view === 'calendar' ? (
        <SessionCalendar
          sessions={[...upcoming, ...past]}
          handleStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
          isMentor={isMentor}
          mentorMap={mentorMap}
          onCancel={(session) => {
            // SessionCalendar passes the full session object.
            handleCancel(session);
          }}
          onReview={(session) => setReviewing(session)}
          reviewedSessionIds={reviewedIds}
        />
      ) : (
        <>
          {empty && (
            <div
              className="rounded-2xl"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <EmptyState
                icon={Calendar}
                title={isMentor ? 'No sessions to manage yet' : 'You have no sessions'}
                description={isMentor
                  ? 'When mentees book you, requests will appear here.'
                  : 'Find a mentor and book your first session.'}
                ctaLabel={isMentor ? 'Update availability' : 'Browse mentors'}
                ctaHref={isMentor ? '/dashboard/availability' : '/mentors'}
              />
            </div>
          )}

          {showPending && (
            <section aria-labelledby="pending-heading">
              <SectionHeader id="pending-heading" label="Awaiting your response" count={pending.length} />
              <div className="space-y-3">{pending.map(renderCard)}</div>
            </section>
          )}

          {showUpcoming && (
            <section aria-labelledby="upcoming-heading-page">
              <SectionHeader id="upcoming-heading-page" label="Upcoming" count={upcoming.length} />
              <div className="space-y-3">{upcoming.map(renderCard)}</div>
            </section>
          )}

          {showPast && (
            <section aria-labelledby="past-heading-page">
              <SectionHeader id="past-heading-page" label="Past" count={past.length} />
              <div className="space-y-3">{past.map(renderCard)}</div>
            </section>
          )}
        </>
      )}

      {cancellingSession && (
        <CancellationModal
          session={cancellingSession}
          isMentor={isMentor}
          onClose={() => setCancelling(null)}
          onSuccess={() => {
            setCancelling(null);
            // The cancellation_requests row is created server-side; the actual
            // session.status flip happens when the request is approved by the
            // dev portal. Nothing to mutate locally — realtime will refresh.
          }}
        />
      )}

      {reviewingSession && (
        <ReviewModal
          sessionId={reviewingSession.id}
          mentorId={reviewingSession.mentor_id}
          mentorName={mentorMap[reviewingSession.mentor_id]?.name ?? 'your mentor'}
          mentorEmail={mentorMap[reviewingSession.mentor_id]?.email ?? null}
          onClose={() => setReviewing(null)}
          onSubmitted={() => {
            const id = reviewingSession.id;
            setReviewedIds((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
            setReviewing(null);
          }}
        />
      )}
    </div>
  );
}
