// Timezone helpers — viewer-local rendering plus a secondary "their local time"
// line so a mentee in Istanbul can see what time the call is for a mentor in NY.

export function getViewerTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// Format a date in a given (or local) timezone.
export function formatInZone(date, { timeZone, withDate = true, withTz = true } = {}) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const opts = { hour: 'numeric', minute: '2-digit', timeZone };
  if (withTz) opts.timeZoneName = 'short';
  let timeStr = '';
  try {
    timeStr = new Intl.DateTimeFormat('en-US', opts).format(d);
  } catch {
    timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (!withDate) return timeStr;
  let dateStr = '';
  try {
    dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone }).format(d);
  } catch {
    dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return `${dateStr} · ${timeStr}`;
}

// Tells you whether two timezone strings actually map to the same offset *for the given date*.
export function zonesAreEquivalent(tzA, tzB, atDate = new Date()) {
  if (!tzA || !tzB) return false;
  if (tzA === tzB) return true;
  try {
    const f = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(atDate)
      .find((p) => p.type === 'timeZoneName')?.value || '';
    return f(tzA) === f(tzB);
  } catch {
    return false;
  }
}

// Compact friendly label for a timezone (e.g. "Istanbul", "New York").
export function shortZoneCity(tz) {
  if (!tz || tz === 'UTC') return 'UTC';
  const parts = String(tz).split('/');
  return (parts[parts.length - 1] || tz).replace(/_/g, ' ');
}
