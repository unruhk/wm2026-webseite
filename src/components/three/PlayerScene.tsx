"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { players } from "@/lib/data/players";
import type { Mesh, Group } from "three";

function PlayerBall({ playerIndex }: { playerIndex: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.45;
    meshRef.current.rotation.x += delta * 0.1;
  });

  // Farbe des Balls beim Spielerwechsel animieren
  useEffect(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const target = new THREE.Color(players[playerIndex].accentColor);
    gsap.to(mat.color, {
      r: target.r, g: target.g, b: target.b,
      duration: 0.6, ease: "power2.out",
    });
  }, [playerIndex]);

  return (
    <mesh ref={meshRef} position={[0, -2.6, 0]}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color={players[0].accentColor}
        flatShading
        metalness={0.08}
        roughness={0.3}
      />
    </mesh>
  );
}

function PlayerNumber({ playerIndex }: { playerIndex: number }) {
  const groupRef = useRef<Group>(null);

  // Nummer mit "Pop-in"-Effekt animieren wenn Spieler wechselt
  useEffect(() => {
    if (!groupRef.current) return;
    gsap.fromTo(
      groupRef.current.scale,
      { x: 0.7, y: 0.7, z: 0.7 },
      { x: 1, y: 1, z: 1, duration: 0.45, ease: "back.out(2.5)" }
    );
  }, [playerIndex]);

  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      <Text
        fontSize={4.5}
        color={players[playerIndex].accentColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.92}
      >
        {String(players[playerIndex].number)}
      </Text>
    </group>
  );
}

export default function PlayerScene({ playerIndex }: { playerIndex: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 48 }}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 6, 4]} intensity={1.3} color="#FFFFFF" />
      {/* Goldenes Rim-Licht */}
      <pointLight position={[-5, -2, -6]} intensity={3.5} color="#D4AF37" />
      {/* Rotes Akzentlicht */}
      <pointLight position={[6, -4, 2]} intensity={0.7} color="#DD0000" />

      <PlayerNumber playerIndex={playerIndex} />
      <PlayerBall playerIndex={playerIndex} />
    </Canvas>
  );
}
