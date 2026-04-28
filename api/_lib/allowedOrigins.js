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
