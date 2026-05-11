import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Calendar, Check, Star, Video, ArrowRight, ShieldCheck, CreditCard,
} from 'lucide-react';
import supabase from '../../../api/supabase';
import { useAuth } from '../../../context/useAuth.js';
import { isMentorAccount } from '../../../utils/accountRole';
import {
  useNextSession,
  useDashboardSessions,
  usePastSessions,
  useLiveCountdown,
} from '../dashboardHooks.js';
import { getMyReviewedSessionIds } from '../../../api/reviews';

const SEVERITY = {
  info: {
    bg: 'var(--bridge-surface)',
    ring: 'inset 0 0 0 1px var(--bridge-border)',
  },
  warning: {
    bg: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
    ring: 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 32%, transparent)',
  },
  primary: {
    bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
    ring: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)',
  },
  live: {
    bg: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
    ring: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 45%, transparent)',
  },
};

function StripShell({ severity, icon: Icon, message, children, live }) {
  const tone = SEVERITY[severity] ?? SEVERITY.info;
  const iconColor = severity === 'warning'
    ? 'var(--color-warning)'
    : severity === 'primary' || severity === 'live'
      ? 'var(--color-primary)'
      : 'var(--bridge-text-muted)';
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-3 rounded-2xl p-4 sm:flex-nowrap sm:gap-4 sm:p-5"
      style={{ backgroundColor: tone.bg, boxShadow: tone.ring }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {live ? (
          <span
            aria-hidden
            className="bridge-pulse h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: '#10b981' }}
          />
        ) : Icon ? (
          <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} aria-hidden />
        ) : null}
        <p
          className="text-[13px] sm:text-[14px]"
          style={{ color: 'var(--bridge-text)', lineHeight: 1.45 }}
        >
          {message}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function PrimaryButton({ to, onClick, children }) {
  const cn = 'bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-shadow';
  const style = { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' };
  if (to) {
    return <Link to={to} className={cn} style={style}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} className={cn} style={style}>{children}</button>;
}

function GhostButton({ to, onClick, children }) {
  const cn = 'bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-colors';
  const style = {
    boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
    color: 'var(--bridge-text-secondary)',
  };
  if (to) {
    return <Link to={to} className={cn} style={style}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} className={cn} style={style}>{children}</button>;
}

export default function HomeNowStrip({ activeRole }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMentor = activeRole === 'mentor' || (user ? isMentorAccount(user) : false);

  const { session } = useNextSession();
  const { pending, handleStatusUpdate, mentorProfileId } = useDashboardSessions();
  const { sessions: past } = usePastSessions({ limit: 10 });

  const [vetted, setVetted] = useState(true);
  const [bookingReady, setBookingReady] = useState(true);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [accepting, setAccepting] = useState(null);

  const now = useLiveCountdown(session?.scheduledAt);

  // mentor-only signals
  useEffect(() => {
    if (!isMentor || !user) return undefined;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from('mentor_profiles')
        .select('onboarding_complete, calendly_connected, calendly_event_type_uri')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setVetted(data?.onboarding_complete !== false);
      setBookingReady(!!(data?.calendly_connected && data?.calendly_event_type_uri));
    })();
    return () => { cancelled = true; };
  }, [user, isMentor, mentorProfileId]);

  // mentee-only: which past sessions still need a review
  useEffect(() => {
    if (isMentor) return undefined;
    let cancelled = false;
    getMyReviewedSessionIds().then(({ data }) => {
      if (!cancelled && data) setReviewedIds(data);
    });
    return () => { cancelled = true; };
  }, [isMentor]);

  // Stable mount-time anchor — purity-safe alternative to inline `Date.now()`.
  const [mountNow] = useState(() => Date.now());

  const liveOrSoon = useMemo(() => {
    if (!session?.scheduledAt) return null;
    const delta = new Date(session.scheduledAt).getTime() - now;
    if (delta <= 5 * 60 * 1000 && delta > -30 * 60 * 1000) return { delta, session };
    return null;
  }, [session, now]);

  const pendingNeedsAction = isMentor && pending && pending.length > 0 ? pending[0] : null;

  const reviewableSession = useMemo(() => {
    if (isMentor) return null;
    const sevenDaysAgo = mountNow - 7 * 24 * 60 * 60 * 1000;
    return past.find((s) => {
      const status = String(s.status ?? '').toLowerCase();
      const t = new Date(s.scheduled_date ?? s.created_at).getTime();
      return (status === 'completed' || (t > 0 && t <= mountNow && t >= sevenDaysAgo))
        && !reviewedIds.has(s.id)
        && status !== 'cancelled' && status !== 'declined';
    });
  }, [isMentor, past, reviewedIds, mountNow]);

  // Priority gate (top wins).
  // 1. mentor not vetted
  if (isMentor && !vetted) {
    return (
      <StripShell
        severity="info"
        icon={ShieldCheck}
        message={(
          <span>
            <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>We&apos;re vetting your profile.</span>{' '}
            <span style={{ color: 'var(--bridge-text-secondary)' }}>We&apos;ll email you within 48 hours.</span>
          </span>
        )}
      >
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
            color: 'var(--bridge-text-muted)',
          }}
        >
          In review
        </span>
      </StripShell>
    );
  }

  // 2. mentor not yet bookable (Calendly not connected or event type unset)
  if (isMentor && !bookingReady) {
    return (
      <StripShell
        severity="warning"
        icon={AlertTriangle}
        message={(
          <span>
            <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>Connect your booking calendar.</span>{' '}
            <span style={{ color: 'var(--bridge-text-secondary)' }}>Mentees can&apos;t book until you do.</span>
          </span>
        )}
      >
        <PrimaryButton to="/dashboard/availability">
          Open availability <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </PrimaryButton>
      </StripShell>
    );
  }

  // 3. live or starting in <5 min
  if (liveOrSoon) {
    const live = liveOrSoon.delta <= 0;
    const joinTo = liveOrSoon.session.joinUrl;
    return (
      <StripShell
        severity="live"
        live
        message={(
          <span>
            <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
              {live ? 'Session live right now.' : 'Your session starts in under 5 minutes.'}
            </span>
            {liveOrSoon.session.otherParty?.name ? (
              <span style={{ color: 'var(--bridge-text-secondary)' }}>
                {' '}With {liveOrSoon.session.otherParty.name}.
              </span>
            ) : null}
          </span>
        )}
      >
        <PrimaryButton to={joinTo ?? '/dashboard/sessions'}>
          <Video className="h-3.5 w-3.5" aria-hidden /> Join now
        </PrimaryButton>
      </StripShell>
    );
  }

  // 4. mentor pending session
  if (pendingNeedsAction) {
    const date = pendingNeedsAction.scheduled_date
      ? new Date(pendingNeedsAction.scheduled_date)
      : null;
    const when = date
      ? `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      : 'Time TBD';
    return (
      <StripShell
        severity="primary"
        icon={Calendar}
        message={(
          <span>
            <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
              {pendingNeedsAction.mentee_name || 'A mentee'} requested a session.
            </span>{' '}
            <span className="tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
              {when}.
            </span>
          </span>
        )}
      >
        <PrimaryButton
          onClick={async () => {
            setAccepting(pendingNeedsAction.id);
            await handleStatusUpdate(pendingNeedsAction.id, 'accepted');
            setAccepting(null);
          }}
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          {accepting === pendingNeedsAction.id ? 'Accepting…' : 'Accept'}
        </PrimaryButton>
        <GhostButton onClick={() => navigate('/dashboard/sessions')}>
          View details
        </GhostButton>
      </StripShell>
    );
  }

  // 5. mentee needs review
  if (reviewableSession) {
    const mentorName = reviewableSession._mentor?.name || 'your mentor';
    return (
      <StripShell
        severity="primary"
        icon={Star}
        message={(
          <span>
            <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
              How was your session with {mentorName}?
            </span>{' '}
            <span style={{ color: 'var(--bridge-text-secondary)' }}>Leave a quick review.</span>
          </span>
        )}
      >
        <PrimaryButton to="/dashboard/sessions">
          Add review <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </PrimaryButton>
      </StripShell>
    );
  }

  // 6. mentee failed payment (best-effort: a session left in pending > 24h with no
  // accepted/cancelled state and unreachable mentor — surface a retry path. We
  // don't have a payment table, so we treat any pending booking older than 24h
  // as "did not process".
  if (!isMentor) {
    const stalePending = past.find((s) => {
      const status = String(s.status ?? '').toLowerCase();
      if (status !== 'pending') return false;
      const t = new Date(s.created_at).getTime();
      return mountNow - t > 24 * 60 * 60 * 1000;
    });
    if (stalePending) {
      return (
        <StripShell
          severity="warning"
          icon={CreditCard}
          message={(
            <span>
              <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
                Your last booking didn&apos;t process.
              </span>{' '}
              <span style={{ color: 'var(--bridge-text-secondary)' }}>Retry?</span>
            </span>
          )}
        >
          <PrimaryButton to="/dashboard/billing">
            Open billing <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </PrimaryButton>
        </StripShell>
      );
    }
  }

  // No condition fired — render nothing.
  return null;
}
