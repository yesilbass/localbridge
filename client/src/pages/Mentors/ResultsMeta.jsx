import { useState, useEffect, useRef } from 'react';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { focusRing } from '../../ui';
import { DUR_SHORT, EASE } from '../../lib/motion';

function useAnimatedCount(target) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) return;
    const start = performance.now();
    const dur = 300;
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * ease));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return display;
}

export default function ResultsMeta({ total, sort, onSortChange, density, onDensityChange }) {
  const animatedTotal = useAnimatedCount(total);

  const countLabel =
    animatedTotal === 0
      ? 'No mentors match'
      : animatedTotal === 1
      ? '1 mentor matches'
      : `${animatedTotal} mentors match`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
      <p
        className="text-[14px] tabular-nums"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        <span className="font-semibold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
          {animatedTotal.toLocaleString()}
        </span>
        {' '}
        {animatedTotal === 1 ? 'mentor matches' : 'mentors match'}
      </p>

      <div className="flex items-center gap-3">
        {/* Sort select */}
        <div className="relative">
          <select
            aria-label="Sort mentors"
            value={sort}
            onChange={e => onSortChange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              color: 'var(--bridge-text)',
              outlineColor: 'var(--color-primary)',
            }}
          >
            <option value="relevant">Most relevant</option>
            <option value="rating">Highest rated</option>
            <option value="newest">Newest</option>
            <option value="rate-asc">Lowest rate</option>
            <option value="rate-desc">Highest rate</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'var(--bridge-text-muted)' }}
            aria-hidden
          />
        </div>

        {/* Density toggle */}
        <div
          role="group"
          aria-label="Display density"
          className="flex items-center rounded-lg overflow-hidden"
          style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
        >
          <button
            type="button"
            aria-pressed={density === 'cards'}
            aria-label="Card view"
            onClick={() => onDensityChange('cards')}
            className={`px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
            style={{
              backgroundColor: density === 'cards' ? 'var(--bridge-surface-muted)' : 'var(--bridge-surface)',
              color: density === 'cards' ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
              outlineColor: 'var(--color-primary)',
              transition: `background-color ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
            }}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={density === 'list'}
            aria-label="List view"
            onClick={() => onDensityChange('list')}
            className={`px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
            style={{
              backgroundColor: density === 'list' ? 'var(--bridge-surface-muted)' : 'var(--bridge-surface)',
              color: density === 'list' ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
              outlineColor: 'var(--color-primary)',
              transition: `background-color ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
            }}
          >
            <List className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
