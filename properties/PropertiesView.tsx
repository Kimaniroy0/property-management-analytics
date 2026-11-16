import React, { useState } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  DoorOpen,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { Property } from '../../types';

interface PropertiesViewProps {
  onNavigateToUnits: () => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ onNavigateToUnits }) => {
  const { properties, units, addProperty, editProperty, deleteProperty } = useProperty();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProperty({ name, location, description });
    setIsAddModalOpen(false);
    setName('');
    setLocation('');
    setDescription('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    editProperty(editingProperty.id, {
      name: editingProperty.name,
      location: editingProperty.location,
      description: editingProperty.description,
    });
    setEditingProperty(null);
  };

  const handleDeleteConfirm = () => {
    if (!propertyToDelete) return;
    const res = deleteProperty(propertyToDelete.id);
    if (!res.success) {
      alert(res.message);
    }
    setPropertyToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            Managed Property Portfolio
          </h2>
          <p className="text-xs text-[#747474]">
            Comprehensive estate records, capacity utilization, and geographic locations
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((prop) => {
          const propUnits = units.filter((u) => u.propertyId === prop.id);
          const occupied = propUnits.filter((u) => u.occupancyStatus === 'Occupied').length;
          const occRate = propUnits.length > 0 ? ((occupied / propUnits.length) * 100).toFixed(1) : '0.0';
          const monthlyPotential = propUnits.reduce((sum, u) => sum + u.rentAmount, 0);

          return (
            <div
              key={prop.id}
              className="flex flex-col justify-between rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-2xs hover:border-[#641F2B]/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#641F2B] text-white">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#252525]">{prop.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-[#747474] mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-[#164A3A]" />
                        <span>{prop.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProperty(prop)}
                      title="Edit Property"
                      className="p-1.5 text-[#747474] hover:text-[#252525]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPropertyToDelete(prop)}
                      title="Delete Property"
                      className="p-1.5 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#747474] leading-relaxed">
                  {prop.description}
                </p>

                {/* Metrics */}
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white p-2.5 border border-[#DED6C9]/60">
                    <span className="block font-mono text-base font-bold text-[#252525] tabular-nums">
                      {propUnits.length}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#747474]">Total Units</span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-[#DED6C9]/60">
                    <span className="block font-mono text-base font-bold text-[#164A3A] tabular-nums">
                      {occupied}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#747474]">Occupied</span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-[#DED6C9]/60">
                    <span className="block font-mono text-base font-bold text-[#641F2B] tabular-nums">
                      {occRate}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#747474]">Occupancy</span>
                  </div>
                </div>
              </div>

              {/* Bottom Details & Action */}
              <div className="mt-6 border-t border-[#DED6C9]/60 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#747474]">Monthly Rent Potential:</span>
                  <span className="font-mono font-bold text-xs text-[#252525] ml-1">
                    KES {monthlyPotential.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={onNavigateToUnits}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#641F2B] hover:underline"
                >
                  <span>Manage Units</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD PROPERTY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#641F2B] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Add Managed Property</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kilimani Heights"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Location Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dennis Pritt Rd, Kilimani, Nairobi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Executive 2-bedroom serviced apartments with backup solar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
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
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Edit Property</h3>
              <button onClick={() => setEditingProperty(null)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProperty.name}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={editingProperty.location}
                  onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProperty.description}
                  onChange={(e) =>
                    setEditingProperty({ ...editingProperty, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
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

      {/* DELETE CONFIRMATION */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-xl">
            <h3 className="text-sm font-bold text-[#252525] mb-2">Delete Property</h3>
            <p className="text-xs text-[#747474] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#252525]">{propertyToDelete.name}</strong>?
              Properties with existing units cannot be deleted.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setPropertyToDelete(null)}
                className="rounded-lg border border-[#DED6C9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
