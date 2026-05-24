import {
  Briefcase,
  ChevronRight,
  Layers3,
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { groupMentorTags } from '../../utils/mentorDisplay';
import { buildExpertiseCards } from '../../utils/expertiseCards';
import { SESSION_TYPES } from '../../constants/sessionTypes';
import {
  badgeClass,
  bodyClass,
  cardTitleClass,
  chipClass,
  labelClass,
  listItemClass,
  sectionLeadClass,
  sectionTitleClass,
  sectionTitleStyle,
  statBadgeClass,
  subpanelClass,
  subpanelStyle,
} from './profileType';

const SESSION_MAP = Object.fromEntries(SESSION_TYPES.map((t) => [t.key, t]));

function ExpertiseRow({ card, index }) {
  const Icon = card.icon;
  const sessions = card.sessionKeys.map((k) => SESSION_MAP[k]).filter(Boolean);

  return (
    <Reveal delay={index * 50}>
      <article
        className="group relative grid gap-6 py-10 lg:grid-cols-[5.5rem_1fr] lg:gap-10 lg:py-12"
        style={{ borderBottom: '1px solid var(--bridge-border)' }}
      >
        <div className="flex items-start gap-4 lg:flex-col lg:items-center lg:pt-1">
          <span
            className="font-display text-sm font-black tabular-nums"
            style={{ color: 'var(--bridge-text-faint)' }}
            aria-hidden
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-[1.04]"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 11%, var(--bridge-surface-muted))',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 24%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className={cardTitleClass} style={{ color: 'var(--bridge-text)' }}>
              {card.title}
            </h3>
            {sessions.map((session) => (
              <span
                key={session.key}
                className={badgeClass}
                style={{
                  background: `color-mix(in srgb, ${session.hueVar} 10%, var(--bridge-surface-muted))`,
                  color: session.hueVar,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${session.hueVar} 22%, transparent)`,
                }}
              >
                {session.icon} {session.name}
              </span>
            ))}
          </div>

          <p className={`mt-4 max-w-3xl ${bodyClass}`} style={{ color: 'var(--bridge-text-secondary)' }}>
            {card.description}
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className={subpanelClass} style={subpanelStyle}>
              <p className={labelClass} style={{ color: 'var(--bridge-text-faint)' }}>
                You&apos;ll leave with
              </p>
              <ul className="mt-3 space-y-2.5">
                {card.takeaways.map((item) => (
                  <li key={item} className={listItemClass} style={{ color: 'var(--bridge-text)' }}>
                    <ChevronRight
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {card.relatedTools.length > 0 && (
              <div className={subpanelClass} style={subpanelStyle}>
                <p className={labelClass} style={{ color: 'var(--bridge-text-faint)' }}>
                  Tools in session
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.relatedTools.map((tool) => (
                    <span
                      key={tool}
                      className={chipClass}
                      style={{
                        backgroundColor: 'var(--bridge-surface)',
                        color: 'var(--bridge-text-secondary)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function ExpertiseToolkitSection({ mentor, rawMentor }) {
  const groups = groupMentorTags(rawMentor ?? mentor);
  if (!groups.hasAny) return null;

  const source = rawMentor ?? mentor;
  const firstName = mentor?.firstName ?? mentor?.name?.split(/\s+/)[0] ?? 'this mentor';
  const years = source?.years_experience ?? mentor?.yearsExperience;
  const cards = buildExpertiseCards(mentor ?? source, groups);
  const overflowExpertise = groups.expertise.slice(cards.length);

  return (
    <section id="expertise" aria-labelledby="expertise-toolkit-heading" className="mt-24 scroll-mt-[calc(var(--profile-primary-nav-h,5.25rem)+3.5rem)]">
      <div
        className="overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 0 0 1px var(--bridge-border), 0 28px 80px -48px color-mix(in srgb, var(--color-primary) 28%, transparent)',
        }}
      >
        <div
          className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16"
          style={{
            background: 'linear-gradient(165deg, color-mix(in srgb, var(--color-primary) 7%, var(--bridge-surface)) 0%, var(--bridge-surface) 42%)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 id="expertise-toolkit-heading" className={sectionTitleClass} style={sectionTitleStyle}>
                Expertise
              </h2>
              <p className={sectionLeadClass} style={{ color: 'var(--bridge-text-secondary)' }}>
                {years
                  ? `${years}+ years in the field — each area below is a lane mentees book ${firstName} for repeatedly, with session types and outcomes spelled out.`
                  : `Each area below is a lane mentees book ${firstName} for — with session types, tools, and outcomes spelled out upfront.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {years ? (
                <span className={statBadgeClass} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                  <Layers3 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  {years}+ years experience
                </span>
              ) : null}
              {groups.expertise.length > 0 && (
                <span className={statBadgeClass} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                  <Briefcase className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  {groups.expertise.length} expertise {groups.expertise.length === 1 ? 'area' : 'areas'}
                </span>
              )}
            </div>
          </div>
        </div>

        {cards.length > 0 && (
          <div className="px-8 sm:px-10 lg:px-14">
            {cards.map((card, index) => (
              <ExpertiseRow key={card.id} card={card} index={index} />
            ))}
          </div>
        )}

        {overflowExpertise.length > 0 && (
          <div
            className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
            style={{ borderTop: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p className={labelClass} style={{ color: 'var(--bridge-text-faint)' }}>
              Also covers
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overflowExpertise.map((tag) => (
                <span
                  key={tag}
                  className={chipClass}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
