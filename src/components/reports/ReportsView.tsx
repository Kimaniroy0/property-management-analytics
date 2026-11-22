import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  DollarSign,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

export const ReportsView: React.FC = () => {
  const {
    kpis,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    properties,
    units,
    tenants,
    payments,
    maintenanceExpenses,
    generalExpenses,
    getTenantMonthStatus,
  } = useProperty();

  const [activeReportTab, setActiveReportTab] = useState<'occupancy' | 'collection' | 'expenses' | 'profitability'>('profitability');

  // Month date formatting
  const [year, monthNum] = selectedMonth.split('-');
  const monthDate = new Date(Number(year), Number(monthNum) - 1, 1);
  const formattedMonth = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Categorized expenses for selected month
  const categories = [
    'Security',
    'Cleaning',
    'Utilities',
    'Administration',
    'Insurance',
    'Supplies',
    'Repairs / Other',
  ] as const;

  const categoryExpenses = categories.map((cat) => {
    const total = generalExpenses
      .filter((g) => g.month === selectedMonth && g.category === cat)
      .reduce((sum, g) => sum + g.amount, 0);
    return { category: cat, total };
  });

  // Export CSV handler
  const handleExportCSV = () => {
    let csvContent = `ESTATE ANALYTICS - PROPERTY MANAGEMENT REPORT\n`;
    csvContent += `Report Period: ${formattedMonth} (${selectedMonth})\n`;
    csvContent += `Generated On: ${new Date().toISOString()}\n\n`;

    if (activeReportTab === 'profitability') {
      csvContent += `FINANCIAL PROFITABILITY STATEMENT\n`;
      csvContent += `Line Item,Amount (KES)\n`;
      csvContent += `Gross Rent Collected,${kpis.rentCollected}\n`;
      csvContent += `Maintenance Expenses,-${kpis.maintenanceExpenses}\n`;
      csvContent += `General Operating Expenses,-${kpis.generalExpenses}\n`;
      csvContent += `Total Operating Expenses,-${kpis.totalExpenses}\n`;
      csvContent += `Net Operating Income (NOI),${kpis.netIncome}\n`;
      csvContent += `Profit Margin %,${((kpis.netIncome / (kpis.rentCollected || 1)) * 100).toFixed(1)}%\n`;
    } else if (activeReportTab === 'collection') {
      csvContent += `RENT COLLECTION STATEMENT\n`;
      csvContent += `Tenant Name,Unit,Monthly Rent,Status,Payment Ref,Payment Date\n`;
      tenants.forEach((t) => {
        const u = units.find((item) => item.id === t.unitId);
        const statusInfo = getTenantMonthStatus(t.id);
        csvContent += `"${t.name}","${t.unitId}",${u?.rentAmount || 0},"${statusInfo.status}","${statusInfo.payment?.transactionReference || ''}","${statusInfo.payment?.paymentDate || ''}"\n`;
      });
    } else if (activeReportTab === 'occupancy') {
      csvContent += `OCCUPANCY REPORT\n`;
      csvContent += `Total Units: ${kpis.totalUnits}\n`;
      csvContent += `Occupied Units: ${kpis.occupiedUnits}\n`;
      csvContent += `Vacant Units: ${kpis.vacantUnits}\n`;
      csvContent += `Occupancy Rate: ${kpis.occupancyRate.toFixed(1)}%\n\n`;
      csvContent += `Unit ID,Property,Monthly Rent,Occupancy Status\n`;
      units.forEach((u) => {
        const p = properties.find((item) => item.id === u.propertyId);
        csvContent += `"${u.id}","${p?.name || ''}",${u.rentAmount},"${u.occupancyStatus}"\n`;
      });
    } else {
      csvContent += `EXPENSES BREAKDOWN\n`;
      csvContent += `Category / Unit,Description,Cost/Amount (KES),Date\n`;
      maintenanceExpenses
        .filter((m) => m.month === selectedMonth)
        .forEach((m) => {
          csvContent += `"Maintenance: Unit ${m.unitId}","${m.description}",${m.cost},"${m.date}"\n`;
        });
      generalExpenses
        .filter((g) => g.month === selectedMonth)
        .forEach((g) => {
          csvContent += `"${g.category}","${g.description}",${g.amount},"${g.date}"\n`;
        });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Property_Report_${activeReportTab}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            Executive Financial & Occupancy Reports
          </h2>
          <p className="text-xs text-[#747474]">
            Exportable performance statements, rent collection audits, and profitability analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-[#DED6C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#252525] shadow-2xs hover:bg-[#F3EDE3] transition-colors"
          >
            <Printer className="h-4 w-4 text-[#747474]" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F] transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Switcher & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4 shadow-2xs">
        <div className="flex flex-wrap rounded-lg border border-[#DED6C9] bg-white p-0.5">
          <button
            onClick={() => setActiveReportTab('profitability')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'profitability'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Profitability Statement
          </button>
          <button
            onClick={() => setActiveReportTab('collection')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'collection'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Rent Collection Audit
          </button>
          <button
            onClick={() => setActiveReportTab('occupancy')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'occupancy'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Occupancy Analysis
          </button>
          <button
            onClick={() => setActiveReportTab('expenses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'expenses'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#747474] hover:text-[#252525]'
            }`}
          >
            Operating Expenses Breakdown
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[#641F2B]" />
          <span className="text-xs text-[#747474] font-medium">Reporting Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1 text-xs font-semibold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REPORT CONTENT SHEETS */}

      {/* 1. PROFITABILITY STATEMENT (FR9 & PRD Report 4) */}
      {activeReportTab === 'profitability' && (
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#DED6C9] pb-4">
            <h3 className="text-base font-bold text-[#252525]">
              Net Operating Income (NOI) Statement · {formattedMonth}
            </h3>
            <p className="text-xs text-[#747474]">
              Formula: Net Income = Rent Collected − (Maintenance Expenses + General Expenses)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase">
                <tr>
                  <th className="py-3 px-4">Financial Item</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Amount (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#164A3A]">Gross Rent Collected (M-Pesa & Bank)</td>
                  <td className="py-3.5 px-4 text-[#747474]">Operating Revenue</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#164A3A] tabular-nums">
                    + KES {kpis.rentCollected.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-[#252525] pl-8">Less: Unit Maintenance Repairs</td>
                  <td className="py-3 px-4 text-[#747474]">Direct Property Expense (FR7)</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#641F2B] tabular-nums">
                    − KES {kpis.maintenanceExpenses.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-[#252525] pl-8">Less: General Overheads (Security, Utilities...)</td>
                  <td className="py-3 px-4 text-[#747474]">Administrative Expense (FR8)</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#641F2B] tabular-nums">
                    − KES {kpis.generalExpenses.toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-[#F3EDE3]/40">
                  <td className="py-3 px-4 font-bold text-[#252525]">Total Operating Expenses</td>
                  <td className="py-3 px-4 text-[#747474]">Combined Outflows</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#641F2B] tabular-nums">
                    − KES {kpis.totalExpenses.toLocaleString()}
                  </td>
                </tr>

                <tr className="border-t-2 border-[#172A3A] bg-[#FAF8F3]">
                  <td className="py-4 px-4 font-extrabold text-sm text-[#172A3A]">
                    NET OPERATING INCOME (NOI)
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#172A3A]">
                    Profit Margin: {((kpis.netIncome / (kpis.rentCollected || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-extrabold text-base text-[#164A3A] tabular-nums">
                    KES {kpis.netIncome.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. RENT COLLECTION STATEMENT (PRD Report 2) */}
      {activeReportTab === 'collection' && (
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#DED6C9] pb-4">
            <h3 className="text-base font-bold text-[#252525]">
              Rent Collection & Default Audit · {formattedMonth}
            </h3>
            <p className="text-xs text-[#747474]">
              Expected Rent: KES {kpis.expectedRent.toLocaleString()} · Outstanding: KES {kpis.outstandingRent.toLocaleString()}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase">
                <tr>
                  <th className="py-3 px-4">Tenant Name</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Expected Rent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
                {tenants.map((t) => {
                  const u = units.find((item) => item.id === t.unitId);
                  const statusInfo = getTenantMonthStatus(t.id);
                  const isPaid = statusInfo.status === 'PAID';

                  return (
                    <tr key={t.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#252525]">{t.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#252525]">{t.unitId}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                        KES {u?.rentAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="font-bold text-[#164A3A]">PAID</span>
                        ) : (
                          <span className="font-bold text-[#641F2B]">UNPAID</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#747474]">
                        {statusInfo.payment?.transactionReference || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#747474]">
                        {statusInfo.payment?.paymentDate || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. OCCUPANCY ANALYSIS (PRD Report 1) */}
      {activeReportTab === 'occupancy' && (
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#DED6C9] pb-4">
            <h3 className="text-base font-bold text-[#252525]">
              Capacity & Occupancy Audit · {formattedMonth}
            </h3>
            <p className="text-xs text-[#747474]">
              Portfolio occupancy calculated to 1 decimal place: {kpis.occupancyRate.toFixed(1)}% (FR4)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg bg-white p-4 border border-[#DED6C9]/60">
              <span className="text-[11px] font-bold uppercase text-[#747474]">Total Units</span>
              <div className="mt-1 font-mono text-2xl font-bold text-[#252525]">{kpis.totalUnits}</div>
            </div>
            <div className="rounded-lg bg-white p-4 border border-[#DED6C9]/60">
              <span className="text-[11px] font-bold uppercase text-[#747474]">Occupied Units</span>
              <div className="mt-1 font-mono text-2xl font-bold text-[#164A3A]">{kpis.occupiedUnits}</div>
            </div>
            <div className="rounded-lg bg-white p-4 border border-[#DED6C9]/60">
              <span className="text-[11px] font-bold uppercase text-[#747474]">Vacant Units</span>
              <div className="mt-1 font-mono text-2xl font-bold text-[#641F2B]">{kpis.vacantUnits}</div>
            </div>
            <div className="rounded-lg bg-white p-4 border border-[#DED6C9]/60">
              <span className="text-[11px] font-bold uppercase text-[#747474]">Occupancy Rate</span>
              <div className="mt-1 font-mono text-2xl font-bold text-[#172A3A]">{kpis.occupancyRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase">
                <tr>
                  <th className="py-3 px-4">Property Complex</th>
                  <th className="py-3 px-4 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Occupied</th>
                  <th className="py-3 px-4 text-right">Vacant</th>
                  <th className="py-3 px-4 text-right">Occupancy %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
                {properties.map((p) => {
                  const pUnits = units.filter((u) => u.propertyId === p.id);
                  const pOcc = pUnits.filter((u) => u.occupancyStatus === 'Occupied').length;
                  const pVac = pUnits.length - pOcc;
                  const pRate = pUnits.length > 0 ? ((pOcc / pUnits.length) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#252525]">{p.name}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#252525]">{pUnits.length}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#164A3A]">{pOcc}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#641F2B]">{pVac}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525]">{pRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EXPENSES BREAKDOWN (PRD Report 3) */}
      {activeReportTab === 'expenses' && (
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#DED6C9] pb-4">
            <h3 className="text-base font-bold text-[#252525]">
              Operating Expenses Category Breakdown · {formattedMonth}
            </h3>
            <p className="text-xs text-[#747474]">
              Total Outflows: KES {kpis.totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase">
                <tr>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Amount (KES)</th>
                  <th className="py-3 px-4 text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#172A3A]">Unit Maintenance & Repairs</td>
                  <td className="py-3 px-4 text-[#747474]">Structural & Plumbing Fixes</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                    KES {kpis.maintenanceExpenses.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#747474]">
                    {kpis.totalExpenses > 0
                      ? ((kpis.maintenanceExpenses / kpis.totalExpenses) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                </tr>

                {categoryExpenses.map((cat) => (
                  <tr key={cat.category} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#252525]">{cat.category}</td>
                    <td className="py-3 px-4 text-[#747474]">General Overhead</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                      KES {cat.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#747474]">
                      {kpis.totalExpenses > 0
                        ? ((cat.total / kpis.totalExpenses) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </td>
                  </tr>
                ))}

                <tr className="bg-[#F3EDE3]/70 border-t-2 border-[#172A3A]">
                  <td className="py-3.5 px-4 font-extrabold text-sm text-[#252525]">Total Operating Expenses</td>
                  <td className="py-3.5 px-4 font-bold text-[#252525]">All Categories</td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm text-[#641F2B] tabular-nums">
                    KES {kpis.totalExpenses.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#252525]">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
