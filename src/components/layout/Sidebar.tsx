import React from 'react';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  WalletCards,
  Receipt,
  FileBarChart,
  SlidersHorizontal,
  Smartphone,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { authClient } from '../../lib/auth';

export type NavigationTab =
  | 'dashboard'
  | 'properties'
  | 'units'
  | 'tenants'
  | 'payments'
  | 'expenses'
  | 'reports'
  | 'mpesa'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties' as const, label: 'Properties', icon: Building2 },
    { id: 'units' as const, label: 'Units', icon: DoorOpen },
    { id: 'tenants' as const, label: 'Tenants', icon: Users },
    { id: 'payments' as const, label: 'Rent Payments', icon: WalletCards },
    { id: 'mpesa' as const, label: 'M-Pesa Gateway', icon: Smartphone },
    { id: 'expenses' as const, label: 'Expenses', icon: Receipt },
    { id: 'reports' as const, label: 'Analytics Reports', icon: FileBarChart },
    { id: 'settings' as const, label: 'Settings', icon: SlidersHorizontal },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#172A3A] text-[#FAF8F3] transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-0 md:translate-x-0 max-md:-translate-x-full'
        } border-r border-[#172A3A]/60 shadow-xl md:shadow-none`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#641F2B] text-white shadow-sm ring-1 ring-white/10">
              <Building2 className="h-5 w-5 text-[#FAF8F3]" />
            </div>
            <div>
              <span className="block font-serif text-lg font-bold tracking-tight text-white leading-tight">
                ESTATE ANALYTICS
              </span>
              <span className="block text-[11px] font-medium tracking-wider text-[#B89A62] uppercase">
                Property Management
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-white/40 uppercase">
            Core Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-medium tracking-normal transition-all ${
                    isActive
                      ? 'bg-[#641F2B] text-white shadow-sm font-semibold'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#FAF8F3]' : 'text-white/60 group-hover:text-white'
                      }`}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Signed-in User Profile */}
        <div className="border-t border-white/10 p-4 bg-[#11202D]">
          <div className="flex items-center gap-3 min-w-0">
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#B89A62]/40 shrink-0"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#641F2B] text-sm font-semibold text-white">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || 'Account'}
              </p>
              <p className="truncate text-[11px] text-white/50">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
