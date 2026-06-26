import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTranslation } from "react-i18next";
import VoiceCanvasPlanet from "./planets/VoiceCanvasPlanet";
import AutonomousAgentPlanet from "./planets/AutonomousAgentPlanet";
import MultiAgentPlanet from "./planets/MultiAgentPlanet";
import AgenticRagPlanet from "./planets/AgenticRagPlanet";

interface SolarSystemProps {
  speed: number;
  onPlanetClick: (id: number) => void;
}

interface PlanetConfig {
  id: number;
  nameKey: string;
  roleKey: string;
  descKey: string;
  color: string;
  hexColor: string;
  rx: number;
  ry: number;
  speedCoeff: number;
  startAngle: number;
  size: number;
  stats: { labelKey: string; value: string }[];
}

// ─── Real Orbital Mechanics ───
const PLANET_MASS = [0.8, 1.2, 2.5, 1.8];

interface OrbitParams {
  a: number;
  e: number;
  i: number;
  omega: number;
  M0: number;
  period: number;
}

const ORBITS: OrbitParams[] = [
  { a: 1.5, e: 0.12, i: 0.05, omega: 0.5, M0: 0, period: 6 },
  { a: 2.3, e: 0.1, i: -0.04, omega: 2.0, M0: Math.PI / 3, period: 12 },
  { a: 3.1, e: 0.08, i: 0.03, omega: 3.8, M0: Math.PI * 0.7, period: 20 },
  { a: 3.9, e: 0.1, i: -0.02, omega: 5.2, M0: Math.PI * 1.3, period: 32 },
];

function solveKepler(M: number, e: number, maxIter = 10): number {
  let E = M;
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

function getOrbitalPosition(
  orbit: OrbitParams,
  M: number,
): { x: number; y: number; z: number; speed: number } {
  const E = solveKepler(M, orbit.e);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrt1me2 = Math.sqrt(1 - orbit.e * orbit.e);

  const xOrbital = orbit.a * (cosE - orbit.e);
  const zOrbital = orbit.a * sqrt1me2 * sinE;
  const speed = Math.sqrt((1 + orbit.e * Math.cos(E)) / (1 - orbit.e * cosE));

  const cosO = Math.cos(orbit.omega);
  const sinO = Math.sin(orbit.omega);
  const xRot = xOrbital * cosO - zOrbital * sinO;
  const zRot = xOrbital * sinO + zOrbital * cosO;

  const cosI = Math.cos(orbit.i);
  const sinI = Math.sin(orbit.i);
  const y = xRot * sinI;
  const x = xRot * cosI;
  const z = zRot;

  return { x, y, z, speed };
}

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
    nameKey: "planets.voiceCanvas.name",
    roleKey: "planets.voiceCanvas.role",
    descKey: "planets.voiceCanvas.desc",
    color: "var(--c-planet-1)",
    hexColor: "#06b6d4",
    rx: 1.5,
    ry: 1.0,
    speedCoeff: 1.0,
    startAngle: 0,
    size: 0.35,
    stats: [
      { labelKey: "planets.voiceCanvas.stats.latency", value: "120ms" },
      { labelKey: "planets.voiceCanvas.stats.codec", value: "Opus 48kbps" },
      { labelKey: "planets.voiceCanvas.stats.mosScore", value: "4.65" },
    ],
  },
  {
    id: 2,
    nameKey: "planets.autonomousAgent.name",
    roleKey: "planets.autonomousAgent.role",
    descKey: "planets.autonomousAgent.desc",
    color: "var(--c-planet-2)",
    hexColor: "#10b981",
    rx: 2.3,
    ry: 1.5,
    speedCoeff: 0.7,
    startAngle: Math.PI / 2,
    size: 0.4,
    stats: [
      { labelKey: "planets.autonomousAgent.stats.successRate", value: "94.2%" },
      {
        labelKey: "planets.autonomousAgent.stats.stepsPerTask",
        value: "12 steps",
      },
      { labelKey: "planets.autonomousAgent.stats.runs", value: "48k / day" },
    ],
  },
  {
    id: 3,
    nameKey: "planets.multiAgent.name",
    roleKey: "planets.multiAgent.role",
    descKey: "planets.multiAgent.desc",
    color: "var(--c-planet-3)",
    hexColor: "#ec4899",
    rx: 3.1,
    ry: 2.0,
    speedCoeff: 0.45,
    startAngle: Math.PI,
    size: 0.45,
    stats: [
      { labelKey: "planets.multiAgent.stats.agentNodes", value: "3 Active" },
      { labelKey: "planets.multiAgent.stats.consensus", value: "98.5%" },
      { labelKey: "planets.multiAgent.stats.iterations", value: "4.2 cycles" },
    ],
  },
  {
    id: 4,
    nameKey: "planets.agenticRag.name",
    roleKey: "planets.agenticRag.role",
    descKey: "planets.agenticRag.desc",
    color: "var(--c-planet-4)",
    hexColor: "#3b82f6",
    rx: 3.9,
    ry: 2.4,
    speedCoeff: 0.3,
    startAngle: (3 * Math.PI) / 2,
    size: 0.5,
    stats: [
      { labelKey: "planets.agenticRag.stats.vectors", value: "1.2M docs" },
      { labelKey: "planets.agenticRag.stats.searchLatency", value: "14ms" },
      { labelKey: "planets.agenticRag.stats.cacheHit", value: "88%" },
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

      vec3 lightDir = normalize(vec3(1.0, 0.8, 0.3));
      float diff = max(dot(vNormal, lightDir), 0.0);

      vec3 atmosphere = glow * fresnel * 0.4;

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

const orbitalState = {
  meanAnomalies: ORBITS.map((o) => o.M0),
  perturbations: ORBITS.map(() => ({ x: 0, y: 0, z: 0 })),
  velocities: ORBITS.map(() => ({ x: 0, y: 0, z: 0 })),
};

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
      return (
        <VoiceCanvasPlanet config={config} satellitesRef={satellitesRef} />
      );
    case 2:
      return (
        <AutonomousAgentPlanet config={config} satellitesRef={satellitesRef} />
      );
    case 3:
      return <MultiAgentPlanet config={config} satellitesRef={satellitesRef} />;
    case 4:
      return <AgenticRagPlanet config={config} satellitesRef={satellitesRef} />;
    default:
      return null;
  }
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

    const meanMotion = (2 * Math.PI) / orbit.period;
    orbitalState.meanAnomalies[index] += delta * meanMotion * speed;

    const M = orbitalState.meanAnomalies[index];
    const pos = getOrbitalPosition(orbit, M);

    const allPositions = ORBITS.map((o, i) => {
      const m = orbitalState.meanAnomalies[i];
      const p = getOrbitalPosition(o, m);
      return {
        x: p.x + orbitalState.perturbations[i].x,
        y: p.y + orbitalState.perturbations[i].y,
        z: p.z + orbitalState.perturbations[i].z,
      };
    });

    const pert = computePerturbation(allPositions, index);

    orbitalState.velocities[index].x += pert.ax * delta;
    orbitalState.velocities[index].y += pert.ay * delta;
    orbitalState.velocities[index].z += pert.az * delta;

    const damping = 0.98;
    orbitalState.velocities[index].x *= damping;
    orbitalState.velocities[index].y *= damping;
    orbitalState.velocities[index].z *= damping;

    orbitalState.perturbations[index].x +=
      orbitalState.velocities[index].x * delta;
    orbitalState.perturbations[index].y +=
      orbitalState.velocities[index].y * delta;
    orbitalState.perturbations[index].z +=
      orbitalState.velocities[index].z * delta;

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

    const finalX = pos.x + orbitalState.perturbations[index].x;
    const finalY = pos.y + orbitalState.perturbations[index].y;
    const finalZ = pos.z + orbitalState.perturbations[index].z;

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

    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.08;
    }

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

      {/* Planet-specific visual features */}
      <PlanetVisual
        id={config.id}
        size={config.size}
        hexColor={config.hexColor}
        satellitesRef={satellitesRef}
      />
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

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: coreVertexShader,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;

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

          float noise1 = snoise(vNormal * 4.0);
          float noise2 = snoise(vNormal * 8.0) * 0.5;
          float noise3 = snoise(vNormal * 16.0) * 0.25;
          float surfaceNoise = (noise1 + noise2 + noise3) / 1.75;

          vec3 brightSide = vec3(0.95, 0.95, 0.97);
          vec3 darkSide = vec3(0.75, 0.75, 0.78);
          vec3 craterColor = vec3(0.65, 0.65, 0.68);

          float craterMask = smoothstep(0.1, 0.4, surfaceNoise);
          vec3 surfaceColor = mix(craterColor, brightSide, craterMask);
          surfaceColor = mix(darkSide, surfaceColor, 0.7);

          vec3 lightDir = normalize(vec3(1.0, 0.8, 0.3));
          float diff = max(dot(vNormal, lightDir), 0.0);
          float lit = smoothstep(-0.1, 0.4, diff);

          surfaceColor = mix(surfaceColor * 0.3, surfaceColor, lit);

          vec3 glow = vec3(0.85, 0.88, 0.95) * fresnel * 0.15;

          gl_FragColor = vec4(surfaceColor + glow, 1.0);
        }
      `,
    });
  }, []);

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
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.03;
      ringRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
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
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[0.85, 64, 64]} />
      </mesh>
      <mesh ref={glowRef} material={glowMat}>
        <sphereGeometry args={[1.05, 32, 32]} />
      </mesh>
      <mesh ref={outerGlowRef} material={outerGlowMat}>
        <sphereGeometry args={[1.35, 32, 32]} />
      </mesh>
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
    camera.position.set(0, 1.2, 12);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group rotation={[Math.PI / 5, 0, 0]}>
      <Core onHover={onCoreHover} />

      {PLANETS_CONFIG.map((planet, index) => (
        <OrbitLine
          key={`orbit-${planet.id}`}
          orbit={ORBITS[index]}
          color={planet.hexColor}
          hovered={hoveredPlanetId === planet.id}
        />
      ))}

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
  const { t } = useTranslation();
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

      const meanMotion = (2 * Math.PI) / orbit.period;
      orbitalState.meanAnomalies[index] += delta * meanMotion * speed;

      const M = orbitalState.meanAnomalies[index];
      const pos = getOrbitalPosition(orbit, M);

      const finalX = pos.x + orbitalState.perturbations[index].x;
      const finalY = pos.y + orbitalState.perturbations[index].y;
      const finalZ = pos.z + orbitalState.perturbations[index].z;

      const distance = 14;
      const tilt = Math.PI / 5;
      const projectedY = finalY / (distance - finalZ * Math.cos(tilt));
      const projectedX = finalX / (distance - finalZ * Math.cos(tilt));

      const screenX = 50 + projectedX * 25;
      const screenY = 50 - projectedY * 25;

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
        {t(config.nameKey)}
      </div>
    </div>
  );
}

/* ─── Core Info Panel ─── */

function CoreInfoPanel({ visible }: { visible: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={`absolute left-1/2 top-[15%] -translate-x-1/2 pointer-events-none transition-all duration-500 z-20 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-black/70 backdrop-blur-xl border border-slate-400/30 rounded-xl px-6 py-4 shadow-2xl shadow-slate-500/10 min-w-[320px] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
          <h3 className="font-[Orbitron] text-lg font-bold text-slate-200 tracking-wider">
            {t("core.name")}
          </h3>
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-3" />

        <p className="text-[0.8rem] text-slate-300/80 leading-relaxed mb-3">
          {t("core.description")}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              4
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">
              {t("core.stats.agents")}
            </div>
          </div>
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              99.9%
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">
              {t("core.stats.uptime")}
            </div>
          </div>
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              24/7
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">
              {t("core.stats.online")}
            </div>
          </div>
        </div>

        <div className="mt-3 text-[0.65rem] text-slate-300/40 font-[Orbitron] tracking-widest">
          {t("core.status")}
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

      <div className="w-full" style={{ height: "80vh" }} />

      <CoreInfoPanel visible={coreHovered} />

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
