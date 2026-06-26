import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Clock, Sliders } from "lucide-react";

interface ConsolePanelProps {
  speed: number;
  setSpeed: (speed: number) => void;
  activePlanetName: string | null;
}

const SIMULATED_LOGS = [
  "SYSTEM: Core Orchestrator running on cluster us-west-2. Orbiting normal.",
  "VOICE_CANVAS: Calibrating silence threshold (VAD) // Noise floor -52dB.",
  "AUTONOMOUS_AGENT: Search tool returned 12 hits. Synthesizing solution...",
  "MULTI_AGENT: Critic agent rejected Draft v1.2, requesting Writer revision.",
  "RAG_MEMORY: Executing cosine similarity on 1.2M nodes. Retrieval time 14ms.",
  "SYSTEM: Health check complete. Memory consumption: 14%, CPU: 8.5%.",
  "VOICE_CANVAS: Streaming Opus packets (48kHz stereo, 120ms latency).",
  "AUTONOMOUS_AGENT: Code executor spinup complete. Sandbox initialized.",
  "MULTI_AGENT: Consensus reached. Aggregating output draft for User.",
  "RAG_MEMORY: Re-indexing long-term semantic storage. Vector embeddings updated.",
];

export default function ConsolePanel({
  speed,
  setSpeed,
  activePlanetName,
}: ConsolePanelProps) {
  const [logMessage, setLogMessage] = useState(SIMULATED_LOGS[0]);
  const [timeString, setTimeString] = useState("");
  const logIndexRef = useRef(0);

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
    if (activePlanetName) {
      setLogMessage(
        `INTERACTION: Connected to ${activePlanetName}. Telemetry streaming...`,
      );
      return;
    }

    const interval = setInterval(() => {
      logIndexRef.current = (logIndexRef.current + 1) % SIMULATED_LOGS.length;
      setLogMessage(SIMULATED_LOGS[logIndexRef.current]);
    }, 4500);

    return () => clearInterval(interval);
  }, [activePlanetName]);

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
              Speed
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
              GPU: <strong className="text-white">14%</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[0.65rem]">
            <Clock size={12} className="text-[#3b82f6]" />
            <span>
              PING: <strong className="text-white">12ms</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
