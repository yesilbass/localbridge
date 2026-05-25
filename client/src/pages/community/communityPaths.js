/** @param {string} pathname */
export function getCommunityBase(pathname = '') {
  return pathname.startsWith('/dashboard/community') ? '/dashboard/community' : '/community';
}

/** @param {string} pathname @param {string} [segment] */
export function communityPath(pathname, segment = '') {
  const base = getCommunityBase(pathname);
  return segment ? `${base}/${segment}` : base;
}

/** Standalone /community → dashboard shell for signed-in product use. */
export function dashboardCommunityPath(pathname = '/') {
  if (typeof pathname !== 'string' || !pathname.startsWith('/community')) return null;
  if (pathname.startsWith('/community/posts')) return null;
  return pathname.replace(/^\/community/, '/dashboard/community') || '/dashboard/community';
}
