import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Send, ArrowRight } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTenantId?: string;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onClose,
  preselectedTenantId,
}) => {
  const { tenants, units, simulateMpesaCallback, getTenantMonthStatus, selectedMonth } = useProperty();

  // Find unpaid tenants first
  const unpaidTenants = tenants.filter((t) => getTenantMonthStatus(t.id).status === 'UNPAID');

  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    preselectedTenantId || (unpaidTenants.length > 0 ? unpaidTenants[0].id : tenants[0]?.id || '')
  );

  const tenant = tenants.find((t) => t.id === selectedTenantId);
  const unit = units.find((u) => u.id === tenant?.unitId);

  const [phone, setPhone] = useState(tenant?.phone || '+254 712 345 678');
  const [amount, setAmount] = useState<number>(unit?.rentAmount || 30000);
  const [customRef, setCustomRef] = useState<string>('');
  const [step, setStep] = useState<'initiate' | 'phone_prompt' | 'processing' | 'result'>('initiate');
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; ref?: string } | null>(null);

  // Sync phone & amount when tenant changes
  const handleTenantChange = (tId: string) => {
    setSelectedTenantId(tId);
    const selTenant = tenants.find((t) => t.id === tId);
    if (selTenant) {
      setPhone(selTenant.phone);
      const selUnit = units.find((u) => u.id === selTenant.unitId);
      if (selUnit) {
        setAmount(selUnit.rentAmount);
      }
    }
  };

  const handleSendStkPush = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('phone_prompt');
    setPin('');
  };

  const handleAuthorizeOnPhone = () => {
    setStep('processing');
    setTimeout(() => {
      const res = simulateMpesaCallback({
        phone,
        amount,
        tenantId: selectedTenantId,
        customRef: customRef.trim() ? customRef.trim() : undefined,
      });
      setResult(res);
      setStep('result');
    }, 900);
  };

  const handleCancelOnPhone = () => {
    setResult({
      success: false,
      message: 'Request cancelled by customer on mobile handset (ResultCode: 1032 Request Cancelled).',
    });
    setStep('result');
  };

  const handleReset = () => {
    setStep('initiate');
    setResult(null);
    setPin('');
    setCustomRef('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DED6C9] bg-[#172A3A] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#164A3A] text-white">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">M-Pesa STK Push Gateway</h3>
              <p className="text-[11px] text-white/60">Daraja API 2.0 Webhook Simulator (FR11 & FR12)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {step === 'initiate' && (
            <form onSubmit={handleSendStkPush} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1">
                  Target Tenant
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
                >
                  {tenants.map((t) => {
                    const status = getTenantMonthStatus(t.id).status;
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} (Unit {t.unitId}) · {status === 'PAID' ? 'Already Paid' : 'UNPAID for ' + selectedMonth}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252525] mb-1">
                    M-Pesa Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
                  />
                </div>
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
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-semibold text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Advanced Test Ref for Deduplication Check (BR9) */}
              <div className="rounded-lg border border-[#DED6C9] bg-white/60 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#252525]">
                    Custom Transaction Ref (Optional)
                  </label>
                  <span className="text-[10px] text-[#747474]">BR9 Test</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. MPESA-QKD98231 (Try this to test duplicate rejection)"
                  value={customRef}
                  onChange={(e) => setCustomRef(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#DED6C9] bg-white px-2.5 py-1.5 text-[11px] font-mono text-[#252525] placeholder:text-[#747474]/50 focus:border-[#164A3A] focus:outline-hidden"
                />
                <p className="mt-1 text-[10px] text-[#747474]">
                  Leave blank to auto-generate a fresh Safaricom receipt code.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#164A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#216751]"
                >
                  <span>Initiate STK Push</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === 'phone_prompt' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs font-medium text-[#747474]">Simulated Tenant Handset</p>
                <p className="text-xs text-[#252525] font-semibold">STK Push delivered to {phone}</p>
              </div>

              {/* Handset UI Frame */}
              <div className="mx-auto max-w-xs rounded-2xl border-4 border-[#252525] bg-[#11202D] p-4 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-white/60">
                  <span>SAFARICOM M-PESA</span>
                  <span>SIM 1</span>
                </div>

                <div className="rounded-lg bg-black/60 p-3.5 text-center border border-white/10">
                  <p className="text-xs font-bold text-white">Do you wish to pay</p>
                  <p className="my-1 font-mono text-base font-extrabold text-[#10B981]">
                    KES {amount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-white/80">
                    to <span className="font-semibold text-white">Green View Management</span>
                  </p>
                  <p className="text-[10px] text-white/50 mt-1">Account: Unit {unit?.unitNumber || 'Rent'}</p>

                  <div className="mt-4 text-left">
                    <label className="block text-[10px] text-white/70 mb-1">Enter M-Pesa PIN:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="• • • •"
                      className="w-full rounded bg-white/10 px-2 py-1.5 text-center font-mono text-sm tracking-widest text-white border border-white/20 focus:outline-hidden focus:border-white"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    onClick={handleCancelOnPhone}
                    className="rounded bg-white/10 py-1.5 text-white/80 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAuthorizeOnPhone}
                    className="rounded bg-[#164A3A] py-1.5 text-white hover:bg-[#216751]"
                  >
                    Send / OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#164A3A] mb-3" />
              <h4 className="text-sm font-bold text-[#252525]">Processing M-Pesa Webhook Callback...</h4>
              <p className="mt-1 text-xs text-[#747474]">
                Validating transaction reference, identifying tenant, and committing to ledger.
              </p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 ${
                  result.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold">
                      {result.success ? 'Payment Successfully Confirmed!' : 'M-Pesa Webhook Callback Failed'}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed">{result.message}</p>
                    {result.ref && (
                      <div className="mt-2 text-[11px] font-mono font-semibold text-emerald-800">
                        Transaction Reference: {result.ref}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#DED6C9] bg-white p-3 text-xs text-[#747474] space-y-1">
                <div className="flex justify-between">
                  <span>Tenant:</span>
                  <span className="font-semibold text-[#252525]">{tenant?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Unit:</span>
                  <span className="font-semibold text-[#252525]">{unit?.unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Month:</span>
                  <span className="font-semibold text-[#252525]">{selectedMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Status:</span>
                  <span
                    className={`font-bold ${
                      result.success ? 'text-[#164A3A]' : 'text-[#641F2B]'
                    }`}
                  >
                    {result.success ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Simulate Another Payment
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-[#172A3A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#11202D]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
