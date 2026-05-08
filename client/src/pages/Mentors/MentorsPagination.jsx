import { focusRing } from '../../ui';
import { MENTORS_PAGE_SIZE } from './mentorsHooks';

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= Math.min(5, total); i++) pages.push(i);
    if (total > 6) pages.push('…');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    if (total > 6) pages.push('…');
    for (let i = Math.max(total - 4, 2); i <= total; i++) pages.push(i);
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total);
  }
  return pages;
}

export default function MentorsPagination({ page, total, onPageChange, gridRef }) {
  if (total <= MENTORS_PAGE_SIZE) return null;

  const totalPages = Math.ceil(total / MENTORS_PAGE_SIZE);
  const start = (page - 1) * MENTORS_PAGE_SIZE + 1;
  const end = Math.min(page * MENTORS_PAGE_SIZE, total);
  const pages = buildPages(page, totalPages);

  function handlePage(n) {
    onPageChange(n);
    gridRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const btnBase = `h-9 min-w-9 px-3 rounded-lg text-[13px] font-semibold tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2`;
  const btnStyle = {
    backgroundColor: 'var(--bridge-surface)',
    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
    color: 'var(--bridge-text-secondary)',
    outlineColor: 'var(--color-primary)',
  };

  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-between gap-4 mt-10 pt-6"
      style={{ borderTop: '1px solid var(--bridge-border)' }}
    >
      <span className="text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
        Showing{' '}
        <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{start}–{end}</span>
        {' '}of{' '}
        <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{total}</span>
        {' '}mentors
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => handlePage(page - 1)}
          className={`${btnBase} disabled:opacity-40 disabled:cursor-not-allowed`}
          style={btnStyle}
          aria-label="Previous page"
        >
          ←
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="text-[13px] px-1 tabular-nums"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => handlePage(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${btnBase} ${focusRing}`}
              style={
                p === page
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      outlineColor: 'var(--color-primary)',
                    }
                  : btnStyle
              }
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => handlePage(page + 1)}
          className={`${btnBase} disabled:opacity-40 disabled:cursor-not-allowed`}
          style={btnStyle}
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </nav>
  );
}
