import { PAID_PLAN_NAMES } from '../../../shared/subscriptionPlans.js';

export function isActiveSubscription(settings) {
  if (!settings || typeof settings !== 'object') return false;
  const status = settings.subscription_status;
  const plan = settings.subscription_plan;
  return status === 'active' && PAID_PLAN_NAMES.includes(plan);
}

export function subscriptionPlanLabel(settings) {
  if (!isActiveSubscription(settings)) return null;
  return settings.subscription_plan ?? null;
}
