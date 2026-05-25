import {
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Heart,
  Users,
  Layers,
} from 'lucide-react';

export const MENTOR_BADGES = {
  first_session:     { label: 'First session',      icon: 'star',          description: 'Completed your first session' },
  sessions_10:       { label: '10 sessions',         icon: 'award',         description: 'Completed 10 sessions' },
  sessions_25:       { label: '25 sessions',         icon: 'trophy',        description: 'Completed 25 sessions' },
  sessions_50:       { label: '50 sessions',         icon: 'medal',         description: 'Completed 50 sessions' },
  sessions_100:      { label: '100 sessions',        icon: 'crown',         description: '100 sessions — legend' },
  top_rated:         { label: 'Top rated',           icon: 'heart',         description: 'Maintained a 4.8+ rating over 10+ reviews' },
  community_pillar:  { label: 'Community pillar',    icon: 'users',         description: 'Active in the Bridge community' },
  multi_category:    { label: 'Multi-discipline',    icon: 'layers',        description: 'Mentors across 3+ categories' },
};

const ICON_MAP = {
  star: Star,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  heart: Heart,
  users: Users,
  layers: Layers,
};

export function getBadgeIcon(iconName) {
  return ICON_MAP[iconName] ?? Star;
}

export function getBadgeMeta(badgeType) {
  return MENTOR_BADGES[badgeType] ?? { label: badgeType, icon: 'star', description: '' };
}
