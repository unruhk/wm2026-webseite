"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbMatch } from "@/lib/supabase/types";
import MatchForm from "@/components/dashboard/MatchForm";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchesPage() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Team laden oder anlegen, dann Spiele laden
  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Team suchen oder erstellen
    const { data: teams } = await supabase.from("teams").select("*").limit(1);
    let currentTeamId: string | null = teams?.[0]?.id ?? null;

    if (!currentTeamId) {
      const { data: created } = await supabase
        .from("teams")
        .insert({ name: `Team von ${user.email}`, coach_email: user.email! })
        .select("id")
        .single();
      currentTeamId = created?.id ?? null;
    }

    setTeamId(currentTeamId);

    if (currentTeamId) {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .eq("team_id", currentTeamId)
        .order("match_date", { ascending: true });
      setMatches((data ?? []) as DbMatch[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function deleteMatch(id: string) {
    const supabase = createClient();
    await supabase.from("matches").delete().eq("id", id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.match_date) >= now);
  const past     = matches.filter((m) => new Date(m.match_date) <  now);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#D4AF37] text-sm font-medium uppercase tracking-widest mb-1">Spiel-Kalender</p>
          <h1 className="text-3xl font-bold text-white">Spiele</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#D4AF37] text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#c9a42e] transition-colors cursor-pointer"
          >
            + Spiel hinzufügen
          </button>
        )}
      </div>

      {/* Formular */}
      {showForm && teamId && (
        <MatchForm
          teamId={teamId}
          onCreated={() => { setShowForm(false); loadData(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && (
        <p className="text-white/30 text-sm">Lade Spiele…</p>
      )}

      {/* Bevorstehende Spiele */}
      {!loading && (
        <Section title="Bevorstehende Spiele" count={upcoming.length}>
          {upcoming.length === 0 ? (
            <EmptyState text="Noch keine Spiele geplant." />
          ) : (
            upcoming.map((m) => (
              <MatchCard key={m.id} match={m} onDelete={deleteMatch} />
            ))
          )}
        </Section>
      )}

      {/* Vergangene Spiele */}
      {!loading && past.length > 0 && (
        <Section title="Vergangene Spiele" count={past.length}>
          {past.map((m) => (
            <MatchCard key={m.id} match={m} onDelete={deleteMatch} dimmed />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title, count, children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">
        {title}
        <span className="ml-2 text-sm text-white/30 font-normal">({count})</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MatchCard({
  match,
  onDelete,
  dimmed = false,
}: {
  match: DbMatch;
  onDelete: (id: string) => void;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`bg-white/3 border border-white/8 rounded-xl px-5 py-4 flex items-start justify-between gap-4 ${
        dimmed ? "opacity-50" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-white font-semibold">{match.opponent}</p>
          {match.formation && (
            <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-2.5 py-0.5">
              {match.formation}
            </span>
          )}
        </div>
        <p className="text-white/40 text-sm mt-0.5">
          {formatDate(match.match_date)}
          {match.location ? ` · ${match.location}` : ""}
        </p>
        {match.notes && (
          <p className="text-white/30 text-xs mt-1 line-clamp-1">{match.notes}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(match.id)}
        title="Spiel löschen"
        className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0 mt-0.5 cursor-pointer"
      >
        ✕
      </button>
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
