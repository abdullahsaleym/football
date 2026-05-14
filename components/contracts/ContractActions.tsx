"use client";

import { useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary, buttonGhost } from "@/components/FormField";
import { Modal } from "@/components/Modal";
import type {
  ContractRow,
  ContractStatus,
  PlayerOption,
  StaffOption,
} from "@/lib/actions";
import { createContract, setContractStatus } from "@/lib/actions";

const STATUSES: ContractStatus[] = [
  "Active",
  "Expired",
  "Terminated",
  "Renewed",
];

export function AddContractButton({
  players,
  staff,
}: {
  players: PlayerOption[];
  staff: StaffOption[];
}) {
  const [open, setOpen] = useState(false);
  const [partyType, setPartyType] = useState<"Player" | "Staff">("Player");

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
        New Contract
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="New contract"
        description="Player contracts cannot overlap — the DB trigger blocks duplicate active contracts."
        action={createContract}
        submitLabel="Create contract"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Party type" required>
            <select
              name="PartyType"
              required
              value={partyType}
              onChange={(e) => setPartyType(e.target.value as "Player" | "Staff")}
              className={selectClass}
            >
              <option value="Player">Player</option>
              <option value="Staff">Staff</option>
            </select>
          </Field>
          <Field label={partyType} required>
            <select name="PartyID" required className={selectClass} defaultValue="">
              <option value="" disabled>Select…</option>
              {(partyType === "Player" ? players : staff).map((o) => {
                const id = "PlayerID" in o ? o.PlayerID : o.StaffID;
                return (
                  <option key={id} value={id}>
                    {o.FullName}
                  </option>
                );
              })}
            </select>
          </Field>
          <Field label="Start date" required>
            <input name="StartDate" type="date" required className={inputClass} />
          </Field>
          <Field label="End date" required>
            <input name="EndDate" type="date" required className={inputClass} />
          </Field>
          <Field label="Weekly wage (USD)" required>
            <input
              name="WeeklyWage"
              type="number"
              min={1}
              step={0.01}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Signing bonus" hint="Optional">
            <input name="SigningBonus" type="number" min={0} step={0.01} className={inputClass} />
          </Field>
          <Field label="Release clause" hint="Optional">
            <input name="ReleaseClause" type="number" min={0} step={0.01} className={inputClass} />
          </Field>
          <Field label="Status" required>
            <select name="ContractStatus" required defaultValue="Active" className={selectClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormDialog>
    </>
  );
}

export function ChangeStatusButton({ contract }: { contract: ContractRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Change status"
        className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
        </svg>
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Update contract status`}
        description={`${contract.PartyName} · Contract #${contract.ContractID}`}
        action={setContractStatus}
        submitLabel="Update status"
        size="sm"
      >
        <input type="hidden" name="ContractID" value={contract.ContractID} />
        <Field label="New status" required>
          <select
            name="ContractStatus"
            required
            defaultValue={contract.ContractStatus}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </FormDialog>
    </>
  );
}

// Optional inline view of a contract row for very small screens
export function ContractInspectButton({ contract }: { contract: ContractRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonGhost}>
        View
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Contract details" size="sm">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate-400">Party</dt><dd className="text-white">{contract.PartyName}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Type</dt><dd className="text-white">{contract.PartyType}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Start</dt><dd className="text-white">{contract.StartDate?.slice(0, 10)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">End</dt><dd className="text-white">{contract.EndDate?.slice(0, 10)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Weekly wage</dt><dd className="text-white">${Number(contract.WeeklyWage).toLocaleString()}</dd></div>
        </dl>
      </Modal>
    </>
  );
}
