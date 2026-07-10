import React, { useEffect } from "react";
import { Orbit } from "lucide-react";
import { useTranslation } from "react-i18next";
import Starfield from "./components/Starfield";
import SolarSystem from "./components/SolarSystem";
import ConsolePanel from "./components/ConsolePanel";
 import ProjectDetails from "./components/project-details";
import { useAppStore } from "./store";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Application error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="font-[Orbitron] text-2xl text-red-400 mb-2">
              System Error
            </h1>
            <p className="text-slate-400 mb-4">
              An unexpected error has occurred.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-[JetBrains_Mono] text-sm text-white border border-white/20 px-4 py-2 rounded-md bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [time, setTime] = React.useState<string>("");

  const orbitSpeed = useAppStore((state) => state.orbitSpeed);
  const setOrbitSpeed = useAppStore((state) => state.setOrbitSpeed);
  const activePlanetId = useAppStore((state) => state.activePlanetId);
  const setActivePlanetId = useAppStore((state) => state.setActivePlanetId);
  const activePlanetName = useAppStore((state) => state.activePlanetName);
  const setActivePlanetName = useAppStore((state) => state.setActivePlanetName);

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
    <ErrorBoundary>
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
        <SolarSystem speed={orbitSpeed} />
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
    </ErrorBoundary>
  );
}
