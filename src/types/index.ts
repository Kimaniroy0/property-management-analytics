export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  createdAt: string;
}

export interface Unit {
  id: string; // Unique Unit ID (e.g. A-101, B-201)
  propertyId: string;
  unitNumber: string;
  rentAmount: number;
  occupancyStatus: 'Occupied' | 'Vacant';
  notes?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  unitId: string; // Exactly one unit assigned (FR3)
  startDate: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

export type PaymentMethod = 'M-Pesa' | 'Bank Transfer' | 'Cash';

export interface Payment {
  id: string;
  tenantId: string;
  unitId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  transactionReference: string; // e.g. MPESA-QKD98231 (unique, BR9)
  paymentMethod: PaymentMethod;
  month: string; // YYYY-MM format (e.g. 2026-10)
  notes?: string;
}

export interface MaintenanceExpense {
  id: string;
  unitId: string;
  description: string;
  cost: number;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
}

export type ExpenseCategory =
  | 'Security'
  | 'Cleaning'
  | 'Utilities'
  | 'Administration'
  | 'Insurance'
  | 'Supplies'
  | 'Repairs / Other';

export interface GeneralExpense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
}

export interface MpesaCallbackLog {
  id: string;
  timestamp: string;
  transactionReference: string;
  phone: string;
  amount: number;
  tenantName: string;
  unitId: string;
  resultCode: number; // 0 for success
  resultDesc: string;
  status: 'Processed' | 'Duplicate Rejected' | 'Failed';
}

export interface MonthKPIs {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number; // rounded to 1 decimal place (FR4)
  expectedRent: number;
  rentCollected: number;
  outstandingRent: number;
  maintenanceExpenses: number;
  generalExpenses: number;
  totalExpenses: number;
  netIncome: number;
  paidCount: number;
  unpaidCount: number;
  collectionRate: number;
}
