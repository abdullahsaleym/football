import { Topbar } from "@/components/Topbar";
import { DeleteButton } from "@/components/DeleteButton";
import {
  AddContractButton,
  ChangeStatusButton,
} from "@/components/contracts/ContractActions";
import {
  deleteContract,
  getContracts,
  listPlayerOptions,
  listStaffOptions,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Expired: "bg-slate-500/15 text-slate-300 ring-slate-400/30",
  Terminated: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  Renewed: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function ContractsPage() {
  const [contracts, players, staff] = await Promise.all([
    getContracts(),
    listPlayerOptions(),
    listStaffOptions(),
  ]);

  return (
    <>
      <Topbar
        title="Contracts"
        subtitle={`${contracts.length} contract${contracts.length === 1 ? "" : "s"} on file`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">All Contracts</h2>
            <p className="text-xs text-slate-400">Players & staff, every status</p>
          </div>
          <AddContractButton players={players} staff={staff} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-medium">Party</th>
                  <th className="px-6 py-3 font-medium">Period</th>
                  <th className="px-6 py-3 font-medium text-right">Weekly Wage</th>
                  <th className="px-6 py-3 font-medium text-right">Signing Bonus</th>
                  <th className="px-6 py-3 font-medium text-right">Release Clause</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contracts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                      No contracts yet.
                    </td>
                  </tr>
                )}
                {contracts.map((c) => (
                  <tr key={c.ContractID} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{c.PartyName}</p>
                      <p className="text-xs text-slate-400">{c.PartyType}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      <p>{c.StartDate?.slice(0, 10)}</p>
                      <p className="text-xs text-slate-400">to {c.EndDate?.slice(0, 10)}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-white">
                      {money.format(Number(c.WeeklyWage))}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-200">
                      {c.SigningBonus ? money.format(Number(c.SigningBonus)) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-200">
                      {c.ReleaseClause ? money.format(Number(c.ReleaseClause)) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[c.ContractStatus] ?? "bg-slate-500/15 text-slate-300 ring-slate-400/30"}`}>
                        {c.ContractStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <ChangeStatusButton contract={c} />
                        <DeleteButton
                          action={deleteContract}
                          idField="ContractID"
                          idValue={c.ContractID}
                          recordLabel={`contract #${c.ContractID}`}
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
