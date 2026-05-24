import { groupMentorTags } from '../utils/mentorDisplay';

function TagPill({ label, variant = 'default' }) {
  const isIndustry = variant === 'industry';
  const isTool = variant === 'tool';
  return (
    <span
      className="rounded-md px-2 py-1 text-[11px] font-medium sm:text-[12px]"
      style={
        isIndustry
          ? {
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
              color: 'var(--color-primary)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)',
            }
          : isTool
          ? {
              backgroundColor: 'var(--bridge-surface)',
              color: 'var(--bridge-text-secondary)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
            }
          : {
              backgroundColor: 'var(--bridge-surface-muted)',
              color: 'var(--bridge-text-secondary)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }
      }
    >
      {label}
    </span>
  );
}

function PlainTagGroup({ title, tags, limit }) {
  if (!tags?.length) return null;
  const visible = limit ? tags.slice(0, limit) : tags;
  const overflow = limit && tags.length > limit ? tags.length - limit : 0;

  return (
    <div className="min-w-0">
      <p className="text-[13px] font-semibold text-[var(--bridge-text-muted)]">{title}</p>
      <p className="mt-0.5 text-[14px] leading-snug text-[var(--bridge-text-secondary)]">
        {visible.join(' · ')}
        {overflow > 0 ? (
          <span className="text-[var(--bridge-text-faint)]">{` · +${overflow} more`}</span>
        ) : null}
      </p>
    </div>
  );
}

function TagGroup({ title, tags, variant, limit, compact }) {
  if (!tags?.length) return null;
  const visible = limit ? tags.slice(0, limit) : tags;
  const overflow = limit && tags.length > limit ? tags.length - limit : 0;

  return (
    <div className={compact ? 'min-w-0' : ''}>
      <p
        className={`font-bold uppercase text-[var(--bridge-text-faint)] ${compact ? 'mb-1 text-[9px] tracking-[0.14em]' : 'mb-2 text-[10px] tracking-[0.18em]'}`}
      >
        {title}
      </p>
      <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
        {visible.map((tag) => (
          <TagPill key={`${title}-${tag}`} label={tag} variant={variant} />
        ))}
        {overflow > 0 && (
          <span className="px-1 py-1 text-[11px] font-medium text-[var(--bridge-text-faint)]">
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * @param {'row'|'stack'|'grid'|'browse'} layout
 * @param {'pill'|'plain'} tagStyle — plain = readable inline text (browse cards)
 */
export default function MentorTagGroups({
  mentor,
  layout = 'row',
  tagStyle = 'pill',
  compact = false,
  limits = { expertise: 5, industry: 2, tools: 4 },
}) {
  const groups = groupMentorTags(mentor);
  if (!groups.hasAny) return null;

  if (layout === 'browse' || tagStyle === 'plain') {
    return (
      <div className="mt-3.5 space-y-2">
        <PlainTagGroup title="Expertise" tags={groups.expertise} limit={limits.expertise} />
        <PlainTagGroup title="Industry" tags={groups.industry} limit={limits.industry} />
        <PlainTagGroup title="Tools" tags={groups.tools} limit={limits.tools} />
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <TagGroup title="Expertise" tags={groups.expertise} limit={limits.expertise} />
        <TagGroup title="Industry" tags={groups.industry} variant="industry" limit={limits.industry} />
        <TagGroup title="Tools" tags={groups.tools} variant="tool" limit={limits.tools} />
      </div>
    );
  }

  if (layout === 'stack') {
    return (
      <div className="space-y-3">
        <TagGroup title="Expertise" tags={groups.expertise} limit={limits.expertise} compact={compact} />
        <TagGroup title="Industry" tags={groups.industry} variant="industry" limit={limits.industry} compact={compact} />
        <TagGroup title="Tools" tags={groups.tools} variant="tool" limit={limits.tools} compact={compact} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3 ${compact ? 'mt-3' : 'mt-4'}`}>
      <TagGroup title="Expertise" tags={groups.expertise} limit={limits.expertise} compact={compact} />
      <TagGroup title="Industry" tags={groups.industry} variant="industry" limit={limits.industry} compact={compact} />
      <TagGroup title="Tools" tags={groups.tools} variant="tool" limit={limits.tools} compact={compact} />
    </div>
  );
}
