/** Decorative viewport gutters for wide screens (mentors directory, profiles, etc.) */
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

      <div
        aria-hidden
        className="pointer-events-none fixed top-16 z-0 hidden h-[calc(100vh-4rem)] w-px supports-[height:100dvh]:h-[calc(100dvh-4rem)] xl:block"
        style={{
          left: 'max(0.5rem, calc(50vw - 44rem - 1rem))',
          backgroundImage: 'var(--bridge-gutter-vline)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-16 z-0 hidden h-[calc(100vh-4rem)] w-px supports-[height:100dvh]:h-[calc(100dvh-4rem)] xl:block"
        style={{
          left: 'min(calc(100vw - 0.5rem), calc(50vw + 44rem + 1rem))',
          backgroundImage: 'var(--bridge-gutter-vline)',
        }}
      />
    </>
  );
}
