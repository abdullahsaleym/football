import type { ReactNode } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
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

export const NAV_ITEMS: NavItem[] = [
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

export function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");
}
