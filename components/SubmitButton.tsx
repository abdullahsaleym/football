"use client";

import { useFormStatus } from "react-dom";
import { buttonPrimary } from "@/components/FormField";

export function SubmitButton({
  label = "Save",
  pendingLabel = "Saving…",
  className,
}: {
  label?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? buttonPrimary}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
