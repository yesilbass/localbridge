import { Link } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import { Play } from 'lucide-react';
import { ALL_MENTORS } from './landingData';
import RevealOnScroll from './RevealOnScroll';
import { usePerfTier } from './landingHooks';
import { useI18n } from '../../i18n';

// Dark video-call background gradients per mentor tone
const TONE_BG = {
  amber:   'linear-gradient(145deg, #0c0b1a 0%, #1e1440 60%, #312e7a 100%)',
  emerald: 'linear-gradient(145deg, #0a0e0c 0%, #0d2818 60%, #065f46 100%)',
  sky:     'linear-gradient(145deg, #090d18 0%, #0c1c38 60%, #0369a1 100%)',
  rose:    'linear-gradient(145deg, #100816 0%, #1e0a2e 60%, #6b21a8 100%)',
  violet:  'linear-gradient(145deg, #0d0a1a 0%, #150a2e 60%, #5b21b6 100%)',
  teal:    'linear-gradient(145deg, #080e0e 0%, #0a1c1c 60%, #0d9488 100%)',
  orange:  'linear-gradient(145deg, #0c0b18 0%, #181028 60%, #4f46e5 100%)',
  pink:    'linear-gradient(145deg, #090918 0%, #0a0a2c 60%, #3730a3 100%)'
};

const SESSION_LABELS = ['Career Pivot', 'Interview Prep', 'Salary Negotiation', 'PM Strategy', 'Engineering', 'Design Review', 'Fundraising', 'Growth', 'Leadership', 'Resume Review', 'System Design', 'Data Science'];
const DURATIONS = ['38 min', '52 min', '45 min', '61 min', '29 min', '48 min', '55 min', '41 min', '34 min', '58 min', '44 min', '37 min'];

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function VideoCard({ mentor, sessionIdx }) {
  const session = SESSION_LABELS[sessionIdx % SESSION_LABELS.length];
  const duration = DURATIONS[sessionIdx % DURATIONS.length];

  return (
    <AppLink
      to={`/mentors/${mentor.id}`}
      aria-label={`${mentor.name} — ${session}`}
      className="group relative shrink-0 overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        width: 210,
        height: 148,
        background: TONE_BG[mentor.tone] || TONE_BG.sky,
        outlineColor: 'var(--color-primary)',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.5)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 16px 40px -10px rgba(0,0,0,0.55)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 4px 20px -8px rgba(0,0,0,0.5)';
      }}
    >
      {/* Faded giant initials — depth layer */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -12,
          right: -8,
          fontSize: 88,
          fontWeight: 900,
          color: 'white',
          opacity: 0.055,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          pointerEvents: 'none',
          fontFamily: 'var(--font-display, system-ui)',
          userSelect: 'none'
        }}
      >
        {initialsOf(mentor.name)}
      </div>

      {/* Scanline texture overlay — mimics video grain */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none'
        }}
      />

      {/* Top row: session type + duration */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '3px 8px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.14)',
            color: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            whiteSpace: 'nowrap'
          }}
        >
          {session}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            whiteSpace: 'nowrap'
          }}
        >
          {duration}
        </span>
      </div>

      {/* Center: play button */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            height: 40,
            width: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.22)',
            transition: 'background 0.2s ease, transform 0.2s ease'
          }}
          className="group-hover:bg-white/25 group-hover:scale-110"
        >
          <Play
            aria-hidden="true"
            style={{
              width: 13,
              height: 13,
              fill: 'white',
              color: 'white',
              marginLeft: 2
            }}
          />
        </div>
      </div>

      {/* Bottom: mentor info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 10px 10px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)'
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {mentor.name}
        </p>
        <p
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {mentor.title}
        </p>
      </div>

      {/* Online dot */}
      {mentor.online && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 0 2px rgba(16,185,129,0.35)'
          }}
        />
      )}
    </AppLink>
  );
}

// Double the array for seamless loop, assign stable session indices
const CARDS = [...ALL_MENTORS, ...ALL_MENTORS].map((m, i) => ({ mentor: m, idx: i }));

export default function MentorVideoStrip() {
  const { t } = useI18n();
  const tier = usePerfTier();
  const animate = tier !== 'low';

  return (
    <section
      aria-labelledby="video-strip-heading"
      className="relative py-10 sm:py-12 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-7">
        <RevealOnScroll variant="up">
          <p
            id="video-strip-heading"
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}
          >
            {t('landing.videoStrip.eyebrow', 'Actual sessions')}
          </p>
          <p
            className="mt-2 font-display font-black"
            style={{
              fontSize: 'clamp(1.35rem, 2.8vw, 2rem)',
              letterSpacing: '-0.028em',
              lineHeight: 1.1,
              color: 'var(--bridge-text)'
            }}
          >
            {t('landing.videoStrip.heading', 'See how Bridge sessions run.')}
          </p>
        </RevealOnScroll>
      </div>

      {/* Marquee strip */}
      <div
        className="b-mask-x"
        style={{ overflow: 'hidden' }}
      >
        <div
          className={animate ? 'b-ticker' : ''}
          style={{
            display: 'flex',
            gap: 12,
            paddingLeft: 20,
            paddingRight: 20,
            willChange: animate ? 'transform' : 'auto',
            backfaceVisibility: 'hidden'
          }}
        >
          {CARDS.map(({ mentor, idx }) => (
            <VideoCard
              key={`${mentor.id}-${idx}`}
              mentor={mentor}
              sessionIdx={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
