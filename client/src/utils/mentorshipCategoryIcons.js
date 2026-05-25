import {
  Briefcase,
  School,
  Coins,
  HeartPulse,
  HeartHandshake,
  Sun,
  Compass,
  Palette,
} from 'lucide-react';

const ICON_MAP = {
  briefcase: Briefcase,
  school: School,
  coin: Coins,
  'heart-pulse': HeartPulse,
  'heart-handshake': HeartHandshake,
  sun: Sun,
  compass: Compass,
  palette: Palette,
};

export function getCategoryIcon(iconName) {
  return ICON_MAP[iconName] ?? Compass;
}
