export function isSubscribed(settings) {
  if (!settings) return false;
  const status = settings.subscription_status;
  return status === 'active' || status === 'trialing';
}

export function isInTrial(settings) {
  if (!settings) return false;
  return settings.subscription_status === 'trialing';
}

export function trialDaysRemaining(settings) {
  if (!isInTrial(settings)) return 0;
  if (!settings.trial_end) return 0;
  const end = new Date(settings.trial_end);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function isLapsed(settings) {
  if (!settings) return false;
  const status = settings.subscription_status;
  return status === 'past_due' || status === 'canceled' || status === 'unpaid';
}

export function hasNeverSubscribed(settings) {
  if (!settings) return true;
  return !settings.subscription_status;
}
