const origins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://bridge-eight-lemon.vercel.app',
  'https://bridge-git-main-muazsads-projects.vercel.app',
];
if (process.env.CLIENT_URL) origins.push(process.env.CLIENT_URL);
if (process.env.CLIENT_URL_PROD) origins.push(process.env.CLIENT_URL_PROD);

export const ALLOWED_ORIGINS = new Set(origins);

export function getClientUrl(origin) {
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return process.env.CLIENT_URL_PROD || process.env.CLIENT_URL || 'http://localhost:5173';
}

/**
 * Set CORS headers reflecting only the request's Origin if it's allowlisted,
 * otherwise fall back to the configured production client URL.
 */
export function applyCors(req, res, methods = 'POST, OPTIONS') {
  const origin = req.headers?.origin || '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : getClientUrl('');
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
