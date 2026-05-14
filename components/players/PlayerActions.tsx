"use client";

import { useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary } from "@/components/FormField";
import type { PlayerRow } from "@/lib/actions";
import { createPlayer, updatePlayer } from "@/lib/actions";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"] as const;
const STATUSES = ["Active", "Injured", "Suspended", "OnLoan", "Released"] as const;

function PlayerFields({ player }: { player?: PlayerRow }) {
  return (
    <>
      {player && <input type="hidden" name="PlayerID" value={player.PlayerID} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" required className="sm:col-span-2">
          <input
            name="FullName"
            required
            maxLength={100}
            defaultValue={player?.FullName ?? ""}
            className={inputClass}
            placeholder="e.g. Lionel Messi"
          />
        </Field>
        <Field label="Date of birth" required>
          <input
            name="DateOfBirth"
            type="date"
            required
            defaultValue={player?.DateOfBirth?.slice(0, 10) ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Nationality" required>
          <input
            name="Nationality"
            required
            maxLength={60}
            defaultValue={player?.Nationality ?? ""}
            className={inputClass}
            placeholder="e.g. Argentina"
          />
        </Field>
        <Field label="Position" required>
          <select
            name="Position"
            required
            defaultValue={player?.Position ?? "Midfielder"}
            className={selectClass}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Squad number" hint="Optional · must be unique">
          <input
            name="SquadNumber"
            type="number"
            min={1}
            max={99}
            defaultValue={player?.SquadNumber ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Status" required>
          <select
            name="Status"
            required
            defaultValue={player?.Status ?? "Active"}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date joined" required>
          <input
            name="DateJoined"
            type="date"
            required
            defaultValue={player?.DateJoined?.slice(0, 10) ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
    </>
  );
}

export function AddPlayerButton() {
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
        Add Player
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add new player"
        description="Register a player into the squad"
        action={createPlayer}
        submitLabel="Add Player"
      >
        <PlayerFields />
      </FormDialog>
    </>
  );
}

export function EditPlayerButton({ player }: { player: PlayerRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Edit player"
        className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit ${player.FullName}`}
        action={updatePlayer}
        submitLabel="Save changes"
      >
        <PlayerFields player={player} />
      </FormDialog>
    </>
  );
}
