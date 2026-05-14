import type { PlayerStatus } from "@/lib/actions";

const STYLES: Record<PlayerStatus, string> = {
  Active:
    "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
  Injured:
    "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30",
  Suspended:
    "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  OnLoan:
    "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-400/30",
  Released:
    "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-400/30",
};

const DOTS: Record<PlayerStatus, string> = {
  Active: "bg-emerald-400",
  Injured: "bg-rose-400",
  Suspended: "bg-amber-400",
  OnLoan: "bg-cyan-400",
  Released: "bg-slate-400",
};

const LABELS: Record<PlayerStatus, string> = {
  Active: "Active",
  Injured: "Injured",
  Suspended: "Suspended",
  OnLoan: "On Loan",
  Released: "Released",
};

export function StatusBadge({ status }: { status: PlayerStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      <span className={`size-1.5 rounded-full ${DOTS[status]}`} />
      {LABELS[status]}
    </span>
  );
}
