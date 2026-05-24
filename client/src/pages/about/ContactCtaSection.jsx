import { Link } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import { ArrowRight } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { mailtoHref } from '../../config/contact';
import { EASE, DUR_SHORT } from '../landing/landingHooks';
import { ABOUT_CONTACT_SECTION_PAD } from './aboutData';

const PRIMARY_BASE_BG = 'var(--color-primary)';

const foundersMailHref = mailtoHref({
  subject: 'Hello — from the Bridge Company page'
});

const primaryEnter = (e) => {
  e.currentTarget.style.transform = 'translateY(-1px)';
  e.currentTarget.style.backgroundColor =
    'color-mix(in srgb, var(--color-primary) 88%, var(--bridge-text))';
};

const primaryLeave = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.backgroundColor = PRIMARY_BASE_BG;
};

const secondaryEnter = (e) => {
  e.currentTarget.style.backgroundColor = 'var(--bridge-surface)';
};

const secondaryLeave = (e) => {
  e.currentTarget.style.backgroundColor = 'transparent';
};

export default function ContactCtaSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={ABOUT_CONTACT_SECTION_PAD}
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em'
            }}
          >
            Get in touch
          </p>

          <h2
            id="contact-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              Want to talk to
            </span>
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(94deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-mid, var(--color-primary-hover)) 55%, var(--lp-grad-to, var(--color-primary)) 100%)'
              }}
            >
              the founders?
            </span>
          </h2>

          <div className="mt-7 mx-auto max-w-xl">
            <p
              style={{
                color: 'var(--bridge-text-secondary)',
                fontSize: 17,
                lineHeight: 1.6
              }}
            >
              We read every email. Mentors, mentees, investors &mdash; same inbox.
            </p>
            <p
              className="mt-2 italic font-display"
              style={{
                color: 'var(--bridge-text-secondary)',
                fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)',
                lineHeight: 1.4
              }}
            >
              No calendar link yet — send a note and a founder will reply.
            </p>
          </div>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={foundersMailHref}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: PRIMARY_BASE_BG,
                color: 'var(--color-on-primary)',
                boxShadow:
                  '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                outlineColor: 'var(--color-on-primary)',
                transition: `all ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`
              }}
              onMouseEnter={primaryEnter}
              onMouseLeave={primaryLeave}
              onFocus={primaryEnter}
              onBlur={primaryLeave}
            >
              Email the founders
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <AppLink
              to="/mentors"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--bridge-text)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                outlineColor: 'var(--color-primary)',
                transition: `all ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`
              }}
              onMouseEnter={secondaryEnter}
              onMouseLeave={secondaryLeave}
              onFocus={secondaryEnter}
              onBlur={secondaryLeave}
            >
              Browse mentors instead
            </AppLink>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
