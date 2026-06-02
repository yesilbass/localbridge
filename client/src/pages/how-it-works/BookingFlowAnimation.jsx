import { useEffect, useReducer, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Mic, Video, PhoneOff } from 'lucide-react';

const SLOTS = [
  { id: 0, day: 'Tue, Jun 3', time: '3:00 PM' },
  { id: 1, day: 'Wed, Jun 4', time: '10:30 AM' },
  { id: 2, day: 'Thu, Jun 5', time: '2:00 PM' },
  { id: 3, day: 'Fri, Jun 6', time: '9:00 AM' },
];

const SELECTED_SLOT = SLOTS[1];
const MENTOR = { initials: 'SR', name: 'Sasha R.', role: 'Senior PM · Google' };

// Frame durations in ms
const FRAME_HOLD = 3200;
const SLOT_SELECT_DELAY = 1400;
const TRANSITION_MS = 550;

function useAnimationLoop(frameCount, reducedMotion) {
  const [state, dispatch] = useReducer(
    (s, action) => {
      if (action.type === 'HIGHLIGHT') return { ...s, highlighted: action.id };
      if (action.type === 'SELECT') return { ...s, selected: action.id };
      if (action.type === 'FRAME') return { frame: action.frame, highlighted: null, selected: null };
      return s;
    },
    { frame: 0, highlighted: null, selected: null }
  );

  const timers = useRef([]);

  useEffect(() => {
    if (reducedMotion) return;

    const clear = () => timers.current.forEach(clearTimeout);
    clear();
    timers.current = [];

    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    const runCycle = () => {
      // Frame 0: calendar
      dispatch({ type: 'FRAME', frame: 0 });
      schedule(() => dispatch({ type: 'HIGHLIGHT', id: SELECTED_SLOT.id }), SLOT_SELECT_DELAY);
      schedule(() => dispatch({ type: 'SELECT', id: SELECTED_SLOT.id }), SLOT_SELECT_DELAY + 700);
      // Frame 1: confirmation
      schedule(() => dispatch({ type: 'FRAME', frame: 1 }), FRAME_HOLD + SLOT_SELECT_DELAY + 700);
      // Frame 2: video call
      schedule(
        () => dispatch({ type: 'FRAME', frame: 2 }),
        FRAME_HOLD * 2 + SLOT_SELECT_DELAY + 700
      );
      // Restart
      schedule(runCycle, FRAME_HOLD * 3 + SLOT_SELECT_DELAY + 700 + TRANSITION_MS);
    };

    runCycle();
    return clear;
  }, [reducedMotion]);

  return state;
}

function InitialsAvatar({ initials, size = 'sm' }) {
  const sz = size === 'lg' ? 'h-11 w-11 text-base' : 'h-8 w-8 text-xs';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 ${sz}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
        color: 'var(--color-primary)',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)',
      }}
    >
      {initials}
    </span>
  );
}

function FrameCalendar({ highlighted, selected }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3 mb-1">
        <InitialsAvatar initials={MENTOR.initials} />
        <div>
          <p className="text-[13px] font-semibold leading-none text-[var(--bridge-text)]">{MENTOR.name}</p>
          <p className="mt-0.5 text-[11px] text-[var(--bridge-text-muted)]">{MENTOR.role}</p>
        </div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] mb-1">
        Available slots
      </p>
      {SLOTS.map((slot) => {
        const isHighlighted = highlighted === slot.id;
        const isSelected = selected === slot.id;
        return (
          <motion.div
            key={slot.id}
            animate={{
              borderColor: isSelected
                ? 'var(--color-primary)'
                : isHighlighted
                ? 'color-mix(in srgb, var(--color-primary) 55%, transparent)'
                : 'var(--bridge-border)',
              backgroundColor: isSelected
                ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                : 'transparent',
            }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between rounded-xl px-4 py-3 border"
            style={{ borderColor: 'var(--bridge-border)' }}
          >
            <span className="text-[13px] font-semibold text-[var(--bridge-text)]">{slot.day}</span>
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{
                color: isSelected || isHighlighted ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
              }}
            >
              {slot.time}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function FrameConfirmation() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full py-6 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 16%, transparent)',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)',
        }}
      >
        <Check className="h-7 w-7" style={{ color: 'var(--color-primary)' }} aria-hidden />
      </span>
      <div>
        <p className="text-xl font-black tracking-[-0.02em] text-[var(--bridge-text)]">Session booked</p>
        <p className="mt-2 text-[15px] font-semibold text-[var(--bridge-text-secondary)]">
          {SELECTED_SLOT.day} · {SELECTED_SLOT.time}
        </p>
        <p className="mt-1 text-[13px] text-[var(--bridge-text-muted)]">Added to your calendar</p>
      </div>
      <div className="mt-2 flex items-center gap-2.5 rounded-full px-4 py-2" style={{ backgroundColor: 'var(--bridge-canvas)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
        <InitialsAvatar initials={MENTOR.initials} size="sm" />
        <span className="text-[13px] font-semibold text-[var(--bridge-text)]">{MENTOR.name}</span>
      </div>
    </div>
  );
}

function VideoTile({ label, isMentor }) {
  return (
    <div
      className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-3 py-8"
      style={{
        backgroundColor: 'var(--bridge-canvas)',
        boxShadow: isMentor
          ? `inset 0 0 0 2px var(--color-primary)`
          : 'inset 0 0 0 1px var(--bridge-border)',
        minHeight: 140,
      }}
    >
      <InitialsAvatar initials={isMentor ? MENTOR.initials : 'YO'} size="lg" />
      <span className="text-[12px] font-semibold text-[var(--bridge-text-secondary)]">
        {isMentor ? MENTOR.name.split(' ')[0] : 'You'}
      </span>
    </div>
  );
}

function FrameVideoCall() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] text-center">
        Bridge Video
      </p>
      <div className="flex gap-3">
        <VideoTile label="You" isMentor={false} />
        <VideoTile label={MENTOR.name.split(' ')[0]} isMentor />
      </div>
      <div className="flex items-center justify-center gap-3 mt-1">
        {[
          { Icon: Mic, label: 'Mic' },
          { Icon: Video, label: 'Camera' },
          { Icon: PhoneOff, label: 'Leave', danger: true },
        ].map(({ Icon, label, danger }) => (
          <button
            key={label}
            aria-label={label}
            tabIndex={-1}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: danger
                ? 'color-mix(in srgb, #ef4444 16%, transparent)'
                : 'var(--bridge-surface-muted, var(--bridge-canvas))',
              boxShadow: danger
                ? 'inset 0 0 0 1px color-mix(in srgb, #ef4444 40%, transparent)'
                : 'inset 0 0 0 1px var(--bridge-border)',
              color: danger ? '#ef4444' : 'var(--bridge-text-secondary)',
            }}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}

const FRAMES = [FrameCalendar, FrameConfirmation, FrameVideoCall];

export default function BookingFlowAnimation() {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { frame, highlighted, selected } = useAnimationLoop(3, reducedMotion);

  const activeFrame = reducedMotion ? 1 : frame;
  const FrameComponent = FRAMES[activeFrame];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[2rem] px-7 py-8 sm:px-9 sm:py-9"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow:
          'inset 0 0 0 1px var(--bridge-border), 0 32px 80px -32px color-mix(in srgb, var(--color-primary) 30%, transparent)',
        minHeight: 380,
      }}
      aria-label="Booking flow preview"
      aria-live="polite"
    >
      {/* top edge accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
          opacity: 0.4,
        }}
      />

      {/* step dots */}
      <div className="flex justify-center gap-2 mb-7">
        {FRAMES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: activeFrame === i ? '1.5rem' : '0.375rem',
              backgroundColor:
                activeFrame === i
                  ? 'var(--color-primary)'
                  : 'var(--bridge-border)',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFrame}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          {activeFrame === 0 ? (
            <FrameCalendar highlighted={highlighted} selected={selected} />
          ) : activeFrame === 1 ? (
            <FrameConfirmation />
          ) : (
            <FrameVideoCall />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
