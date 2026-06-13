import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Shield, Lock, Eye, FileCheck, Check, ChevronUp, Printer,
  Clock, Database, UserCheck, List, X
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { SECTIONS, TLDR, CHIPS, LAST_UPDATED } from './privacyContent';
import { useFooterOffset } from './_legalShared';

// Reading progress scoped to the <article> element — not the whole document —
// so the bar tracks article progress, not page progress (footer doesn't count).
function useReadingProgress(targetRef) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      if (span <= 0) { setProgress(1); return; }
      const p = (window.scrollY - top) / span;
      setProgress(Math.max(0, Math.min(p, 1)));
    };
    window.addEventListener('scroll', fn, { passive: true });
    window.addEventListener('resize', fn);
    fn();
    return () => {
      window.removeEventListener('scroll', fn);
      window.removeEventListener('resize', fn);
    };
  }, [targetRef]);
  return progress;
}

// Accepts SECTIONS directly so the ids list doesn't change identity each render.
function useActiveSection(sections, articleRef) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  // Edge fallback: at top of article, force first; near bottom, force last.
  useEffect(() => {
    const fn = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > 120) { setActive(ids[0]); return; }
      const bottom = rect.bottom;
      if (bottom - window.innerHeight < 240) setActive(ids[ids.length - 1]);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, [ids, articleRef]);

  return active;
}

function useShowBackToTop(threshold = 480) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return show;
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

// Print + hover styles. CSS-variable hover via class selectors so we
// don't carry imperative onMouseEnter/onMouseLeave style mutations
// (those break on mid-hover re-renders).
const PRIVACY_STYLE = `
.pp-link, .pp-icon-btn, .pp-toc-link, .pp-contact-link, .pp-back-top {
  transition: background-color 180ms ease, color 180ms ease;
}
.pp-toc-link:hover:not([data-active="true"]),
.pp-toc-link:focus-visible:not([data-active="true"]) {
  background-color: color-mix(in srgb, var(--color-primary) 6%, transparent);
  color: var(--bridge-text);
}
.pp-icon-btn:hover, .pp-icon-btn:focus-visible {
  color: var(--bridge-text);
}
.pp-contact-link:hover, .pp-contact-link:focus-visible {
  background-color: color-mix(in srgb, var(--color-primary) 16%, transparent);
}
.pp-back-top:hover, .pp-back-top:focus-visible {
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface));
}
.pp-link:focus-visible, .pp-icon-btn:focus-visible, .pp-toc-link:focus-visible,
.pp-contact-link:focus-visible, .pp-back-top:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
@media print {
  nav, aside, footer, .pp-no-print, .fixed, .sticky { display: none !important; }
  body, main { background: #fff !important; color: #000 !important; }
  * { color: #000 !important; background: transparent !important; box-shadow: none !important; }
  h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
  article section { break-inside: avoid; }
  a[href^="http"]::after, a[href^="mailto:"]::after {
    content: " (" attr(href) ")";
    font-size: 0.9em;
  }
}
`;

function TextBody({ paragraphs }) {
  return (
    <div className="mt-5 space-y-4 text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

function GroupsBody({ groups }) {
  return (
    <div className="mt-5 space-y-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p
            className="mb-2 text-[11px] font-bold uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.2em' }}
          >
            {g.label}
          </p>
          <ul className="space-y-1.5">
            {g.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MixedBody({ body, callout }) {
  return (
    <div className="mt-5 space-y-4">
      <p className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
        {body}
      </p>
      <blockquote
        className="relative rounded-xl px-5 py-4 text-[15px] font-semibold leading-snug"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, transparent)',
          borderLeft: '3px solid var(--color-primary)',
          color: 'var(--bridge-text)'
        }}
      >
        {callout}
      </blockquote>
    </div>
  );
}

function RightsBody({ intro, rights, footnote }) {
  // sm 2-col / lg single-col while sidebar consumes width / xl back to 2-col.
  return (
    <div className="mt-4 space-y-4">
      <p className="text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
        {intro}
      </p>
      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {rights.map(({ icon: Icon, label, desc }) => (
          <li
            key={label}
            className="flex items-start gap-3 rounded-xl p-3.5"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 70%, transparent)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text)' }}>{label}</p>
              {/* Contrast note: --bridge-text-muted at 12px against canvas-tinted surface verified ≥ 4.5:1 in both palettes; keep at this size. */}
              <p className="text-[12px] leading-snug" style={{ color: 'var(--bridge-text-muted)' }}>{desc}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>{footnote}</p>
    </div>
  );
}

function SecurityBody({ body, badges }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {badges.map(({ label, note }) => (
          <div
            key={label}
            className="min-w-[120px] rounded-xl px-4 py-2.5"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 70%, transparent)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <p className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>{label}</p>
            <p className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>{note}</p>
          </div>
        ))}
      </div>
      <p className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
        {body}
      </p>
    </div>
  );
}

function ContactBody({ email, note }) {
  return (
    <div className="mt-4 space-y-3">
      <a
        href={`mailto:${email}`}
        className="pp-contact-link inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          color: 'var(--color-primary)',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
        }}
      >
        {email}
      </a>
      {note && (
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--bridge-text-muted)' }}>
          {note}
        </p>
      )}
    </div>
  );
}

function SectionBody({ content }) {
  switch (content.type) {
    case 'text': return <TextBody paragraphs={content.paragraphs} />;
    case 'groups': return <GroupsBody groups={content.groups} />;
    case 'mixed': return <MixedBody body={content.body} callout={content.callout} />;
    case 'rights': return <RightsBody intro={content.intro} rights={content.rights} footnote={content.footnote} />;
    case 'security': return <SecurityBody body={content.body} badges={content.badges} />;
    case 'contact': return <ContactBody email={content.email} note={content.note} />;
    default: return null;
  }
}

function scrollToHash(id) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
}

function FloatingToc({ sections, activeSection, visible, bottomOffset = 0 }) {
  const [open, setOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeTitle = sections[activeIdx]?.title ?? sections[0].title;

  const containerRef = useRef(null);
  const toggleRef = useRef(null);
  const panelId = 'pp-floating-toc-panel';

  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('mousedown', fn);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', fn);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Focus trap while open.
  useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    if (!root) return;
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = root.querySelectorAll('a[href], button:not([disabled])');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', trap);
    return () => root.removeEventListener('keydown', trap);
  }, [open]);

  const handleSectionClick = useCallback((e, id) => {
    e.preventDefault();
    scrollToHash(id);
    setOpen(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pp-no-print fixed left-4 right-[4.5rem] z-50 max-w-lg"
      style={{
        bottom: `calc(1.5rem + ${bottomOffset}px)`,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 16}px)`,
        transition: 'bottom 180ms linear, opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: visible ? 'auto' : 'none'
      }}
      aria-hidden={!visible}
    >
      <div
        id={panelId}
        role="dialog"
        aria-label="Privacy policy contents"
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
          <span
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.28em' }}
          >
            Contents
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close contents"
            className="pp-icon-btn rounded-full p-1"
            style={{ color: 'var(--bridge-text-muted)' }}
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
                  onClick={(e) => handleSectionClick(e, s.id)}
                  data-active={isActive}
                  className="pp-toc-link relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium"
                  style={{
                    color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
                      : 'transparent',
                    fontWeight: isActive ? '600' : '500'
                  }}
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
        className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
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
        <span
          aria-hidden="true"
          className="h-3 w-px shrink-0"
          style={{ backgroundColor: 'var(--bridge-border-strong)' }}
        />
        <span className="truncate">{activeTitle.replace(/^\d+\.\s*/, '')}</span>
        <ChevronUp
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--bridge-text-muted)',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default function Privacy() {
  const articleRef = useRef(null);
  const activeSection = useActiveSection(SECTIONS, articleRef);
  const progress = useReadingProgress(articleRef);
  const showBackToTop = useShowBackToTop();
  const [sidebarRef, sidebarInView] = useSidebarInView();
  const footerOffset = useFooterOffset();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTocClick = useCallback((e, id) => {
    e.preventDefault();
    scrollToHash(id);
  }, []);

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <style>{PRIVACY_STYLE}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 68%)',
          filter: 'blur(80px)'
        }}
      />
      <div className="relative mx-auto max-w-bridge">

        <div
          className="mb-14 flex flex-col gap-6 pb-12 sm:flex-row sm:items-end sm:justify-between"
          style={{ borderBottom: '1px solid var(--bridge-border)' }}
        >
          <div>
            <p
              className="mb-3 text-[10px] font-black uppercase"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.32em' }}
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
              Privacy policy
            </h1>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                <span className="sr-only">Last updated </span>
                <span aria-hidden="true">Last updated: </span>{LAST_UPDATED}
              </p>
              <span aria-hidden="true" style={{ color: 'var(--bridge-border-strong)' }}>·</span>
              <p className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>~6 min read</span>
              </p>
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-2 list-none p-0 m-0" aria-label="Compliance highlights">
            {CHIPS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                  color: 'var(--bridge-text-secondary)',
                  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 16%, transparent)'
                }}
              >
                <Icon className="h-3 w-3 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                {label}
              </li>
            ))}
            <li className="list-none">
              <button
                onClick={() => window.print()}
                aria-label="Print this page"
                className="pp-icon-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
                style={{
                  color: 'var(--bridge-text-muted)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Print
              </button>
            </li>
          </ul>
        </div>

        <Reveal>
          <div
            className="mb-16 overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <div
              className="flex items-center gap-2 px-6 py-3.5"
              style={{ borderBottom: '1px solid var(--bridge-border)' }}
            >
              <span
                className="text-[10px] font-black uppercase"
                style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}
              >
                TL;DR — the short version
              </span>
            </div>
            {/* divide-y/divide-x adapts to any TLDR.length. */}
            <style>{`.pp-tldr-grid{grid-template-columns:repeat(1,minmax(0,1fr))}@media (min-width:640px){.pp-tldr-grid{grid-template-columns:repeat(${TLDR.length},minmax(0,1fr))}}`}</style>
            <div
              className="pp-tldr-grid grid divide-y sm:divide-y-0 sm:divide-x"
              style={{ borderColor: 'var(--bridge-border)' }}
            >
              {TLDR.map(({ icon: Icon, heading, items }) => (
                <div
                  key={heading}
                  className="p-7"
                  style={{ borderColor: 'var(--bridge-border)' }}
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    </span>
                    <p
                      className="font-display font-bold"
                      style={{ fontSize: '1rem', color: 'var(--bridge-text)', letterSpacing: '-0.01em' }}
                    >
                      {heading}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="flex items-start gap-10">

          <aside ref={sidebarRef} className="hidden w-56 shrink-0 lg:block lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label="Privacy policy contents"
              className="relative max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-150"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  transform: `scaleX(${progress})`
                }}
                aria-hidden="true"
              />

              <div className="p-5 pt-6">
                <p
                  className="mb-4 px-2 text-[10px] font-bold uppercase"
                  style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
                >
                  Contents
                </p>
                <ul className="space-y-0.5">
                  {SECTIONS.map((s) => {
                    const isActive = activeSection === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          onClick={(e) => handleTocClick(e, s.id)}
                          data-active={isActive}
                          className="pp-toc-link group relative flex items-center justify-between rounded-lg px-2 py-2 text-[13px] font-medium"
                          style={{
                            color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                            backgroundColor: isActive
                              ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
                              : 'transparent',
                            fontWeight: isActive ? '600' : '500'
                          }}
                          aria-current={isActive ? 'location' : undefined}
                        >
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                          )}
                          <span className="pl-1">{s.title}</span>
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </aside>

          <article ref={articleRef} className="min-w-0 flex-1 space-y-20">
            {SECTIONS.map((s, idx) => (
              <Reveal key={s.id} delay={Math.min(idx * 25, 100)}>
                <div
                  id={s.id}
                  className={`scroll-mt-28 pt-12 ${idx > 0 ? 'border-t border-[var(--bridge-border)]' : ''}`}
                >
                  <h2
                    className="font-display text-xl font-semibold sm:text-2xl"
                    style={{ color: 'var(--bridge-text)' }}
                  >
                    {s.title}
                  </h2>
                  <SectionBody content={s.content} />
                </div>
              </Reveal>
            ))}
          </article>
        </div>

      </div>

      <FloatingToc
        sections={SECTIONS}
        activeSection={activeSection}
        visible={!sidebarInView}
        bottomOffset={footerOffset}
      />

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className="pp-back-top pp-no-print fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 16px -4px var(--bridge-shadow-soft)',
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: showBackToTop ? 'auto' : 'none',
          transition: 'opacity 300ms ease, transform 300ms ease, background-color 180ms ease'
        }}
      >
        <ChevronUp className="h-4 w-4" style={{ color: 'var(--bridge-text-secondary)' }} aria-hidden="true" />
      </button>
    </main>
  );
}
