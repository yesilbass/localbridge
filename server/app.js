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

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
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

// ── Routes ────────────────────────────────────────────────────────────────────
// Google OAuth — must be at /auth/google so the redirect URI matches
app.use('/auth/google', googleAuthRoutes);

// Calendar — availability + booking
app.use('/calendar', calendarRoutes);

// Stripe checkout
app.use('/api/stripe', stripeRoutes);

// Developer portal API
app.use('/api/dev', devRoutes);

// Health check
app.get('/api', (_req, res) => res.json({ ok: true, service: 'Bridge API' }));

export default app;
