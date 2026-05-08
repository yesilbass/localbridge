import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { focusRing } from '../../ui';
import { DUR_SHORT, EASE } from '../../lib/motion';

export default function MentorRow({ mentor, featured }) {
  const initials = mentor.name
    ? mentor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const tags = (mentor.expertise || []).slice(0, 3);

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={`group grid items-center gap-4 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
      style={{
        gridTemplateColumns: '40px 1fr auto auto auto auto',
        borderTop: '1px solid var(--bridge-border)',
        backgroundColor: 'var(--bridge-surface)',
        outlineColor: 'var(--color-primary)',
        transition: `background-color ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
      }}
      aria-labelledby={`row-mentor-${mentor.id}-name`}
    >
      <div
        className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 font-display font-black text-sm"
        style={
          mentor.image_url
            ? undefined
            : { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
        }
      >
        {mentor.image_url ? (
          <img
            src={mentor.image_url}
            alt={`${mentor.name}, ${mentor.title}`}
            width={40}
            height={40}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {featured && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] shrink-0"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
              }}
            >
              Booked most this week
            </span>
          )}
          <span
            id={`row-mentor-${mentor.id}-name`}
            className="text-[14px] font-bold truncate"
            style={{ color: 'var(--bridge-text)' }}
          >
            {mentor.name}
          </span>
        </div>
        <p
          className="text-[12px] truncate"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}
        </p>
      </div>

      <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
        {tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <span
        className="text-[14px] font-bold tabular-nums shrink-0"
        style={{ color: 'var(--bridge-text)' }}
      >
        {mentor.session_rate ? `$${mentor.session_rate}` : 'Free'}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <Star className="h-3.5 w-3.5" fill="#F59E0B" stroke="#F59E0B" aria-hidden />
        <span className="text-[13px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
          {(mentor.rating || 0).toFixed(1)}
        </span>
      </div>

      <div className="shrink-0">
        {mentor.available ? (
          <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--color-primary)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" aria-hidden />
            Available
          </span>
        ) : (
          <span className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>—</span>
        )}
      </div>
    </Link>
  );
}
