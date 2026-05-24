/** Deterministic pseudo-years per tool from mentor tenure — not stored in DB. */
function toolTenure(totalYears, toolName, index) {
  if (!totalYears || totalYears < 1) return null;
  const seed = toolName.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const spread = Math.max(2, Math.floor(totalYears * 0.55));
  const offset = (seed + index * 5) % spread;
  return Math.max(1, Math.min(totalYears, totalYears - offset));
}

function proficiencyLabel(years, totalYears) {
  if (!years || !totalYears) return 'Hands-on';
  const ratio = years / totalYears;
  if (ratio >= 0.85 || years >= 8) return 'Daily driver';
  if (ratio >= 0.5 || years >= 4) return 'Production-grade';
  return 'Teaching-ready';
}

function monogramHue(toolName) {
  const seed = toolName.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const hues = [
    'var(--color-primary)',
    'var(--color-accent)',
    'var(--color-info, #0ea5e9)',
    'var(--color-success, #059669)',
  ];
  return hues[seed % hues.length];
}

function narrativeForTool(tool, ctx) {
  const { firstName, company, title, industry, tenure } = ctx;
  const lower = tool.toLowerCase();
  const tenurePhrase = tenure ? `${tenure}+ years` : 'regular';
  const atCo = company ? ` at ${company}` : '';
  const inField = industry ? ` in ${industry}` : '';

  if (/google ads|meta ads|facebook ads|linkedin ads|paid social|ppc/i.test(lower)) {
    return `${firstName} has run ${tenurePhrase} of paid campaigns${inField || atCo} — structure, bidding, creative testing, and the reporting that actually informs budget moves. Sessions often become live account teardowns: what's wasting spend, what's worth scaling, and how to read results without vanity metrics.`;
  }
  if (/google analytics|amplitude|mixpanel|segment|heap|posthog/i.test(lower)) {
    return `${firstName} uses ${tool} to answer "what happened?" and "what should we do next?" — event design, funnel reads, and the dashboards executives trust. Bring your current tracking setup; ${firstName} will spot gaps and quick wins in the first half of a session.`;
  }
  if (/figma|sketch|framer|canva/i.test(lower)) {
    return `${firstName} works in ${tool} ${tenurePhrase}${atCo} — handoff hygiene, component systems, and the critique that keeps designers and engineers aligned. Mentees share WIP files and leave with clearer specs, fewer revision loops, and language for stakeholder reviews.`;
  }
  if (/salesforce|hubspot|close|pipedrive|crm/i.test(lower)) {
    return `${firstName} treats ${tool} as an operating system, not a contact dump — pipeline stages, automation that doesn't break, and the fields reps actually fill in. Expect practical fixes for the messy CRM you're inheriting, not a generic admin tutorial.`;
  }
  if (/python|javascript|typescript|java|go|rust|ruby|php|sql|react|node|vue|angular|next/i.test(lower)) {
    return `${firstName} ships with ${tool} ${tenurePhrase}${atCo} — debugging patterns, code review standards, and how to talk about trade-offs in interviews or design docs. Bring a snippet, repo, or take-home; ${firstName} meets you at your level and pushes on clarity.`;
  }
  if (/aws|azure|gcp|docker|kubernetes|terraform|cloud/i.test(lower)) {
    return `${firstName} has operated ${tool} in production${inField || atCo} — cost control, failure modes, and the architecture choices that survive scale. Mentees often whiteboard a current system and leave with a safer migration or reliability plan.`;
  }
  if (/excel|tableau|looker|power bi|powerbi|bigquery|snowflake|databricks/i.test(lower)) {
    return `${firstName} turns ${tool} into decisions, not decks — models, queries, and visuals that hold up when someone asks "where did this number come from?" Share a messy spreadsheet or dashboard; ${firstName} will help you rebuild the logic mentees can defend in a meeting.`;
  }
  if (/notion|jira|linear|asana|monday|slack/i.test(lower)) {
    return `${firstName} uses ${tool} to keep teams moving without process theatre — templates, rituals, and the minimum structure that still creates accountability${atCo}. Good for operators drowning in tickets or docs nobody reads.`;
  }
  if (/stripe|klaviyo|mailchimp|drip|intercom|zendesk/i.test(lower)) {
    return `${firstName} has wired ${tool} into real revenue and retention flows${atCo} — integrations, edge cases, and the ops work behind a smooth customer experience. Bring your stack diagram; ${firstName} will flag bottlenecks and cheaper alternatives where they exist.`;
  }
  if (/tensorflow|pytorch|machine learning|ml/i.test(lower)) {
    return `${firstName} applies ${tool} beyond notebooks — data pipelines, evaluation, and the product questions that decide whether a model ships. Sessions balance theory with the constraints ${firstName} has hit${inField || atCo}.`;
  }

  const roleBit = title ? `${title}${atCo}` : company || 'their work';
  return `${firstName} has ${tenurePhrase} of hands-on ${tool} experience through ${roleBit}. In session, expect screen-share walkthroughs, checklists you can reuse, and honest notes on what beginners over-invest in versus what moves the needle.`;
}

function askAboutForTool(tool) {
  const lower = tool.toLowerCase();
  if (/ads|ppc|campaign/i.test(lower)) return 'Account structure, creative tests, or budget pacing';
  if (/analytics|mixpanel|amplitude|segment/i.test(lower)) return 'Event naming, funnel leaks, or exec reporting';
  if (/figma|sketch|design/i.test(lower)) return 'Critique, handoff, or design-system hygiene';
  if (/salesforce|hubspot|crm/i.test(lower)) return 'Pipeline hygiene, automation, or rep adoption';
  if (/python|javascript|typescript|react|node|sql/i.test(lower)) return 'Code review, debugging, or interview prep';
  if (/aws|gcp|azure|docker|kubernetes/i.test(lower)) return 'Architecture review or cost/reliability trade-offs';
  if (/excel|tableau|looker|power bi|bigquery|snowflake/i.test(lower)) return 'Model logic, queries, or stakeholder-ready views';
  if (/notion|jira|linear/i.test(lower)) return 'Team workflow design or backlog triage';
  return 'Your current setup, goals, and blockers';
}

/** Rich toolkit rows for mentor profile — derived from tool tag strings + profile context. */
export function buildToolkitCards(mentor, tools, { limit = 10 } = {}) {
  if (!tools?.length) return [];

  const source = mentor ?? {};
  const totalYears = source.yearsExperience ?? source.years_experience ?? null;
  const ctxBase = {
    firstName: source.firstName ?? source.name?.split(/\s+/)[0] ?? 'They',
    years: totalYears,
    company: source.company ?? null,
    title: source.roleLabel ?? source.title ?? null,
    industry: source.industry ?? null,
  };

  return tools.slice(0, limit).map((tool, index) => {
    const tenure = toolTenure(totalYears, tool, index);
    const ctx = { ...ctxBase, tenure };
    return {
      id: `${tool}-${index}`,
      name: tool,
      monogram: tool.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || tool.slice(0, 2).toUpperCase(),
      hue: monogramHue(tool),
      tenure,
      proficiency: proficiencyLabel(tenure, totalYears),
      description: narrativeForTool(tool, ctx),
      askAbout: askAboutForTool(tool),
    };
  });
}
