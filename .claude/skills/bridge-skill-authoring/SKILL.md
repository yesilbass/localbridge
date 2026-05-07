---
name: bridge-skill-authoring
description: >-
  Bridge skill authoring — create, edit, split, and verify SKILL.md files
  efficiently. Frontmatter spec, description triggers, body structure,
  progressive disclosure, naming, length budget, validation. Use when
  creating a new skill, modifying an existing skill, splitting a skill
  into reference files, fixing a skill that is not auto-triggering, or
  reviewing a skill for quality, length, or token efficiency.
---

# Bridge skill authoring

Skills are how Claude amplifies Bridge work without re-discovering project
DNA every turn. A well-authored skill saves thousands of tokens and lifts
output quality on every task it matches. A poorly authored skill bloats
context, never triggers, or misleads.

This skill is the spec. Use it whenever a `SKILL.md` is being created,
edited, or audited.

---

## 1. Frontmatter — the only fields that matter for discovery

```yaml
---
name: kebab-case-name
description: >-
  Third-person description. What it does. When it triggers.
  Specific user-symptom phrases.
---
```

### `name`

- Kebab-case, lowercase, hyphens only.
- ≤ 64 characters.
- No reserved words (`anthropic-helper`, `claude-tools`).
- Match the directory name: `name: bridge-ui` lives at `.claude/skills/bridge-ui/SKILL.md`.

Pick gerund or domain forms: `processing-pdfs`, `bridge-ui`, `shipping-features`.
Avoid generic words: `helper`, `utils`, `tools`, `data`.

### `description`

- ≤ 1024 characters (full descriptions land 300–600 chars in Bridge).
- Third person. **Never** "I help", "you can", "we will".
- Two parts:
  1. **What the skill covers** — list of concrete topics.
  2. **When to use it** — list of user phrases or symptoms.

Strong example (from `bridge-ui`):

```
description: >-
  Bridge UI system: contrast-pair contract, palette tokens, type, spacing,
  elevation, components (button, card, modal, form, chip, avatar), focus,
  accessibility, visibility audit. Use when designing or modifying any
  component, surface, button, card, modal, form, badge, chip, navbar,
  dropdown, tooltip, toast, avatar, or visual element — and whenever a
  text, font, button, or color looks wrong, invisible, washed out,
  low-contrast, or off-palette in any of the three Bridge palettes
  (modern-signal, grounded-guidance, quiet-authority).
```

Weak examples (never ship):

```
description: Helps with UI                            # too vague
description: I can fix your buttons and cards         # first person
description: Use this for everything visual           # no triggers
```

The description is the **only** thing pre-loaded into context at startup.
Every other word in `SKILL.md` is invisible until the description matches.
Treat this field like a search query for itself.

---

## 2. Body structure — the canonical layout

```
# Skill title

[1–2 paragraphs: what this skill is for, who pairs with it]

---

## 1. Operating principle / mission frame
## 2. Hard rules / contracts
## 3–N. Patterns, with concrete code examples
## N+1. Anti-patterns (auto-reject)
## N+2. Verification ladder / pre-ship checklist
```

Every Bridge skill follows this rhythm. It mirrors the way Claude reads:
principles first (so reasoning aligns), patterns second (so output matches
house style), anti-patterns third (so common mistakes are flagged), then
verification (so handoff quality is auditable).

---

## 3. Length budget

| Range | Status |
|---|---|
| ≤ 200 lines | Lean — preferred for narrow skills |
| 200–500 lines | Standard — comfortable depth, fast load |
| 500–700 lines | Acceptable when depth is the user's request |
| > 700 lines | Split — move reference material into sibling files |

Anthropic recommends ≤ 500 lines for ideal performance. Bridge tolerates
larger when the trade is "depth for tokens" — but only when each section
earns its place.

### Splitting (progressive disclosure)

When the body grows past 500 lines, move the optional details into
sibling files Claude loads only when needed:

```
.claude/skills/bridge-ui/
├── SKILL.md            ← overview + critical rules + index
├── reference.md        ← full token table + colour math
├── examples.md         ← copy-pasteable patterns
└── components.md       ← per-component anatomy
```

In SKILL.md, link with one-level depth only:

```markdown
**Full token table** — see `reference.md`
**Component anatomy** — see `components.md`
```

Do not nest references (a sibling that points to another sibling). Claude
loads files on demand; a chain of refs costs round-trips.

---

## 4. Description-trigger discipline

Skills auto-load when the user's request matches the description. To make
matching reliable:

### Include user vocabulary

Users say "broken", "invisible", "wrong colour", "looks weird" — not
"contrast-pair violation". Mirror their language in the trigger half of
the description.

```
Use when … a text, font, button, or color looks wrong, invisible,
washed out, low-contrast, or off-palette …
```

### Include system vocabulary

For Claude to compose skills correctly, also include system terms
(`RLS denial`, `pair class`, `usePerfTier`, `palette token`). The
description is read by both the user (rarely) and Claude (every turn).

### Avoid trigger collisions

Two skills with overlapping triggers compete. Resolve by:

- Narrowing one description's scope.
- Adding a "for X, see other-skill" pointer in the body.
- Merging if the skills are genuinely the same job.

`bridge-ui` covers components and visual contrast. `bridge-web-design`
covers section composition. Triggers must reflect that split.

### Test the trigger

After authoring, run a prompt that should fire the skill and confirm
Claude reads `SKILL.md`. If it doesn't fire, the description is too
abstract — add concrete user phrases.

---

## 5. Body content rules

### Concrete over abstract

Good: "Wrap entrance animations with `<RevealOnScroll>` (in
`pages/landing/`) or the simpler `<Reveal>` (`components/Reveal.jsx`)."

Bad: "Use the project's reveal utilities for entrance animations."

### Code examples must be copy-pasteable

Every code block should run as written, not as pseudocode. Imports
included, prop names accurate, paths valid.

### Tables for decision spaces

When patterns have orthogonal axes (situation × pattern, level × tool),
use a table. Tables compress decisions Claude would otherwise rebuild
from prose.

### Negative examples

End sections with anti-patterns. "Auto-reject" lists prevent the most
common drift. Without them, skills fail on "what NOT to do" because
prose explanations don't carry the same weight.

### Verification ladder

Every skill ends with a checklist or step-by-step verification. This is
the difference between "knowledge skill" and "doctrine skill" — Bridge
skills are doctrine.

### No time-sensitive content

Avoid "as of 2025", "current Stripe API version", "react-router-dom v7
introduced…". Skills outlive package versions. State current behaviour
without anchoring it in time.

---

## 6. Naming conventions in Bridge

| Prefix | Use |
|---|---|
| `bridge-*` | Domain skill specific to Bridge codebase (e.g., `bridge-ui`, `bridge-motion`) |
| `shipping-*` | Cross-cutting execution discipline (e.g., `shipping-features`) |

Stick to the project's existing conventions. New skills land alongside
the existing 13; the prefix communicates intent at-a-glance.

---

## 7. Authoring workflow (the loop)

### Plan (≤ 1 minute)

- Name the skill in one sentence.
- List 5–10 sub-topics it owns.
- List the user phrases that should trigger it.
- Decide whether it overlaps with any existing skill — if so, narrow scope.

### Draft

- Write the frontmatter first. Get name + description right before any body content.
- Build the body in section order: principle → rules → patterns → anti-patterns → verification.
- Reach for `multi_edit` when applying patterns across an existing skill; reach for `write_to_file` only when creating new (after `rm` on any existing version — `write_to_file` cannot overwrite).

### Verify

```bash
# Frontmatter present
head -1 .claude/skills/<name>/SKILL.md   # should be ---

# Name matches directory
grep '^name:' .claude/skills/<name>/SKILL.md   # should equal <name>

# Description length
awk '/^description:/{flag=1; next} /^---$/{flag=0} flag' .claude/skills/<name>/SKILL.md | tr -d '\n' | wc -c   # ≤ 1024

# Body line count
wc -l .claude/skills/<name>/SKILL.md   # target ≤ 500, max ~700
```

Then issue a prompt that should trigger the skill and confirm Claude
loads it. If not, tighten the description.

---

## 8. Updating an existing skill

Use `multi_edit` for surgical updates. Never rewrite end-to-end unless
the structure itself is wrong.

### Update triggers

- Code change introduced a new pattern or rule the skill should teach.
- Code change removed a path or symbol the skill referenced.
- A user-reported issue revealed a gap in the skill.
- A sibling skill was renamed (cross-references need updating).

### Don't update for

- Cosmetic improvement to a phrase.
- Speculative coverage of edge cases that haven't come up.
- "Polish" passes that bloat without adding signal.

### Update protocol

1. Read the current `SKILL.md` in full once (cache in conversation).
2. Identify the smallest section to change.
3. `multi_edit` with exact `old_string` matches.
4. Re-verify name, description length, total line count.
5. State the change in one sentence in the hand-off.

---

## 9. Templates

### Knowledge skill (covers a domain Claude needs to reason about)

```markdown
---
name: <name>
description: >-
  <one-line domain summary>. Use when <list of triggering phrases>.
---

# <Title>

<2 paragraphs: scope + companion skills>

---

## 1. The N inviolable rules
## 2. <Pattern A>
## 3. <Pattern B>
## 4. Anti-patterns
## 5. Verification
```

### Doctrine skill (controls Claude's behaviour in a workflow)

```markdown
---
name: <name>
description: >-
  <one-line doctrine summary>. Use when <triggering phrases>.
---

# <Title>

<1 paragraph: when this loop applies>

---

## 1. The loop / the contract
## 2. Phase-by-phase rules
## 3. Anti-patterns
## 4. Verification
```

### Reference skill (information only, rare in Bridge)

Pure tables and lookup. Most Bridge "reference" content lives inside
domain skills (Section 5 of `bridge-ui` is the token reference).
Standalone reference skills should be the last resort.

---

## 10. Common authoring mistakes

| Mistake | Fix |
|---|---|
| Description in first person ("I help you fix…") | Rewrite in third person |
| Description without trigger phrases | Add 5+ user-vocabulary phrases |
| Body opens with "This skill helps you…" | Open with the principle, not the meta |
| Code examples missing imports | Include the imports — copy-paste must run |
| Sections without anti-patterns | Add a "Anti-patterns" section per major rule |
| Tables for content that should be prose | If items aren't orthogonal, use a list |
| Cross-reference to a non-existent skill | `grep` for the skill name in the repo before linking |
| Skill ends with "Conclusion" or "Summary" | End with verification checklist |
| Time-pinned phrasing ("as of 2026") | Strip the time anchor |
| Windows-style paths (`scripts\helper.py`) | Always forward slashes |

---

## 11. Verification checklist

Before declaring a skill done:

- [ ] Frontmatter `name` matches directory; ≤ 64 chars; kebab-case.
- [ ] Frontmatter `description` ≤ 1024 chars; third person; lists triggers.
- [ ] Body opens with principle/scope, not meta-commentary.
- [ ] Patterns have copy-pasteable code (imports + paths included).
- [ ] Anti-patterns section present.
- [ ] Verification ladder or checklist present.
- [ ] Total length ≤ 500 lines (≤ 700 if depth is justified).
- [ ] No time-sensitive phrasing.
- [ ] No first person.
- [ ] Companion skills cross-referenced where they compose.
- [ ] Trigger test: a representative user prompt fires the skill.
- [ ] No emojis, no decorative headers.

---

## 12. When in doubt

Match the closest existing Bridge skill. The system is opinionated and
consistent on purpose — every new skill should slot in without changing
the meta-style.
