/** Bridge single-plan pricing — keep in sync with Stripe price IDs in env. */
export const SUBSCRIPTION_MONTHLY_USD = 29;
export const SUBSCRIPTION_ANNUAL_MONTHLY_USD = 19;
export const SUBSCRIPTION_ANNUAL_USD = 228;
export const ANNUAL_SAVINGS_PERCENT = 34;
export const STUDENT_DISCOUNT = 0.5;

export const BILLING_PLANS = ['monthly', 'annual'];

export function isStudentEmail(email) {
  if (!email) return false;
  const domain = (email.split('@')[1] ?? '').toLowerCase();
  return domain.endsWith('.edu');
}

export function displayMonthlyPrice(plan, { isStudent = false } = {}) {
  const base = plan === 'annual' ? SUBSCRIPTION_ANNUAL_MONTHLY_USD : SUBSCRIPTION_MONTHLY_USD;
  if (!isStudent) return base;
  return Math.round(base * (1 - STUDENT_DISCOUNT) * 100) / 100;
}
