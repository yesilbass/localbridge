import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import { ArrowRight, Search, Clock, UserRound } from 'lucide-react';
import { useAuth } from '../../../context/useAuth.js';
import {
  useNextSession,
  useAvailabilityToggle,
  useLiveCountdown,
  useProfileHealth,
} from '../dashboardHooks.js';
import { isMentorAccount } from '../../../utils/accountRole';
import { usePerfTier } from '../../landing/landingHooks';
import { useContent } from '../../../content';

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

function PrimaryAction({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="bridge-focus inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-on-primary, #fff)',
        boxShadow: '0 14px 32px -10px color-mix(in srgb, var(--color-primary) 55%, transparent)',
      }}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
      <span className="truncate">{children}</span>
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}

export default function HomeHeader({ activeRole }) {
  const { s } = useContent();
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  const { session } = useNextSession();
  const isMentor = activeRole === 'mentor' || (user ? isMentorAccount(user) : false);
  const { isAvailable } = useAvailabilityToggle();
  const { score: profileScore } = useProfileHealth();

  const now = useLiveCountdown(session?.scheduledAt);

  // Stable mount-time clock — keeps render pure and good enough for the framing.
  const [mountDate] = useState(() => new Date());

  const firstName = firstNameOf(user);
  const greeting = getGreeting(mountDate.getHours());

  let subline;
  // Only compute live/upcoming subline when the session has an actual scheduled
  // time. Otherwise `new Date(null)` resolves to the Unix epoch and the math
  // becomes nonsense — the famous "1969" bug.
  if (session?.scheduledAt) {
    const delta = new Date(session.scheduledAt).getTime() - now;
    if (delta <= 0 && delta > -30 * 60 * 1000) {
      subline = s.dashboard.sessionLiveNow;
    } else if (delta > 0 && delta <= 60 * 60 * 1000) {
      subline = s.dashboard.sessionStartsSoon.replace('{countdown}', formatCountdown(session.scheduledAt, now));
    }
  } else if (session && !isMentor) {
    // Mentee booked but Calendly slot not yet picked.
    subline = s.dashboard.bookingWaiting;
  }
  if (!subline) {
    if (isMentor && !isAvailable) {
      subline = s.dashboard.openHours;
    } else if (isMentor) {
      subline = formatNowDate(mountDate);
    } else {
      subline = s.dashboard.readyToBook;
    }
  }

  const headlineText = firstName ? `${greeting}, ${firstName}.` : s.dashboard.welcome;
  const enterClass = flat ? '' : 'animate-page-enter';

  // Single primary action per role.
  let action;
  if (isMentor) {
    if (profileScore < 60) {
      action = <PrimaryAction to="/dashboard/profile" icon={UserRound}>{s.dashboard.openProfile}</PrimaryAction>;
    } else {
      action = <PrimaryAction to="/dashboard/availability" icon={Clock}>{s.dashboard.setAvailability}</PrimaryAction>;
    }
  } else {
    action = <PrimaryAction to="/dashboard/mentors" icon={Search}>{s.dashboard.browseMentors}</PrimaryAction>;
  }

  return (
    <header
      aria-labelledby="home-greeting"
      className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1
          id="home-greeting"
          className={`truncate font-display font-black ${enterClass}`}
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
          className={`mt-1 truncate text-[14px] ${enterClass}`}
          style={{
            color: 'var(--bridge-text-secondary)',
            lineHeight: 1.5,
            animationDelay: flat ? undefined : '60ms',
          }}
        >
          {subline}
        </p>
      </div>
      {action}
    </header>
  );
}
