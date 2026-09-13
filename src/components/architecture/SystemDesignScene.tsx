"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const STAGES = ["USER", "GATEWAY", "AUTH", "REDIS", "SERVICES", "POSTGRES", "EXTERNAL"];

function Pipeline({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const spacing = 1.1;
  const total = STAGES.length;

  const positions = useMemo(
    () => STAGES.map((_, i) => new THREE.Vector3(0, (total - 1) * spacing * 0.5 - i * spacing, 0)),
    [total]
  );

  useFrame((_, delta) => {
    if (group.current && !reduceMotion) {
      group.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={group}>
      {positions.slice(0, -1).map((pos, i) => {
        const next = positions[i + 1];
        const geo = new THREE.BufferGeometry().setFromPoints([pos, next]);
        return (
          <line key={i}>
            <primitive object={geo} attach="geometry" />
            <lineBasicMaterial color="#5eead4" transparent opacity={0.25} />
          </line>
        );
      })}

      {!reduceMotion &&
        positions.slice(0, -1).map((pos, i) => {
          const next = positions[i + 1];
          return <Packet key={i} from={pos} to={next} delay={i * 0.4} />;
        })}

      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <boxGeometry args={[1.4, 0.42, 0.05]} />
            <meshBasicMaterial color="#0a0a0e" />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.4, 0.42, 0.05)]} />
            <lineBasicMaterial color="#1c1c20" />
          </lineSegments>
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.13}
            color="#f2f2ee"
            anchorX="center"
            anchorY="middle"
            font={undefined}
          >
            {STAGES[i]}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Packet({ from, to, delay }: { from: THREE.Vector3; to: THREE.Vector3; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const cycle = 1.8;
    const t = ((state.clock.elapsedTime + delay) % cycle) / cycle;
    ref.current.position.lerpVectors(from, to, t);
    ref.current.visible = true;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshBasicMaterial color="#5eead4" />
    </mesh>
  );
}

export default function SystemDesignScene({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <Canvas camera={{ position: [2.4, 0, 4], fov: 42 }} dpr={[1, reduceMotion ? 1 : 1.5]}>
      <Pipeline reduceMotion={reduceMotion} />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
