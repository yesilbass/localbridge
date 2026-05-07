---
name: bridge-skill-sync
description: >-
  Bridge skill drift detection — keep SKILL.md files aligned with the
  evolving codebase. Detects stale paths, removed symbols, new patterns,
  schema changes, renamed components, palette changes. Use after any
  structural code change, after schema migrations, after refactoring
  shared utilities, after renaming files, when adding new conventions
  used 3+ times, or as a periodic audit when skills feel out of sync
  with the actual code.
---

# Bridge skill sync

Skills go stale silently. A renamed file, a removed symbol, a new pattern
adopted in three places — none of these throw errors, but they all erode
the value of the skill system. This skill is the audit pass that keeps
skills aligned with reality.

Run it when the codebase changes structurally, not on every tweak.
Pair with `bridge-skill-authoring` for the actual edit work.

---

## 1. When to run sync

### After these code changes (always)

- File or directory renamed or removed.
- Symbol exported from `client/src/api/*` removed or renamed.
- New table added; existing table's RLS or columns changed.
- New `@utility` or palette token introduced.
- A pattern is used in 3+ places without being documented in any skill.
- Stack package upgraded across a major version (motion, React Router, Tailwind).

### Skip sync for

- Bug fixes that change behaviour but not API.
- Visual tweaks to existing components.
- Content/copy changes.
- Tests added.

The bar is "the next time someone reads the skill, would the file path,
symbol, or pattern still resolve?" If yes, no sync needed.

---

## 2. The skill ↔ code ownership map

When code changes in these areas, the corresponding skill is the
candidate for an update:

| Code area / pattern | Owning skill |
|---|---|
| `client/src/index.css` (new `@utility`, keyframe, palette token usage) | `bridge-ui`, `bridge-motion` |
| `client/src/appearance.css` (palette tokens, theme colors) | `bridge-ui`, `bridge-context` |
| `client/src/components/*` new shared component | `bridge-ui` |
| `client/src/pages/landing/*` new section | `bridge-web-design` |
| `client/src/api/supabase.js` or singleton patterns | `bridge-data-flow`, `bridge-context` |
| `client/src/api/ai*.js`, `api/prompts/*` | `bridge-ai-features` |
| `client/src/api/*.js` new query/return shape | `bridge-data-flow` |
| `client/src/utils/appearance.js`, `routePalette.js` | `bridge-context`, `bridge-ui` |
| `client/src/utils/useInView.js`, motion utilities | `bridge-motion`, `bridge-transitions` |
| `client/src/constants/*` | `bridge-context` |
| `client/src/context/*` | `bridge-data-flow`, `bridge-context` |
| `server/routes/*` new endpoint | `bridge-data-flow`, `shipping-features` |
| `server/middleware/*` auth changes | `bridge-data-flow`, `bridge-context` |
| `supabase/migrations/*` schema change | `CLAUDE.md` (primary), `bridge-data-flow` (secondary) |
| `vercel.json` rewrites | `bridge-context` |
| `package.json` major dep change | `bridge-context` |
| Stripe-related (`api/create-*-checkout.js`, `EmbeddedCheckoutPanel.jsx`) | `.cursor/skills/adding-stripe/SKILL.md` |
| WebRTC / video signaling | `bridge-data-flow`, `bridge-debugging` |
| Google Calendar OAuth | `bridge-data-flow`, `shipping-features` |

A code change can affect more than one skill — sync them together if so.

---

## 3. Drift detection (the audit pass)

Run these checks against each skill periodically:

### A · Stale paths

```bash
# Extract paths cited in skill bodies
rg -no '`[a-zA-Z_/.-]+\.(jsx?|css|sql|md)`' .claude/skills/*/SKILL.md | sort -u

# Then verify each exists
for path in $(rg -no '`[a-zA-Z_/.-]+\.(jsx?|css|sql|md)`' .claude/skills/*/SKILL.md | tr -d '`' | sort -u); do
  test -f "$path" || echo "MISSING: $path"
done
```

Any "MISSING" line means a skill cites a file that no longer exists.
Update the skill — either remove the citation or repoint to the new path.

### B · Stale symbol references

For each skill, extract code-style identifiers and grep them:

```bash
# Example: validate that bridge-data-flow's API references still exist
rg -o "getMentorById|getAllMentors|createSession" client/src
rg -o "getMentorById|getAllMentors|createSession" .claude/skills/bridge-data-flow/SKILL.md
```

If a symbol is in the skill but not the code, the skill is stale.
If a symbol is in the code but not in the skill, decide whether the
new symbol is significant enough to document.

### C · New patterns

When a new pattern is used in 3+ places without skill mention, the skill
needs a new section.

```bash
# Example: count usages of a new utility class in JSX
rg -c 'animate-new-effect' client/src/components client/src/pages | rg -v ':0$'
# If 3+ files match, document the utility in bridge-motion or bridge-ui
```

### D · Renamed conventions

If `--bridge-text-secondary` becomes `--bridge-text-body` (hypothetical),
every skill that mentioned the old name needs updating:

```bash
rg -l 'bridge-text-secondary' .claude/skills
```

`multi_edit` with `replace_all: true` per file.

### E · Removed features

If a feature is removed from the product, the skill section that taught
it must go too. Don't leave dead patterns.

---

## 4. Sync protocol (the actual edit)

Once drift is detected, edit minimally:

1. **Read the affected skill once** — cache in conversation.
2. **Locate the smallest section to change** — title, table row, code example, citation.
3. **`multi_edit`** with exact matches. Use `replace_all: true` for renames; explicit `old_string` for content changes.
4. **Verify** name, description length, total line count, frontmatter validity.
5. **Hand off** in one sentence per skill changed.

### Don't sync by

- Rewriting the whole skill.
- Adding "as of <date>" to mark currency.
- Adding speculative coverage for patterns that *might* emerge.
- Deleting sections without confirming they're truly orphaned.

### Do sync

- Repoint citations.
- Replace renamed symbols.
- Add a single new section for a genuinely new pattern.
- Remove sections for deleted features.
- Update tables when their entries change.

---

## 5. Schema-change sync (a special case)

Schema changes affect multiple files at once: the migration, the api
module that queries the table, the consuming component, and `CLAUDE.md`'s
schema documentation.

Order of updates:

1. **Migration SQL** in `supabase/migrations/` — the user runs this manually.
2. **`client/src/api/<table>.js`** — query patterns updated.
3. **Consuming components** — UI states updated.
4. **`CLAUDE.md`** — schema table updated (only after the user confirms migration ran).
5. **`bridge-data-flow/SKILL.md`** — RLS table or query patterns updated if the change affects guidance.

Don't update the skill before the schema is live. Stale schema
documentation is worse than missing schema documentation — it actively
misleads.

---

## 6. Convention-change sync

When a project-wide convention shifts (palette renamed, new component
naming scheme, new test framework adopted), several skills update at
once.

Procedure:

1. Identify all affected skills via grep.
2. Plan the change as one batched diff before editing.
3. `multi_edit` per skill, all in one Claude turn for atomicity.
4. Re-read each updated skill to confirm consistency.
5. Update the README if the skill catalog changed.

Convention changes are rare. When they happen, sync is mandatory in the
same session — don't leave the codebase and skills out of step.

---

## 7. Adding a new skill (when sync is the wrong tool)

If a code change introduces a domain Claude doesn't have a skill for
(e.g., adding a notifications system, a search backend), don't expand
an existing skill past its scope. Use `bridge-skill-authoring` to create
a new skill instead.

The boundary: if the new content is one section in an existing skill,
update. If it's a whole new domain with its own rules, anti-patterns,
and verification — author a new skill.

---

## 8. Periodic audit (run quarterly or before a major demo)

A scheduled pass keeps skills high-signal. Run all of:

- Stale path check (Section 3A) across every skill.
- Stale symbol check on the top 5 most-cited symbols per skill.
- Pattern counter on new utilities adopted since last audit.
- Cross-reference check (skills referencing each other should still match names).

Output a single audit report:

```
## Skill audit — <date>

### bridge-ui
- 2 stale citations (file moved): client/src/components/old.jsx → new.jsx
- 1 new pattern: `data-section-anchor` adopted in 4 places — add to Section 3

### bridge-data-flow
- All paths valid.
- New table `notifications` not yet documented.

### Action plan
- multi_edit bridge-ui (3 changes).
- author new bridge-notifications skill.
```

The audit is a sub-skill of this skill — do it as one focused task, not
as a drive-by during feature work.

---

## 9. Cross-skill consistency

When two skills cover related territory (`bridge-motion` + `bridge-transitions`,
`bridge-ui` + `bridge-web-design`), keep them aligned:

- Same terminology ("pair class A/B/C/D" appears in both `bridge-ui` and `bridge-web-design`).
- Same code examples cite the same canonical files.
- Cross-references resolve (skill A says "see skill B" — confirm B exists and covers what A claims).

When updating one, scan the sibling for terms that should match. A
divergence in terminology between sibling skills is itself drift.

---

## 10. Verification checklist

After a sync pass:

- [ ] Every cited path exists.
- [ ] Every cited symbol exists in the codebase.
- [ ] Every cross-reference to another skill resolves.
- [ ] Frontmatter (`name`, `description`) still valid (≤ limits).
- [ ] Body length still in budget.
- [ ] No new content added speculatively.
- [ ] README skill list reflects any additions/removals.
- [ ] Sibling skills consistent in terminology.

---

## 11. Anti-patterns (auto-reject)

- Updating a skill "to be safe" without a code change driving it.
- Wholesale rewrites when a 5-line edit would do.
- Adding speculative coverage for hypothetical future patterns.
- Leaving stale citations because "we'll fix it later".
- Updating a skill but not the README skill catalog (or vice versa).
- Cross-referencing a skill that doesn't exist yet.
- Bumping line count past the budget while syncing — sync is repointing, not expansion.
- Syncing before the user has confirmed a schema migration ran.

---

## 12. When in doubt

Don't sync. Stale skills hurt; speculative skills hurt more. If you're
unsure whether a code change warrants a skill update, leave the skill
alone and raise it as a follow-up to the user.
