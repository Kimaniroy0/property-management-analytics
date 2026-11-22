import React, { useState } from 'react';
import {
  Users,
  WalletCards,
  Receipt,
  TrendingUp,
  TrendingDown,
  Building2,
  DoorOpen,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

interface DashboardViewProps {
  onOpenMpesaWithTenant: (tenantId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenMpesaWithTenant,
  onNavigateToTab,
}) => {
  const {
    kpis,
    selectedMonth,
    monthlyTrends,
    tenants,
    units,
    getTenantMonthStatus,
  } = useProperty();

  const [searchTenant, setSearchTenant] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Format month name
  const [year, monthNum] = selectedMonth.split('-');
  const monthDate = new Date(Number(year), Number(monthNum) - 1, 1);
  const formattedMonth = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filtered tenants for payment status table
  const tenantPaymentList = tenants
    .map((tenant) => {
      const unit = units.find((u) => u.id === tenant.unitId);
      const statusInfo = getTenantMonthStatus(tenant.id);
      return {
        tenant,
        unit,
        status: statusInfo.status,
        payment: statusInfo.payment,
      };
    })
    .filter((item) => {
      const matchesSearch =
        item.tenant.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
        item.tenant.unitId.toLowerCase().includes(searchTenant.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === 'paid') return item.status === 'PAID';
      if (statusFilter === 'unpaid') return item.status === 'UNPAID';
      return true;
    });

  // Maximum value for Income vs Expenses chart scaling
  const maxFinancialVal = Math.max(
    ...monthlyTrends.map((t) => Math.max(t.income, t.expenses)),
    100000
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252525]">
            Performance Overview · {formattedMonth}
          </h2>
          <p className="text-xs sm:text-sm text-[#747474]">
            Consolidated operational data, tenant rent status, and profit margins.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-[#164A3A] bg-[#164A3A]/10 px-2.5 py-1 rounded-md">
            Collection Rate: {kpis.collectionRate.toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-[#172A3A] bg-[#172A3A]/10 px-2.5 py-1 rounded-md">
            Occupancy: {kpis.occupancyRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 4 PRIMARY KPI CARDS (PRD Section 13.1 & Design Brief Section 10) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Occupancy */}
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs hover:border-[#641F2B]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#747474]">
            <span className="uppercase tracking-wider">Occupancy Rate</span>
            <DoorOpen className="h-4 w-4 text-[#164A3A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#252525] tabular-nums">
              {kpis.occupancyRate.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-[#164A3A] flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              Target &gt; 80%
            </span>
          </div>
          <div className="mt-2 text-xs text-[#747474]">
            <span className="font-semibold text-[#252525] tabular-nums">{kpis.occupiedUnits}</span> of{' '}
            <span className="font-semibold text-[#252525] tabular-nums">{kpis.totalUnits}</span> units occupied
            <span className="text-slate-400 mx-1">·</span>
            <span className="text-[#641F2B] font-medium">{kpis.vacantUnits} vacant</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#DED6C9]/40">
            <div
              className="h-full rounded-full bg-[#164A3A] transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.occupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Rent Collected */}
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs hover:border-[#641F2B]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#747474]">
            <span className="uppercase tracking-wider">Rent Collected</span>
            <WalletCards className="h-4 w-4 text-[#641F2B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-[#252525] tabular-nums">
              KES {kpis.rentCollected.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#747474]">
            <span>Expected: </span>
            <span className="font-semibold text-[#252525] tabular-nums">
              KES {kpis.expectedRent.toLocaleString()}
            </span>
            {kpis.outstandingRent > 0 && (
              <span className="text-[#641F2B] font-medium block mt-0.5">
                KES {kpis.outstandingRent.toLocaleString()} outstanding
              </span>
            )}
          </div>
          {/* Progress */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#DED6C9]/40">
            <div
              className="h-full rounded-full bg-[#641F2B] transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.collectionRate)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs hover:border-[#641F2B]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#747474]">
            <span className="uppercase tracking-wider">Total Expenses</span>
            <Receipt className="h-4 w-4 text-[#172A3A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-[#252525] tabular-nums">
              KES {kpis.totalExpenses.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#747474]">
            <span>Maint: </span>
            <span className="font-semibold text-[#252525] tabular-nums">
              KES {kpis.maintenanceExpenses.toLocaleString()}
            </span>
            <span className="text-slate-400 mx-1">·</span>
            <span>Gen: </span>
            <span className="font-semibold text-[#252525] tabular-nums">
              KES {kpis.generalExpenses.toLocaleString()}
            </span>
          </div>
          {/* Expense Ratio Bar */}
          <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-[#DED6C9]/40">
            <div
              className="h-full bg-[#172A3A]"
              style={{
                width: `${
                  kpis.totalExpenses > 0
                    ? (kpis.maintenanceExpenses / kpis.totalExpenses) * 100
                    : 50
                }%`,
              }}
              title="Maintenance Share"
            />
            <div
              className="h-full bg-[#B89A62]"
              style={{
                width: `${
                  kpis.totalExpenses > 0
                    ? (kpis.generalExpenses / kpis.totalExpenses) * 100
                    : 50
                }%`,
              }}
              title="General Share"
            />
          </div>
        </div>

        {/* Card 4: Net Income */}
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs hover:border-[#641F2B]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#747474]">
            <span className="uppercase tracking-wider">Net Income (FR9)</span>
            <TrendingUp className="h-4 w-4 text-[#164A3A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                kpis.netIncome >= 0 ? 'text-[#164A3A]' : 'text-red-700'
              }`}
            >
              KES {kpis.netIncome.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#747474]">
            <span>Profit Margin: </span>
            <span className="font-semibold text-[#252525] tabular-nums">
              {kpis.rentCollected > 0
                ? `${((kpis.netIncome / kpis.rentCollected) * 100).toFixed(1)}%`
                : '0.0%'}
            </span>
            <span className="text-slate-400 mx-1">·</span>
            <span>Rent − Expenses</span>
          </div>
          {/* Indicator */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#DED6C9]/40">
            <div
              className={`h-full rounded-full ${
                kpis.netIncome >= 0 ? 'bg-[#164A3A]' : 'bg-red-600'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    kpis.rentCollected > 0 ? (kpis.netIncome / kpis.rentCollected) * 100 : 0
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION: CHARTS (FR10) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Income vs Expenses Multi-Month Comparison */}
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#DED6C9]/60">
            <div>
              <h3 className="text-sm font-bold text-[#252525]">Income vs. Operating Expenses</h3>
              <p className="text-xs text-[#747474]">
                Monthly comparison showing revenue collection against combined costs
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-xs bg-[#641F2B]" />
                <span className="text-[#252525]">Rent Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-xs bg-[#172A3A]" />
                <span className="text-[#252525]">Expenses</span>
              </div>
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="mt-6 h-64 w-full">
            <div className="flex h-full items-end gap-3 sm:gap-6 pt-6 pb-4">
              {monthlyTrends.map((trend) => {
                const incomePercent = (trend.income / maxFinancialVal) * 100;
                const expensePercent = (trend.expenses / maxFinancialVal) * 100;
                const isSelected = trend.month === selectedMonth;

                return (
                  <div key={trend.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-24 bg-[#172A3A] text-white p-2 rounded text-[11px] font-mono pointer-events-none shadow-md z-10 whitespace-nowrap">
                      <p className="font-bold">{trend.monthName}</p>
                      <p className="text-emerald-300">Income: KES {trend.income.toLocaleString()}</p>
                      <p className="text-amber-200">Expenses: KES {trend.expenses.toLocaleString()}</p>
                      <p className="text-white/80">Net: KES {trend.netIncome.toLocaleString()}</p>
                    </div>

                    {/* Bars pair */}
                    <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-44">
                      {/* Income Bar (Maroon) */}
                      <div
                        className={`w-3 sm:w-5 rounded-t transition-all duration-300 ${
                          isSelected ? 'bg-[#641F2B]' : 'bg-[#641F2B]/75 group-hover:bg-[#641F2B]'
                        }`}
                        style={{ height: `${Math.max(4, incomePercent)}%` }}
                      />
                      {/* Expense Bar (Navy) */}
                      <div
                        className={`w-3 sm:w-5 rounded-t transition-all duration-300 ${
                          isSelected ? 'bg-[#172A3A]' : 'bg-[#172A3A]/70 group-hover:bg-[#172A3A]'
                        }`}
                        style={{ height: `${Math.max(4, expensePercent)}%` }}
                      />
                    </div>

                    {/* X-Axis Label */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-[11px] font-medium tracking-tight ${
                          isSelected
                            ? 'font-bold text-[#641F2B] underline underline-offset-4'
                            : 'text-[#747474]'
                        }`}
                      >
                        {trend.monthName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-[#747474] pt-3 border-t border-[#DED6C9]/40">
            <span>Peak Net Profit: <strong className="text-[#164A3A] font-mono">KES 484,000 (Sep 2026)</strong></span>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="inline-flex items-center gap-1 text-[#641F2B] hover:underline font-semibold"
            >
              <span>View Profitability Statement</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Chart 2: Occupancy & Status Breakdown */}
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#DED6C9]/60">
              <h3 className="text-sm font-bold text-[#252525]">Portfolio Occupancy</h3>
              <p className="text-xs text-[#747474]">Capacity utilization across active complexes</p>
            </div>

            {/* Visual Donut Indicator */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#DED6C9]/40"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#164A3A] transition-all duration-700 ease-out"
                    strokeWidth="12"
                    strokeDasharray={`${(kpis.occupancyRate * 2.513).toFixed(1)} 251.3`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-mono text-2xl font-extrabold text-[#252525] tabular-nums">
                    {kpis.occupancyRate.toFixed(1)}%
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-[#747474]">Occupied</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-2 text-center text-xs">
                <div className="rounded-lg bg-white p-2.5 border border-[#DED6C9]/60">
                  <span className="block font-mono text-base font-bold text-[#164A3A] tabular-nums">
                    {kpis.occupiedUnits}
                  </span>
                  <span className="text-[11px] text-[#747474]">Occupied Units</span>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-[#DED6C9]/60">
                  <span className="block font-mono text-base font-bold text-[#641F2B] tabular-nums">
                    {kpis.vacantUnits}
                  </span>
                  <span className="text-[11px] text-[#747474]">Vacant Units</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DED6C9]/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#747474]">Payment Status Health:</span>
              <span className="font-semibold text-[#164A3A]">
                {kpis.paidCount} Paid · {kpis.unpaidCount} Unpaid
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RENT PAYMENT STATUS SECTION (FR6 & Design Brief Section 14) */}
      <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#DED6C9]/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#252525]">Rent Payment Status</h3>
              <span className="rounded-md bg-[#641F2B]/10 px-2 py-0.5 text-[11px] font-bold text-[#641F2B]">
                {formattedMonth}
              </span>
            </div>
            <p className="text-xs text-[#747474]">
              Status verification for active tenants with instant M-Pesa push triggers
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 h-3.5 w-3.5 text-[#747474]" />
              <input
                type="text"
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
                placeholder="Search tenant or unit..."
                className="w-40 sm:w-52 rounded-lg border border-[#DED6C9] bg-white py-1.5 pl-8 pr-2.5 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
              />
            </div>

            <div className="flex rounded-lg border border-[#DED6C9] bg-white p-0.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#172A3A] text-white'
                    : 'text-[#747474] hover:text-[#252525]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('unpaid')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === 'unpaid'
                    ? 'bg-[#641F2B] text-white'
                    : 'text-[#747474] hover:text-[#252525]'
                }`}
              >
                Unpaid ({kpis.unpaidCount})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === 'paid'
                    ? 'bg-[#164A3A] text-white'
                    : 'text-[#747474] hover:text-[#252525]'
                }`}
              >
                Paid ({kpis.paidCount})
              </button>
            </div>
          </div>
        </div>

        {/* Payment Status Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DED6C9] text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                <th className="py-2.5 px-3">Tenant Name</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-right">Monthly Rent</th>
                <th className="py-2.5 px-3">Payment Status</th>
                <th className="py-2.5 px-3">Payment Date / Ref</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6C9]/40">
              {tenantPaymentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#747474]">
                    No tenants match the current filters.
                  </td>
                </tr>
              ) : (
                tenantPaymentList.map(({ tenant, unit, status, payment }) => (
                  <tr key={tenant.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#252525]">{tenant.name}</div>
                      <div className="text-[11px] text-[#747474] font-mono">{tenant.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#252525]">
                      {unit?.unitNumber || tenant.unitId}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-[#252525] tabular-nums">
                      KES {unit?.rentAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      {status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#164A3A]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>PAID</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#641F2B]">
                          <Clock className="h-3.5 w-3.5" />
                          <span>UNPAID</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {status === 'PAID' && payment ? (
                        <div>
                          <span className="font-mono text-[#252525]">{payment.paymentDate}</span>
                          <span className="block text-[11px] font-mono text-[#747474]">
                            {payment.transactionReference}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#747474] italic">Awaiting collection</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {status === 'UNPAID' ? (
                        <button
                          onClick={() => onOpenMpesaWithTenant(tenant.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#164A3A] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#216751] transition-colors"
                          title="Trigger M-Pesa STK Push Prompt"
                        >
                          <Smartphone className="h-3 w-3" />
                          <span>M-Pesa Push</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-800">Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#DED6C9]/40 pt-3 text-xs text-[#747474]">
          <span>
            Showing {tenantPaymentList.length} of {tenants.length} registered tenants
          </span>
          <button
            onClick={() => onNavigateToTab('payments')}
            className="inline-flex items-center gap-1 text-[#641F2B] font-semibold hover:underline"
          >
            <span>View Full Payment Ledger</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
