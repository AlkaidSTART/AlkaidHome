import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTranslation } from "react-i18next";
import { ORBITS, getOrbitalPosition } from "../lib/orbital";
import type { PlanetConfig } from "./planets/config";

export default function PlanetLabel({
  config,
  index,
  speed,
}: {
  config: PlanetConfig;
  index: number;
  speed: number;
}) {
  const { t } = useTranslation();
  const orbit = ORBITS[index];
  const [screenPos, setScreenPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const meanMotion = (2 * Math.PI) / orbit.period;
    const M = time * meanMotion * speed;

    const pos = getOrbitalPosition(orbit, M);
    const finalX = pos.x;
    const finalY = pos.y;
    const finalZ = pos.z;

    const distance = 14;
    const tilt = Math.PI / 5;
    const projectedY = finalY / (distance - finalZ * Math.cos(tilt));
    const projectedX = finalX / (distance - finalZ * Math.cos(tilt));

    const screenX = 50 + projectedX * 25;
    const screenY = 50 - projectedY * 25;

    const depth = Math.sin(M);
    const visible = depth > -0.3;

    setScreenPos({ x: screenX, y: screenY, visible });
  });

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
