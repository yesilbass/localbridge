export default function MentorHeroGeometry() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]"
    >
      <svg
        className="absolute -left-[8%] top-1/2 h-[120%] w-[85%] max-w-[520px] -translate-y-1/2"
        viewBox="0 0 520 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMid meet"
        style={{ color: 'color-mix(in srgb, var(--color-primary) 22%, var(--bridge-border))' }}
      >
        {[
          { size: 520, opacity: 0.55, y: 320 },
          { size: 420, opacity: 0.7, y: 320 },
          { size: 320, opacity: 0.85, y: 320 },
          { size: 220, opacity: 1, y: 320 },
          { size: 120, opacity: 1, y: 320 },
        ].map(({ size, opacity, y }, i) => {
          const half = size / 2;
          const h = size * 0.866;
          const x = 140;
          const points = `${x},${y - h * 0.55} ${x - half},${y + h * 0.45} ${x + half},${y + h * 0.45}`;
          return (
            <polygon
              key={i}
              points={points}
              stroke="currentColor"
              strokeWidth={i === 0 ? 1 : 1.25}
              strokeOpacity={opacity}
            />
          );
        })}

        {[
          { size: 180, x: 48, y: 140 },
          { size: 140, x: 260, y: 480 },
          { size: 100, x: 320, y: 180 },
        ].map(({ size, x, y }, i) => {
          const half = size / 2;
          const h = size * 0.866;
          const points = `${x - half},${y - h * 0.35} ${x + half},${y - h * 0.35} ${x},${y + h * 0.65}`;
          return (
            <polygon
              key={`inv-${i}`}
              points={points}
              stroke="currentColor"
              strokeWidth={1}
              strokeOpacity={0.45}
            />
          );
        })}
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 55%, var(--bridge-surface) 92%)',
          opacity: 0.85,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 18% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)',
        }}
      />
    </div>
  );
}
