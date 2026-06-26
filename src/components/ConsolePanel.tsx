import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Clock, Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConsolePanelProps {
  speed: number;
  setSpeed: (speed: number) => void;
  activePlanetName: string | null;
}

const LOG_KEYS = [
  "console.logs.sysOrchestrator",
  "console.logs.voiceCanvasCalibrate",
  "console.logs.autonomousAgentSearch",
  "console.logs.multiAgentCritic",
  "console.logs.ragMemoryExec",
  "console.logs.sysHealthCheck",
  "console.logs.voiceCanvasStreaming",
  "console.logs.autonomousAgentCode",
  "console.logs.multiAgentConsensus",
  "console.logs.ragMemoryReindex",
];

export default function ConsolePanel({
  speed,
  setSpeed,
  activePlanetName,
}: ConsolePanelProps) {
  const { t } = useTranslation();
  const [logMessage, setLogMessage] = useState("");
  const [timeString, setTimeString] = useState("");
  const logIndexRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toTimeString().split(" ")[0] +
          "." +
          String(now.getMilliseconds()).padStart(3, "0"),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      setLogMessage(t(LOG_KEYS[0]));
      initializedRef.current = true;
    }
  }, [t]);

  useEffect(() => {
    if (activePlanetName) {
      setLogMessage(t("console.logs.interaction", { name: activePlanetName }));
      return;
    }

    const interval = setInterval(() => {
      logIndexRef.current = (logIndexRef.current + 1) % LOG_KEYS.length;
      setLogMessage(t(LOG_KEYS[logIndexRef.current]));
    }, 4500);

    return () => clearInterval(interval);
  }, [activePlanetName, t]);

  return (
    <div className="absolute bottom-0 left-0 w-full z-20 px-6 pb-4 pointer-events-none">
      <div className="w-full flex justify-between items-center px-5 py-3 font-[JetBrains_Mono] text-xs text-[#9ca3af] pointer-events-auto glass-panel">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap flex-grow">
          <Terminal size={14} className="text-[#06b6d4]" />
          <span className="text-[#9ca3af] font-[JetBrains_Mono]">
            [{timeString}]
          </span>
          <span className="text-[#f3f4f6]" key={logMessage}>
            {logMessage}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 ml-8">
          <div className="flex items-center gap-2">
            <Sliders size={12} className="text-[#9ca3af]" />
            <label
              htmlFor="orbit-speed"
              className="text-[0.65rem] uppercase tracking-[0.05em] text-[#9ca3af]"
            >
              {t("console.speed")}
            </label>
            <input
              id="orbit-speed"
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-[80px] h-[3px] rounded-sm bg-white/[0.1] outline-none cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[10px] [&::-webkit-slider-thumb]:h-[10px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#06b6d4] [&::-webkit-slider-thumb]:shadow-[0_0_6px_#06b6d4] [&::-webkit-slider-thumb]:cursor-pointer"
              title="Adjust planet orbital velocity"
            />
            <span className="font-[JetBrains_Mono] text-[0.65rem] w-[25px] text-right">
              {speed.toFixed(1)}x
            </span>
          </div>

          <div className="h-[14px] w-px bg-white/[0.1]"></div>

          <div className="flex items-center gap-1.5 text-[0.65rem]">
            <Cpu size={12} className="text-[#10b981]" />
            <span>
              {t("console.gpu")}: <strong className="text-white">14%</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[0.65rem]">
            <Clock size={12} className="text-[#3b82f6]" />
            <span>
              {t("console.ping")}: <strong className="text-white">12ms</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
