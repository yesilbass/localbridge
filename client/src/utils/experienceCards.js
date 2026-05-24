function roleDurationYears(startYear, endYear) {
  if (!startYear) return null;
  const end = endYear ?? new Date().getFullYear();
  return Math.max(1, end - startYear);
}

function formatDuration(startYear, endYear) {
  const years = roleDurationYears(startYear, endYear);
  if (!years) return null;
  if (years === 1) return '1 year';
  return `${years} years`;
}

function detectRoleLevel(title = '') {
  const lower = title.toLowerCase();
  if (/\b(founder|co-founder|ceo|cto|coo|cpo|chief)\b/.test(lower)) return { label: 'Executive', tone: 'executive' };
  if (/\b(vp|vice president|director|head of|principal)\b/.test(lower)) return { label: 'Leadership', tone: 'leadership' };
  if (/\b(staff|senior|sr\.|lead|manager)\b/.test(lower)) return { label: 'Senior', tone: 'senior' };
  if (/\b(intern|junior|associate|analyst|entry)\b/.test(lower)) return { label: 'Early career', tone: 'early' };
  return { label: 'Operator', tone: 'operator' };
}

function menteeAngle(entry, ctx, isCurrent) {
  if (entry.note?.trim()) return entry.note.trim();

  const { firstName } = ctx;
  const role = entry.role ?? 'this role';
  const company = entry.company ?? 'their organization';
  const lower = role.toLowerCase();

  if (isCurrent) {
    return `${firstName} is still in the room where ${company} decisions get made — useful for mentees who want current-market context, not war stories from five years ago.`;
  }
  if (/engineer|developer|software|data scientist|ml/i.test(lower)) {
    return `Shipping work at ${company} as ${role} — ${firstName} can speak to code review culture, on-call reality, and how teams actually promote engineers.`;
  }
  if (/product|pm|design|ux/i.test(lower)) {
    return `Built product surface area at ${company} — ${firstName} knows stakeholder politics, roadmap trade-offs, and how to show impact when metrics are messy.`;
  }
  if (/consult|strategy|analyst/i.test(lower)) {
    return `Client-facing work at ${company} — ${firstName} can translate consulting pace and frameworks into industry roles mentees are targeting.`;
  }
  if (/market|growth|brand/i.test(lower)) {
    return `Ran growth and GTM motions at ${company} — ${firstName} brings channel-specific lessons and the reporting that survived exec review.`;
  }
  if (/legal|counsel|compliance|regulatory/i.test(lower)) {
    return `Navigated regulation and risk at ${company} — ${firstName} helps mentees understand how legal and business teams actually collaborate.`;
  }

  return `Held ${role} at ${company} — ${firstName} pulls specific examples from this chapter when mentees ask how careers actually progress inside strong teams.`;
}

function sessionHook(entry, isCurrent) {
  const lower = (entry.role ?? '').toLowerCase();
  if (isCurrent) return 'Ask what changed in the last 12 months';
  if (/interview|hiring|recruit/i.test(lower)) return 'Mock loops with someone who sat in this seat';
  if (/product|design|engineer|data/i.test(lower)) return 'Teardown a project against this bar';
  if (/market|growth|sales/i.test(lower)) return 'Stress-test your plan with this operator';
  return 'Map your next move against this chapter';
}

export function buildCareerStats(mentor) {
  const entries = mentor?.careerHistory ?? [];
  if (!entries.length) return null;

  const starts = entries.map((e) => e.startYear).filter(Boolean);
  const ends = entries.map((e) => e.endYear ?? new Date().getFullYear());
  const spanYears = starts.length ? Math.max(...ends) - Math.min(...starts) : null;

  return {
    roleCount: entries.length,
    companyCount: new Set(entries.map((e) => e.company).filter(Boolean)).size,
    spanYears,
    currentRole: entries.find((e) => !e.endYear) ?? null,
  };
}

/** Enriched career rows for mentor profile experience section. */
export function buildExperienceCards(mentor, { limit = 8 } = {}) {
  const entries = mentor?.careerHistory ?? [];
  if (!entries.length) return [];

  const ctx = {
    firstName: mentor.firstName ?? mentor.name?.split(/\s+/)[0] ?? 'They',
    totalYears: mentor.yearsExperience ?? null,
  };

  return entries.slice(0, limit).map((entry, index) => {
    const isCurrent = !entry.endYear;
    const level = detectRoleLevel(entry.role);
    const duration = formatDuration(entry.startYear, entry.endYear);

    return {
      id: `${entry.company}-${entry.startYear}-${index}`,
      role: entry.role,
      company: entry.company,
      startYear: entry.startYear,
      endYear: entry.endYear,
      isCurrent,
      duration,
      level,
      narrative: menteeAngle(entry, ctx, isCurrent),
      sessionHook: sessionHook(entry, isCurrent),
    };
  });
}

export function mentorHasExperience(mentor) {
  return (mentor?.careerHistory?.length ?? 0) > 0;
}
