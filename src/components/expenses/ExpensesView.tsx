import React, { useState } from 'react';
import {
  Receipt,
  Wrench,
  Building,
  Plus,
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { MaintenanceExpense, GeneralExpense, ExpenseCategory } from '../../types';

export const ExpensesView: React.FC = () => {
  const {
    maintenanceExpenses,
    generalExpenses,
    units,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    addMaintenanceExpense,
    editMaintenanceExpense,
    deleteMaintenanceExpense,
    addGeneralExpense,
    editGeneralExpense,
    deleteGeneralExpense,
    kpis,
  } = useProperty();

  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'general'>('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddMaintOpen, setIsAddMaintOpen] = useState(false);
  const [isAddGenOpen, setIsAddGenOpen] = useState(false);

  // Maintenance Form State
  const [maintUnitId, setMaintUnitId] = useState(units[0]?.id || '');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState<number>(5000);
  const [maintDate, setMaintDate] = useState(`${selectedMonth}-08`);

  // General Expense Form State
  const [genCategory, setGenCategory] = useState<ExpenseCategory>('Security');
  const [genDesc, setGenDesc] = useState('');
  const [genAmount, setGenAmount] = useState<number>(15000);
  const [genDate, setGenDate] = useState(`${selectedMonth}-02`);

  // Filtering for active month
  const monthMaint = maintenanceExpenses.filter((m) => m.month === selectedMonth);
  const monthGen = generalExpenses.filter((g) => g.month === selectedMonth);

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceExpense({
      unitId: maintUnitId,
      description: maintDesc,
      cost: maintCost,
      date: maintDate,
    });
    setIsAddMaintOpen(false);
    setMaintDesc('');
    setMaintCost(5000);
  };

  const handleAddGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    addGeneralExpense({
      category: genCategory,
      description: genDesc,
      amount: genAmount,
      date: genDate,
    });
    setIsAddGenOpen(false);
    setGenDesc('');
    setGenAmount(15000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            Operating Expenses & Maintenance (FR7 & FR8)
          </h2>
          <p className="text-xs text-[#747474]">
            Record unit-level maintenance and recurring property operational overheads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMaintDate(`${selectedMonth}-08`);
              setIsAddMaintOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#172A3A] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#11202D]"
          >
            <Wrench className="h-4 w-4" />
            <span>Add Maintenance</span>
          </button>
          <button
            onClick={() => {
              setGenDate(`${selectedMonth}-02`);
              setIsAddGenOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F]"
          >
            <Plus className="h-4 w-4" />
            <span>Add General Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747474]">
            Total Expenses ({selectedMonth})
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#641F2B]">
            KES {kpis.totalExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#747474]">Maintenance + General Combined</span>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747474]">
            Maintenance Repairs (FR7)
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#172A3A]">
            KES {kpis.maintenanceExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#747474]">{monthMaint.length} repair tickets</span>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747474]">
            General Overhead (FR8)
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#B89A62]">
            KES {kpis.generalExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#747474]">{monthGen.length} expense items</span>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4 shadow-2xs">
        <div className="flex rounded-lg border border-[#DED6C9] bg-white p-0.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            All Expenses ({monthMaint.length + monthGen.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'maintenance'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Maintenance Only ({monthMaint.length})
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'general'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            General Overhead ({monthGen.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#747474]">Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-[#DED6C9] bg-white px-3 py-1.5 text-xs font-semibold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Table Section */}
      {(activeTab === 'all' || activeTab === 'maintenance') && (
        <div className="overflow-hidden rounded-xl border border-[#DED6C9] bg-[#FAF8F3] shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#F3EDE3]/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#172A3A]" />
              <h3 className="text-xs font-bold text-[#252525] uppercase tracking-wider">
                Unit Maintenance Log (FR7)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#172A3A]">
              KES {kpis.maintenanceExpenses.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DED6C9] text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Unit</th>
                  <th className="py-2.5 px-4">Repair Description</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Cost (KES)</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
                {monthMaint.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#747474]">
                      No maintenance repairs recorded for {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  monthMaint.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#252525]">{m.unitId}</td>
                      <td className="py-3 px-4 text-[#252525] font-medium">{m.description}</td>
                      <td className="py-3 px-4 font-mono text-[#747474]">{m.date}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                        KES {m.cost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteMaintenanceExpense(m.id)}
                          title="Delete Record"
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* General Expenses Table Section */}
      {(activeTab === 'all' || activeTab === 'general') && (
        <div className="overflow-hidden rounded-xl border border-[#DED6C9] bg-[#FAF8F3] shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#F3EDE3]/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-[#B89A62]" />
              <h3 className="text-xs font-bold text-[#252525] uppercase tracking-wider">
                General Property Overhead (FR8)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#641F2B]">
              KES {kpis.generalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DED6C9] text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Amount (KES)</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
                {monthGen.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#747474]">
                      No general expenses recorded for {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  monthGen.map((g) => (
                    <tr key={g.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#172A3A] bg-[#172A3A]/10 px-2 py-0.5 rounded text-[11px]">
                          {g.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#252525] font-medium">{g.description}</td>
                      <td className="py-3 px-4 font-mono text-[#747474]">{g.date}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                        KES {g.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteGeneralExpense(g.id)}
                          title="Delete Record"
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD MAINTENANCE MODAL */}
      {isAddMaintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Log Maintenance Expense (FR7)</h3>
              <button onClick={() => setIsAddMaintOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Target Unit
                </label>
                <select
                  value={maintUnitId}
                  onChange={(e) => setMaintUnitId(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Repair Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plumbing repair - replaced faulty basin tap"
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Cost (KES)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={maintCost}
                    onChange={(e) => setMaintCost(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-bold text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#172A3A] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
                <button
                  type="button"
                  onClick={() => setIsAddMaintOpen(false)}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#172A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#11202D]"
                >
                  Save Maintenance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GENERAL EXPENSE MODAL */}
      {isAddGenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#641F2B] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Log General Expense (FR8)</h3>
              <button onClick={() => setIsAddGenOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddGeneral} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Category
                </label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                >
                  <option value="Security">Security</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Administration">Administration</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Repairs / Other">Repairs / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly guard services & patrol"
                  value={genDesc}
                  onChange={(e) => setGenDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={genAmount}
                    onChange={(e) => setGenAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-bold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={genDate}
                    onChange={(e) => setGenDate(e.target.value)}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
                <button
                  type="button"
                  onClick={() => setIsAddGenOpen(false)}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#641F2B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F]"
                >
                  Save General Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
