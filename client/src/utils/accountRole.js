/**
 * Account type is stored on Supabase Auth `user.user_metadata.role` at signup.
 * Only `mentor` is treated as a mentor; missing or other values are mentee (client).
 */

export const ACCOUNT_ROLE = {
  MENTOR: 'mentor',
  MENTEE: 'mentee',
};

export function getAccountRole(user) {
  const raw = user?.user_metadata?.role;
  if (raw === ACCOUNT_ROLE.MENTOR) return ACCOUNT_ROLE.MENTOR;
  return ACCOUNT_ROLE.MENTEE;
}

export function isMentorAccount(user) {
  return getAccountRole(user) === ACCOUNT_ROLE.MENTOR;
}

export function isMenteeAccount(user) {
  return getAccountRole(user) === ACCOUNT_ROLE.MENTEE;
}
