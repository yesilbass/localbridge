import { Clock, MessageSquare, Wrench } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { groupMentorTags } from '../../utils/mentorDisplay';
import { buildToolkitCards } from '../../utils/toolkitCards';
import {
  badgeClass,
  bodyClass,
  calloutClass,
  cardTitleClass,
  chipClass,
  labelClass,
  metaClass,
  sectionLeadClass,
  sectionTitleClass,
  sectionTitleStyle,
  statBadgeClass,
} from './profileType';

function ToolkitRow({ card, index }) {
  return (
    <Reveal delay={index * 45}>
      <article
        className="group grid gap-6 py-10 lg:grid-cols-[4.5rem_1fr] lg:gap-10 lg:py-12"
        style={{ borderBottom: '1px solid var(--bridge-border)' }}
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-black uppercase tracking-tight transition-transform duration-300 group-hover:scale-[1.04]"
          style={{
            background: `color-mix(in srgb, ${card.hue} 14%, var(--bridge-surface-muted))`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${card.hue} 30%, transparent)`,
            color: card.hue,
          }}
          aria-hidden
        >
          {card.monogram}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className={cardTitleClass} style={{ color: 'var(--bridge-text)' }}>
              {card.name}
            </h3>
            {card.tenure ? (
              <span className={`inline-flex items-center gap-1.5 ${metaClass}`} style={{ color: 'var(--bridge-text-muted)' }}>
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                {card.tenure}+ years of experience
              </span>
            ) : null}
            <span
              className={badgeClass}
              style={{
                background: `color-mix(in srgb, ${card.hue} 10%, var(--bridge-surface-muted))`,
                color: card.hue,
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${card.hue} 22%, transparent)`,
              }}
            >
              {card.proficiency}
            </span>
          </div>

          <p className={`mt-4 max-w-3xl ${bodyClass}`} style={{ color: 'var(--bridge-text-secondary)' }}>
            {card.description}
          </p>

          <p
            className={`mt-7 ${calloutClass}`}
            style={{
              backgroundColor: 'var(--bridge-surface-muted)',
              color: 'var(--bridge-text)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" style={{ color: card.hue }} aria-hidden />
            <span>
              <span className="font-bold">Ask about:</span>{' '}
              {card.askAbout}
            </span>
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export default function ToolkitSection({ mentor, rawMentor }) {
  const groups = groupMentorTags(rawMentor ?? mentor);
  if (!groups.tools.length) return null;

  const source = rawMentor ?? mentor;
  const firstName = mentor?.firstName ?? mentor?.name?.split(/\s+/)[0] ?? 'this mentor';
  const years = source?.years_experience ?? mentor?.yearsExperience;
  const cards = buildToolkitCards(mentor ?? source, groups.tools);
  const overflow = groups.tools.slice(cards.length);

  return (
    <section id="toolkit" aria-labelledby="toolkit-heading" className="mt-24 scroll-mt-[calc(var(--profile-primary-nav-h,5.25rem)+3.5rem)]">
      <div
        className="overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 0 0 1px var(--bridge-border), 0 28px 80px -48px color-mix(in srgb, var(--color-accent) 22%, transparent)',
        }}
      >
        <div
          className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16"
          style={{
            background: 'linear-gradient(165deg, color-mix(in srgb, var(--color-accent) 6%, var(--bridge-surface)) 0%, var(--bridge-surface) 45%)',
            borderBottom: '1px solid var(--bridge-border)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 id="toolkit-heading" className={sectionTitleClass} style={sectionTitleStyle}>
                Toolkit
              </h2>
              <p className={sectionLeadClass} style={{ color: 'var(--bridge-text-secondary)' }}>
                {years
                  ? `Not a badge list — each tool below reflects ${years}+ years of operator context. Book ${firstName} to screen-share, debug, or rebuild how you use them.`
                  : `Each tool below comes with real operator context. Book ${firstName} to screen-share, debug, or rebuild how you use them.`}
              </p>
            </div>

            <span className={`${statBadgeClass} self-start lg:self-auto`} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              <Wrench className="h-4 w-4" style={{ color: 'var(--color-accent)' }} aria-hidden />
              {groups.tools.length} {groups.tools.length === 1 ? 'tool' : 'tools'} in stack
            </span>
          </div>
        </div>

        <div className="px-8 sm:px-10 lg:px-14">
          {cards.map((card, index) => (
            <ToolkitRow key={card.id} card={card} index={index} />
          ))}
        </div>

        {overflow.length > 0 && (
          <div
            className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14"
            style={{ borderTop: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p className={labelClass} style={{ color: 'var(--bridge-text-faint)' }}>
              Also in the stack
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overflow.map((tool) => (
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
    </section>
  );
}
