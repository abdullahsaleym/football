export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-slate-950/40 px-6 py-5 lg:px-10 backdrop-blur-xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
          Live · Connected
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
          A
        </div>
      </div>
    </header>
  );
}
