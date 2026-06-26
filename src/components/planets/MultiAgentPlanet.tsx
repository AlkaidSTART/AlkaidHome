import * as THREE from "three";
import type { PlanetVisualProps } from "./types";

export default function MultiAgentPlanet({
  config,
  satellitesRef,
}: PlanetVisualProps) {
  return (
    <group>
      {/* Multi-layered equatorial banding — Jupiter's cloud bands
          alternate between zones (upwelling, ammonia clouds, light)
          and belts (sinking, darker compounds) */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry
          args={[config.size * 1.04, config.size * 0.035, 8, 64]}
        />
        <meshBasicMaterial
          color="#fbcfe8"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.08, 0, 0]}>
        <torusGeometry args={[config.size * 0.98, config.size * 0.03, 8, 64]} />
        <meshBasicMaterial
          color="#be185d"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.16, 0, 0]}>
        <torusGeometry
          args={[config.size * 0.92, config.size * 0.025, 8, 64]}
        />
        <meshBasicMaterial
          color="#fce7f3"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.24, 0, 0]}>
        <torusGeometry
          args={[config.size * 0.86, config.size * 0.022, 8, 64]}
        />
        <meshBasicMaterial
          color="#9d174d"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.32, 0, 0]}>
        <torusGeometry args={[config.size * 0.8, config.size * 0.02, 8, 64]} />
        <meshBasicMaterial
          color="#fdf2f8"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Great Red Spot analog — anticyclonic storm, 400+ years old */}
      <mesh
        position={[config.size * 0.65, config.size * 0.15, config.size * 0.45]}
        rotation={[0.3, 0.6, 0]}
      >
        <sphereGeometry args={[config.size * 0.22, 16, 16]} />
        <meshBasicMaterial
          color="#be123c"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Red Spot turbulent wake — chaotic eddies trailing behind */}
      <mesh
        position={[config.size * 0.35, config.size * 0.12, config.size * 0.6]}
        rotation={[0.2, 0.9, 0.1]}
      >
        <sphereGeometry args={[config.size * 0.12, 12, 12]} />
        <meshBasicMaterial
          color="#e11d48"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[config.size * 0.15, config.size * 0.08, config.size * 0.7]}
        rotation={[0.15, 1.1, 0.15]}
      >
        <sphereGeometry args={[config.size * 0.08, 10, 10]} />
        <meshBasicMaterial
          color="#fb7185"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Four major moons in orbital resonance (like Galilean moons)
          Io:Europa:Ganymede = 4:2:1 orbital resonance */}
      <group ref={satellitesRef}>
        {/* Io — volcanic sulfur surface, most geologically active body */}
        <mesh position={[config.size * 1.45, 0, 0]}>
          <sphereGeometry args={[config.size * 0.1, 12, 12]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>
        {/* Io volcanic plume — Pele or Prometheus eruption */}
        <mesh position={[config.size * 1.45, config.size * 0.12, 0]}>
          <coneGeometry args={[config.size * 0.02, config.size * 0.1, 6]} />
          <meshBasicMaterial
            color="#fef3c7"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* Europa — water ice crust, smoothest surface in solar system */}
        <mesh position={[0, 0, config.size * 1.85]}>
          <sphereGeometry args={[config.size * 0.085, 12, 12]} />
          <meshStandardMaterial
            color="#dbeafe"
            roughness={0.25}
            metalness={0.25}
          />
        </mesh>
        {/* Europa ice fracture lines */}
        <mesh position={[0, 0, config.size * 1.88]} rotation={[0.5, 0, 0]}>
          <torusGeometry
            args={[config.size * 0.06, config.size * 0.005, 4, 16]}
          />
          <meshBasicMaterial
            color="#93c5fd"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* Ganymede — largest moon, differentiated interior, grooved terrain */}
        <mesh position={[-config.size * 2.3, 0, 0]}>
          <sphereGeometry args={[config.size * 0.115, 12, 12]} />
          <meshStandardMaterial
            color="#a1a1aa"
            roughness={0.75}
            metalness={0.2}
          />
        </mesh>
        {/* Ganymede polar frost caps */}
        <mesh position={[-config.size * 2.3, config.size * 0.1, 0]}>
          <sphereGeometry
            args={[config.size * 0.04, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.4]}
          />
          <meshStandardMaterial
            color="#e4e4e7"
            roughness={0.3}
            metalness={0.15}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Callisto — most heavily cratered, ancient surface */}
        <mesh position={[0, 0, -config.size * 2.9]}>
          <sphereGeometry args={[config.size * 0.095, 12, 12]} />
          <meshStandardMaterial
            color="#52525b"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
        {/* Callisto large impact basin — Valhalla multi-ring structure */}
        <mesh position={[0, config.size * 0.06, -config.size * 2.92]}>
          <ringGeometry args={[config.size * 0.03, config.size * 0.06, 16]} />
          <meshBasicMaterial
            color="#3f3f46"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      {/* Faint ring system — Jupiter's gossamer rings
          Halo ring (inner, thick) + Main ring + Gossamer rings (outer) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.35, config.size * 1.42, 64]} />
        <meshBasicMaterial
          color="#fce7f3"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.size * 1.55, config.size * 1.62, 64]} />
        <meshBasicMaterial
          color="#fbcfe8"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
