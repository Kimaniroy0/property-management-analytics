import React, { useState } from 'react';
import {
  WalletCards,
  Search,
  Filter,
  Plus,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  FileText,
  ShieldCheck,
  Receipt,
  X,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { Payment } from '../../types';

interface PaymentsViewProps {
  onOpenMpesaModal: () => void;
  onOpenRecordPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenMpesaModal,
  onOpenRecordPayment,
}) => {
  const { payments, tenants, units, selectedMonth, setSelectedMonth, availableMonths, kpis } = useProperty();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);

  // Payments for selected month or filtered
  const filteredPayments = payments.filter((p) => {
    const tenant = tenants.find((t) => t.id === p.tenantId);
    const matchesSearch =
      (tenant?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      p.unitId.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(search.toLowerCase());

    const matchesMonth = p.month === selectedMonth;
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMonth && matchesMethod;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            Rent Payments & Collections Ledger (FR5)
          </h2>
          <p className="text-xs text-[#747474]">
            Audited transaction ledger for M-Pesa, bank deposits and manual remittances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMpesaModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#164A3A] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#216751]"
          >
            <Smartphone className="h-4 w-4" />
            <span>M-Pesa STK Push</span>
          </button>
          <button
            onClick={onOpenRecordPayment}
            className="inline-flex items-center gap-2 rounded-lg bg-[#641F2B] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F]"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747474]">
            Collected ({selectedMonth})
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#164A3A]">
            KES {kpis.rentCollected.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#747474]">
            {filteredPayments.length} transactions processed
          </span>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747474]">
            Outstanding Rent
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#641F2B]">
            KES {kpis.outstandingRent.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#747474]">
            {kpis.unpaidCount} tenants pending collection
          </span>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747474]">
            Collection Rate
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#252525]">
            {kpis.collectionRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-[#747474]">
            Of expected KES {kpis.expectedRent.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-[#747474]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant, unit, or transaction ref..."
            className="w-full rounded-lg border border-[#DED6C9] bg-white py-1.5 pl-9 pr-3 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#747474] font-medium">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#747474] font-medium">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
            >
              <option value="all">All Methods</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-[#DED6C9] bg-[#FAF8F3] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DED6C9] bg-[#F3EDE3]/70 text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Amount (KES)</th>
                <th className="py-3 px-4">Date Paid</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-[#747474]">
                    No payments found for {selectedMonth} matching your query.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const tenant = tenants.find((t) => t.id === p.tenantId);

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-[#252525]">
                        {p.transactionReference}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#252525]">{tenant?.name || 'Unknown'}</div>
                        <div className="text-[11px] font-mono text-[#747474]">{tenant?.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs text-[#252525] bg-[#FAF8F3] px-1.5 py-0.5 rounded border border-[#DED6C9]/60">
                          {p.unitId}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                        KES {p.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono text-[#252525]">
                        {p.paymentDate}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#172A3A]">
                          {p.paymentMethod === 'M-Pesa' && <Smartphone className="h-3 w-3 text-[#164A3A]" />}
                          <span>{p.paymentMethod}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[#164A3A]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>PAID</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPaymentDetail(p)}
                          className="inline-flex items-center gap-1 rounded border border-[#DED6C9] bg-white px-2 py-1 text-[11px] font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                        >
                          <Eye className="h-3 w-3 text-[#641F2B]" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT DETAIL MODAL (Section 23: Payment Detail Flow) */}
      {selectedPaymentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#B89A62]" />
                <h3 className="text-sm font-bold">Transaction Receipt Voucher</h3>
              </div>
              <button
                onClick={() => setSelectedPaymentDetail(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-[#DED6C9] bg-white p-4 space-y-2.5">
                <div className="flex justify-between border-b border-[#DED6C9]/40 pb-2">
                  <span className="text-[#747474]">Transaction Reference:</span>
                  <span className="font-mono font-bold text-[#252525]">
                    {selectedPaymentDetail.transactionReference}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#747474]">Tenant:</span>
                  <span className="font-semibold text-[#252525]">
                    {tenants.find((t) => t.id === selectedPaymentDetail.tenantId)?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#747474]">Unit ID:</span>
                  <span className="font-mono font-bold text-[#252525]">
                    {selectedPaymentDetail.unitId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#747474]">Payment Amount:</span>
                  <span className="font-mono font-bold text-base text-[#164A3A]">
                    KES {selectedPaymentDetail.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#747474]">Payment Date:</span>
                  <span className="font-mono text-[#252525]">
                    {selectedPaymentDetail.paymentDate}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#747474]">Payment Method:</span>
                  <span className="font-semibold text-[#252525]">
                    {selectedPaymentDetail.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between border-t border-[#DED6C9]/40 pt-2">
                  <span className="text-[#747474]">Ledger Status:</span>
                  <span className="font-bold text-[#164A3A]">CONFIRMED PAID</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedPaymentDetail(null)}
                  className="rounded-lg bg-[#172A3A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#11202D]"
                >
                  Close Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
