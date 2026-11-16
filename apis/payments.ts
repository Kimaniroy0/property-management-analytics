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
    if (await isRateLimited(neonUserId, `payments:${req.method}`, req.method === 'GET' ? 120 : 30)) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Too many requests. Try again in one minute.' });
    }
  } catch (error) {
    console.error('Payments rate limit check failed:', error);
    return res.status(503).json({ error: 'Request protection is temporarily unavailable.' });
  }

  try {
    return await withUserDatabase(neonUserId, async (client) => {
      if (req.method === 'GET') {
        const { month } = req.query;
        const result = month
          ? await client.query(
              `SELECT * FROM payments
               WHERE owner_id = $1 AND month = $2
               ORDER BY payment_date DESC`,
              [neonUserId, month]
            )
          : await client.query(
              'SELECT * FROM payments WHERE owner_id = $1 ORDER BY payment_date DESC',
              [neonUserId]
            );
        return res.status(200).json(result.rows);
      }

      if (req.method === 'POST') {
        const {
          tenantId,
          unitId,
          amount,
          paymentDate,
          status,
          transactionReference,
          paymentMethod,
          month,
          notes,
        } = req.body;

        const duplicate = await client.query(
          `SELECT id FROM payments
           WHERE owner_id = $1 AND transaction_reference = $2`,
          [neonUserId, transactionReference]
        );
        if (duplicate.rows.length > 0) {
          return res.status(400).json({ error: 'Duplicate transaction reference detected' });
        }

        const { rows } = await client.query(
          `INSERT INTO payments (
             owner_id, tenant_id, unit_id, amount, payment_date, status,
             transaction_reference, payment_method, month, notes
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            neonUserId,
            tenantId,
            unitId,
            amount,
            paymentDate,
            status || 'Paid',
            transactionReference,
            paymentMethod || 'M-Pesa',
            month,
            notes,
          ]
        );
        return res.status(201).json(rows[0]);
      }

      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    });
  } catch (error) {
    console.error('Payment API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
