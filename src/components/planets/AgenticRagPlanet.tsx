import * as THREE from "three";
import type { PlanetVisualProps } from "./types";

export default function AgenticRagPlanet({
  config,
  satellitesRef,
}: PlanetVisualProps) {
  return (
    <group>
      {/* Saturn's ring system — from inner to outer:
          D ring (faint, innermost) → C ring (translucent) →
          B ring (brightest, densest) → Cassini Division (gap) →
          A ring (bright) → Encke Gap → F ring (narrow, braided) →
          G ring (faint) → E ring (very faint, diffuse) */}

      {/* D ring — extremely faint, innermost */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.08, config.size * 1.12, 128]} />
        <meshBasicMaterial
          color="#1e3a5f"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* C ring — translucent, grayish */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.14, config.size * 1.22, 128]} />
        <meshBasicMaterial
          color="#64748b"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* B ring — brightest, most opaque, ice-rich */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.24, config.size * 1.48, 128]} />
        <meshBasicMaterial
          color="#bfdbfe"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* B ring ringlets — density waves create subtle structure */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.4]}>
          <ringGeometry
            args={[
              config.size * (1.28 + i * 0.035),
              config.size * (1.3 + i * 0.035),
              64,
            ]}
          />
          <meshBasicMaterial
            color="#dbeafe"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* Cassini Division — 4800 km wide gap, darker due to less material */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.49, config.size * 1.56, 128]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* A ring — outer main ring, contains Encke Gap */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.57, config.size * 1.78, 128]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Encke Gap — 325 km wide, maintained by Pan moonlet */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.68, config.size * 1.72, 64]} />
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* F ring — narrow, braided, shepherded by Prometheus & Pandora */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.82, config.size * 1.86, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Shepherd moons maintaining ring structure */}
      <group ref={satellitesRef}>
        {/* Pan — 28 km, orbits in Encke Gap, creates waves */}
        <mesh position={[config.size * 1.7, 0, 0]}>
          <dodecahedronGeometry args={[config.size * 0.025, 0]} />
          <meshStandardMaterial
            color="#94a3b8"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        {/* Prometheus — 136 × 79 × 59 km, inner F-ring shepherd */}
        <mesh position={[config.size * 1.84, 0, 0]} rotation={[0.3, 0, 0.5]}>
          <boxGeometry
            args={[config.size * 0.04, config.size * 0.025, config.size * 0.02]}
          />
          <meshStandardMaterial
            color="#cbd5e1"
            roughness={0.6}
            metalness={0.25}
          />
        </mesh>
        {/* Pandora — 104 × 81 × 64 km, outer F-ring shepherd */}
        <mesh position={[-config.size * 1.84, 0, 0]} rotation={[0.2, 0.3, 0]}>
          <boxGeometry
            args={[
              config.size * 0.032,
              config.size * 0.025,
              config.size * 0.018,
            ]}
          />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.65}
            metalness={0.2}
          />
        </mesh>
        {/* Atlas — 30 × 20 km, A-ring outer edge */}
        <mesh position={[0, 0, config.size * 1.8]}>
          <dodecahedronGeometry args={[config.size * 0.02, 0]} />
          <meshStandardMaterial
            color="#b0c4de"
            roughness={0.75}
            metalness={0.15}
          />
        </mesh>
      </group>

      {/* Hexagonal polar storm — Saturn's north pole jet stream
          6-sided pattern, each side ~13,800 km long */}
      <mesh position={[0, config.size * 0.8, 0]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry
          args={[
            config.size * 0.22,
            config.size * 0.22,
            config.size * 0.015,
            6,
          ]}
        />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Central vortex eye of hexagon */}
      <mesh position={[0, config.size * 0.82, 0]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry
          args={[config.size * 0.08, config.size * 0.06, config.size * 0.02, 6]}
        />
        <meshBasicMaterial
          color="#1d4ed8"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Polar hexagon aurora glow */}
      <mesh position={[0, config.size * 0.78, 0]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry
          args={[config.size * 0.3, config.size * 0.28, config.size * 0.01, 6]}
        />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
