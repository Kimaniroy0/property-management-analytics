import { ShieldCheck } from 'lucide-react';
import { authClient } from '../../lib/auth';

export const SettingsView = () => {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#252525]">
          System Settings
        </h2>
        <p className="text-xs text-[#747474]">
          Platform configuration and account details
        </p>
      </div>

      <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-[#252525] border-b border-[#DED6C9]/60 pb-3 mb-4">
          Signed-in Account
        </h3>
        <div className="flex items-center gap-4">
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-[#B89A62]"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#641F2B] text-xl font-semibold text-white">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-base font-bold text-[#252525]">{user?.name || 'Account'}</div>
            <div className="text-xs text-[#747474] font-mono">{user?.email}</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#164A3A] bg-[#164A3A]/10 px-2 py-0.5 rounded">
              <ShieldCheck className="h-3 w-3" />
              <span>Authenticated with Neon Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Configuration */}
      <div className="rounded-xl border border-[#DED6C9] bg-[#FAF8F3] p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-[#252525] border-b border-[#DED6C9]/60 pb-3 mb-4">
          Business & Currency Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#252525] mb-1">
              Active Ledger Currency
            </label>
            <input
              type="text"
              disabled
              value="KES — Kenyan Shillings (Kenyan Shilling)"
              className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-semibold text-[#252525]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#252525] mb-1">
              M-Pesa Shortcode (Paybill)
            </label>
            <input
              type="text"
              disabled
              value="892100 (Green View Estates)"
              className="w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-xs font-mono text-[#252525]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
