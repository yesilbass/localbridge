import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MENTORS_ROW1, MENTORS_ROW2 } from './landingData';
import MentorCard from './MentorCard';
import MagneticWrapper from './MagneticWrapper';
import RevealOnScroll from './RevealOnScroll';

export default function MentorMarqueeSection() {
  return (
    <section
      id="mentors"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <RevealOnScroll>
        <div className="mb-14 px-5 text-center">
          <p
            className="text-[10px] font-black uppercase tracking-[0.32em] mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Our mentors
          </p>
          <h2
            className="font-display font-black leading-[1] tracking-tight"
            style={{ fontSize: 'clamp(1.85rem, 4.6vw, 3.5rem)', color: 'var(--bridge-text)' }}
          >
            Professionals who&rsquo;ve been<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
            >
              where you want to go
            </span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-[14px] leading-relaxed"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            Vetted operators, founders and builders. No coaches, no influencers — just people who&rsquo;ve done it.
          </p>
        </div>
      </RevealOnScroll>

      {/* Row 1 — scrolls left */}
      <div className="b-marq">
        <div className="overflow-hidden b-mask-x">
          <div className="b-ticker flex w-max gap-4 pb-4 pr-4">
            {[...MENTORS_ROW1, ...MENTORS_ROW1].map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="b-marq mt-4">
        <div className="overflow-hidden b-mask-x">
          <div className="b-ticker-r flex w-max gap-4 pr-4">
            {[...MENTORS_ROW2, ...MENTORS_ROW2].map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
      </div>

      <div className="mt-14 flex justify-center px-5">
        <MagneticWrapper>
          <Link
            to="/mentors"
            data-cursor="Browse"
            className="group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              color: 'var(--bridge-text)',
              boxShadow: '0 0 0 1px var(--bridge-border-strong) inset, 0 12px 28px -22px color-mix(in srgb, var(--color-primary) 30%, transparent)',
            }}
          >
            Browse all 2,400+ mentors
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </MagneticWrapper>
      </div>
    </section>
  );
}
