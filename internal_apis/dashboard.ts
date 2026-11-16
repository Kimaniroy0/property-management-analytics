import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { PoolClient } from '@neondatabase/serverless';
import type {
  GeneralExpense,
  MaintenanceExpense,
  MpesaCallbackLog,
  Payment,
  Property,
  Tenant,
  Unit,
} from '../src/types/index.js';
import {
  getAuthenticatedUserId,
  withUserDatabase,
} from '../src/server/authenticatedDb.js';
import {
  isRateLimited,
  isRequestBodyTooLarge,
  respondIfMaintenanceMode,
} from '../src/server/requestProtection.js';

const MAX_DASHBOARD_BODY_BYTES = 1024 * 1024;

interface DashboardData {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  payments: Payment[];
  maintenanceExpenses: MaintenanceExpense[];
  generalExpenses: GeneralExpense[];
  mpesaLogs: MpesaCallbackLog[];
  selectedMonth: string;
}

interface DashboardProfile {
  email?: unknown;
  name?: unknown;
  image?: unknown;
}

function isDashboardData(value: unknown): value is DashboardData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    [
      'properties',
      'units',
      'tenants',
      'payments',
      'maintenanceExpenses',
      'generalExpenses',
      'mpesaLogs',
    ].every((field) => Array.isArray(data[field])) &&
    typeof data.selectedMonth === 'string' &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(data.selectedMonth)
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Dashboard data contains an invalid record.');
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Dashboard record is missing a valid ${field}.`);
  }
  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function nullableString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return null;
  return value.slice(0, maxLength);
}

function asUuid(value: unknown, field: string): string {
  const id = stringValue(value, field);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`Dashboard record has an invalid ${field}.`);
  }
  return id;
}

function legacyUuid(kind: string, value: unknown, ids: Map<string, string>): string {
  const id = stringValue(value, `${kind} ID`);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    ids.set(id, id);
    return id;
  }
  const existing = ids.get(id);
  if (existing) return existing;

  const hex = createHash('sha256').update(`${kind}:${id}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const uuid = `${hex.join('').slice(0, 8)}-${hex.join('').slice(8, 12)}-${hex.join('').slice(12, 16)}-${hex.join('').slice(16, 20)}-${hex.join('').slice(20)}`;
  ids.set(id, uuid);
  return uuid;
}

function migrateLegacyData(data: DashboardData): DashboardData {
  const propertyIds = new Map<string, string>();
  const tenantIds = new Map<string, string>();

  const properties = data.properties.map((item) => {
    const property = asRecord(item);
    return {
      ...property,
      id: legacyUuid('property', property.id, propertyIds),
    } as unknown as Property;
  });
  const units = data.units.map((item) => {
    const unit = asRecord(item);
    const propertyId = propertyIds.get(stringValue(unit.propertyId, 'property ID'));
    if (!propertyId) throw new Error('Legacy dashboard unit refers to a missing property.');
    return { ...unit, propertyId } as unknown as Unit;
  });
  const tenants = data.tenants.map((item) => {
    const tenant = asRecord(item);
    return {
      ...tenant,
      id: legacyUuid('tenant', tenant.id, tenantIds),
    } as unknown as Tenant;
  });

  return {
    ...data,
    properties,
    units,
    tenants,
    payments: data.payments.map((item) => {
      const payment = asRecord(item);
      const tenantId = tenantIds.get(stringValue(payment.tenantId, 'tenant ID'));
      if (!tenantId) throw new Error('Legacy dashboard payment refers to a missing tenant.');
      return {
        ...payment,
        id: legacyUuid('payment', payment.id, new Map()),
        tenantId,
      } as unknown as Payment;
    }),
    maintenanceExpenses: data.maintenanceExpenses.map((item) => {
      const expense = asRecord(item);
      return {
        ...expense,
        id: legacyUuid('maintenance expense', expense.id, new Map()),
      } as unknown as MaintenanceExpense;
    }),
    generalExpenses: data.generalExpenses.map((item) => {
      const expense = asRecord(item);
      return {
        ...expense,
        id: legacyUuid('general expense', expense.id, new Map()),
      } as unknown as GeneralExpense;
    }),
    mpesaLogs: data.mpesaLogs.map((item) => {
      const log = asRecord(item);
      return {
        ...log,
        id: legacyUuid('M-Pesa log', log.id, new Map()),
      } as unknown as MpesaCallbackLog;
    }),
  };
}

async function replaceDashboardRows(
  client: PoolClient,
  ownerId: string,
  data: DashboardData
): Promise<void> {
  await client.query('DELETE FROM payments WHERE owner_id = $1', [ownerId]);
  await client.query('DELETE FROM maintenance_expenses WHERE owner_id = $1', [ownerId]);
  await client.query('DELETE FROM general_expenses WHERE owner_id = $1', [ownerId]);
  await client.query('DELETE FROM mpesa_callback_logs WHERE owner_id = $1', [ownerId]);
  await client.query('DELETE FROM tenants WHERE owner_id = $1', [ownerId]);
  await client.query('DELETE FROM units WHERE owner_id = $1', [ownerId]);
  await client.query('DELETE FROM properties WHERE owner_id = $1', [ownerId]);

  for (const value of data.properties) {
    const property = asRecord(value);
    await client.query(
      `INSERT INTO properties (id, owner_id, name, location, description, created_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, CURRENT_TIMESTAMP))`,
      [
        asUuid(property.id, 'property ID'),
        ownerId,
        stringValue(property.name, 'property name'),
        optionalString(property.location),
        optionalString(property.description),
        optionalString(property.createdAt),
      ]
    );
  }

  for (const value of data.units) {
    const unit = asRecord(value);
    await client.query(
      `INSERT INTO units (
         owner_id, id, property_id, unit_number, rent_amount, occupancy_status, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        ownerId,
        stringValue(unit.id, 'unit ID'),
        asUuid(unit.propertyId, 'unit property ID'),
        stringValue(unit.unitNumber, 'unit number'),
        unit.rentAmount,
        stringValue(unit.occupancyStatus, 'unit occupancy status'),
        optionalString(unit.notes),
      ]
    );
  }

  for (const value of data.tenants) {
    const tenant = asRecord(value);
    await client.query(
      `INSERT INTO tenants (id, owner_id, name, phone, email, unit_id, start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        asUuid(tenant.id, 'tenant ID'),
        ownerId,
        stringValue(tenant.name, 'tenant name'),
        optionalString(tenant.phone),
        optionalString(tenant.email),
        stringValue(tenant.unitId, 'tenant unit ID'),
        optionalString(tenant.startDate),
      ]
    );
  }

  for (const value of data.payments) {
    const payment = asRecord(value);
    await client.query(
      `INSERT INTO payments (
         id, owner_id, tenant_id, unit_id, amount, payment_date, status,
         transaction_reference, payment_method, month, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        asUuid(payment.id, 'payment ID'),
        ownerId,
        asUuid(payment.tenantId, 'payment tenant ID'),
        stringValue(payment.unitId, 'payment unit ID'),
        payment.amount,
        stringValue(payment.paymentDate, 'payment date'),
        stringValue(payment.status, 'payment status'),
        stringValue(payment.transactionReference, 'transaction reference'),
        stringValue(payment.paymentMethod, 'payment method'),
        stringValue(payment.month, 'payment month'),
        optionalString(payment.notes),
      ]
    );
  }

  for (const value of data.maintenanceExpenses) {
    const expense = asRecord(value);
    await client.query(
      `INSERT INTO maintenance_expenses (
         id, owner_id, unit_id, description, cost, date, month
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        asUuid(expense.id, 'maintenance expense ID'),
        ownerId,
        stringValue(expense.unitId, 'maintenance unit ID'),
        stringValue(expense.description, 'maintenance description'),
        expense.cost,
        stringValue(expense.date, 'maintenance date'),
        stringValue(expense.month, 'maintenance month'),
      ]
    );
  }

  for (const value of data.generalExpenses) {
    const expense = asRecord(value);
    await client.query(
      `INSERT INTO general_expenses (
         id, owner_id, category, description, amount, date, month
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        asUuid(expense.id, 'general expense ID'),
        ownerId,
        stringValue(expense.category, 'expense category'),
        stringValue(expense.description, 'expense description'),
        expense.amount,
        stringValue(expense.date, 'expense date'),
        stringValue(expense.month, 'expense month'),
      ]
    );
  }

  for (const value of data.mpesaLogs) {
    const log = asRecord(value);
    await client.query(
      `INSERT INTO mpesa_callback_logs (
         id, owner_id, timestamp, transaction_reference, phone, amount,
         tenant_name, unit_id, result_code, result_desc, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        asUuid(log.id, 'M-Pesa log ID'),
        ownerId,
        stringValue(log.timestamp, 'M-Pesa timestamp'),
        stringValue(log.transactionReference, 'M-Pesa transaction reference'),
        optionalString(log.phone),
        log.amount,
        optionalString(log.tenantName),
        optionalString(log.unitId),
        log.resultCode,
        optionalString(log.resultDesc),
        stringValue(log.status, 'M-Pesa status'),
      ]
    );
  }
}

async function loadDashboardData(client: PoolClient, ownerId: string): Promise<DashboardData> {
  const [
    profileResult,
    propertiesResult,
    unitsResult,
    tenantsResult,
    paymentsResult,
    maintenanceResult,
    generalResult,
    mpesaResult,
  ] = await Promise.all([
    client.query('SELECT selected_month FROM user_profiles WHERE user_id = $1', [ownerId]),
    client.query(
      `SELECT id, name, COALESCE(location, '') AS location,
              COALESCE(description, '') AS description, created_at::text AS "createdAt"
       FROM properties WHERE owner_id = $1 ORDER BY created_at`,
      [ownerId]
    ),
    client.query(
      `SELECT id, property_id AS "propertyId", unit_number AS "unitNumber",
              rent_amount AS "rentAmount", occupancy_status AS "occupancyStatus", notes
       FROM units WHERE owner_id = $1 ORDER BY created_at`,
      [ownerId]
    ),
    client.query(
      `SELECT id, name, COALESCE(phone, '') AS phone, COALESCE(email, '') AS email,
              unit_id AS "unitId", COALESCE(start_date::text, '') AS "startDate"
       FROM tenants WHERE owner_id = $1 ORDER BY created_at`,
      [ownerId]
    ),
    client.query(
      `SELECT id, tenant_id AS "tenantId", unit_id AS "unitId", amount,
              payment_date::text AS "paymentDate", status,
              transaction_reference AS "transactionReference",
              payment_method AS "paymentMethod", month, notes
       FROM payments WHERE owner_id = $1 ORDER BY payment_date DESC, created_at DESC`,
      [ownerId]
    ),
    client.query(
      `SELECT id, unit_id AS "unitId", description, cost, date::text, month
       FROM maintenance_expenses WHERE owner_id = $1 ORDER BY date DESC, created_at DESC`,
      [ownerId]
    ),
    client.query(
      `SELECT id, category, description, amount, date::text, month
       FROM general_expenses WHERE owner_id = $1 ORDER BY date DESC, created_at DESC`,
      [ownerId]
    ),
    client.query(
      `SELECT id, timestamp::text, transaction_reference AS "transactionReference",
              COALESCE(phone, '') AS phone, COALESCE(amount, 0) AS amount,
              COALESCE(tenant_name, '') AS "tenantName", COALESCE(unit_id, '') AS "unitId",
              COALESCE(result_code, 0) AS "resultCode", COALESCE(result_desc, '') AS "resultDesc",
              status
       FROM mpesa_callback_logs WHERE owner_id = $1 ORDER BY timestamp DESC`,
      [ownerId]
    ),
  ]);

  const selectedMonth = profileResult.rows[0]?.selected_month;
  if (typeof selectedMonth !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
    throw new Error('The saved dashboard month preference is missing or invalid.');
  }

  return {
    properties: propertiesResult.rows,
    units: unitsResult.rows.map((row) => ({ ...row, rentAmount: Number(row.rentAmount) })),
    tenants: tenantsResult.rows,
    payments: paymentsResult.rows.map((row) => ({ ...row, amount: Number(row.amount) })),
    maintenanceExpenses: maintenanceResult.rows.map((row) => ({ ...row, cost: Number(row.cost) })),
    generalExpenses: generalResult.rows.map((row) => ({ ...row, amount: Number(row.amount) })),
    mpesaLogs: mpesaResult.rows.map((row) => ({ ...row, amount: Number(row.amount) })),
    selectedMonth,
  };
}

async function importLegacySnapshot(client: PoolClient, ownerId: string): Promise<void> {
  const legacy = await client.query(
    'SELECT data FROM user_dashboard_state WHERE user_id = $1 FOR UPDATE',
    [ownerId]
  );
  if (!legacy.rows[0]) return;

  const data: unknown = legacy.rows[0].data;
  if (!isDashboardData(data)) {
    throw new Error('The existing dashboard snapshot is invalid and was not changed.');
  }

  const counts = await client.query(
    `SELECT
       (SELECT COUNT(*) FROM properties WHERE owner_id = $1) +
       (SELECT COUNT(*) FROM units WHERE owner_id = $1) +
       (SELECT COUNT(*) FROM tenants WHERE owner_id = $1) +
       (SELECT COUNT(*) FROM payments WHERE owner_id = $1) +
       (SELECT COUNT(*) FROM maintenance_expenses WHERE owner_id = $1) +
       (SELECT COUNT(*) FROM general_expenses WHERE owner_id = $1) +
       (SELECT COUNT(*) FROM mpesa_callback_logs WHERE owner_id = $1) AS total`,
    [ownerId]
  );
  const hasLegacyRecords = [
    data.properties,
    data.units,
    data.tenants,
    data.payments,
    data.maintenanceExpenses,
    data.generalExpenses,
    data.mpesaLogs,
  ].some((items) => items.length > 0);

  if (hasLegacyRecords && Number(counts.rows[0].total) > 0) {
    throw new Error(
      'Both legacy dashboard data and table records exist. Import was stopped to prevent overwriting either set.'
    );
  }

  if (hasLegacyRecords) {
    await replaceDashboardRows(client, ownerId, migrateLegacyData(data));
  }
  await client.query(
    'UPDATE user_profiles SET selected_month = $2 WHERE user_id = $1',
    [ownerId, data.selectedMonth]
  );
  await client.query('DELETE FROM user_dashboard_state WHERE user_id = $1', [ownerId]);
}

function getDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Error && /timed?\s*out|timeout/i.test(error.message)) {
    return 'The database connection timed out. Check that Neon Postgres is reachable from this server.';
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ETIMEDOUT') {
    return 'The database connection timed out. Check that Neon Postgres is reachable from this server.';
  }
  return 'Unable to process dashboard data. Check the data and try again.';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (respondIfMaintenanceMode(res)) return;
  const neonUserId = await getAuthenticatedUserId(req, res);
  if (!neonUserId) return;

  if (req.method === 'PUT' && isRequestBodyTooLarge(req, MAX_DASHBOARD_BODY_BYTES)) {
    return res.status(413).json({ error: 'Dashboard data exceeds the 1 MB request limit.' });
  }

  const routeLimit =
    req.method === 'GET' ? { route: 'dashboard:GET', max: 120 } :
    req.method === 'PUT' ? { route: 'dashboard:PUT', max: 20 } :
    null;
  if (routeLimit) {
    try {
      if (await isRateLimited(neonUserId, routeLimit.route, routeLimit.max)) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Too many requests. Try again in one minute.' });
      }
    } catch (error) {
      console.error('Dashboard rate limit check failed:', error);
      return res.status(503).json({ error: 'Request protection is temporarily unavailable.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const data = await withUserDatabase(neonUserId, async (client) => {
        await importLegacySnapshot(client, neonUserId);
        return loadDashboardData(client, neonUserId);
      });
      return res.status(200).json({ data });
    } catch (error) {
      console.error('Dashboard load failed:', error);
      return res.status(500).json({ error: getDatabaseErrorMessage(error) });
    }
  }

  if (req.method === 'PUT') {
    const { data, profile } = req.body ?? {};
    if (!isDashboardData(data)) {
      return res.status(400).json({ error: 'Invalid dashboard data.' });
    }
    const profileData =
      typeof profile === 'object' && profile !== null
        ? (profile as DashboardProfile)
        : undefined;

    try {
      await withUserDatabase(neonUserId, async (client) => {
        await replaceDashboardRows(client, neonUserId, data);
        await client.query(
          `UPDATE user_profiles
           SET email = $2, full_name = $3, image_url = $4, selected_month = $5
           WHERE user_id = $1`,
          [
            neonUserId,
            nullableString(profileData?.email, 320),
            nullableString(profileData?.name, 200),
            nullableString(profileData?.image, 2048),
            data.selectedMonth,
          ]
        );
        await client.query('DELETE FROM user_dashboard_state WHERE user_id = $1', [neonUserId]);
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Dashboard save failed:', error);
      return res.status(500).json({ error: getDatabaseErrorMessage(error) });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
