export default function MentorProfileAtmosphere({ embedded = false }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none z-0 overflow-hidden ${embedded ? 'absolute inset-0' : 'fixed inset-0'}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 90% 55% at 50% 18%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)',
            'linear-gradient(to bottom, var(--bridge-canvas) 0%, transparent 12%, transparent 78%, var(--bridge-canvas) 96%)',
          ].join(', '),
        }}
      />
    </div>
  );
}
