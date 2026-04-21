/** Decorative viewport gutters for wide screens (mentors directory, profiles, etc.) */
export default function PageGutterAtmosphere() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 top-16 z-0 hidden w-[min(24vw,15rem)] bg-gradient-to-r from-orange-200/55 from-10% via-amber-100/28 via-45% to-transparent lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 top-16 z-0 hidden w-[min(24vw,15rem)] bg-gradient-to-l from-amber-100/50 from-10% via-orange-100/25 via-45% to-transparent lg:block"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed top-16 z-0 hidden h-[calc(100vh-4rem)] w-px bg-gradient-to-b from-transparent via-orange-400/35 to-transparent supports-[height:100dvh]:h-[calc(100dvh-4rem)] xl:block"
        style={{ left: 'max(0.5rem, calc(50vw - 36rem - 1rem))' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-16 z-0 hidden h-[calc(100vh-4rem)] w-px bg-gradient-to-b from-transparent via-orange-400/35 to-transparent supports-[height:100dvh]:h-[calc(100dvh-4rem)] xl:block"
        style={{ left: 'min(calc(100vw - 0.5rem), calc(50vw + 36rem + 1rem))' }}
      />
    </>
  );
}
