"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Login fehlgeschlagen: " + error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError("Registrierung fehlgeschlagen: " + error.message);
      } else {
        setInfo("Registrierung erfolgreich! Bitte melde dich jetzt an.");
        setMode("signin");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo-Bereich */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black text-2xl font-bold">⚽</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">Trainer-Bereich</h1>
          <p className="text-white/40 text-sm mt-1">WM 2026 – Deutsche Nationalelf</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-[#D4AF37] text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-[#D4AF37] text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                E-Mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@dfb.de"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Passwort
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            {info && (
              <p className="text-[#D4AF37] text-sm bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg px-4 py-3">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg text-sm tracking-wide hover:bg-[#c9a42e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? "Bitte warten..."
                : mode === "signin"
                ? "Anmelden"
                : "Konto erstellen"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Zurück zur{" "}
          <a href="/" className="text-[#D4AF37] hover:underline">
            Startseite
          </a>
        </p>
      </div>
    </div>
  );
}
