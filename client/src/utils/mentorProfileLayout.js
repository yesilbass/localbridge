import { DASHBOARD_NAVBAR_H } from '../pages/dashboard/dashboardLayout.js';

export { DASHBOARD_NAVBAR_H };

/** Public marketing navbar height — keep in sync with Navbar.jsx `h-[6.25rem]`. */
export const PUBLIC_NAVBAR_H = '6.25rem';

/** Sticky profile section nav bar height (py-3.5 + text). */
export const PROFILE_SECTION_NAV_H = '3.5rem';

export function primaryNavHeight(embedded) {
  return embedded ? DASHBOARD_NAVBAR_H : PUBLIC_NAVBAR_H;
}

export function profileStickyNavTop(embedded, primaryNavHidden) {
  return primaryNavHidden ? '0px' : primaryNavHeight(embedded);
}

export function profileScrollOffsetPx(embedded, primaryNavHidden) {
  const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const primaryRem = primaryNavHidden ? 0 : parseFloat(primaryNavHeight(embedded));
  const sectionNavPx = parseFloat(PROFILE_SECTION_NAV_H) * rootFont;
  return primaryRem * rootFont + sectionNavPx + 12;
}
