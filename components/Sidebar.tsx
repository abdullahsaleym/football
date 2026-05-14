"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d={d} />
    </svg>
  );
}

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Players",
    href: "/players",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: "Staff",
    href: "/staff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <circle cx="9" cy="9" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        <path d="M15 20c0-2.2 2.2-4 5-4s2 .9 2 2" />
      </svg>
    ),
  },
  { label: "Contracts", href: "/contracts", icon: <Icon d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" /> },
  { label: "Payroll", href: "/payroll", icon: <Icon d="M3 8h18M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M3 8l3-4h12l3 4M12 13v3M9 13.5h6" /> },
  { label: "Transfers", href: "/transfers", icon: <Icon d="M7 7h13M7 7l4-4M7 7l4 4M17 17H4M17 17l-4 4M17 17l-4-4" /> },
  { label: "Matches", href: "/matches", icon: <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6l1.5 3 3 .5-2 2.5.5 3.5L12 14l-3 1.5.5-3.5-2-2.5 3-.5z" /> },
  { label: "Medical", href: "/medical", icon: <Icon d="M9 2h6v6h6v6h-6v6H9v-6H3V8h6z" /> },
];

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
        {NAV.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-white shadow-inner shadow-emerald-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-gradient-to-b from-emerald-400 to-cyan-400" />
              )}
              <span
                className={
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-500 group-hover:text-slate-200"
                }
              >
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
