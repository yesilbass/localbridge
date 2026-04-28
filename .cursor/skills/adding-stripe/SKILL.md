---
name: adding-stripe
description: >-
  Bridge Stripe integration: Express checkout endpoints, Vite/React embedded
  Checkout, env vars, and Supabase sync. Use when adding or fixing payments,
  subscriptions, mentor session checkout, or Stripe configuration in this repo.
---

# Stripe on Bridge (this repo)

## Ports and URLs (do not use :3000 for the API)

| What | URL / port |
|------|------------|
| Vite dev (React) | `http://localhost:5174` (preferred port in `client/vite.config.js`; next free port if 5174 is taken) |
| Express API | `http://localhost:3001` (`PORT` in `server/.env`) |
| Client → Stripe API in dev | Relative `fetch('/api/stripe/...')` — Vite **proxies** `/api` to `localhost:3001` (`client/vite.config.js`) |

**`CLIENT_URL` in `server/.env` must exactly match the tab you use** (e.g. `http://localhost:5174`). Stripe `return_url` is built from it; if it still says `5173` while you open `5174`, checkout redirects to the wrong origin and looks “broken.”

## Environment variables

**`server/.env`** (never commit real values):

- `STRIPE_SECRET_KEY` — `sk_test_...` or live secret
- `CLIENT_URL` — e.g. `http://localhost:5174` (same as Vite URL in the address bar)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — for `finalize-checkout` / DB sync (`server/lib/supabaseAdmin.js`)

**`client/.env`**:

- `VITE_STRIPE_PUBLISHABLE_KEY` — `pk_test_...` (required for embedded Checkout UI)
- `VITE_SERVER_URL` — optional; leave empty in dev to use the Vite proxy. Set only if you must call the API by full URL.

Restart **both** server and Vite after changing `.env`.

## Code map

| Piece | Path |
|-------|------|
| Checkout creation + finalize | `server/routes/stripe.js` |
| Client calls | `client/src/api/stripe.js` (uses `/api/stripe/...`) |
| Embedded UI | `client/src/components/EmbeddedCheckoutPanel.jsx` |
| Pricing flow | `client/src/pages/Pricing.jsx` |
| Mentor booking flow | `client/src/pages/MentorProfile.jsx` |

## Checkout session rules (this codebase)

- Use **`ui_mode: 'embedded_page'`** (not `embedded`) when creating Checkout sessions — matches current Stripe API.
- Subscription metadata includes `type: 'subscription'`, `userId`, `planName`.
- Booking metadata includes `type: 'mentor_booking'` and session fields aligned with `sessions` table constraints.

## Local dev checklist

1. `cd server && node index.js` — must show listening on **3001**.
2. `cd client && npm run dev` — open **5174** (or whatever port Vite prints).
3. Stripe keys: **publishable** on client, **secret** on server only; both from the same Stripe mode (test/live).

## Webhooks (if you add them later)

- Implement a **raw body** `POST` route on Express (signature verification needs the unparsed body).
- Stripe CLI example (API on 3001):  
  `stripe listen --forward-to localhost:3001/api/webhooks/stripe`  
  (adjust path to whatever route you add — **not** `localhost:3000`.)

## Security

- Never put `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `VITE_*` or client code.
- Verify webhook signatures; do not trust unverified payloads.
