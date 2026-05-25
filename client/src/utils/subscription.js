export {
  isSubscribed as isActiveSubscription,
  isSubscribed,
  isInTrial,
  trialDaysRemaining,
  isLapsed,
  hasNeverSubscribed,
} from './subscriptionStatus';

export function subscriptionPlanLabel(settings) {
  if (!settings?.subscription_plan) return null;
  if (settings.subscription_plan === 'annual') return 'Bridge Annual';
  if (settings.subscription_plan === 'monthly') return 'Bridge Monthly';
  return null;
}
