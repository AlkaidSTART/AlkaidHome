import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { getOrbitalPosition } from "@lib/orbital";
import type { OrbitParams } from "@planets/types";

export interface OrbitalPosition {
  x: number;
  y: number;
  z: number;
  speed: number;
  M: number;
}

export function useOrbitalPosition(orbit: OrbitParams, speed: number): OrbitalPosition {
  const [pos, setPos] = useState<OrbitalPosition>({
    x: 0,
    y: 0,
    z: 0,
    speed: 0,
    M: 0,
  });

  useFrame((state) => {
    const meanMotion = (2 * Math.PI) / orbit.period;
    const M = state.clock.elapsedTime * meanMotion * speed;
    const position = getOrbitalPosition(orbit, M);
    setPos({
      x: position.x,
      y: position.y,
      z: position.z,
      speed: position.speed,
      M,
    });
  });

  return pos;
}