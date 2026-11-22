import React, { useState } from 'react';
import { X, WalletCards, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTenantId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultTenantId,
}) => {
  const { tenants, units, recordPayment, selectedMonth } = useProperty();

  const [tenantId, setTenantId] = useState(defaultTenantId || tenants[0]?.id || '');
  const selectedTenant = tenants.find((t) => t.id === tenantId);
  const selectedUnit = units.find((u) => u.id === selectedTenant?.unitId);

  const [amount, setAmount] = useState<number>(selectedUnit?.rentAmount || 30000);
  const [paymentDate, setPaymentDate] = useState<string>(
    `${selectedMonth}-05`
  );
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank Transfer' | 'Cash'>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTenantChange = (id: string) => {
    setTenantId(id);
    const t = tenants.find((item) => item.id === id);
    if (t) {
      const u = units.find((unitItem) => unitItem.id === t.unitId);
      if (u) {
        setAmount(u.rentAmount);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = recordPayment({
      tenantId,
      amount,
      paymentDate,
      paymentMethod,
      transactionReference: transactionRef || undefined,
      notes,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#641F2B] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <WalletCards className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Record Rent Payment (FR5)</h3>
              <p className="text-[11px] text-white/70">Manual entry for M-Pesa, Bank Transfer, or Cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {feedback && (
            <div
              className={`mb-4 flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">
                Select Tenant & Unit
              </label>
              <select
                value={tenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — Unit {t.unitId}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-semibold text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] focus:border-[#641F2B] focus:outline-hidden"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Reference / Slip No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. TX-9823101"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono text-[#252525] placeholder:text-[#747474]/50 focus:border-[#641F2B] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">
                Notes / Memo (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared full rent for the month"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs text-[#252525] placeholder:text-[#747474]/50 focus:border-[#641F2B] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED6C9]/60">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#641F2B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#48151F]"
              >
                Save Payment Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
