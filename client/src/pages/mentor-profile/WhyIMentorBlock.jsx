import { bodyClass } from './profileType';

export default function WhyIMentorBlock({ rawMentor }) {
  const text = rawMentor?.why_i_mentor?.trim();
  if (!text) return null;

  return (
    <section id="why-i-mentor" className="mt-12 max-w-3xl">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--bridge-text-muted)' }}>
        Why I mentor
      </h2>
      <blockquote
        className={`mt-4 border-l-4 pl-5 italic ${bodyClass}`}
        style={{ borderColor: 'var(--color-primary)', color: 'var(--bridge-text-secondary)' }}
      >
        {text}
      </blockquote>
    </section>
  );
}
