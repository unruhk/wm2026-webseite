"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

// Low-Poly-Ikosaeder mit Flat-Shading — klassischer geometrischer Fußball-Look
function Football() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.35;
    meshRef.current.rotation.x += delta * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      {/* detail=1 → 80 Dreiecke, sieht aus wie ein geometrischer Fußball */}
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial
        color="#F5F5F5"
        flatShading
        metalness={0.05}
        roughness={0.35}
      />
    </mesh>
  );
}

export default function FootballScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      {/* Weiches Umgebungslicht */}
      <ambientLight intensity={0.25} />
      {/* Hauptlicht von oben-vorne (weißlich) */}
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#FFFFFF" />
      {/* Goldenes Rim-Licht von hinten — DFB-Stil */}
      <pointLight position={[-4, -2, -5]} intensity={3} color="#D4AF37" />
      {/* Rot als Akzentlicht von unten-rechts */}
      <pointLight position={[5, -4, 2]} intensity={0.6} color="#DD0000" />
      <Football />
    </Canvas>
  );
}
