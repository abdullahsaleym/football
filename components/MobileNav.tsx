"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-slate-950/95 backdrop-blur-xl px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
            FC
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">FCOMS</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </header>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 z-40 cursor-default bg-slate-950/80 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="lg:hidden fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-slate-950 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
                  FC
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">FCOMS</p>
                  <p className="text-xs text-slate-400">Club Operations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
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

            <div className="mx-3 mb-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
                Signed in
              </p>
              <p className="mt-1 text-sm font-semibold text-white">asad_khan</p>
              <p className="text-xs text-slate-400">Admin · UserID 1</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
