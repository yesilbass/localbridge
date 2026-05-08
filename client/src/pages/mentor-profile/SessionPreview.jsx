import Reveal from '../../components/Reveal';

export default function SessionPreview({ mentor }) {
  const preview = mentor?.sessionPreview;
  if (!preview?.trim()) return null;

  const firstName = mentor.firstName ?? mentor.name?.split(/\s+/)[0] ?? '';

  return (
    <Reveal>
      <section aria-labelledby="preview-heading" className="mt-14">
        <p
          className="font-black uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          id="preview-heading"
        >
          How a session feels
        </p>
        <blockquote
          className="mt-4 rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 5%, var(--bridge-surface))',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
          }}
        >
          <p
            className="italic font-display"
            style={{
              fontSize: 'clamp(1.0625rem, 1.6vw, 1.25rem)',
              lineHeight: 1.55,
              color: 'var(--bridge-text)',
            }}
          >
            {preview}
          </p>
          <footer
            className="mt-4 not-italic font-bold uppercase"
            style={{
              fontSize: '12px',
              letterSpacing: '0.18em',
              color: 'var(--bridge-text-muted)',
            }}
          >
            — {firstName}
          </footer>
        </blockquote>
      </section>
    </Reveal>
  );
}
