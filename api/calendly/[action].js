import authHandler from '../_lib/calendlyHandlers/auth.js';
import callbackHandler from '../_lib/calendlyHandlers/callback.js';
import disconnectHandler from '../_lib/calendlyHandlers/disconnect.js';
import eventTypeSummaryHandler from '../_lib/calendlyHandlers/event-type-summary.js';
import eventTypesHandler from '../_lib/calendlyHandlers/event-types.js';
import selectEventTypeHandler from '../_lib/calendlyHandlers/select-event-type.js';
import { jsonError } from '../_lib/security.js';

const ROUTES = {
  auth: authHandler,
  callback: callbackHandler,
  disconnect: disconnectHandler,
  'event-type-summary': eventTypeSummaryHandler,
  'event-types': eventTypesHandler,
  'select-event-type': selectEventTypeHandler,
};

export default async function handler(req, res) {
  const action = String(req.query?.action ?? '').toLowerCase();
  const route = ROUTES[action];
  if (!route) return jsonError(res, 404, 'Unknown Calendly action');
  return route(req, res);
}
