"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbMatch, DbPlayer } from "@/lib/supabase/types";
import MatchForm from "@/components/dashboard/MatchForm";
import ResultForm from "@/components/dashboard/ResultForm";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const RESULT_CONFIG = {
  win:  { label: "SIEG",          bg: "bg-green-500/10 border-green-500/30 text-green-400" },
  draw: { label: "UNENTSCHIEDEN", bg: "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]" },
  loss: { label: "NIEDERLAGE",    bg: "bg-red-500/10  border-red-500/30  text-red-400"   },
} as const;

const CARD_SYMBOL: Record<string, string> = {
  yellow: "🟨", yellow_red: "🟨🟥", red: "🟥",
};

export default function MatchesPage() {
  const [teamId, setTeamId]             = useState<string | null>(null);
  const [matches, setMatches]           = useState<DbMatch[]>([]);
  const [players, setPlayers]           = useState<DbPlayer[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [editingMatch, setEditingMatch] = useState<DbMatch | null>(null);
  const [resultMatch, setResultMatch]   = useState<DbMatch | null>(null);
  const [loading, setLoading]           = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: teams } = await supabase.from("teams").select("*").limit(1);
    let currentTeamId: string | null = teams?.[0]?.id ?? null;

    if (!currentTeamId) {
      const { data: created } = await supabase
        .from("teams").insert({ name: `Team von ${user.email}`, coach_email: user.email! })
        .select("id").single();
      currentTeamId = created?.id ?? null;
    }
    setTeamId(currentTeamId);

    if (currentTeamId) {
      const [matchRes, playerRes] = await Promise.all([
        supabase.from("matches").select("*").eq("team_id", currentTeamId).order("match_date", { ascending: true }),
        supabase.from("players").select("*").order("jersey_number"),
      ]);
      setMatches((matchRes.data ?? []) as DbMatch[]);
      setPlayers((playerRes.data ?? []) as DbPlayer[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function deleteMatch(id: string) {
    const supabase = createClient();
    await supabase.from("matches").delete().eq("id", id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  function handleCreated() {
    setShowForm(false);
    setEditingMatch(null);
    setResultMatch(null);
    loadData();
  }

  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.match_date) >= now);
  const past     = matches.filter((m) => new Date(m.match_date) <  now);
  const showingInlineForm = showForm || !!editingMatch || !!resultMatch;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#D4AF37] text-sm font-medium uppercase tracking-widest mb-1">Spiel-Kalender</p>
          <h1 className="text-3xl font-bold text-white">Spiele</h1>
        </div>
        {!showingInlineForm && (
          <button onClick={() => setShowForm(true)} className="bg-[#D4AF37] text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#c9a42e] transition-colors cursor-pointer">
            + Spiel hinzufügen
          </button>
        )}
      </div>

      {/* Formulare */}
      {showForm && teamId && (
        <MatchForm teamId={teamId} onCreated={handleCreated} onCancel={() => setShowForm(false)} />
      )}
      {editingMatch && (
        <MatchForm mode="edit" match={editingMatch} onCreated={handleCreated} onCancel={() => setEditingMatch(null)} />
      )}
      {resultMatch && (
        <ResultForm match={resultMatch} players={players} onSaved={handleCreated} onCancel={() => setResultMatch(null)} />
      )}

      {loading && <p className="text-white/30 text-sm">Lade Spiele…</p>}

      {!loading && (
        <Section title="Bevorstehende Spiele" count={upcoming.length}>
          {upcoming.length === 0
            ? <EmptyState text="Noch keine Spiele geplant." />
            : upcoming.map((m) => (
                <MatchCard key={m.id} match={m}
                  onEdit={() => setEditingMatch(m)}
                  onDelete={deleteMatch}
                  onResult={() => setResultMatch(m)}
                />
              ))}
        </Section>
      )}

      {!loading && past.length > 0 && (
        <Section title="Vergangene Spiele" count={past.length}>
          {past.map((m) => (
            <MatchCard key={m.id} match={m}
              onEdit={() => setEditingMatch(m)}
              onDelete={deleteMatch}
              onResult={() => setResultMatch(m)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

// ── Teilkomponenten ───────────────────────────────────────────────────────────

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">
        {title}<span className="ml-2 text-sm text-white/30 font-normal">({count})</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MatchCard({ match, onEdit, onDelete, onResult }: {
  match: DbMatch;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onResult: () => void;
}) {
  const isPast    = new Date(match.match_date) < new Date();
  const hasResult = match.result !== null;
  const rc = hasResult ? RESULT_CONFIG[match.result!] : null;
  const score = hasResult ? `${match.home_score}:${match.away_score}` : null;
  let extraScore = "";
  if (hasResult && match.is_ko_round && match.extra_time_home !== null) {
    extraScore = ` (n.V. ${match.extra_time_home}:${match.extra_time_away})`;
    if (match.penalties_home !== null) extraScore += ` (n.E. ${match.penalties_home}:${match.penalties_away})`;
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl px-5 py-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold">{match.opponent}</p>
            {match.formation && !hasResult && (
              <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-2.5 py-0.5">{match.formation}</span>
            )}
          </div>
          <p className="text-white/40 text-sm mt-0.5">
            {formatDate(match.match_date)}{match.location ? ` · ${match.location}` : ""}
          </p>
          {match.notes && <p className="text-white/30 text-xs mt-1 line-clamp-1">{match.notes}</p>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {score && <span className="text-white font-mono font-bold text-lg">{score}{extraScore}</span>}
          {rc && <span className={`text-xs font-bold border rounded-full px-2.5 py-0.5 ${rc.bg}`}>{rc.label}</span>}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit} title="Bearbeiten" className="text-white/20 hover:text-[#D4AF37] transition-colors p-1 cursor-pointer text-base">✎</button>
          <button onClick={() => onDelete(match.id)} title="Löschen" className="text-white/20 hover:text-red-400 transition-colors p-1 cursor-pointer">✕</button>
        </div>
      </div>

      {/* Torschützen */}
      {match.goals && match.goals.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {match.goals.map((g, i) => (
            <span key={i} className="text-white/50 text-xs">
              ⚽ {g.player_name || "?"} <span className="text-white/30">{g.minute}&#39;</span>
              {g.type !== "regular" && <span className="text-white/30"> ({g.type === "penalty" ? "E" : "ET"})</span>}
            </span>
          ))}
        </div>
      )}

      {/* Karten */}
      {match.cards && match.cards.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {match.cards.map((c, i) => (
            <span key={i} className="text-white/50 text-xs">
              {CARD_SYMBOL[c.type]} {c.player_name || "?"} <span className="text-white/30">{c.minute}&#39;</span>
            </span>
          ))}
        </div>
      )}

      {/* Auswechslungen */}
      {match.substitutions && match.substitutions.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {match.substitutions.map((s, i) => (
            <span key={i} className="text-white/50 text-xs">
              ↕ {s.player_out_name} → {s.player_in_name} <span className="text-white/30">{s.minute}&#39;</span>
            </span>
          ))}
        </div>
      )}

      {isPast && (
        <button onClick={onResult} className="text-xs text-[#D4AF37] hover:underline cursor-pointer">
          {hasResult ? "Ergebnis bearbeiten →" : "Ergebnis eintragen →"}
        </button>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-8 text-center">
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  );
}
