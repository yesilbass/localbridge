import { Briefcase, Building2, CalendarRange, ChevronRight, Clock, Sparkles } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { buildCareerStats, buildExperienceCards, mentorHasExperience } from '../../utils/experienceCards';
import {
  badgeClass,
  bodyClass,
  calloutClass,
  cardTitleClass,
  metaClass,
  sectionLeadClass,
  sectionTitleClass,
  sectionTitleStyle,
  statBadgeClass,
} from './profileType';

const LEVEL_STYLES = {
  executive: 'var(--color-primary)',
  leadership: 'var(--color-accent)',
  senior: 'var(--color-info, #0ea5e9)',
  early: 'var(--color-success, #059669)',
  operator: 'var(--bridge-text-secondary)',
};

function CompanyMark({ company }) {
  const initials = (company ?? '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-black uppercase tracking-tight"
      style={{
        background: 'color-mix(in srgb, var(--color-primary) 11%, var(--bridge-surface-muted))',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 26%, transparent)',
        color: 'var(--color-primary)',
      }}
      aria-hidden
    >
      {initials || '?'}
    </div>
  );
}

function ExperienceRow({ card, index, isLast }) {
  const levelColor = LEVEL_STYLES[card.level.tone] ?? LEVEL_STYLES.operator;

  return (
    <Reveal delay={index * 45}>
      <article className="relative grid gap-6 pb-12 lg:grid-cols-[4.5rem_1fr] lg:gap-10 lg:pb-16">
        <div className="relative flex flex-col items-center">
          <CompanyMark company={card.company} />
          {!isLast && (
            <div
              className="absolute top-[3.75rem] bottom-0 w-px"
              style={{ background: 'linear-gradient(180deg, var(--bridge-border) 0%, transparent 100%)' }}
              aria-hidden
            />
          )}
        </div>

        <div className="min-w-0 pt-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cardTitleClass} style={{ color: 'var(--bridge-text)' }}>
                  {card.role}
                </h3>
                {card.isCurrent && (
                  <span
                    className={badgeClass}
                    style={{
                      background: 'color-mix(in srgb, var(--color-success, #059669) 12%, transparent)',
                      color: 'var(--color-success, #059669)',
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
              <p className={`mt-1.5 ${metaClass}`} style={{ color: 'var(--color-primary)' }}>
                {card.company}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 tabular-nums ${metaClass}`}
                style={{
                  backgroundColor: 'var(--bridge-surface-muted)',
                  color: 'var(--bridge-text-secondary)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <CalendarRange className="h-4 w-4 shrink-0" aria-hidden />
                {card.startYear}–{card.endYear ?? 'Present'}
              </span>
              {card.duration && (
                <span className={metaClass} style={{ color: 'var(--bridge-text-muted)' }}>
                  {card.duration}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <span
              className={badgeClass}
              style={{
                background: `color-mix(in srgb, ${levelColor} 10%, var(--bridge-surface-muted))`,
                color: levelColor,
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${levelColor} 22%, transparent)`,
              }}
            >
              {card.level.label}
            </span>
          </div>

          <p className={`mt-5 max-w-3xl ${bodyClass}`} style={{ color: 'var(--bridge-text-secondary)' }}>
            {card.narrative}
          </p>

          <p
            className={`mt-6 ${calloutClass}`}
            style={{
              backgroundColor: 'var(--bridge-surface-muted)',
              color: 'var(--bridge-text)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <span>
              <span className="font-bold">Book for:</span> {card.sessionHook}
            </span>
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export default function TrackRecord({ mentor }) {
  if (!mentor || !mentorHasExperience(mentor)) return null;

  const firstName = mentor.firstName ?? mentor.name?.split(/\s+/)[0] ?? 'this mentor';
  const cards = buildExperienceCards(mentor);
  const stats = buildCareerStats(mentor);
  const overflow = (mentor.careerHistory?.length ?? 0) - cards.length;

  return (
    <section id="experience" aria-labelledby="career-heading" className="mt-24 scroll-mt-24">
      <div
        className="overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 0 0 1px var(--bridge-border), 0 28px 80px -48px color-mix(in srgb, var(--color-primary) 24%, transparent)',
        }}
      >
        <div
          className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16"
          style={{
            background: 'linear-gradient(165deg, color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface)) 0%, var(--bridge-surface) 45%)',
            borderBottom: '1px solid var(--bridge-border)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 id="career-heading" className={sectionTitleClass} style={sectionTitleStyle}>
                Experience
              </h2>
              <p className={sectionLeadClass} style={{ color: 'var(--bridge-text-secondary)' }}>
                {stats?.currentRole
                  ? `From ${stats.currentRole.company ?? 'their current team'} backward — each stop is context ${firstName} still uses in sessions today.`
                  : `A reverse-chronological path through the teams and titles that shaped ${firstName}'s advice.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {stats?.spanYears ? (
                <span className={statBadgeClass} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                  <Clock className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  {stats.spanYears}+ year arc
                </span>
              ) : null}
              <span className={statBadgeClass} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <Briefcase className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
                {stats.roleCount} {stats.roleCount === 1 ? 'role' : 'roles'}
              </span>
              <span className={statBadgeClass} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <Building2 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
                {stats.companyCount} {stats.companyCount === 1 ? 'company' : 'companies'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          {cards.map((card, index) => (
            <ExperienceRow
              key={card.id}
              card={card}
              index={index}
              isLast={index === cards.length - 1 && overflow <= 0}
            />
          ))}

          {overflow > 0 && (
            <p className={`pl-[4.25rem] ${metaClass} lg:pl-[4.75rem]`} style={{ color: 'var(--bridge-text-muted)' }}>
              + {overflow} earlier {overflow === 1 ? 'role' : 'roles'}
              {mentor.earlierCompanyHighlight ? ` including work at ${mentor.earlierCompanyHighlight}` : ''}
            </p>
          )}
        </div>

        {stats?.currentRole && (
          <div
            className="flex flex-col gap-3 px-8 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14"
            style={{ borderTop: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p className={bodyClass} style={{ color: 'var(--bridge-text-secondary)' }}>
              <span className="font-bold" style={{ color: 'var(--bridge-text)' }}>Today:</span>{' '}
              {stats.currentRole.role} at {stats.currentRole.company}
            </p>
            <p className={`inline-flex items-center gap-1.5 ${metaClass}`} style={{ color: 'var(--color-primary)' }}>
              <ChevronRight className="h-4 w-4" aria-hidden />
              Sessions reflect what {firstName} is learning right now
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
