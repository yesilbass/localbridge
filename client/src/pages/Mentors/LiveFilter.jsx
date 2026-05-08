import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, LayoutGrid, List } from 'lucide-react';
import { focusRing } from '../../ui';
import { DUR_SHORT, EASE } from '../../lib/motion';
import { useMentorFilters, useDebouncedValue } from './mentorsHooks';

const ROLE_OPTIONS = [
  { slug: 'pm',       label: 'PM' },
  { slug: 'em',       label: 'EM' },
  { slug: 'designer', label: 'Designer' },
  { slug: 'ic',       label: 'IC Engineer' },
  { slug: 'founder',  label: 'Founder' },
  { slug: 'sales',    label: 'Sales' },
  { slug: 'marketer', label: 'Marketer' },
];
const INDUSTRY_OPTIONS = [
  { slug: 'fintech',    label: 'Fintech' },
  { slug: 'ai',         label: 'AI / ML' },
  { slug: 'b2b-saas',   label: 'B2B SaaS' },
  { slug: 'consumer',   label: 'Consumer' },
  { slug: 'creator',    label: 'Creator' },
  { slug: 'climate',    label: 'Climate' },
  { slug: 'healthcare', label: 'Healthcare' },
  { slug: 'web3',       label: 'Web3' },
];
const STAGE_OPTIONS = [
  { slug: 'pre-seed',  label: 'Pre-seed' },
  { slug: 'seed',      label: 'Seed' },
  { slug: 'series-ab', label: 'Series A-B' },
  { slug: 'series-c',  label: 'Series C+' },
  { slug: 'public',    label: 'Public' },
  { slug: 'faang',     label: 'FAANG' },
];
const RATE_OPTIONS = [
  { slug: 'under-100', label: 'Under $100' },
  { slug: '100-200',   label: '$100-200' },
  { slug: '200-400',   label: '$200-400' },
  { slug: 'over-400',  label: '$400+' },
];

function FilterChipRow({ label, options, activeValues, onToggle }) {
  return (
    <div className="flex items-start gap-2 mt-3">
      <span
        className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] pt-1"
        style={{ color: 'var(--bridge-text-muted)', width: 72 }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map(({ slug, label: chipLabel }) => {
          const active = activeValues.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(slug)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
              style={{
                backgroundColor: active ? 'var(--color-primary)' : 'var(--bridge-surface-muted)',
                color: active ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
                boxShadow: active ? 'inset 0 0 0 1px transparent' : 'inset 0 0 0 1px var(--bridge-border)',
                outlineColor: 'var(--color-primary)',
                transition: `all ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
              }}
            >
              {chipLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toggleArrayValue(arr, value) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export default function LiveFilter({ total, density, onDensityChange }) {
  const { filters, setFilter, clearAll, activeCount } = useMentorFilters();
  const [typedQuery, setTypedQuery] = useState(filters.q);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sentinelRef = useRef(null);
  const searchRef = useRef(null);
  const expandedSearchRef = useRef(null);

  const debouncedQuery = useDebouncedValue(typedQuery, 220);

  useEffect(() => {
    if (debouncedQuery !== filters.q) {
      setFilter('q', debouncedQuery || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Sync typedQuery when URL filters.q changes from outside
  useEffect(() => {
    setTypedQuery(filters.q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  // IntersectionObserver for sticky collapse
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsCollapsed(!entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  // "/" global shortcut focuses search
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      if (isCollapsed) searchRef.current?.focus();
      else expandedSearchRef.current?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCollapsed]);

  const activeFilterPills = [
    ...filters.role.map(s => ({ key: 'role', value: s, label: ROLE_OPTIONS.find(o => o.slug === s)?.label || s })),
    ...filters.industry.map(s => ({ key: 'industry', value: s, label: INDUSTRY_OPTIONS.find(o => o.slug === s)?.label || s })),
    ...filters.stage.map(s => ({ key: 'stage', value: s, label: STAGE_OPTIONS.find(o => o.slug === s)?.label || s })),
    ...filters.rate.map(s => ({ key: 'rate', value: s, label: RATE_OPTIONS.find(o => o.slug === s)?.label || s })),
    ...(filters.available ? [{ key: 'available', value: true, label: 'Available this week' }] : []),
  ];

  function removePill(pill) {
    if (pill.key === 'available') {
      setFilter('available', false);
    } else {
      setFilter(pill.key, toggleArrayValue(filters[pill.key], pill.value));
    }
  }

  return (
    <>
      {/* Sentinel — triggers collapse */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      {/* Expanded filter card */}
      <form
        role="search"
        aria-label="Filter mentors"
        onSubmit={e => e.preventDefault()}
        className="rounded-3xl p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {/* Search input row */}
        <div
          className="relative flex items-center gap-2 px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <Search
            className="shrink-0 h-4 w-4"
            style={{ color: 'var(--bridge-text-muted)' }}
            aria-hidden
          />

          {/* Active filter pills inside input */}
          {activeFilterPills.map(pill => (
            <span
              key={`${pill.key}-${pill.value}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold shrink-0"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {pill.label}
              <button
                type="button"
                aria-label={`Remove filter: ${pill.label}`}
                onClick={() => removePill(pill)}
                className={`focus-visible:outline-2 focus-visible:outline-offset-1 rounded-full ${focusRing}`}
                style={{ outlineColor: 'var(--color-primary)' }}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}

          <input
            ref={expandedSearchRef}
            type="search"
            role="searchbox"
            aria-label="Search mentors"
            placeholder={activeFilterPills.length > 0 ? 'Search…' : 'Search 2,400+ operators by name, role, company…'}
            value={typedQuery}
            onChange={e => setTypedQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setTypedQuery(''); }}
            className="flex-1 bg-transparent outline-none text-[14px] min-w-0"
            style={{ color: 'var(--bridge-text)' }}
          />

          <kbd
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-mono shrink-0"
            style={{
              color: 'var(--bridge-text-faint)',
              borderColor: 'var(--bridge-border)',
            }}
            aria-hidden
          >
            /
          </kbd>
        </div>

        {/* Chip rows */}
        <FilterChipRow
          label="Role"
          options={ROLE_OPTIONS}
          activeValues={filters.role}
          onToggle={slug => setFilter('role', toggleArrayValue(filters.role, slug))}
        />
        <FilterChipRow
          label="Industry"
          options={INDUSTRY_OPTIONS}
          activeValues={filters.industry}
          onToggle={slug => setFilter('industry', toggleArrayValue(filters.industry, slug))}
        />
        <FilterChipRow
          label="Stage"
          options={STAGE_OPTIONS}
          activeValues={filters.stage}
          onToggle={slug => setFilter('stage', toggleArrayValue(filters.stage, slug))}
        />
        <FilterChipRow
          label="Rate"
          options={RATE_OPTIONS}
          activeValues={filters.rate}
          onToggle={slug => setFilter('rate', toggleArrayValue(filters.rate, slug))}
        />

        {/* Availability toggle + clear all */}
        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={filters.available}
              onClick={() => setFilter('available', !filters.available)}
              className={`relative h-5 w-9 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
              style={{
                backgroundColor: filters.available ? 'var(--color-primary)' : 'var(--bridge-surface-muted)',
                boxShadow: filters.available ? 'inset 0 0 0 1px transparent' : 'inset 0 0 0 1px var(--bridge-border)',
                outlineColor: 'var(--color-primary)',
                transition: `background-color ${DUR_SHORT}s ${EASE.join(',')}`,
              }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full"
                style={{
                  backgroundColor: filters.available ? 'var(--color-on-primary)' : 'var(--bridge-text-muted)',
                  transform: filters.available ? 'translateX(18px)' : 'translateX(2px)',
                  transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
                }}
                aria-hidden
              />
            </button>
            <span className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
              Available this week
            </span>
          </label>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className={`ml-auto text-[12px] font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
              style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
            >
              Clear all →
            </button>
          )}
        </div>
      </form>

      {/* Collapsed sticky bar */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            className="fixed left-0 right-0 z-30"
            style={{ top: 64 }}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: DUR_SHORT, ease: EASE }}
          >
            <div
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 95%, transparent)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--bridge-border)',
              }}
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-3">
                {/* Compact search + pills */}
                <div
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl min-w-0"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  <Search className="shrink-0 h-3.5 w-3.5" style={{ color: 'var(--bridge-text-muted)' }} aria-hidden />
                  {activeFilterPills.slice(0, 3).map(pill => (
                    <span
                      key={`c-${pill.key}-${pill.value}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {pill.label}
                      <button
                        type="button"
                        aria-label={`Remove filter: ${pill.label}`}
                        onClick={() => removePill(pill)}
                        className={focusRing}
                      >
                        <X className="h-2.5 w-2.5" aria-hidden />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={searchRef}
                    type="search"
                    aria-label="Search mentors"
                    placeholder="Search…"
                    value={typedQuery}
                    onChange={e => setTypedQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') setTypedQuery(''); }}
                    className="flex-1 bg-transparent outline-none text-[13px] min-w-0"
                    style={{ color: 'var(--bridge-text)' }}
                  />
                </div>

                <span
                  className="text-[13px] font-bold tabular-nums shrink-0"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  {total.toLocaleString()}
                </span>

                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    color: 'var(--bridge-text-secondary)',
                    outlineColor: 'var(--color-primary)',
                  }}
                  aria-label="Expand filter bar"
                >
                  More ▾
                </button>

                {/* Density toggle in sticky bar */}
                <div
                  role="group"
                  aria-label="Display density"
                  className="flex items-center rounded-lg overflow-hidden shrink-0"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                >
                  <button
                    type="button"
                    aria-pressed={density === 'cards'}
                    aria-label="Card view"
                    onClick={() => onDensityChange('cards')}
                    className={`px-2.5 py-1.5 transition-colors ${focusRing}`}
                    style={{
                      backgroundColor: density === 'cards' ? 'var(--bridge-surface-muted)' : 'var(--bridge-surface)',
                      color: density === 'cards' ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                    }}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-pressed={density === 'list'}
                    aria-label="List view"
                    onClick={() => onDensityChange('list')}
                    className={`px-2.5 py-1.5 transition-colors ${focusRing}`}
                    style={{
                      backgroundColor: density === 'list' ? 'var(--bridge-surface-muted)' : 'var(--bridge-surface)',
                      color: density === 'list' ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                    }}
                  >
                    <List className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
