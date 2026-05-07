---
name: bridge-ai-features
description: >-
  Bridge AI integrations: OpenAI chat completions, structured JSON output,
  PDF file uploads, voice intake, prompt design, usage limits, retries,
  graceful failure, cost discipline. Use when writing, modifying, or
  debugging any AI-driven feature — mentor matching, resume review,
  intake call, mentee onboarding wizard, profile polishing, AI suggestions,
  or any code that calls OpenAI (or Anthropic) from the client or server.
---

# Bridge AI features

AI is core to Bridge's value proposition: instant mentor matching, AI
resume coach, voice intake before sessions. Each feature must feel
deterministic, fast, and trustworthy — investors should see "AI as a
product surface", not "AI as a demo gimmick".

This skill covers the actual AI stack in use, the prompt patterns the
codebase commits to, and the discipline that prevents AI features from
feeling flaky.

---

## 1. The AI stack (what actually ships today)

The Bridge codebase uses **OpenAI** end-to-end via direct REST calls.
The `VITE_ANTHROPIC_API_KEY` exists but is not currently consumed in
shipped features.

| File | Feature | Model | Pattern |
|---|---|---|---|
| `client/src/api/ai.js` | Resume → structured profile parse, mentor profile polish | `gpt-4o-mini` | JSON-mode chat completion |
| `client/src/api/aiMatching.js` | Mentor matching from mentee profile | `gpt-4o` | JSON output, strict schema validation |
| `client/src/api/aiResumeReview.js` | Resume review with letter grade + per-section feedback | `gpt-4o` | Files API + multimodal (file + text) |
| `client/src/api/intake.js` | Voice intake follow-up + post-call summary | `gpt-4o-mini` | Free-form text |
| `api/prompts/intakePrompt.js` | Real-time voice intake system prompt | n/a | Server-side system prompt for the realtime layer |
| `client/src/api/aiUsage.js` | Per-user feature usage tracking | n/a | Supabase `ai_usage` table |

API key access is direct from the client: `import.meta.env.VITE_OPENAI_API_KEY`.
This is a deliberate trade-off — exposes the key in the browser bundle,
keeps shipping velocity high. When the team moves to a server proxy, all
five files above migrate together.

---

## 2. Prompt design — the four invariants

Every AI call in Bridge follows these four invariants. They are not style
preferences; they are the difference between AI that works and AI that
fails 5% of the time.

### A · One job per call

A prompt does exactly one thing. Resume parsing does not also polish copy.
Matching does not also write feedback. Multi-task prompts compound failure
modes — when one piece is wrong, everything is wrong.

### B · Strict output schema

If the response is parsed by code, the prompt **must** specify the exact
JSON schema and append: "Return ONLY valid JSON — no markdown, no
preamble." Then double-protect with a markdown-fence stripper:

```js
const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
```

GPT-4o still occasionally wraps JSON in fences despite instruction. Strip
defensively.

### C · System prompt = role + tone + non-negotiables

System prompts compress identity. The Bridge style:

```
You are a [role] for [context]. You [behaviour]. You always
[non-negotiable]. You never [forbidden].
```

Real example from `aiMatching.js`:

> You are an expert career counselor and mentor matching engine. Your job
> is to analyze a mentee's profile and goals, then identify the best
> mentor matches from a provided list. You evaluate alignment across:
> industry fit, career stage, goal relevance, expertise overlap, and
> session type compatibility. You always return structured JSON only — no
> prose, no markdown fences, no explanation.

Two sentences of identity. One sentence of method. One non-negotiable.
Done.

### D · Validate the shape before trusting it

Never `return parsed` directly. Validate at minimum:

- The top-level keys exist.
- Arrays have the expected length (`top_matches.length === 3`).
- Numbers are within bounds.

When validation fails, throw a user-facing error string ("We had trouble
reading your resume. Make sure it's a text-based PDF, not a scanned image"),
not the raw API response. Users do not need to see the model output.

---

## 3. JSON-mode call (the canonical client pattern)

```js
async function callOpenAIJson({ model = 'gpt-4o-mini', system, user, maxTokens = 2000 }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set.');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenAI error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? '';
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned malformed JSON — try again.');
  }
}
```

Use this shape (or extract a helper) for every JSON-output call. Do not
add new HTTP libraries; `fetch` is the project standard.

`response_format: { type: 'json_object' }` forces JSON output but the
prompt **must still mention "Return ONLY valid JSON"** — without that
instruction, the model returns valid JSON like `{"answer": "<markdown text>"}`
which is not what you want.

---

## 4. Multimodal (file + text)

Resume review uploads a PDF to the OpenAI Files API, then references the
file ID in the chat completion (`aiResumeReview.js`).

Pattern:

```js
// 1. Upload
const formData = new FormData();
formData.append('file', pdfBlob, 'resume.pdf');
formData.append('purpose', 'user_data');

const upload = await fetch('https://api.openai.com/v1/files', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
  body: formData,
});
const { id: fileId } = await upload.json();

// 2. Chat completion referencing the file
let response;
try {
  response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: [
          { type: 'file', file: { file_id: fileId } },
          { type: 'text', text: userText },
        ] },
      ],
    }),
  });
} finally {
  // 3. Always clean up uploaded files
  fetch(`https://api.openai.com/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  }).catch(() => {});
}
```

The `try/finally` for file cleanup is **mandatory**. OpenAI's Files API
charges for storage; orphaned files leak money. Even on API failure,
delete the file.

---

## 5. Voice intake (real-time + speech synthesis)

`client/src/pages/IntakeCall.jsx` orchestrates the voice intake. The
current architecture:

- **System prompt**: `api/prompts/intakePrompt.js` (canonical voice flow with session-type questions).
- **Speech-to-text**: browser SpeechRecognition API (free, no model cost).
- **Follow-up generation**: `generateFollowUp()` in `api/intake.js` — `gpt-4o-mini`, returns either a question or `DONE`.
- **Summary generation**: `generateSummary()` in `api/intake.js` — `gpt-4o-mini`, returns 3–5 sentence briefing.
- **Speech synthesis**: browser `SpeechSynthesis` (`speakText()`).

Rules when modifying intake:

- The system prompt's question list must stay aligned with `SESSION_TYPES` in `client/src/constants/sessionTypes.js`. If you add a session type, add its question block in `intakePrompt.js`.
- The follow-up rule is "ONE follow-up per question". The model is instructed to return `DONE` when the answer is sufficient. Never trust the model to limit itself — gate to one follow-up per question on the client side too.
- Speech synthesis can fail silently on iOS Safari. Always resolve `onerror` so the flow does not deadlock.
- Pause SpeechRecognition while the assistant is speaking; otherwise the assistant transcribes itself.

---

## 6. Usage limits — the `ai_usage` table

Bridge tracks per-user AI feature usage to control cost:

```js
// client/src/api/aiUsage.js
export const LIMITS = {
  resume_review: 1,
  mentor_match: 3,
};
```

Pattern when adding a new AI feature:

```js
const userId = (await supabase.auth.getUser()).data.user?.id;
if (!userId) throw new Error('Not signed in.');

if (await hasReachedLimit(userId, 'feature_name')) {
  throw new Error('You\'ve used your free run of this feature.');
}

const result = await runAIFeature(...);
await recordUsage(userId, 'feature_name');
return result;
```

Add the new feature key to `LIMITS` and update RLS on the `ai_usage`
table to permit the insert. Limit values are intentionally low — Bridge
is funded out of pocket until seed closes.

UI consequence: every AI feature must show the user how many runs remain
**before** they invest effort. Resume review shows "1 free review" prominently.

---

## 7. Failure modes and how to handle them

AI calls fail in five distinct ways. Each has a different fix.

| Failure | Symptom | Handling |
|---|---|---|
| **Network / 5xx** | `fetch` throws or `res.ok` false with 5xx | Retry once with exponential backoff (250 ms, 1 s). Then surface a user error. |
| **401 / 403** | Bad or missing key | Surface a configuration error to the dev console; user-facing message says "AI is temporarily unavailable". |
| **400 / 422** | Bad request shape | Bug in code — log full payload, throw, do not retry. |
| **429 (rate limit)** | "rate_limit_exceeded" | Show "Try again in a moment", retry after the `Retry-After` header. |
| **Malformed output** | JSON.parse fails or schema validation fails | One retry with the same prompt. If still bad, surface a user-friendly error and ask the user to try again. |

Retry pattern (use sparingly):

```js
async function callWithRetry(fn, retries = 1) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    if (err.message.includes('429') || err.message.includes('5')) {
      await new Promise(r => setTimeout(r, 800));
      return callWithRetry(fn, retries - 1);
    }
    throw err;
  }
}
```

Never retry indefinitely. AI calls are slow and costly — failures should
fail-fast and ask the user.

---

## 8. Streaming (when to add it)

The current codebase does not stream responses — every call is a single
JSON round-trip. Streaming makes sense when:

- The user is reading the output as it arrives (chat UI).
- The output is > 10 seconds of generation and a spinner feels frozen.

Streaming does **not** make sense when:

- The output is parsed as JSON (you can't parse partial JSON).
- The output gates a navigation (must wait anyway).

If you add streaming for a future feature (chat-style mentor coach):

```js
const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({ model: 'gpt-4o', stream: true, messages: [...] }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // SSE format: lines beginning with "data: "
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6);
    if (payload === '[DONE]') return;
    const json = JSON.parse(payload);
    const delta = json.choices?.[0]?.delta?.content ?? '';
    onDelta(delta);
  }
}
```

UX: render the streaming text with a soft caret (no blink while streaming;
blink only after it pauses). Keep the container scroll-locked to the
bottom unless the user scrolls up.

---

## 9. Cost discipline (this matters more than you think)

OpenAI bills per token in + token out. Bridge is pre-revenue.

| Cost lever | Action |
|---|---|
| Pick the right model | `gpt-4o-mini` is ~10× cheaper than `gpt-4o`. Use mini for parsing, polishing, follow-ups. Use full `4o` only for matching and resume review. |
| Cap `max_tokens` | Always set. Resume review: 2000. Matching: 1500. Follow-up: 120. Summary: 400. Never omit. |
| Trim user input | Resume parsing slices at 8000 chars (`resumeText.slice(0, 8000)`). Apply similar bounds for any user-supplied long text. |
| Cache deterministic outputs | A "polish this profile" call with the same input yields the same output. If we run it twice (re-onboarding), use a cache key in `localStorage` or `mentor_profiles`. |
| Skip when not needed | Mentor profile polish only needs to run if the user clicked "improve with AI". Don't auto-run on save. |

Bridge spends < $50/mo on AI today. That is the budget. Every new feature
starts by answering "what's the cost ceiling for this?"

---

## 10. Prompt versioning

When you tune a prompt, treat it like code:

- **One prompt per file** — `aiMatching.js` owns its prompt, not a shared "prompts" registry. Co-location keeps the prompt close to the code that consumes its output.
- **No magic string concatenation** of instructions. If a prompt has a list of session types, generate the list from `SESSION_TYPES`, not by hardcoding.
- **Don't ship breaking prompt changes silently.** A prompt change that alters output schema is a code change — update the parser, update validation, update the consuming UI.

---

## 11. Anti-patterns (auto-reject)

- AI calls that don't validate the response shape before returning.
- Showing raw API errors to users (`OpenAI error 429: rate_limit_exceeded`).
- Auto-running AI on page load (every visit costs money).
- AI features without a usage limit (`ai_usage` row).
- Long-tail retries (more than 1 retry after a failure).
- Prompts hardcoded in JSX — extract to the api module.
- Mixing system and user content in one role.
- Forgetting to clean up uploaded Files API files.
- AI features without loading + error UI.
- Multiple AI calls in series when one prompt could cover both jobs (and one prompt could not — see invariant A in Section 2 — so split, do not combine).

---

## 12. When adding a new AI feature

1. **Plan**: name the one job, the input shape, the output shape, the model tier, the cost ceiling.
2. **Add to `LIMITS`**: pick a usage cap.
3. **Write the API module** (`client/src/api/ai<Feature>.js`) using the canonical pattern from Section 3.
4. **Validate** the output shape; fail loudly on malformed responses.
5. **Wire usage tracking** (`hasReachedLimit` → `runAIFeature` → `recordUsage`).
6. **Build the UI**: loading + empty + error states. Show remaining uses.
7. **Test failure paths**: kill the network, rate-limit, malformed output.
8. **Verify cost**: log the response's `usage` field for your first 10 test calls; confirm token counts match expectations.

The whole flow should land in 1–2 files. If you find yourself adding 5+
files for an AI feature, you are over-engineering — flatten.

---

## 13. Future migration: server-side proxy

When the team moves AI calls behind a server proxy (to hide the key, add
caching, add per-IP rate limiting):

- Each `client/src/api/ai*.js` becomes a thin `fetch('/api/ai/<feature>', ...)`.
- Server endpoints in `server/routes/ai.js` (new file) hold the OpenAI key.
- Vercel mirrors in `api/ai-<feature>.js`.
- The prompt stays where it is — co-located with the calling module — but is imported by the server, not the client.

The migration is mechanical because the client API surface (`getAIMatchedMentors`,
`getAIResumeReview`, etc.) does not change.
