import { Briefcase, Layers, Building2, Languages } from 'lucide-react';

function Chip({ icon: Icon, label }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap"
      style={{
        fontSize: '12px',
        background: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        color: 'var(--bridge-text-secondary)'
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

export default function AtAGlance({ mentor, roleHeadline = null, className = 'mt-12' }) {
  if (!mentor) return null;

  const chips = [];

  const roleNorm = mentor.roleLabel?.trim()?.toLowerCase();
  const headlineNorm = roleHeadline?.trim()?.toLowerCase();
  const titleNorm = mentor.title?.trim()?.toLowerCase();
  const showRoleChip = mentor.roleLabel && roleNorm !== headlineNorm && roleNorm !== titleNorm;

  if (showRoleChip) chips.push({ icon: Briefcase, label: mentor.roleLabel });

  const primaryIndustry = Array.isArray(mentor.industries) && mentor.industries[0];
  if (primaryIndustry) chips.push({ icon: Layers, label: primaryIndustry });

  if (mentor.stageLabel) chips.push({ icon: Building2, label: mentor.stageLabel });

  const languages = Array.isArray(mentor.languages) && mentor.languages.length > 0 && mentor.languages;
  if (languages) chips.push({ icon: Languages, label: languages.join(', ') });

  const visible = chips.slice(0, 6);
  if (!visible.length) return null;

  return (
    <section aria-label="At a glance" className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((c, i) => (
          <Chip key={i} icon={c.icon} label={c.label} />
        ))}
      </div>
    </section>
  );
}
