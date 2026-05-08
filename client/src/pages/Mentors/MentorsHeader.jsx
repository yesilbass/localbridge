import { useRef, useState, useEffect } from 'react';

export default function MentorsHeader({ total }) {
  const [onlineCount] = useState(() => Math.floor(47 + Math.random() * 8));
  const bookingsToday = 218;

  return (
    <header
      className="pt-16 pb-6 lg:pt-20 lg:pb-8"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1
              id="mentors-heading"
              className="font-display font-black leading-none tracking-[-0.025em]"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
                color: 'var(--bridge-text)',
              }}
            >
              Find your operator
            </h1>
            <p
              className="max-w-xl text-[15px] sm:text-[16px]"
              style={{
                color: 'var(--bridge-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              2,400+ vetted mentors. Real role, real company, real outcomes.
              Booked in seconds — every rate visible upfront.
            </p>
          </div>

          <div className="flex flex-row items-center gap-5 sm:gap-6 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft"
                aria-hidden
              />
              <span
                className="text-[12px] font-semibold tabular-nums"
                style={{ color: 'var(--bridge-text)' }}
              >
                {onlineCount} online now
              </span>
            </div>

            <span
              className="hidden sm:block text-[12px] tabular-nums"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {bookingsToday} booked today
            </span>

            <span
              className="hidden sm:block text-[12px]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              Avg session: 1 hour
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
