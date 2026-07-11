import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STAR_COUNT = 3000;
const NEBULA_COLORS = [
  new THREE.Color(0x581c87),
  new THREE.Color(0x06b6d4),
];

function Stars() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes, twinkleSpeed] = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const sz = new Float32Array(STAR_COUNT);
    const ts = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 400 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const colorChoice = Math.random();
      let c: THREE.Color;
      if (colorChoice < 0.7) {
        c = new THREE.Color().setHSL(
          0.6 + Math.random() * 0.1,
          0.2,
          0.8 + Math.random() * 0.2,
        );
      } else if (colorChoice < 0.9) {
        c = new THREE.Color().setHSL(
          0.55,
          0.3 + Math.random() * 0.3,
          0.7 + Math.random() * 0.2,
        );
      } else {
        c = new THREE.Color().setHSL(0.05, 0.3, 0.8);
      }
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = Math.random() * 1.5 + 0.3;
      ts[i] = Math.random() * 0.015 + 0.003;
    }

    return [pos, col, sz, ts];
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float twinkleSpeed;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * twinkleSpeed * 80.0) * 0.2 + 0.8;
          vAlpha = twinkle;
          gl_PointSize = size * uPixelRatio * (250.0 / -mvPosition.z) * twinkle;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.15, dist) * vAlpha;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useEffect(() => {
    return () => {
      shaderMaterial.dispose();
    };
  }, [shaderMaterial]);

  useFrame((state) => {
    if (pointsRef.current) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.0005;
    }
  });

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute
          attach="attributes-twinkleSpeed"
          args={[twinkleSpeed, 1]}
        />
      </bufferGeometry>
    </points>
  );
}

function ShootingStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const data = useRef({
    active: false,
    pos: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    delay: Math.random() * 8 + 5,
  });

  const spawn = () => {
    const d = data.current;
    d.active = true;
    d.life = 1.0;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 400;
    d.pos.set(Math.cos(angle) * 600, height, Math.sin(angle) * 600);
    d.velocity.set(
      -Math.cos(angle) * (60 + Math.random() * 30),
      -15 - Math.random() * 20,
      -Math.sin(angle) * (60 + Math.random() * 30),
    );
  };

  useFrame((_, delta) => {
    const d = data.current;

    if (!d.active) {
      d.delay -= delta;
      if (d.delay <= 0) {
        spawn();
        d.delay = Math.random() * 12 + 8;
      }
      if (meshRef.current) meshRef.current.visible = false;
      if (trailRef.current) trailRef.current.visible = false;
      return;
    }

    d.life -= delta * 0.6;
    if (d.life <= 0 || d.pos.y < -400) {
      d.active = false;
      return;
    }

    d.pos.addScaledVector(d.velocity, delta);

    if (meshRef.current) {
      meshRef.current.visible = true;
      meshRef.current.position.copy(d.pos);
      meshRef.current.lookAt(d.pos.clone().add(d.velocity));
    }

    if (trailRef.current) {
      trailRef.current.visible = true;
      trailRef.current.position.copy(d.pos);
      trailRef.current.lookAt(d.pos.clone().add(d.velocity));
      (trailRef.current.material as THREE.MeshBasicMaterial).opacity =
        d.life * 0.6;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={trailRef} visible={false}>
        <coneGeometry args={[0.2, 25, 8]} />
        <meshBasicMaterial
          color="#a5f3fc"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Nebula() {
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor1: { value: NEBULA_COLORS[0] },
        uColor2: { value: NEBULA_COLORS[1] },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;

        void main() {
          float dist1 = distance(vUv, vec2(0.8, 0.2));
          float dist2 = distance(vUv, vec2(0.2, 0.8));
          float glow1 = exp(-dist1 * dist1 * 3.0) * 0.06;
          float glow2 = exp(-dist2 * dist2 * 2.0) * 0.04;
          vec3 color = uColor1 * glow1 + uColor2 * glow2;
          gl_FragColor = vec4(color, glow1 + glow2);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
  }, []);

  useEffect(() => {
    return () => {
      shaderMaterial.dispose();
    };
  }, [shaderMaterial]);

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <sphereGeometry args={[900, 32, 32]} />
    </mesh>
  );
}

export default function StarfieldScene() {
  return (
    <group>
      <Nebula />
      <Stars />
      <ShootingStar />
    </group>
  );
}
