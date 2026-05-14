export function Field({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "block w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20";

export const selectClass = inputClass + " appearance-none";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0";

export const buttonGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10";

export const buttonDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-300 ring-1 ring-inset ring-rose-400/30 transition-colors hover:bg-rose-500/25";
