import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitParams } from "@planets/types";
import { generateOrbitGeometry } from "@lib/orbital";

export default function OrbitLine({
  orbit,
  color,
  hovered,
}: {
  orbit: OrbitParams;
  color: string;
  hovered: boolean;
}) {
  const geometry = useMemo(() => generateOrbitGeometry(orbit), [orbit]);
  const materialRef = useRef<THREE.LineBasicMaterial | null>(null);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const baseColor = useMemo(() => {
    const c = new THREE.Color(color);
    return new THREE.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4);
  }, [color]);

  useEffect(() => {
    if (materialRef.current) {
      const targetColor = hovered
        ? new THREE.Color(0x4f46e5)
        : baseColor;
      const targetOpacity = hovered ? 0.5 : 0.15;
      materialRef.current.color.copy(targetColor);
      materialRef.current.opacity = targetOpacity;
    }
  }, [hovered, baseColor]);

  const line = useMemo(() => {
    const c = new THREE.Color(color);
    const lineColor = new THREE.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4);
    const mat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.15,
    });
    materialRef.current = mat;
    return new THREE.Line(geometry, mat);
  }, [geometry, color]);

  useEffect(() => {
    return () => {
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  return <primitive object={line} />;
}
