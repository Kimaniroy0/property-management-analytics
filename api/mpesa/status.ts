import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUserId } from '../../src/server/authenticatedDb.js';
import { respondIfMaintenanceMode } from '../../src/server/requestProtection.js';
import {
  DarajaConfigError,
  DarajaRequestError,
  queryStkPush,
  readDarajaConfig,
} from '../../src/server/daraja.js';
import { completeStkRequest, loadStkRequest } from '../../src/server/mpesa.js';

const CHECKOUT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const QUERY_AFTER_MS = 20_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (respondIfMaintenanceMode(res)) return;
  const neonUserId = await getAuthenticatedUserId(req, res);
  if (!neonUserId) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const rawId = req.query.checkoutRequestId;
  const checkoutRequestId = typeof rawId === 'string' ? rawId : '';
  if (!CHECKOUT_ID_PATTERN.test(checkoutRequestId)) {
    return res.status(400).json({ error: 'A valid checkoutRequestId is required.' });
  }

  try {
    let request = await loadStkRequest(neonUserId, checkoutRequestId);
    if (!request) {
      return res.status(404).json({ error: 'STK Push request not found.' });
    }

    const ageMs = Date.now() - Number(request.created_at_ms);
    if (request.status === 'Pending' && ageMs > QUERY_AFTER_MS) {
      try {
        const config = readDarajaConfig();
        const query = await queryStkPush(config, checkoutRequestId);
        if (query.completed && query.resultCode !== null) {
          await completeStkRequest({
            checkoutRequestId,
            resultCode: query.resultCode,
            resultDesc: query.resultDesc,
            receipt: null,
            amount: null,
            phone: null,
            transactionDate: null,
          });
          request = (await loadStkRequest(neonUserId, checkoutRequestId)) ?? request;
        }
      } catch (error) {
        if (error instanceof DarajaConfigError || error instanceof DarajaRequestError) {
          console.warn('STK Push status reconciliation skipped:', error.message);
        } else {
          console.error('STK Push status reconciliation failed:', error);
        }
      }
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      status: request.status,
      receipt: request.mpesa_receipt,
      resultCode: request.result_code,
      resultDesc: request.result_desc,
      amount: Number(request.amount),
      month: request.month,
      phone: request.phone,
    });
  } catch (error) {
    console.error('M-Pesa status check failed:', error);
    return res.status(500).json({ error: 'Unable to check the M-Pesa payment status.' });
  }
}
