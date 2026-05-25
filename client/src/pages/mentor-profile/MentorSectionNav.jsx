import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMentorProfileNavHidden } from '../../hooks/useMentorProfileNavHidden';
import { profileScrollOffsetPx, profileStickyNavTop } from '../../utils/mentorProfileLayout';

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

const STICKY_NAV_STYLE = {
  borderColor: 'var(--bridge-border)',
  backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 94%, transparent)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 1px 0 var(--bridge-border)',
};

function scrollToSection(id, { embedded, primaryNavHidden }) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = profileScrollOffsetPx(embedded, primaryNavHidden);
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ behavior: 'smooth', top: Math.max(0, top) });
}

function useRevealOnScrollUp(pastHero) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      const y = Math.max(window.scrollY, 0);

      if (!pastHero) {
        setRevealed(false);
      } else if (y < lastY - 5) {
        setRevealed(true);
      } else if (y > lastY + 5) {
        setRevealed(false);
      }

      lastY = y;
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pastHero]);

  return pastHero && revealed;
}

function NavBar({ links, copied, onCopy, scrollOpts, className = '' }) {
  return (
    <div className={`flex w-full items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-12 ${className}`}>
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto sm:gap-4 lg:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id, scrollOpts)}
            className={`shrink-0 rounded-md px-2 py-1.5 text-base font-semibold transition-colors sm:px-3 ${ring}`}
            style={{ color: 'var(--color-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 8%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onCopy}
        className={`inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-base font-semibold transition-colors sm:px-3 ${ring}`}
        style={{ color: 'var(--color-primary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 8%, transparent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span className="hidden min-[480px]:inline">{copied ? 'Link copied' : 'Copy profile link'}</span>
        <span className="min-[480px]:hidden">{copied ? 'Copied' : 'Copy'}</span>
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

export default function MentorSectionNav({ reviewCount = 0, heroCtaRef, inHero = false, embedded = false }) {
  const [copied, setCopied] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const stickyVisible = useRevealOnScrollUp(pastHero);
  const primaryNavHidden = useMentorProfileNavHidden(true);
  const stickyTop = profileStickyNavTop(embedded, primaryNavHidden);
  const scrollOpts = { embedded, primaryNavHidden };

  const links = [
    { id: 'about', label: 'Profile' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'toolkit', label: 'Toolkit' },
    {
      id: 'reviews',
      label: reviewCount > 0 ? `Reviews (${reviewCount})` : 'Reviews',
    },
    { id: 'posts', label: 'Posts' },
  ];

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = heroCtaRef?.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [heroCtaRef]);

  const inlineNavStyle = inHero
    ? { backgroundColor: 'transparent' }
    : {
        borderColor: 'var(--bridge-border)',
        backgroundColor: 'var(--bridge-surface)',
      };

  const inlineNavClass = inHero ? 'w-full' : 'w-full border-b';

  return (
    <>
      <nav
        aria-label="Profile sections"
        className={inlineNavClass}
        style={inlineNavStyle}
      >
        <NavBar links={links} copied={copied} onCopy={copyLink} scrollOpts={scrollOpts} />
      </nav>

      {createPortal(
        <AnimatePresence>
          {stickyVisible && (
            <motion.nav
              aria-label="Profile sections"
              className="fixed inset-x-0 z-[100] border-b"
              style={{ ...STICKY_NAV_STYLE, top: stickyTop }}
              initial={{ y: -56, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -56, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <NavBar links={links} copied={copied} onCopy={copyLink} scrollOpts={scrollOpts} />
            </motion.nav>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
