import React, { useEffect, useState } from 'react';
import { X, Smartphone, CheckCircle2, AlertTriangle, RefreshCw, Send } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { getAuthToken } from '../../lib/auth';
import { initiateStkPush, loadStkStatus, MpesaApiError } from '../../lib/mpesaApi';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTenantId?: string;
}

type Step = 'form' | 'processing' | 'pending' | 'result';

const POLL_INTERVAL_MS = 3000;
const PENDING_TIMEOUT_MS = 120_000;

export const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onClose,
  preselectedTenantId,
}) => {
  const { tenants, units, getTenantMonthStatus, selectedMonth, refreshDashboard, setMpesaFlowActive } =
    useProperty();

  const unpaidTenants = tenants.filter((t) => getTenantMonthStatus(t.id).status === 'UNPAID');

  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [step, setStep] = useState<Step>('form');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; ref?: string } | null>(
    null
  );

  const tenant = tenants.find((t) => t.id === selectedTenantId);
  const unit = units.find((u) => u.id === tenant?.unitId);

  // Reset the form every time the modal is opened.
  useEffect(() => {
    if (!isOpen) return;
    const initialTenant = preselectedTenantId || unpaidTenants[0]?.id || tenants[0]?.id || '';
    const selected = tenants.find((t) => t.id === initialTenant);
    setSelectedTenantId(initialTenant);
    setPhone(selected?.phone ?? '');
    setAmount(units.find((u) => u.id === selected?.unitId)?.rentAmount ?? 0);
    setStep('form');
    setCheckoutRequestId('');
    setCustomerMessage('');
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectedTenantId]);

  useEffect(() => () => setMpesaFlowActive(false), [setMpesaFlowActive]);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const selected = tenants.find((t) => t.id === tenantId);
    setPhone(selected?.phone ?? '');
    setAmount(units.find((u) => u.id === selected?.unitId)?.rentAmount ?? 0);
  };

  const handleSendStkPush = async (event: React.FormEvent) => {
    event.preventDefault();
    setResult(null);
    setStep('processing');
    setMpesaFlowActive(true);

    try {
      const token = await getAuthToken();
      const response = await initiateStkPush(token, {
        tenantId: selectedTenantId,
        phone,
        amount,
        month: selectedMonth,
      });
      setCheckoutRequestId(response.checkoutRequestId);
      setCustomerMessage(response.customerMessage);
      setStep('pending');
    } catch (error) {
      setMpesaFlowActive(false);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'The STK Push request failed.',
      });
      setStep('result');
    }
  };

  // Poll the server until Safaricom's callback resolves the request.
  useEffect(() => {
    if (step !== 'pending' || !checkoutRequestId) return;

    let cancelled = false;
    let timer: number | undefined;
    const startedAt = Date.now();

    const fail = (message: string) => {
      setMpesaFlowActive(false);
      setResult({ success: false, message });
      setStep('result');
    };

    const finish = async (success: boolean, message: string, receipt?: string | null) => {
      if (success) {
        try {
          await refreshDashboard();
        } catch (error) {
          console.error('Dashboard refresh after the M-Pesa payment failed:', error);
        }
      }
      if (cancelled) return;
      setMpesaFlowActive(false);
      setResult({ success, message, ref: receipt ?? undefined });
      setStep('result');
    };

    const tick = async () => {
      if (cancelled) return;
      try {
        const token = await getAuthToken();
        const status = await loadStkStatus(token, checkoutRequestId);
        if (cancelled) return;

        if (status.status === 'Processed') {
          await finish(
            true,
            `M-Pesa payment of KES ${status.amount.toLocaleString()} confirmed${
              tenant ? ` for ${tenant.name}` : ''
            }.`,
            status.receipt
          );
          return;
        }
        if (status.status === 'Failed') {
          fail(status.resultDesc || 'The M-Pesa payment was not completed.');
          return;
        }
      } catch (error) {
        if (error instanceof MpesaApiError && error.status === 404) {
          fail(error.message);
          return;
        }
        // Transient network or server errors: keep polling until the timeout.
      }

      if (Date.now() - startedAt > PENDING_TIMEOUT_MS) {
        fail(
          'No confirmation arrived from Safaricom yet. If you approved the prompt the payment will appear once its callback is processed.'
        );
        return;
      }
      timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    };

    timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, checkoutRequestId]);

  const handleClose = () => {
    setMpesaFlowActive(false);
    onClose();
  };

  const handleReset = () => {
    setResult(null);
    setCheckoutRequestId('');
    setCustomerMessage('');
    setStep('form');
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
              <h3 className="text-sm font-bold tracking-tight">M-Pesa STK Push</h3>
              <p className="text-[11px] text-white/60">Safaricom Daraja — Lipa na M-Pesa Online</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {step === 'form' && (
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
                        {t.name} (Unit {t.unitId}) ·{' '}
                        {status === 'PAID' ? 'Already Paid' : `UNPAID for ${selectedMonth}`}
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
                    placeholder="07XXXXXXXX"
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
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono font-semibold text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
                  />
                </div>
              </div>

              <p className="rounded-lg border border-[#DED6C9] bg-white/60 p-3 text-[11px] leading-relaxed text-[#747474]">
                Safaricom will send a payment prompt to the tenant's phone. The payment is recorded
                only after the M-Pesa callback confirms it for{' '}
                <span className="font-semibold text-[#252525]">{selectedMonth}</span>.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTenantId}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#164A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#216751] disabled:opacity-50"
                >
                  <span>Send STK Push</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#164A3A] mb-3" />
              <h4 className="text-sm font-bold text-[#252525]">Contacting Safaricom…</h4>
              <p className="mt-1 text-xs text-[#747474]">Requesting an M-Pesa STK Push.</p>
            </div>
          )}

          {step === 'pending' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#DED6C9] bg-white py-8 text-center">
                <Smartphone className="h-8 w-8 text-[#164A3A] mb-3" />
                <h4 className="text-sm font-bold text-[#252525]">Check the tenant's phone</h4>
                <p className="mt-1 max-w-xs text-xs text-[#747474]">
                  {customerMessage ||
                    'Enter the M-Pesa PIN on the handset to authorise the payment.'}
                </p>
                <p className="mt-4 font-mono text-[11px] text-[#747474]">
                  KES {amount.toLocaleString()} · {phone}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#164A3A]">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Waiting for the M-Pesa callback…
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-[#DED6C9] bg-white px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#F3EDE3]"
                >
                  Close
                </button>
              </div>
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
                      {result.success ? 'Payment Successfully Confirmed' : 'M-Pesa Payment Not Completed'}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed">{result.message}</p>
                    {result.ref && (
                      <div className="mt-2 text-[11px] font-mono font-semibold text-emerald-800">
                        M-Pesa Receipt: {result.ref}
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
                  <span>Status:</span>
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
                  New STK Push
                </button>
                <button
                  type="button"
                  onClick={handleClose}
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
