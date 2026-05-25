import {
  SUBSCRIPTION_MONTHLY_USD,
  SUBSCRIPTION_ANNUAL_MONTHLY_USD,
  SUBSCRIPTION_ANNUAL_USD,
  ANNUAL_SAVINGS_PERCENT,
  STUDENT_DISCOUNT,
  isStudentEmail,
  displayMonthlyPrice,
} from '../../../../shared/subscriptionPlans.js';

export {
  SUBSCRIPTION_MONTHLY_USD,
  SUBSCRIPTION_ANNUAL_MONTHLY_USD,
  SUBSCRIPTION_ANNUAL_USD,
  ANNUAL_SAVINGS_PERCENT,
  STUDENT_DISCOUNT,
  isStudentEmail,
  displayMonthlyPrice,
};

export const ANNUAL_DISCOUNT = ANNUAL_SAVINGS_PERCENT / 100;

export function tierMonthlyEquivalent(monthly, annual) {
  if (monthly === 0) return 0;
  if (!annual) return monthly;
  return SUBSCRIPTION_ANNUAL_MONTHLY_USD;
}
