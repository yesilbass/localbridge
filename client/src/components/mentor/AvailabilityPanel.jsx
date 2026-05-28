import { getAvailabilityDateParts, formatAvailabilityLead } from '../../utils/mentorDisplay';

export default function AvailabilityPanel({
  availability,
  nextAvailableIso,
  availStyle,
  context = 'browse',
  size = 'md',
}) {
  const dateParts = nextAvailableIso ? getAvailabilityDateParts(nextAvailableIso) : null;
  const lead = nextAvailableIso ? formatAvailabilityLead(nextAvailableIso) : null;
  const isLg = size === 'lg';

  const subline = availability.loading
    ? 'Checking their connected calendar…'
    : dateParts
    ? (context === 'profile' ? 'Pick a time that works for you.' : 'Pick a time that works — booking is free.')
    : availability.tone === 'muted'
    ? 'Try another mentor or save this one for later.'
    : context === 'profile'
    ? 'Request a time from their profile.'
    : 'Open their profile to request a time.';

  return (
    <div className={isLg ? 'py-1' : 'py-0.5'}>
      <div className={`flex flex-wrap items-center gap-2 ${isLg ? 'mb-4' : ''}`}>
        <p className={`font-bold text-[var(--bridge-text)] ${isLg ? 'text-base' : 'text-[14px]'}`}>
          {availability.headline}
        </p>
        {isLg && lead && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface))',
              color: 'var(--color-primary)',
            }}
          >
            {lead}
          </span>
        )}
      </div>
      <div className={`flex items-start ${isLg ? 'gap-4' : 'gap-3'} ${dateParts ? '' : 'flex-col'}`}>
        {dateParts && (
          <div
            className={`flex shrink-0 flex-col items-center rounded-xl text-center leading-none ${isLg ? 'px-4 py-3' : 'px-3 py-2'}`}
            style={{
              backgroundColor: availStyle.bg,
              boxShadow: `inset 0 0 0 1px ${availStyle.border}`,
            }}
          >
            <span
              className={`font-bold tracking-wide ${isLg ? 'text-xs' : 'text-[11px]'}`}
              style={{ color: availStyle.color }}
            >
              {dateParts.dow}
            </span>
            <span
              className={`mt-1 font-black tabular-nums text-[var(--bridge-text)] ${isLg ? 'text-3xl' : 'text-2xl'}`}
            >
              {dateParts.day}
            </span>
            <span
              className={`mt-0.5 font-semibold text-[var(--bridge-text-muted)] ${isLg ? 'text-xs' : 'text-[11px]'}`}
            >
              {dateParts.mon}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p
            className={`font-semibold leading-snug text-[var(--bridge-text)] ${isLg ? 'text-lg' : 'text-[15px]'} ${availability.loading ? 'animate-pulse' : ''}`}
          >
            {dateParts ? dateParts.time : availability.detail}
          </p>
          {!availability.loading && (
            <p className={`mt-1.5 leading-snug text-[var(--bridge-text-muted)] ${isLg ? 'text-sm' : 'text-[12px]'}`}>
              {subline}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
