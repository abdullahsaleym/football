import { Topbar } from "@/components/Topbar";
import { DeleteButton } from "@/components/DeleteButton";
import { ProcessPayrollButton } from "@/components/payroll/PayrollActions";
import {
  deletePayroll,
  getPayroll,
  listActiveContractOptions,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function PayrollPage() {
  const [payslips, contracts] = await Promise.all([
    getPayroll(),
    listActiveContractOptions(),
  ]);

  const totalNet = payslips.reduce((sum, p) => sum + Number(p.NetAmount), 0);
  const totalGross = payslips.reduce((sum, p) => sum + Number(p.GrossAmount), 0);

  return (
    <>
      <Topbar
        title="Payroll"
        subtitle={`${payslips.length} payslip${payslips.length === 1 ? "" : "s"} processed`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total gross</p>
            <p className="mt-2 text-2xl font-bold text-white">{money.format(totalGross)}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total net</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{money.format(totalNet)}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Deductions</p>
            <p className="mt-2 text-2xl font-bold text-rose-300">{money.format(totalGross - totalNet)}</p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Payslips</h2>
            <p className="text-xs text-slate-400">Most recent first</p>
          </div>
          <ProcessPayrollButton contracts={contracts} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-medium">Payslip Ref</th>
                  <th className="px-6 py-3 font-medium">Party</th>
                  <th className="px-6 py-3 font-medium">Pay Period</th>
                  <th className="px-6 py-3 font-medium text-right">Gross</th>
                  <th className="px-6 py-3 font-medium text-right">Deductions</th>
                  <th className="px-6 py-3 font-medium text-right">Net</th>
                  <th className="px-6 py-3 font-medium">Processed</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payslips.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                      No payslips yet.
                    </td>
                  </tr>
                )}
                {payslips.map((p) => (
                  <tr key={p.PayrollID} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4 font-mono text-xs text-slate-200">{p.PayslipRef}</td>
                    <td className="px-6 py-4 text-white">{p.PartyName}</td>
                    <td className="px-6 py-4 text-slate-200">{p.PayPeriod}</td>
                    <td className="px-6 py-4 text-right text-slate-200">{money.format(Number(p.GrossAmount))}</td>
                    <td className="px-6 py-4 text-right text-rose-300">−{money.format(Number(p.Deductions))}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-300">{money.format(Number(p.NetAmount))}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{p.ProcessedDate?.slice(0, 10)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <DeleteButton
                          action={deletePayroll}
                          idField="PayrollID"
                          idValue={p.PayrollID}
                          recordLabel={p.PayslipRef}
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
