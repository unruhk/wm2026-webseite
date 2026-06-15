"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { GoalState } from "@/components/three/GoalScene";

const GoalScene = dynamic(
  () => import("@/components/three/GoalScene"),
  { ssr: false }
);

export default function GoalSection() {
  const [state, setState] = useState<GoalState>("idle");

  const handleShoot = () => {
    if (state !== "idle") return;
    setState("playing");
  };

  // Stabile Referenz für GoalScene
  const handleComplete = useCallback(() => {
    setState("scored");
  }, []);

  // Nach 4 Sekunden automatisch zurück zu idle
  useEffect(() => {
    if (state !== "scored") return;
    const t = setTimeout(() => setState("idle"), 4000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <section className="relative min-h-screen bg-[#0A0A0A] flex flex-col items-center overflow-hidden">

      {/* Hintergrund-Vignette (von Mitte oben) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,#120900_0%,#0A0A0A_65%)]" />

      {/* Goldene Akzentlinie links */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-60" />

      {/* Abschnittslabel */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-12 flex items-center gap-3">
        <span className="inline-block w-8 h-[2px] bg-[#D4AF37]" />
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-medium">
          Torjubel
        </span>
      </div>

      {/* Überschrift */}
      <div className="relative z-10 text-center mt-8 mb-6 px-4">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Der Moment des{" "}
          <span className="text-[#D4AF37]">Tores</span>
        </h2>
        <p className="text-gray-500 mt-3 text-sm tracking-widest uppercase">
          Drück auf Abschuss und erlebe den Jubel
        </p>
      </div>

      {/* 3D-Canvas */}
      <div className="relative w-full flex-1 min-h-[340px] max-h-[60vh] touch-none">
        <GoalScene state={state} onComplete={handleComplete} />

        {/* TOR!-Overlay */}
        {state === "scored" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              style={{ animation: "torIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
              className="flex flex-col items-center gap-3"
            >
              <span
                className="text-[#D4AF37] font-black leading-none"
                style={{ fontSize: "clamp(72px, 14vw, 130px)" }}
              >
                TOR!
              </span>
              <p className="text-white text-sm tracking-[0.3em] uppercase opacity-90">
                Deutschland trifft!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Abschuss-Button */}
      <div className="relative z-10 mt-8 mb-16">
        <button
          onClick={handleShoot}
          disabled={state !== "idle"}
          className="
            relative px-12 py-4 rounded-full font-bold text-lg tracking-widest uppercase
            bg-[#D4AF37] text-black
            transition-all duration-300
            hover:bg-white hover:scale-105 active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-[#D4AF37]
          "
        >
          {state === "scored"
            ? "Nochmal... gleich!"
            : state === "playing"
            ? "Fliegt..."
            : "Abschuss!"}
        </button>
      </div>

    </section>
  );
}
