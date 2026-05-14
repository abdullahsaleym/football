"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import { buttonDanger, buttonGhost } from "@/components/FormField";

export function DeleteButton({
  action,
  idField,
  idValue,
  recordLabel,
  triggerLabel = "Delete",
  triggerClass,
  compact = false,
}: {
  action: (formData: FormData) => Promise<void>;
  idField: string;
  idValue: number;
  recordLabel: string;
  triggerLabel?: string;
  triggerClass?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    setError(null);
    const fd = new FormData();
    fd.set(idField, String(idValue));
    startTransition(async () => {
      try {
        await action(fd);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClass ??
          (compact
            ? "rounded-md p-1.5 text-rose-300 transition-colors hover:bg-rose-500/15"
            : buttonDanger)
        }
        aria-label={triggerLabel}
      >
        {compact ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
          </svg>
        ) : (
          triggerLabel
        )}
      </button>
      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Delete ${recordLabel}?`}
        description="This permanently removes the record and any linked rows (contracts, payslips, transfers, medical history). Cannot be undone."
        size="sm"
      >
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
            className={buttonGhost}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className={buttonDanger}
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
}
