import {
  Target,
  Compass,
  Layers,
  Code2,
  Megaphone,
  TrendingUp,
  Users,
  LayoutGrid,
  LineChart,
  FileText,
  Network,
  Rocket,
  Brain,
  Sparkles,
  Wrench,
} from 'lucide-react';

const ICON_RULES = [
  [/interview|hiring|recruiting/i, Target],
  [/career|pivot|transition|growth path/i, Compass],
  [/system design|architecture|infrastructure|scal/i, Layers],
  [/javascript|typescript|python|java|react|node|engineer|full.?stack|backend|frontend|software|ml|machine learning|deep learning|data/i, Code2],
  [/market|content|brand|seo|copy|gtm|b2b|saas/i, Megaphone],
  [/growth|conversion|funnel|optim/i, TrendingUp],
  [/team|leadership|manage|people|org/i, Users],
  [/product|roadmap|ux|design|strategy/i, LayoutGrid],
  [/finance|equity|model|invest|private equity|venture|accounting/i, LineChart],
  [/resume|cv|portfolio/i, FileText],
  [/network|intro|community/i, Network],
  [/startup|founder|bootstrap|launch/i, Rocket],
  [/research|clinical|science|health/i, Brain],
  [/tool|analytics|excel|tableau|figma|aws|sql/i, Wrench],
];

function pickIcon(tag) {
  for (const [pattern, Icon] of ICON_RULES) {
    if (pattern.test(tag)) return Icon;
  }
  return Sparkles;
}

function relatedTools(tag, tools) {
  if (!tools?.length) return [];
  const lower = tag.toLowerCase();
  const words = lower.split(/[\s/&,+-]+/).filter((w) => w.length > 2);
  return tools.filter((tool) => {
    const tl = tool.toLowerCase();
    return words.some((w) => tl.includes(w)) || lower.includes(tl) || tl.includes(lower);
  }).slice(0, 3);
}

function pickSessionTypes(tag) {
  const lower = tag.toLowerCase();
  if (/resume|cv|portfolio/i.test(lower)) return ['resume_review'];
  if (/interview|hiring|mock/i.test(lower)) return ['interview_prep'];
  if (/network|intro|community/i.test(lower)) return ['networking'];
  return ['career_advice'];
}

function narrativeForTag(tag, ctx) {
  const { firstName, years, company, title, industry } = ctx;
  const y = years ? `${years}+ years` : 'years';
  const atCo = company ? ` at ${company}` : '';
  const inField = industry ? ` in ${industry}` : '';
  const lower = tag.toLowerCase();

  if (/interview|hiring|mock/i.test(lower)) {
    return `${firstName} has sat on the other side of the table${atCo} and runs sessions as live practice — not slide decks. You'll pressure-test answers, hear what bar-raisers actually flag, and leave with a tighter story for your next loop.`;
  }
  if (/career|pivot|transition/i.test(lower)) {
    return `When the path isn't obvious, ${firstName} helps mentees map options against real trade-offs from ${y}${inField}. Expect honest takes on risk, timing, and how to make a move without burning bridges.`;
  }
  if (/resume|cv/i.test(lower)) {
    return `${firstName} line-edits with hiring-manager eyes${atCo}: what to cut, what to bold, and which bullets signal scope versus noise. Most mentees leave with a sharper one-pager and a clearer narrative arc.`;
  }
  if (/network|intro/i.test(lower)) {
    return `Warm intros beat cold outreach — ${firstName} coaches the outreach that doesn't feel cringe: who to target, what to say, and how to stay in touch without being annoying.`;
  }
  if (/system design|architecture/i.test(lower)) {
    return `From whiteboard to production constraints, ${firstName} walks through how teams${atCo} actually evaluate design decisions — trade-offs, failure modes, and what "senior" signals in an interview or review.`;
  }
  if (/product|roadmap|strategy/i.test(lower)) {
    return `${firstName} connects ${tag.toLowerCase()} to decisions mentees face now: prioritization calls, stakeholder alignment, and how to show impact when the roadmap is messy.`;
  }
  if (/market|content|growth|gtm|conversion/i.test(lower)) {
    return `${firstName} treats ${tag.toLowerCase()} as measurable work — channels, messaging, and the experiments that moved the needle${atCo}. Sessions often become live teardowns of what you're running today.`;
  }
  if (/finance|equity|model|invest/i.test(lower)) {
    return `Spreadsheets and intuition both matter. ${firstName} breaks down ${tag.toLowerCase()} the way it's used${inField || atCo}: assumptions, red flags, and the questions investors or hiring managers expect you to defend.`;
  }
  if (/leadership|team|manage|people/i.test(lower)) {
    return `${firstName} covers the unglamorous parts of ${tag.toLowerCase()} — hiring, feedback, delegation, and the politics nobody puts in the job description — from ${y} of doing it${atCo}.`;
  }
  if (/machine learning|deep learning|ml|data|python|research/i.test(lower)) {
    return `${firstName} bridges theory and shipping: how ${tag.toLowerCase()} shows up in real projects${atCo}, what interviewers probe, and how to talk about trade-offs without hand-waving.`;
  }

  const roleBit = title ? ` As ${title}${atCo},` : atCo ? ` From ${company},` : '';
  return `${firstName} brings ${y} of hands-on ${tag.toLowerCase()}${inField}.${roleBit} sessions focus on your situation — frameworks ${firstName} has used, mistakes to skip, and concrete next steps before you hang up.`;
}

function takeawaysForTag(tag) {
  const lower = tag.toLowerCase();
  if (/interview/i.test(lower)) return ['Mock answers with real-time feedback', 'A prioritized prep plan for your target role'];
  if (/resume/i.test(lower)) return ['Line-level edits on your current draft', 'Bullets reframed for scope and impact'];
  if (/career|pivot/i.test(lower)) return ['A short list of viable paths with trade-offs', 'Talking points for hard conversations'];
  if (/network/i.test(lower)) return ['Outreach templates that sound human', 'A follow-up rhythm you can sustain'];
  if (/product|roadmap/i.test(lower)) return ['A clearer prioritization frame', 'Language for stakeholder updates'];
  if (/growth|market|content/i.test(lower)) return ['Teardown of your current funnel or campaign', 'Experiments worth running next'];
  if (/system|architect/i.test(lower)) return ['Structured approach to open-ended prompts', 'Checklist for reliability and scale'];
  if (/leadership|team/i.test(lower)) return ['Feedback scripts that land', 'Hiring and delegation patterns that scale'];
  return ['Frameworks applied to your scenario', 'Action items while the context is fresh'];
}

/**
 * Rich expertise rows for mentor profile — derived from tag strings + profile context.
 */
export function buildExpertiseCards(mentor, groups, { limit = 6 } = {}) {
  if (!groups?.expertise?.length) return [];

  const ctx = {
    firstName: mentor?.firstName ?? mentor?.name?.split(/\s+/)[0] ?? 'They',
    years: mentor?.yearsExperience ?? mentor?.years_experience ?? null,
    company: mentor?.company ?? null,
    title: mentor?.roleLabel ?? mentor?.title ?? null,
    industry: groups.industry?.[0] ?? mentor?.industry ?? null,
    bio: mentor?.bio ?? null,
    tools: groups.tools ?? [],
  };

  return groups.expertise.slice(0, limit).map((tag, index) => ({
    id: `${tag}-${index}`,
    title: tag,
    icon: pickIcon(tag),
    description: narrativeForTag(tag, ctx),
    takeaways: takeawaysForTag(tag),
    relatedTools: relatedTools(tag, ctx.tools),
    sessionKeys: pickSessionTypes(tag),
  }));
}
