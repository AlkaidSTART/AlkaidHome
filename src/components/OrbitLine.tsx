import { useMemo, useEffect } from "react";
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

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

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

  useEffect(() => {
    return () => {
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  return <primitive object={line} />;
}
