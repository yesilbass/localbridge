import { MapPin, Globe, Languages, Calendar, Briefcase } from 'lucide-react';
import { buildHeroMetaItems } from './mentorMeta';

const ICONS = {
  location: MapPin,
  languages: Globe,
  origin: Languages,
  joined: Calendar,
  experience: Briefcase,
};

function MetaItem({ itemKey, label }) {
  const Icon = ICONS[itemKey] || Globe;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--bridge-text-faint)' }} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export default function MentorHeroMeta({ mentor }) {
  const { row } = buildHeroMetaItems(mentor);
  if (!row.length) return null;

  return (
    <div className="mt-6">
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base leading-snug sm:text-[17px]"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {row.map((item) => (
          <MetaItem key={item.key} itemKey={item.key} label={item.label} />
        ))}
      </div>
    </div>
  );
}
