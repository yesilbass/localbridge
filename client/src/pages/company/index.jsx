import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CompanyHero from './CompanyHero';
import CompanyStorySection from './CompanyStorySection';
import CompanyBeliefsSection from './CompanyBeliefsSection';
import CompanyCompareSection from './CompanyCompareSection';
import CompanyProofSection from './CompanyProofSection';
import CompanyPeopleSection from './CompanyPeopleSection';
import CompanyCloseSection from './CompanyCloseSection';

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
      <CompanyBeliefsSection />
      <CompanyCompareSection />
      <CompanyProofSection />
      <CompanyPeopleSection />
      <CompanyCloseSection />
    </main>
  );
}
