/**
 * Vercel serverless entry point.
 * Vercel routes /api/*, /auth/*, /calendar/* here via vercel.json rewrites.
 * The Express app handles path matching internally.
 */
import app from '../server/app.js';

export default app;
