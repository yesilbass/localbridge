import { useAuth } from '../context/useAuth';
import PaywallPrompt from './PaywallPrompt';

export default function SubscriptionGate({ children, feature }) {
  const { isSubscribed, settingsLoading } = useAuth();

  if (settingsLoading) return null;
  if (isSubscribed) return children;
  return <PaywallPrompt feature={feature} />;
}
