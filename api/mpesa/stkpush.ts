import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getAuthenticatedUserId,
  withUserDatabase,
} from '../../src/server/authenticatedDb.js';
import {
  isRateLimited,
  isRequestBodyTooLarge,
  respondIfMaintenanceMode,
} from '../../src/server/requestProtection.js';
import {
  DarajaConfigError,
  DarajaRequestError,
  initiateStkPush,
  normalizeKenyanPhone,
  readDarajaConfig,
} from '../../src/server/daraja.js';
import { pool } from '../../src/lib/db.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (respondIfMaintenanceMode(res)) return;
  const neonUserId = await getAuthenticatedUserId(req, res);
  if (!neonUserId) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (isRequestBodyTooLarge(req, 8 * 1024)) {
    return res.status(413).json({ error: 'Request body exceeds the 8 KB limit.' });
  }

  try {
    if (await isRateLimited(neonUserId, 'mpesa:stkpush', 10)) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Too many STK Push requests. Try again in one minute.' });
    }
  } catch (error) {
    console.error('M-Pesa rate limit check failed:', error);
    return res.status(503).json({ error: 'Request protection is temporarily unavailable.' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const tenantId = typeof body.tenantId === 'string' ? body.tenantId : '';
  const rawPhone = typeof body.phone === 'string' ? body.phone : '';
  const amount = Number(body.amount);
  const month = typeof body.month === 'string' ? body.month : '';

  if (!UUID_PATTERN.test(tenantId)) {
    return res.status(400).json({ error: 'Select a valid tenant for this payment.' });
  }
  const phone = normalizeKenyanPhone(rawPhone);
  if (!phone) {
    return res.status(400).json({
      error: 'Enter a valid Safaricom number, for example 0712345678 or 254712345678.',
    });
  }
  if (!Number.isInteger(amount) || amount < 1 || amount > 500_000) {
    return res
      .status(400)
      .json({ error: 'Amount must be a whole number of KES between 1 and 500,000.' });
  }
  if (!MONTH_PATTERN.test(month)) {
    return res.status(400).json({ error: 'Select the rent month this payment applies to.' });
  }

  let config;
  try {
    config = readDarajaConfig();
  } catch (error) {
    if (error instanceof DarajaConfigError) {
      console.error('M-Pesa STK Push blocked:', error.message);
      return res.status(503).json({ error: error.message });
    }
    throw error;
  }

  try {
    const tenant = await withUserDatabase(neonUserId, async (client) => {
      const { rows } = await client.query(
        `SELECT t.id, t.name, t.unit_id, u.unit_number
         FROM tenants t
         LEFT JOIN units u ON u.id = t.unit_id AND u.owner_id = t.owner_id
         WHERE t.owner_id = $1 AND t.id = $2`,
        [neonUserId, tenantId]
      );
      return (rows[0] as
        | { id: string; name: string; unit_id: string; unit_number: string | null }
        | undefined) ?? null;
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found on your account.' });
    }

    const accountReference = tenant.unit_number || tenant.unit_id || 'RENT';
    const stk = await initiateStkPush(config, {
      phone,
      amount,
      accountReference,
      transactionDesc: `Rent ${month}`,
    });

    try {
      await pool.query(
        `INSERT INTO mpesa_stk_requests (
           id, owner_id, checkout_request_id, merchant_request_id, tenant_id, tenant_name,
           unit_id, amount, phone, month, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending')`,
        [
          randomUUID(),
          neonUserId,
          stk.checkoutRequestId,
          stk.merchantRequestId || null,
          tenant.id,
          tenant.name,
          accountReference,
          amount,
          phone,
          month,
        ]
      );
    } catch (error) {
      console.error('Failed to record the STK Push request:', error);
      return res.status(500).json({
        error:
          'The M-Pesa prompt was sent but could not be recorded. Apply migrations/005_daraja_stk_requests.sql and try again.',
      });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      checkoutRequestId: stk.checkoutRequestId,
      customerMessage: stk.customerMessage,
    });
  } catch (error) {
    if (error instanceof DarajaRequestError) {
      console.error('Daraja STK Push failed:', error.message);
      return res.status(error.status).json({ error: error.message });
    }
    console.error('M-Pesa STK Push error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
