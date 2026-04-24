// In production (Vercel), VITE_SERVER_URL is not needed — Stripe API calls go to
// /api/stripe/* which are handled by Vercel serverless functions on the same origin.
// In local dev, Vite proxies /api/* to the Express server on port 3001.
export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';

export const API_URL = `${SERVER_URL}/api`;
