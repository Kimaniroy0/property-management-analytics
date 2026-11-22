import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Clock,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

interface MpesaViewProps {
  onOpenStkPushModal: () => void;
}

export const MpesaView: React.FC<MpesaViewProps> = ({ onOpenStkPushModal }) => {
  const { mpesaLogs, tenants, units, simulateMpesaCallback, selectedMonth } = useProperty();

  // Webhook Test Payload Console
  const [testPhone, setTestPhone] = useState('+254 722 894 133');
  const [testAmount, setTestAmount] = useState(30000);
  const [testTenantId, setTestTenantId] = useState(tenants[0]?.id || '');
  const [testRef, setTestRef] = useState('');
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setTestFeedback(null);

    const res = simulateMpesaCallback({
      phone: testPhone,
      amount: testAmount,
      tenantId: testTenantId,
      customRef: testRef || undefined,
    });

    setTestFeedback({ success: res.success, message: res.message });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            M-Pesa Daraja 2.0 Integration & Webhook Listener (FR11 & FR12)
          </h2>
          <p className="text-xs text-[#747474]">
            Automated rent payment confirmation, transaction deduplication (BR9), and webhook audit log
          </p>
        </div>
        <button
          onClick={onOpenStkPushModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#164A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#216751] transition-colors"
        >
          <Smartphone className="h-4 w-4" />
          <span>Launch Phone Simulator</span>
        </button>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#164A3A]">
            <span>GATEWAY STATE</span>
            <span className="h-2 w-2 rounded-full bg-[#164A3A]" />
          </div>
          <div className="mt-2 text-base font-bold text-[#252525]">Daraja API Connected</div>
          <p className="mt-1 text-xs text-[#747474]">
            Shortcode: <strong className="font-mono text-[#252525]">892100</strong> (Paybill)
          </p>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#172A3A]">
            <span>DEDUPLICATION ENGINE</span>
            <ShieldCheck className="h-4 w-4 text-[#164A3A]" />
          </div>
          <div className="mt-2 text-base font-bold text-[#252525]">BR9 Active Verification</div>
          <p className="mt-1 text-xs text-[#747474]">
            Rejects identical transaction references to prevent duplicate accounting.
          </p>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#641F2B]">
            <span>CALLBACK AUDIT</span>
            <Clock className="h-4 w-4 text-[#641F2B]" />
          </div>
          <div className="mt-2 text-base font-bold text-[#252525] font-mono tabular-nums">
            {mpesaLogs.length} Webhook Events
          </div>
          <p className="mt-1 text-xs text-[#747474]">
            All callbacks committed to PostgreSQL ledger with immutable timestamp.
          </p>
        </div>
      </div>

      {/* Interactive Webhook Simulator Console */}
      <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#DED6C9]/60 pb-3">
          <Terminal className="h-4 w-4 text-[#164A3A]" />
          <div>
            <h3 className="text-sm font-bold text-[#252525]">Simulate Incoming M-Pesa Callback Payload</h3>
            <p className="text-xs text-[#747474]">
              Send an HTTP POST webhook request directly to the backend listener endpoint (/api/mpesa/callback)
            </p>
          </div>
        </div>

        {testFeedback && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
              testFeedback.success
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {testFeedback.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{testFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleTestWebhook} className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#252525] mb-1">
              Select Tenant & Unit
            </label>
            <select
              value={testTenantId}
              onChange={(e) => setTestTenantId(e.target.value)}
              className="w-full rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1.5 text-xs text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Unit {t.unitId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#252525] mb-1">
              Mobile MSISDN
            </label>
            <input
              type="text"
              required
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1.5 text-xs font-mono text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#252525] mb-1">
              Amount (KES)
            </label>
            <input
              type="number"
              required
              min={1}
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#252525] focus:border-[#164A3A] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#252525] mb-1">
              M-Pesa Reference
            </label>
            <input
              type="text"
              placeholder="e.g. MPESA-QKD98231"
              value={testRef}
              onChange={(e) => setTestRef(e.target.value)}
              className="w-full rounded-lg border border-[#DED6C9] bg-white px-2.5 py-1.5 text-xs font-mono text-[#252525] placeholder:text-[#747474]/50 focus:border-[#164A3A] focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#747474]">
              Tip: Use an existing reference like <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#DED6C9]">MPESA-QKD98231</code> to observe BR9 duplicate rejection.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#164A3A] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#216751]"
            >
              <Send className="h-3 w-3" />
              <span>Dispatch Webhook POST</span>
            </button>
          </div>
        </form>
      </div>

      {/* M-Pesa Callback Audit Logs Table */}
      <div className="overflow-hidden rounded-xl border border-[#DED6C9] bg-[#FAF8F3] shadow-2xs">
        <div className="border-b border-[#DED6C9] bg-[#F3EDE3]/70 px-4 py-3">
          <h3 className="text-xs font-bold text-[#252525] uppercase tracking-wider">
            Incoming Webhook Callback Audit Trail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DED6C9] text-[11px] font-bold text-[#747474] uppercase tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Receipt Ref</th>
                <th className="py-2.5 px-4">Tenant / MSISDN</th>
                <th className="py-2.5 px-4">Unit</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4">Result Code</th>
                <th className="py-2.5 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6C9]/40 bg-white">
              {mpesaLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#747474]">
                    No callback logs recorded yet.
                  </td>
                </tr>
              ) : (
                mpesaLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#252525]">{log.timestamp}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#252525]">
                      {log.transactionReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#252525]">{log.tenantName}</div>
                      <div className="text-[11px] font-mono text-[#747474]">{log.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#252525]">{log.unitId}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#252525] tabular-nums">
                      KES {log.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-semibold text-[#252525]">
                        Code {log.resultCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'Processed' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#164A3A]">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Processed</span>
                        </span>
                      ) : log.status === 'Duplicate Rejected' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Duplicate Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
