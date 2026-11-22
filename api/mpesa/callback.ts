import type { VercelRequest, VercelResponse } from '@vercel/node';
import { completeStkRequest } from '../../src/server/mpesa.js';

interface StkCallbackMetadataItem {
  Name?: unknown;
  Value?: unknown;
}

function readMetadataValue(
  items: StkCallbackMetadataItem[],
  name: string
): string | number | null {
  const item = items.find((entry) => entry.Name === name);
  if (!item) return null;
  if (typeof item.Value === 'string' || typeof item.Value === 'number') return item.Value;
  return null;
}

/**
 * Safaricom calls this endpoint directly and cannot authenticate with a Neon Auth JWT.
 * The payload is trusted only because its CheckoutRequestID must match a pending STK Push
 * that this server created, which is also how ownership is resolved.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const accepted = () => res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ResultCode: 1, ResultDesc: 'Method Not Allowed' });
  }

  const body = (req.body ?? {}) as {
    Body?: { stkCallback?: Record<string, unknown> };
  };
  const stkCallback = body.Body?.stkCallback;
  if (!stkCallback || typeof stkCallback.CheckoutRequestID !== 'string') {
    console.warn('Ignoring an M-Pesa callback without a CheckoutRequestID.');
    return accepted();
  }

  const checkoutRequestId = stkCallback.CheckoutRequestID;
  const resultCode = Number(stkCallback.ResultCode);
  if (!Number.isFinite(resultCode)) {
    console.warn(`Ignoring an M-Pesa callback with an invalid ResultCode for ${checkoutRequestId}.`);
    return accepted();
  }

  const metadataContainer = stkCallback.CallbackMetadata as { Item?: unknown } | undefined;
  const items = Array.isArray(metadataContainer?.Item)
    ? (metadataContainer.Item as StkCallbackMetadataItem[])
    : [];
  const receipt = readMetadataValue(items, 'MpesaReceiptNumber');
  const amount = readMetadataValue(items, 'Amount');
  const phone = readMetadataValue(items, 'PhoneNumber');
  const transactionDate = readMetadataValue(items, 'TransactionDate');

  try {
    const completion = await completeStkRequest({
      checkoutRequestId,
      resultCode,
      resultDesc:
        typeof stkCallback.ResultDesc === 'string'
          ? stkCallback.ResultDesc
          : 'No description was provided by Safaricom.',
      receipt: typeof receipt === 'string' && receipt ? receipt : null,
      amount: amount === null ? null : Number(amount),
      phone: phone === null ? null : String(phone),
      transactionDate: transactionDate === null ? null : String(transactionDate),
    });
    console.log(
      `M-Pesa callback for ${checkoutRequestId}: ${completion.status}${
        completion.duplicate ? ' (duplicate receipt)' : ''
      }.`
    );
  } catch (error) {
    // Still acknowledge so Safaricom does not retry indefinitely; the status endpoint can reconcile.
    console.error(`M-Pesa callback processing failed for ${checkoutRequestId}:`, error);
  }

  return accepted();
}
