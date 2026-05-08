# Bridge — Claude Skills

Skills auto-load by description match. They live in `.claude/skills/<name>/SKILL.md`
and are discovered by Claude Code automatically. Token cost is metadata-only
at startup; only matched skill bodies load into context.

## The system (13 skills)

| Skill | Triggers on |
|---|---|
| `bridge-context` | Every Bridge task — project DNA, file map, token discipline, output discipline |
| `shipping-features` | Adding / modifying any feature, page, component, route, API, server endpoint |
| `bridge-ui` | Component / button / form / card / modal / chip / surface design + visibility audit |
| `bridge-web-design` | Hero / section / bento / pricing / page composition / conversion path |
| `bridge-layout` | Alignment, placement, spatial composition, visual weight, focal hierarchy, z-index |
| `bridge-motion` | Any animation, scroll effect, hero entrance, parallax, 3D, micro-interaction |
| `bridge-transitions` | Route changes, modal lifecycle, shared-element morphs, list ops, optimistic UI |
| `bridge-debugging` | Bugs, errors, broken behaviour, wrong output, RLS denials, perf glitches |
| `bridge-cleanup` | Refactors, dead code, a11y audits, perf audits, demo prep |
| `bridge-ai-features` | OpenAI calls, prompt design, JSON output, voice intake, usage limits |
| `bridge-data-flow` | Supabase queries, RLS reasoning, realtime, storage, auth, optimistic |
| `bridge-skill-authoring` | Create / edit / split / verify SKILL.md files efficiently |
| `bridge-skill-sync` | Keep skills aligned with the codebase after structural changes |

Plus the existing `.cursor/skills/adding-stripe/SKILL.md` for payments work.

## Composition (the common case)

Most non-trivial tasks fire two or three skills together.

| Task | Skills that compose |
|---|---|
| "Build a new landing section" | `bridge-context` + `shipping-features` + `bridge-web-design` + `bridge-layout` + `bridge-motion` |
| "Fix the broken hero animation" | `bridge-context` + `bridge-debugging` + `bridge-motion` |
| "Add favourites with optimistic UI" | `bridge-context` + `shipping-features` + `bridge-data-flow` + `bridge-transitions` |
| "AI suggestion modal for mentees" | `bridge-context` + `shipping-features` + `bridge-ai-features` + `bridge-ui` + `bridge-transitions` |
| "Cleanup the mentor profile page" | `bridge-context` + `bridge-cleanup` + `bridge-ui` (audit) + `bridge-layout` |
| "Wrong colors / disappearing buttons" | `bridge-context` + `bridge-ui` (audit) + `bridge-debugging` |
| "Things look misaligned / off-center" | `bridge-context` + `bridge-layout` |
| "After a refactor, update the skills" | `bridge-skill-sync` + `bridge-skill-authoring` |
| "Create a new skill for X" | `bridge-skill-authoring` |

## Why this layout works

- **Progressive disclosure** — each skill loads only when its description matches user intent. Idle cost is metadata only.
- **Parallel triggers** — Claude composes skills automatically. No manual orchestration.
- **No overlap** — each skill owns a distinct slice (operating context vs UI vs layout vs motion vs transitions vs data vs AI vs debugging vs cleanup vs meta).
- **Project-specific, not generic** — every example uses real Bridge tokens, real components, real schema.
- **Token-frugal** — descriptions are tight, bodies organised so the most-used info comes first.
- **Self-maintaining** — `bridge-skill-authoring` and `bridge-skill-sync` make the skill system itself a managed surface, not a one-time write.

## Authoring conventions

See `bridge-skill-authoring/SKILL.md` for the full spec.

- Names: kebab-case, lowercase, ≤ 64 chars.
- Descriptions: third-person, action-first, list specific triggers, ≤ 1024 chars.
- File paths: forward slashes only.
- No time-sensitive content (no "as of 2026" or pinned package versions that drift).
- Examples: concrete and copy-pasteable from actual Bridge files.
- Body length: ≤ 500 lines preferred, ≤ 700 acceptable when depth is the user's request.

## Adding a new skill

1. `mkdir -p .claude/skills/<name>`
2. Author per `bridge-skill-authoring`.
3. Body: principles → patterns → anti-patterns → verification.
4. Add a row to this README's skill table.
5. Test by issuing a prompt that should trigger it.

## Updating after code changes

`bridge-skill-sync` is the audit pass. Run it when:

- A file or symbol referenced in a skill is renamed or removed.
- A new pattern is adopted in 3+ places.
- Schema migrates.
- A convention shifts (palette renamed, naming scheme changed).

## Disabling a skill

Add to its frontmatter:

```yaml
disable-model-invocation: true
```

It still loads via `/<name>` slash-command but no longer auto-triggers.

## File sizes (current)

```
bridge-context             — ~300 lines
shipping-features          — ~280 lines
bridge-ui                  — ~600 lines
bridge-web-design          — ~400 lines
bridge-layout              — ~500 lines
bridge-motion              — ~500 lines
bridge-transitions         — ~580 lines
bridge-debugging           — ~180 lines
bridge-cleanup             — ~200 lines
bridge-ai-features         — ~415 lines
bridge-data-flow           — ~520 lines
bridge-skill-authoring     — ~280 lines
bridge-skill-sync          — ~250 lines
```

Idle context cost (metadata only): ~3 KB.
Typical task load (2–4 skills): 8–14 KB body content.
