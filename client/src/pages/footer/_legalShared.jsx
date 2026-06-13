import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp, List, X } from 'lucide-react';

/**
 * Shared chrome for the long-form legal/policy pages
 * (Trust, Terms, Privacy, Cookies). Single source of truth — Terms / Privacy
 * / Cookies still have local copies and should migrate here over time.
 */

export const EYEBROW = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'var(--color-primary)',
};

export const FIELD =
  'w-full rounded-lg border border-[var(--bridge-border)] bg-transparent px-4 py-3.5 text-base text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

/** Smooth-scroll to an anchor and keep the URL hash in sync without jumping. */
export function smoothScrollTo(id) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof history !== 'undefined' && history.replaceState) {
    history.replaceState(null, '', `#${id}`);
  }
}

/**
 * Returns the number of pixels the page `<footer>` currently occupies inside
 * the viewport (measured from the bottom). FloatingToc consumers add this to
 * their bottom offset so the pill rides up above the footer instead of
 * overlapping it.
 */
export function useFooterOffset() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.querySelector('footer');
    if (!el) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const intruding = Math.max(0, window.innerHeight - rect.top);
      setOffset(intruding);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return offset;
}

/** Tracks whether the desktop sidebar ToC is on-screen; drives FloatingToc visibility. */
export function useSidebarInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Track the currently-visible section for the ToC. Handles the
 * "stuck on last section" gap by falling back to the last entry once the
 * user has scrolled past it, and the first entry while above the page.
 */
export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0% -72% 0%', threshold: 0 },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    function onScroll() {
      const doc = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 80;
      if (nearBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }
      if (window.scrollY < 80) setActiveId(sectionIds[0]);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [sectionIds]);
  return activeId;
}

/**
 * Mobile/tablet floating table-of-contents pill.
 * `sections`: `[{ id, title }]`. `activeSection`: id. `visible`: boolean.
 */
export function FloatingToc({ sections, activeSection, visible, label = 'On this page', bottomOffset = 0 }) {
  const [open, setOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeTitle = sections[activeIdx]?.title ?? sections[0].title;
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const panelId = 'floating-toc-panel';

  useEffect(() => {
    if (!open) return undefined;
    const fn = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', fn);
    document.addEventListener('keydown', onKey);
    // Move focus into the panel for screen-reader users.
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('mousedown', fn);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleClick = useCallback((id) => (e) => {
    e.preventDefault();
    setOpen(false);
    smoothScrollTo(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed left-4 right-6 z-50 max-w-lg"
      style={{
        bottom: `calc(1.5rem + ${bottomOffset}px)`,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 16}px)`,
        transition: 'bottom 180ms linear, opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-label={label}
        className="mb-2 overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 8px 40px -8px var(--bridge-shadow-soft), inset 0 0 0 1px var(--bridge-border)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
          transformOrigin: 'bottom center',
          transition: 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 260ms cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: open ? 'auto' : 'none',
          maxHeight: open ? '70vh' : 0,
          overflowY: 'auto',
        }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: 'var(--bridge-surface)' }}
        >
          <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.28em' }}>
            {label}
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close contents"
            className="rounded-full p-1 text-[var(--bridge-text-muted)] transition-colors hover:text-[var(--bridge-text)]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <ul className="p-2">
          {sections.map((s) => {
            const isActive = s.id === activeSection;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={handleClick(s.id)}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] hover:text-[var(--bridge-text)]"
                  style={{
                    color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    borderLeft: `2px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                  }}
                >
                  {s.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 4px 24px -4px var(--bridge-shadow-soft), inset 0 0 0 1px var(--bridge-border)',
          color: 'var(--bridge-text)',
          whiteSpace: 'nowrap',
          maxWidth: 'min(320px, calc(100vw - 2rem))',
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Toggle table of contents"
      >
        <List className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <span className="truncate">{activeTitle}</span>
        <ChevronUp
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          style={{ color: 'var(--bridge-text-muted)', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
