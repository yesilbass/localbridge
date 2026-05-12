import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ExternalLink, AlertTriangle, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import {
  getCalendlyAuthUrl,
  getCalendlyEventTypes,
  selectCalendlyEventType,
  disconnectCalendly,
} from '../../api/calendly';
import supabase from '../../api/supabase';

function CardShell({ children }) {
  return (
    <div
      className="rounded-3xl p-7 sm:p-9"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      {children}
    </div>
  );
}

function StateNotConnected({ onConnect, busy, error }) {
  return (
    <CardShell>
      <p
        className="text-[10px] font-black uppercase tracking-[0.32em]"
        style={{ color: 'var(--color-primary)' }}
      >
        Availability
      </p>
      <h2
        className="font-display mt-2 font-black tracking-[-0.02em]"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--bridge-text)' }}
      >
        Connect your booking calendar.
      </h2>
      <p
        className="mt-3 max-w-xl text-sm leading-relaxed"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        Bridge uses Calendly so mentees can book real-time, conflict-free, in one click on your profile.
      </p>
      {error && (
        <p
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
            color: 'var(--color-error)',
          }}
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onConnect}
          disabled={busy}
          className="bridge-focus inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Opening Calendly…' : 'Connect Calendly →'}
        </button>
        <a
          href="/help"
          target="_blank"
          rel="noreferrer"
          className="bridge-focus text-sm font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          Why Calendly? →
        </a>
      </div>
    </CardShell>
  );
}

function EventTypeRow({ eventType, busy, onUse }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl p-4"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ color: 'var(--bridge-text)' }}>
          {eventType.name}
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {eventType.duration} min · {eventType.kind || 'Event type'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onUse(eventType)}
        disabled={busy}
        className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-bold"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          opacity: busy ? 0.5 : 1,
        }}
      >
        Use this →
      </button>
    </div>
  );
}

function StatePickEventType({ eventTypes, onSelect, onRefresh, busy, error, selectingUri }) {
  return (
    <CardShell>
      <p
        className="text-[10px] font-black uppercase tracking-[0.32em]"
        style={{ color: 'var(--color-primary)' }}
      >
        Step 2 of 2
      </p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <h2
          className="font-display font-black tracking-[-0.02em]"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--bridge-text)' }}
        >
          Pick the hour you sell on Bridge.
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={busy}
          aria-label="Refresh"
          className="bridge-focus inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden />
        </button>
      </div>
      <p
        className="mt-3 max-w-xl text-sm leading-relaxed"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        Choose the Calendly event type Bridge should embed on your public profile. Conflicts and buffers come from Calendly directly.
      </p>
      {error && (
        <p
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
            color: 'var(--color-error)',
          }}
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-2.5">
        {eventTypes.length === 0 ? (
          <div
            className="rounded-2xl p-5 text-sm"
            style={{
              backgroundColor: 'var(--bridge-surface-muted)',
              color: 'var(--bridge-text-secondary)',
            }}
          >
            No active event types found in your Calendly account.
          </div>
        ) : (
          eventTypes.map((e) => (
            <EventTypeRow
              key={e.uri}
              eventType={e}
              busy={selectingUri === e.uri}
              onUse={onSelect}
            />
          ))
        )}
      </div>
      <p className="mt-5 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
        Don't see one?{' '}
        <a
          href="https://calendly.com/event_types"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--color-primary)' }}
        >
          Create it in Calendly →
        </a>
      </p>
    </CardShell>
  );
}

function StateConfigured({ profile, onChange, onDisconnect, busy }) {
  return (
    <CardShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-success)' }}
          >
            Booking calendar live
          </p>
          <h2
            className="font-display mt-2 font-black tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--bridge-text)' }}
          >
            Mentees can book you now.
          </h2>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            color: 'var(--color-success)',
          }}
        >
          <Check className="h-3.5 w-3.5" aria-hidden /> Connected
        </span>
      </div>

      <div
        className="mt-6 grid gap-4 rounded-2xl p-5 sm:grid-cols-[auto_1fr]"
        style={{
          backgroundColor: 'var(--bridge-surface-muted)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            Event type
          </p>
          <p className="mt-1 text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {profile.calendly_event_type_name || 'Selected event type'}
          </p>
        </div>
        <div className="sm:text-right">
          <p
            className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            Public scheduling URL
          </p>
          <a
            href={profile.calendly_scheduling_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 break-all text-[13px] font-mono"
            style={{ color: 'var(--color-primary)' }}
          >
            {profile.calendly_scheduling_url}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onChange}
          disabled={busy}
          className="bridge-focus inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            color: 'var(--bridge-text-secondary)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          Change event type
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          disabled={busy}
          className="bridge-focus inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-error)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-error) 35%, transparent)',
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {busy ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>
    </CardShell>
  );
}

export default function MentorAvailabilityPanel({ mentorProfileId, reloadKey, onSaved }) {
  const [profile, setProfile] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | no_profile | not_connected | pick | configured
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [selectingUri, setSelectingUri] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const refresh = useCallback(async () => {
    if (!mentorProfileId) {
      setError(null);
      setEventTypes([]);
      setProfile(null);
      setPhase('no_profile');
      return;
    }
    setError(null);
    const { data, error: profileError } = await supabase
      .from('mentor_profiles')
      .select('id, calendly_connected, calendly_event_type_uri, calendly_scheduling_url')
      .eq('id', mentorProfileId)
      .maybeSingle();
    if (profileError) {
      const msg = profileError.message ?? 'Could not load profile';
      const missingColumn = /column .* does not exist/i.test(msg) || profileError.code === '42703';
      setError(
        missingColumn
          ? 'Calendly database migration has not been applied yet. Run supabase/migrations/20261108000000_calendly_migration.sql.'
          : msg,
      );
      setProfile(null);
      setEventTypes([]);
      setPhase('not_connected');
      return;
    }
    setProfile(data);
    if (!data?.calendly_connected) {
      setEventTypes([]);
      setPhase('not_connected');
      return;
    }
    if (data.calendly_event_type_uri) {
      setPhase('configured');
      return;
    }
    setBusy(true);
    const res = await getCalendlyEventTypes(mentorProfileId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'Could not load event types');
      setPhase('pick');
      return;
    }
    setEventTypes(res.event_types);
    setPhase('pick');
  }, [mentorProfileId]);

  useEffect(() => { refresh(); }, [refresh, reloadKey]);

  // Surface OAuth callback status from query string
  useEffect(() => {
    const status = searchParams.get('calendly');
    if (!status) return;
    if (status === 'error') setError('Could not connect Calendly. Try again.');
    const next = new URLSearchParams(searchParams);
    next.delete('calendly');
    next.delete('reason');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleConnect() {
    if (!mentorProfileId) return;
    setBusy(true); setError(null);
    try {
      const url = await getCalendlyAuthUrl(mentorProfileId);
      window.location.href = url;
    } catch (e) {
      setError(e?.message || 'Could not start Calendly authorization');
      setBusy(false);
    }
  }

  async function handleSelect(eventType) {
    if (!mentorProfileId) return;
    setSelectingUri(eventType.uri); setError(null);
    const res = await selectCalendlyEventType(mentorProfileId, eventType.uri);
    setSelectingUri(null);
    if (!res.ok) {
      setError(res.error || 'Could not save selection');
      return;
    }
    setProfile((prev) => prev ? {
      ...prev,
      calendly_event_type_uri: res.event_type.uri,
      calendly_event_type_name: res.event_type.name,
      calendly_scheduling_url: res.event_type.scheduling_url,
    } : prev);
    setPhase('configured');
    onSaved?.();
  }

  async function handleChangeEventType() {
    if (!mentorProfileId) return;
    setBusy(true); setError(null);
    const res = await getCalendlyEventTypes(mentorProfileId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'Could not load event types');
      return;
    }
    setEventTypes(res.event_types);
    setPhase('pick');
  }

  async function handleDisconnect() {
    if (!mentorProfileId) return;
    setBusy(true); setError(null);
    const res = await disconnectCalendly(mentorProfileId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'Could not disconnect Calendly');
      return;
    }
    setEventTypes([]);
    setProfile((prev) => prev ? {
      ...prev,
      calendly_connected: false,
      calendly_event_type_uri: null,
      calendly_scheduling_url: null,
    } : prev);
    setPhase('not_connected');
    onSaved?.();
  }

  if (phase === 'idle') {
    return (
      <CardShell>
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Availability
        </p>
        <p className="mt-4 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
          Loading your booking calendar…
        </p>
      </CardShell>
    );
  }

  if (phase === 'no_profile') {
    return (
      <CardShell>
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Availability
        </p>
        <h2
          className="font-display mt-2 font-black tracking-[-0.02em]"
          style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', color: 'var(--bridge-text)' }}
        >
          Finish onboarding to set availability.
        </h2>
        <p
          className="mt-3 max-w-xl text-sm leading-relaxed"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          Your mentor profile isn't ready yet. Complete onboarding to publish your hours and start accepting bookings.
        </p>
        <Link
          to="/onboarding"
          className="bridge-focus mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
          }}
        >
          Finish onboarding <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </CardShell>
    );
  }

  if (phase === 'not_connected') {
    return <StateNotConnected onConnect={handleConnect} busy={busy} error={error} />;
  }

  if (phase === 'pick') {
    return (
      <StatePickEventType
        eventTypes={eventTypes}
        onSelect={handleSelect}
        onRefresh={handleChangeEventType}
        busy={busy}
        error={error}
        selectingUri={selectingUri}
      />
    );
  }

  return (
    <StateConfigured
      profile={profile || {}}
      onChange={handleChangeEventType}
      onDisconnect={handleDisconnect}
      busy={busy}
    />
  );
}
