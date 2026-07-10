import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import OrbitLine from "./OrbitLine";
import Core from "./Core";
import Planet from "./Planet";
import PlanetLabel from "./PlanetLabel";
import CoreInfoPanel from "./CoreInfoPanel";
import { PLANETS_CONFIG } from "./planets/config";
import { ORBITS } from "../lib/orbital";
import { useAppStore } from "../store";

interface SolarSystemProps {
  speed: number;
}

function Scene({ speed }: { speed: number }) {
  const { camera } = useThree();
  const hoveredPlanetId = useAppStore((state) => state.hoveredPlanetId);
  const setCoreHovered = useAppStore((state) => state.setCoreHovered);

  useEffect(() => {
    camera.position.set(0, 1.2, 12);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group rotation={[Math.PI / 5, 0, 0]}>
      <Core onHover={setCoreHovered} />

      {PLANETS_CONFIG.map((planet, index) => (
        <OrbitLine
          key={`orbit-${planet.id}`}
          orbit={ORBITS[index]}
          color={planet.hexColor}
          hovered={hoveredPlanetId === planet.id}
        />
      ))}

      {PLANETS_CONFIG.map((planet, index) => (
        <Planet
          key={planet.id}
          config={planet}
          index={index}
          speed={speed}
        />
      ))}
    </group>
  );
}

export default function SolarSystem({ speed }: SolarSystemProps) {
  const coreHovered = useAppStore((state) => state.coreHovered);

  return (
    <div className="w-full relative z-[5]">
      <div className="w-full" style={{ height: "120vh" }}>
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 100 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{
            background: "transparent",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
          }}
        >
          <Scene speed={speed} />
        </Canvas>
      </div>

      <div className="w-full" style={{ height: "80vh" }} />

      <CoreInfoPanel visible={coreHovered} />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {PLANETS_CONFIG.map((planet, index) => (
          <PlanetLabel
            key={`label-${planet.id}`}
            config={planet}
            index={index}
            speed={speed}
          />
        ))}
      </div>
    </div>
  );
}
