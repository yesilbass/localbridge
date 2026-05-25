import { useNavigate } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import {
  Briefcase,
  GraduationCap,
  Coins,
  HeartPulse,
  HeartHandshake,
  Sun,
  Compass,
  Palette,
  ArrowRight,
} from 'lucide-react';
import { MENTORSHIP_CATEGORIES } from '../../constants/mentorshipCategories';

const iconMap = {
  briefcase: Briefcase,
  school: GraduationCap,
  coin: Coins,
  'heart-pulse': HeartPulse,
  'heart-handshake': HeartHandshake,
  sun: Sun,
  compass: Compass,
  palette: Palette,
};

const CATEGORY_DESCRIPTIONS = {
  career: 'Job moves, leadership, entrepreneurship, and everything in between.',
  education: 'College apps, grad school, tutoring, and first-gen support.',
  finances: 'Budgeting, home buying, investing, and getting out of debt.',
  health: 'Fitness, nutrition, recovery, and building sustainable habits.',
  relationships: 'Marriage, parenting, dating, grief, and family navigation.',
  faith: 'Islamic, Christian, Jewish mentorship, and finding purpose.',
  life: 'Immigration, veteran transition, disability, and major life changes.',
  creative: 'Writing, coding, content creation, and turning passion into craft.',
};

function CategoryCard({ category }) {
  const navigate = useNavigate();
  const Icon = iconMap[category.icon] || Briefcase;
  const description = CATEGORY_DESCRIPTIONS[category.id] ?? '';

  return (
    <button
      type="button"
      onClick={() => navigate(`/mentors?category=${category.id}`)}
      className="group flex h-full flex-col rounded-2xl p-5 text-left transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 sm:p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'inset 0 0 0 1px var(--color-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-border)';
      }}
    >
      <Icon
        className="h-6 w-6 shrink-0"
        strokeWidth={2}
        aria-hidden
        style={{ color: 'var(--color-primary)' }}
      />
      <p
        className="mt-4 text-[15px] font-bold leading-snug"
        style={{ color: 'var(--bridge-text)' }}
      >
        {category.label}
      </p>
      <p
        className="mt-2 flex-1 text-[13px] leading-relaxed"
        style={{ color: 'var(--bridge-text-muted)' }}
      >
        {description}
      </p>
      <span
        className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold"
        style={{ color: 'var(--color-primary)' }}
      >
        Explore
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </button>
  );
}

export default function MentorshipCategoriesSection() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="py-20"
      style={{ backgroundColor: 'var(--color-surface-muted)' }}
    >
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Mentorship for all of life
          </p>
          <h2
            id="categories-heading"
            className="mt-4 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 4.2vw, 3.25rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--bridge-text)',
            }}
          >
            Whatever you&apos;re navigating,
            <br />
            <span style={{ color: 'var(--color-primary)' }}>
              there&apos;s someone here who&apos;s been through it.
            </span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-[560px] text-[15px] leading-relaxed"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Bridge connects you with mentors across eight areas of life — not just career. Real
            people with real experience, ready to talk.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {MENTORSHIP_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <p
          className="mt-12 text-center text-sm"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          Not sure where to start?{' '}
          <AppLink
            to="/mentors"
            className="font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
          >
            Let our AI match you with the right mentor →
          </AppLink>
        </p>
      </div>
    </section>
  );
}
