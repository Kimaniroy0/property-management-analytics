import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { authClient, getAuthToken } from '../lib/auth';
import {
  Property,
  Unit,
  Tenant,
  Payment,
  MaintenanceExpense,
  GeneralExpense,
  MpesaCallbackLog,
  MonthKPIs,
} from '../types';
import { DashboardApiError, loadDashboard, saveDashboard } from '../lib/dashboardApi';

interface PropertyContextType {
  isLoading: boolean;
  loadError: string | null;
  loadErrorStatus: number | null;
  saveError: string | null;
  retryLoad: () => void;
  retrySave: () => void;

  // Current month state
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];

  // Entities
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  payments: Payment[];
  maintenanceExpenses: MaintenanceExpense[];
  generalExpenses: GeneralExpense[];
  mpesaLogs: MpesaCallbackLog[];

  // CRUD Actions
  addProperty: (prop: Omit<Property, 'id' | 'createdAt'>) => { success: boolean; message: string };
  editProperty: (id: string, prop: Partial<Property>) => void;
  deleteProperty: (id: string) => { success: boolean; message: string };

  addUnit: (unit: { id: string; propertyId: string; rentAmount: number; notes?: string }) => { success: boolean; message: string };
  editUnit: (id: string, updates: Partial<Unit>) => { success: boolean; message: string };
  deleteUnit: (id: string) => { success: boolean; message: string };

  addTenant: (tenant: { name: string; phone: string; email: string; unitId: string }) => { success: boolean; message: string };
  editTenant: (id: string, updates: Partial<Tenant>) => { success: boolean; message: string };
  deleteTenant: (id: string) => void;

  recordPayment: (payment: {
    tenantId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash';
    transactionReference?: string;
    notes?: string;
  }) => { success: boolean; message: string };

  addMaintenanceExpense: (exp: { unitId: string; description: string; cost: number; date: string }) => void;
  editMaintenanceExpense: (id: string, updates: Partial<MaintenanceExpense>) => void;
  deleteMaintenanceExpense: (id: string) => void;

  addGeneralExpense: (exp: { category: GeneralExpense['category']; description: string; amount: number; date: string }) => void;
  editGeneralExpense: (id: string, updates: Partial<GeneralExpense>) => void;
  deleteGeneralExpense: (id: string) => void;

  // M-Pesa Flow
  simulateMpesaCallback: (payload: {
    phone: string;
    amount: number;
    tenantId: string;
    customRef?: string;
  }) => { success: boolean; message: string; ref?: string };

  // Computed KPIs for Selected Month
  kpis: MonthKPIs;

  // Monthly trends for charts (last 6 months)
  monthlyTrends: Array<{
    month: string;
    monthName: string;
    income: number;
    expenses: number;
    netIncome: number;
    occupancyRate: number;
  }>;

  // Tenant payment status lookup for selected month
  getTenantMonthStatus: (tenantId: string, month?: string) => {
    status: 'PAID' | 'UNPAID';
    payment?: Payment;
  };

}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id;
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceExpenses, setMaintenanceExpenses] = useState<MaintenanceExpense[]>([]);
  const [generalExpenses, setGeneralExpenses] = useState<GeneralExpense[]>([]);
  const [mpesaLogs, setMpesaLogs] = useState<MpesaCallbackLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadRevision, setLoadRevision] = useState(0);
  const [saveRevision, setSaveRevision] = useState(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setLoadErrorStatus(null);

      try {
        const token = await getAuthToken();
        const data = await loadDashboard(token);
        if (!isCurrent) return;

        setProperties(data.properties);
        setUnits(data.units);
        setTenants(data.tenants);
        setPayments(data.payments);
        setMaintenanceExpenses(data.maintenanceExpenses);
        setGeneralExpenses(data.generalExpenses);
        setMpesaLogs(data.mpesaLogs);
        setSelectedMonth(data.selectedMonth);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error ? error.message : 'Unable to load your dashboard data.'
          );
          setLoadErrorStatus(error instanceof DashboardApiError ? error.status : 500);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isCurrent = false;
    };
  }, [userId, loadRevision]);

  const retryLoad = useCallback(() => {
    setLoadError(null);
    setLoadErrorStatus(null);
    setLoadRevision((revision) => revision + 1);
  }, []);

  const retrySave = useCallback(() => {
    setSaveError(null);
    setSaveRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    if (isLoading || loadError || !userId) return;

    let isCurrent = true;
    const timer = window.setTimeout(() => {
      setSaveError(null);
      const snapshot = {
        properties,
        units,
        tenants,
        payments,
        maintenanceExpenses,
        generalExpenses,
        mpesaLogs,
        selectedMonth,
      };
      const profile = {
        email: user?.email ?? null,
        name: user?.name ?? null,
        image: user?.image ?? null,
      };

      const save = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          setSaveError(null);
          const token = await getAuthToken();
          await saveDashboard(token, snapshot, profile);
        });
      saveQueue.current = save;

      void save.catch((error: unknown) => {
        if (isCurrent) {
          setSaveError(
            error instanceof Error ? error.message : 'Unable to save your dashboard data.'
          );
        }
      });
    }, 500);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [
    userId,
    user?.email,
    user?.name,
    user?.image,
    properties,
    units,
    tenants,
    payments,
    maintenanceExpenses,
    generalExpenses,
    mpesaLogs,
    selectedMonth,
    isLoading,
    loadError,
    loadErrorStatus,
    saveRevision,
  ]);

  // Available months list
  const availableMonths = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - index);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }),
    []
  );

  // Helper: check BR3 - ensure unit occupancy matches tenant assignments
  const syncUnitOccupancy = (currentUnits: Unit[], currentTenants: Tenant[]): Unit[] => {
    const occupiedUnitIds = new Set(currentTenants.map((t) => t.unitId));
    return currentUnits.map((u) => ({
      ...u,
      occupancyStatus: occupiedUnitIds.has(u.id) ? 'Occupied' : 'Vacant',
    }));
  };

  // Property Actions
  const addProperty = (prop: Omit<Property, 'id' | 'createdAt'>) => {
    const newProp: Property = {
      ...prop,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => [...prev, newProp]);
    return { success: true, message: 'Property created successfully' };
  };

  const editProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProperty = (id: string) => {
    const hasUnits = units.some((u) => u.propertyId === id);
    if (hasUnits) {
      return { success: false, message: 'Cannot delete property with existing units. Please remove or reassign units first.' };
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
    return { success: true, message: 'Property deleted successfully' };
  };

  // Unit Actions (BR1: Unique Unit ID, FR2)
  const addUnit = (unitData: { id: string; propertyId: string; rentAmount: number; notes?: string }) => {
    const cleanId = unitData.id.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, message: 'Unit ID cannot be empty.' };
    }
    const exists = units.some((u) => u.id.toUpperCase() === cleanId);
    if (exists) {
      return { success: false, message: `A unit with ID "${cleanId}" already exists. (BR1)` };
    }

    const newUnit: Unit = {
      id: cleanId,
      unitNumber: cleanId,
      propertyId: unitData.propertyId,
      rentAmount: unitData.rentAmount,
      occupancyStatus: 'Vacant', // Newly created unit starts as vacant
      notes: unitData.notes,
    };

    setUnits((prev) => [...prev, newUnit]);
    return { success: true, message: `Unit ${cleanId} added successfully.` };
  };

  const editUnit = (id: string, updates: Partial<Unit>) => {
    // If ID is changing, check uniqueness
    if (updates.id && updates.id !== id) {
      const cleanId = updates.id.trim().toUpperCase();
      const exists = units.some((u) => u.id.toUpperCase() === cleanId && u.id !== id);
      if (exists) {
        return { success: false, message: `Unit ID "${cleanId}" is already in use.` };
      }
      updates.id = cleanId;
      updates.unitNumber = cleanId;
    }

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, ...updates };
        }
        return u;
      })
    );

    // If unit ID changed, update references in tenants
    if (updates.id && updates.id !== id) {
      setTenants((prev) =>
        prev.map((t) => (t.unitId === id ? { ...t, unitId: updates.id! } : t))
      );
      setPayments((prev) =>
        prev.map((p) => (p.unitId === id ? { ...p, unitId: updates.id! } : p))
      );
      setMaintenanceExpenses((prev) =>
        prev.map((m) => (m.unitId === id ? { ...m, unitId: updates.id! } : m))
      );
    }

    return { success: true, message: 'Unit updated successfully.' };
  };

  const deleteUnit = (id: string) => {
    // Check if occupied by tenant
    const assignedTenant = tenants.find((t) => t.unitId === id);
    if (assignedTenant) {
      return {
        success: false,
        message: `Cannot delete unit ${id}. It is currently occupied by tenant "${assignedTenant.name}". Please vacate or reassign the tenant first.`,
      };
    }

    setUnits((prev) => prev.filter((u) => u.id !== id));
    return { success: true, message: `Unit ${id} removed successfully.` };
  };

  // Tenant Actions (FR3, BR2: Exactly one unit, BR3: Unit becomes occupied)
  const addTenant = (tenantData: { name: string; phone: string; email: string; unitId: string }) => {
    // Validate unit exists
    const targetUnit = units.find((u) => u.id === tenantData.unitId);
    if (!targetUnit) {
      return { success: false, message: 'Selected unit does not exist.' };
    }

    // Check if unit is already assigned to another tenant (BR2)
    const existingTenant = tenants.find((t) => t.unitId === tenantData.unitId);
    if (existingTenant) {
      return {
        success: false,
        message: `Unit ${tenantData.unitId} is already occupied by ${existingTenant.name}. Please select an available unit.`,
      };
    }

    const newTenant: Tenant = {
      id: crypto.randomUUID(),
      name: tenantData.name.trim(),
      phone: tenantData.phone.trim(),
      email: tenantData.email.trim(),
      unitId: tenantData.unitId,
      startDate: new Date().toISOString().split('T')[0],
    };

    const updatedTenants = [...tenants, newTenant];
    setTenants(updatedTenants);

    // Update Unit status to Occupied (BR3)
    setUnits((prev) =>
      prev.map((u) => (u.id === tenantData.unitId ? { ...u, occupancyStatus: 'Occupied' } : u))
    );

    return { success: true, message: `Tenant "${newTenant.name}" registered and assigned to Unit ${newTenant.unitId}.` };
  };

  const editTenant = (id: string, updates: Partial<Tenant>) => {
    // If unitId is changing, ensure target unit is free
    if (updates.unitId) {
      const currentTenant = tenants.find((t) => t.id === id);
      if (currentTenant && currentTenant.unitId !== updates.unitId) {
        const isTargetOccupied = tenants.some(
          (t) => t.unitId === updates.unitId && t.id !== id
        );
        if (isTargetOccupied) {
          return {
            success: false,
            message: `Unit ${updates.unitId} is already occupied by another tenant.`,
          };
        }
      }
    }

    const updatedTenants = tenants.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTenants(updatedTenants);
    setUnits((prev) => syncUnitOccupancy(prev, updatedTenants));

    return { success: true, message: 'Tenant information updated.' };
  };

  const deleteTenant = (id: string) => {
    const updatedTenants = tenants.filter((t) => t.id !== id);
    setTenants(updatedTenants);
    setUnits((prev) => syncUnitOccupancy(prev, updatedTenants));
  };

  // Payment Recording (FR5, BR9: Duplicate check)
  const recordPayment = (paymentData: {
    tenantId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash';
    transactionReference?: string;
    notes?: string;
  }) => {
    const tenant = tenants.find((t) => t.id === paymentData.tenantId);
    if (!tenant) {
      return { success: false, message: 'Tenant not found.' };
    }

    const month = paymentData.paymentDate.slice(0, 7); // YYYY-MM
    const ref =
      paymentData.transactionReference?.trim().toUpperCase() ||
      `TX-${Date.now().toString().slice(-8)}`;

    // BR9: Prevent duplicate transaction reference
    const duplicate = payments.some(
      (p) => p.transactionReference.toUpperCase() === ref.toUpperCase()
    );
    if (duplicate) {
      return {
        success: false,
        message: `Transaction reference "${ref}" has already been processed in the system. Duplicate rejected (BR9).`,
      };
    }

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      tenantId: tenant.id,
      unitId: tenant.unitId,
      amount: Number(paymentData.amount),
      paymentDate: paymentData.paymentDate,
      status: 'Paid',
      transactionReference: ref,
      paymentMethod: paymentData.paymentMethod,
      month,
      notes: paymentData.notes,
    };

    setPayments((prev) => [newPayment, ...prev]);
    return {
      success: true,
      message: `Rent payment of KES ${newPayment.amount.toLocaleString()} recorded for ${tenant.name} (Unit ${tenant.unitId}).`,
    };
  };

  // M-Pesa Flow (FR11, FR12, BR8, BR9)
  const simulateMpesaCallback = (payload: {
    phone: string;
    amount: number;
    tenantId: string;
    customRef?: string;
  }) => {
    const tenant = tenants.find((t) => t.id === payload.tenantId);
    if (!tenant) {
      return { success: false, message: 'Tenant record not found for M-Pesa transaction.' };
    }

    const ref =
      payload.customRef?.trim().toUpperCase() ||
      `MPESA-QK${Math.floor(100000 + Math.random() * 900000)}`;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Check for duplicate M-Pesa reference (BR9)
    const isDuplicate = payments.some(
      (p) => p.transactionReference.toUpperCase() === ref.toUpperCase()
    );

    if (isDuplicate) {
      const duplicateLog: MpesaCallbackLog = {
        id: crypto.randomUUID(),
        timestamp,
        transactionReference: ref,
        phone: payload.phone,
        amount: payload.amount,
        tenantName: tenant.name,
        unitId: tenant.unitId,
        resultCode: 1032,
        resultDesc: 'Transaction Reference already processed. Callback ignored.',
        status: 'Duplicate Rejected',
      };
      setMpesaLogs((prev) => [duplicateLog, ...prev]);

      return {
        success: false,
        message: `Duplicate M-Pesa callback rejected: Reference ${ref} already exists in database.`,
      };
    }

    // Success flow: record payment and update tenant payment status (BR8)
    const today = new Date().toISOString().split('T')[0];
    const month = today.slice(0, 7);

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      tenantId: tenant.id,
      unitId: tenant.unitId,
      amount: Number(payload.amount),
      paymentDate: today,
      status: 'Paid',
      transactionReference: ref,
      paymentMethod: 'M-Pesa',
      month: selectedMonth, // apply to the actively viewed month
    };

    const successLog: MpesaCallbackLog = {
      id: crypto.randomUUID(),
      timestamp,
      transactionReference: ref,
      phone: payload.phone,
      amount: payload.amount,
      tenantName: tenant.name,
      unitId: tenant.unitId,
      resultCode: 0,
      resultDesc: 'The service request is processed successfully.',
      status: 'Processed',
    };

    setPayments((prev) => [newPayment, ...prev]);
    setMpesaLogs((prev) => [successLog, ...prev]);

    return {
      success: true,
      message: `M-Pesa payment of KES ${payload.amount.toLocaleString()} received and confirmed for ${tenant.name}! Transaction Ref: ${ref}`,
      ref,
    };
  };

  // Maintenance Expenses (FR7)
  const addMaintenanceExpense = (exp: { unitId: string; description: string; cost: number; date: string }) => {
    const newExp: MaintenanceExpense = {
      id: crypto.randomUUID(),
      unitId: exp.unitId,
      description: exp.description,
      cost: Number(exp.cost),
      date: exp.date,
      month: exp.date.slice(0, 7),
    };
    setMaintenanceExpenses((prev) => [newExp, ...prev]);
  };

  const editMaintenanceExpense = (id: string, updates: Partial<MaintenanceExpense>) => {
    setMaintenanceExpenses((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          if (updates.date) {
            updated.month = updates.date.slice(0, 7);
          }
          return updated;
        }
        return m;
      })
    );
  };

  const deleteMaintenanceExpense = (id: string) => {
    setMaintenanceExpenses((prev) => prev.filter((m) => m.id !== id));
  };

  // General Expenses (FR8)
  const addGeneralExpense = (exp: {
    category: GeneralExpense['category'];
    description: string;
    amount: number;
    date: string;
  }) => {
    const newExp: GeneralExpense = {
      id: crypto.randomUUID(),
      category: exp.category,
      description: exp.description,
      amount: Number(exp.amount),
      date: exp.date,
      month: exp.date.slice(0, 7),
    };
    setGeneralExpenses((prev) => [newExp, ...prev]);
  };

  const editGeneralExpense = (id: string, updates: Partial<GeneralExpense>) => {
    setGeneralExpenses((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, ...updates };
          if (updates.date) {
            updated.month = updates.date.slice(0, 7);
          }
          return updated;
        }
        return g;
      })
    );
  };

  const deleteGeneralExpense = (id: string) => {
    setGeneralExpenses((prev) => prev.filter((g) => g.id !== id));
  };

  // Status check for each tenant in selected month (FR6, BR5)
  const getTenantMonthStatus = (tenantId: string, month = selectedMonth) => {
    const paidPayment = payments.find(
      (p) => p.tenantId === tenantId && p.month === month && p.status === 'Paid'
    );
    return {
      status: paidPayment ? ('PAID' as const) : ('UNPAID' as const),
      payment: paidPayment,
    };
  };

  // Computed KPIs for Selected Month (FR4, FR9, BR4, BR6)
  const kpis = useMemo<MonthKPIs>(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.occupancyStatus === 'Occupied').length;
    const vacantUnits = totalUnits - occupiedUnits;

    // FR4 / BR4: (Occupied Units / Total Units) * 100 to 1 decimal place
    const occupancyRate = totalUnits > 0 ? Number(((occupiedUnits / totalUnits) * 100).toFixed(1)) : 0;

    // Expected rent = sum of monthly rent of all occupied units
    const expectedRent = units
      .filter((u) => u.occupancyStatus === 'Occupied')
      .reduce((sum, u) => sum + u.rentAmount, 0);

    // Rent collected = sum of successful payments in selected month
    const monthPayments = payments.filter((p) => p.month === selectedMonth && p.status === 'Paid');
    const rentCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Outstanding rent
    const outstandingRent = Math.max(0, expectedRent - rentCollected);

    // Maintenance expenses for selected month
    const monthMaintenance = maintenanceExpenses
      .filter((m) => m.month === selectedMonth)
      .reduce((sum, m) => sum + m.cost, 0);

    // General expenses for selected month
    const monthGeneral = generalExpenses
      .filter((g) => g.month === selectedMonth)
      .reduce((sum, g) => sum + g.amount, 0);

    // Total expenses = Maintenance + General (BR7)
    const totalExpenses = monthMaintenance + monthGeneral;

    // Net Income = Rent Collected - Total Expenses (BR6, FR9)
    const netIncome = rentCollected - totalExpenses;

    // Tenant Paid vs Unpaid counts
    let paidCount = 0;
    let unpaidCount = 0;
    tenants.forEach((t) => {
      const isPaid = monthPayments.some((p) => p.tenantId === t.id);
      if (isPaid) paidCount++;
      else unpaidCount++;
    });

    const collectionRate = expectedRent > 0 ? Number(((rentCollected / expectedRent) * 100).toFixed(1)) : 0;

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      expectedRent,
      rentCollected,
      outstandingRent,
      maintenanceExpenses: monthMaintenance,
      generalExpenses: monthGeneral,
      totalExpenses,
      netIncome,
      paidCount,
      unpaidCount,
      collectionRate,
    };
  }, [units, tenants, payments, maintenanceExpenses, generalExpenses, selectedMonth]);

  // Monthly trends for analytics charts (last 6 months)
  const monthlyTrends = useMemo(() => {
    const months = [...availableMonths].reverse();

    return months.map((m) => {
      const income = payments
        .filter((p) => p.month === m && p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const maint = maintenanceExpenses
        .filter((exp) => exp.month === m)
        .reduce((sum, exp) => sum + exp.cost, 0);

      const gen = generalExpenses
        .filter((exp) => exp.month === m)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const expTotal = maint + gen;
      const net = income - expTotal;

      return {
        month: m,
        monthName: new Date(`${m}-01T00:00:00`).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        income,
        expenses: expTotal,
        netIncome: net,
        occupancyRate: kpis.occupancyRate,
      };
    });
  }, [availableMonths, payments, maintenanceExpenses, generalExpenses, kpis.occupancyRate]);

  return (
    <PropertyContext.Provider
      value={{
        isLoading,
        loadError,
        loadErrorStatus,
        saveError,
        retryLoad,
        retrySave,
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        properties,
        units,
        tenants,
        payments,
        maintenanceExpenses,
        generalExpenses,
        mpesaLogs,
        addProperty,
        editProperty,
        deleteProperty,
        addUnit,
        editUnit,
        deleteUnit,
        addTenant,
        editTenant,
        deleteTenant,
        recordPayment,
        addMaintenanceExpense,
        editMaintenanceExpense,
        deleteMaintenanceExpense,
        addGeneralExpense,
        editGeneralExpense,
        deleteGeneralExpense,
        simulateMpesaCallback,
        kpis,
        monthlyTrends,
        getTenantMonthStatus,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
