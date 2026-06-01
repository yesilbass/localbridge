import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CompanyHero              from './CompanyHero';
import CompanyStorySection      from './CompanyStorySection';
import CompanyHowItWorksSection from './CompanyHowItWorksSection';
import CompanyValuesSection     from './CompanyBeliefsSection';
import CompanyBuiltForSection   from './CompanyBuiltForSection';
import CompanyPeopleSection     from './CompanyPeopleSection';
import CompanyCloseSection      from './CompanyCloseSection';

export default function CompanyPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const run = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [location.pathname, location.hash]);

  return (
    <main
      id="company-main"
      tabIndex={-1}
      className="relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)] focus:outline-none"
    >
      <CompanyHero />
      <CompanyStorySection />
      <CompanyHowItWorksSection />
      <CompanyValuesSection />
      <CompanyBuiltForSection />
      <CompanyPeopleSection />
      <CompanyCloseSection />
    </main>
  );
}
