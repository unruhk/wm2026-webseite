"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { players } from "@/lib/data/players";

const PlayerScene = dynamic(
  () => import("@/components/three/PlayerScene"),
  { ssr: false }
);

export default function PlayerShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Erste Card direkt sichtbar
      gsap.set(".player-card-0", { opacity: 1, y: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        start: "top top",
        // Jeder Spieler bekommt eine volle Viewport-Höhe Scroll-Weg
        end: () => `+=${players.length * window.innerHeight}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const newIndex = Math.min(
            Math.floor(self.progress * players.length),
            players.length - 1
          );
          if (newIndex === currentIndexRef.current) return;

          const prevIndex = currentIndexRef.current;
          currentIndexRef.current = newIndex;
          setCurrentIndex(newIndex);

          // Alte Card ausblenden
          gsap.to(`.player-card-${prevIndex}`, {
            opacity: 0, y: -24, duration: 0.28, ease: "power2.in",
          });
          // Neue Card einblenden
          gsap.fromTo(
            `.player-card-${newIndex}`,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.18, ease: "power3.out" }
          );
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0A0A0A] overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Hintergrund-Vignette (gespiegelt zur Hero-Sektion) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,#1a1400_0%,#0A0A0A_65%)]" />

      {/* Goldene Akzentlinie rechts */}
      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-60" />

      {/* Abschnittslabel oben links */}
      <div className="absolute top-8 left-6 lg:left-12 z-10 flex items-center gap-3">
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-medium">
          Die Spieler
        </span>
      </div>

      {/* Haupt-Layout */}
      <div
        className="relative z-10 flex flex-col lg:flex-row items-stretch max-w-7xl mx-auto px-6 lg:px-12"
        style={{ height: "100svh" }}
      >
        {/* --- 3D-Szene --- */}
        {/* Mobile: oben (feste Höhe), Desktop: rechte Spalte */}
        <div className="w-full lg:w-1/2 h-56 sm:h-64 lg:h-full shrink-0 order-1 lg:order-2 touch-none pt-16 lg:pt-0">
          <PlayerScene playerIndex={currentIndex} />
        </div>

        {/* --- Spieler-Infos --- */}
        {/* Relativer Container, Karten sind absolut positioniert */}
        <div className="relative flex-1 order-2 lg:order-1 overflow-hidden">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`player-card-${i} absolute inset-0 flex flex-col justify-center gap-5 lg:pr-12`}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {/* Positions-Badge */}
              <div className="flex items-center gap-3">
                <span
                  className="inline-block w-8 h-[2px]"
                  style={{ backgroundColor: p.accentColor }}
                />
                <span
                  className="text-xs tracking-[0.3em] uppercase font-medium"
                  style={{ color: p.accentColor }}
                >
                  {p.position}
                </span>
              </div>

              {/* Name + Club */}
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {p.name}
                </h2>
                <p className="text-gray-500 mt-2 text-sm tracking-widest uppercase">
                  {p.club}
                </p>
              </div>

              {/* Trennlinie */}
              <div
                className="h-[1px] w-12 opacity-70"
                style={{ backgroundColor: p.accentColor }}
              />

              {/* Statistiken */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "Tore",         value: p.goals   },
                  { label: "Assists",      value: p.assists  },
                  { label: "Länderspiele", value: p.caps     },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between max-w-[220px]"
                  >
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className="text-white font-bold text-xl">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress-Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {players.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? "24px" : "8px",
              height: "8px",
              backgroundColor: i === currentIndex ? "#D4AF37" : "#333333",
            }}
          />
        ))}
      </div>
    </section>
  );
}
