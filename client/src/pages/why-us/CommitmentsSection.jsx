import { BadgeCheck, Eye, ShieldOff, Handshake } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { EASE, DUR_SHORT } from '../landing/landingHooks';
import { COMMITMENTS, WHY_US_SECTION_PAD } from './whyUsData';
import { useContent } from '../../content';

const ICON_MAP = {
  BadgeCheck,
  Eye,
  ShieldOff,
  Handshake
};

const cardEnter = (e) => {
  e.currentTarget.style.transform = 'translateY(-1px)';
  e.currentTarget.style.boxShadow =
    'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)';
};

const cardLeave = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
};

export default function CommitmentsSection() {
  const { s } = useContent();
  return (
    <section
      id="commitments"
      aria-labelledby="commitments-heading"
      className={WHY_US_SECTION_PAD}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <h2
            id="commitments-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              {s.whyUs.commitmentsHeading1}
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              {s.whyUs.commitmentsHeading2}
            </span>
          </h2>

          <p
            className="mt-7 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6
            }}
          >
            If we ever break one of these, the page changes. We will not.
          </p>
        </RevealOnScroll>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COMMITMENTS.map((c) => {
            const Icon = ICON_MAP[c.iconName];
            return (
              <RevealOnScroll key={c.title}>
                <article
                  className="rounded-2xl p-6 flex items-start gap-4 h-full"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    transition: `transform ${DUR_SHORT}s cubic-bezier(${EASE.join(',')}), box-shadow ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`
                  }}
                  onMouseEnter={cardEnter}
                  onMouseLeave={cardLeave}
                >
                  <Icon
                    className="h-5 w-5 mt-1 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 flex flex-col">
                    <h3
                      className="text-[15px] font-display font-black"
                      style={{
                        color: 'var(--bridge-text)',
                        letterSpacing: '-0.015em',
                        lineHeight: 1.25
                      }}
                    >
                      {c.title}
                    </h3>
                    <p
                      className="text-[13px] mt-1"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        lineHeight: 1.55
                      }}
                    >
                      {c.body}
                    </p>
                    <p
                      className="mt-3 text-[10px] uppercase font-bold"
                      style={{
                        color: 'var(--bridge-text-muted)',
                        letterSpacing: '0.22em'
                      }}
                    >
                      {c.stamp}
                    </p>
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
