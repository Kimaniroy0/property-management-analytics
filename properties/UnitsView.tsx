import React, { useState } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Users,
  X,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { Unit } from '../../types';

export const UnitsView: React.FC = () => {
  const { units, properties, tenants, addUnit, editUnit, deleteUnit } = useProperty();

  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'Occupied' | 'Vacant'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  // Add Form State
  const [newUnitId, setNewUnitId] = useState('');
  const [newPropertyId, setNewPropertyId] = useState(properties[0]?.id || '');
  const [newRent, setNewRent] = useState<number>(30000);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editRent, setEditRent] = useState<number>(30000);
  const [editPropertyId, setEditPropertyId] = useState('');

  // Filter units
  const filteredUnits = units.filter((u) => {
    const matchesSearch = u.id.toLowerCase().includes(search.toLowerCase());
    const matchesProp = propertyFilter === 'all' || u.propertyId === propertyFilter;
    const matchesOcc = occupancyFilter === 'all' || u.occupancyStatus === occupancyFilter;
    return matchesSearch && matchesProp && matchesOcc;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const res = addUnit({
      id: newUnitId,
      propertyId: newPropertyId,
      rentAmount: newRent,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setNewUnitId('');
      setNewRent(30000);
    } else {
      setFormError(res.message);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    editUnit(editingUnit.id, {
      rentAmount: editRent,
      propertyId: editPropertyId,
    });
    setEditingUnit(null);
  };

  const handleDeleteConfirm = () => {
    if (!unitToDelete) return;
    const res = deleteUnit(unitToDelete.id);
    if (!res.success) {
      alert(res.message);
    }
    setUnitToDelete(null);
  };

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setEditRent(unit.rentAmount);
    setEditPropertyId(unit.propertyId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header / Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            Unit Inventory Management (FR2)
          </h2>
          <p className="text-xs text-[#747474]">
            Manage unit records, assign rental amounts, and verify occupancy status
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Unit</span>
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
            placeholder="Search unit identifier (e.g. A-101)..."
            className="w-full rounded-lg border border-[#DED6C9] bg-white py-1.5 pl-9 pr-3 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-[#DED6C9] bg-white px-3 py-1.5 text-xs font-medium text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
          >
            <option value="all">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Occupancy Filter */}
          <div className="flex rounded-lg border border-[#DED6C9] bg-white p-0.5">
            <button
              onClick={() => setOccupancyFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                occupancyFilter === 'all'
                  ? 'bg-[#172A3A] text-white'
                  : 'text-[#747474] hover:text-[#252525]'
              }`}
            >
              All ({units.length})
            </button>
            <button
              onClick={() => setOccupancyFilter('Occupied')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                occupancyFilter === 'Occupied'
                  ? 'bg-[#164A3A] text-white'
                  : 'text-[#747474] hover:text-[#252525]'
              }`}
            >
              Occupied ({units.filter((u) => u.occupancyStatus === 'Occupied').length})
            </button>
            <button
              onClick={() => setOccupancyFilter('Vacant')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                occupancyFilter === 'Vacant'
                  ? 'bg-[#641F2B] text-white'
                  : 'text-[#747474] hover:text-[#252525]'
              }`}
            >
              Vacant ({units.filter((u) => u.occupancyStatus === 'Vacant').length})
            </button>
          </div>
        </div>
      </div>

      {/* Unit Table */}
      <div className="overflow-hidden rounded-xl border border-[#DED6C9] bg-[#FAF8F3] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DED6C9] bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                <th className="py-3 px-4">Unit ID</th>
                <th className="py-3 px-4">Property Complex</th>
                <th className="py-3 px-4 text-right">Monthly Rent</th>
                <th className="py-3 px-4">Occupancy Status</th>
                <th className="py-3 px-4">Current Tenant</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-[#747474]">
                    No units found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  const property = properties.find((p) => p.id === unit.propertyId);
                  const tenant = tenants.find((t) => t.unitId === unit.id);
                  const isOccupied = unit.occupancyStatus === 'Occupied';

                  return (
                    <tr key={unit.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sm text-[#252525]">
                        {unit.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#252525]">{property?.name || 'Unassigned'}</div>
                        <div className="text-[11px] text-[#747474]">{property?.location}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                        KES {unit.rentAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {isOccupied ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#164A3A]">
                            <span className="h-2 w-2 rounded-full bg-[#164A3A]" />
                            <span>Occupied</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#B89A62]">
                            <span className="h-2 w-2 rounded-full bg-[#B89A62]" />
                            <span>Vacant</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {tenant ? (
                          <div>
                            <span className="font-semibold text-[#252525]">{tenant.name}</span>
                            <span className="block text-[11px] font-mono text-[#747474]">{tenant.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[#747474] italic">None (Ready to lease)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(unit)}
                            title="Edit Unit"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#747474] hover:bg-[#F3EDE3] hover:text-[#252525]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setUnitToDelete(unit)}
                            title="Delete Unit"
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

      {/* ADD UNIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#641F2B] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Add New Unit (FR2)</h3>
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
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Unique Unit Identifier (BR1)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-305 or B-301"
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-bold uppercase text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-[#747474]">Must be unique across the system.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Property Complex
                </label>
                <select
                  value={newPropertyId}
                  onChange={(e) => setNewPropertyId(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Monthly Rent (KES)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={newRent}
                  onChange={(e) => setNewRent(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-bold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
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
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UNIT MODAL */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Edit Unit {editingUnit.id}</h3>
              <button onClick={() => setEditingUnit(null)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Monthly Rent (KES)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={editRent}
                  onChange={(e) => setEditRent(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-bold text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Assigned Property
                </label>
                <select
                  value={editPropertyId}
                  onChange={(e) => setEditPropertyId(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
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

      {/* DELETE CONFIRMATION MODAL (Section 13) */}
      {unitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252525]">Delete Unit Confirmation</h3>
            </div>
            <p className="text-xs text-[#747474] leading-relaxed">
              Are you sure you want to delete unit <strong className="text-[#252525] font-mono">{unitToDelete.id}</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setUnitToDelete(null)}
                className="rounded-lg border border-[#DED6C9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
