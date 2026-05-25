import { getCategoryLabels } from '../../constants/mentorshipCategories';
import { sectionTitleClass, sectionTitleStyle } from './profileType';

export default function MentorshipAreasSection({ rawMentor }) {
  const labels = getCategoryLabels(rawMentor?.mentorship_categories).filter(Boolean);
  if (!labels.length) return null;

  return (
    <section id="mentorship-areas" className="mt-12 max-w-3xl">
      <h2 className={sectionTitleClass} style={sectionTitleStyle}>
        Areas of mentorship
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))',
              color: 'var(--color-primary)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
