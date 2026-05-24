import { Linkedin, Github, Mail } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { mailtoHref } from '../../config/contact';
import { EASE, DUR_SHORT } from '../landing/landingHooks';
import { ABOUT_SECTION_PAD, TEAM_FEATURED, TEAM_SMALL } from './aboutData';
import { useContent } from '../../content';

const SOCIAL_RESET = (e) => {
  e.currentTarget.style.color = 'var(--bridge-text-secondary)';
  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
};

const SOCIAL_HOVER = (e) => {
  e.currentTarget.style.color = 'var(--color-primary)';
  e.currentTarget.style.boxShadow =
    'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)';
};

const CARD_RESET = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow =
    'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 18%, transparent)';
};

const CARD_HOVER = (e) => {
  e.currentTarget.style.transform = 'translateY(-2px)';
  e.currentTarget.style.boxShadow =
    'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 12px 32px -10px var(--bridge-shadow-soft), 0 32px 70px -22px color-mix(in srgb, var(--color-primary) 30%, transparent)';
};

const CARD_BASE_BOX_SHADOW =
  'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 18%, transparent)';

const CARD_TRANSITION = `transform ${DUR_SHORT}s cubic-bezier(${EASE.join(',')}), box-shadow ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`;

const SOCIAL_TRANSITION = `color ${DUR_SHORT}s cubic-bezier(${EASE.join(',')}), box-shadow ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`;

export default function TeamSection() {
  const { s } = useContent();
  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className={ABOUT_SECTION_PAD}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em'
            }}
          >
            {s.about.teamEyebrow}
          </p>

          <h2
            id="team-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              The five people
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              behind Bridge.
            </span>
          </h2>

          <p
            className="mt-7 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6
            }}
          >
            Operators first, founders second. We hand-vet every mentor and read every review.
          </p>
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:grid-rows-2 lg:auto-rows-fr">
          <RevealOnScroll className="sm:col-span-2 lg:col-span-6 lg:row-span-2 h-full">
            <FeaturedCard m={TEAM_FEATURED} />
          </RevealOnScroll>

          {TEAM_SMALL.map((m, i) => (
            <RevealOnScroll
              key={m.name}
              delay={(i + 1) * 80}
              className="lg:col-span-3 lg:row-span-1 h-full"
            >
              <SmallCard m={m} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function MonogramBlock({ initials, size = 'large' }) {
  const fontSize =
    size === 'large'
      ? 'clamp(96px, 14vw, 160px)'
      : 'clamp(56px, 9vw, 88px)';
  const aspect =
    size === 'large'
      ? 'aspect-[4/5] sm:aspect-[16/9] lg:aspect-auto lg:flex-1 lg:min-h-[280px]'
      : 'aspect-square';
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden ${aspect}`}
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 92%, var(--bridge-text)) 0%, var(--color-primary) 100%)'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          aria-hidden="true"
          className="font-display font-black"
          style={{
            color: 'var(--color-on-primary)',
            fontSize,
            letterSpacing: '-0.04em',
            lineHeight: 1
          }}
        >
          {initials}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-bridge-noise"
        style={{ opacity: 0.1, mixBlendMode: 'overlay' }}
      />
    </div>
  );
}

function FeaturedCard({ m }) {
  return (
    <article
      className="rounded-3xl overflow-hidden h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: CARD_BASE_BOX_SHADOW,
        transition: CARD_TRANSITION
      }}
      onMouseEnter={CARD_HOVER}
      onMouseLeave={CARD_RESET}
    >
      <MonogramBlock initials={m.initials} size="large" />
      <div className="p-6 sm:p-8 shrink-0">
        <p
          className="text-[11px] uppercase font-bold"
          style={{
            color: 'var(--bridge-text-secondary)',
            letterSpacing: '0.22em'
          }}
        >
          Founder &amp; {m.discipline}
        </p>
        <h3
          className="mt-3 font-display font-black"
          style={{
            fontSize: 'clamp(1.625rem, 3vw, 1.875rem)',
            color: 'var(--bridge-text)',
            letterSpacing: '-0.025em',
            lineHeight: 1.05
          }}
        >
          {m.name}
        </h3>
        <p
          className="text-[14px]"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          {m.role} &middot; {m.focus}
        </p>
        <p
          className="mt-4 text-[13px] leading-relaxed"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          {m.bio}
        </p>
        <SocialRow member={m} size="md" />
      </div>
    </article>
  );
}

function SmallCard({ m }) {
  return (
    <article
      className="rounded-3xl overflow-hidden h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: CARD_BASE_BOX_SHADOW,
        transition: CARD_TRANSITION
      }}
      onMouseEnter={CARD_HOVER}
      onMouseLeave={CARD_RESET}
    >
      <MonogramBlock initials={m.initials} size="small" />
      <div className="p-4 mt-auto">
        <p
          className="font-display font-black text-[15px]"
          style={{ color: 'var(--bridge-text)', letterSpacing: '-0.015em' }}
        >
          {m.name}
        </p>
        <p
          className="text-[11px] truncate"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {m.role} &middot; {m.focus}
        </p>
        <SocialRow member={m} size="sm" />
      </div>
    </article>
  );
}

function SocialRow({ member, size }) {
  const wrapperClass =
    size === 'md'
      ? 'mt-6 flex flex-wrap items-center gap-3'
      : 'mt-2 flex flex-wrap items-center gap-2';
  const mailHref = mailtoHref({
    subject: `Bridge — note for ${member.name}`
  });

  return (
    <div className={wrapperClass}>
      {member.linkedinUrl ? (
        <SocialLink
          href={member.linkedinUrl}
          external
          size={size}
          aria-label={`${member.name} on LinkedIn (opens in a new tab)`}
        >
          <Linkedin className={size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} aria-hidden="true" />
        </SocialLink>
      ) : null}
      {member.githubUrl ? (
        <SocialLink
          href={member.githubUrl}
          external
          size={size}
          aria-label={`${member.name} on GitHub (opens in a new tab)`}
        >
          <Github className={size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} aria-hidden="true" />
        </SocialLink>
      ) : null}
      <SocialLink
        href={mailHref}
        size={size}
        aria-label={`Email ${member.name}`}
      >
        <Mail className={size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} aria-hidden="true" />
      </SocialLink>
    </div>
  );
}

function SocialLink({ href, external, size, children, ...rest }) {
  const dim = size === 'md' ? 'h-9 w-9' : 'h-7 w-7';
  return (
    <a
      href={href}
      {...(external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      className={`${dim} rounded-full inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2`}
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        color: 'var(--bridge-text-secondary)',
        outlineColor: 'var(--color-primary)',
        transition: SOCIAL_TRANSITION
      }}
      onMouseEnter={SOCIAL_HOVER}
      onMouseLeave={SOCIAL_RESET}
      onFocus={SOCIAL_HOVER}
      onBlur={SOCIAL_RESET}
      {...rest}
    >
      {children}
    </a>
  );
}
