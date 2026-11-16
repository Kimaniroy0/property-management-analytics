import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withUserDatabase } from './authenticatedDb.js';

export function isRequestBodyTooLarge(req: VercelRequest, maxBytes: number): boolean {
  const contentLength = req.headers['content-length'];
  if (typeof contentLength === 'string' && Number(contentLength) > maxBytes) {
    return true;
  }

  const body = JSON.stringify(req.body ?? {}) ?? '';
  return Buffer.byteLength(body, 'utf8') > maxBytes;
}

export function respondIfMaintenanceMode(res: VercelResponse): boolean {
  if (process.env.MAINTENANCE_MODE !== 'true') return false;
  res.setHeader('Retry-After', '3600');
  res.status(503).json({ error: 'The service is temporarily unavailable for maintenance.' });
  return true;
}

export async function isRateLimited(
  ownerId: string,
  route: string,
  maxRequests: number
): Promise<boolean> {
  return withUserDatabase(ownerId, async (client) => {
    const result = await client.query(
      `INSERT INTO api_rate_limits (owner_id, route, window_started_at, request_count)
       VALUES ($1, $2, date_trunc('minute', CURRENT_TIMESTAMP), 1)
       ON CONFLICT (owner_id, route)
       DO UPDATE SET
         window_started_at = EXCLUDED.window_started_at,
         request_count = CASE
           WHEN api_rate_limits.window_started_at < EXCLUDED.window_started_at THEN 1
           ELSE api_rate_limits.request_count + 1
         END
       WHERE api_rate_limits.window_started_at < EXCLUDED.window_started_at
          OR api_rate_limits.request_count < $3
       RETURNING request_count`,
      [ownerId, route, maxRequests]
    );
    return result.rows.length === 0;
  });
}
