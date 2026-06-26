import { useState, useEffect } from "react";
import { Orbit } from "lucide-react";
import Starfield from "./components/Starfield";
import SolarSystem from "./components/SolarSystem";
import ConsolePanel from "./components/ConsolePanel";
import ProjectDetails from "./components/ProjectDetails";

export default function App() {
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0);
  const [activePlanetId, setActivePlanetId] = useState<number | null>(null);
  const [activePlanetName, setActivePlanetName] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString() + " " + now.toTimeString().split(" ")[0],
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activePlanetId === 1) setActivePlanetName("VoiceCanvas");
    else if (activePlanetId === 2) setActivePlanetName("Autonomous Task Agent");
    else if (activePlanetId === 3) setActivePlanetName("Multi-Agent System");
    else if (activePlanetId === 4)
      setActivePlanetName("Agentic RAG & Memory Hub");
    else setActivePlanetName(null);
  }, [activePlanetId]);

  return (
    <>
      <Starfield />

      <div className="hud-grid"></div>
      <div className="hud-scanline"></div>

      <header className="absolute top-0 left-0 w-full z-20 pointer-events-auto flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3 font-[Orbitron] text-xl font-bold tracking-[0.15em] text-white [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          <Orbit
            size={20}
            className="animate-[spin_8s_linear_infinite]"
            style={{ color: "var(--c-planet-1)" }}
          />
          <span>COSMIC AGENTIC CANVAS</span>
          <div className="w-2 h-2 bg-[#06b6d4] rounded-full shadow-[0_0_8px_#06b6d4] animate-[blink_2s_infinite_ease-in-out]"></div>
        </div>
        <div className="font-[JetBrains_Mono] text-sm text-[#9ca3af] border border-white/10 px-3 py-1.5 rounded-md bg-white/[0.02] backdrop-blur">
          SYS_TIME: {time}
        </div>
      </header>

      <main className="flex-grow flex w-full">
        <SolarSystem
          speed={orbitSpeed}
          onPlanetClick={(id) => setActivePlanetId(id)}
        />
      </main>

      <ProjectDetails
        planetId={activePlanetId}
        onClose={() => setActivePlanetId(null)}
      />

      <ConsolePanel
        speed={orbitSpeed}
        setSpeed={setOrbitSpeed}
        activePlanetName={activePlanetName}
      />
    </>
  );
}
