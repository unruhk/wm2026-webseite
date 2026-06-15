"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FORMATION_KEYS } from "@/lib/data/formations";
import type { DbMatch } from "@/lib/supabase/types";

type Props =
  | { mode?: "create"; teamId: string; match?: never; onCreated: () => void; onCancel: () => void }
  | { mode: "edit"; teamId?: never; match: DbMatch; onCreated: () => void; onCancel: () => void };

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MatchForm({ mode = "create", teamId, match, onCreated, onCancel }: Props) {
  const [opponent, setOpponent]   = useState(match?.opponent ?? "");
  const [matchDate, setMatchDate] = useState(match ? toDatetimeLocal(match.match_date) : "");
  const [location, setLocation]   = useState(match?.location ?? "");
  const [formation, setFormation] = useState(match?.formation ?? "");
  const [notes, setNotes]         = useState(match?.notes ?? "");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      opponent,
      match_date: new Date(matchDate).toISOString(),
      location:  location  || null,
      formation: formation || null,
      notes:     notes     || null,
    };

    let err;
    if (mode === "edit" && match) {
      ({ error: err } = await supabase.from("matches").update(payload).eq("id", match.id));
    } else {
      ({ error: err } = await supabase.from("matches").insert({ ...payload, team_id: teamId!, lineup: null }));
    }

    if (err) {
      setError("Fehler: " + err.message);
    } else {
      onCreated();
    }
    setLoading(false);
  }

  const title = mode === "edit" ? "Spiel bearbeiten" : "Neues Spiel hinzufügen";

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-5">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Gegner *">
            <input required value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="z. B. Spanien" className={inputClass} />
          </Field>
          <Field label="Datum & Uhrzeit *">
            <input required type="datetime-local" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Spielort">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="z. B. Berlin" className={inputClass} />
          </Field>
          <Field label="Formation">
            <select value={formation} onChange={(e) => setFormation(e.target.value)} className={inputClass}>
              <option value="">Keine Angabe</option>
              {FORMATION_KEYS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Notizen">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Taktische Hinweise…" className={inputClass + " resize-none"} />
        </Field>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg transition-colors cursor-pointer">
            Abbrechen
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-semibold bg-[#D4AF37] text-black rounded-lg hover:bg-[#c9a42e] transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? "Speichern…" : mode === "edit" ? "Änderungen speichern" : "Spiel speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4AF37] transition-colors";
