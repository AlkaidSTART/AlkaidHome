import { useState, useEffect, useRef } from "react";
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

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const meanMotion = (2 * Math.PI) / orbit.period;

    const animate = () => {
      const elapsedTime = performance.now() / 1000;
      const M = elapsedTime * meanMotion * speed;
      const position = getOrbitalPosition(orbit, M);
      setPos({
        x: position.x,
        y: position.y,
        z: position.z,
        speed: position.speed,
        M,
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [orbit, speed]);

  return pos;
}