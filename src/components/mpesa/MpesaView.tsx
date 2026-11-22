import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { getAuthToken } from '../../lib/auth';
import { loadMpesaConfig, type MpesaConfig } from '../../lib/mpesaApi';

interface MpesaViewProps {
  onOpenStkPushModal: () => void;
}

export const MpesaView: React.FC<MpesaViewProps> = ({ onOpenStkPushModal }) => {
  const { mpesaLogs } = useProperty();
  const [config, setConfig] = useState<MpesaConfig | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void (async () => {
      try {
        const token = await getAuthToken();
        const loaded = await loadMpesaConfig(token);
        if (isCurrent) setConfig(loaded);
      } catch {
        if (isCurrent) setConfig({ configured: false, shortcode: null, environment: null });
      }
    })();
    return () => {
      isCurrent = false;
    };
  }, []);

  const configured = config?.configured ?? false;
  const lastCallback = mpesaLogs[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#252525]">
            M-Pesa Daraja Integration & Webhook Listener (FR11 & FR12)
          </h2>
          <p className="text-xs text-[#747474]">
            Automated rent payment confirmation, transaction deduplication (BR9), and webhook audit
            log
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenStkPushModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#164A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#216751]"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Initiate STK Push</span>
        </button>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#164A3A]">
            <span>GATEWAY STATE</span>
            <span
              className={`h-2 w-2 rounded-full ${configured ? 'bg-[#164A3A]' : 'bg-[#641F2B]'}`}
            />
          </div>
          <p className="mt-1 text-xs text-[#747474]">
            Shortcode:{' '}
            <strong className="font-mono text-[#252525]">
              {config?.shortcode ?? (config ? 'Not configured' : 'Loading…')}
            </strong>
          </p>
          <p className="mt-1 text-[11px] text-[#747474]">
            {configured
              ? 'Safaricom Daraja credentials are loaded from the server environment.'
              : 'Set the DARAJA_* server variables to enable live STK Push requests.'}
          </p>
        </div>

        <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#252525]">
            <span>ENVIRONMENT</span>
            <ShieldCheck className="h-4 w-4 text-[#164A3A]" />
          </div>
          <p className="mt-2 text-base font-bold text-[#252525] capitalize">
            {config?.environment ?? '—'}
          </p>
          <p className="mt-1 text-[11px] text-[#747474]">
            Controlled by DARAJA_ENV; the callback is served by /api/mpesa/callback.
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
            {lastCallback
              ? `Latest: ${lastCallback.status} · ${lastCallback.timestamp}`
              : 'No Safaricom callbacks recorded yet.'}
          </p>
        </div>
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
                          <AlertTriangle className="h-3 w-3" />
                          <span>Failed</span>
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
