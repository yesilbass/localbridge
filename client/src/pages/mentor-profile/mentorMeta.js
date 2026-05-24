import { shortZoneCity } from '../../utils/timezone';
import { formatJoinedDate } from './profileHooks';

export function getUtcOffsetLabel(timeZone, at = new Date()) {
  if (!timeZone) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(at);
    const raw = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const match = raw.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return null;
    const sign = match[1];
    const hh = match[2].padStart(2, '0');
    const mm = (match[3] || '00').padStart(2, '0');
    return `(${sign}${hh}:${mm} UTC)`;
  } catch {
    return null;
  }
}

export function formatRoleHeadline(title, company) {
  const role = title?.trim();
  const org = company?.trim();
  if (role && org) return `${role} @ ${org}`;
  return role || org || null;
}

export function formatHeroLocation(location, timeZone) {
  const place = location?.trim() || (timeZone ? shortZoneCity(timeZone) : null);
  if (!place) return null;
  const offset = getUtcOffsetLabel(timeZone);
  return offset ? `${place} ${offset}` : place;
}

export function buildHeroMetaItems(mentor) {
  if (!mentor) return { row: [] };

  const row = [];

  const locationLabel = formatHeroLocation(mentor.location, mentor.timezone);
  if (locationLabel) row.push({ key: 'location', label: locationLabel });

  const languages = Array.isArray(mentor.languages) ? mentor.languages.filter(Boolean) : [];
  if (languages.length) row.push({ key: 'languages', label: languages.join(', ') });

  const origin = mentor.hometown?.trim();
  if (origin) row.push({ key: 'origin', label: `from ${origin}` });

  const joined = formatJoinedDate(mentor.joinedAt);
  if (joined) row.push({ key: 'joined', label: `Joined ${joined}` });

  if (mentor.yearsExperience) {
    row.push({ key: 'experience', label: `${mentor.yearsExperience}+ years of experience` });
  }

  return { row };
}
