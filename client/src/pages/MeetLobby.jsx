import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, Check, X, ArrowLeft, Users } from 'lucide-react';
import supabase from '../api/supabase';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { useContent } from '../content';

// `/meet/:slug` — permanent per-mentor lobby. Mentees knock, mentor admits,
// then both navigate into the existing /session/:id/video room.

function getInitials(name = '') {
  return name.split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
}

function Shell({ children }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-950 p-6 text-center">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <Shell>
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </Shell>
  );
}

function Blocked({ title, message, onBack }) {
  const { s } = useContent();
  return (
    <Shell>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <p className="mt-4 text-lg font-bold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-stone-400">{message}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:bg-stone-800 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> {s.common.back}
      </button>
    </Shell>
  );
}

export default function MeetLobby() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const { s } = useContent();

  const [mentor, setMentor] = useState(null);    // { id, name, user_id }
  const [session, setSession] = useState(null);  // mentee's accepted session with this mentor
  const [loadError, setLoadError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Mentor side: pending knocks { sessionId -> { menteeId, menteeName, sessionId, ts } }
  const [knocks, setKnocks] = useState({});

  // Mentee side
  const [knocking, setKnocking] = useState(false);
  const [denied, setDenied] = useState(false);

  const channelRef = useRef(null);
  const myUserId = user?.id;

  // Step 1: resolve slug → mentor.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('id, name, user_id')
        .eq('room_slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('[meet] mentor lookup failed', error);
        setLoadError('Could not load this meeting room.'); setPageLoading(false); return;
      }
      if (!data) { setLoadError('This meeting room does not exist.'); setPageLoading(false); return; }
      setMentor(data);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Step 2: once mentor resolved, decide role + load mentee's session if needed.
  useEffect(() => {
    if (authLoading) return;
    if (!mentor) return;
    if (!user) {
      setLoadError('Please sign in to enter this meeting.');
      setPageLoading(false);
      setTimeout(() => navigate(`/login?redirect=${encodeURIComponent(`/meet/${slug}`)}`, { replace: true }), 600);
      return;
    }

    const isHost = user.id === mentor.user_id;
    if (isHost) {
      setPageLoading(false);
      return;
    }

    // Mentee path: find an accepted session with this mentor (closest in time, future-leaning).
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, scheduled_date, status, mentor_id')
        .eq('mentee_id', user.id)
        .eq('mentor_id', mentor.id)
        .eq('status', 'accepted')
        .order('scheduled_date', { ascending: true })
        .limit(20);
      if (cancelled) return;
      if (error) { setLoadError('Could not check your bookings.'); setPageLoading(false); return; }
      const rows = Array.isArray(data) ? data : [];
      if (rows.length === 0) {
        setLoadError('You do not have a confirmed session with this mentor.');
        setPageLoading(false);
        return;
      }
      const now = Date.now();
      // Prefer the next upcoming; fall back to most recent.
      const upcoming = rows.find((r) => !r.scheduled_date || new Date(r.scheduled_date).getTime() >= now - 30 * 60 * 1000);
      setSession(upcoming || rows[rows.length - 1]);
      setPageLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mentor, user, authLoading, slug, navigate]);

  // Step 3: realtime channel.
  useEffect(() => {
    if (pageLoading || !mentor || !user) return;
    const isHost = user.id === mentor.user_id;
    const ch = supabase.channel(`meet:${slug}`, { config: { broadcast: { self: false } } });

    ch.on('broadcast', { event: 'knock' }, ({ payload }) => {
      if (!isHost) return;
      if (!payload?.sessionId) return;
      setKnocks((prev) => ({
        ...prev,
        [payload.sessionId]: {
          sessionId: payload.sessionId,
          menteeId: payload.menteeId,
          menteeName: payload.menteeName || 'Mentee',
          ts: Date.now(),
        },
      }));
    });

    ch.on('broadcast', { event: 'admit' }, ({ payload }) => {
      if (isHost) return;
      if (!payload?.sessionId || !session?.id) return;
      if (payload.sessionId !== session.id) return;
      navigate(`/session/${session.id}/video`, { replace: true });
    });

    ch.on('broadcast', { event: 'deny' }, ({ payload }) => {
      if (isHost) return;
      if (!payload?.sessionId || !session?.id) return;
      if (payload.sessionId !== session.id) return;
      setKnocking(false);
      setDenied(true);
    });

    void ch.subscribe();
    channelRef.current = ch;
    return () => {
      try { supabase.removeChannel(ch); } catch { /* noop */ }
      channelRef.current = null;
    };
  }, [pageLoading, mentor, user, slug, session?.id, navigate]);

  // Mentee: send knock as soon as channel is ready.
  const sendKnock = useCallback(async () => {
    if (!channelRef.current || !session?.id || !user) return;
    setDenied(false);
    setKnocking(true);
    const menteeName = user.user_metadata?.full_name || user.email || 'Mentee';
    await channelRef.current.send({
      type: 'broadcast',
      event: 'knock',
      payload: {
        sessionId: session.id,
        menteeId: user.id,
        menteeName,
      },
    });
  }, [session?.id, user]);

  // Mentee: auto-knock once on entry, and re-knock periodically (mentor may not be subscribed yet).
  useEffect(() => {
    if (pageLoading || !mentor || !user) return;
    if (user.id === mentor.user_id) return;
    if (!session?.id) return;
    void sendKnock();
    const interval = setInterval(() => { void sendKnock(); }, 4000);
    return () => clearInterval(interval);
  }, [pageLoading, mentor, user, session?.id, sendKnock]);

  // Mentor: admit / deny actions.
  async function admit(knock) {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'admit',
      payload: { sessionId: knock.sessionId },
    });
    setKnocks((prev) => {
      const next = { ...prev };
      delete next[knock.sessionId];
      return next;
    });
    navigate(`/session/${knock.sessionId}/video`, { replace: true });
  }
  async function deny(knock) {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'deny',
      payload: { sessionId: knock.sessionId },
    });
    setKnocks((prev) => {
      const next = { ...prev };
      delete next[knock.sessionId];
      return next;
    });
  }

  // ── Renders ──────────────────────────────────────────────────────────────

  if (authLoading || pageLoading) return <Spinner />;
  if (loadError) {
    return <Blocked title="Cannot enter meeting" message={loadError} onBack={() => navigate('/dashboard')} />;
  }
  if (!mentor || !user) return <Spinner />;

  const isHost = user.id === mentor.user_id;
  const knockList = Object.values(knocks).sort((a, b) => a.ts - b.ts);

  if (isHost) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-950 p-6">
        <div className="w-full max-w-md rounded-3xl bg-stone-900 p-7 ring-1 ring-white/10">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-400">Your meeting room</p>
          <h1 className="mt-1 text-2xl font-black text-white">Lobby</h1>
          <p className="mt-1 text-sm text-stone-400">
            Waiting for mentees to join. They appear here after they click your Calendly meeting link.
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Pending ({knockList.length})
              </span>
              {knockList.length === 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Listening…
                </span>
              )}
            </div>

            {knockList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-stone-950 p-8 ring-1 ring-white/5">
                <Users className="h-7 w-7 text-stone-700" />
                <p className="mt-3 text-sm text-stone-500">No one is waiting yet.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {knockList.map((k) => (
                  <li
                    key={k.sessionId}
                    className="flex items-center gap-3 rounded-2xl bg-stone-950 p-3 ring-1 ring-white/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                      {getInitials(k.menteeName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{k.menteeName}</p>
                      <p className="text-[11px] text-stone-500">wants to enter</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deny(k)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-800 text-stone-300 transition hover:bg-red-500/20 hover:text-red-400"
                      title="Deny"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => admit(k)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Admit
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {s.common.backToDashboard}
          </button>
        </div>
      </div>
    );
  }

  // Mentee
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-950 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-xl font-black text-white shadow-[0_0_40px_color-mix(in_srgb,_var(--color-primary)_35%,_transparent)]">
        {getInitials(mentor.name)}
      </div>
      <p className="mt-4 text-lg font-bold text-white">{mentor.name}'s meeting</p>
      {denied ? (
        <>
          <p className="mt-2 max-w-sm text-sm text-red-400">
            Your mentor has not let you in.
          </p>
          <button
            type="button"
            onClick={sendKnock}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400"
          >
            Knock again
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 max-w-sm text-sm text-stone-400">
            Waiting for {mentor.name} to let you in…
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900 px-3.5 py-1.5">
            <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
            <span className="text-xs text-stone-400">{knocking ? 'Knocking…' : 'Connecting…'}</span>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Leave
      </button>
    </div>
  );
}
