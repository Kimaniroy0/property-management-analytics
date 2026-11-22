import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  DoorOpen,
  Calendar,
  WalletCards,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Smartphone,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { Tenant } from '../../types';

interface TenantsViewProps {
  onOpenMpesaWithTenant: (tenantId: string) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({ onOpenMpesaWithTenant }) => {
  const {
    tenants,
    units,
    payments,
    addTenant,
    editTenant,
    deleteTenant,
    getTenantMonthStatus,
    selectedMonth,
  } = useProperty();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedDetailTenant, setSelectedDetailTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Add Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+254 ');
  const [email, setEmail] = useState('');
  const [unitId, setUnitId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Available units for new tenant: vacant units or all units
  const vacantUnits = units.filter((u) => u.occupancyStatus === 'Vacant');

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.unitId.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const status = getTenantMonthStatus(t.id).status;
    if (statusFilter === 'paid') return status === 'PAID';
    if (statusFilter === 'unpaid') return status === 'UNPAID';
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!unitId) {
      setFormError('Please select a unit to assign to the tenant (FR3).');
      return;
    }

    const res = addTenant({
      name,
      phone,
      email,
      unitId,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setName('');
      setPhone('+254 ');
      setEmail('');
      setUnitId('');
    } else {
      setFormError(res.message);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const res = editTenant(editingTenant.id, {
      name: editingTenant.name,
      phone: editingTenant.phone,
      email: editingTenant.email,
      unitId: editingTenant.unitId,
    });

    if (res.success) {
      setEditingTenant(null);
    } else {
      alert(res.message);
    }
  };

  const handleDeleteConfirm = () => {
    if (!tenantToDelete) return;
    deleteTenant(tenantToDelete.id);
    setTenantToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            Tenant Management & Assignments (FR3)
          </h2>
          <p className="text-xs text-[#747474]">
            Register tenants, assign to units, and monitor month-to-month payment compliance
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setUnitId(vacantUnits[0]?.id || units[0]?.id || '');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Tenant</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-[#747474]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, unit..."
            className="w-full rounded-lg border border-[#DED6C9] bg-white py-1.5 pl-9 pr-3 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
          />
        </div>

        {/* Status Filter */}
        <div className="flex rounded-lg border border-[#DED6C9] bg-white p-0.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            All Tenants ({tenants.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'paid'
                ? 'bg-[#164A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'unpaid'
                ? 'bg-[#641F2B] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-xl border border-[#DED6C9] bg-[#FAF8F3] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DED6C9] bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                <th className="py-3 px-4">Tenant Info</th>
                <th className="py-3 px-4">Assigned Unit</th>
                <th className="py-3 px-4 text-right">Rent Amount</th>
                <th className="py-3 px-4">Status ({selectedMonth})</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#747474]">
                    No tenants match your current search.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const unit = units.find((u) => u.id === t.unitId);
                  const statusInfo = getTenantMonthStatus(t.id);
                  const isPaid = statusInfo.status === 'PAID';

                  return (
                    <tr key={t.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[#252525]">{t.name}</div>
                        <div className="flex items-center gap-3 text-[11px] text-[#747474] mt-0.5">
                          <span className="font-mono">{t.phone}</span>
                          <span>·</span>
                          <span>{t.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sm text-[#252525] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#DED6C9]/60">
                          {t.unitId}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                        KES {unit?.rentAmount.toLocaleString() || '—'}
                      </td>

                      <td className="py-3 px-4">
                        {isPaid ? (
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

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => onOpenMpesaWithTenant(t.id)}
                              className="inline-flex items-center gap-1 rounded bg-[#164A3A] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#216751]"
                              title="Trigger M-Pesa STK push for this tenant"
                            >
                              <Smartphone className="h-3 w-3" />
                              <span>M-Pesa</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedDetailTenant(t)}
                            title="View Tenant Details"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#747474] hover:bg-[#F3EDE3] hover:text-[#252525]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTenant(t)}
                            title="Edit Tenant"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#747474] hover:bg-[#F3EDE3] hover:text-[#252525]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setTenantToDelete(t)}
                            title="Delete Tenant"
                            className="flex h-7 w-7 items-center justify-center rounded text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD TENANT MODAL (FR3 & BR2: Exactly one unit) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#641F2B] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Add Tenant & Assign Unit (FR3)</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Mutua"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+254 7..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tenant@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Assign to Unit (BR2: Exactly one unit)
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-semibold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                >
                  <option value="">-- Select Available Unit --</option>
                  {vacantUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.id} (KES {u.rentAmount.toLocaleString()}/mo) · Currently Vacant
                    </option>
                  ))}
                  {units
                    .filter((u) => u.occupancyStatus === 'Occupied')
                    .map((u) => (
                      <option key={u.id} value={u.id} disabled>
                        Unit {u.id} · Already Occupied
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-[11px] text-[#747474]">
                  Unit will automatically transition to Occupied status upon assignment (BR3).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#641F2B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F]"
                >
                  Register Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TENANT MODAL */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Edit Tenant Information</h3>
              <button onClick={() => setEditingTenant(null)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Tenant Name
                </label>
                <input
                  type="text"
                  required
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTenant.phone}
                    onChange={(e) => setEditingTenant({ ...editingTenant, phone: e.target.value })}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingTenant.email}
                    onChange={(e) => setEditingTenant({ ...editingTenant, email: e.target.value })}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Reassign Unit
                </label>
                <select
                  value={editingTenant.unitId}
                  onChange={(e) => setEditingTenant({ ...editingTenant, unitId: e.target.value })}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-semibold text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                >
                  <option value={editingTenant.unitId}>
                    Current Unit: {editingTenant.unitId}
                  </option>
                  {vacantUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.id} (KES {u.rentAmount.toLocaleString()}/mo) · Vacant
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#172A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#11202D]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TENANT DETAIL MODAL (Section 17: Tenant Detail Flow) */}
      {selectedDetailTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
              <div>
                <h3 className="text-sm font-bold">{selectedDetailTenant.name}</h3>
                <p className="text-[11px] text-white/60">Tenant Record & Ledger Profile</p>
              </div>
              <button
                onClick={() => setSelectedDetailTenant(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3 border border-[#DED6C9]/60">
                  <span className="text-[#747474] block text-[11px]">Assigned Unit</span>
                  <span className="font-mono font-bold text-base text-[#252525]">
                    {selectedDetailTenant.unitId}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-[#DED6C9]/60">
                  <span className="text-[#747474] block text-[11px]">Monthly Rent</span>
                  <span className="font-mono font-bold text-base text-[#252525]">
                    KES{' '}
                    {units
                      .find((u) => u.id === selectedDetailTenant.unitId)
                      ?.rentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-[#DED6C9]/60">
                  <span className="text-[#747474] block text-[11px]">Contact Phone</span>
                  <span className="font-mono font-semibold text-[#252525]">
                    {selectedDetailTenant.phone}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-[#DED6C9]/60">
                  <span className="text-[#747474] block text-[11px]">Status ({selectedMonth})</span>
                  <span
                    className={`font-bold ${
                      getTenantMonthStatus(selectedDetailTenant.id).status === 'PAID'
                        ? 'text-[#164A3A]'
                        : 'text-[#641F2B]'
                    }`}
                  >
                    {getTenantMonthStatus(selectedDetailTenant.id).status}
                  </span>
                </div>
              </div>

              {/* Payment History for this Tenant */}
              <div>
                <h4 className="text-xs font-bold text-[#252525] mb-2">Historical Rent Payments</h4>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-[#DED6C9] bg-white divide-y divide-[#DED6C9]/40 text-xs">
                  {payments.filter((p) => p.tenantId === selectedDetailTenant.id).length === 0 ? (
                    <div className="p-4 text-center text-[#747474] text-xs">
                      No payments on file for this tenant.
                    </div>
                  ) : (
                    payments
                      .filter((p) => p.tenantId === selectedDetailTenant.id)
                      .map((p) => (
                        <div key={p.id} className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-semibold text-[#252525]">
                              KES {p.amount.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-[#747474] ml-2">({p.paymentMethod})</span>
                            <span className="block text-[10px] font-mono text-[#747474]">
                              {p.transactionReference} · {p.paymentDate}
                            </span>
                          </div>
                          <span className="font-semibold text-emerald-800 text-[11px]">Paid</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DED6C9]/60">
                {getTenantMonthStatus(selectedDetailTenant.id).status === 'UNPAID' && (
                  <button
                    onClick={() => {
                      const tId = selectedDetailTenant.id;
                      setSelectedDetailTenant(null);
                      onOpenMpesaWithTenant(tId);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#164A3A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#216751]"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Initiate M-Pesa Payment</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedDetailTenant(null)}
                  className="rounded-lg bg-[#172A3A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#11202D]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-xl">
            <h3 className="text-sm font-bold text-[#252525] mb-2">Remove Tenant</h3>
            <p className="text-xs text-[#747474] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#252525]">{tenantToDelete.name}</strong>?
              Unit <strong className="font-mono text-[#252525]">{tenantToDelete.unitId}</strong> will become vacant.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setTenantToDelete(null)}
                className="rounded-lg border border-[#DED6C9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
