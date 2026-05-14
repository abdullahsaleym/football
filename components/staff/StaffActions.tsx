"use client";

import { useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Field, inputClass, selectClass, buttonPrimary } from "@/components/FormField";
import type { StaffRow, UserOption } from "@/lib/actions";
import { createStaff, updateStaff } from "@/lib/actions";

const ROLES = [
  "HeadCoach",
  "AssistantCoach",
  "Physiotherapist",
  "Doctor",
  "FinanceOfficer",
  "Administrator",
] as const;
const DEPARTMENTS = ["Coaching", "Medical", "Finance", "Administration"] as const;

function StaffFields({
  staff,
  users,
}: {
  staff?: StaffRow;
  users: UserOption[];
}) {
  return (
    <>
      {staff && <input type="hidden" name="StaffID" value={staff.StaffID} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" required className="sm:col-span-2">
          <input
            name="FullName"
            required
            maxLength={100}
            defaultValue={staff?.FullName ?? ""}
            className={inputClass}
          />
        </Field>
        {!staff && (
          <Field label="User account" required>
            <select name="UserID" required className={selectClass} defaultValue="">
              <option value="" disabled>Select user…</option>
              {users.map((u) => (
                <option key={u.UserID} value={u.UserID}>
                  {u.Username}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Role" required>
          <select
            name="Role"
            required
            defaultValue={staff?.Role ?? "HeadCoach"}
            className={selectClass}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Department" required>
          <select
            name="Department"
            required
            defaultValue={staff?.Department ?? "Coaching"}
            className={selectClass}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Phone" required>
          <input
            name="Phone"
            required
            maxLength={20}
            defaultValue={staff?.Phone ?? ""}
            className={inputClass}
            placeholder="+92-300-1234567"
          />
        </Field>
        <Field label="Email" required>
          <input
            name="Email"
            type="email"
            required
            maxLength={100}
            defaultValue={staff?.Email ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Date joined" required>
          <input
            name="DateJoined"
            type="date"
            required
            defaultValue={staff?.DateJoined?.slice(0, 10) ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Active" className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="IsActive"
              defaultChecked={staff ? staff.IsActive === 1 : true}
              className="size-4 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400/40"
            />
            Currently employed
          </label>
        </Field>
      </div>
    </>
  );
}

export function AddStaffButton({ users }: { users: UserOption[] }) {
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
        Add Staff
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add staff member"
        action={createStaff}
        submitLabel="Add Staff"
      >
        <StaffFields users={users} />
      </FormDialog>
    </>
  );
}

export function EditStaffButton({
  staff,
  users,
}: {
  staff: StaffRow;
  users: UserOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Edit staff"
        className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      </button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit ${staff.FullName}`}
        action={updateStaff}
        submitLabel="Save changes"
      >
        <StaffFields staff={staff} users={users} />
      </FormDialog>
    </>
  );
}
