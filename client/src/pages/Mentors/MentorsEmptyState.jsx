import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { focusRing } from '../../ui';

function getContextualHint(filters) {
  if (filters.rate.length === 1 && filters.rate[0] === 'under-100') {
    return "Try widening your rate range — most operators sit between $100 and $200 per session.";
  }
  if (filters.role.length >= 2 && filters.industry.length >= 2) {
    return "You've combined several roles and industries. Try removing one to see more matches.";
  }
  if (filters.available) {
    return "Availability is the most restrictive filter. Untoggle “Available this week” to see all matching operators.";
  }
  return "Try removing one filter, or browse the full list.";
}

export default function MentorsEmptyState({ filters, onClearAll }) {
  const hint = getContextualHint(filters);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <SearchX
        style={{ color: 'var(--bridge-text-faint)' }}
        className="h-12 w-12"
        aria-hidden
      />

      <h2
        className="font-display font-black tracking-[-0.02em]"
        style={{ fontSize: '1.375rem', color: 'var(--bridge-text)' }}
      >
        No operators match these filters.
      </h2>

      <p
        className="max-w-md text-[14px]"
        style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
      >
        {hint}
      </p>

      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onClearAll}
          className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition hover:-translate-y-0.5 ${focusRing}`}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
          }}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
