import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useAuth } from '../../../context/useAuth.js';
import {
  useNextSession,
  useSavedMentors,
  useAvailabilityToggle,
  useLiveCountdown,
} from '../dashboardHooks.js';
import { isMentorAccount } from '../../../utils/accountRole';
import { usePerfTier } from '../../landing/landingHooks';

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function firstNameOf(user) {
  const name = user?.user_metadata?.full_name?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0];
}

function tzAbbr() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

function formatCountdown(scheduledAt, now) {
  const delta = new Date(scheduledAt).getTime() - now;
  if (delta <= 0) return 'live now';
  const mins = Math.floor(delta / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins - hours * 60;
  return rem > 0 ? `in ${hours}h ${rem}m` : `in ${hours}h`;
}

function formatNowDate(d) {
  const day = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${date} · ${time}`;
}

export default function HomeHeader({ activeRole }) {
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  const { session } = useNextSession();
  const isMentor = activeRole === 'mentor' || (user ? isMentorAccount(user) : false);
  const { isAvailable } = useAvailabilityToggle();
  const { total: savedTotal } = useSavedMentors({ limit: 1 });

  const now = useLiveCountdown(session?.scheduledAt);

  // Stable mount-time clock — keeps render pure and good enough for the framing.
  const [mountDate] = useState(() => new Date());

  const firstName = firstNameOf(user);
  const greeting = getGreeting(mountDate.getHours());

  let subline;
  if (session) {
    const delta = new Date(session.scheduledAt).getTime() - now;
    if (delta <= 0 && delta > -30 * 60 * 1000) {
      subline = 'You have a session live right now.';
    } else if (delta > 0 && delta <= 60 * 60 * 1000) {
      subline = `Your next session starts ${formatCountdown(session.scheduledAt, now)}.`;
    }
  }
  if (!subline) {
    if (isMentor && !isAvailable) {
      subline = 'Your mentor profile is hidden until you set hours.';
    } else if (!isMentor && savedTotal === 0) {
      subline = 'Browse mentors and save the ones you want to talk to.';
    } else {
      subline = formatNowDate(mountDate);
    }
  }

  const headlineText = firstName ? `${greeting}, ${firstName}.` : 'Welcome back.';
  const enterClass = flat ? '' : 'animate-page-enter';

  return (
    <header
      aria-labelledby="home-greeting"
      className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0">
        <h1
          id="home-greeting"
          className={`font-display font-black ${enterClass}`}
          style={{
            fontSize: 'clamp(28px, 3.4vw, 40px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: 'var(--bridge-text)',
          }}
        >
          {headlineText}
        </h1>
        <p
          className={`mt-1 text-[14px] ${enterClass}`}
          style={{
            color: 'var(--bridge-text-secondary)',
            lineHeight: 1.5,
            animationDelay: flat ? undefined : '60ms',
          }}
        >
          {subline}
        </p>
      </div>

      <span
        aria-hidden
        className="hidden shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] lg:inline-flex"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          color: 'var(--bridge-text-muted)',
        }}
      >
        {isMentor ? 'Mentor' : 'Mentee'}
        <span style={{ color: 'var(--bridge-text-faint)' }}>·</span>
        <span className="tabular-nums">{tzAbbr()}</span>
      </span>
    </header>
  );
}
