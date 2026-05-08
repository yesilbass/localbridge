import SavedMentorsBlock from './SavedMentorsBlock.jsx';
import RecommendationsBlock from './RecommendationsBlock.jsx';
import PastSessionsBlock from './PastSessionsBlock.jsx';

export default function MenteeSection() {
  return (
    <div className="flex flex-col gap-8">
      <SavedMentorsBlock />
      <RecommendationsBlock />
      <PastSessionsBlock />
    </div>
  );
}
