import type {
  GeneralExpense,
  MaintenanceExpense,
  MpesaCallbackLog,
  Payment,
  Property,
  Tenant,
  Unit,
} from '../types';

export interface DashboardData {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  payments: Payment[];
  maintenanceExpenses: MaintenanceExpense[];
  generalExpenses: GeneralExpense[];
  mpesaLogs: MpesaCallbackLog[];
  selectedMonth: string;
}

export interface DashboardProfile {
  email: string | null;
  name: string | null;
  image: string | null;
}

export class DashboardApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

async function request<T>(
  token: string,
  method: 'GET' | 'PUT',
  body?: unknown
): Promise<T> {
  const response = await fetch('/api/dashboard', {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new DashboardApiError(
      `Dashboard API returned ${contentType || 'an unknown content type'} instead of JSON (HTTP ${response.status}). The Vite development server does not run API routes; start the app with the API server configured.`,
      response.status
    );
  }

  const result: unknown = await response.json();
  if (!response.ok) {
    const errorMessage =
      typeof result === 'object' &&
      result !== null &&
      'error' in result &&
      typeof result.error === 'string'
        ? result.error
        : 'Dashboard request failed.';
    throw new DashboardApiError(errorMessage, response.status);
  }
  return result as T;
}

export async function loadDashboard(token: string): Promise<DashboardData> {
  const result = await request<{ data: DashboardData }>(token, 'GET');
  return result.data;
}

export async function saveDashboard(
  token: string,
  data: DashboardData,
  profile: DashboardProfile
): Promise<void> {
  await request<{ success: true }>(token, 'PUT', { data, profile });
}
