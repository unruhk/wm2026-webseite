"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FORMATIONS, FORMATION_KEYS, type Position } from "@/lib/data/formations";
import type { DbPlayer } from "@/lib/supabase/types";

type Lineup = Record<string, string>; // positionLabel → playerId

export default function LineupEditor() {
  const [formation, setFormation] = useState<string>("4-3-3");
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [lineup, setLineup] = useState<Lineup>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("players")
      .select("*")
      .order("jersey_number")
      .then(({ data }) => setPlayers((data ?? []) as DbPlayer[]));
  }, []);

  // Formation wechseln → Aufstellung zurücksetzen
  function handleFormationChange(f: string) {
    setFormation(f);
    setLineup({});
    setSaved(false);
  }

  function assignPlayer(positionLabel: string, playerId: string) {
    setLineup((prev) => {
      const next = { ...prev };
      // Falls der Spieler schon woanders zugewiesen ist, dort entfernen
      Object.keys(next).forEach((k) => {
        if (next[k] === playerId && k !== positionLabel) delete next[k];
      });
      if (playerId === "") {
        delete next[positionLabel];
      } else {
        next[positionLabel] = playerId;
      }
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    // Für die Demo: in localStorage speichern
    localStorage.setItem(
      "wm2026_lineup",
      JSON.stringify({ formation, lineup })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const positions = FORMATIONS[formation]?.positions ?? [];
  const assignedIds = new Set(Object.values(lineup));

  return (
    <div className="space-y-8">
      {/* Formation-Picker */}
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
          Formation wählen
        </p>
        <div className="flex flex-wrap gap-2">
          {FORMATION_KEYS.map((f) => (
            <button
              key={f}
              onClick={() => handleFormationChange(f)}
              className={`px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all cursor-pointer ${
                f === formation
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Spielfeld + Dropdowns */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SVG-Spielfeld */}
        <div className="w-full max-w-xs flex-shrink-0">
          <PitchSVG positions={positions} lineup={lineup} players={players} />
        </div>

        {/* Positions-Dropdowns */}
        <div className="flex-1 w-full">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
            Spieler zuweisen
          </p>
          <div className="space-y-2">
            {positions.map((pos) => {
              const assignedId = lineup[pos.label] ?? "";
              return (
                <div
                  key={pos.label}
                  className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3"
                >
                  <span className="text-xs font-mono font-bold text-[#D4AF37] w-12 flex-shrink-0">
                    {pos.label}
                  </span>
                  <select
                    value={assignedId}
                    onChange={(e) => assignPlayer(pos.label, e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#111]">Nicht belegt</option>
                    {players.map((p) => {
                      const takenByOther = assignedIds.has(p.id) && lineup[pos.label] !== p.id;
                      return (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={takenByOther}
                          className="bg-[#111]"
                        >
                          {takenByOther ? "✗ " : ""}#{p.jersey_number} {p.name} ({p.position})
                        </option>
                      );
                    })}
                  </select>
                  {assignedId && (
                    <button
                      onClick={() => assignPlayer(pos.label, "")}
                      className="text-white/20 hover:text-white/60 transition-colors text-sm cursor-pointer"
                      title="Zuweisung entfernen"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Speichern */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="bg-[#D4AF37] text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#c9a42e] transition-colors cursor-pointer"
            >
              Aufstellung speichern
            </button>
            {saved && (
              <span className="text-[#D4AF37] text-sm">✓ Gespeichert</span>
            )}
          </div>
          <p className="text-white/20 text-xs mt-2">
            Wird lokal auf diesem Gerät gespeichert.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SVG-Spielfeld ────────────────────────────────────────────────────────────

function PitchSVG({
  positions,
  lineup,
  players,
}: {
  positions: Position[];
  lineup: Lineup;
  players: DbPlayer[];
}) {
  const W = 60;
  const H = 90;

  function playerName(posLabel: string): string {
    const id = lineup[posLabel];
    if (!id) return "";
    const p = players.find((pl) => pl.id === id);
    return p ? p.name.split(" ").pop() ?? p.name : "";
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-xl overflow-hidden"
      style={{ background: "#1a3a1a" }}
    >
      {/* Streifen */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect
          key={i}
          x={0}
          y={i * 10}
          width={60}
          height={10}
          fill={i % 2 === 0 ? "#1d401d" : "#1a3a1a"}
        />
      ))}

      {/* Außenlinie */}
      <rect x={2} y={2} width={56} height={86} fill="none" stroke="#4a7c4a" strokeWidth={0.6} rx={0.5} />

      {/* Mittellinie + Kreis */}
      <line x1={2} y1={45} x2={58} y2={45} stroke="#4a7c4a" strokeWidth={0.5} />
      <circle cx={30} cy={45} r={7} fill="none" stroke="#4a7c4a" strokeWidth={0.5} />
      <circle cx={30} cy={45} r={0.6} fill="#4a7c4a" />

      {/* Strafraum oben */}
      <rect x={13} y={2} width={34} height={13} fill="none" stroke="#4a7c4a" strokeWidth={0.5} />
      {/* Tor oben */}
      <rect x={22} y={0} width={16} height={3} fill="none" stroke="#6a9c6a" strokeWidth={0.5} />

      {/* Strafraum unten */}
      <rect x={13} y={75} width={34} height={13} fill="none" stroke="#4a7c4a" strokeWidth={0.5} />
      {/* Tor unten */}
      <rect x={22} y={87} width={16} height={3} fill="none" stroke="#6a9c6a" strokeWidth={0.5} />

      {/* Positions-Slots */}
      {positions.map((pos) => {
        const cx = pos.x * W;
        const cy = pos.y * H;
        const isAssigned = !!lineup[pos.label];
        const name = playerName(pos.label);

        return (
          <g key={pos.label}>
            {/* Glow-Ring */}
            {isAssigned && (
              <circle cx={cx} cy={cy} r={4} fill="#D4AF3730" />
            )}
            {/* Haupt-Kreis */}
            <circle
              cx={cx}
              cy={cy}
              r={2.8}
              fill={isAssigned ? "#D4AF37" : "#ffffff22"}
              stroke={isAssigned ? "#D4AF37" : "#ffffff44"}
              strokeWidth={0.5}
            />
            {/* Position-Label */}
            <text
              x={cx}
              y={cy + 0.9}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={1.8}
              fontWeight="bold"
              fill={isAssigned ? "#000" : "#fff"}
            >
              {pos.label}
            </text>
            {/* Spielername darunter */}
            {name && (
              <text
                x={cx}
                y={cy + 5.2}
                textAnchor="middle"
                fontSize={2.2}
                fill="#D4AF37"
              >
                {name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
