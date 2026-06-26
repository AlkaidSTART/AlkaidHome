import * as THREE from "three";
import type { PlanetVisualProps } from "./types";

export default function AutonomousAgentPlanet({
  config,
  satellitesRef,
}: PlanetVisualProps) {
  return (
    <group>
      {/* Thin dust atmosphere — Mars CO2 atmosphere scatters red light */}
      <mesh>
        <sphereGeometry args={[config.size * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#c2410c"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[config.size * 1.04, 32, 32]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* North polar ice cap — seasonal CO2 frost + water ice */}
      <mesh position={[0, config.size * 0.82, 0]} rotation={[0.3, 0, 0]}>
        <sphereGeometry
          args={[config.size * 0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]}
        />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* South polar ice cap — smaller, residual */}
      <mesh position={[0, -config.size * 0.82, 0]} rotation={[-0.3, 0, 0]}>
        <sphereGeometry
          args={[config.size * 0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]}
        />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.75}
        />
      </mesh>
      {/* Olympus Mons — largest shield volcano in solar system */}
      <mesh
        position={[config.size * 0.5, config.size * 0.55, config.size * 0.35]}
        rotation={[0.5, 0.8, 0]}
      >
        <coneGeometry args={[config.size * 0.18, config.size * 0.15, 12]} />
        <meshStandardMaterial
          color="#9a3412"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      {/* Caldera at summit */}
      <mesh
        position={[config.size * 0.5, config.size * 0.62, config.size * 0.35]}
        rotation={[0.5, 0.8, 0]}
      >
        <cylinderGeometry
          args={[
            config.size * 0.06,
            config.size * 0.08,
            config.size * 0.02,
            12,
          ]}
        />
        <meshStandardMaterial
          color="#7c2d12"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* Valles Marineris — massive canyon system */}
      <mesh
        position={[-config.size * 0.4, config.size * 0.2, config.size * 0.55]}
        rotation={[0.2, 1.2, 0.1]}
      >
        <boxGeometry
          args={[config.size * 0.5, config.size * 0.04, config.size * 0.08]}
        />
        <meshStandardMaterial color="#431407" roughness={1} metalness={0} />
      </mesh>
      {/* Two captured asteroid moons (like Mars' Phobos & Deimos) */}
      <group ref={satellitesRef}>
        {/* Phobos — heavily cratered, closest, orbits fast */}
        <mesh position={[config.size * 1.5, config.size * 0.1, 0]}>
          <dodecahedronGeometry args={[config.size * 0.1, 0]} />
          <meshStandardMaterial
            color="#57534e"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
        {/* Stickney crater on Phobos */}
        <mesh
          position={[config.size * 1.5, config.size * 0.1, config.size * 0.07]}
        >
          <sphereGeometry args={[config.size * 0.04, 8, 8]} />
          <meshStandardMaterial color="#292524" roughness={1} metalness={0} />
        </mesh>
        {/* Deimos — smoother, more distant */}
        <mesh
          position={[
            -config.size * 2.1,
            -config.size * 0.05,
            config.size * 0.2,
          ]}
        >
          <dodecahedronGeometry args={[config.size * 0.055, 0]} />
          <meshStandardMaterial
            color="#78716c"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
      </group>
      {/* Global dust storm wisps — seasonal, planet-encircling */}
      <mesh rotation={[Math.PI / 3, 0.5, 0]}>
        <ringGeometry args={[config.size * 1.25, config.size * 1.35, 64]} />
        <meshBasicMaterial
          color="#c2410c"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
        <ringGeometry args={[config.size * 1.32, config.size * 1.38, 48]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
