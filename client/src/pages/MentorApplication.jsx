import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Clock, Lock, Mic, MicOff } from 'lucide-react';
import supabase from '../api/supabase';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { callAIProxy } from '../api/ai';
import { submitMentorApplication, fetchOwnMentorProfileRow } from '../api/verification';
import { useRealtimeCall } from '../hooks/useRealtimeCall';
import LoadingSpinner from '../components/LoadingSpinner';

function Waveform({ active }) {
  return (
    <div className="flex h-16 items-end justify-center gap-1.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-primary)',
            height: active ? undefined : '12px',
            animation: active ? `bridge-wave 0.9s ease-in-out ${i * 0.12}s infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes bridge-wave {
          from { height: 12px; opacity: 0.45; }
          to { height: 48px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function statusLabel(phase) {
  if (phase === 'connecting') return 'Connecting...';
  if (phase === 'ai_speaking') return 'Bridge is listening...';
  if (phase === 'user_speaking') return 'Your turn...';
  if (phase === 'ended') return 'Conversation complete.';
  return 'Ready';
}

export default function MentorApplication() {
  const { user, loading: authLoading } = useAuth();
  const transcriptRef = useRef([]);
  const callTranscriptIdRef = useRef(crypto.randomUUID());
  const formRef = useRef(null);
  const endTimerRef = useRef(null);
  const endCallRef = useRef(() => {});

  const [screen, setScreen] = useState('loading');
  const [mentorStatus, setMentorStatus] = useState(null);
  const [form, setForm] = useState({ full_name: '', current_role: '', location: '', linkedin_url: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [starting, setStarting] = useState(false);

  const onEnded = useCallback(() => {
    if (endTimerRef.current) return;
    endTimerRef.current = window.setTimeout(() => {
      setScreen('confirmation');
    }, 1500);
  }, []);

  const realtime = useRealtimeCall({
    onAssistantTranscript: (text) => { transcriptRef.current.push({ role: 'assistant', text }); },
    onUserTranscript: (text) => { transcriptRef.current.push({ role: 'user', text }); },
    onToolComplete: (name) => { if (name === 'complete_application') endCallRef.current(); },
    onEnded,
  });

  endCallRef.current = realtime.endCall;

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    void (async () => {
      const [profileRow, userProfileRes] = await Promise.all([
        fetchOwnMentorProfileRow(user.id),
        supabase.from('user_profiles').select('personal_info').eq('user_id', user.id).maybeSingle(),
      ]);
      const userProfile = userProfileRes?.data ?? null;

      const status = profileRow?.mentor_status ?? null;
      setMentorStatus(status);

      if (status === 'pending' || status === 'under_review') {
        setScreen('pending');
        return;
      }
      if (status === 'active' || isMentorAccount(user)) {
        setScreen('redirect');
        return;
      }

      const personal = userProfile?.personal_info || {};
      setForm({
        full_name: personal.full_name || user.user_metadata?.full_name || '',
        current_role: profileRow?.title || '',
        location: personal.location || '',
        linkedin_url: '',
      });
      setScreen('intro');
    })();
  }, [authLoading, user]);

  useEffect(() => {
    if (screen !== 'confirmation') return undefined;
    formRef.current = { ...form };
    let cancelled = false;

    async function submit() {
      const payload = formRef.current;
      const transcript = transcriptRef.current;
      let summaryPayload = {};
      try {
        summaryPayload = await callAIProxy('mentor_application_summary', {
          transcript,
          full_name: payload.full_name,
          current_role: payload.current_role,
          location: payload.location,
        });
      } catch (err) {
        console.error('[MentorApplication] summary failed', err);
      }

      const body = {
        ...payload,
        linkedin_url: payload.linkedin_url || null,
        call_transcript_id: callTranscriptIdRef.current,
        transcript,
        summary: summaryPayload.summary || null,
        mentorship_description: summaryPayload.mentorship_description || null,
        why_i_mentor: summaryPayload.why_i_mentor || null,
      };

      const attempt = async () => submitMentorApplication(body);
      let result = await attempt();
      if (!result.ok) {
        await new Promise((r) => setTimeout(r, 800));
        result = await attempt();
        if (!result.ok) console.error('[MentorApplication] apply failed', result.error);
      }
      if (cancelled) return;
    }

    void submit();
    return () => { cancelled = true; };
  }, [screen, form]);

  if (authLoading || screen === 'loading') {
    return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login?redirect=/apply/mentor" replace />;
  }

  if (screen === 'redirect') {
    return <Navigate to="/dashboard" replace />;
  }

  if (screen === 'pending') {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Your application is being reviewed.
          </h1>
          <p className="mt-4 text-base" style={{ color: 'var(--bridge-text-secondary)' }}>
            We&apos;re working through applications and will be in touch soon.
          </p>
          {mentorStatus === 'under_review' && (
            <p className="mt-3 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
              Your application has moved to the next stage. We&apos;ll reach out directly.
            </p>
          )}
          <Link to="/dashboard" className="mt-8 inline-block text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            Back to your dashboard →
          </Link>
        </div>
      </main>
    );
  }

  if (screen === 'confirmation') {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        <div
          className="w-full max-w-lg rounded-3xl p-8 sm:p-10"
          style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
        >
          <CheckCircle2 className="mx-auto h-14 w-14" style={{ color: 'var(--color-success)' }} aria-hidden />
          <h1 className="mt-6 text-center font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Your application is in.
          </h1>
          <p className="mt-4 text-center text-base leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            We listened to your conversation and we&apos;ll read it carefully. You&apos;ll hear from us within a few days — usually sooner. We&apos;ll reach out to {user.email} with next steps.
          </p>
          <blockquote
            className="mt-6 border-l-2 pl-4 text-sm italic leading-relaxed"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--bridge-text-muted)' }}
          >
            Whatever happens — thank you for wanting to give your time to someone who needs it. That&apos;s not nothing.
          </blockquote>
          <ol className="mt-8 space-y-3 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
            <li>1. Our team reviews your conversation and application</li>
            <li>2. If it&apos;s a fit, we&apos;ll reach out personally to welcome you</li>
            <li>3. You&apos;ll set up your profile and go live</li>
          </ol>
          <Link to="/dashboard" className="mt-8 block text-center text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            Back to your dashboard →
          </Link>
        </div>
      </main>
    );
  }

  if (screen === 'call') {
    const active = realtime.phase === 'ai_speaking' || realtime.phase === 'user_speaking' || realtime.phase === 'connecting';
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
        <div
          className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
        >
          <Waveform active={active} />
          <p className="mt-6 text-sm font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
            {statusLabel(realtime.phase)}
          </p>
          {realtime.error && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-error, #ef4444)' }}>{realtime.error}</p>
          )}
          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={realtime.toggleMute}
              className="bridge-focus flex h-12 w-12 items-center justify-center rounded-full"
              style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text)' }}
              aria-label={realtime.muted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {realtime.muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { realtime.endCall(); setScreen('confirmation'); }}
            className="mt-6 text-sm font-medium underline underline-offset-2"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            End conversation
          </button>
        </div>
      </main>
    );
  }

  function validateIntro() {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = 'Required';
    if (!form.current_role.trim()) errors.current_role = 'Required';
    if (!form.location.trim()) errors.location = 'Required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleStartConversation() {
    setSubmitError('');
    if (!validateIntro()) return;
    setStarting(true);
    transcriptRef.current = [];
    callTranscriptIdRef.current = crypto.randomUUID();

    try {
      await realtime.startCall(async () => {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const res = await fetch('/api/realtime-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: 'mentor_application',
            full_name: form.full_name.trim(),
            current_role: form.current_role.trim(),
            location: form.location.trim(),
            linkedin_url: form.linkedin_url.trim() || '',
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || 'Failed to start conversation');
        }
        const data = await res.json();
        return data.client_secret?.value;
      });
      setScreen('call');
    } catch (err) {
      setSubmitError(err?.message ?? 'Could not start conversation');
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <div className="w-full max-w-lg">
        <p
          className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.28em]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          Mentor application
        </p>
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
        >
          <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Tell us about yourself
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
            So we know who we&apos;re speaking with before we start the conversation.
          </p>

          <div className="mt-6 space-y-4">
            {[
              { key: 'full_name', label: 'Full name', placeholder: 'Your full name' },
              { key: 'current_role', label: 'What do you do?', placeholder: 'e.g. Software engineer, stay-at-home parent, retired teacher, small business owner', max: 100 },
              { key: 'location', label: 'Location', placeholder: 'e.g. London, UK' },
            ].map(({ key, label, placeholder, max }) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--bridge-text)' }} htmlFor={key}>
                  {label}
                </label>
                <input
                  id={key}
                  type="text"
                  maxLength={max}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25"
                  style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
                />
                {fieldErrors[key] && <p className="mt-1 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>{fieldErrors[key]}</p>}
              </div>
            ))}
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--bridge-text)' }} htmlFor="linkedin_url">
                LinkedIn (optional)
              </label>
              <input
                id="linkedin_url"
                type="url"
                value={form.linkedin_url}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/you"
                className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25"
                style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Helpful for context, but not required.</p>
            </div>
          </div>

          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-xl px-4 py-3 text-xs font-medium"
            style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-muted)' }}
          >
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> About 5 minutes</span>
            <span className="inline-flex items-center gap-1.5"><Mic className="h-3.5 w-3.5" /> No prep needed</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Private &amp; confidential</span>
          </div>

          {submitError && (
            <p className="mt-4 text-sm" style={{ color: 'var(--color-error, #ef4444)' }}>{submitError}</p>
          )}

          <button
            type="button"
            disabled={starting}
            onClick={handleStartConversation}
            className="bridge-focus mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-bold disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            <Mic className="h-5 w-5" aria-hidden />
            {starting ? 'Connecting…' : 'Start Conversation'}
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
            Your microphone will activate. You&apos;ll be asked a few questions about your background and what you can help with.
          </p>
        </div>
      </div>
    </main>
  );
}
