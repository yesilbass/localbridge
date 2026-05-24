const PUBLIC_MENTOR_PROFILE_DETAIL = /^\/mentors\/[^/]+$/;
const DASHBOARD_MENTOR_PROFILE_DETAIL = /^\/dashboard\/mentors\/[^/]+$/;

export function isPublicMentorProfileDetail(pathname) {
  return PUBLIC_MENTOR_PROFILE_DETAIL.test(pathname);
}

export function isDashboardMentorProfileDetail(pathname) {
  return DASHBOARD_MENTOR_PROFILE_DETAIL.test(pathname);
}

export function isMentorProfileDetail(pathname) {
  return isPublicMentorProfileDetail(pathname) || isDashboardMentorProfileDetail(pathname);
}
