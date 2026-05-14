"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col border-r border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
          FC
        </div>
        <div>
          <p className="text-sm font-semibold text-white tracking-tight">FCOMS</p>
          <p className="text-xs text-slate-400">Club Operations</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-white shadow-inner shadow-emerald-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-gradient-to-b from-emerald-400 to-cyan-400" />
              )}
              <span className={active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-200"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-6 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
          Signed in
        </p>
        <p className="mt-1 text-sm font-semibold text-white">asad_khan</p>
        <p className="text-xs text-slate-400">Admin · UserID 1</p>
      </div>
    </aside>
  );
}
