import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { coreVertexShader } from "../shaders/core";

export default function Core({ onHover }: { onHover: (hovered: boolean) => void }) {
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

  useEffect(() => {
    return () => {
      material.dispose();
      glowMat.dispose();
      outerGlowMat.dispose();
      particleGeometry.dispose();
    };
  }, [material, glowMat, outerGlowMat, particleGeometry]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
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
