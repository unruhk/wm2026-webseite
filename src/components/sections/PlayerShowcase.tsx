"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { players } from "@/lib/data/players";
import FieldMap from "@/components/ui/FieldMap";

export default function PlayerShowcase() {
  const sectionRef      = useRef<HTMLElement>(null);
  const contentRef      = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const isTransitioning = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Übergang zum neuen Spieler: Inhalt ausfaden → updaten → einfaden
  const transitionToRef = useRef<(idx: number) => void>(() => {});

  useEffect(() => {
    transitionToRef.current = (newIndex: number) => {
      if (newIndex === currentIndexRef.current || isTransitioning.current) return;
      isTransitioning.current = true;

      gsap.to(contentRef.current, {
        opacity: 0, y: -18, duration: 0.22, ease: "power2.in",
        onComplete: () => {
          currentIndexRef.current = newIndex;
          setCurrentIndex(newIndex);
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 22 },
            {
              opacity: 1, y: 0, duration: 0.38, ease: "power3.out",
              onComplete: () => { isTransitioning.current = false; },
            }
          );
        },
      });
    };
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        start: "top top",
        end: () => `+=${players.length * window.innerHeight}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const newIndex = Math.min(
            Math.floor(self.progress * players.length),
            players.length - 1
          );
          transitionToRef.current(newIndex);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const player = players[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0A0A0A] overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Hintergrund-Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,#100e00_0%,#0A0A0A_60%)]" />

      {/* Goldene Akzentlinie rechts */}
      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-60" />

      {/* Abschnittslabel */}
      <div className="absolute top-8 left-6 lg:left-12 z-20 flex items-center gap-3">
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-medium">
          Die Spieler
        </span>
      </div>

      {/* ── Animierter Inhalt ─────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col lg:flex-row"
        style={{ height: "100svh" }}
      >

        {/* ── Linke Spalte: Foto-Placeholder ────────────────────── */}
        <div className="relative w-full lg:w-[45%] h-64 sm:h-72 lg:h-full shrink-0 overflow-hidden">

          {/* Hintergrundgradient in Spielerfarbe */}
          <div
            className="absolute inset-0 transition-colors duration-700"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, ${player.accentColor}18 0%, #0A0A0A 70%)`,
            }}
          />

          {/* Sehr große Trikotnummer als Hintergrundelement */}
          <span
            className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none"
            style={{
              fontSize: "clamp(160px, 30vw, 340px)",
              color: player.accentColor,
              opacity: 0.06,
              lineHeight: 1,
            }}
          >
            {player.number}
          </span>

          {/* Linke Akzentlinie */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-500"
            style={{ backgroundColor: player.accentColor }}
          />

          {/* Trikotnummer-Badge oben */}
          <div className="absolute top-10 lg:top-16 left-8 lg:left-10">
            <div
              className="text-7xl lg:text-8xl font-black leading-none"
              style={{ color: player.accentColor }}
            >
              {player.number}
            </div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-gray-500 mt-1">
              Trikotnummer
            </div>
          </div>

          {/* Foto-Platzhalter-Bereich */}
          <div className="absolute inset-0 flex items-end justify-center pb-6 lg:pb-10">
            <div
              className="w-32 sm:w-40 lg:w-52 rounded-t-full border opacity-20"
              style={{
                height: "55%",
                borderColor: player.accentColor,
                borderBottomWidth: 0,
                background: `linear-gradient(to top, transparent, ${player.accentColor}30)`,
              }}
            />
            <div className="absolute bottom-4 lg:bottom-8 text-[10px] tracking-[0.2em] uppercase text-gray-600">
              Foto folgt
            </div>
          </div>
        </div>

        {/* ── Rechte Spalte: Spielerinfos ───────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-14 py-8 lg:py-0 gap-6 lg:gap-7">

          {/* Positions-Badge */}
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-8 h-[2px] transition-colors duration-500"
              style={{ backgroundColor: player.accentColor }}
            />
            <span
              className="text-xs tracking-[0.3em] uppercase font-medium transition-colors duration-500"
              style={{ color: player.accentColor }}
            >
              {player.position}
            </span>
          </div>

          {/* Name */}
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {player.name}
            </h2>
            <p className="text-gray-500 mt-1 text-sm tracking-widest uppercase">
              {player.club}
            </p>
          </div>

          {/* Trennlinie */}
          <div
            className="h-[1px] w-12 transition-colors duration-500"
            style={{ backgroundColor: player.accentColor, opacity: 0.6 }}
          />

          {/* Statistiken */}
          <div className="grid grid-cols-3 gap-4 max-w-xs">
            {[
              { label: "Tore",    value: player.goals   },
              { label: "Assists", value: player.assists  },
              { label: "Spiele",  value: player.caps     },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: player.accentColor }}
                >
                  {value}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-gray-500">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Mini-Spielfeld */}
          <div className="flex items-start gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500">
                Position auf dem Feld
              </span>
              <FieldMap
                position={player.fieldPosition}
                accentColor={player.accentColor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress-Dots ──────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {players.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-400"
            style={{
              width:           i === currentIndex ? "24px" : "8px",
              height:          "8px",
              backgroundColor: i === currentIndex ? "#D4AF37" : "#333",
            }}
          />
        ))}
      </div>
    </section>
  );
}
