"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  teamId: string;
  initialName: string;
  email: string;
};

export default function CoachNameEditor({ teamId, initialName, email }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("teams").update({ coach_name: name }).eq("id", teamId);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div>
        <p className="text-[#D4AF37] text-sm font-medium uppercase tracking-widest mb-2">
          Willkommen zurück
        </p>
        <div className="flex items-center gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
            className="text-3xl font-bold text-white bg-transparent border-b-2 border-[#D4AF37] focus:outline-none pb-1 min-w-0"
            style={{ width: `${Math.max(name.length, 4)}ch` }}
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-[#D4AF37] text-sm font-semibold hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "…" : "Speichern"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-white/30 text-sm hover:text-white transition-colors cursor-pointer"
          >
            Abbrechen
          </button>
        </div>
        <p className="text-white/40 text-sm mt-1">{email}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[#D4AF37] text-sm font-medium uppercase tracking-widest mb-1">
        Willkommen zurück
      </p>
      <div className="flex items-center gap-3 group">
        <h1 className="text-3xl font-bold text-white">{name}</h1>
        <button
          onClick={() => setEditing(true)}
          title="Namen bearbeiten"
          className="text-white/20 hover:text-[#D4AF37] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer text-base"
        >
          ✎
        </button>
      </div>
      <p className="text-white/40 text-sm mt-1">{email}</p>
    </div>
  );
}
