/** Classify mentor expertise tags + availability labels for browse cards & profiles. */

const TOOL_NAMES = new Set([
  'javascript', 'typescript', 'python', 'java', 'go', 'golang', 'rust', 'ruby', 'php', 'sql',
  'react', 'node.js', 'nodejs', 'node', 'vue', 'angular', 'next.js', 'nextjs', 'html', 'css',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'git', 'github',
  'figma', 'sketch', 'framer',
  'excel', 'tableau', 'looker', 'power bi', 'powerbi',
  'google analytics', 'google ads', 'facebook ads', 'meta ads', 'hubspot', 'salesforce', 'stripe',
  'klaviyo', 'mailchimp', 'intercom', 'amplitude', 'mixpanel', 'segment',
  'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'bigquery', 'snowflake', 'databricks',
  'jira', 'notion', 'slack', 'linear',
  'swift', 'kotlin', 'flutter', 'react native',
  'machine learning', 'tensorflow', 'pytorch',
]);

const TOOL_ALIASES = {
  'full stack development': null,
  'agile methodologies': null,
};

function normalizeTag(tag) {
  return String(tag ?? '').trim();
}

function isToolTag(tag) {
  const lower = normalizeTag(tag).toLowerCase();
  if (!lower) return false;
  if (TOOL_ALIASES[lower] === null) return false;
  if (TOOL_NAMES.has(lower)) return true;
  return /\b(vue|react|node|sql|aws|figma|analytics|ads|salesforce|hubspot)\b/i.test(lower);
}

function formatIndustry(industry) {
  if (!industry) return null;
  return industry.charAt(0).toUpperCase() + industry.slice(1);
}

/**
 * Split mentor.expertise into expertise skills, industry, and tools (GrowthMentor-style groups).
 */
export function groupMentorTags(mentor) {
  const raw = Array.isArray(mentor?.expertise) ? mentor.expertise.map(normalizeTag).filter(Boolean) : [];
  const industryLabel = formatIndustry(mentor?.industry);

  const tools = [];
  const expertise = [];

  for (const tag of raw) {
    if (isToolTag(tag)) tools.push(tag);
    else expertise.push(tag);
  }

  const industry = industryLabel ? [industryLabel] : [];

  return {
    expertise,
    industry,
    tools,
    hasAny: expertise.length > 0 || industry.length > 0 || tools.length > 0,
  };
}

export function formatNextAvailableSlot(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Open profile to book';

  const now = new Date();
  const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  const fmtDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  if (d.toDateString() === now.toDateString()) {
    return `Today · ${fmtTime.format(d)}`;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow · ${fmtTime.format(d)}`;
  }

  return `${fmtDate.format(d)} · ${fmtTime.format(d)}`;
}

/** Date chip parts for browse-card availability blocks. */
export function getAvailabilityDateParts(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    dow: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d).toUpperCase(),
    day: String(d.getDate()),
    mon: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(d).toUpperCase(),
    time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(d),
  };
}

function mentorHasCalendly(mentor) {
  return Boolean(mentor?.calendly_connected && mentor?.calendly_event_type_uri);
}

/**
 * Availability copy for browse cards.
 * @param {object} mentor
 * @param {string|null|undefined} nextAvailableIso — undefined = Calendly fetch pending
 */
export function getNextAvailability(mentor, nextAvailableIso) {
  if (mentor?.available === false) {
    return { headline: 'Availability', detail: 'Not accepting sessions', tone: 'muted' };
  }

  if (mentorHasCalendly(mentor)) {
    if (nextAvailableIso === undefined) {
      return { headline: 'Next availability', detail: 'Loading calendar…', tone: 'live', loading: true };
    }
    if (nextAvailableIso) {
      return {
        headline: 'Next availability',
        detail: formatNextAvailableSlot(nextAvailableIso),
        tone: 'live',
      };
    }
    return { headline: 'Next availability', detail: 'No openings in the next 7 days', tone: 'muted' };
  }

  if (mentor?.available !== false) {
    return { headline: 'Next availability', detail: 'Request a time on their profile', tone: 'open' };
  }

  return { headline: 'Availability', detail: 'Check profile for times', tone: 'muted' };
}

const TONE_STYLES = {
  live: {
    color: 'var(--color-primary)',
    bg: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))',
    border: 'color-mix(in srgb, var(--color-primary) 28%, var(--bridge-border))',
  },
  open: {
    color: 'var(--color-success, #059669)',
    bg: 'color-mix(in srgb, var(--color-success, #059669) 8%, var(--bridge-surface-muted))',
    border: 'color-mix(in srgb, var(--color-success, #059669) 25%, var(--bridge-border))',
  },
  muted: {
    color: 'var(--bridge-text-faint)',
    bg: 'var(--bridge-surface-muted)',
    border: 'var(--bridge-border)',
  },
};

export function availabilityToneStyle(tone) {
  return TONE_STYLES[tone] ?? TONE_STYLES.muted;
}
