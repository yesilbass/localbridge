import { useState } from 'react';
import { Heart, Share, Calendar } from 'lucide-react';
import { formatSlotRelative, formatSlotTime } from './profileHooks';

function SlotCard({ slot, isSelected, onSelect, isEmpty }) {
  if (isEmpty) {
    return (
      <div
        className="rounded-xl px-3 py-2.5 text-center"
        style={{
          background: 'transparent',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          fontSize: '12px',
          color: 'var(--bridge-text-faint)',
        }}
      >
        Times open up weekly
      </div>
    );
  }

  const { weekday, time } = formatSlotTime(slot.date, slot.time);
  const relative = formatSlotRelative(slot.date);

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className="rounded-xl px-3 py-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: isSelected
          ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
          : 'var(--bridge-surface-muted)',
        boxShadow: isSelected
          ? 'inset 0 0 0 2px var(--color-primary)'
          : 'inset 0 0 0 1px var(--bridge-border)',
        outlineColor: 'var(--color-primary)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
          e.currentTarget.style.transform = '';
        }
      }}
    >
      <p
        className="font-bold tabular-nums"
        style={{ fontSize: '13px', color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}
      >
        {weekday} {time}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--bridge-text-muted)', marginTop: '1px' }}>
        {relative}
      </p>
    </button>
  );
}

export default function BookingWidget({
  mentor,
  slots,
  isLoading,
  recentBookings,
  isFavorited,
  onToggleFavorite,
  onShare,
  shareCopied,
  mode,
  compact,
  onBook,
  onOpenDrawer,
}) {
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  const rate = mentor?.rate ?? mentor?.session_rate ?? null;
  const selectedSlot = slots?.find((s) => s.id === selectedSlotId) ?? null;

  const visibleSlots = compact ? slots?.slice(0, 2) : slots?.slice(0, 4);
  const gridSlots = visibleSlots ?? [];
  const maxSlots = compact ? 2 : 4;
  const emptyCount = Math.max(0, maxSlots - gridSlots.length);

  function handleBook() {
    if (onBook) onBook(selectedSlot);
  }

  const ctaLabel = selectedSlot
    ? `Book ${formatSlotTime(selectedSlot.date, selectedSlot.time).weekday} ${formatSlotTime(selectedSlot.date, selectedSlot.time).time}`
    : 'Book a session';

  if (isLoading) {
    return (
      <div
        className="rounded-3xl p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 24px -8px rgba(0,0,0,0.12)',
        }}
        aria-label="Book a session"
      >
        <div className="bridge-skeleton h-10 w-24 rounded-lg mb-2" />
        <div className="bridge-skeleton h-4 w-48 rounded mb-6" />
        <div className="bridge-skeleton h-4 w-32 rounded mb-3" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bridge-skeleton h-14 rounded-xl" />
          ))}
        </div>
        <div className="bridge-skeleton h-12 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl p-6"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 24px -8px rgba(0,0,0,0.12)',
      }}
      aria-label="Book a session"
    >
      {/* Rate row */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-display font-black tabular-nums"
          style={{
            fontSize: compact ? '28px' : 'clamp(2.25rem, 4vw, 2.75rem)',
            color: 'var(--bridge-text)',
            letterSpacing: '-0.025em',
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          {rate != null ? `$${rate}` : 'Free'}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--bridge-text-muted)' }}>/session</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--bridge-text-muted)', marginTop: '4px' }}>
        60 minutes · Video · Notes follow-up
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--bridge-border)', margin: '20px 0' }} />

      {/* Next available */}
      {!compact && (
        <>
          <p
            className="font-bold uppercase mb-3"
            style={{ fontSize: '11px', letterSpacing: '0.22em', color: 'var(--bridge-text-muted)' }}
          >
            Next available
          </p>

          {slots?.length === 0 ? (
            <div className="text-center py-4">
              <p style={{ fontSize: '13px', color: 'var(--bridge-text-secondary)' }}>
                No open times in the next two weeks.
              </p>
              <a
                href={`/contact?mentor=${mentor?.id}`}
                className="mt-2 inline-block font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ fontSize: '13px', color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
              >
                Request a time →
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {gridSlots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={() => setSelectedSlotId((prev) => (prev === slot.id ? null : slot.id))}
                  />
                ))}
                {Array.from({ length: emptyCount }).map((_, i) => (
                  <SlotCard key={`empty-${i}`} isEmpty />
                ))}
              </div>

              <button
                type="button"
                aria-expanded={isCalendarExpanded}
                onClick={() => setIsCalendarExpanded((v) => !v)}
                className="inline-flex items-center gap-1 mt-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ fontSize: '12px', color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                {isCalendarExpanded ? 'Hide calendar' : 'See all times →'}
              </button>

              {isCalendarExpanded && (
                <p className="mt-2 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
                  Select a session type below to see the full calendar.
                </p>
              )}
            </>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--bridge-border)', margin: '20px 0' }} />
        </>
      )}

      {/* Primary CTA */}
      <button
        type="button"
        onClick={mode === 'drawer' || !onOpenDrawer ? handleBook : () => onOpenDrawer?.() ?? handleBook()}
        aria-label={selectedSlot
          ? `Book ${formatSlotTime(selectedSlot.date, selectedSlot.time).weekday} ${formatSlotTime(selectedSlot.date, selectedSlot.time).time}`
          : 'Choose an available time'}
        className="w-full py-3 rounded-xl font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontSize: '14px',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          outlineColor: 'var(--color-primary)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px -6px color-mix(in srgb, var(--color-primary) 55%, transparent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      >
        {ctaLabel}
      </button>

      {/* Secondary affordances */}
      {!compact && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            aria-pressed={isFavorited}
            aria-label="Save mentor"
            onClick={onToggleFavorite}
            className="inline-flex items-center gap-1.5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontSize: '12px',
              color: isFavorited ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
              outlineColor: 'var(--color-primary)',
            }}
          >
            <Heart
              className="h-4 w-4"
              style={{ fill: isFavorited ? 'currentColor' : 'none' }}
              aria-hidden
            />
            {isFavorited ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontSize: '12px',
              color: 'var(--bridge-text-secondary)',
              outlineColor: 'var(--color-primary)',
            }}
          >
            <Share className="h-4 w-4" aria-hidden />
            {shareCopied ? 'Copied' : 'Share'}
          </button>
        </div>
      )}

      {/* Trust line */}
      {!compact && recentBookings >= 3 && (
        <div
          className="mt-5 pt-4 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--bridge-border)' }}
        >
          <span
            className="bridge-pulse h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: '#10b981', display: 'inline-block' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--bridge-text-secondary)' }}>
            {recentBookings} sessions booked in the last 30 days
          </p>
        </div>
      )}
    </div>
  );
}
