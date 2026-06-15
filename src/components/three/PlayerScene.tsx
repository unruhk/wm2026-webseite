"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { players } from "@/lib/data/players";
import type { Mesh } from "three";

// Ballfarbe via lerp im Render-Loop — zuverlässiger als GSAP auf material.color
function PlayerBall({ playerIndex }: { playerIndex: number }) {
  const meshRef  = useRef<Mesh>(null);
  const targetColor = useRef(new THREE.Color(players[0].accentColor));

  useEffect(() => {
    targetColor.current.set(players[playerIndex].accentColor);
  }, [playerIndex]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.45;
    meshRef.current.rotation.x += delta * 0.1;
    // Farbe sanft interpolieren
    (meshRef.current.material as THREE.MeshStandardMaterial)
      .color.lerp(targetColor.current, 0.06);
  });

  return (
    <mesh ref={meshRef}>
      {/* detail=2 → 320 Dreiecke, geometrisch aber weniger kantig */}
      <icosahedronGeometry args={[2.2, 2]} />
      <meshStandardMaterial
        color={players[0].accentColor}
        flatShading
        metalness={0.05}
        roughness={0.3}
      />
    </mesh>
  );
}

export default function PlayerScene({ playerIndex }: { playerIndex: number }) {
  const player = players[playerIndex];

  return (
    <div className="relative w-full h-full">

      {/* 3D-Canvas nur für den Ball */}
      <Canvas camera={{ position: [0, 0, 7], fov: 48 }} className="w-full h-full">
        <ambientLight intensity={0.2} />
        <directionalLight position={[4, 6, 4]} intensity={1.3} color="#FFFFFF" />
        {/* Goldenes Rim-Licht */}
        <pointLight position={[-5, -2, -6]} intensity={3.5} color="#D4AF37" />
        {/* Rotes Akzentlicht */}
        <pointLight position={[6, -4, 2]} intensity={0.7} color="#DD0000" />
        <PlayerBall playerIndex={playerIndex} />
      </Canvas>

      {/* Trikotnummer als HTML-Overlay — kein Fontladen nötig */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
           style={{ paddingBottom: "25%" }}>
        <span
          key={playerIndex}
          style={{
            fontSize: "clamp(80px, 14vw, 160px)",
            fontWeight: 900,
            color: player.accentColor,
            lineHeight: 1,
            opacity: 0.92,
            animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          {player.number}
        </span>
      </div>

    </div>
  );
}
