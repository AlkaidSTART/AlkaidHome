import { useRef } from "react";
import * as THREE from "three";
import type { PlanetVisualProps } from "./types";

export default function VoiceCanvasPlanet({
  config,
  satellitesRef,
}: PlanetVisualProps) {
  const ringRef = useRef<THREE.Group>(null);

  return (
    <group>
      {/* Deep atmosphere layers — Neptune has thick methane atmosphere */}
      <mesh>
        <sphereGeometry args={[config.size * 1.12, 32, 32]} />
        <meshBasicMaterial
          color="#0891b2"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[config.size * 1.06, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Polar cryovolcanic plumes — Triton's nitrogen geysers eject
          dark material that falls back as surface streaks */}
      <mesh position={[0, config.size * 0.82, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[config.size * 0.08, config.size * 0.5, 8]} />
        <meshBasicMaterial
          color="#cffafe"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, config.size * 0.82, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[config.size * 0.15, config.size * 0.25, 8]} />
        <meshBasicMaterial
          color="#a5f3fc"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Dark streaks from plume fallout on surface */}
      <mesh rotation={[0.8, 0.5, 0]}>
        <sphereGeometry args={[config.size * 1.01, 32, 32]} />
        <meshBasicMaterial
          color="#164e63"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Adams Ring — Neptune's narrow, clumpy ring with arcs */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.35, config.size * 1.38, 128]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Ring arcs — denser clumps in the ring (Liberte, Egalite, Fraternite) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI * 2) / 3]}>
          <ringGeometry
            args={[
              config.size * 1.35,
              config.size * 1.42,
              16,
              1,
              (i * Math.PI * 2) / 3,
              (i * Math.PI * 2) / 3 + 0.4,
            ]}
          />
          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* Small inner moon — Proteus-like, dark and irregular */}
      <mesh position={[config.size * 1.55, config.size * 0.1, 0]}>
        <dodecahedronGeometry args={[config.size * 0.06, 0]} />
        <meshStandardMaterial
          color="#374151"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
