import LineupEditor from "@/components/dashboard/LineupEditor";

export default function LineupPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[#D4AF37] text-sm font-medium uppercase tracking-widest mb-1">
          Taktik-Planung
        </p>
        <h1 className="text-3xl font-bold text-white">Aufstellung</h1>
        <p className="text-white/40 text-sm mt-1">
          Formation wählen und Spieler den Positionen zuweisen.
        </p>
      </div>
      <LineupEditor />
    </div>
  );
}
