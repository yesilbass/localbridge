import MentorTagGroups from '../../components/MentorTagGroups';
import { groupMentorTags } from '../../utils/mentorDisplay';
import { SESSION_TYPES } from '../../constants/sessionTypes';

export default function ExpertiseToolkitSection({ mentor, rawMentor }) {
  const groups = groupMentorTags(rawMentor ?? mentor);
  if (!groups.hasAny) return null;

  const firstName = mentor?.firstName ?? mentor?.name?.split(/\s+/)[0] ?? 'this mentor';
  const years = rawMentor?.years_experience ?? mentor?.yearsExperience;

  return (
    <section aria-labelledby="expertise-toolkit-heading" className="mt-16 pt-14" style={{ borderTop: '1px solid var(--bridge-border)' }}>
      <p className="font-black uppercase" style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--color-primary)' }}>
        Expertise & toolkit
      </p>
      <h2
        id="expertise-toolkit-heading"
        className="mt-3 font-display font-black tracking-tight"
        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em', color: 'var(--bridge-text)' }}
      >
        What {firstName} brings to a session
      </h2>
      {years ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--bridge-text-secondary)]">
          {years}+ years across {groups.industry[0] ?? 'their field'} — skills, industries, and tools listed below are what mentees most often book {firstName} for.
        </p>
      ) : null}

      <div className="mt-8">
        <MentorTagGroups mentor={rawMentor ?? mentor} layout="grid" limits={{ expertise: 12, industry: 4, tools: 10 }} />
      </div>

      {groups.tools.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {groups.tools.slice(0, 6).map((tool) => (
            <div
              key={tool}
              className="rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              <p className="text-[14px] font-bold text-[var(--bridge-text)]">{tool}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">
                Used in live sessions — ask {firstName} how they apply it to your situation.
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-faint)]">
          Session types
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SESSION_TYPES.map((type) => (
            <div
              key={type.key}
              className="flex items-start gap-3.5 rounded-2xl p-4"
              style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: `color-mix(in srgb, ${type.hueVar} 13%, var(--bridge-surface-muted))` }}
                aria-hidden
              >
                {type.icon}
              </span>
              <div>
                <p className="flex items-center gap-2 font-bold text-[14px] text-[var(--bridge-text)]">
                  {type.name}
                  {type.popular && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      style={{ background: `color-mix(in srgb, ${type.hueVar} 12%, transparent)`, color: type.hueVar }}
                    >
                      Popular
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{type.duration} · Video call</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
