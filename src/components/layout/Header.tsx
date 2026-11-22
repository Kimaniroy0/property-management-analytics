import React, { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight, Calendar, Smartphone, Plus } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { NavigationTab } from './Sidebar';
import { authClient } from '../../lib/auth';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  onOpenMpesaModal: () => void;
  onOpenQuickPaymentModal: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Dashboard', subtitle: 'Real-time property performance, occupancy & financial KPIs' },
  properties: { title: 'Property Portfolio', subtitle: 'Managed estates, complexes & structural assets' },
  units: { title: 'Unit Inventory', subtitle: 'Individual unit records, rental pricing & occupancy status' },
  tenants: { title: 'Tenant Directory', subtitle: 'Registered tenants, unit assignments & contact records' },
  payments: { title: 'Rent Ledger', subtitle: 'Historical and current monthly collections & transaction refs' },
  mpesa: { title: 'M-Pesa Payment Gateway', subtitle: 'STK push simulator, callback webhook listener & audit log' },
  expenses: { title: 'Operating Expenses', subtitle: 'Maintenance logs & recurring general overhead expenses' },
  reports: { title: 'Financial & Occupancy Reports', subtitle: 'Exportable statements, collection rates & profitability' },
  settings: { title: 'System Settings', subtitle: 'Platform configurations, currency display & database reset' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenMpesaModal,
  onOpenQuickPaymentModal,
}) => {
  const { selectedMonth, setSelectedMonth, availableMonths } = useProperty();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const currentMonthIndex = availableMonths.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    if (currentMonthIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentMonthIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex > 0) {
      setSelectedMonth(availableMonths[currentMonthIndex - 1]);
    }
  };

  const formatMonthLabel = (m: string) => {
    const [year, month] = m.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const meta = TAB_TITLES[currentTab] || { title: 'Property Management', subtitle: '' };
  const handleSignOut = async () => {
    setSignOutError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setSignOutError(result.error.message || 'Could not sign out.');
        return;
      }
      window.location.assign('/sign-in');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Could not sign out.');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-6 border-b border-[#DED6C9] bg-[#FAF8F3]/95 px-4 backdrop-blur-xs sm:px-8">
      {/* Zone 1: Brand & Page Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DED6C9] bg-white text-[#641F2B] md:hidden shadow-2xs"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#747474]">
            <span className="font-medium text-[#641F2B]">Estate</span>
            <span aria-hidden="true">/</span>
            <span className="capitalize">{currentTab}</span>
          </div>
          <h1 className="truncate text-base sm:text-lg font-bold text-[#252525] tracking-tight">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Month Filter Control (FR9 - chosen month selector) */}
      <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#DED6C9] bg-white px-2 py-1 shadow-2xs">
        <button
          onClick={handlePrevMonth}
          disabled={currentMonthIndex >= availableMonths.length - 1}
          title="Previous Month"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#747474] hover:bg-[#F3EDE3] hover:text-[#252525] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 px-2">
          <Calendar className="h-3.5 w-3.5 text-[#641F2B]" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="cursor-pointer bg-transparent text-xs font-semibold text-[#252525] focus:outline-hidden"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          disabled={currentMonthIndex <= 0}
          title="Next Month"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#747474] hover:bg-[#F3EDE3] hover:text-[#252525] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Zone 3: Primary Action & M-Pesa STK Push Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
    

        <button
          onClick={onOpenQuickPaymentModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F] transition-colors whitespace-nowrap"
          title="Record Manual Rent Payment"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Record Payment</span>
        </button>

        <div className="ml-2 border-l border-[#DED6C9] pl-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-[#DED6C9] px-3 py-2 text-xs font-semibold text-[#641F2B] hover:bg-[#F3EDE3]"
          >
            Sign out
          </button>
        </div>
      </div>
      {signOutError && (
        <p role="alert" className="absolute right-4 top-full mt-1 rounded bg-red-50 p-2 text-xs text-red-900">
          {signOutError}
        </p>
      )}
    </header>
  );
};
