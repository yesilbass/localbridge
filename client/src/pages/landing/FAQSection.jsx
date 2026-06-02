import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FAQS = [
  {
    q: 'Do you have mentors yet?',
    a: "We're onboarding our founding cohort right now. If you create an account today, you'll be among the first mentees matched when they go live — usually within days.",
  },
  {
    q: 'How much does it cost?',
    a: "We're still finalizing pricing and will share full details before we charge anything. Creating an account is free.",
  },
  {
    q: 'How are mentors vetted?',
    a: "Every mentor applies and is reviewed before being listed. We verify their background, confirm their experience matches their profile, and look for people who give honest feedback — not just encouragement. Mentors who don't hold up that standard are removed.",
  },
  {
    q: 'How do I become a mentor?',
    a: 'Apply through the "For mentors" link in the nav. We\'re recruiting a founding cohort before public launch. Founding mentors get featured placement on the platform and direct input on the product roadmap.',
  },
];

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="border-b" style={{ borderColor: 'var(--bridge-border)' }}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        aria-expanded={open}
      >
        <span className="font-semibold" style={{ fontSize: 16, color: 'var(--bridge-text)' }}>
          {item.q}
        </span>
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
          style={{ color: 'var(--color-primary)' }}
          aria-hidden
        >
          {open
            ? <Minus size={15} strokeWidth={2.5} />
            : <Plus size={15} strokeWidth={2.5} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--bridge-text-secondary)' }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-24 lg:py-32"
      style={{ backgroundColor: 'var(--color-surface-muted)' }}
    >
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}>
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--bridge-text)',
            }}
          >
            Straight answers.
          </h2>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--bridge-border)' }}>
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
