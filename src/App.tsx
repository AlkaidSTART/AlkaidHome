import { useState, useEffect } from "react";
import { Orbit } from "lucide-react";
import { useTranslation } from "react-i18next";
import Starfield from "./components/Starfield";
import SolarSystem from "./components/SolarSystem";
import ConsolePanel from "./components/ConsolePanel";
import ProjectDetails from "./components/ProjectDetails";

export default function App() {
  const { t, i18n } = useTranslation();
  const [orbitSpeed, setOrbitSpeed] = useState<number>(0.2);
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
    if (activePlanetId === 1)
      setActivePlanetName(t("planets.voiceCanvas.name"));
    else if (activePlanetId === 2)
      setActivePlanetName(t("planets.autonomousAgent.name"));
    else if (activePlanetId === 3)
      setActivePlanetName(t("planets.multiAgent.name"));
    else if (activePlanetId === 4)
      setActivePlanetName(t("planets.agenticRag.name"));
    else setActivePlanetName(null);
  }, [activePlanetId, t]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

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
          <span>{t("header.title")}</span>
          <div className="w-2 h-2 bg-[#06b6d4] rounded-full shadow-[0_0_8px_#06b6d4] animate-[blink_2s_infinite_ease-in-out]"></div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="font-[JetBrains_Mono] text-sm text-[#9ca3af] border border-white/10 px-3 py-1.5 rounded-md bg-white/[0.02] backdrop-blur hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
          >
            {t("language.switch")}
          </button>
          <div className="font-[JetBrains_Mono] text-sm text-[#9ca3af] border border-white/10 px-3 py-1.5 rounded-md bg-white/[0.02] backdrop-blur">
            {t("header.sysTime")}: {time}
          </div>
        </div>
      </header>

      <main className="w-full">
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
