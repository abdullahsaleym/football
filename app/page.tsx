import { Topbar } from "@/components/Topbar";
import { getDashboardStats } from "@/lib/actions";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

type KpiCardProps = {
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "cyan" | "violet" | "amber";
  icon: React.ReactNode;
};

const ACCENTS: Record<KpiCardProps["accent"], { ring: string; gradient: string; text: string; glow: string }> = {
  emerald: {
    ring: "ring-emerald-500/20",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  cyan: {
    ring: "ring-cyan-500/20",
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
  violet: {
    ring: "ring-violet-500/20",
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    text: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
  amber: {
    ring: "ring-amber-500/20",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
};

function KpiCard({ label, value, hint, accent, icon }: KpiCardProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-6 ring-1 ${a.ring} shadow-xl ${a.glow} backdrop-blur-sm transition-transform hover:-translate-y-0.5`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.gradient}`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <span className={`flex size-9 items-center justify-center rounded-xl bg-white/5 ${a.text}`}>
            {icon}
          </span>
        </div>
        <p className="mt-4 text-4xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const monthlyWage = stats.totalWeeklyWage * 4.33;

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Real-time overview of the squad, staff, and wage commitments"
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Players"
            value={stats.totalPlayers.toString()}
            hint="Across all squad statuses"
            accent="emerald"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            }
          />
          <KpiCard
            label="Total Staff"
            value={stats.totalStaff.toString()}
            hint="Active coaching, medical & admin"
            accent="cyan"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <circle cx="9" cy="9" r="3" />
                <circle cx="17" cy="10" r="2.5" />
                <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
                <path d="M15 20c0-2.2 2.2-4 5-4s2 .9 2 2" />
              </svg>
            }
          />
          <KpiCard
            label="Weekly Wage Bill"
            value={compactCurrency.format(stats.totalWeeklyWage)}
            hint={`Monthly est. ${compactCurrency.format(monthlyWage)}`}
            accent="violet"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <circle cx="12" cy="12.5" r="2.5" />
              </svg>
            }
          />
          <KpiCard
            label="Active Contracts"
            value={stats.activeContracts.toString()}
            hint="Players & staff combined"
            accent="amber"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6M9 17h4" />
              </svg>
            }
          />
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Wage Commitment</h2>
                <p className="text-sm text-slate-400">All active contracts, normalized to weekly</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                Live
              </span>
            </div>
            <p className="mt-6 text-5xl font-bold tracking-tight text-white">
              {currencyFormatter.format(stats.totalWeeklyWage)}
              <span className="ml-2 text-base font-medium text-slate-400">/ week</span>
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Monthly est.</p>
                <p className="mt-1 text-base font-semibold text-white">{compactCurrency.format(monthlyWage)}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Yearly est.</p>
                <p className="mt-1 text-base font-semibold text-white">{compactCurrency.format(stats.totalWeeklyWage * 52)}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Active deals</p>
                <p className="mt-1 text-base font-semibold text-white">{stats.activeContracts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/70 to-emerald-950/40 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white">Squad Pulse</h2>
            <p className="text-sm text-slate-400">Roster snapshot</p>
            <div className="mt-6 space-y-3">
              <RosterRow label="Registered players" value={stats.totalPlayers} accent="emerald" />
              <RosterRow label="Staff on duty" value={stats.totalStaff} accent="cyan" />
              <RosterRow label="Active contracts" value={stats.activeContracts} accent="violet" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function RosterRow({ label, value, accent }: { label: string; value: number; accent: "emerald" | "cyan" | "violet" }) {
  const dot = {
    emerald: "bg-emerald-400",
    cyan: "bg-cyan-400",
    violet: "bg-violet-400",
  }[accent];
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`size-2 rounded-full ${dot}`} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="text-base font-semibold text-white">{value}</span>
    </div>
  );
}
