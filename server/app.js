/**
 * Express app — shared between local dev server and Vercel serverless function.
 * Does NOT call app.listen() — that's done by server/index.js for local dev.
 * Vercel imports this directly via api/server.js.
 *
 * MySQL-dependent legacy routes (auth, mentors, sessions) are mounted only
 * in server/index.js so they never load in the Vercel build (mysql2 is not
 * in root node_modules).
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import stripeRoutes from './routes/stripe.js';
import calendarRoutes from './routes/calendar.js';
import googleAuthRoutes from './routes/googleAuth.js';
import devRoutes from './routes/dev.js';
import cancellationsRoute from './routes/cancellations.js';
import createSubscriptionCheckout from '../api/create-subscription-checkout.js';
import createBookingCheckout from '../api/create-booking-checkout.js';
import finalizeCheckoutHandler from '../api/finalize-checkout.js';
import calendlyAuthHandler from '../api/_lib/calendlyHandlers/auth.js';
import calendlyCallbackHandler from '../api/_lib/calendlyHandlers/callback.js';
import calendlyDisconnectHandler from '../api/_lib/calendlyHandlers/disconnect.js';
import calendlyEventTypesHandler from '../api/_lib/calendlyHandlers/event-types.js';
import calendlyEventTypeSummaryHandler from '../api/_lib/calendlyHandlers/event-type-summary.js';
import calendlySelectEventTypeHandler from '../api/_lib/calendlyHandlers/select-event-type.js';
import calendlyWebhookHandler from '../api/calendly-webhook.js';
import userNamesHandler from '../api/user-names.js';
import verificationDispatcher from '../api/verification/[action].js';
import adminReviewDispatcher from '../api/admin/review/[action].js';
import cronVerificationRetryHandler from '../api/cron/verification-retry.js';

const app = express();

function wrapApiHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (origin is undefined) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Stripe — same handlers as Vercel `api/*.js` (lightweight; avoids serverless loading full Express + googleapis graph)
app.post('/api/create-subscription-checkout', wrapApiHandler(createSubscriptionCheckout));
app.post('/api/create-booking-checkout', wrapApiHandler(createBookingCheckout));
app.post('/api/finalize-checkout', wrapApiHandler(finalizeCheckoutHandler));

// Calendly — mirror Vercel rewrites (api/calendly-* → api/calendly/[action].js)
app.get('/api/calendly-auth', wrapApiHandler(calendlyAuthHandler));
app.get('/api/calendly-callback', wrapApiHandler(calendlyCallbackHandler));
app.post('/api/calendly-disconnect', wrapApiHandler(calendlyDisconnectHandler));
app.get('/api/calendly-event-types', wrapApiHandler(calendlyEventTypesHandler));
app.get('/api/calendly-event-type-summary', wrapApiHandler(calendlyEventTypeSummaryHandler));
app.post('/api/calendly-select-event-type', wrapApiHandler(calendlySelectEventTypeHandler));
app.post('/api/calendly-webhook', wrapApiHandler(calendlyWebhookHandler));

// User names (admin client bypasses RLS for mentor dashboard mentee-name lookup)
app.post('/api/user-names', wrapApiHandler(userNamesHandler));

// Mentor verification & tiering — dispatcher routes /api/verification/<action>
// to the same handler used by Vercel rewrites in production.
function dispatchVerification(req, res, next) {
  // Pull the trailing path segment as the action and forward to the handler.
  const action = req.path.replace(/^\/api\/verification\//, '').replace(/\/$/, '');
  req.query = { ...(req.query || {}), action };
  Promise.resolve(verificationDispatcher(req, res)).catch(next);
}
app.all('/api/verification/:action', dispatchVerification);

// Admin review queue — same pattern. Path is /api/admin/review-<action>
// in production (single hyphen). Express path uses `:action` for clarity.
function dispatchAdminReview(req, res, next) {
  // /api/admin/review-list -> action 'list'; /api/admin/review-decide -> 'decide'
  const m = req.path.match(/^\/api\/admin\/review-([a-z-]+)$/i);
  const action = m?.[1] || '';
  req.query = { ...(req.query || {}), action };
  Promise.resolve(adminReviewDispatcher(req, res)).catch(next);
}
app.all(/^\/api\/admin\/review-[a-z-]+$/i, dispatchAdminReview);

// Cron — same handler for local + Vercel.
app.all('/api/cron/verification-retry', wrapApiHandler(cronVerificationRetryHandler));

// ── Routes ────────────────────────────────────────────────────────────────────
// Google OAuth — must be at /auth/google so the redirect URI matches
app.use('/auth/google', googleAuthRoutes);

// Calendar — availability + booking
app.use('/calendar', calendarRoutes);

// Stripe checkout
app.use('/api/stripe', stripeRoutes);

// Developer portal API
app.use('/api/dev', devRoutes);

// Cancellation requests
app.use('/api/cancellations', cancellationsRoute);

// Health check
app.get('/api', (_req, res) => res.json({ ok: true, service: 'Bridge API' }));

export default app;
