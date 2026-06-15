"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import type { Mesh, InstancedMesh } from "three";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type GoalState = "idle" | "playing" | "scored";

// ─── Konstanten ───────────────────────────────────────────────────────────────

const BALL_START_POS = { x: 0, y: 0.8, z: 7 } as const;
const NET_Z = -1.8;
const CONFETTI_COUNT = 200;
const CONFETTI_COLORS = [
  new THREE.Color("#D4AF37"),
  new THREE.Color("#DD0000"),
  new THREE.Color("#FFFFFF"),
  new THREE.Color("#1a1a1a"),
];

// ─── Konfetti-System ──────────────────────────────────────────────────────────

function Confetti({ active }: { active: boolean }) {
  const meshRef = useRef<InstancedMesh>(null);
  const pos     = useRef(new Float32Array(CONFETTI_COUNT * 3));
  const vel     = useRef(new Float32Array(CONFETTI_COUNT * 3));
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  // Farben & Startposition (einmalig beim Mount)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      mesh.setColorAt(i, CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      dummy.position.set(0, -30, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  // Spawn / Hide wenn active wechselt
  useEffect(() => {
    if (active) {
      // Partikel über dem Tor starten
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        pos.current[i*3]   = (Math.random() - 0.5) * 9;
        pos.current[i*3+1] = Math.random() * 1.5 + 1.5;
        pos.current[i*3+2] = (Math.random() - 0.5) * 5;
        vel.current[i*3]   = (Math.random() - 0.5) * 0.09;
        vel.current[i*3+1] = Math.random() * 0.13 + 0.05;
        vel.current[i*3+2] = (Math.random() - 0.5) * 0.05;
      }
    } else {
      // Alle verstecken
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        pos.current[i*3+1] = -30;
        vel.current[i*3+1] = 0;
      }
    }
  }, [active]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !active) return;
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      vel.current[i*3+1] -= 0.003; // Gravitation
      pos.current[i*3]   += vel.current[i*3];
      pos.current[i*3+1] += vel.current[i*3+1];
      pos.current[i*3+2] += vel.current[i*3+2];

      dummy.position.set(pos.current[i*3], pos.current[i*3+1], pos.current[i*3+2]);
      // Rotiert jedes Stück individuell (sieht realistischer aus)
      dummy.rotation.set(
        pos.current[i*3+1] * 3,
        pos.current[i*3]   * 2,
        vel.current[i*3]   * 10
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFETTI_COUNT]}>
      <planeGeometry args={[0.15, 0.22]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── Tor-Struktur ─────────────────────────────────────────────────────────────

const POST_PROPS = { metalness: 0.5, roughness: 0.2, color: "#E0E0E0" } as const;

function Goal({ netRef }: { netRef: React.RefObject<Mesh | null> }) {
  return (
    <group>
      {/* Linker Pfosten */}
      <mesh position={[-3.5, 1.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
        <meshStandardMaterial {...POST_PROPS} />
      </mesh>

      {/* Rechter Pfosten */}
      <mesh position={[3.5, 1.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
        <meshStandardMaterial {...POST_PROPS} />
      </mesh>

      {/* Querlatte */}
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 7.16, 8]} />
        <meshStandardMaterial {...POST_PROPS} />
      </mesh>

      {/* Rücknetz (animiert beim Aufprall) */}
      <mesh ref={netRef} position={[0, 1.25, NET_Z]}>
        <planeGeometry args={[7, 2.5, 14, 5]} />
        <meshBasicMaterial wireframe color="#FFFFFF" opacity={0.28} transparent />
      </mesh>

      {/* Oberes Netz */}
      <mesh position={[0, 2.5, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 1.8, 14, 4]} />
        <meshBasicMaterial wireframe color="#FFFFFF" opacity={0.18} transparent />
      </mesh>

      {/* Linkes Seitennetz */}
      <mesh position={[-3.5, 1.25, -0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 2.5, 4, 5]} />
        <meshBasicMaterial wireframe color="#FFFFFF" opacity={0.18} transparent />
      </mesh>

      {/* Rechtes Seitennetz */}
      <mesh position={[3.5, 1.25, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 2.5, 4, 5]} />
        <meshBasicMaterial wireframe color="#FFFFFF" opacity={0.18} transparent />
      </mesh>
    </group>
  );
}

// ─── Innere Szene (hat Zugriff auf R3F-Kontext) ───────────────────────────────

function Scene({
  state,
  onComplete,
}: {
  state: GoalState;
  onComplete: () => void;
}) {
  const ballRef = useRef<Mesh>(null);
  const netRef  = useRef<Mesh>(null);
  // Stabile Referenz auf onComplete, damit useEffect nicht neu feuert
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Sanfte Idle-Rotation des Balls
  useFrame((_, delta) => {
    if (state !== "idle" || !ballRef.current) return;
    ballRef.current.rotation.y += delta * 0.4;
    ballRef.current.rotation.x += delta * 0.15;
  });

  useEffect(() => {
    const ball = ballRef.current;
    const net  = netRef.current;
    if (!ball || !net) return;

    if (state === "idle") {
      // Alles zurücksetzen
      gsap.set(ball.position, { ...BALL_START_POS });
      gsap.set(ball.rotation, { x: 0, y: 0, z: 0 });
      gsap.set(net.position,  { z: NET_Z });
      gsap.set(net.scale,     { x: 1, y: 1, z: 1 });
      return;
    }

    if (state !== "playing") return;

    const tl = gsap.timeline({ onComplete: () => onCompleteRef.current() });

    // Phase 1 — Ball fliegt in einem Bogen ins Tor
    tl.to(ball.position, {
      keyframes: [
        { x: 0,    y: 2.5,  z: 3,    duration: 0.35, ease: "power1.out" },
        { x: -0.3, y: 1.4, z: -1.2, duration: 0.45, ease: "power3.in"  },
      ],
    });
    // Spin gleichzeitig mit Flug
    tl.to(ball.rotation, {
      x: Math.PI * 5, y: Math.PI * 3,
      duration: 0.8, ease: "none",
    }, "<");

    // Phase 2 — Netz wölbt sich zurück
    tl.to(net.position, { z: NET_Z - 0.8, duration: 0.16, ease: "power3.out" }, ">-0.06");
    tl.to(net.position, { z: NET_Z,       duration: 0.75, ease: "elastic.out(1, 0.35)" });

    return () => { tl.kill(); };
  }, [state]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 8, 6]} intensity={1.4} color="#FFFFFF" />
      <pointLight position={[-6, 3, -4]} intensity={2.5} color="#D4AF37" />
      <pointLight position={[6, -2, 5]} intensity={0.6} color="#DD0000" />

      <Goal netRef={netRef} />

      {/* Ball */}
      <mesh ref={ballRef} position={[BALL_START_POS.x, BALL_START_POS.y, BALL_START_POS.z]}>
        <icosahedronGeometry args={[0.35, 2]} />
        <meshStandardMaterial color="#D4AF37" flatShading metalness={0.1} roughness={0.3} />
      </mesh>

      <Confetti active={state === "playing" || state === "scored"} />
    </>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export default function GoalScene({
  state,
  onComplete,
}: {
  state: GoalState;
  onComplete: () => void;
}) {
  const stableComplete = useCallback(onComplete, [onComplete]);
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 55 }}>
      <Scene state={state} onComplete={stableComplete} />
    </Canvas>
  );
}
