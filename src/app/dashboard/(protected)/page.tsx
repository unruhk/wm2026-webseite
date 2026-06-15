import { createClient } from "@/lib/supabase/server";
import type { DbMatch } from "@/lib/supabase/types";
import CoachNameEditor from "@/components/dashboard/CoachNameEditor";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const RESULT_LABEL: Record<string, { label: string; color: string }> = {
  win:  { label: "SIEG",          color: "text-green-400 bg-green-400/10 border-green-400/20" },
  draw: { label: "UNENTSCHIEDEN", color: "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20" },
  loss: { label: "NIEDERLAGE",    color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .limit(1);

  const team = teams?.[0] ?? null;

  let upcomingMatches: DbMatch[] = [];
  let totalMatches = 0;

  if (team) {
    const { data: matches, count } = await supabase
      .from("matches")
      .select("*", { count: "exact" })
      .eq("team_id", team.id)
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(3);

    upcomingMatches = (matches ?? []) as DbMatch[];
    totalMatches = count ?? 0;
  }

  const email = user?.email ?? "";
  const displayName = team?.coach_name ?? email.split("@")[0];

  return (
    <div className="space-y-8">
      {/* Willkommen */}
      {team ? (
        <CoachNameEditor
          teamId={team.id}
          initialName={displayName}
          email={email}
        />
      ) : (
        <div>
          <p className="text-[#D4AF37] text-sm font-medium uppercase tracking-widest mb-1">
            Willkommen zurück
          </p>
          <h1 className="text-3xl font-bold text-white">{displayName}</h1>
          <p className="text-white/40 text-sm mt-1">{email}</p>
        </div>
      )}

      {/* Stats-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Spiele geplant"
          value={String(totalMatches)}
          sub={team ? `Team: ${team.name}` : "Noch kein Team"}
        />
        <StatCard
          label="Nächstes Spiel"
          value={upcomingMatches[0]?.opponent ?? "—"}
          sub={upcomingMatches[0] ? formatDate(upcomingMatches[0].match_date) : "Kein Spiel geplant"}
        />
        <StatCard
          label="Formation"
          value={upcomingMatches[0]?.formation ?? "—"}
          sub="Nächstes geplantes Spiel"
        />
      </div>

      {/* Nächste Spiele */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Nächste Spiele</h2>
        {upcomingMatches.length === 0 ? (
          <div className="bg-white/3 border border-white/8 rounded-xl p-8 text-center">
            <p className="text-white/40 text-sm">Noch keine Spiele geplant.</p>
            <a href="/dashboard/matches" className="inline-block mt-3 text-[#D4AF37] text-sm hover:underline">
              Jetzt Spiel hinzufügen →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
            {totalMatches > 3 && (
              <a href="/dashboard/matches" className="block text-center text-[#D4AF37] text-sm mt-2 hover:underline">
                Alle {totalMatches} Spiele anzeigen →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white text-2xl font-bold truncate">{value}</p>
      <p className="text-white/30 text-xs mt-1 truncate">{sub}</p>
    </div>
  );
}

function MatchRow({ match }: { match: DbMatch }) {
  const resultInfo = match.result ? RESULT_LABEL[match.result] : null;
  const score = match.home_score !== null && match.away_score !== null
    ? `${match.home_score}:${match.away_score}`
    : null;

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-white font-semibold">{match.opponent}</p>
        <p className="text-white/40 text-sm mt-0.5">
          {formatDate(match.match_date)}
          {match.location ? ` · ${match.location}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {score && <span className="text-white font-mono font-bold">{score}</span>}
        {resultInfo ? (
          <span className={`text-xs font-bold border rounded-full px-2.5 py-0.5 ${resultInfo.color}`}>
            {resultInfo.label}
          </span>
        ) : match.formation ? (
          <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-3 py-1">
            {match.formation}
          </span>
        ) : null}
      </div>
    </div>
  );
}
