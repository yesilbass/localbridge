/**
 * Catch-all for unknown /api/* paths.
 * vercel.json's wildcard rewrite "/api/(.*)" routes anything not matched
 * by an explicit rewrite here so it fails fast with JSON 404.
 * Do not import the local Express app — /server is local-only.
 */
export default function handler(req, res) {
  res.status(404).json({ error: 'API route not found' });
}
