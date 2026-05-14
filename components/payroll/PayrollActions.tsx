"use client";

import { useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary } from "@/components/FormField";
import { createPayroll, type ContractOption } from "@/lib/actions";

export function ProcessPayrollButton({ contracts }: { contracts: ContractOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonPrimary}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Process Payroll
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Process payroll"
        description="Net = Gross − Deductions (computed automatically)"
        action={createPayroll}
        submitLabel="Generate payslip"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contract" required className="sm:col-span-2">
            <select name="ContractID" required className={selectClass} defaultValue="">
              <option value="" disabled>Select contract…</option>
              {contracts.map((c) => (
                <option key={c.ContractID} value={c.ContractID}>
                  {c.PartyName} · ${Number(c.WeeklyWage).toLocaleString()}/wk
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pay period" required>
            <input
              name="PayPeriod"
              required
              maxLength={20}
              className={inputClass}
              placeholder="e.g. January 2026"
            />
          </Field>
          <Field label="Payslip reference" required>
            <input
              name="PayslipRef"
              required
              maxLength={30}
              className={inputClass}
              placeholder="PSL-2026-001"
            />
          </Field>
          <Field label="Gross amount" required>
            <input
              name="GrossAmount"
              type="number"
              min={0.01}
              step={0.01}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Deductions" required>
            <input
              name="Deductions"
              type="number"
              min={0}
              step={0.01}
              required
              defaultValue={0}
              className={inputClass}
            />
          </Field>
        </div>
      </FormDialog>
    </>
  );
}
