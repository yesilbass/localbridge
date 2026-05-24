import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart } from 'lucide-react';
import AppLink from '../../components/AppLink';
import { resolveAuthEntryPath } from '../../utils/authNav';
import { formatRoleHeadline } from './mentorMeta';
import { useAuth } from '../../context/useAuth';

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const DARK_BG = 'linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 50%, black), color-mix(in srgb, var(--color-primary) 22%, black))';

const SECTION_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'industries', label: 'Industries' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'experience', label: 'Experience' },
  { id: 'reviews', label: 'Reviews' },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      } else if (y <= 40 || y < lastY - 5) {
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

export default function MentorProfileNav({
  mentor,
  heroCtaRef,
  isFavorited,
  onToggleFavorite,
  embedded = false,
}) {
  const { user } = useAuth();
  const [pastHero, setPastHero] = useState(false);
  const visible = useRevealOnScrollUp(pastHero);

  const backPath = embedded ? '/dashboard/mentors' : resolveAuthEntryPath('/mentors', user);
  const BackTag = embedded ? Link : AppLink;
  const roleHeadline = formatRoleHeadline(mentor.title, mentor.company);

  useEffect(() => {
    const el = heroCtaRef?.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px 0px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [heroCtaRef, mentor?.id]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          role="navigation"
          aria-label="Mentor profile"
          className="fixed inset-x-0 top-0 z-50"
          initial={{ y: -72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -72, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'color-mix(in srgb, var(--bridge-surface) 94%, transparent)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 1px 0 var(--bridge-border), 0 12px 40px -20px rgba(0,0,0,0.15)',
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-10">
            <BackTag
              to={backPath}
              className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors sm:inline-flex ${ring}`}
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Mentors
            </BackTag>

            <div
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full sm:h-10 sm:w-10"
              style={{ background: DARK_BG, boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              {mentor.avatarUrl ? (
                <img src={mentor.avatarUrl} alt="" className="h-full w-full object-cover object-top" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-black text-white/90">
                  {(mentor.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 shrink sm:max-w-[12rem] lg:max-w-[14rem]">
              <p className="truncate text-[14px] font-bold leading-tight" style={{ color: 'var(--bridge-text)' }}>
                {mentor.name}
              </p>
              {roleHeadline && (
                <p className="truncate text-[11px] leading-tight" style={{ color: 'var(--bridge-text-muted)' }}>
                  {roleHeadline}
                </p>
              )}
            </div>

            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-2 md:flex"
              aria-label="Profile sections"
            >
              {SECTION_LINKS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${ring}`}
                  style={{ color: 'var(--bridge-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bridge-surface-muted)';
                    e.currentTarget.style.color = 'var(--bridge-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--bridge-text-secondary)';
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>

            {user && (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-pressed={isFavorited}
                  aria-label={isFavorited ? 'Remove from saved' : 'Save mentor'}
                  onClick={onToggleFavorite}
                  className={`hidden h-9 w-9 items-center justify-center rounded-full transition sm:flex ${ring}`}
                  style={{
                    background: 'var(--bridge-surface-muted)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    color: isFavorited ? 'var(--color-primary)' : 'var(--bridge-text-secondary)',
                  }}
                >
                  <Heart className="h-4 w-4" style={{ fill: isFavorited ? 'currentColor' : 'none' }} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
