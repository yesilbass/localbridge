import { useScrollProgress } from './landingHooks';

export default function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[9998] h-[2px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full"
        style={{
          width: `${progress * 100}%`,
          transition: 'width 90ms linear',
          backgroundImage: 'linear-gradient(90deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 50%, var(--lp-grad-to) 100%)',
          boxShadow: '0 0 18px color-mix(in srgb, var(--color-primary) 65%, transparent)',
        }}
      />
    </div>
  );
}
