import { useEffect, useState } from 'react';
import { getMentorBadges } from '../../api/mentorBadges';
import { getBadgeIcon, getBadgeMeta } from '../../constants/mentorBadges';

export default function MentorBadgesSection({ mentorProfileId }) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!mentorProfileId) return;
    void getMentorBadges(mentorProfileId).then(({ data }) => setBadges(data ?? []));
  }, [mentorProfileId]);

  if (!badges.length) return null;

  return (
    <section className="mt-8 max-w-3xl">
      <div className="flex flex-wrap gap-2">
        {badges.map(({ badge_type }) => {
          const meta = getBadgeMeta(badge_type);
          const Icon = getBadgeIcon(meta.icon);
          return (
            <span
              key={badge_type}
              title={meta.description}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {meta.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
