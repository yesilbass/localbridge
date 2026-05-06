import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, UserCheck, CalendarCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const revealed = new WeakSet();

const STEPS = [
  {
    num: '01',
    chip: '"Senior PM at a Series B"',
    time: '10 sec',
    Icon: Search,
    title: 'Tell us your goal',
    desc: 'Plain English. Our AI ranks the exact mentors most likely to move the needle for your specific situation.',
  },
  {
    num: '02',
    chip: '98% match · $60/session',
    time: '30 sec',
    Icon: UserCheck,
    title: 'Pick your mentor',
    desc: 'Real bios, honest reviews, exact rates — visible before you commit. No surprises, ever.',
  },
  {
    num: '03',
    chip: 'Confirmed for tomorrow',
    time: '13 sec',
    Icon: CalendarCheck,
    title: 'Book and get unstuck',
    desc: 'Live availability. Built-in video room. No Zoom links, no scheduling back-and-forth, no friction.',
  },
];

export default function HowItWorksSection() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const cards = Array.from(containerRef.current.querySelectorAll('.hiw-card'));
    if (!cards.length) return;

    gsap.set(cards, { y: 60, opacity: 0, scale: 0.96 });

    const anim = gsap.to(cards, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.18,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => cards.forEach(c => revealed.add(c)),
      },
      onComplete: () => cards.forEach(c => revealed.add(c)),
    });

    const safety = setTimeout(() => {
      cards.forEach(c => {
        if (!revealed.has(c)) { gsap.set(c, { clearProps: 'all' }); revealed.add(c); }
      });
    }, 4800);

    return () => {
      clearTimeout(safety);
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <section
      id="how"
      ref={containerRef}
      className="relative py-24 sm:py-32"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <p
            className="text-[10px] font-black uppercase tracking-[0.32em] mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            How it works
          </p>
          <h2
            className="font-display font-black leading-[0.98] tracking-[-0.035em] max-w-2xl"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', color: 'var(--bridge-text)' }}
          >
            Three steps. One hour. <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
            >
              Real momentum.
            </span>
          </h2>
          <p
            className="mt-5 max-w-lg text-[14.5px] leading-relaxed"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            From "I'm stuck" to "session booked" in under a minute. We've timed it.
          </p>
        </div>

        {/* Connecting line behind cards (desktop only) */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[3.5rem] hidden h-px sm:block"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-primary) 30%, transparent) 20%, color-mix(in srgb, var(--color-primary) 30%, transparent) 80%, transparent 100%)',
            }}
          />

          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="hiw-card group relative rounded-2xl p-7 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: '0 14px 32px -22px rgba(79,70,229,0.18), 0 0 0 1px var(--bridge-border) inset',
                }}
              >
                {/* Step icon container */}
                <div
                  className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--lp-grad-mid) 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 12px 28px -10px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                  }}
                >
                  <step.Icon className="h-6 w-6" strokeWidth={2} />
                  {/* tiny step badge in corner */}
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black"
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      color: 'var(--color-primary)',
                      boxShadow: '0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* meta row: step number · time */}
                <div className="mb-2 flex items-baseline gap-2">
                  <span
                    className="font-display text-[11px] font-black"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {step.num}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--bridge-text-faint)' }}
                  >
                    · {step.time}
                  </span>
                </div>

                <h3
                  className="mb-2.5 text-[19px] font-bold tracking-tight"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[13.5px] leading-relaxed"
                  style={{ color: 'var(--bridge-text-muted)' }}
                >
                  {step.desc}
                </p>

                {/* example chip */}
                <div
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: '0 0 0 1px var(--bridge-border) inset',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  {step.chip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
