import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Eye, Receipt } from 'lucide-react';
import { WHY_US_FINAL_SECTION_PAD } from './whyUsData';
import RevealOnScroll from '../landing/RevealOnScroll';
import { EASE, DUR_SHORT } from '../landing/landingHooks';

const primaryEnter = (e) => {
  e.currentTarget.style.transform = 'translateY(-2px)';
};
const primaryLeave = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
};
const secondaryEnter = (e) => {
  e.currentTarget.style.boxShadow =
    'inset 0 0 0 1px var(--bridge-border-strong)';
  e.currentTarget.style.color = 'var(--bridge-text)';
};
const secondaryLeave = (e) => {
  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
  e.currentTarget.style.color = 'var(--bridge-text-secondary)';
};

export default function WhyUsFinalCtaSection() {
  return (
    <section
      id="final"
      aria-labelledby="final-heading"
      className={`relative overflow-hidden ${WHY_US_FINAL_SECTION_PAD}`}
      style={{
        borderTop: '1px solid var(--bridge-border-strong)',
        backgroundImage:
          'linear-gradient(180deg, var(--bridge-canvas) 0%, color-mix(in srgb, var(--color-primary) 6%, var(--bridge-canvas)) 50%, var(--bridge-canvas) 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-[60%] w-[60%] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, transparent 70%)',
            filter: 'blur(90px)',
            opacity: 0.18,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em',
            }}
          >
            One ask
          </p>

          <h2
            id="final-heading"
            className="mt-5 mx-auto max-w-3xl font-display font-black"
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              If we are right,
            </span>
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(94deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-mid, var(--color-primary-hover)) 55%, var(--lp-grad-to, var(--color-primary)) 100%)',
              }}
            >
              the first hour is enough.
            </span>
          </h2>

          <p
            className="mt-6 mx-auto max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6,
            }}
          >
            Book a single hour. If it doesn&rsquo;t earn the rebook, we refund it and we will tell you who would have.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow:
                  '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                outlineColor: 'var(--color-on-primary)',
                transition: `transform ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
              }}
              onMouseEnter={primaryEnter}
              onMouseLeave={primaryLeave}
            >
              Book your first hour
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                color: 'var(--bridge-text-secondary)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                outlineColor: 'var(--color-primary)',
                transition: `box-shadow ${DUR_SHORT}s cubic-bezier(${EASE.join(',')}), color ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
              }}
              onMouseEnter={secondaryEnter}
              onMouseLeave={secondaryLeave}
            >
              Browse the operators
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Guarantee
              icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              text="Refunded inside one click."
            />
            <Guarantee
              icon={<Eye className="h-4 w-4" aria-hidden="true" />}
              text="Reviews published, threes included."
            />
            <Guarantee
              icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
              text="Rate on every profile."
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Guarantee({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-[13px]"
      style={{ color: 'var(--bridge-text-secondary)' }}
    >
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      {text}
    </span>
  );
}
