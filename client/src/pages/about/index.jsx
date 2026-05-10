import { pageShell } from '../../ui';
import AboutHero from './AboutHero';
import OriginStorySection from './OriginStorySection';
import PrinciplesSection from './PrinciplesSection';
import TimelineSection from './TimelineSection';
import TeamSection from './TeamSection';
import ContactCtaSection from './ContactCtaSection';

export default function AboutPage() {
  return (
    <main className={pageShell}>
      <AboutHero />
      <OriginStorySection />
      <PrinciplesSection />
      <TimelineSection />
      <TeamSection />
      <ContactCtaSection />
    </main>
  );
}
