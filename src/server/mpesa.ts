import { randomUUID } from 'node:crypto';
import { pool } from '../lib/db.js';
import { withUserDatabase } from './authenticatedDb.js';

export interface StkRequestRow {
  id: string;
  owner_id: string;
  checkout_request_id: string;
  merchant_request_id: string | null;
  tenant_id: string;
  tenant_name: string;
  unit_id: string;
  amount: string | number;
  phone: string;
  month: string;
  status: 'Pending' | 'Processed' | 'Failed';
  result_code: number | null;
  result_desc: string | null;
  mpesa_receipt: string | null;
  created_at_ms: string | number;
}

export interface StkCallbackResult {
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  receipt: string | null;
  amount: number | null;
  phone: string | null;
  transactionDate: string | null;
}

export interface StkCompletion {
  status: 'Processed' | 'Failed' | 'Ignored' | 'Pending';
  receipt: string | null;
  resultDesc: string;
  duplicate?: boolean;
}

function nairobiDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function nairobiTimestamp(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .format(date)
    .replace(',', '');
}

function paymentDateFrom(transactionDate: string | null): string {
  if (transactionDate && /^\d{14}$/.test(transactionDate)) {
    return `${transactionDate.slice(0, 4)}-${transactionDate.slice(4, 6)}-${transactionDate.slice(6, 8)}`;
  }
  return nairobiDateString();
}

function safeReference(value: string): string {
  return value.length > 48 ? value.slice(value.length - 48) : value;
}

export async function loadStkRequest(
  ownerId: string,
  checkoutRequestId: string
): Promise<StkRequestRow | null> {
  const { rows } = await pool.query(
    `SELECT id, owner_id, checkout_request_id, merchant_request_id, tenant_id, tenant_name,
            unit_id, amount, phone, month, status, result_code, result_desc, mpesa_receipt,
            EXTRACT(EPOCH FROM created_at) * 1000 AS created_at_ms
     FROM mpesa_stk_requests
     WHERE owner_id = $1 AND checkout_request_id = $2`,
    [ownerId, checkoutRequestId]
  );
  return (rows[0] as StkRequestRow | undefined) ?? null;
}

/**
 * Applies a Safaricom callback (or a reconciled STK query result) to the ledger.
 * Idempotent: a request that already reached a terminal state is returned unchanged,
 * and a receipt that already exists in the payments table is logged as a duplicate.
 */
export async function completeStkRequest(result: StkCallbackResult): Promise<StkCompletion> {
  const { rows } = await pool.query(
    `SELECT id, owner_id, tenant_id, tenant_name, unit_id, amount, phone, month, status,
            result_code, result_desc, mpesa_receipt
     FROM mpesa_stk_requests
     WHERE checkout_request_id = $1`,
    [result.checkoutRequestId]
  );
  const request = rows[0] as
    | {
        owner_id: string;
        tenant_id: string;
        tenant_name: string;
        unit_id: string;
        amount: string | number;
        phone: string;
        month: string;
        status: 'Pending' | 'Processed' | 'Failed';
        result_code: number | null;
        result_desc: string | null;
        mpesa_receipt: string | null;
      }
    | undefined;

  if (!request) {
    console.warn(
      `Ignoring an STK callback for unknown CheckoutRequestID ${result.checkoutRequestId}.`
    );
    return {
      status: 'Ignored',
      receipt: null,
      resultDesc: 'No matching STK Push request was found.',
    };
  }

  if (request.status !== 'Pending') {
    return {
      status: request.status,
      receipt: request.mpesa_receipt,
      resultDesc: request.result_desc ?? result.resultDesc,
    };
  }

  const ownerId = request.owner_id;
  const amount = result.amount ?? Number(request.amount);
  const phone = result.phone ?? request.phone;

  if (result.resultCode === 0 && !result.receipt) {
    // An STK *query* can confirm success but never returns the M-Pesa receipt, which only
    // arrives in the callback. Keep the request pending instead of recording an unreceipted payment.
    return {
      status: 'Pending',
      receipt: null,
      resultDesc:
        'Safaricom confirmed the payment; waiting for the callback to provide the receipt.',
    };
  }

  if (result.resultCode !== 0) {
    await withUserDatabase(ownerId, async (client) => {
      await client.query(
        `INSERT INTO mpesa_callback_logs (
           id, owner_id, timestamp, transaction_reference, phone, amount,
           tenant_name, unit_id, result_code, result_desc, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Failed')`,
        [
          randomUUID(),
          ownerId,
          nairobiTimestamp(),
          safeReference(`STK-${result.checkoutRequestId}`),
          phone,
          amount,
          request.tenant_name,
          request.unit_id,
          result.resultCode,
          result.resultDesc.slice(0, 500),
        ]
      );
      await client.query(
        `UPDATE mpesa_stk_requests
         SET status = 'Failed', result_code = $2, result_desc = $3, updated_at = CURRENT_TIMESTAMP
         WHERE checkout_request_id = $1 AND status = 'Pending'`,
        [result.checkoutRequestId, result.resultCode, result.resultDesc.slice(0, 500)]
      );
    });

    return { status: 'Failed', receipt: null, resultDesc: result.resultDesc };
  }

  const receipt = result.receipt;
  return withUserDatabase(ownerId, async (client) => {
    const duplicate = await client.query(
      'SELECT 1 FROM payments WHERE owner_id = $1 AND transaction_reference = $2',
      [ownerId, receipt]
    );

    if (duplicate.rows.length > 0) {
      await client.query(
        `INSERT INTO mpesa_callback_logs (
           id, owner_id, timestamp, transaction_reference, phone, amount,
           tenant_name, unit_id, result_code, result_desc, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Duplicate Rejected')`,
        [
          randomUUID(),
          ownerId,
          nairobiTimestamp(),
          receipt,
          phone,
          amount,
          request.tenant_name,
          request.unit_id,
          1032,
          'Transaction Reference already processed. Callback ignored.',
        ]
      );
      await client.query(
        `UPDATE mpesa_stk_requests
         SET status = 'Failed', result_code = 1032,
             result_desc = 'Transaction Reference already processed. Callback ignored.',
             updated_at = CURRENT_TIMESTAMP
         WHERE checkout_request_id = $1 AND status = 'Pending'`,
        [result.checkoutRequestId]
      );

      return {
        status: 'Failed' as const,
        receipt: null,
        resultDesc: 'This M-Pesa receipt has already been recorded.',
        duplicate: true,
      };
    }

    await client.query(
      `INSERT INTO payments (
         id, owner_id, tenant_id, unit_id, amount, payment_date, status,
         transaction_reference, payment_method, month, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, 'Paid', $7, 'M-Pesa', $8, $9)`,
      [
        randomUUID(),
        ownerId,
        request.tenant_id,
        request.unit_id,
        amount,
        paymentDateFrom(result.transactionDate),
        receipt,
        request.month,
        `Daraja STK Push ${result.checkoutRequestId}`,
      ]
    );

    await client.query(
      `INSERT INTO mpesa_callback_logs (
         id, owner_id, timestamp, transaction_reference, phone, amount,
         tenant_name, unit_id, result_code, result_desc, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, 'Processed')`,
      [
        randomUUID(),
        ownerId,
        nairobiTimestamp(),
        receipt,
        phone,
        amount,
        request.tenant_name,
        request.unit_id,
        'The service request is processed successfully.',
      ]
    );

    await client.query(
      `UPDATE mpesa_stk_requests
       SET status = 'Processed', result_code = 0, result_desc = $2,
           mpesa_receipt = $3, updated_at = CURRENT_TIMESTAMP
       WHERE checkout_request_id = $1 AND status = 'Pending'`,
      [result.checkoutRequestId, result.resultDesc.slice(0, 500), receipt]
    );

    return {
      status: 'Processed' as const,
      receipt,
      resultDesc: 'The service request is processed successfully.',
    };
  });
}
