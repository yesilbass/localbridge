/** Single source of truth — keep in sync with Stripe checkout (unit_amount in cents). */
export const PLAN_MONTHLY_USD = {
  Plus: 49,
  Pro: 79,
};

export const PLAN_PRICES_CENTS = {
  Plus: PLAN_MONTHLY_USD.Plus * 100,
  Pro: PLAN_MONTHLY_USD.Pro * 100,
};

export const PAID_PLAN_NAMES = ['Plus', 'Pro'];
