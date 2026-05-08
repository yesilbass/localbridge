import { Briefcase, Layers, Building2, Clock, Languages, Globe } from 'lucide-react';

function Chip({ icon: Icon, label }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap"
      style={{
        fontSize: '12px',
        background: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        color: 'var(--bridge-text-secondary)',
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

export default function AtAGlance({ mentor }) {
  if (!mentor) return null;

  const chips = [];

  if (mentor.roleLabel) chips.push({ icon: Briefcase, label: mentor.roleLabel });

  const primaryIndustry = Array.isArray(mentor.industries) && mentor.industries[0];
  if (primaryIndustry) chips.push({ icon: Layers, label: primaryIndustry });

  if (mentor.stageLabel) chips.push({ icon: Building2, label: mentor.stageLabel });

  if (mentor.yearsExperience) chips.push({ icon: Clock, label: `${mentor.yearsExperience}+ years` });

  const languages = Array.isArray(mentor.languages) && mentor.languages.length > 0 && mentor.languages;
  if (languages) chips.push({ icon: Languages, label: languages.join(', ') });

  const tz = mentor.timezone;
  if (tz) chips.push({ icon: Globe, label: tz });

  const visible = chips.slice(0, 6);
  if (!visible.length) return null;

  return (
    <section aria-label="At a glance" className="mt-12">
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((c, i) => (
          <Chip key={i} icon={c.icon} label={c.label} />
        ))}
      </div>
    </section>
  );
}
