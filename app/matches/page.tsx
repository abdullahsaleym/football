import { Topbar } from "@/components/Topbar";
import { DeleteButton } from "@/components/DeleteButton";
import {
  AddMatchButton,
  RecordResultButton,
} from "@/components/matches/MatchActions";
import { deleteMatch, getMatches } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  Scheduled: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30",
  Completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Postponed: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  Cancelled: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
};

const COMPETITION_STYLES: Record<string, string> = {
  League: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  Cup: "bg-violet-500/10 text-violet-300 ring-violet-400/20",
  FriendlyMatch: "bg-slate-500/10 text-slate-300 ring-slate-400/20",
  EuropeanCompetition: "bg-blue-500/10 text-blue-300 ring-blue-400/20",
};

function formatDate(s: string): { date: string; time: string } {
  const d = new Date(s.replace(" ", "T"));
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <>
      <Topbar
        title="Matches"
        subtitle={`${matches.length} fixture${matches.length === 1 ? "" : "s"} on record`}
      />

      <div className="flex-1 px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Fixtures & Results</h2>
            <p className="text-xs text-slate-400">Newest first</p>
          </div>
          <AddMatchButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/5 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
              No matches scheduled.
            </div>
          )}
          {matches.map((m) => {
            const { date, time } = formatDate(m.MatchDate);
            const competitionStyle =
              COMPETITION_STYLES[m.Competition] ?? "bg-slate-500/10 text-slate-300 ring-slate-400/20";
            const statusStyle =
              STATUS_STYLES[m.MatchStatus] ?? "bg-slate-500/15 text-slate-300 ring-slate-400/30";
            const hasScore = m.HomeScore !== null && m.AwayScore !== null;
            return (
              <div
                key={m.MatchID}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${competitionStyle}`}>
                    {m.Competition}
                  </span>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle}`}>
                    {m.MatchStatus}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-400">{date} · {time}</p>
                  <p className="mt-1 text-lg font-semibold text-white">vs {m.Opponent}</p>
                  <p className="text-xs text-slate-400">{m.HomeOrAway} · {m.Venue}</p>
                </div>

                {hasScore && (
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-white">{m.HomeScore}</span>
                    <span className="text-slate-500">—</span>
                    <span className="text-3xl font-bold tabular-nums text-white">{m.AwayScore}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-1">
                  <RecordResultButton match={m} />
                  <DeleteButton
                    action={deleteMatch}
                    idField="MatchID"
                    idValue={m.MatchID}
                    recordLabel={`vs ${m.Opponent}`}
                    compact
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
