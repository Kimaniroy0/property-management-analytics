/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { authClient } from './lib/auth';
import { PropertyProvider, useProperty } from './context/PropertyContext';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SignInView } from './components/auth/SignInView';
import { SignUpView } from './components/auth/SignUpView';
import { DashboardView } from './components/dashboard/DashboardView';
import { PropertiesView } from './components/properties/PropertiesView';
import { UnitsView } from './components/units/UnitsView';
import { TenantsView } from './components/tenants/TenantsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { MpesaView } from './components/mpesa/MpesaView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { MpesaModal } from './components/modals/MpesaModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { StatusPage } from './components/system/StatusPages';

const AuthenticatedDashboard: React.FC = () => {
  const { isLoading, loadError, loadErrorStatus, saveError, retryLoad, retrySave } = useProperty();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Modal States
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [mpesaPreselectedTenant, setMpesaPreselectedTenant] = useState<string | undefined>(undefined);
  const [isQuickPaymentModalOpen, setIsQuickPaymentModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EDE3] text-sm text-[#747474]">
        Loading your dashboard…
      </div>
    );
  }

  if (loadError) {
    if ((loadErrorStatus ?? 0) >= 500) {
      return <StatusPage type="server-error" onRetry={retryLoad} />;
    }
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F3EDE3] px-6 text-center">
        <p role="alert" className="max-w-lg text-sm text-[#641F2B]">
          Could not load your dashboard: {loadError}
        </p>
        <button
          type="button"
          onClick={retryLoad}
          className="rounded-lg bg-[#641F2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#48151F]"
        >
          Retry
        </button>
      </main>
    );
  }

  const handleOpenMpesaWithTenant = (tenantId: string) => {
    setMpesaPreselectedTenant(tenantId);
    setIsMpesaModalOpen(true);
  };

  const handleOpenGeneralMpesa = () => {
    setMpesaPreselectedTenant(undefined);
    setIsMpesaModalOpen(true);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#F3EDE3] text-[#252525]">
        {saveError && (
          <div
            role="alert"
            className="absolute right-4 top-4 z-50 max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 shadow-lg"
          >
            <p>Your latest dashboard changes could not be saved: {saveError}</p>
            <button
              type="button"
              onClick={retrySave}
              className="mt-2 font-semibold underline"
            >
              Retry save
            </button>
          </div>
        )}
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <Header
            currentTab={currentTab}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenMpesaModal={handleOpenGeneralMpesa}
            onOpenQuickPaymentModal={() => setIsQuickPaymentModalOpen(true)}
          />

          {/* Scrollable Main Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="mx-auto max-w-7xl">
              {currentTab === 'dashboard' && (
                <DashboardView
                  onOpenMpesaWithTenant={handleOpenMpesaWithTenant}
                  onNavigateToTab={setCurrentTab}
                />
              )}
              {currentTab === 'properties' && (
                <PropertiesView onNavigateToUnits={() => setCurrentTab('units')} />
              )}
              {currentTab === 'units' && <UnitsView />}
              {currentTab === 'tenants' && (
                <TenantsView onOpenMpesaWithTenant={handleOpenMpesaWithTenant} />
              )}
              {currentTab === 'payments' && (
                <PaymentsView
                  onOpenMpesaModal={handleOpenGeneralMpesa}
                  onOpenRecordPayment={() => setIsQuickPaymentModalOpen(true)}
                />
              )}
              {currentTab === 'mpesa' && (
                <MpesaView onOpenStkPushModal={handleOpenGeneralMpesa} />
              )}
              {currentTab === 'expenses' && <ExpensesView />}
              {currentTab === 'reports' && <ReportsView />}
              {currentTab === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>

        {/* Global Interactive Modals */}
        <MpesaModal
          isOpen={isMpesaModalOpen}
          onClose={() => setIsMpesaModalOpen(false)}
          preselectedTenantId={mpesaPreselectedTenant}
        />

        <RecordPaymentModal
          isOpen={isQuickPaymentModalOpen}
          onClose={() => setIsQuickPaymentModalOpen(false)}
        />
    </div>
  );
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (maintenanceMode) {
    return <StatusPage type="maintenance" />;
  }

  if (!import.meta.env.VITE_NEON_AUTH_URL) {
    return (
      <StatusPage
        type="server-error"
        message="Neon Auth is not configured. Set VITE_NEON_AUTH_URL to your branch Auth URL and restart the app."
      />
    );
  }

  if (!['/', '/sign-in', '/sign-up'].includes(path)) {
    return <StatusPage type="not-found" />;
  }

  return <AuthenticatedSession path={path} />;
}

const AuthenticatedSession: React.FC<{ path: string }> = ({ path }) => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EDE3] text-sm text-[#747474]">
        Loading your secure session…
      </div>
    );
  }

  if (!session?.user) {
    return path === '/sign-up' ? <SignUpView /> : <SignInView />;
  }

  return (
    <PropertyProvider>
      <AuthenticatedDashboard />
    </PropertyProvider>
  );
};
