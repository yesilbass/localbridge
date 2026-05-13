# Bridge Mentor Verification & Tiering System

End-to-end verification + tiering pipeline shipped 2026-05-13. Test mode by default; one env var swap to live providers.

## Tiers

| Tier      | Score   | Visibility                  |
|-----------|---------|-----------------------------|
| Bronze    | 0–39    | Hidden from default search (`?include_unverified=1` to see) |
| Silver    | 40–69   | Visible, deprioritized       |
| Gold      | 70–89   | Default-ranked, featured-eligible |
| Platinum  | 90–100  | Top of search, featured carousel |

## Components (sum to 100)

| Component             | Weight | Source                                |
|-----------------------|--------|---------------------------------------|
| Identity              | 15     | Phone OTP + email                     |
| Government ID         | 15     | ID + selfie (filename suffix scoring in test) |
| Professional email    | 10     | Domain verification                   |
| LinkedIn / portfolio  | 10     | Server fetch + AI summary             |
| Resume                | 20     | OpenAI structured eval (gpt-4o-mini)  |
| Domain interview      | 15     | AI rubric on transcript               |
| References (×2)       | 10     | Token-gated form + AI authenticity    |
| Track record          | 5      | Past sessions × ratings               |

## Modes

`BRIDGE_VERIFICATION_MODE=test` (default) — deterministic, no real KYC, free testing.
`BRIDGE_VERIFICATION_MODE=live`           — providers throw until wired (Twilio Verify, Checkr, ZeroBounce, etc.).
`BRIDGE_VERIFICATION_MODE=off`            — every endpoint returns 503; wizard hidden; existing mentors keep tier.

## Test-mode shortcuts

| Component         | Sentinel inputs                                                     |
|-------------------|---------------------------------------------------------------------|
| Phone             | `+15555550100` pass · `+15555550101` fail · `+15555550102` review   |
| Gov-ID filename   | `*_pass.{jpg,pdf}` · `*_fail.{jpg,pdf}` · `*_review.{jpg,pdf}`      |
| Pro email         | `@bridge-test.com`/`@stripe-test.com` pass · gmail = 50% in test    |
| Resume filename   | Same suffix shortcuts; otherwise AI evaluated                       |
| Reference email   | `*+ref-pass@bridge.dev` · `*+ref-fail@bridge.dev` · `*+ref-review@bridge.dev` (auto-submit on invite) |
| OPENAI_API_KEY    | Missing → deterministic mock pass in test mode                      |

## Code Map

```
supabase/migrations/20260513120000_mentor_verification.sql
api/_lib/verification/
  ├ scoring.js        # pure tier math + recompute
  ├ providers.js      # test-mode stubs; live-mode integration targets
  ├ ai.js             # OpenAI structured-output evaluators with retry/fallback
  ├ orchestrator.js   # ensureActiveRun / writeStep / recomputeRun / finalizeRun
  └ admin.js          # isAdminUser()
api/verification/[action].js     # 12 actions: start, identity, gov-id, email, linkedin, resume, interview, references, finalize
api/admin/review/[action].js     # list, detail, decide
api/cron/verification-retry.js   # expire stale, aggregate refs, auto-finalize

client/src/api/verification.js
client/src/pages/onboarding/mentor/verify/
  ├ index.jsx                 # wizard root
  ├ scoring.js                # client-side mirror
  ├ hooks/useVerificationRun.js
  ├ components/{TierBadge, TestModeChip, VerificationShell}.jsx
  └ steps/{Welcome, Identity, GovId, ProfessionalEmail, LinkedIn, Resume, Interview, References, Review}.jsx
client/src/pages/refs/SubmitReference.jsx
client/src/pages/admin/verification/index.jsx

client/src/pages/dashboard/
  ├ TierExplainer.jsx
  ├ VerificationBanner.jsx
  └ useVerificationStatus.js   # NEW — separate from dashboardHooks.js per spec

tests/verification-scoring.test.js
```

## Admin

`public.admins(user_id)` is the gate. `is_bridge_admin()` is a SECURITY DEFINER fn used in RLS. Bootstrap row inserted for `ayesilbas3444@gmail.com`. Add more admins with:

```sql
insert into public.admins (user_id, email, notes)
select id, email, 'manual' from auth.users where lower(email) = lower('new-admin@example.com');
```

## Live-mode integration plan (when ready)

Swap each `if (isLive()) throw` in `api/_lib/verification/providers.js` for a real provider call. Return-shape stays identical so the orchestrator and wizard need zero changes.

- Identity → Twilio Verify
- Government ID → Checkr
- Professional email → ZeroBounce / Mailgun + DNS MX/SPF
- References → SendGrid/Resend transactional
- LinkedIn → ProxyCurl
