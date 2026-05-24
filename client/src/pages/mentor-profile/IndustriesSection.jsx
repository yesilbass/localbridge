import { Building2, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { groupMentorTags } from '../../utils/mentorDisplay';
import { buildIndustryCards, mentorHasIndustries } from '../../utils/industryCards';
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
  subpanelClass,
  subpanelStyle,
} from './profileType';

function IndustryRow({ card, index }) {
  const Icon = card.icon;

  return (
    <Reveal delay={index * 45}>
      <article
        className="group grid gap-6 py-10 lg:grid-cols-[4.5rem_1fr] lg:gap-10 lg:py-12"
        style={{ borderBottom: '1px solid var(--bridge-border)' }}
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-[1.04]"
          style={{
            background: 'color-mix(in srgb, var(--color-info, #0ea5e9) 12%, var(--bridge-surface-muted))',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-info, #0ea5e9) 28%, transparent)',
            color: 'var(--color-info, #0ea5e9)',
          }}
        >
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className={cardTitleClass} style={{ color: 'var(--bridge-text)' }}>
              {card.label}
            </h3>
            {card.isPrimary && (
              <span
                className={badgeClass}
                style={{
                  background: 'color-mix(in srgb, var(--color-info, #0ea5e9) 10%, var(--bridge-surface-muted))',
                  color: 'var(--color-info, #0ea5e9)',
                  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-info, #0ea5e9) 22%, transparent)',
                }}
              >
                Primary field
              </span>
            )}
            {card.tenure ? (
              <span className={`inline-flex items-center gap-1.5 ${metaClass}`} style={{ color: 'var(--bridge-text-muted)' }}>
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                {card.tenure}+ years in sector
              </span>
            ) : null}
          </div>

          <p className={`mt-4 max-w-3xl ${bodyClass}`} style={{ color: 'var(--bridge-text-secondary)' }}>
            {card.description}
          </p>

          <div className="mt-7 space-y-5">
            <p
              className={calloutClass}
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-info, #0ea5e9)' }} aria-hidden />
              <span>
                <span className="font-bold">Ask about:</span>{' '}
                {card.askAbout}
              </span>
            </p>

            {card.relatedExpertise.length > 0 && (
              <div className={subpanelClass} style={subpanelStyle}>
                <p className={labelClass} style={{ color: 'var(--bridge-text-faint)' }}>
                  Linked expertise
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.relatedExpertise.map((tag) => (
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
        </div>
      </article>
    </Reveal>
  );
}

export default function IndustriesSection({ mentor, rawMentor }) {
  const groups = groupMentorTags(rawMentor ?? mentor);
  if (!mentorHasIndustries(mentor ?? rawMentor, groups)) return null;

  const source = rawMentor ?? mentor;
  const firstName = mentor?.firstName ?? mentor?.name?.split(/\s+/)[0] ?? 'this mentor';
  const years = source?.years_experience ?? mentor?.yearsExperience;
  const cards = buildIndustryCards(mentor ?? source, groups);
  const companies = mentor?.companies ?? [];

  return (
    <section id="industries" aria-labelledby="industries-heading" className="mt-24 scroll-mt-24">
      <div
        className="overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 0 0 1px var(--bridge-border), 0 28px 80px -48px color-mix(in srgb, var(--color-info, #0ea5e9) 20%, transparent)',
        }}
      >
        <div
          className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16"
          style={{
            background: 'linear-gradient(165deg, color-mix(in srgb, var(--color-info, #0ea5e9) 7%, var(--bridge-surface)) 0%, var(--bridge-surface) 45%)',
            borderBottom: '1px solid var(--bridge-border)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 id="industries-heading" className={sectionTitleClass} style={sectionTitleStyle}>
                Industries
              </h2>
              <p className={sectionLeadClass} style={{ color: 'var(--bridge-text-secondary)' }}>
                {years
                  ? `Where ${firstName} has spent ${years}+ years — hiring norms, pace, and the stories that land in this part of the market.`
                  : `Where ${firstName} has built credibility — sector norms, pace, and the stories that land in this part of the market.`}
              </p>
            </div>

            <span className={`${statBadgeClass} self-start lg:self-auto`} style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              <Building2 className="h-4 w-4" style={{ color: 'var(--color-info, #0ea5e9)' }} aria-hidden />
              {cards.length} {cards.length === 1 ? 'sector' : 'sectors'}
            </span>
          </div>
        </div>

        <div className="px-8 sm:px-10 lg:px-14">
          {cards.map((card, index) => (
            <IndustryRow key={card.id} card={card} index={index} />
          ))}
        </div>

        {companies.length > 0 && (
          <div
            className="px-8 py-10 sm:px-10 sm:py-12 lg:px-14"
            style={{ borderTop: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p className={labelClass} style={{ color: 'var(--bridge-text-faint)' }}>
              Shaped at
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {companies.slice(0, 8).map((company) => (
                <span
                  key={company}
                  className={`inline-flex items-center gap-1.5 ${chipClass}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-info, #0ea5e9)' }} aria-hidden />
                  {company}
                </span>
              ))}
            </div>
            <p className={`mt-4 max-w-2xl ${bodyClass}`} style={{ color: 'var(--bridge-text-muted)' }}>
              {firstName}&apos;s sector advice is grounded in operators and environments like these — not generic career blogging.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
