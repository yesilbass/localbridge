const COMPANY_PATHS = [
  { path: '/company', labelKey: 'nav.aboutBridge', fallback: 'About Bridge' },
  { path: '/blog', label: 'Blog' },
  { path: '/careers', label: 'Careers' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' },
  { path: '/trust', label: 'Trust & safety' },
];

/**
 * @param {{ showGuestChrome: boolean, asMentor: boolean, resolve: (path: string) => string, t: (key: string, fallback: string) => string }} ctx
 */
export function buildMainNavModel({ showGuestChrome, asMentor, resolve, t }) {
  const companyGroup = {
    id: 'company',
    label: t('nav.company', 'Company'),
    items: COMPANY_PATHS.map((item) => ({
      path: resolve(item.path),
      label: item.labelKey ? t(item.labelKey, item.fallback) : item.label,
    })),
  };

  if (showGuestChrome) {
    return {
      primary: null,
      groups: [
        {
          id: 'company',
          label: t('nav.company', 'Company'),
          items: [
            { path: resolve('/company'), label: t('nav.aboutBridge', 'About Bridge') },
          ],
        },
        {
          id: 'resources',
          label: t('nav.resources', 'Resources'),
          items: [
            { path: resolve('/faq'), label: t('nav.faq', 'FAQ') },
            { path: resolve('/help'), label: t('nav.help', 'Help') },
            { path: resolve('/contact'), label: t('nav.contact', 'Contact') },
            { path: resolve('/trust'), label: t('nav.trust', 'Trust & Safety') },
          ],
        },
      ],
      links: [
        { path: resolve('/how-it-works'), label: t('nav.howItWorks', 'How it works') },
        { path: resolve('/pricing'), label: t('nav.pricing', 'Pricing') },
        { path: '/become-a-mentor', label: t('nav.becomeMentor', 'Become a mentor') },
      ],
      cta: null,
    };
  }

  if (asMentor) {
    return {
      primary: { path: '/dashboard', label: t('nav.dashboard', 'Dashboard') },
      groups: [companyGroup],
      links: [
        { path: resolve('/community'), label: t('nav.community', 'Community') },
        { path: resolve('/pricing'), label: t('nav.pricing', 'Pricing') },
      ],
      cta: null,
    };
  }

  return {
    primary: { path: '/dashboard', label: t('nav.dashboard', 'Dashboard') },
    groups: [
      {
        id: 'discover',
        label: t('nav.discover', 'Discover'),
        items: [
          { path: resolve('/mentors'), label: t('nav.mentors', 'Mentors') },
          { path: resolve('/community'), label: t('nav.community', 'Community') },
        ],
      },
      {
        id: 'tools',
        label: t('nav.tools', 'Tools'),
        items: [
          { path: resolve('/resume'), label: t('nav.resume', 'Resume review'), ai: true },
        ],
      },
      companyGroup,
    ],
    links: [{ path: resolve('/pricing'), label: t('nav.pricing', 'Pricing') }],
    cta: null,
  };
}

/** Flat list for mobile drawer */
export function flattenMainNavModel(model) {
  const out = [];
  if (model.primary) out.push({ ...model.primary, kind: 'link' });
  for (const group of model.groups) {
    out.push({ kind: 'section', label: group.label });
    for (const item of group.items) out.push({ ...item, kind: 'link' });
  }
  for (const link of model.links) out.push({ ...link, kind: 'link' });
  if (model.cta) out.push({ ...model.cta, kind: 'cta' });
  return out;
}

export function isPathActive(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isGroupActive(pathname, group) {
  return group.items.some((item) => isPathActive(pathname, item.path));
}
