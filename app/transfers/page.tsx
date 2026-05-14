import { Topbar } from "@/components/Topbar";
import { DeleteButton } from "@/components/DeleteButton";
import {
  AddTransferButton,
  UpdateTransferStatusButton,
} from "@/components/transfers/TransferActions";
import { deleteTransfer, getTransfers, listPlayerOptions } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  Negotiating: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  Agreed: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30",
  Medicals: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  Registered: "bg-blue-500/15 text-blue-300 ring-blue-400/30",
  Complete: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Failed: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function TransfersPage() {
  const [transfers, players] = await Promise.all([
    getTransfers(),
    listPlayerOptions(),
  ]);

  return (
    <>
      <Topbar
        title="Transfers"
        subtitle={`${transfers.length} record${transfers.length === 1 ? "" : "s"} in the transfer book`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Transfer Activity</h2>
            <p className="text-xs text-slate-400">Newest first</p>
          </div>
          <AddTransferButton players={players} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-medium">Player</th>
                  <th className="px-6 py-3 font-medium">Route</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Window</th>
                  <th className="px-6 py-3 font-medium text-right">Fee</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                      No transfers yet.
                    </td>
                  </tr>
                )}
                {transfers.map((t) => (
                  <tr key={t.TransferID} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4 font-medium text-white">{t.PlayerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span>{t.FromClub}</span>
                        <span className="text-emerald-400">→</span>
                        <span>{t.ToClub}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{t.TransferType}</td>
                    <td className="px-6 py-4 text-slate-200">{t.WindowPeriod}</td>
                    <td className="px-6 py-4 text-right">
                      {t.TransferFee !== null && Number(t.TransferFee) > 0 ? (
                        <>
                          <p className="font-semibold text-white">{money.format(Number(t.TransferFee))}</p>
                          {t.SellOnClause !== null && Number(t.SellOnClause) > 0 && (
                            <p className="text-xs text-slate-400">{Number(t.SellOnClause)}% sell-on</p>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-500">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-200">{t.TransferDate?.slice(0, 10)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[t.Status] ?? "bg-slate-500/15 text-slate-300 ring-slate-400/30"}`}>
                        {t.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <UpdateTransferStatusButton transfer={t} />
                        <DeleteButton
                          action={deleteTransfer}
                          idField="TransferID"
                          idValue={t.TransferID}
                          recordLabel={`${t.PlayerName} → ${t.ToClub}`}
                          compact
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
