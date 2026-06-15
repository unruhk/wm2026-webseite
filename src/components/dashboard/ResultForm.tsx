"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbMatch, DbPlayer, MatchGoal, MatchSubstitution, MatchCard } from "@/lib/supabase/types";

type Props = {
  match: DbMatch;
  players: DbPlayer[];
  onSaved: () => void;
  onCancel: () => void;
};

function calcResult(
  hs: number, as_: number,
  isKo: boolean,
  eths: number | null, etas: number | null,
  phs: number | null, pas: number | null,
): "win" | "draw" | "loss" {
  if (!isKo) return hs > as_ ? "win" : hs < as_ ? "loss" : "draw";
  // KO: Verlängerung?
  if (eths !== null && etas !== null) {
    if (eths > etas) return "win";
    if (eths < etas) return "loss";
    // ET-Unentschieden → Elfmeter
    if (phs !== null && pas !== null) return phs > pas ? "win" : "loss";
  }
  return hs > as_ ? "win" : hs < as_ ? "loss" : "draw";
}

const GOAL_TYPE_LABEL: Record<MatchGoal["type"], string> = {
  regular:   "Tor",
  penalty:   "Elfmeter",
  own_goal:  "Eigentor",
};

const CARD_TYPE_LABEL: Record<MatchCard["type"], string> = {
  yellow:     "🟨 Gelb",
  yellow_red: "🟨🟥 Gelb-Rot",
  red:        "🟥 Rot",
};

export default function ResultForm({ match, players, onSaved, onCancel }: Props) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0);
  const [isKo, setIsKo]           = useState(match.is_ko_round ?? false);
  const [etHome, setEtHome]       = useState(match.extra_time_home ?? 0);
  const [etAway, setEtAway]       = useState(match.extra_time_away ?? 0);
  const [penHome, setPenHome]     = useState(match.penalties_home ?? 0);
  const [penAway, setPenAway]     = useState(match.penalties_away ?? 0);

  const [goals, setGoals]             = useState<MatchGoal[]>(match.goals ?? []);
  const [substitutions, setSubs]       = useState<MatchSubstitution[]>(match.substitutions ?? []);
  const [cards, setCards]             = useState<MatchCard[]>(match.cards ?? []);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const etTied = isKo && etHome !== null && etAway !== null && etHome === etAway;

  async function handleSave() {
    setLoading(true);
    setError(null);

    const result = calcResult(
      homeScore, awayScore, isKo,
      isKo ? etHome : null, isKo ? etAway : null,
      etTied ? penHome : null, etTied ? penAway : null,
    );

    const supabase = createClient();
    const { error: err } = await supabase.from("matches").update({
      home_score:       homeScore,
      away_score:       awayScore,
      result,
      is_ko_round:      isKo,
      extra_time_home:  isKo ? etHome : null,
      extra_time_away:  isKo ? etAway : null,
      penalties_home:   etTied ? penHome : null,
      penalties_away:   etTied ? penAway : null,
      goals,
      substitutions,
      cards,
    }).eq("id", match.id);

    if (err) setError("Fehler: " + err.message);
    else onSaved();
    setLoading(false);
  }

  // ── Hilfsfunktionen für dynamische Listen ────────────────────────────────

  function addGoal() {
    setGoals((prev) => [...prev, { player_id: null, player_name: "", minute: 0, type: "regular" }]);
  }
  function updateGoal(i: number, patch: Partial<MatchGoal>) {
    setGoals((prev) => prev.map((g, idx) => idx === i ? { ...g, ...patch } : g));
  }
  function removeGoal(i: number) {
    setGoals((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addSub() {
    setSubs((prev) => [...prev, { player_out_id: "", player_out_name: "", player_in_id: "", player_in_name: "", minute: 0 }]);
  }
  function updateSub(i: number, patch: Partial<MatchSubstitution>) {
    setSubs((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }
  function removeSub(i: number) {
    setSubs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addCard() {
    setCards((prev) => [...prev, { player_id: "", player_name: "", minute: 0, type: "yellow" }]);
  }
  function updateCard(i: number, patch: Partial<MatchCard>) {
    setCards((prev) => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }
  function removeCard(i: number) {
    setCards((prev) => prev.filter((_, idx) => idx !== i));
  }

  function playerSelectChange(
    playerId: string,
    onId: (id: string) => void,
    onName: (name: string) => void
  ) {
    onId(playerId);
    const p = players.find((pl) => pl.id === playerId);
    onName(p?.name ?? "");
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-6 space-y-6">
      <h3 className="text-white font-semibold">Ergebnis eintragen: {match.opponent}</h3>

      {/* Score */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">DE (Heim)</p>
          <input type="number" min={0} max={20} value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} className={numInput} />
        </div>
        <span className="text-white/40 text-2xl font-bold mt-4">:</span>
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{match.opponent}</p>
          <input type="number" min={0} max={20} value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} className={numInput} />
        </div>
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer mt-4">
          <input type="checkbox" checked={isKo} onChange={(e) => setIsKo(e.target.checked)} className="accent-[#D4AF37]" />
          K.O.-Runde
        </label>
      </div>

      {/* Verlängerung */}
      {isKo && (
        <div className="space-y-3 pl-4 border-l-2 border-[#D4AF37]/30">
          <p className="text-white/50 text-xs uppercase tracking-wider">Verlängerung</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white/30 text-xs mb-1">DE</p>
              <input type="number" min={0} max={20} value={etHome} onChange={(e) => setEtHome(Number(e.target.value))} className={numInput} />
            </div>
            <span className="text-white/40 text-xl font-bold mt-3">:</span>
            <div className="text-center">
              <p className="text-white/30 text-xs mb-1">{match.opponent}</p>
              <input type="number" min={0} max={20} value={etAway} onChange={(e) => setEtAway(Number(e.target.value))} className={numInput} />
            </div>
          </div>
          {etTied && (
            <div className="space-y-2">
              <p className="text-white/50 text-xs uppercase tracking-wider">Elfmeter</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-white/30 text-xs mb-1">DE</p>
                  <input type="number" min={0} max={20} value={penHome} onChange={(e) => setPenHome(Number(e.target.value))} className={numInput} />
                </div>
                <span className="text-white/40 text-xl font-bold mt-3">:</span>
                <div className="text-center">
                  <p className="text-white/30 text-xs mb-1">{match.opponent}</p>
                  <input type="number" min={0} max={20} value={penAway} onChange={(e) => setPenAway(Number(e.target.value))} className={numInput} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Torschützen */}
      <Section title="Torschützen" onAdd={addGoal} addLabel="+ Tor">
        {goals.map((g, i) => (
          <div key={i} className="flex items-center gap-2 flex-wrap">
            <select
              value={g.player_id ?? ""}
              onChange={(e) => playerSelectChange(e.target.value, (id) => updateGoal(i, { player_id: id }), (name) => updateGoal(i, { player_name: name }))}
              className={selectClass}
            >
              <option value="">Spieler</option>
              {players.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number} {p.name}</option>)}
              <option value="__own__">Eigentor (Gegner)</option>
            </select>
            <input type="number" min={0} max={120} value={g.minute} onChange={(e) => updateGoal(i, { minute: Number(e.target.value) })} placeholder="Min." className={minInput} />
            <span className="text-white/30 text-xs">&#39;</span>
            <select value={g.type} onChange={(e) => updateGoal(i, { type: e.target.value as MatchGoal["type"] })} className={selectClass}>
              {Object.entries(GOAL_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <RemoveBtn onClick={() => removeGoal(i)} />
          </div>
        ))}
      </Section>

      {/* Auswechslungen */}
      <Section title="Auswechslungen" onAdd={addSub} addLabel="+ Wechsel">
        {substitutions.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-wrap">
            <span className="text-white/40 text-xs">Raus:</span>
            <select
              value={s.player_out_id}
              onChange={(e) => playerSelectChange(e.target.value, (id) => updateSub(i, { player_out_id: id }), (name) => updateSub(i, { player_out_name: name }))}
              className={selectClass}
            >
              <option value="">Spieler</option>
              {players.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number} {p.name}</option>)}
            </select>
            <span className="text-white/40 text-xs">Rein:</span>
            <select
              value={s.player_in_id}
              onChange={(e) => playerSelectChange(e.target.value, (id) => updateSub(i, { player_in_id: id }), (name) => updateSub(i, { player_in_name: name }))}
              className={selectClass}
            >
              <option value="">Spieler</option>
              {players.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number} {p.name}</option>)}
            </select>
            <input type="number" min={0} max={120} value={s.minute} onChange={(e) => updateSub(i, { minute: Number(e.target.value) })} placeholder="Min." className={minInput} />
            <span className="text-white/30 text-xs">&#39;</span>
            <RemoveBtn onClick={() => removeSub(i)} />
          </div>
        ))}
      </Section>

      {/* Karten */}
      <Section title="Karten" onAdd={addCard} addLabel="+ Karte">
        {cards.map((c, i) => (
          <div key={i} className="flex items-center gap-2 flex-wrap">
            <select
              value={c.player_id}
              onChange={(e) => playerSelectChange(e.target.value, (id) => updateCard(i, { player_id: id }), (name) => updateCard(i, { player_name: name }))}
              className={selectClass}
            >
              <option value="">Spieler</option>
              {players.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number} {p.name}</option>)}
            </select>
            <input type="number" min={0} max={120} value={c.minute} onChange={(e) => updateCard(i, { minute: Number(e.target.value) })} placeholder="Min." className={minInput} />
            <span className="text-white/30 text-xs">&#39;</span>
            <select value={c.type} onChange={(e) => updateCard(i, { type: e.target.value as MatchCard["type"] })} className={selectClass}>
              {Object.entries(CARD_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <RemoveBtn onClick={() => removeCard(i)} />
          </div>
        ))}
      </Section>

      {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg transition-colors cursor-pointer">
          Abbrechen
        </button>
        <button onClick={handleSave} disabled={loading} className="px-5 py-2.5 text-sm font-semibold bg-[#D4AF37] text-black rounded-lg hover:bg-[#c9a42e] transition-colors disabled:opacity-50 cursor-pointer">
          {loading ? "Speichern…" : "Ergebnis speichern"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, onAdd, addLabel, children }: { title: string; onAdd: () => void; addLabel: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{title}</p>
        <button onClick={onAdd} className="text-[#D4AF37] text-xs hover:underline cursor-pointer">{addLabel}</button>
      </div>
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-white/20 hover:text-red-400 transition-colors text-sm cursor-pointer" title="Entfernen">✕</button>
  );
}

const numInput   = "w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-lg font-bold text-center focus:outline-none focus:border-[#D4AF37]";
const selectClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]";
const minInput   = "w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-[#D4AF37]";
