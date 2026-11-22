export interface MpesaConfig {
  configured: boolean;
  shortcode: string | null;
  environment: 'sandbox' | 'production' | null;
}

export interface InitiateStkPushInput {
  tenantId: string;
  phone: string;
  amount: number;
  month: string;
}

export interface InitiateStkPushResult {
  checkoutRequestId: string;
  customerMessage: string;
}

export interface StkStatus {
  status: 'Pending' | 'Processed' | 'Failed';
  receipt: string | null;
  resultCode: number | null;
  resultDesc: string | null;
  amount: number;
  month: string;
  phone: string;
}

export class MpesaApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'MpesaApiError';
  }
}

async function request<T>(token: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new MpesaApiError(
      `The M-Pesa API returned ${contentType || 'an unknown content type'} instead of JSON (HTTP ${response.status}).`,
      response.status
    );
  }

  const result: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof result === 'object' && result !== null && 'error' in result &&
      typeof result.error === 'string'
        ? result.error
        : 'The M-Pesa request failed.';
    throw new MpesaApiError(message, response.status);
  }
  return result as T;
}

export async function loadMpesaConfig(token: string): Promise<MpesaConfig> {
  return request<MpesaConfig>(token, '/api/mpesa/config');
}

export async function initiateStkPush(
  token: string,
  input: InitiateStkPushInput
): Promise<InitiateStkPushResult> {
  return request<InitiateStkPushResult>(token, '/api/mpesa/stkpush', input);
}

export async function loadStkStatus(token: string, checkoutRequestId: string): Promise<StkStatus> {
  return request<StkStatus>(
    token,
    `/api/mpesa/status?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`
  );
}
