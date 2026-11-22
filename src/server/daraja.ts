export type DarajaEnvironment = 'sandbox' | 'production';

const DARAJA_BASE_URLS: Record<DarajaEnvironment, string> = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

const REQUIRED_SETTINGS = [
  'DARAJA_CONSUMER_KEY',
  'DARAJA_CONSUMER_SECRET',
  'DARAJA_PASSKEY',
  'DARAJA_SHORTCODE',
  'DARAJA_CALLBACK_URL',
] as const;

export interface DarajaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  environment: DarajaEnvironment;
  callbackUrl: string;
}

export class DarajaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DarajaConfigError';
  }
}

export class DarajaRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'DarajaRequestError';
  }
}

function readSetting(name: string): string {
  return process.env[name]?.trim() ?? '';
}

export function readDarajaConfig(): DarajaConfig {
  const values: Record<(typeof REQUIRED_SETTINGS)[number], string> = {
    DARAJA_CONSUMER_KEY: readSetting('DARAJA_CONSUMER_KEY'),
    DARAJA_CONSUMER_SECRET: readSetting('DARAJA_CONSUMER_SECRET'),
    DARAJA_PASSKEY: readSetting('DARAJA_PASSKEY'),
    DARAJA_SHORTCODE: readSetting('DARAJA_SHORTCODE'),
    DARAJA_CALLBACK_URL: readSetting('DARAJA_CALLBACK_URL'),
  };

  const missing = REQUIRED_SETTINGS.filter((name) => !values[name]);
  if (missing.length > 0) {
    throw new DarajaConfigError(
      `M-Pesa is not configured. Set ${missing.join(', ')} in the server environment.`
    );
  }

  let callbackUrl: URL;
  try {
    callbackUrl = new URL(values.DARAJA_CALLBACK_URL);
  } catch {
    throw new DarajaConfigError('DARAJA_CALLBACK_URL must be an absolute, publicly reachable HTTPS URL.');
  }
  if (callbackUrl.protocol !== 'https:') {
    throw new DarajaConfigError('DARAJA_CALLBACK_URL must use HTTPS; Safaricom cannot call a plain HTTP endpoint.');
  }

  const environment: DarajaEnvironment =
    readSetting('DARAJA_ENV').toLowerCase() === 'production' ? 'production' : 'sandbox';

  return {
    consumerKey: values.DARAJA_CONSUMER_KEY,
    consumerSecret: values.DARAJA_CONSUMER_SECRET,
    passkey: values.DARAJA_PASSKEY,
    shortcode: values.DARAJA_SHORTCODE,
    environment,
    callbackUrl: values.DARAJA_CALLBACK_URL,
  };
}

export function isDarajaConfigured(): boolean {
  try {
    readDarajaConfig();
    return true;
  } catch {
    return false;
  }
}

function getDarajaBaseUrl(config: DarajaConfig): string {
  return DARAJA_BASE_URLS[config.environment];
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function darajaErrorMessage(payload: Record<string, unknown>, fallback: string): string {
  const message = payload.errorMessage ?? payload.ResponseDescription;
  if (typeof message === 'string' && message.trim()) {
    return `Safaricom rejected the request: ${message.trim()}`;
  }
  return fallback;
}

let tokenCache: { key: string; token: string; expiresAt: number } | null = null;

export async function getDarajaAccessToken(config: DarajaConfig): Promise<string> {
  const cacheKey = `${config.environment}:${config.shortcode}`;
  if (tokenCache && tokenCache.key === cacheKey && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const response = await fetch(
    `${getDarajaBaseUrl(config)}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(20_000),
    }
  );
  const payload = await readJson(response);

  if (!response.ok || typeof payload.access_token !== 'string' || !payload.access_token) {
    throw new DarajaRequestError(
      response.status === 401 || response.status === 400
        ? 'Safaricom rejected the Daraja credentials. Check DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET.'
        : darajaErrorMessage(payload, 'Safaricom did not issue a Daraja access token.'),
      502
    );
  }

  const expiresIn = Number(payload.expires_in);
  const lifetimeSeconds = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3599;
  tokenCache = {
    key: cacheKey,
    token: payload.access_token,
    expiresAt: Date.now() + Math.max(60, lifetimeSeconds - 60) * 1000,
  };
  return payload.access_token;
}

export function getDarajaTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';
  return `${value('year')}${value('month')}${value('day')}${value('hour')}${value('minute')}${value('second')}`;
}

export function getDarajaPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

/** Normalizes Kenyan mobile numbers to the 2547XXXXXXXX / 2541XXXXXXXX form Daraja expects. */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  return /^254(7|1)\d{8}$/.test(normalized) ? normalized : null;
}

export interface StkPushInput {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseDescription: string;
  customerMessage: string;
}

export async function initiateStkPush(
  config: DarajaConfig,
  input: StkPushInput
): Promise<StkPushResponse> {
  const accessToken = await getDarajaAccessToken(config);
  const timestamp = getDarajaTimestamp();

  const body = {
    BusinessShortCode: config.shortcode,
    Password: getDarajaPassword(config.shortcode, config.passkey, timestamp),
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(input.amount),
    PartyA: input.phone,
    PartyB: config.shortcode,
    PhoneNumber: input.phone,
    CallBackURL: config.callbackUrl,
    AccountReference: input.accountReference.slice(0, 12),
    TransactionDesc: input.transactionDesc.slice(0, 13),
  };

  const response = await fetch(`${getDarajaBaseUrl(config)}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new DarajaRequestError(
      darajaErrorMessage(payload, 'Safaricom rejected the STK Push request.'),
      502
    );
  }
  if (typeof payload.CheckoutRequestID !== 'string' || !payload.CheckoutRequestID) {
    throw new DarajaRequestError(
      darajaErrorMessage(payload, 'Safaricom did not return a CheckoutRequestID for the STK Push.'),
      502
    );
  }

  return {
    merchantRequestId: typeof payload.MerchantRequestID === 'string' ? payload.MerchantRequestID : '',
    checkoutRequestId: payload.CheckoutRequestID,
    responseDescription:
      typeof payload.ResponseDescription === 'string' ? payload.ResponseDescription : 'Success',
    customerMessage:
      typeof payload.CustomerMessage === 'string'
        ? payload.CustomerMessage
        : 'Enter your M-Pesa PIN on your phone to complete the payment.',
  };
}

export interface StkQueryResult {
  completed: boolean;
  resultCode: number | null;
  resultDesc: string;
}

export async function queryStkPush(
  config: DarajaConfig,
  checkoutRequestId: string
): Promise<StkQueryResult> {
  const accessToken = await getDarajaAccessToken(config);
  const timestamp = getDarajaTimestamp();

  const response = await fetch(`${getDarajaBaseUrl(config)}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: getDarajaPassword(config.shortcode, config.passkey, timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await readJson(response);

  const responseCode = String(payload.ResponseCode ?? '');
  if (responseCode !== '0' || payload.ResultCode === undefined || payload.ResultCode === null) {
    // "The transaction is still under processing" is a normal state, not a failure.
    return {
      completed: false,
      resultCode: null,
      resultDesc:
        typeof payload.ResponseDescription === 'string'
          ? payload.ResponseDescription
          : 'The STK Push is still pending at Safaricom.',
    };
  }

  return {
    completed: true,
    resultCode: Number(payload.ResultCode),
    resultDesc:
      typeof payload.ResultDesc === 'string'
        ? payload.ResultDesc
        : String(payload.ResponseDescription ?? ''),
  };
}
