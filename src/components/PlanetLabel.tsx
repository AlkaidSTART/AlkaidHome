import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { PlanetConfig } from "@planets/config";
import { calculateOrbitalPosition } from "@hooks/useOrbitalPosition";

export default function PlanetLabel({
  config,
  speed,
}: {
  config: PlanetConfig;
  speed: number;
}) {
  const { t } = useTranslation();
  const orbit = config.orbit;
  const [screenPos, setScreenPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const updateScreenPos = () => {
      const elapsedTime = performance.now() / 1000;
      const pos = calculateOrbitalPosition(orbit, speed, elapsedTime);

      const distance = 20;
      const tilt = Math.PI / 5;
      const projectedY = pos.y / (distance - pos.z * Math.cos(tilt));
      const projectedX = pos.x / (distance - pos.z * Math.cos(tilt));

      const screenX = 50 + projectedX * 15;
      const screenY = 50 - projectedY * 15;

      const depth = Math.sin(pos.M);
      const visible = depth > -0.3;

      setScreenPos({ x: screenX, y: screenY, visible });
      animationRef.current = requestAnimationFrame(updateScreenPos);
    };

    animationRef.current = requestAnimationFrame(updateScreenPos);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [orbit, speed]);

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
