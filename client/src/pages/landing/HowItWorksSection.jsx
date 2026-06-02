import { motion } from 'motion/react';
import { Sparkles, CalendarCheck, Video, ListChecks } from 'lucide-react';

const STEP_ICONS = [Sparkles, CalendarCheck, Video, ListChecks];

const STEPS = [
  {
    title: 'Browse or get matched',
    body: "Browse the mentor directory by skill, industry, or career goal. Or describe your situation and get matched to someone whose experience lines up with what you're facing.",
  },
  {
    title: 'Book a session',
    body: 'Pick a time that works for you. Scheduling is handled automatically — no back-and-forth emails, no chasing someone down.',
  },
  {
    title: 'Have the conversation',
    body: "A live video session with someone who's actually been through what you're facing. Not a course. Not a chatbot. A real person.",
  },
  {
    title: 'Leave with a next step',
    body: "Your mentor sets clear action items before you leave. They're saved in your dashboard so you don't lose momentum after the call.",
  },
];

const gridMotion = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function StepCard({ step, index }) {
  const Icon = STEP_ICONS[index];
  const stepLabel = `STEP ${String(index + 1).padStart(2, '0')}`;
  const emphasized = index === 2;

  if (emphasized) {
    return (
      <article
        className="h-full"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: 16,
          padding: 28,
        }}
      >
        <Icon
          size={32}
          strokeWidth={2}
          aria-hidden
          style={{ color: 'var(--color-on-primary)' }}
        />
        <p
          className="mt-4 font-bold uppercase"
          style={{
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'color-mix(in srgb, var(--color-on-primary) 70%, transparent)',
          }}
        >
          {stepLabel}
        </p>
        <h3
          className="mt-2 font-bold"
          style={{
            fontSize: 20,
            lineHeight: 1.25,
            color: 'var(--color-on-primary)',
          }}
        >
          {step.title}
        </h3>
        <p
          className="mt-2"
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: 'var(--color-on-primary)',
          }}
        >
          {step.body}
        </p>
      </article>
    );
  }

  return (
    <article
      className="h-full"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <Icon
        size={32}
        strokeWidth={2}
        aria-hidden
        style={{ color: 'var(--color-primary)' }}
      />
      <p
        className="mt-4 font-bold uppercase"
        style={{
          fontSize: 11,
          letterSpacing: '0.22em',
          color: 'var(--color-text-muted)',
        }}
      >
        {stepLabel}
      </p>
      <h3
        className="mt-2 font-bold"
        style={{
          fontSize: 20,
          lineHeight: 1.25,
          color: 'var(--color-text)',
        }}
      >
        {step.title}
      </h3>
      <p
        className="mt-2"
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--color-text-secondary)',
        }}
      >
        {step.body}
      </p>
    </article>
  );
}

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="landing-how-heading"
      className="py-16"
      style={{ backgroundColor: 'var(--color-surface-muted)' }}
    >
      <div className="mx-auto max-w-[900px] px-5 sm:px-8">
        <div className="text-center">
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}
          >
            HOW IT WORKS
          </p>
          <h2
            id="landing-how-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2.25rem, 5.5vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--color-text)',
            }}
          >
            From curious to connected
            <br />
            <span style={{ color: 'var(--color-primary)' }}>in four steps.</span>
          </h2>
        </div>

        <motion.div
          className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={gridMotion}
        >
          {STEPS.map((step, index) => (
            <motion.div key={step.title} variants={cardMotion} className="min-w-0">
              <StepCard step={step} index={index} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
