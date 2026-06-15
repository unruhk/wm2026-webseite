"use client";

import dynamic from "next/dynamic";

// Canvas nur im Browser laden (kein SSR — Three.js braucht window)
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {/* 3D-Bereich */}
      <div className="w-full h-screen">
        <HeroCanvas />
      </div>

      {/* Überschrift über dem Canvas */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <p className="text-sm tracking-[0.3em] uppercase text-[#D4AF37] mb-4">
          FIFA WM 2026
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center leading-tight">
          Deutsche
          <br />
          <span className="text-[#D4AF37]">Nationalelf</span>
        </h1>
      </div>
    </main>
  );
}
