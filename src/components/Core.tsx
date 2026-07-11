import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  coreVertexShader,
  coreFragmentShader,
  coreGlowFragmentShader,
  coreOuterGlowFragmentShader,
} from "@shaders/core";

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
      fragmentShader: coreFragmentShader,
    });
  }, []);

  const glowMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: coreVertexShader,
      fragmentShader: coreGlowFragmentShader,
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
      fragmentShader: coreOuterGlowFragmentShader,
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
