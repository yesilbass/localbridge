import { useRef } from 'react';
import { Star } from 'lucide-react';

const TONE_GRADIENTS = {
  amber:   'linear-gradient(135deg, #4F46E5, #818CF8)',
  emerald: 'linear-gradient(135deg, #059669, #10b981)',
  sky:     'linear-gradient(135deg, #0EA5E9, #38BDF8)',
  rose:    'linear-gradient(135deg, #6D28D9, #A78BFA)',
  violet:  'linear-gradient(135deg, #5B21B6, #A78BFA)',
  teal:    'linear-gradient(135deg, #0D9488, #14B8A6)',
  orange:  'linear-gradient(135deg, #4F46E5, #6366F1)',
  pink:    'linear-gradient(135deg, #312E81, #818CF8)',
};

export default function MentorCard({ m }) {
  const r = useRef(null);

  const handleMouseMove = e => {
    const el = r.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    el.style.setProperty('--tilt-x', `${((e.clientY - b.top) / b.height - 0.5) * -6}deg`);
    el.style.setProperty('--tilt-y', `${((e.clientX - b.left) / b.width - 0.5) * 6}deg`);
    el.style.setProperty('--mx', `${((e.clientX - b.left) / b.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - b.top) / b.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const el = r.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div
      ref={r}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="View"
      className="tilt-card cursor-glow inline-flex shrink-0 w-64 flex-col gap-3 rounded-2xl p-4 transition-all"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: '0 8px 24px -16px rgba(79,70,229,0.22), 0 0 0 1px var(--bridge-border) inset',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: TONE_GRADIENTS[m.tone] || TONE_GRADIENTS.amber }}
        >
          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          {m.online && (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500"
              style={{ boxShadow: '0 0 0 2px var(--bridge-surface)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold" style={{ color: 'var(--bridge-text)' }}>
            {m.name}
          </p>
          <p className="truncate text-[10.5px]" style={{ color: 'var(--bridge-text-faint)' }}>
            {m.co}
          </p>
        </div>
      </div>
      <p className="text-[11.5px]" style={{ color: 'var(--bridge-text-muted)' }}>
        {m.title}
      </p>
      <div className="flex flex-wrap gap-1">
        {m.tags.slice(0, 2).map(t => (
          <span
            key={t}
            className="rounded-full px-2 py-0.5 text-[9.5px] font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        className="flex items-center justify-between pt-2.5"
        style={{ borderTop: '1px solid var(--bridge-border)' }}
      >
        <span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: 'var(--bridge-text-muted)' }}>
          <Star className="h-2.5 w-2.5" style={{ fill: '#F59E0B', color: '#F59E0B' }} /> {m.rating} · {m.sessions} sessions
        </span>
        <span className="text-[11.5px] font-bold" style={{ color: 'var(--color-primary)' }}>
          ${m.rate}/hr
        </span>
      </div>
    </div>
  );
}
