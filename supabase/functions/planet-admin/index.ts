import { supabaseAdminClient } from '../_shared/supabaseAdmin.ts';
import { adminDeleteAllSwipes } from '../_shared-client/planet-swipe-db.ts';
import { okResponse, parseURL, serveFunction, statusResponse } from '../_shared/server/func-server.ts';

const PLANET_ADMIN_FUNCTION_PATH = 'planet-admin';

serveFunction(false, async (req: Request): Promise<Response> => {
  const [func, action] = parseURL(req.url);

  if (func !== PLANET_ADMIN_FUNCTION_PATH) {
    return statusResponse(400, `Invalid function: ${func}`);
  }

  if (action === 'reset-swipes') {
    if (req.method !== 'POST') {
      return statusResponse(405, 'Method Not Allowed');
    }
    const deletedCount = await adminDeleteAllSwipes(supabaseAdminClient);
    return okResponse({ success: true, deletedCount });
  }

  return statusResponse(404, `Unknown action: ${action}`);
});
