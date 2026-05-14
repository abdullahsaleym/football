import { Topbar } from "@/components/Topbar";
import { DeleteButton } from "@/components/DeleteButton";
import {
  AddStaffButton,
  EditStaffButton,
} from "@/components/staff/StaffActions";
import { deleteStaff, getStaff, listUserOptions } from "@/lib/actions";

export const dynamic = "force-dynamic";

const DEPT_STYLES: Record<string, string> = {
  Coaching: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  Medical: "bg-rose-500/10 text-rose-300 ring-rose-400/20",
  Finance: "bg-violet-500/10 text-violet-300 ring-violet-400/20",
  Administration: "bg-slate-500/10 text-slate-300 ring-slate-400/20",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function StaffPage() {
  const [staff, users] = await Promise.all([getStaff(), listUserOptions()]);

  return (
    <>
      <Topbar
        title="Staff"
        subtitle={`${staff.length} staff record${staff.length === 1 ? "" : "s"}`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Staff Directory</h2>
            <p className="text-xs text-slate-400">Coaching · Medical · Finance · Administration</p>
          </div>
          <AddStaffButton users={users} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      No staff yet. Add the first member.
                    </td>
                  </tr>
                )}
                {staff.map((s) => {
                  const deptStyle =
                    DEPT_STYLES[s.Department] ?? "bg-slate-500/10 text-slate-300 ring-slate-400/20";
                  return (
                    <tr key={s.StaffID} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 text-sm font-semibold text-white ring-1 ring-white/10">
                            {initials(s.FullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white">{s.FullName}</p>
                            <p className="text-xs text-slate-400">Joined {s.DateJoined?.slice(0, 10)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-200">{s.Role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${deptStyle}`}>
                          {s.Department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-200">{s.Email}</p>
                        <p className="text-xs text-slate-400">{s.Phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        {s.IsActive === 1 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-2.5 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-400/30">
                            <span className="size-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <EditStaffButton staff={s} users={users} />
                          <DeleteButton
                            action={deleteStaff}
                            idField="StaffID"
                            idValue={s.StaffID}
                            recordLabel={s.FullName}
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
