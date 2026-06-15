"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";

const FootballScene = dynamic(
  () => import("@/components/three/FootballScene"),
  { ssr: false }
);

export default function HeroSection() {
  useEffect(() => {
    // Entrance-Animation: Elemente fliegen von unten rein
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", {
        opacity: 0, y: 24, duration: 0.7, ease: "power3.out",
      });
      gsap.from(".hero-title", {
        opacity: 0, y: 56, duration: 1, delay: 0.2, ease: "power3.out",
      });
      gsap.from(".hero-subtitle", {
        opacity: 0, y: 32, duration: 0.7, delay: 0.55, ease: "power3.out",
      });
      gsap.from(".hero-divider", {
        scaleX: 0, duration: 0.8, delay: 0.5, ease: "power2.out", transformOrigin: "left",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-screen bg-[#0A0A0A] flex items-center overflow-hidden">

      {/* Hintergrund-Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,#1a1400_0%,#0A0A0A_65%)]" />

      {/* Goldene Akzentlinie links */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-60" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24
                      grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* --- Text-Seite --- */}
        <div className="flex flex-col gap-6 order-2 lg:order-1">

          {/* Badge */}
          <div className="hero-badge flex items-center gap-3">
            <span className="inline-block w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-medium">
              FIFA WM 2026
            </span>
          </div>

          {/* Titel */}
          <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white">
            WM 2026
            <br />
            <span className="text-[#D4AF37]">Die Mannschaft</span>
          </h1>

          {/* Trennlinie */}
          <div className="hero-divider h-[2px] w-16 bg-[#D4AF37]" />

          {/* Subtext */}
          <p className="hero-subtitle text-gray-400 text-base sm:text-lg max-w-md leading-relaxed">
            Erlebe die Deutsche Nationalelf in interaktivem 3D —
            Spieler, Statistiken und Aufstellungen auf einem Blick.
          </p>
        </div>

        {/* --- 3D-Ball --- */}
        <div className="order-1 lg:order-2 h-64 sm:h-80 lg:h-[520px] touch-none">
          <FootballScene />
        </div>
      </div>

      {/* Trainer-Login-Link */}
      <a
        href="/dashboard/login"
        className="absolute top-6 right-6 z-20 text-white/40 hover:text-white border border-white/15 hover:border-white/40 text-xs px-4 py-2 rounded-full transition-all tracking-wide"
      >
        Trainer-Login →
      </a>

      {/* Scroll-Hinweis unten zentriert */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-8 bg-[#D4AF37] animate-pulse" />
      </div>
    </section>
  );
}
