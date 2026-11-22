import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getAuthenticatedUserId,
  withUserDatabase,
} from '../src/server/authenticatedDb.js';
import {
  isRateLimited,
  isRequestBodyTooLarge,
  respondIfMaintenanceMode,
} from '../src/server/requestProtection.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (respondIfMaintenanceMode(res)) return;
  const neonUserId = await getAuthenticatedUserId(req, res);
  if (!neonUserId) return;

  if (req.method === 'POST' && isRequestBodyTooLarge(req, 32 * 1024)) {
    return res.status(413).json({ error: 'Request body exceeds the 32 KB limit.' });
  }

  try {
    if (await isRateLimited(neonUserId, `properties:${req.method}`, req.method === 'GET' ? 120 : 30)) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Too many requests. Try again in one minute.' });
    }
  } catch (error) {
    console.error('Properties rate limit check failed:', error);
    return res.status(503).json({ error: 'Request protection is temporarily unavailable.' });
  }

  try {
    return await withUserDatabase(neonUserId, async (client) => {
      if (req.method === 'GET') {
        const { rows } = await client.query(
          'SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC',
          [neonUserId]
        );
        return res.status(200).json(rows);
      }

      if (req.method === 'POST') {
        const { name, location, description } = req.body;
        const { rows } = await client.query(
          `INSERT INTO properties (owner_id, name, location, description)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [neonUserId, name, location, description]
        );
        return res.status(201).json(rows[0]);
      }

      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
