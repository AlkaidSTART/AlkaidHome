import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface SolarSystemProps {
  speed: number;
  onPlanetClick: (id: number) => void;
}

interface PlanetConfig {
  id: number;
  name: string;
  role: string;
  desc: string;
  color: string;
  hexColor: string;
  rx: number;
  ry: number;
  speedCoeff: number;
  startAngle: number;
  size: number;
  stats: { label: string; value: string }[];
}

// ─── Real Orbital Mechanics ───
// Using Kepler's laws:
//  1. Orbits are ellipses with the central body at one focus
//  2. Equal areas swept in equal times (conservation of angular momentum)
//  3. T² ∝ a³ (period squared ∝ semi-major axis cubed)
//
// Planet masses (relative units) for mutual gravitational perturbation
const PLANET_MASS = [0.8, 1.2, 2.5, 1.8]; // relative masses

interface OrbitParams {
  a: number; // semi-major axis
  e: number; // eccentricity (0 = circle, closer to 1 = more elliptical)
  i: number; // inclination (rad)
  omega: number; // argument of periapsis (rotation of ellipse)
  M0: number; // mean anomaly at epoch (starting position)
  period: number; // orbital period (seconds at speed=1)
}

// Realistic orbital parameters — scaled to fit within viewport
// FOV 50° at distance 12: visible radius ≈ 12 * tan(25°) ≈ 5.6
// All orbits must fit within ~5.0 units radius
// Spaced apart to prevent planet collisions while maintaining realism
const ORBITS: OrbitParams[] = [
  // Planet 1: VoiceCanvas — tight inner orbit
  { a: 1.5, e: 0.12, i: 0.05, omega: 0.5, M0: 0, period: 6 },
  // Planet 2: Autonomous Agent — middle orbit
  { a: 2.3, e: 0.1, i: -0.04, omega: 2.0, M0: Math.PI / 3, period: 12 },
  // Planet 3: Multi-Agent System — larger orbit
  { a: 3.1, e: 0.08, i: 0.03, omega: 3.8, M0: Math.PI * 0.7, period: 20 },
  // Planet 4: Agentic RAG — outermost orbit, scaled down to fit
  { a: 3.9, e: 0.1, i: -0.02, omega: 5.2, M0: Math.PI * 1.3, period: 32 },
];

// Solve Kepler's equation: M = E - e*sin(E) for E (eccentric anomaly)
// Using Newton-Raphson iteration
function solveKepler(M: number, e: number, maxIter = 10): number {
  let E = M; // initial guess
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

// Get position on elliptical orbit from mean anomaly
function getOrbitalPosition(
  orbit: OrbitParams,
  M: number,
): { x: number; y: number; z: number; speed: number } {
  const E = solveKepler(M, orbit.e);

  // True anomaly
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrt1me2 = Math.sqrt(1 - orbit.e * orbit.e);

  // Position in orbital plane (perifocal coordinates)
  // r = a(1 - e*cosE) — radial distance
  const xOrbital = orbit.a * (cosE - orbit.e);
  const zOrbital = orbit.a * sqrt1me2 * sinE;

  // Orbital velocity factor (vis-viva equation scaled)
  // v ∝ sqrt(2/r - 1/a), but we need angular speed for visual feedback
  const speed = Math.sqrt((1 + orbit.e * Math.cos(E)) / (1 - orbit.e * cosE));

  // Rotate by argument of periapsis (omega)
  const cosO = Math.cos(orbit.omega);
  const sinO = Math.sin(orbit.omega);
  const xRot = xOrbital * cosO - zOrbital * sinO;
  const zRot = xOrbital * sinO + zOrbital * cosO;

  // Apply inclination (tilt the orbital plane)
  const cosI = Math.cos(orbit.i);
  const sinI = Math.sin(orbit.i);
  const y = xRot * sinI;
  const x = xRot * cosI;
  const z = zRot;

  return { x, y, z, speed };
}

// Compute mutual gravitational perturbation acceleration
// F = G*m1*m2/r², a = F/m1 = G*m2/r²
function computePerturbation(
  positions: { x: number; y: number; z: number }[],
  myIndex: number,
  G = 0.008,
): { ax: number; ay: number; az: number } {
  let ax = 0,
    ay = 0,
    az = 0;
  const myPos = positions[myIndex];

  for (let i = 0; i < positions.length; i++) {
    if (i === myIndex) continue;

    const dx = positions[i].x - myPos.x;
    const dy = positions[i].y - myPos.y;
    const dz = positions[i].z - myPos.z;
    const r2 = dx * dx + dy * dy + dz * dz;

    // Softening to prevent singularity
    const softening = 0.5;
    const rSoft = Math.sqrt(r2 + softening * softening);
    const factor = (G * PLANET_MASS[i]) / (rSoft * rSoft * rSoft);

    ax += factor * dx;
    ay += factor * dy;
    az += factor * dz;
  }

  return { ax, ay, az };
}

const PLANETS_CONFIG: PlanetConfig[] = [
  {
    id: 1,
    name: "VoiceCanvas",
    role: "Multimodal Stream",
    desc: "Real-time duplex conversational audio system.",
    color: "var(--c-planet-1)",
    hexColor: "#06b6d4",
    rx: 1.5,
    ry: 1.0,
    speedCoeff: 1.0,
    startAngle: 0,
    size: 0.35,
    stats: [
      { label: "LATENCY", value: "120ms" },
      { label: "CODEC", value: "Opus 48kbps" },
      { label: "MOS SCORE", value: "4.65" },
    ],
  },
  {
    id: 2,
    name: "Autonomous Agent",
    role: "Tool Use Specialist",
    desc: "Autonomous loops executing sandboxed commands.",
    color: "var(--c-planet-2)",
    hexColor: "#10b981",
    rx: 2.3,
    ry: 1.5,
    speedCoeff: 0.7,
    startAngle: Math.PI / 2,
    size: 0.4,
    stats: [
      { label: "SUCCESS RATE", value: "94.2%" },
      { label: "STEPS / TASK", value: "12 steps" },
      { label: "RUNS", value: "48k / day" },
    ],
  },
  {
    id: 3,
    name: "Multi-Agent System",
    role: "Collaborative Ecosystem",
    desc: "Distributed queue broker orchestrating team consensus.",
    color: "var(--c-planet-3)",
    hexColor: "#ec4899",
    rx: 3.1,
    ry: 2.0,
    speedCoeff: 0.45,
    startAngle: Math.PI,
    size: 0.45,
    stats: [
      { label: "AGENT NODES", value: "3 Active" },
      { label: "CONSENSUS", value: "98.5%" },
      { label: "ITERATIONS", value: "4.2 cycles" },
    ],
  },
  {
    id: 4,
    name: "Agentic RAG & Memory",
    role: "Knowledge Hub",
    desc: "Cosine vector retrieval & episodic graph memories.",
    color: "var(--c-planet-4)",
    hexColor: "#3b82f6",
    rx: 3.9,
    ry: 2.4,
    speedCoeff: 0.3,
    startAngle: (3 * Math.PI) / 2,
    size: 0.5,
    stats: [
      { label: "VECTORS", value: "1.2M docs" },
      { label: "SEARCH LATENCY", value: "14ms" },
      { label: "CACHE HIT", value: "88%" },
    ],
  },
];

/* ─── Shaders ─── */

const planetVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function getPlanetFragmentShader(baseColor: string, glowColor: string) {
  return `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

      vec3 base = vec3(${baseColor});
      vec3 glow = vec3(${glowColor});

      // Static lighting from top-left
      vec3 lightDir = normalize(vec3(1.0, 0.8, 0.3));
      float diff = max(dot(vNormal, lightDir), 0.0);

      // Subtle atmosphere glow
      vec3 atmosphere = glow * fresnel * 0.4;

      // Dark side
      float lit = smoothstep(-0.1, 0.4, diff);
      vec3 color = mix(base * 0.2, base * 0.85 + glow * 0.2, lit) + atmosphere;

      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

const coreVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ─── 3D Components ─── */

// Shared orbital state for mutual gravitational perturbation
const orbitalState = {
  meanAnomalies: ORBITS.map((o) => o.M0),
  perturbations: ORBITS.map(() => ({ x: 0, y: 0, z: 0 })),
  velocities: ORBITS.map(() => ({ x: 0, y: 0, z: 0 })),
};

// Generate elliptical orbit line geometry
function generateOrbitGeometry(orbit: OrbitParams): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const segments = 256;

  for (let i = 0; i <= segments; i++) {
    const M = (i / segments) * Math.PI * 2;
    const pos = getOrbitalPosition(orbit, M);
    points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}

function OrbitLine({
  orbit,
  color,
  hovered,
}: {
  orbit: OrbitParams;
  color: string;
  hovered: boolean;
}) {
  const geometry = useMemo(() => generateOrbitGeometry(orbit), [orbit]);

  const line = useMemo(() => {
    const c = new THREE.Color(color);
    const lineColor = hovered
      ? new THREE.Color(0x4f46e5)
      : new THREE.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4);
    const opacity = hovered ? 0.5 : 0.15;
    const mat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity,
    });
    return new THREE.Line(geometry, mat);
  }, [geometry, color, hovered]);

  return <primitive object={line} />;
}

function Planet({
  config,
  index,
  speed,
  hoveredPlanetId,
  setHoveredPlanetId,
  onPlanetClick,
}: {
  config: PlanetConfig;
  index: number;
  speed: number;
  hoveredPlanetId: number | null;
  setHoveredPlanetId: (id: number | null) => void;
  onPlanetClick: (id: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const satellitesRef = useRef<THREE.Group>(null);

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
      vertexShader: coreVertexShader,
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

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isHovered = hoveredPlanetId === config.id;

    // Update mean anomaly using Kepler's 3rd law: n = 2π/T
    const meanMotion = (2 * Math.PI) / orbit.period;
    orbitalState.meanAnomalies[index] += delta * meanMotion * speed;

    // Get base elliptical position
    const M = orbitalState.meanAnomalies[index];
    const pos = getOrbitalPosition(orbit, M);

    // Apply mutual gravitational perturbation
    // First compute all positions
    const allPositions = ORBITS.map((o, i) => {
      const m = orbitalState.meanAnomalies[i];
      const p = getOrbitalPosition(o, m);
      return {
        x: p.x + orbitalState.perturbations[i].x,
        y: p.y + orbitalState.perturbations[i].y,
        z: p.z + orbitalState.perturbations[i].z,
      };
    });

    // Compute perturbation acceleration for this planet
    const pert = computePerturbation(allPositions, index);

    // Update velocity (verlet-like integration)
    orbitalState.velocities[index].x += pert.ax * delta;
    orbitalState.velocities[index].y += pert.ay * delta;
    orbitalState.velocities[index].z += pert.az * delta;

    // Apply damping to prevent energy growth
    const damping = 0.98;
    orbitalState.velocities[index].x *= damping;
    orbitalState.velocities[index].y *= damping;
    orbitalState.velocities[index].z *= damping;

    // Update perturbation displacement
    orbitalState.perturbations[index].x +=
      orbitalState.velocities[index].x * delta;
    orbitalState.perturbations[index].y +=
      orbitalState.velocities[index].y * delta;
    orbitalState.perturbations[index].z +=
      orbitalState.velocities[index].z * delta;

    // Clamp perturbation to prevent runaway
    const maxPert = 0.3;
    orbitalState.perturbations[index].x = Math.max(
      -maxPert,
      Math.min(maxPert, orbitalState.perturbations[index].x),
    );
    orbitalState.perturbations[index].y = Math.max(
      -maxPert,
      Math.min(maxPert, orbitalState.perturbations[index].y),
    );
    orbitalState.perturbations[index].z = Math.max(
      -maxPert,
      Math.min(maxPert, orbitalState.perturbations[index].z),
    );

    // Final position = elliptical + perturbation
    const finalX = pos.x + orbitalState.perturbations[index].x;
    const finalY = pos.y + orbitalState.perturbations[index].y;
    const finalZ = pos.z + orbitalState.perturbations[index].z;

    // Depth-based scale (closer = larger)
    const distanceFromCenter = Math.sqrt(
      finalX * finalX + finalY * finalY + finalZ * finalZ,
    );
    const avgDist = orbit.a;
    const depth = (avgDist - distanceFromCenter) / (orbit.a * orbit.e || 1);
    const scale = 0.9 + (depth + 1) * 0.08;

    groupRef.current.position.set(finalX, finalY, finalZ);
    groupRef.current.scale.setScalar(scale * (isHovered ? 1.1 : 1.0));

    // Planet self-rotation (faster when closer — tidal effects)
    if (meshRef.current) {
      const rotationSpeed = 0.05 + (1 / distanceFromCenter) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }

    // Atmosphere pulse
    if (glowRef.current) {
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      glowRef.current.scale.setScalar(pulse);
    }

    // Ring rotation (Planet 2 dust wisps)
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.08;
    }

    // Satellites orbit
    if (satellitesRef.current) {
      const orbitSpeed = config.id === 3 ? 0.2 : 0.35;
      satellitesRef.current.rotation.y = state.clock.elapsedTime * orbitSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet sphere */}
      <mesh
        ref={meshRef}
        material={material}
        onPointerEnter={() => setHoveredPlanetId(config.id)}
        onPointerLeave={() => setHoveredPlanetId(null)}
        onClick={() => onPlanetClick(config.id)}
      >
        <sphereGeometry args={[config.size, 32, 32]} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[config.size * 1.3, 16, 16]} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════
          PLANET 1: VoiceCanvas — Ice Giant with Cryovolcanic Plumes
          Like Neptune/Triton: deep blue, smooth surface, polar geysers
          ═══════════════════════════════════════════════════════════ */}
      {config.id === 1 && (
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
            <ringGeometry
              args={[config.size * 1.35, config.size * 1.38, 128]}
            />
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
      )}

      {/* ═══════════════════════════════════════════════════════════
          PLANET 2: Autonomous Agent — Terrestrial Desert World
          Like Mars: iron oxide surface, dust storms, two small moons,
          Olympus Mons shield volcano, polar ice caps, Valles Marineris
          ═══════════════════════════════════════════════════════════ */}
      {config.id === 2 && (
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
              args={[
                config.size * 0.28,
                16,
                16,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.35,
              ]}
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
              args={[
                config.size * 0.2,
                16,
                16,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.35,
              ]}
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
            position={[
              config.size * 0.5,
              config.size * 0.55,
              config.size * 0.35,
            ]}
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
            position={[
              config.size * 0.5,
              config.size * 0.62,
              config.size * 0.35,
            ]}
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
            position={[
              -config.size * 0.4,
              config.size * 0.2,
              config.size * 0.55,
            ]}
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
              position={[
                config.size * 1.5,
                config.size * 0.1,
                config.size * 0.07,
              ]}
            >
              <sphereGeometry args={[config.size * 0.04, 8, 8]} />
              <meshStandardMaterial
                color="#292524"
                roughness={1}
                metalness={0}
              />
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
      )}

      {/* ═══════════════════════════════════════════════════════════
          PLANET 3: Multi-Agent System — Gas Giant with Major Moons
          Like Jupiter: complex banded atmosphere, Great Red Spot analog,
          4 Galilean-like moons in orbital resonance, faint ring system
          ═══════════════════════════════════════════════════════════ */}
      {config.id === 3 && (
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
            <torusGeometry
              args={[config.size * 0.98, config.size * 0.03, 8, 64]}
            />
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
            <torusGeometry
              args={[config.size * 0.8, config.size * 0.02, 8, 64]}
            />
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
            position={[
              config.size * 0.65,
              config.size * 0.15,
              config.size * 0.45,
            ]}
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
            position={[
              config.size * 0.35,
              config.size * 0.12,
              config.size * 0.6,
            ]}
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
            position={[
              config.size * 0.15,
              config.size * 0.08,
              config.size * 0.7,
            ]}
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
                args={[
                  config.size * 0.04,
                  8,
                  8,
                  0,
                  Math.PI * 2,
                  0,
                  Math.PI * 0.4,
                ]}
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
              <ringGeometry
                args={[config.size * 0.03, config.size * 0.06, 16]}
              />
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
      )}

      {/* ═══════════════════════════════════════════════════════════
          PLANET 4: Agentic RAG & Memory — Ringed Ice World
          Like Saturn: prominent ring system with C/B/A rings + Cassini Division,
          Encke Gap, hexagonal polar storm, shepherd moons, major moon Titan
          ═══════════════════════════════════════════════════════════ */}
      {config.id === 4 && (
        <group>
          {/* Saturn's ring system — from inner to outer:
              D ring (faint, innermost) → C ring (translucent) →
              B ring (brightest, densest) → Cassini Division (gap) →
              A ring (bright) → Encke Gap → F ring (narrow, braided) →
              G ring (faint) → E ring (very faint, diffuse) */}

          {/* D ring — extremely faint, innermost */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[config.size * 1.08, config.size * 1.12, 128]}
            />
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
            <ringGeometry
              args={[config.size * 1.14, config.size * 1.22, 128]}
            />
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
            <ringGeometry
              args={[config.size * 1.24, config.size * 1.48, 128]}
            />
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
            <ringGeometry
              args={[config.size * 1.49, config.size * 1.56, 128]}
            />
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
            <ringGeometry
              args={[config.size * 1.57, config.size * 1.78, 128]}
            />
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
            <mesh
              position={[config.size * 1.84, 0, 0]}
              rotation={[0.3, 0, 0.5]}
            >
              <boxGeometry
                args={[
                  config.size * 0.04,
                  config.size * 0.025,
                  config.size * 0.02,
                ]}
              />
              <meshStandardMaterial
                color="#cbd5e1"
                roughness={0.6}
                metalness={0.25}
              />
            </mesh>
            {/* Pandora — 104 × 81 × 64 km, outer F-ring shepherd */}
            <mesh
              position={[-config.size * 1.84, 0, 0]}
              rotation={[0.2, 0.3, 0]}
            >
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
              args={[
                config.size * 0.08,
                config.size * 0.06,
                config.size * 0.02,
                6,
              ]}
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
              args={[
                config.size * 0.3,
                config.size * 0.28,
                config.size * 0.01,
                6,
              ]}
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
      )}
    </group>
  );
}

function Core({ onHover }: { onHover: (hovered: boolean) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Moon-like white/silver surface with subtle crater noise
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: coreVertexShader,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simple noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

          // Moon surface noise - subtle craters
          float noise1 = snoise(vNormal * 4.0);
          float noise2 = snoise(vNormal * 8.0) * 0.5;
          float noise3 = snoise(vNormal * 16.0) * 0.25;
          float surfaceNoise = (noise1 + noise2 + noise3) / 1.75;

          // Moon colors - white to light gray
          vec3 brightSide = vec3(0.95, 0.95, 0.97);
          vec3 darkSide = vec3(0.75, 0.75, 0.78);
          vec3 craterColor = vec3(0.65, 0.65, 0.68);

          // Surface variation
          float craterMask = smoothstep(0.1, 0.4, surfaceNoise);
          vec3 surfaceColor = mix(craterColor, brightSide, craterMask);
          surfaceColor = mix(darkSide, surfaceColor, 0.7);

          // Static lighting from top-left
          vec3 lightDir = normalize(vec3(1.0, 0.8, 0.3));
          float diff = max(dot(vNormal, lightDir), 0.0);
          float lit = smoothstep(-0.1, 0.4, diff);

          // Apply lighting
          surfaceColor = mix(surfaceColor * 0.3, surfaceColor, lit);

          // Subtle silver glow on edge
          vec3 glow = vec3(0.85, 0.88, 0.95) * fresnel * 0.15;

          gl_FragColor = vec4(surfaceColor + glow, 1.0);
        }
      `,
    });
  }, []);

  // Soft white/silver glow
  const glowMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: coreVertexShader,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
          vec3 color = vec3(0.9, 0.92, 0.98) * fresnel * 0.3;
          gl_FragColor = vec4(color, fresnel * 0.2);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Outer soft halo
  const outerGlowMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: coreVertexShader,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
          vec3 color = vec3(0.85, 0.88, 0.95) * fresnel * 0.15;
          gl_FragColor = vec4(color, fresnel * 0.08);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Soft particles around moon
  const particleGeometry = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.6;
      const height = (Math.random() - 0.5) * 0.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
        time;
      meshRef.current.rotation.y = time * 0.01;
    }
    if (glowRef.current) {
      const pulse = Math.sin(time * 0.5) * 0.05 + 1.15;
      glowRef.current.scale.setScalar(pulse);
    }
    if (outerGlowRef.current) {
      const pulse = Math.sin(time * 0.3) * 0.08 + 1.8;
      outerGlowRef.current.scale.setScalar(pulse);
    }
    // Slow rotating ring
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.03;
      ringRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
    // Slow orbiting particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
    >
      {/* Main moon sphere */}
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[0.85, 64, 64]} />
      </mesh>

      {/* Soft inner glow */}
      <mesh ref={glowRef} material={glowMat}>
        <sphereGeometry args={[1.05, 32, 32]} />
      </mesh>

      {/* Outer soft halo */}
      <mesh ref={outerGlowRef} material={outerGlowMat}>
        <sphereGeometry args={[1.35, 32, 32]} />
      </mesh>

      {/* Subtle silver ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.45, 1.48, 128]} />
          <meshBasicMaterial
            color={0xc0c8d8}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Soft orbiting particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          color={0xd0d8e8}
          size={0.03}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Scene({
  speed,
  onPlanetClick,
  hoveredPlanetId,
  setHoveredPlanetId,
  onCoreHover,
}: {
  speed: number;
  onPlanetClick: (id: number) => void;
  hoveredPlanetId: number | null;
  setHoveredPlanetId: (id: number | null) => void;
  onCoreHover: (hovered: boolean) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Camera positioned to see all orbits within viewport
    // FOV 50°: at z=12, visible height ≈ 2*12*tan(25°) ≈ 11.2
    // Furthest orbit a=3.9 with e=0.10 → max radius ≈ 4.3
    // More distance ensures all orbits fit comfortably
    camera.position.set(0, 1.2, 12);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group rotation={[Math.PI / 5, 0, 0]}>
      {/* Core - AlkaidSTART */}
      <Core onHover={onCoreHover} />

      {/* Elliptical orbit lines */}
      {PLANETS_CONFIG.map((planet, index) => (
        <OrbitLine
          key={`orbit-${planet.id}`}
          orbit={ORBITS[index]}
          color={planet.hexColor}
          hovered={hoveredPlanetId === planet.id}
        />
      ))}

      {/* Planets with real orbital mechanics */}
      {PLANETS_CONFIG.map((planet, index) => (
        <Planet
          key={planet.id}
          config={planet}
          index={index}
          speed={speed}
          hoveredPlanetId={hoveredPlanetId}
          setHoveredPlanetId={setHoveredPlanetId}
          onPlanetClick={onPlanetClick}
        />
      ))}
    </group>
  );
}

/* ─── DOM HUD Overlay ─── */

function PlanetLabel({
  config,
  index,
  speed,
}: {
  config: PlanetConfig;
  index: number;
  speed: number;
  hoveredPlanetId?: number | null;
}) {
  const [screenPos, setScreenPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const orbit = ORBITS[index];
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let frameId: number;

    const update = (time: number) => {
      const delta = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 0.016;
      lastTimeRef.current = time;

      // Update mean anomaly — same physics as Planet component
      const meanMotion = (2 * Math.PI) / orbit.period;
      orbitalState.meanAnomalies[index] += delta * meanMotion * speed;

      const M = orbitalState.meanAnomalies[index];
      const pos = getOrbitalPosition(orbit, M);

      // Apply same perturbation as Planet
      const finalX = pos.x + orbitalState.perturbations[index].x;
      const finalY = pos.y + orbitalState.perturbations[index].y;
      const finalZ = pos.z + orbitalState.perturbations[index].z;

      // Project to screen
      const distance = 14;
      const tilt = Math.PI / 5;
      const projectedY = finalY / (distance - finalZ * Math.cos(tilt));
      const projectedX = finalX / (distance - finalZ * Math.cos(tilt));

      const screenX = 50 + projectedX * 25;
      const screenY = 50 - projectedY * 25;

      // Visibility: show when in front half of orbit
      const depth = Math.sin(M);
      const visible = depth > -0.3;

      setScreenPos({ x: screenX, y: screenY, visible });
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [config, index, speed, orbit]);

  if (!screenPos.visible) return null;

  return (
    <div
      className="absolute pointer-events-none transition-opacity duration-300"
      style={{
        left: `${screenPos.x}%`,
        top: `${screenPos.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: screenPos.visible ? 1 : 0,
      }}
    >
      <div className="font-[Orbitron] text-[0.7rem] font-medium tracking-[0.05em] text-[#9ca3af] bg-black/60 px-2 py-0.5 rounded border border-white/[0.05] whitespace-nowrap">
        {config.name}
      </div>
    </div>
  );
}

/* ─── Core Info Panel ─── */

function CoreInfoPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className={`absolute left-1/2 top-[15%] -translate-x-1/2 pointer-events-none transition-all duration-500 z-20 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-black/70 backdrop-blur-xl border border-slate-400/30 rounded-xl px-6 py-4 shadow-2xl shadow-slate-500/10 min-w-[320px] text-center">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
          <h3 className="font-[Orbitron] text-lg font-bold text-slate-200 tracking-wider">
            AlkaidSTART
          </h3>
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-3" />

        {/* Description */}
        <p className="text-[0.8rem] text-slate-300/80 leading-relaxed mb-3">
          Agent 项目生态系统的核心枢纽
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              4
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">AGENTS</div>
          </div>
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              99.9%
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">UPTIME</div>
          </div>
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              24/7
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">ONLINE</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 text-[0.65rem] text-slate-300/40 font-[Orbitron] tracking-widest">
          CORE SYSTEM // ACTIVE
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function SolarSystem({
  speed,
  onPlanetClick,
}: SolarSystemProps) {
  const [hoveredPlanetId, setHoveredPlanetId] = useState<number | null>(null);
  const [coreHovered, setCoreHovered] = useState(false);

  return (
    <div className="w-full relative z-[5]">
      {/* Three.js Canvas - fixed height container that allows scrolling past */}
      <div className="w-full" style={{ height: "120vh" }}>
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 100 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{
            background: "transparent",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
          }}
        >
          <Scene
            speed={speed}
            onPlanetClick={onPlanetClick}
            hoveredPlanetId={hoveredPlanetId}
            setHoveredPlanetId={setHoveredPlanetId}
            onCoreHover={setCoreHovered}
          />
        </Canvas>
      </div>

      {/* Spacer to allow scrolling */}
      <div className="w-full" style={{ height: "80vh" }} />

      {/* Core Info Panel */}
      <CoreInfoPanel visible={coreHovered} />

      {/* DOM Labels Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {PLANETS_CONFIG.map((planet, index) => (
          <PlanetLabel
            key={`label-${planet.id}`}
            config={planet}
            index={index}
            speed={speed}
            hoveredPlanetId={hoveredPlanetId}
          />
        ))}
      </div>
    </div>
  );
}
