import { Topbar } from "@/components/Topbar";
import { DeleteButton } from "@/components/DeleteButton";
import {
  AddMedicalButton,
  ClearForPlayButton,
} from "@/components/medical/MedicalActions";
import {
  deleteMedicalRecord,
  getMedicalRecords,
  listPlayerOptions,
  listStaffOptions,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function MedicalPage() {
  const [records, players, staff] = await Promise.all([
    getMedicalRecords(),
    listPlayerOptions(),
    listStaffOptions(),
  ]);

  const open = records.filter((r) => r.ClearedToPlay === 0).length;
  const cleared = records.length - open;

  return (
    <>
      <Topbar
        title="Medical Records"
        subtitle={`${open} open · ${cleared} cleared`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Injury log</h2>
            <p className="text-xs text-slate-400">Most recent injuries first</p>
          </div>
          <AddMedicalButton players={players} staff={staff} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-medium">Player</th>
                  <th className="px-6 py-3 font-medium">Injury</th>
                  <th className="px-6 py-3 font-medium">Treated by</th>
                  <th className="px-6 py-3 font-medium">Injury date</th>
                  <th className="px-6 py-3 font-medium">Return</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                      No medical records.
                    </td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr key={r.RecordID} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4 font-medium text-white">{r.PlayerName}</td>
                    <td className="px-6 py-4 text-slate-200">
                      <p>{r.InjuryType}</p>
                      {r.TreatmentNotes && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400" title={r.TreatmentNotes}>
                          {r.TreatmentNotes}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-200">{r.StaffName}</td>
                    <td className="px-6 py-4 text-slate-200">{r.DateOfInjury?.slice(0, 10)}</td>
                    <td className="px-6 py-4 text-slate-200">
                      {r.ActualReturnDate ? (
                        <>
                          <p>{r.ActualReturnDate.slice(0, 10)}</p>
                          <p className="text-xs text-slate-400">actual</p>
                        </>
                      ) : r.ExpectedReturnDate ? (
                        <>
                          <p>{r.ExpectedReturnDate.slice(0, 10)}</p>
                          <p className="text-xs text-slate-400">expected</p>
                        </>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.ClearedToPlay === 1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-300 ring-1 ring-inset ring-rose-400/30">
                          <span className="size-1.5 rounded-full bg-rose-400" />
                          Injured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <ClearForPlayButton record={r} />
                        <DeleteButton
                          action={deleteMedicalRecord}
                          idField="RecordID"
                          idValue={r.RecordID}
                          recordLabel={`${r.PlayerName} · ${r.InjuryType}`}
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
