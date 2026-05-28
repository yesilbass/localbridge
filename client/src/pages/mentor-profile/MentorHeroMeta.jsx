import { MapPin, Briefcase, Calendar } from 'lucide-react';
import { buildHeroMetaItems } from './mentorMeta';
import { formatJoinedDate } from './profileHooks';

function Dot() {
  return <span aria-hidden style={{ color: 'var(--bridge-text-faint)' }}>·</span>;
}

export default function MentorHeroMeta({ mentor, rawMentor }) {
  const { row } = buildHeroMetaItems(mentor);

  const location = row.find((r) => r.key === 'location');
  const experience = mentor?.yearsExperience ? `${mentor.yearsExperience}+ yrs exp` : null;
  const joined = formatJoinedDate(rawMentor?.created_at ?? mentor?.joinedAt);

  const hasAny = location || experience || joined;
  if (!hasAny) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]"
      style={{ color: 'var(--bridge-text-muted)' }}
    >
      {location && (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {location.label}
        </span>
      )}

      {location && (experience || joined) && <Dot />}

      {(experience || joined) && (
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {[experience, joined ? `joined ${joined}` : null].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  );
}
