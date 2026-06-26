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

const PLANETS_CONFIG: PlanetConfig[] = [
  {
    id: 1,
    name: "VoiceCanvas",
    role: "Multimodal Stream",
    desc: "Real-time duplex conversational audio system.",
    color: "var(--c-planet-1)",
    hexColor: "#06b6d4",
    rx: 3.2,
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
    rx: 4.8,
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
    rx: 6.2,
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
    rx: 7.5,
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

function OrbitRing({
  rx,
  ry,
  hovered,
}: {
  rx: number;
  ry: number;
  hovered: boolean;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(Math.cos(angle) * rx, 0, Math.sin(angle) * ry),
      );
    }
    return pts;
  }, [rx, ry]);

  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points],
  );

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: hovered
              ? new THREE.Color(0x4f46e5)
              : new THREE.Color(0x1e1b4b),
            transparent: true,
            opacity: hovered ? 0.5 : 0.2,
          }),
        )
      }
    />
  );
}

function Planet({
  config,
  speed,
  hoveredPlanetId,
  setHoveredPlanetId,
  onPlanetClick,
}: {
  config: PlanetConfig;
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

  // Each planet has its own independent angle - hover only affects this planet
  const angleRef = useRef(config.startAngle);

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

    // Only slow down the hovered planet, others keep normal speed
    const isHovered = hoveredPlanetId === config.id;
    const speedModifier = isHovered ? 0.15 : 1.0;

    // Update independent angle - other planets are unaffected
    angleRef.current +=
      delta * 0.15 * speed * config.speedCoeff * speedModifier;

    const planetAngle = angleRef.current;

    const x = Math.cos(planetAngle) * config.rx;
    const z = Math.sin(planetAngle) * config.ry;
    const depth = Math.sin(planetAngle);

    const scale = 0.85 + (depth + 1) * 0.15;

    groupRef.current.position.set(x, 0, z);
    groupRef.current.scale.setScalar(scale * (isHovered ? 1.1 : 1.0));

    // Very slow planet rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }

    // Slow atmosphere pulse
    if (glowRef.current) {
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      glowRef.current.scale.setScalar(pulse);
    }

    // Slow ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.15;
    }

    // Slow satellites
    if (satellitesRef.current) {
      satellitesRef.current.rotation.y = state.clock.elapsedTime * 0.25;
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

      {/* Planet-specific effects - slower and subtler */}
      {config.id === 1 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.size * 1.4, config.size * 1.55, 64]} />
          <meshBasicMaterial
            color={config.hexColor}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {config.id === 2 && (
        <group ref={ringRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[config.size * 1.8, config.size * 1.9, 64]} />
            <meshBasicMaterial
              color={config.hexColor}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {config.id === 3 && (
        <group ref={satellitesRef}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 3) * config.size * 1.8,
                0,
                Math.sin((i * Math.PI * 2) / 3) * config.size * 1.8,
              ]}
            >
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial
                color={config.hexColor}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      )}

      {config.id === 4 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.size * 1.6, config.size * 1.75, 64]} />
          <meshBasicMaterial
            color={config.hexColor}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
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
    // Front-facing view - much more comfortable
    camera.position.set(0, 4, 14);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group rotation={[-Math.PI / 12, 0, 0]}>
      {/* Core - AlkaidSTART */}
      <Core onHover={onCoreHover} />

      {/* Orbits */}
      {PLANETS_CONFIG.map((planet) => (
        <OrbitRing
          key={`orbit-${planet.id}`}
          rx={planet.rx}
          ry={planet.ry}
          hovered={hoveredPlanetId === planet.id}
        />
      ))}

      {/* Planets - each has independent angle */}
      {PLANETS_CONFIG.map((planet) => (
        <Planet
          key={planet.id}
          config={planet}
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
  speed,
  hoveredPlanetId,
}: {
  config: PlanetConfig;
  speed: number;
  hoveredPlanetId: number | null;
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

  // Independent angle for label tracking - matches Planet's independent angle
  const angleRef = useRef(config.startAngle);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let frameId: number;

    const update = (time: number) => {
      const delta = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 0.016;
      lastTimeRef.current = time;

      // Only slow down the hovered planet, others keep normal speed
      const isHovered = hoveredPlanetId === config.id;
      const speedModifier = isHovered ? 0.15 : 1.0;

      // Update independent angle - same logic as Planet component
      angleRef.current +=
        delta * 0.15 * speed * config.speedCoeff * speedModifier;

      const planetAngle = angleRef.current;

      const x = Math.cos(planetAngle) * config.rx;
      const z = Math.sin(planetAngle) * config.ry;
      const depth = Math.sin(planetAngle);

      // Front-facing projection
      const distance = 14;
      const tilt = -Math.PI / 12;
      const projectedY = (x * Math.sin(tilt)) / (distance - z * Math.cos(tilt));
      const projectedX = (x * Math.cos(tilt)) / (distance - z * Math.cos(tilt));

      const screenX = 50 + projectedX * 25;
      const screenY = 50 - projectedY * 25;
      const visible = depth > -0.5;

      setScreenPos({ x: screenX, y: screenY, visible });
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [config, speed, hoveredPlanetId]);

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
    <div className="flex-grow w-full h-full relative z-[5]">
      {/* Three.js Canvas */}
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
        className="absolute inset-0"
      >
        <Scene
          speed={speed}
          onPlanetClick={onPlanetClick}
          hoveredPlanetId={hoveredPlanetId}
          setHoveredPlanetId={setHoveredPlanetId}
          onCoreHover={setCoreHovered}
        />
      </Canvas>

      {/* Core Info Panel */}
      <CoreInfoPanel visible={coreHovered} />

      {/* DOM Labels Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {PLANETS_CONFIG.map((planet) => (
          <PlanetLabel
            key={`label-${planet.id}`}
            config={planet}
            speed={speed}
            hoveredPlanetId={hoveredPlanetId}
          />
        ))}
      </div>
    </div>
  );
}
