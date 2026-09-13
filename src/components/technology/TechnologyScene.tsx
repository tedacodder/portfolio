"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Technology } from "@/types/api";

// Fibonacci sphere distribution so node count adapts cleanly to however many
// technologies the API returns, without clustering or overlap.
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
  }
  return points;
}

function Nodes({
  technologies,
  positions,
  onSelect,
  reduceMotion,
}: {
  technologies: Technology[];
  positions: THREE.Vector3[];
  onSelect: (tech: Technology | null) => void;
  reduceMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useFrame((_, delta) => {
    if (group.current && !reduceMotion) {
      group.current.rotation.y += delta * 0.05;
    }
  });

  // Connect each node to its two nearest neighbours for a constellation feel.
  const edges = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    positions.forEach((p, i) => {
      const distances = positions
        .map((q, j) => ({ j, d: i === j ? Infinity : p.distanceTo(q) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      distances.forEach(({ j }) => lines.push([p, positions[j]]));
    });
    return lines;
  }, [positions]);

  return (
    <group ref={group}>
      {edges.map(([a, b], i) => {
        const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
        return (
          <line key={i}>
            <primitive object={geo} attach="geometry" />
            <lineBasicMaterial color="#5eead4" transparent opacity={0.12} />
          </line>
        );
      })}
      {technologies.map((tech, i) => {
        const pos = positions[i];
        const isHovered = hovered === tech.id;
        return (
          <mesh
            key={tech.id}
            position={pos}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHovered(tech.id);
              onSelect(tech);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHovered(null);
              onSelect(null);
              document.body.style.cursor = "";
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelect(tech);
            }}
          >
            <sphereGeometry args={[isHovered ? 0.09 : 0.06, 16, 16]} />
            <meshBasicMaterial color={isHovered ? "#5eead4" : "#82828a"} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function TechnologyScene({
  technologies,
  onSelect,
  reduceMotion,
}: {
  technologies: Technology[];
  onSelect: (tech: Technology | null) => void;
  reduceMotion: boolean;
}) {
  const positions = useMemo(
    () => fibonacciSphere(technologies.length, 2.1),
    [technologies.length]
  );

  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, reduceMotion ? 1 : 1.5]}>
      <Nodes
        technologies={technologies}
        positions={positions}
        onSelect={onSelect}
        reduceMotion={reduceMotion}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        rotateSpeed={0.4}
      />
    </Canvas>
  );
}
