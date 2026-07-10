 import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
 import { planetVertexShader, getPlanetFragmentShader } from "../shaders/planet";
import { ORBITS, getOrbitalPosition } from "../lib/orbital";
import type { PlanetConfig } from "./planets/config";
import { useAppStore } from "../store";
import VoiceCanvasPlanet from "./planets/VoiceCanvasPlanet";
import AutonomousAgentPlanet from "./planets/AutonomousAgentPlanet";
import MultiAgentPlanet from "./planets/MultiAgentPlanet";
import AgenticRagPlanet from "./planets/AgenticRagPlanet";

function PlanetVisual({
  id,
  size,
  hexColor,
  satellitesRef,
}: {
  id: number;
  size: number;
  hexColor: string;
  satellitesRef: React.RefObject<THREE.Group | null>;
}) {
  const config = { id, size, hexColor };

  switch (id) {
    case 1:
      return <VoiceCanvasPlanet config={config} satellitesRef={satellitesRef} />;
    case 2:
      return <AutonomousAgentPlanet config={config} satellitesRef={satellitesRef} />;
    case 3:
      return <MultiAgentPlanet config={config} satellitesRef={satellitesRef} />;
    case 4:
      return <AgenticRagPlanet config={config} satellitesRef={satellitesRef} />;
    default:
      return null;
  }
}

export default function Planet({
  config,
  index,
  speed,
}: {
  config: PlanetConfig;
  index: number;
  speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);

  const hoveredPlanetId = useAppStore((state) => state.hoveredPlanetId);
  const setHoveredPlanetId = useAppStore((state) => state.setHoveredPlanetId);
  const setActivePlanetId = useAppStore((state) => state.setActivePlanetId);

  const orbit = ORBITS[index];

  const baseColor = useMemo(() => {
    const c = new THREE.Color(config.hexColor);
    return `${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)}`;
  }, [config.hexColor]);

  const glowColor = useMemo(() => {
    const c = new THREE.Color(config.hexColor);
    return `${(c.r * 1.3).toFixed(3)}, ${(c.g * 1.3).toFixed(3)}, ${(c.b * 1.3).toFixed(3)}`;
  }, [config.hexColor]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: planetVertexShader,
      fragmentShader: getPlanetFragmentShader(baseColor, glowColor),
    });
  }, [baseColor, glowColor]);

  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: planetVertexShader,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
          vec3 color = vec3(${glowColor}) * fresnel * 0.3;
          gl_FragColor = vec4(color, fresnel * 0.25);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [glowColor]);

  useEffect(() => {
    return () => {
      material.dispose();
      glowMaterial.dispose();
    };
  }, [material, glowMaterial]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const isHovered = hoveredPlanetId === config.id;

    const meanMotion = (2 * Math.PI) / orbit.period;
    const M = state.clock.elapsedTime * meanMotion * speed;

    const pos = getOrbitalPosition(orbit, M);

    const finalX = pos.x;
    const finalY = pos.y;
    const finalZ = pos.z;

    const distanceFromCenter = Math.sqrt(
      finalX * finalX + finalY * finalY + finalZ * finalZ,
    );
    const avgDist = orbit.a;
    const depth = (avgDist - distanceFromCenter) / (orbit.a * orbit.e || 1);
    const scale = 0.9 + (depth + 1) * 0.08;

    groupRef.current.position.set(finalX, finalY, finalZ);
    groupRef.current.scale.setScalar(scale * (isHovered ? 1.1 : 1.0));

    if (meshRef.current) {
      const rotationSpeed = 0.05 + (1 / distanceFromCenter) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }

    if (glowRef.current) {
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      glowRef.current.scale.setScalar(pulse);
    }

    if (satellitesRef.current) {
      const orbitSpeed = config.id === 3 ? 0.2 : 0.35;
      satellitesRef.current.rotation.y = state.clock.elapsedTime * orbitSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        material={material}
        onPointerEnter={() => setHoveredPlanetId(config.id)}
        onPointerLeave={() => setHoveredPlanetId(null)}
        onClick={() => setActivePlanetId(config.id)}
      >
        <sphereGeometry args={[config.size, 32, 32]} />
      </mesh>

      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[config.size * 1.3, 16, 16]} />
      </mesh>

      <PlanetVisual
        id={config.id}
        size={config.size}
        hexColor={config.hexColor}
        satellitesRef={satellitesRef}
      />
    </group>
  );
}
