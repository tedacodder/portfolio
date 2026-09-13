"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A subtle distributed-system node graph: a gateway feeding a small mesh of
// services, with particles drifting along the edges. Kept intentionally
// sparse — this is a background element, not the focus of the hero.

const NODE_POSITIONS: [number, number, number][] = [
  [0, 1.6, 0], // service (top)
  [-1.6, 0, 0], // left
  [0, 0, 0], // center
  [1.6, 0, 0], // right
  [0, -1.6, 0], // gateway (bottom)
];

const EDGES: [number, number][] = [
  [0, 2],
  [1, 2],
  [2, 3],
  [1, 4],
  [2, 4],
  [3, 4],
];

function Graph({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<THREE.Mesh[]>([]);

  const lines = useMemo(() => {
    return EDGES.map(([a, b]) => {
      const points = [
        new THREE.Vector3(...NODE_POSITIONS[a]),
        new THREE.Vector3(...NODE_POSITIONS[b]),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduceMotion) {
      group.current.rotation.y += delta * 0.06;
      const t = state.clock.elapsedTime;
      group.current.position.y = Math.sin(t * 0.3) * 0.05;
    }
    // Gentle mouse parallax
    const targetX = state.pointer.y * 0.15;
    const targetY = state.pointer.x * 0.15;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    if (reduceMotion) {
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {lines.map((geo, i) => (
        <line key={i}>
          <primitive object={geo} attach="geometry" />
          <lineBasicMaterial color="#5eead4" transparent opacity={0.18} />
        </line>
      ))}
      {NODE_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => {
            if (el) nodeRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[i === NODE_POSITIONS.length - 1 ? 0.09 : 0.06, 16, 16]} />
          <meshBasicMaterial color={i === 2 ? "#5eead4" : "#82828a"} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// Deterministic pseudo-random hash (sine-based) so particle placement stays
// stable across re-renders without calling an impure function during render.
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Particles({ reduceMotion }: { reduceMotion: boolean }) {
  const count = 60;
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (hash(i * 1.7) - 0.5) * 6;
      arr[i * 3 + 1] = (hash(i * 2.3 + 11) - 0.5) * 4;
      arr[i * 3 + 2] = (hash(i * 3.1 + 23) - 0.5) * 2 - 1;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!points.current || reduceMotion) return;
    points.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#5eead4" size={0.015} transparent opacity={0.35} />
    </points>
  );
}

export default function HeroScene({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, reduceMotion ? 1 : 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Graph reduceMotion={reduceMotion} />
      <Particles reduceMotion={reduceMotion} />
    </Canvas>
  );
}
