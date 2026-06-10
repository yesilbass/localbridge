import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArrowUp, ChevronUp, Hash, List, Printer, X } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { EMAIL, LAST_UPDATED, SECTIONS, TLDR } from './termsContent';

// SECTIONS bodies are static, author-controlled constants. renderBody returns
// React nodes (no dangerouslySetInnerHTML), so user-derived content must NEVER
// be merged into SECTIONS without a sanitizer pass.

const INLINE_RE = /(\*\*[^*]+\*\*|mentors\.bridge@gmail\.com|https?:\/\/[^\s)]+)/g;

function renderInline(text, keyBase) {
  const parts = text.split(INLINE_RE);
  return parts.map((part, i) => {
    if (!part) return null;
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-semibold text-[var(--bridge-text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part === EMAIL) {
      return (
        <a
          key={key}
          href={`mailto:${EMAIL}`}
          className="rounded-sm underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-surface)]"
          style={{ color: 'var(--color-primary)' }}
        >
          {EMAIL}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-surface)]"
          style={{ color: 'var(--color-primary)' }}
        >
          {part.replace(/^https?:\/\//, '')}
        </a>
      );
    }
    return part;
  });
}

function renderBody(body, blockKey) {
  // Split body into blocks, then within each block group consecutive dash-list
  // lines into <ul> and render the rest as <p>. Robust to wrapped items and to
  // blocks that are entirely dash lines.
  return body.split('\n\n').map((block, bi) => {
    const lines = block.split('\n');
    const groups = [];
    let buffer = null; // { type: 'p' | 'ul', items: [] }
    const flush = () => { if (buffer) { groups.push(buffer); buffer = null; } };

    for (const line of lines) {
      const isDash = line.startsWith('- ');
      if (isDash) {
        if (buffer?.type !== 'ul') { flush(); buffer = { type: 'ul', items: [] }; }
        buffer.items.push(line.slice(2));
      } else {
        if (buffer?.type !== 'p') { flush(); buffer = { type: 'p', items: [] }; }
        buffer.items.push(line);
      }
    }
    flush();

    return (
      <div key={`${blockKey}-${bi}`}>
        {groups.map((g, gi) => {
          const k = `${blockKey}-${bi}-${gi}`;
          if (g.type === 'p') {
            return (
              <p key={k} className={gi > 0 ? 'mt-3' : ''}>
                {g.items.map((line, li) => (
                  <span key={`${k}-${li}`}>
                    {renderInline(line, `${k}-${li}`)}
                    {li < g.items.length - 1 && <br />}
                  </span>
                ))}
              </p>
            );
          }
          return (
            <ul key={k} className={`terms-bullets space-y-1.5 ${gi > 0 ? 'mt-3' : ''}`}>
              {g.items.map((item, li) => (
                <li key={`${k}-${li}`}>{renderInline(item, `${k}-${li}`)}</li>
              ))}
            </ul>
          );
        })}
      </div>
    );
  });
}

function useSidebarInView() {
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

function smoothScrollTo(id) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  }
}

function FloatingToc({ sections, activeSection, visible }) {
  const [open, setOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeTitle = sections[activeIdx]?.title ?? sections[0].title;
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    // Move focus into the panel for screen-reader users.
    const firstLink = panelRef.current?.querySelector('a[href]');
    firstLink?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleNavClick = useCallback((e, id) => {
    e.preventDefault();
    smoothScrollTo(id);
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-4 right-[4.5rem] z-50 max-w-lg"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 16}px)`,
        transition: 'opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Table of contents"
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
          overflowY: 'auto'
        }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: 'var(--bridge-surface)' }}
        >
          <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.28em' }}>
            Contents
          </span>
          <button
            onClick={() => { setOpen(false); toggleRef.current?.focus(); }}
            aria-label="Close contents"
            className="rounded-full p-1 text-[var(--bridge-text-muted)] outline-none transition-colors hover:text-[var(--bridge-text)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <ul className="p-2">
          {sections.map((s, idx) => {
            const isActive = s.id === activeSection;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => handleNavClick(e, s.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`floating-toc-link relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${isActive ? 'is-active' : ''}`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                  <span
                    className="w-5 shrink-0 text-center text-[11px] tabular-nums"
                    style={{ color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }}
                  >
                    {idx + 1}
                  </span>
                  {s.title.replace(/^\d+\.\s*/, '')}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-bg)]"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 4px 24px -4px var(--bridge-shadow-soft), inset 0 0 0 1px var(--bridge-border)',
          color: 'var(--bridge-text)',
          whiteSpace: 'nowrap',
          maxWidth: 'min(320px, calc(100vw - 2rem))'
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Toggle table of contents"
      >
        <List className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <span className="truncate" style={{ color: 'var(--bridge-text-secondary)' }}>
          {activeIdx + 1}/{sections.length}
        </span>
        <span aria-hidden className="h-3 w-px shrink-0" style={{ backgroundColor: 'var(--bridge-border-strong)' }} />
        <span className="truncate">{activeTitle.replace(/^\d+\.\s*/, '')}</span>
        <ChevronUp
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          style={{ color: 'var(--bridge-text-muted)', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function SidebarLink({ section, isActive }) {
  return (
    <li>
      <a
        href={`#${section.id}`}
        onClick={(e) => { e.preventDefault(); smoothScrollTo(section.id); }}
        aria-current={isActive ? 'location' : undefined}
        className="relative flex items-center rounded-lg px-3 py-1.5 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        style={{
          fontWeight: isActive ? 700 : 500,
          color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
          backgroundColor: isActive
            ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
            : 'transparent'
        }}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-[55%] w-0.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        )}
        <span className="pl-1">{section.title}</span>
      </a>
    </li>
  );
}

export default function Terms() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const articleRef = useRef(null);
  const [sidebarRef, sidebarInView] = useSidebarInView();

  // Contrast audit (item #12): in the modern-signal palette,
  // --bridge-text-secondary and --bridge-text-muted both resolve via the
  // --color-text-* chain to values that exceed 4.5:1 against --bridge-surface
  // and --bridge-bg at the current sizes (13–14px). Confirmed in light + dark.

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const article = articleRef.current;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const total = articleHeight - window.innerHeight;
      const scrolled = Math.max(0, window.scrollY - articleTop);
      setProgress(total > 0 ? Math.min(1, scrolled / total) : 0);
      setShowTop(window.scrollY > 480);

      // Fallback for active section at the document edges, where the
      // IntersectionObserver rootMargin leaves a dead zone.
      const docHeight = document.documentElement.scrollHeight;
      const nearBottom = window.scrollY + window.innerHeight >= docHeight - 80;
      const nearTop = window.scrollY < articleTop + 40;
      if (nearBottom) setActiveId(SECTIONS[SECTIONS.length - 1].id);
      else if (nearTop) setActiveId(SECTIONS[0].id);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 68%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="relative mx-auto max-w-bridge">
        <Reveal className="mb-10 max-w-3xl">
          <p
            className="mb-4 text-[10px] font-black uppercase"
            style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          >
            Legal
          </p>
          <h1
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: 'var(--color-primary)'
            }}
          >
            Terms of Service
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-[13px] font-medium text-[var(--bridge-text-muted)]">
              Last updated: {LAST_UPDATED}
            </p>
            <button
              onClick={() => window.print()}
              aria-label="Print this page"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium text-[var(--bridge-text-secondary)] outline-none transition hover:text-[var(--bridge-text)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <Printer className="h-3 w-3" aria-hidden="true" />
              Print
            </button>
          </div>
        </Reveal>

        <Reveal delay={60} className="mb-12">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <p
              className="mb-5 text-[10px] font-black uppercase"
              style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
            >
              TL;DR — Key Points
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {TLDR.map(({ label, text }) => (
                <div key={label}>
                  <p className="mb-1.5 text-[13px] font-semibold text-[var(--bridge-text)]">{label}</p>
                  <p className="text-[14px] leading-[1.65] text-[var(--bridge-text-secondary)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="flex items-start gap-10">
          <aside
            ref={sidebarRef}
            className="hidden w-56 shrink-0 lg:block"
            style={{ position: 'sticky', top: '6rem', alignSelf: 'flex-start' }}
          >
            <nav
              aria-label="Table of contents"
              className="relative max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl p-5 pt-6"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  transform: `scaleX(${progress})`,
                  transition: 'transform 150ms linear',
                  opacity: 0.65
                }}
              />
              <p
                className="mb-3 px-3 text-[10px] font-black uppercase"
                style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
              >
                Contents
              </p>
              <ul className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <SidebarLink key={s.id} section={s} isActive={s.id === activeId} />
                ))}
              </ul>
            </nav>
          </aside>

          <article ref={articleRef} className="min-w-0 flex-1 space-y-12">
            {SECTIONS.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 border-t border-[var(--bridge-border)] pt-10 [&:first-child]:border-t-0 [&:first-child]:pt-0"
              >
                <h2 className="group flex items-center gap-2 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  {s.title}
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => { e.preventDefault(); smoothScrollTo(s.id); }}
                    className="rounded-sm opacity-0 outline-none transition-opacity group-hover:opacity-60 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    aria-label={`Link to ${s.title}`}
                  >
                    <Hash className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  </a>
                </h2>
                <div className="mt-5 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                  {renderBody(s.body, s.id)}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>

      <FloatingToc sections={SECTIONS} activeSection={activeId} visible={!sidebarInView} />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-bg)]"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 16px rgba(0,0,0,0.08)',
          opacity: showTop ? 1 : 0,
          transform: showTop ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: showTop ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms'
        }}
      >
        <ArrowUp className="h-4 w-4 text-[var(--bridge-text-secondary)]" aria-hidden="true" />
      </button>
    </main>
  );
}
