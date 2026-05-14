"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import { buttonGhost, buttonPrimary } from "@/components/FormField";

export function FormDialog({
  open,
  onClose,
  title,
  description,
  action,
  submitLabel = "Save",
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      title={title}
      description={description}
      size={size}
    >
      <form action={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={buttonGhost}
          >
            Cancel
          </button>
          <button type="submit" disabled={pending} className={buttonPrimary}>
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
