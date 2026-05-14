"use client";

import { useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary } from "@/components/FormField";
import type { MatchRow } from "@/lib/actions";
import { createMatch, recordMatchResult } from "@/lib/actions";

const SIDES = ["Home", "Away", "Neutral"] as const;
const COMPETITIONS = ["League", "Cup", "FriendlyMatch", "EuropeanCompetition"] as const;
const STATUSES = ["Scheduled", "Completed", "Postponed", "Cancelled"] as const;

export function AddMatchButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonPrimary}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Schedule Match
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule a match"
        action={createMatch}
        submitLabel="Save match"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Match date & time" required className="sm:col-span-2">
            <input name="MatchDate" type="datetime-local" required className={inputClass} />
          </Field>
          <Field label="Opponent" required>
            <input name="Opponent" required maxLength={100} className={inputClass} />
          </Field>
          <Field label="Venue" required>
            <input name="Venue" required maxLength={100} className={inputClass} />
          </Field>
          <Field label="Home / Away" required>
            <select name="HomeOrAway" required className={selectClass}>
              {SIDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Competition" required>
            <select name="Competition" required className={selectClass}>
              {COMPETITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status" required>
            <select name="MatchStatus" required defaultValue="Scheduled" className={selectClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Home score" hint="Leave blank if not yet played">
            <input name="HomeScore" type="number" min={0} className={inputClass} />
          </Field>
          <Field label="Away score">
            <input name="AwayScore" type="number" min={0} className={inputClass} />
          </Field>
        </div>
      </FormDialog>
    </>
  );
}

export function RecordResultButton({ match }: { match: MatchRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Record result"
        className="rounded-md p-1.5 text-emerald-300 transition-colors hover:bg-emerald-500/15"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M9 12l2 2 4-4M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" />
        </svg>
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Record result"
        description={`vs ${match.Opponent} · ${match.Venue}`}
        action={recordMatchResult}
        size="sm"
        submitLabel="Save result"
      >
        <input type="hidden" name="MatchID" value={match.MatchID} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Home score" required>
            <input
              name="HomeScore"
              type="number"
              min={0}
              required
              defaultValue={match.HomeScore ?? 0}
              className={inputClass}
            />
          </Field>
          <Field label="Away score" required>
            <input
              name="AwayScore"
              type="number"
              min={0}
              required
              defaultValue={match.AwayScore ?? 0}
              className={inputClass}
            />
          </Field>
        </div>
      </FormDialog>
    </>
  );
}
