/** Soft viewport side fades only (no vertical rules — those felt noisy on large screens). */
export default function PageGutterAtmosphere() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 top-16 z-0 hidden w-[min(22vw,13rem)] lg:block"
        style={{ backgroundImage: 'var(--bridge-gutter-l)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 top-16 z-0 hidden w-[min(22vw,13rem)] lg:block"
        style={{ backgroundImage: 'var(--bridge-gutter-r)' }}
      />
    </>
  );
}
