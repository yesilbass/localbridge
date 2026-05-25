import { sectionTitleClass, sectionTitleStyle, bodyClass } from './profileType';

export default function MentorshipDescriptionSection({ rawMentor }) {
  const text = rawMentor?.mentorship_description?.trim();
  if (!text) return null;

  return (
    <section id="mentorship-description" className="mt-24 max-w-3xl scroll-mt-[calc(var(--profile-primary-nav-h,5.25rem)+3.5rem)]">
      <h2 className={sectionTitleClass} style={sectionTitleStyle}>
        What I can help with
      </h2>
      <p className={`mt-6 whitespace-pre-line ${bodyClass}`} style={{ color: 'var(--bridge-text-secondary)' }}>
        {text}
      </p>
    </section>
  );
}
