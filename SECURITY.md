# Security Policy

Bridge is a paid mentorship platform handling real user accounts, session bookings, payment
processing, and live video calls. We take security seriously and are committed to resolving
confirmed vulnerabilities quickly and transparently.

---

## Supported Versions

Only the current production deployment (auto-deployed from `main`) is actively maintained
and eligible for security fixes. Feature branches and preview deployments are not covered.

| Version / Branch        | Supported |
|-------------------------|-----------|
| Production (`main`)     | ✅        |
| Preview / feature branches | ❌     |

---

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues, pull requests,
or any other public channel.** Public disclosure before a fix is in place puts all
users at risk.

To report a vulnerability, contact the owners directly:

- **Berk** — via the Bridge platform DM or the contact listed in the private team channel
- **Muaz** — same

Include as much of the following as you can:

- A clear description of the vulnerability and its potential impact
- The affected component (see Scope below)
- Step-by-step reproduction instructions
- Proof-of-concept code, a curl command, or screenshots — only if safe to share
- Your assessment of severity (Critical / High / Medium / Low)

We will not take legal action against researchers who report vulnerabilities responsibly
and in good faith under this policy.

---

## Response Timeline

| Milestone                          | Target     |
|------------------------------------|------------|
| Acknowledgment of report           | 48 hours   |
| Initial severity assessment        | 5 business days |
| Fix deployed (Critical / High)     | 14 days    |
| Fix deployed (Medium / Low)        | 30 days    |
| Researcher notified of resolution  | Same day as deploy |

We will keep you informed at each stage. If we need more information, we'll reach out
through the channel you used to report.

---

## Scope

### In Scope

The following areas are in scope for security reports:

| Area | Details |
|------|---------|
| **Authentication & session management** | Supabase Auth flows, JWT validation, token leakage, session fixation, account takeover |
| **Authorization & access control** | Row Level Security (RLS) bypasses, horizontal privilege escalation (accessing another user's data), mentor impersonation |
| **API endpoints** | Vercel Functions at `/api/*` — unauthorized data reads/writes, injection attacks (SQL, NoSQL, command), IDOR vulnerabilities |
| **Payment flows** | Stripe Checkout manipulation, price tampering, subscription bypass, unauthorized checkout session creation |
| **Video call security** | WebRTC signaling channel abuse, unauthorized session join, session ID enumeration |
| **AI endpoints** | Prompt injection that leaks system instructions or other users' data, API key extraction, abuse that causes significant cost |
| **Data exposure** | PII leakage (names, emails, session contents), mentor personal documents (diploma, LinkedIn), resume files |
| **CORS & request forgery** | CSRF, CORS misconfiguration allowing untrusted origins |
| **File uploads** | Malicious file upload to Supabase Storage (`resumes` bucket), path traversal, unauthorized file access |
| **Admin panel** | Unauthorized access to `/admin`, mentor approval/rejection without authorization |

### Out of Scope

The following are **not** in scope:

- Attacks requiring physical access to a device or local network position
- Social engineering of Bridge team members or users
- Volumetric denial-of-service attacks (report infrastructure-level DoS to Vercel and Supabase directly)
- Vulnerabilities in third-party services (Supabase, Stripe, Vercel, OpenAI, Anthropic, Calendly, Google) that are not caused or worsened by our integration
- Missing HTTP security headers that do not lead to a demonstrable exploit in this application
- Self-XSS or attacks that require the victim to be a privileged insider
- Clickjacking on pages with no sensitive actions
- Theoretical vulnerabilities without a working proof of concept

---

## Severity Classification

We use the following classification to prioritize:

| Severity | Description | Examples |
|----------|-------------|---------|
| **Critical** | Full account takeover, unauthorized payment processing, mass data exposure | Auth bypass, RLS bypass on all records, Stripe price manipulation |
| **High** | Access to another user's private data, unauthorized admin actions, payment flow disruption | IDOR on sessions/resumes, admin panel access without auth |
| **Medium** | Partial data exposure, non-financial abuse of AI endpoints, session metadata leaks | Unauthenticated read of non-sensitive mentor data, prompt injection without data leakage |
| **Low** | Minor information disclosure, missing non-critical headers, low-impact misconfigurations | Verbose error messages exposing stack traces, non-exploitable CORS edge cases |

---

## Disclosure Policy

Bridge follows a **coordinated disclosure** process:

1. You report the vulnerability privately to the owners.
2. We confirm receipt within 48 hours.
3. We assess, reproduce, and develop a fix.
4. We deploy the fix to production.
5. We notify you that the issue is resolved.
6. You may publicly disclose the vulnerability **30 days after our confirmation of the fix**,
   or earlier with our written consent.

We will credit you by name (or handle) in our changelog for any confirmed vulnerability,
unless you prefer to remain anonymous.

---

## Security Architecture Overview

For researchers assessing the attack surface:

| Control | Implementation |
|---------|---------------|
| **Authentication** | Supabase Auth (JWT). All protected API endpoints verify the JWT via a shared `api/_lib/auth.js` helper before any data access. |
| **Authorization** | Row Level Security (RLS) enforced at the Postgres layer for all user-owned tables (`sessions`, `reviews`, `favorites`, `user_profiles`, `user_settings`, `mentee_profiles`). Mentor profile writes are restricted to the row's own `user_id`. |
| **CORS** | Strict allowlist in `api/_lib/allowedOrigins.js`. Production domain only — no wildcard origins. |
| **Input validation** | `express-validator` on all Express routes. Serverless functions validate required fields and types before any DB or third-party call. |
| **Secrets** | `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `STRIPE_SECRET_KEY` are server-side only. Client env is limited to anon/publishable keys prefixed `VITE_`. |
| **Payment security** | Session prices are computed and locked server-side in `api/create-booking-checkout.js`. The client cannot pass or modify the price. |
| **Video call security** | WebRTC sessions are tied to authenticated session IDs. The Supabase Realtime channel `video:{sessionId}` requires a valid Supabase auth token. Mentor (caller) and mentee (callee) roles are enforced by the signaling logic. |
| **File storage** | Supabase Storage `resumes` bucket is private. RLS restricts access to files prefixed `{user_id}/` — only the owner can read or write their own files. |
| **Admin access** | `/admin` routes require a server-verified admin role claim. Admin actions (approve/reject mentor) are authenticated and logged. |
