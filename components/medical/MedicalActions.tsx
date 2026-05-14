"use client";

import { useState, useTransition } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary } from "@/components/FormField";
import type { PlayerOption, StaffOption, MedicalRow } from "@/lib/actions";
import { createMedicalRecord, clearForPlay } from "@/lib/actions";

export function AddMedicalButton({
  players,
  staff,
}: {
  players: PlayerOption[];
  staff: StaffOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonPrimary}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Log Injury
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Log new medical record"
        action={createMedicalRecord}
        submitLabel="Save record"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Player" required>
            <select name="PlayerID" required className={selectClass} defaultValue="">
              <option value="" disabled>Select player…</option>
              {players.map((p) => (
                <option key={p.PlayerID} value={p.PlayerID}>{p.FullName}</option>
              ))}
            </select>
          </Field>
          <Field label="Treating staff" required>
            <select name="TreatingStaffID" required className={selectClass} defaultValue="">
              <option value="" disabled>Select staff…</option>
              {staff.map((s) => (
                <option key={s.StaffID} value={s.StaffID}>{s.FullName}</option>
              ))}
            </select>
          </Field>
          <Field label="Injury type" required className="sm:col-span-2">
            <input
              name="InjuryType"
              required
              maxLength={100}
              className={inputClass}
              placeholder="e.g. Hamstring Tear - Grade 2"
            />
          </Field>
          <Field label="Date of injury" required>
            <input name="DateOfInjury" type="date" required className={inputClass} />
          </Field>
          <Field label="Expected return">
            <input name="ExpectedReturnDate" type="date" className={inputClass} />
          </Field>
          <Field label="Actual return">
            <input name="ActualReturnDate" type="date" className={inputClass} />
          </Field>
          <Field label="Cleared to play">
            <label className="flex cursor-pointer items-center gap-2 pt-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="ClearedToPlay"
                className="size-4 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400/40"
              />
              Mark as cleared
            </label>
          </Field>
          <Field label="Treatment notes" className="sm:col-span-2">
            <textarea
              name="TreatmentNotes"
              rows={3}
              className={inputClass}
              placeholder="Optional notes…"
            />
          </Field>
        </div>
      </FormDialog>
    </>
  );
}

export function ClearForPlayButton({ record }: { record: MedicalRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  if (record.ClearedToPlay === 1) return null;

  function onClick() {
    setError(null);
    const fd = new FormData();
    fd.set("RecordID", String(record.RecordID));
    startTransition(async () => {
      try {
        await clearForPlay(fd);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label="Clear to play"
        className="rounded-md p-1.5 text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-50"
        title="Mark cleared to play"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M9 12l2 2 4-4M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" />
        </svg>
      </button>
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </>
  );
}
