"use client";

import { useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary } from "@/components/FormField";
import type { PlayerOption, TransferRow, TransferStatus } from "@/lib/actions";
import { createTransfer, updateTransferStatus } from "@/lib/actions";

const TYPES = ["Permanent", "Loan", "FreeTransfer", "Exchange"] as const;
const WINDOWS = ["SummerWindow", "WinterWindow", "FreeAgent"] as const;
const STATUSES: TransferStatus[] = [
  "Negotiating",
  "Agreed",
  "Medicals",
  "Registered",
  "Complete",
  "Failed",
];

export function AddTransferButton({ players }: { players: PlayerOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonPrimary}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New Transfer
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Record transfer"
        action={createTransfer}
        submitLabel="Save transfer"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Player" required className="sm:col-span-2">
            <select name="PlayerID" required className={selectClass} defaultValue="">
              <option value="" disabled>Select player…</option>
              {players.map((p) => (
                <option key={p.PlayerID} value={p.PlayerID}>{p.FullName}</option>
              ))}
            </select>
          </Field>
          <Field label="From club" required>
            <input name="FromClub" required maxLength={100} className={inputClass} />
          </Field>
          <Field label="To club" required>
            <input name="ToClub" required maxLength={100} className={inputClass} />
          </Field>
          <Field label="Transfer type" required>
            <select name="TransferType" required className={selectClass}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Window" required>
            <select name="WindowPeriod" required className={selectClass}>
              {WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Transfer fee" hint="Optional · in USD">
            <input name="TransferFee" type="number" min={0} step={0.01} className={inputClass} />
          </Field>
          <Field label="Sell-on clause %" hint="0–100">
            <input name="SellOnClause" type="number" min={0} max={100} step={0.01} className={inputClass} />
          </Field>
          <Field label="Transfer date" required>
            <input name="TransferDate" type="date" required className={inputClass} />
          </Field>
          <Field label="Status" required>
            <select name="Status" required defaultValue="Negotiating" className={selectClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      </FormDialog>
    </>
  );
}

export function UpdateTransferStatusButton({ transfer }: { transfer: TransferRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Update status"
        className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
        </svg>
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Update transfer status"
        description={`${transfer.PlayerName} · ${transfer.FromClub} → ${transfer.ToClub}`}
        action={updateTransferStatus}
        size="sm"
        submitLabel="Update"
      >
        <input type="hidden" name="TransferID" value={transfer.TransferID} />
        <Field label="Status" required>
          <select name="Status" required defaultValue={transfer.Status} className={selectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </FormDialog>
    </>
  );
}
