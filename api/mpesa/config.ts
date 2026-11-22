import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUserId } from '../../src/server/authenticatedDb.js';
import { respondIfMaintenanceMode } from '../../src/server/requestProtection.js';
import { isDarajaConfigured, readDarajaConfig } from '../../src/server/daraja.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (respondIfMaintenanceMode(res)) return;
  const neonUserId = await getAuthenticatedUserId(req, res);
  if (!neonUserId) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const config = readDarajaConfig();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      configured: true,
      shortcode: config.shortcode,
      environment: config.environment,
    });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      configured: isDarajaConfigured(),
      shortcode: null,
      environment: null,
    });
  }
}
