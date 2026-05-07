---
name: bridge-data-flow
description: >-
  Bridge data layer — Supabase queries, RLS reasoning, realtime channels,
  storage uploads, RPC, optimistic updates, error codes, query optimization,
  pagination, search/filter patterns, return shapes. Use when reading or
  writing data via @supabase/supabase-js, debugging RLS denials, designing
  a new table query, fetching session/mentor/review/favorite data, uploading
  resumes, subscribing to realtime channels, building any data-bound view,
  or repairing inconsistent return shapes across api modules.
---

# Bridge data flow

Supabase is the data backbone — Postgres + Auth + Storage + Realtime. Every
data-bound view in Bridge eventually touches it. This skill is the canonical
patterns for reading, writing, subscribing, and uploading, plus the RLS
reasoning that keeps writes from silently failing.

For Postgres schema details see `CLAUDE.md`. For AI-specific data work see
`bridge-ai-features` (AI features rely on the `ai_usage` table).

---

## 1. The Supabase singleton (one rule, no exceptions)

```js
// client/src/api/supabase.js
import supabase from './supabase';
```

Never instantiate a second client. Two clients = two auth sessions = mystery
401s. The `client/src/api/supabase.js` module throws if env vars are missing,
so importing it is also a config check.

Server-side, use `server/lib/supabaseAdmin.js` for service-role operations
only. Service-role bypasses RLS — never expose this client to client code,
and never log its operations with full payloads.

---

## 2. Return shape contract (consistency across api modules)

All `client/src/api/*.js` modules return one of two shapes:

### A · `{ data, error }` (preferred for view consumers)

```js
export async function getMyFavorites() {
  try {
    const { data, error } = await supabase.from('favorites').select('mentor_id');
    if (error) return { data: [], error };
    return { data: data ?? [], error: null };
  } catch (e) {
    return { data: [], error: e };
  }
}
```

The component does not need a `try/catch` — it checks `error` directly.
This shape is mandatory for view-bound calls because it makes loading +
empty + error states one switch.

### B · Throw on error (acceptable for command-style)

```js
export async function createSession(sessionData) {
  const { data, error } = await supabase.from('sessions').insert([sessionData]).select().single();
  if (error) throw error;
  return data;
}
```

Used for actions where the caller already wraps in `try/catch` (form
submits, mutations). Both styles exist in the codebase — match the
neighbouring file's style.

When in doubt, use Shape A. It composes better with React state.

### Inconsistencies to watch for

- `getMentorById()` returns `{ data: { mentor, reviews }, error }` — **do not destructure as `{ data: mentor }`**. Component code consumes `result.data.mentor`.
- `getAllMentors()` returns `{ data, error, totalCount }` for pagination.
- Mutations that select after insert/update return `data` directly (Shape B).

When adding a new module, read the closest neighbour first to match.

---

## 3. Query patterns

### Select with filters, search, sort, paginate

```js
let query = supabase
  .from('mentor_profiles')
  .select('*', { count: 'exact' })
  .or('onboarding_complete.is.null,onboarding_complete.eq.true');

if (search) query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%`);
if (industry) query = query.eq('industry', industry);
if (rateMin !== '') query = query.gte('session_rate', Number(rateMin));

query = query
  .order('rating', { ascending: false })
  .range(page * pageSize, (page + 1) * pageSize - 1);

const { data, error, count } = await query;
```

Patterns to memorize:

| Need | Method |
|---|---|
| Equality | `.eq('column', value)` |
| Inequality | `.neq()` |
| Range | `.gte()`, `.lte()`, `.gt()`, `.lt()` |
| Substring (case-insensitive) | `.ilike('column', '%term%')` |
| Multi-column OR | `.or('col1.ilike.%v%,col2.eq.123')` |
| Array contains | `.contains('jsonb_col', [value])` |
| In list | `.in('col', [a, b, c])` |
| Null check | `.is('col', null)` or `.not('col', 'is', null)` |
| Join via FK | `.select('*, related_table(*)')` |
| Count with rows | `.select('*', { count: 'exact' })` |
| Count only (head) | `.select('*', { count: 'exact', head: true })` |
| Single row (error if 0 or > 1) | `.single()` |
| Single row, null if 0 | `.maybeSingle()` |
| Paginate | `.range(from, to)` (inclusive) |

### Join syntax

```js
// Get session with the mentor profile attached
const { data } = await supabase
  .from('sessions')
  .select('*, mentor:mentor_profiles(*)')
  .eq('mentee_id', userId);
```

The `mentor:mentor_profiles(*)` syntax aliases the joined row. Use this
instead of two queries when the foreign key is set up — far cheaper than a
round-trip per session.

### Insert / update / delete

```js
// Insert
const { data, error } = await supabase.from('table').insert([row]).select().single();

// Update
const { data, error } = await supabase.from('table').update({ col: value }).eq('id', id).select().single();

// Upsert (insert or update on conflict)
const { data, error } = await supabase.from('table').upsert(row, { onConflict: 'unique_col' }).select().single();

// Delete
const { error } = await supabase.from('table').delete().eq('id', id);
```

Always `.select().single()` after insert/update if you need the resulting
row — Postgres returns it for free.

---

## 4. RLS-first thinking

Row-Level Security is enforced on every Supabase query. Before writing,
**reason about the policy** — not the code.

### The four questions to ask

1. **SELECT policy**: who can see this row? Does my filter satisfy the policy or am I relying on it?
2. **INSERT policy**: which columns must equal `auth.uid()` for the insert to be allowed?
3. **UPDATE policy**: do I own this row? RLS will silently filter rows I don't own — `update().eq('id', id)` may match zero rows and look like a no-op.
4. **DELETE policy**: do I own it? Same as update.

### Common Bridge RLS facts (memorize)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `mentor_profiles` | public anon | row's own user only | own user only | n/a |
| `sessions` | mentee or mentor | authenticated mentee | mentor only (mentee can cancel own) | n/a |
| `reviews` | public | authenticated | (none — DB trigger updates rating) | own |
| `favorites` | own | own | n/a | own |
| `user_profiles` | own | own | own | n/a |
| `user_settings` | own | own | own | n/a |
| `mentee_profiles` | own | own | own | n/a |
| `ai_usage` | own | own | n/a | n/a |

### Silent-failure traps

- **Mentee writing `mentor_profiles.rating`** — RLS denies, no error, silent. Ratings are recalculated by a DB trigger on `reviews`. Never write from client.
- **Update without `.select()`** — you can't tell if RLS dropped the row. Always `.select().single()` after writes you need to confirm.
- **`maybeSingle()` returning `null`** — could be RLS or genuinely no row. Distinguish with a follow-up `count`-only query under service role if it matters (server-side only).

---

## 5. Auth patterns

### Get the current user

```js
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Not signed in.');
```

For UI gating, prefer the `AuthContext` hook (`useAuth()`) — it caches the
session and avoids repeated `getUser()` calls.

For data calls that require an authenticated user, use the existing
`getAuthedUser()` helper pattern (see `favorites.js`):

```js
async function getAuthedUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
```

This double-checks session vs. user, which handles the edge case of an
expired session that still has cached user data.

### Sign-in / sign-up

```js
// Sign up (email + password)
const { data, error } = await supabase.auth.signUp({
  email, password, options: { data: { full_name } },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign out
const { error } = await supabase.auth.signOut();
```

After sign-up, the user receives a confirmation email by default. The
signed-in session is set immediately if confirmation is disabled in the
Supabase project — verify the project setting.

---

## 6. Realtime channels

Bridge uses Realtime for video signaling (`VideoCall.jsx`) and could expand
to live notifications, presence on mentor profiles, live session status,
etc.

### Channel pattern

```js
const channel = supabase.channel(`video:${sessionId}`)
  .on('broadcast', { event: 'offer' }, ({ payload }) => handleOffer(payload))
  .on('broadcast', { event: 'answer' }, ({ payload }) => handleAnswer(payload))
  .on('broadcast', { event: 'ice' }, ({ payload }) => handleIce(payload))
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') console.log('connected');
  });

// To send:
await channel.send({ type: 'broadcast', event: 'offer', payload: { sdp } });

// Cleanup (mandatory)
return () => { supabase.removeChannel(channel); };
```

### Postgres changes

```js
const channel = supabase.channel('sessions:mentee')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `mentee_id=eq.${userId}` },
    (payload) => updateLocalState(payload.new),
  )
  .subscribe();
```

Use `postgres_changes` for cross-tab sync (a session accepted in one tab
should reflect in another). Use `broadcast` for ephemeral signaling
(WebRTC offers, typing indicators).

### Rules

- **Always cleanup** in the effect's return — `removeChannel` or memory leaks.
- **Channel names are namespaced** — `<domain>:<id>`. Same name on both sides.
- **Filter on the server**, not the client. The `filter:` option pushes the WHERE clause to Postgres so the client never receives irrelevant events.
- **Don't subscribe to write-heavy tables broadly** — every write fires events to every subscriber. Always filter.

---

## 7. Storage (buckets)

Bridge has one bucket: `resumes` (private). Pattern in
`client/src/api/resumeStorage.js`.

### Upload

```js
import supabase from './supabase';

export const RESUMES_BUCKET = 'resumes';

export async function uploadResumeFile(userId, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage
    .from(RESUMES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return { path, filename: file.name, mime: file.type, uploaded_at: new Date().toISOString() };
}
```

Required:

- Path is **prefixed by `userId`** — RLS on the bucket gates access by this prefix.
- `upsert: false` — avoid silent overwrites.
- Sanitize the filename (kill `..`, slashes, query characters).

### Read (private bucket)

```js
const { data, error } = await supabase.storage
  .from(RESUMES_BUCKET)
  .createSignedUrl(path, 3600); // 1 hour
return data.signedUrl;
```

Never use `getPublicUrl()` for the resumes bucket — it's private. Signed
URLs expire; if you need persistence, request a fresh URL on demand.

### Delete

```js
const { error } = await supabase.storage.from(RESUMES_BUCKET).remove([path]);
```

For deleting all of a user's files (account deletion), `list()` then
`remove()` (see `removeAllResumesForUser()` in the storage module).

---

## 8. RPC (when to use)

RPC calls a Postgres function:

```js
const { data, error } = await supabase.rpc('function_name', { arg1: 'a', arg2: 'b' });
```

Use RPC when:

- The operation needs multiple coordinated writes in a transaction.
- The query is too complex for the JS query builder (recursive CTEs, window functions).
- The result needs to bypass row-level filtering for an aggregate (`count(*)` across rows the user can't see — uncommon).

Bridge does not currently use RPC heavily. If you reach for it, write the
SQL function in `supabase/migrations/` and hand the SQL to the user (do not
auto-apply).

---

## 9. Optimistic updates with rollback

For predictable, non-destructive actions, update UI before server confirms.
See `bridge-transitions` Section 11 for the motion side.

```js
async function toggleFavorite(mentorId) {
  setFavorites((set) => new Set([...set, mentorId])); // optimistic
  try {
    await api.addToFavorites(mentorId);
  } catch (err) {
    setFavorites((set) => {
      const next = new Set(set);
      next.delete(mentorId);
      return next;
    });
    showToast({ kind: 'error', content: 'Could not save.' });
  }
}
```

Skip optimistic for: payments, account deletion, anything destructive,
anything that affects other users in realtime (booking that another user
will see).

---

## 10. Error codes (memorize the common ones)

Supabase / PostgREST error responses include `code` and `message`. The
codes that show up in Bridge:

| Code | Meaning | Cause |
|---|---|---|
| `PGRST116` | No rows / multiple rows for `.single()` | Either you got 0 (treat as "not found") or > 1 (data integrity issue) |
| `PGRST301` | JWT expired | Refresh the session |
| `42501` | Permission denied (RLS) | Policy denied; check the RLS policy |
| `23505` | Unique violation | Duplicate insert; user already has the row |
| `23503` | Foreign key violation | Insert references a non-existent row |
| `23514` | Check constraint violation | Value out of range (rating > 5, etc.) |
| `22P02` | Invalid text representation | Bad UUID or numeric format |
| `42P01` | Undefined table | Wrong schema or migration not applied |

Match on `error.code` before `error.message` — codes are stable, messages
are not.

---

## 11. Search & filter patterns (mentor browse / dashboard)

The canonical `getAllMentors()` pattern composes filters conditionally:

```js
let query = supabase.from('mentor_profiles').select('*', { count: 'exact' });

if (search) query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,company.ilike.%${search}%`);
if (industry) query = query.eq('industry', industry);
if (availableOnly) query = query.eq('available', true);
if (rateMin !== '') query = query.gte('session_rate', Number(rateMin));
if (rateMax !== '') query = query.lte('session_rate', Number(rateMax));

query = query.order(sortColumn, { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);

const { data, error, count } = await query;
return { data: data ?? [], error: null, totalCount: count ?? 0 };
```

Conventions:

- Empty string filters are skipped, not coerced. `if (rateMin !== '')`, not `if (rateMin)`.
- Search is `.or()` across multiple columns with `.ilike`.
- Sort defaults to a sensible field (rating); user can override.
- Always return `totalCount` alongside `data` for paginated UIs.

For full-text search at scale, the `mentor_profiles` table has an
`expertise_search` generated column (`lower(expertise::text)`). Use
`expertise_search.ilike` for tag-like matching.

---

## 12. Pagination patterns

| Pattern | When |
|---|---|
| **`range()` + `count: 'exact'`** | Standard paginated list with page numbers |
| **Cursor-based (`gt('created_at', last)`)** | Infinite scroll feeds (more performant, no count round-trip) |
| **Range without count (`{ count: 'estimated' }`)** | When approximate count is fine and tables are large |

For mentor browse: `range()` + `exact` count is fine — the table size is
manageable. For session history / messages / activity feeds, switch to
cursor-based.

---

## 13. Anti-patterns (auto-reject)

- Instantiating a second `createClient` anywhere.
- `supabase.auth.getUser()` in a tight loop or render path (cache via context).
- `.single()` when 0 rows is a valid result (use `.maybeSingle()`).
- Inserting without `.select().single()` and then "guessing" the inserted row.
- Trusting `mentor_profiles.id` and `auth.users.id` are interchangeable.
- Updating `mentor_profiles.rating` from client code.
- Using `getPublicUrl()` for private buckets.
- Skipping `removeChannel()` cleanup on Realtime channels.
- Passing arbitrary user input into `.or()` without sanitizing — PostgREST `or` syntax can be abused.
- `select('*')` when you only need 3 columns (bandwidth + memory).
- Hardcoded UUIDs in code (use the auth user, env vars, or constants).

---

## 14. Performance

### Index awareness

Indexes that exist (per migrations):

- `mentor_profiles`: `id`, `user_id`, `industry`, `tier`, `available`, `expertise_search`.
- `sessions`: `mentee_id`, `mentor_id`, `scheduled_date`, `status`.
- `reviews`: `session_id`, `mentor_id`, `reviewer_id`.
- `favorites`: `(user_id, mentor_id)` unique composite.

Filter on indexed columns first, then non-indexed. Sort on indexed columns
when paginating large lists.

### Avoid N+1

If you find yourself in a loop calling `getMentorById()`, use a single
`getMentorsByIds(ids)` with `.in('id', ids)` instead.

### Cache aggressively in the client

Mentor lists, mentor profiles, and reviews change infrequently. A simple
in-memory `Map` keyed by ID with a 5-minute TTL is enough for browse →
detail navigation. The `AuthContext` is the natural home for caches that
span pages.

---

## 15. Adding a new table

1. Write the migration in `supabase/migrations/<timestamp>_<name>.sql`.
2. Define **all four RLS policies** (SELECT / INSERT / UPDATE / DELETE) — even if some are deny-all.
3. Add appropriate indexes for the columns the client filters or sorts on.
4. Hand the SQL to the user with copy-paste instructions for the Supabase SQL Editor. Do not auto-run.
5. Create `client/src/api/<table>.js` with the canonical query patterns from Section 3.
6. Match return shapes (Section 2) to neighbours.
7. Schema-document the new table in `CLAUDE.md` only after the user confirms the migration ran.

---

## 16. When in doubt

Match the closest existing api module's style. Bridge's data layer is
opinionated and consistent — copy from `mentors.js`, `favorites.js`,
`sessions.js` rather than inventing new patterns.
