import { Topbar } from "@/components/Topbar";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { AddPlayerButton, EditPlayerButton } from "@/components/players/PlayerActions";
import { deletePlayer, getPlayers } from "@/lib/actions";

export const dynamic = "force-dynamic";

const POSITION_STYLES: Record<string, string> = {
  Goalkeeper: "bg-yellow-500/10 text-yellow-300 ring-yellow-400/20",
  Defender: "bg-blue-500/10 text-blue-300 ring-blue-400/20",
  Midfielder: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  Forward: "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-400/20",
};

const wage = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <>
      <Topbar
        title="Players"
        subtitle={`${players.length} player${players.length === 1 ? "" : "s"} on the books`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Squad List</h2>
            <p className="text-xs text-slate-400">Sorted by status, then squad number</p>
          </div>
          <AddPlayerButton />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-medium">Player</th>
                  <th className="px-6 py-3 font-medium">Position</th>
                  <th className="px-6 py-3 font-medium">Squad #</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Weekly Wage</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      No players yet. Add one to get started.
                    </td>
                  </tr>
                )}
                {players.map((p) => {
                  const positionStyle =
                    POSITION_STYLES[p.Position] ?? "bg-slate-500/10 text-slate-300 ring-slate-400/20";
                  return (
                    <tr key={p.PlayerID} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 text-sm font-semibold text-white ring-1 ring-white/10">
                            {initials(p.FullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white">{p.FullName}</p>
                            <p className="text-xs text-slate-400">{p.Nationality}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${positionStyle}`}>
                          {p.Position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.SquadNumber !== null ? (
                          <span className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-white">
                            {p.SquadNumber}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.Status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.WeeklyWage !== null ? (
                          <div>
                            <p className="font-semibold text-white">{wage.format(Number(p.WeeklyWage))}</p>
                            {p.DaysUntilExpiry !== null && (
                              <p className="text-xs text-slate-400">
                                {p.DaysUntilExpiry > 0 ? `${p.DaysUntilExpiry} days left` : "Expired"}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">No active contract</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <EditPlayerButton player={p} />
                          <DeleteButton
                            action={deletePlayer}
                            idField="PlayerID"
                            idValue={p.PlayerID}
                            recordLabel={p.FullName}
                            compact
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
