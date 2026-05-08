export function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
}

export function jsonError(res, status, error) {
  return res.status(status).json({ error });
}

export function parseJsonBody(req) {
  const body = req.body ?? {};
  if (typeof body !== 'string') return { data: body };

  try {
    return { data: body.trim() ? JSON.parse(body) : {} };
  } catch {
    return { error: 'Invalid JSON body' };
  }
}

export function validateJsonBody(req, schema) {
  const parsedBody = parseJsonBody(req);
  if (parsedBody.error) return { error: parsedBody.error };

  const parsed = schema.safeParse(parsedBody.data);
  if (!parsed.success) return { error: 'Invalid request body' };
  return { data: parsed.data };
}
