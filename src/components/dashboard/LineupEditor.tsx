"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { FORMATIONS, FORMATION_KEYS } from "@/lib/data/formations";
import type { DbPlayer, DbMatch, MatchLineup } from "@/lib/supabase/types";

// ── Typen ─────────────────────────────────────────────────────────────────────

type Starters = Record<string, string>; // positionLabel → playerId

// ── Pitch-SVG (Hintergrund, nur visuell) ─────────────────────────────────────

function PitchBackground({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 90" className={className} aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={0} y={i * 10} width={60} height={10} fill={i % 2 === 0 ? "#1d401d" : "#1a3a1a"} />
      ))}
      <rect x={2} y={2} width={56} height={86} fill="none" stroke="#4a7c4a" strokeWidth={0.6} rx={0.5} />
      <line x1={2} y1={45} x2={58} y2={45} stroke="#4a7c4a" strokeWidth={0.5} />
      <circle cx={30} cy={45} r={7} fill="none" stroke="#4a7c4a" strokeWidth={0.5} />
      <circle cx={30} cy={45} r={0.6} fill="#4a7c4a" />
      <rect x={13} y={2}  width={34} height={13} fill="none" stroke="#4a7c4a" strokeWidth={0.5} />
      <rect x={22} y={0}  width={16} height={3}  fill="none" stroke="#6a9c6a" strokeWidth={0.5} />
      <rect x={13} y={75} width={34} height={13} fill="none" stroke="#4a7c4a" strokeWidth={0.5} />
      <rect x={22} y={87} width={16} height={3}  fill="none" stroke="#6a9c6a" strokeWidth={0.5} />
    </svg>
  );
}

// ── Spieler-Avatar ────────────────────────────────────────────────────────────

function PlayerAvatar({ player, size = "md", dragging = false }: {
  player: DbPlayer;
  size?: "sm" | "md";
  dragging?: boolean;
}) {
  const isSmall = size === "sm";
  return (
    <div className={`flex flex-col items-center ${isSmall ? "gap-0.5" : "gap-1"} ${dragging ? "opacity-80" : ""}`}>
      <div
        className={`rounded-full flex items-center justify-center font-bold text-white relative flex-shrink-0 ${
          isSmall ? "w-8 h-8 text-xs" : "w-12 h-12 text-sm"
        }`}
        style={{ background: `linear-gradient(135deg, ${player.accent_color}66, ${player.accent_color}22)`, border: `2px solid ${player.accent_color}88` }}
      >
        {player.jersey_number}
      </div>
      <span className={`text-white font-medium leading-none text-center max-w-full truncate ${isSmall ? "text-[9px]" : "text-[10px]"}`}>
        {player.name.split(" ").pop()}
      </span>
      {!isSmall && (
        <span className="text-white/40 text-[9px] leading-none">{player.position.substring(0, 3)}</span>
      )}
    </div>
  );
}

// ── Draggable Spieler-Karte (aus dem Pool) ───────────────────────────────────

function DraggablePlayer({ player }: { player: DbPlayer }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: player.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing bg-white/5 border border-white/10 rounded-xl p-2 touch-none select-none ${isDragging ? "opacity-30" : "hover:border-white/30 hover:bg-white/8"} transition-all`}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <PlayerAvatar player={player} />
    </div>
  );
}

// ── Droppable Positions-Slot auf dem Spielfeld ────────────────────────────────

function PositionSlot({ slotId, label, player, onClear }: {
  slotId: string;
  label: string;
  player?: DbPlayer;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <div
      ref={setNodeRef}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${isOver ? "scale-110" : ""} transition-transform`}
    >
      {player ? (
        <div className="relative group">
          <PlayerAvatar player={player} size="sm" />
          <button
            onClick={onClear}
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] items-center justify-center hidden group-hover:flex cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
          isOver
            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
            : "bg-white/10 border-white/30 text-white/60"
        }`}>
          {label}
        </div>
      )}
    </div>
  );
}

// ── Droppable Ersatzbank ──────────────────────────────────────────────────────

function BenchZone({ players, onRemove }: { players: DbPlayer[]; onRemove: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: "bench" });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-16 rounded-xl border-2 border-dashed p-3 flex flex-wrap gap-2 transition-all ${
        isOver ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/15"
      }`}
    >
      {players.length === 0 && (
        <p className="text-white/20 text-xs w-full text-center self-center">Ersatzspieler hierher ziehen</p>
      )}
      {players.map((p) => (
        <div key={p.id} className="relative group">
          <div className="bg-white/5 border border-white/10 rounded-lg p-1.5">
            <PlayerAvatar player={p} size="sm" />
          </div>
          <button
            onClick={() => onRemove(p.id)}
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] items-center justify-center hidden group-hover:flex cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Droppable Pool-Zone ────────────────────────────────────────────────────────

function PoolZone({ players }: { players: DbPlayer[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-20 rounded-xl p-2 flex flex-wrap gap-2 transition-all ${isOver ? "bg-white/5" : ""}`}
    >
      {players.length === 0 && (
        <p className="text-white/20 text-xs w-full text-center self-center py-3">Alle Spieler zugewiesen</p>
      )}
      {players.map((p) => <DraggablePlayer key={p.id} player={p} />)}
    </div>
  );
}

// ── Sortierbare Elfmeter-Liste ────────────────────────────────────────────────

function SortablePenaltyItem({ id, player, rank }: { id: string; player?: DbPlayer; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-2 cursor-grab active:cursor-grabbing touch-none select-none"
      {...attributes}
      {...listeners}
    >
      <span className="text-[#D4AF37] text-xs font-bold w-5 text-center">{rank}.</span>
      {player ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: player.accent_color + "44", border: `1px solid ${player.accent_color}66` }}>
            {player.jersey_number}
          </div>
          <span className="text-white text-sm">{player.name}</span>
        </div>
      ) : (
        <span className="text-white/30 text-sm italic">Unbekannter Spieler</span>
      )}
      <span className="ml-auto text-white/20 text-xs">≡</span>
    </div>
  );
}

// ── Haupt-Komponente ──────────────────────────────────────────────────────────

export default function LineupEditor() {
  const [formation, setFormation]   = useState("4-3-3");
  const [players, setPlayers]       = useState<DbPlayer[]>([]);
  const [matches, setMatchList]     = useState<DbMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [starters, setStarters]     = useState<Starters>({});
  const [bench, setBench]           = useState<string[]>([]);
  const [penaltyOrder, setPenaltyOrder] = useState<string[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);
  const [loading, setLoading]       = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  // ── Daten laden ────────────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("players").select("*").order("jersey_number"),
      supabase.from("matches").select("*").order("match_date"),
    ]).then(([playerRes, matchRes]) => {
      setPlayers((playerRes.data ?? []) as DbPlayer[]);
      setMatchList((matchRes.data ?? []) as DbMatch[]);
      setLoading(false);
    });
  }, []);

  // Wenn Spiel gewählt wird: Aufstellung aus DB laden
  const loadLineup = useCallback((matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match?.lineup || Array.isArray(match.lineup)) {
      setStarters({});
      setBench([]);
      setPenaltyOrder([]);
      return;
    }
    const lu = match.lineup as MatchLineup;
    setFormation(lu.formation ?? "4-3-3");
    const s: Starters = {};
    lu.starters.forEach(({ position, player_id }) => { s[position] = player_id; });
    setStarters(s);
    setBench(lu.substitutes ?? []);
    setPenaltyOrder(lu.penalty_order ?? []);
  }, [matches]);

  useEffect(() => {
    if (selectedMatchId) loadLineup(selectedMatchId);
  }, [selectedMatchId, loadLineup]);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  const allAssigned = new Set([...Object.values(starters), ...bench]);

  function handleDragStart({ active }: DragStartEvent) {
    setActivePlayerId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActivePlayerId(null);
    if (!over) return;

    const playerId = active.id as string;
    const targetId = over.id as string;

    setStarters((prev) => {
      const next = { ...prev };
      // Alten Slot des Spielers entfernen
      Object.keys(next).forEach((k) => { if (next[k] === playerId) delete next[k]; });
      if (targetId.startsWith("slot-")) {
        const posLabel = targetId.slice(5);
        next[posLabel] = playerId;
      }
      return next;
    });

    setBench((prev) => {
      let next = prev.filter((id) => id !== playerId);
      if (targetId === "bench") next = [...next, playerId];
      return next;
    });

    // Pool-Drop oder außerhalb → nur aus allem entfernen (schon oben erledigt)
  }

  // Penalty-Liste sortieren
  function handlePenaltySortEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setPenaltyOrder((prev) => {
      const oldIdx = prev.indexOf(active.id as string);
      const newIdx = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  // ── Hilfsfunktionen ─────────────────────────────────────────────────────────

  function clearSlot(posLabel: string) {
    setStarters((prev) => { const next = { ...prev }; delete next[posLabel]; return next; });
  }

  function removeFromBench(playerId: string) {
    setBench((prev) => prev.filter((id) => id !== playerId));
  }

  function addToPenaltyOrder(playerId: string) {
    if (!penaltyOrder.includes(playerId)) setPenaltyOrder((prev) => [...prev, playerId]);
  }

  function removeFromPenalty(playerId: string) {
    setPenaltyOrder((prev) => prev.filter((id) => id !== playerId));
  }

  function handleFormationChange(f: string) {
    setFormation(f);
    setStarters({});
    setPenaltyOrder([]);
    setSaved(false);
  }

  // ── Speichern ────────────────────────────────────────────────────────────────

  async function handleSave() {
    const lineup: MatchLineup = {
      formation,
      starters: Object.entries(starters).map(([position, player_id]) => ({ position, player_id })),
      substitutes: bench,
      penalty_order: penaltyOrder,
    };

    if (selectedMatchId) {
      const supabase = createClient();
      await supabase.from("matches").update({ lineup }).eq("id", selectedMatchId);
    } else {
      localStorage.setItem("wm2026_lineup", JSON.stringify(lineup));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Render-Daten ─────────────────────────────────────────────────────────────

  const positions     = FORMATIONS[formation]?.positions ?? [];
  const poolPlayers   = players.filter((p) => !allAssigned.has(p.id));
  const benchPlayers  = bench.map((id) => players.find((p) => p.id === id)).filter(Boolean) as DbPlayer[];
  const activePlayer  = activePlayerId ? players.find((p) => p.id === activePlayerId) : null;
  const penaltyEligible = [...Object.values(starters), ...bench];

  if (loading) return <p className="text-white/30 text-sm">Lade Daten…</p>;

  return (
    <div className="space-y-6">
      {/* Formation + Spiel-Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Formation</p>
          <div className="flex flex-wrap gap-2">
            {FORMATION_KEYS.map((f) => (
              <button key={f} onClick={() => handleFormationChange(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  f === formation ? "bg-[#D4AF37] text-black" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:ml-auto">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Spiel verknüpfen</p>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">Kein Spiel ausgewählt</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.opponent} — {new Date(m.match_date).toLocaleDateString("de-DE")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── DnD-Kontext: Spielfeld + Pool ─────────────────────────────── */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Spielfeld */}
          <div className="relative w-full max-w-[260px] mx-auto lg:mx-0 flex-shrink-0" style={{ aspectRatio: "2/3" }}>
            <PitchBackground className="absolute inset-0 w-full h-full pointer-events-none rounded-xl" />
            {positions.map((pos) => {
              const slotId = `slot-${pos.label}`;
              const player = starters[pos.label] ? players.find((p) => p.id === starters[pos.label]) : undefined;
              return (
                <div key={pos.label} className="absolute" style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}>
                  <PositionSlot slotId={slotId} label={pos.label} player={player} onClear={() => clearSlot(pos.label)} />
                </div>
              );
            })}
          </div>

          {/* Rechte Seite: Pool + Bank */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Spieler-Pool</p>
              <PoolZone players={poolPlayers} />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Ersatzbank</p>
              <BenchZone players={benchPlayers} onRemove={removeFromBench} />
            </div>
          </div>
        </div>

        {/* Drag-Overlay: zeigt die gezogene Karte */}
        <DragOverlay>
          {activePlayer && (
            <div className="bg-white/10 border border-[#D4AF37] rounded-xl p-2 pointer-events-none shadow-xl">
              <PlayerAvatar player={activePlayer} dragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ── Elfmeter-Reihenfolge (eigener DnD-Kontext) ─────────────────── */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Elfmeter-Reihenfolge</p>

        {penaltyOrder.length === 0 && (
          <p className="text-white/20 text-xs mb-3">Noch keine Schützen festgelegt.</p>
        )}

        <DndContext sensors={sensors} onDragEnd={handlePenaltySortEnd}>
          <SortableContext items={penaltyOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mb-3">
              {penaltyOrder.map((id, i) => (
                <div key={id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <SortablePenaltyItem id={id} player={players.find((p) => p.id === id)} rank={i + 1} />
                  </div>
                  <button onClick={() => removeFromPenalty(id)} className="text-white/20 hover:text-red-400 text-sm cursor-pointer transition-colors">✕</button>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Spieler zur Elfmeter-Liste hinzufügen */}
        <div className="flex flex-wrap gap-2">
          {penaltyEligible
            .filter((id) => !penaltyOrder.includes(id))
            .map((id) => {
              const p = players.find((pl) => pl.id === id);
              if (!p) return null;
              return (
                <button key={id} onClick={() => addToPenaltyOrder(id)}
                  className="text-xs bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                  + #{p.jersey_number} {p.name.split(" ").pop()}
                </button>
              );
            })}
        </div>
      </div>

      {/* Speichern */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave}
          className="bg-[#D4AF37] text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#c9a42e] transition-colors cursor-pointer">
          Aufstellung speichern
        </button>
        {saved && <span className="text-[#D4AF37] text-sm">✓ Gespeichert</span>}
        <span className="text-white/20 text-xs ml-auto">
          {selectedMatchId ? "Wird im gewählten Spiel gespeichert" : "Wird lokal gespeichert"}
        </span>
      </div>
    </div>
  );
}
