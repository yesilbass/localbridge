import {
  Building2,
  Cpu,
  Landmark,
  HeartPulse,
  Megaphone,
  BarChart3,
  GraduationCap,
  Scale,
  Briefcase,
} from 'lucide-react';

const INDUSTRY_CATALOG = [
  { keys: ['technology', 'tech', 'software', 'saas', 'engineering', 'startup', 'product'], label: 'Technology', icon: Cpu },
  { keys: ['finance', 'financial', 'banking', 'investment', 'private equity', 'venture', 'fintech'], label: 'Finance', icon: Landmark },
  { keys: ['healthcare', 'health', 'clinical', 'biotech', 'pharma', 'medical'], label: 'Healthcare', icon: HeartPulse },
  { keys: ['marketing', 'growth', 'brand', 'advertising', 'content'], label: 'Marketing', icon: Megaphone },
  { keys: ['data science', 'data', 'analytics', 'machine learning', 'ai'], label: 'Data Science', icon: BarChart3 },
  { keys: ['education', 'edtech', 'academic', 'university'], label: 'Education', icon: GraduationCap },
  { keys: ['law', 'legal', 'compliance'], label: 'Law', icon: Scale },
  { keys: ['consulting', 'strategy', 'advisory'], label: 'Consulting', icon: Briefcase },
];

function normalizeIndustryLabel(raw) {
  if (!raw) return null;
  const lower = String(raw).toLowerCase().trim();
  for (const entry of INDUSTRY_CATALOG) {
    if (entry.keys.includes(lower) || entry.label.toLowerCase() === lower) return entry.label;
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function catalogEntry(label) {
  const lower = label.toLowerCase();
  return INDUSTRY_CATALOG.find(
    (entry) => entry.label.toLowerCase() === lower || entry.keys.some((k) => lower.includes(k)),
  ) ?? { label, icon: Building2 };
}

function inferFromExpertise(expertise) {
  const labels = new Set();
  for (const tag of expertise ?? []) {
    const lower = tag.toLowerCase();
    for (const entry of INDUSTRY_CATALOG) {
      if (entry.keys.some((k) => lower.includes(k)) || entry.label.toLowerCase() === lower) {
        labels.add(entry.label);
      }
    }
    if (/\bb2b\b|\bb2c\b|enterprise|consumer internet|e-?commerce/i.test(tag)) {
      labels.add('Technology');
    }
  }
  return [...labels];
}

function fieldTenure(totalYears, index, isPrimary) {
  if (!totalYears || totalYears < 1) return null;
  if (isPrimary) return totalYears;
  const spread = Math.max(2, Math.floor(totalYears * 0.45));
  return Math.max(1, totalYears - spread - index * 2);
}

function narrativeForIndustry(label, ctx) {
  const { firstName, company, title, tenure } = ctx;
  const atCo = company ? ` at ${company}` : '';
  const roleBit = title ? `${title}${atCo}` : company ? ` at ${company}` : '';
  const y = tenure ? `${tenure}+ years` : 'years';
  const lower = label.toLowerCase();

  if (/technology|software|saas/i.test(lower)) {
    return `${firstName} has operated ${y} inside ${label.toLowerCase()} — shipping cycles, eng culture, and the hiring bar that actually differs from "generic tech." Mentees get concrete examples from ${roleBit || 'production teams'}: how decisions get made, what "senior" looks like, and which mistakes are forgiven versus fatal.`;
  }
  if (/finance/i.test(lower)) {
    return `${firstName} knows ${label.toLowerCase()} from the inside${atCo} — modeling standards, deal rhythm, and the unwritten rules of rooms where numbers have to tie. Sessions focus on breaking into the field, leveling up, or translating experience from an adjacent sector without sounding naive.`;
  }
  if (/healthcare|clinical/i.test(lower)) {
    return `${firstName} bridges ${label.toLowerCase()} and operator reality${atCo} — regulatory context, cross-functional stakeholders, and career paths that aren't obvious from the outside. Useful for clinicians, researchers, and operators moving between bench, bedside, and industry.`;
  }
  if (/marketing|growth/i.test(lower)) {
    return `${firstName} has spent ${y} in ${label.toLowerCase()}${atCo} — channel mix, brand versus performance trade-offs, and the metrics that survive executive scrutiny. Bring your funnel, creative, or GTM plan; ${firstName} will stress-test it against what they've seen work.`;
  }
  if (/data science|analytics/i.test(lower)) {
    return `${firstName} applies ${label.toLowerCase()} where it meets product and business${atCo} — not notebook exercises. Expect honest talk about stakeholder trust, model deployment, and how to show impact when the org still thinks in spreadsheets.`;
  }
  if (/consulting/i.test(lower)) {
    return `${firstName} has cycled through ${label.toLowerCase()} engagements${atCo} — problem framing, exec communication, and building credibility when you're not the subject-matter expert yet. Strong for consultants exiting to industry or doubling down on a vertical.`;
  }
  if (/education/i.test(lower)) {
    return `${firstName} understands ${label.toLowerCase()} pathways${atCo} — translating research or teaching experience into industry roles, and the narrative shifts that make hiring managers take you seriously.`;
  }
  if (/law|legal/i.test(lower)) {
    return `${firstName} navigates ${label.toLowerCase()} and business intersections${atCo} — risk framing, contract reality, and career moves between practice, in-house, and ops.`;
  }

  return `${firstName} brings ${y} of ${label.toLowerCase()} context${roleBit ? ` through ${roleBit}` : ''}. Mentees book ${firstName} to compare this sector with adjacent ones — norms, compensation, pace, and the stories that resonate in interviews here.`;
}

function askAboutForIndustry(label) {
  const lower = label.toLowerCase();
  if (/technology/i.test(lower)) return 'Breaking in, leveling up, or switching company stage';
  if (/finance/i.test(lower)) return 'Interviews, modeling norms, or pivoting from another sector';
  if (/healthcare/i.test(lower)) return 'Clinical-to-industry moves or stakeholder navigation';
  if (/marketing/i.test(lower)) return 'Channel strategy, team structure, or exec storytelling';
  if (/data/i.test(lower)) return 'Portfolio projects, stakeholder trust, or role targeting';
  if (/consulting/i.test(lower)) return 'Exit options, vertical focus, or credibility building';
  return 'Sector norms, hiring signals, and how your background reads here';
}

function relatedExpertise(label, expertise) {
  if (!expertise?.length) return [];
  const lower = label.toLowerCase();
  return expertise
    .filter((tag) => {
      const tl = tag.toLowerCase();
      return tl.includes(lower.split(' ')[0]) || catalogEntry(tag).label === label;
    })
    .slice(0, 4);
}

function collectIndustryLabels(mentor, groups) {
  const primary = normalizeIndustryLabel(mentor?.industry ?? groups?.industry?.[0]);
  const fromExpertise = inferFromExpertise(groups?.expertise);
  const ordered = [];
  const seen = new Set();

  for (const label of [primary, ...fromExpertise]) {
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(label);
  }

  return ordered.slice(0, 4);
}

/** Rich industry rows for mentor profile. */
export function buildIndustryCards(mentor, groups) {
  const labels = collectIndustryLabels(mentor, groups);
  if (!labels.length) return [];

  const source = mentor ?? {};
  const totalYears = source.yearsExperience ?? source.years_experience ?? null;
  const ctxBase = {
    firstName: source.firstName ?? source.name?.split(/\s+/)[0] ?? 'They',
    years: totalYears,
    company: source.company ?? null,
    title: source.roleLabel ?? source.title ?? null,
  };

  return labels.map((label, index) => {
    const entry = catalogEntry(label);
    const tenure = fieldTenure(totalYears, index, index === 0);
    const ctx = { ...ctxBase, tenure };
    return {
      id: `${label}-${index}`,
      label: entry.label,
      icon: entry.icon,
      isPrimary: index === 0,
      tenure,
      description: narrativeForIndustry(entry.label, ctx),
      askAbout: askAboutForIndustry(entry.label),
      relatedExpertise: relatedExpertise(entry.label, groups?.expertise),
    };
  });
}

export function mentorHasIndustries(mentor, groups) {
  return collectIndustryLabels(mentor, groups).length > 0;
}
