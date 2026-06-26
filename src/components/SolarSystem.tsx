import React, { useEffect, useRef, useState } from "react";
import { Search, Code2, Mail, Terminal } from "lucide-react";

interface SolarSystemProps {
  speed: number;
  onPlanetClick: (id: number) => void;
}

interface PlanetConfig {
  id: number;
  name: string;
  role: string;
  desc: string;
  color: string;
  rx: number;
  ry: number;
  speedCoeff: number;
  startAngle: number;
  stats: { label: string; value: string }[];
}

const PLANETS_CONFIG: PlanetConfig[] = [
  {
    id: 1,
    name: "VoiceCanvas",
    role: "Multimodal Stream",
    desc: "Real-time duplex conversational audio system.",
    color: "var(--c-planet-1)",
    rx: 200,
    ry: 80,
    speedCoeff: 1.0,
    startAngle: 0,
    stats: [
      { label: "LATENCY", value: "120ms" },
      { label: "CODEC", value: "Opus 48kbps" },
      { label: "MOS SCORE", value: "4.65" },
    ],
  },
  {
    id: 2,
    name: "Autonomous Agent",
    role: "Tool Use Specialist",
    desc: "Autonomous loops executing sandboxed commands.",
    color: "var(--c-planet-2)",
    rx: 290,
    ry: 116,
    speedCoeff: 0.7,
    startAngle: Math.PI / 2,
    stats: [
      { label: "SUCCESS RATE", value: "94.2%" },
      { label: "STEPS / TASK", value: "12 steps" },
      { label: "RUNS", value: "48k / day" },
    ],
  },
  {
    id: 3,
    name: "Multi-Agent System",
    role: "Collaborative Ecosystem",
    desc: "Distributed queue broker orchestrating team consensus.",
    color: "var(--c-planet-3)",
    rx: 380,
    ry: 152,
    speedCoeff: 0.45,
    startAngle: Math.PI,
    stats: [
      { label: "AGENT NODES", value: "3 Active" },
      { label: "CONSENSUS", value: "98.5%" },
      { label: "ITERATIONS", value: "4.2 cycles" },
    ],
  },
  {
    id: 4,
    name: "Agentic RAG & Memory",
    role: "Knowledge Hub",
    desc: "Cosine vector retrieval & episodic graph memories.",
    color: "var(--c-planet-4)",
    rx: 460,
    ry: 184,
    speedCoeff: 0.3,
    startAngle: (3 * Math.PI) / 2,
    stats: [
      { label: "VECTORS", value: "1.2M docs" },
      { label: "SEARCH LATENCY", value: "14ms" },
      { label: "CACHE HIT", value: "88%" },
    ],
  },
];

export default function SolarSystem({
  speed,
  onPlanetClick,
}: SolarSystemProps) {
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<number | null>(null);
  const angleRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      const speedModifier = hoveredPlanetId !== null ? 0.15 : 1.0;
      angleRef.current += 0.006 * speed * speedModifier;

      PLANETS_CONFIG.forEach((planet, index) => {
        const el = planetRefs.current[index];
        if (!el) return;

        const planetAngle =
          angleRef.current * planet.speedCoeff + planet.startAngle;
        const x = planet.rx * Math.cos(planetAngle);
        const y = planet.ry * Math.sin(planetAngle);
        const depth = Math.sin(planetAngle);

        const scale = 0.85 + (depth + 1) * 0.15;
        const opacity = 0.6 + (depth + 1) * 0.2;
        const zIndex = Math.round(20 + depth * 10);
        const blurAmount = depth < 0 ? Math.abs(depth) * 1.5 : 0;

        el.style.transform = `translate3d(${x}px, ${y}px, 0px) translate(-50%, -50%) rotateX(-60deg)`;
        el.style.zIndex = `${zIndex}`;
        el.style.opacity = `${opacity}`;
        el.style.filter = `blur(${blurAmount}px)`;
        el.style.scale = `${scale}`;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [speed, hoveredPlanetId]);

  return (
    <div className="flex-grow w-full h-full flex justify-center items-center relative z-[5]">
      <div
        className="relative w-[1000px] h-[700px] flex justify-center items-center"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute w-full h-full flex justify-center items-center"
          style={{ transform: "rotateX(60deg)", transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute w-[100px] h-[100px] rounded-full flex justify-center items-center cursor-pointer z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] animate-[core-pulse_4s_infinite_ease-in-out]"
            style={{
              background:
                "radial-gradient(circle, #ffffff 0%, #1e1b4b 60%, #000000 100%)",
              boxShadow:
                "0 0 40px 10px var(--c-core-glow), inset 0 0 20px rgba(255, 255, 255, 0.4)",
              transform: "translate3d(0, 0, 10px) rotateX(-60deg)",
            }}
          >
            <div className="font-[Orbitron] text-xs font-bold tracking-[0.1em] text-white text-center pointer-events-none [text-shadow:0_0_8px_rgba(255,255,255,0.8)]">
              ORCHESTRATOR
              <br />
              <span className="text-[0.55rem] opacity-70">CORE</span>
            </div>
          </div>

          <svg
            className="absolute w-full h-full pointer-events-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            {PLANETS_CONFIG.map((planet) => (
              <ellipse
                key={planet.id}
                cx="50%"
                cy="50%"
                rx={planet.rx}
                ry={planet.ry}
                fill="none"
                stroke={
                  hoveredPlanetId === planet.id
                    ? "var(--orbit-hover)"
                    : "var(--orbit-color)"
                }
                strokeWidth={hoveredPlanetId === planet.id ? 1.5 : 1}
                style={{
                  transition: "stroke 0.3s ease",
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              />
            ))}
          </svg>

          {PLANETS_CONFIG.map((planet, index) => (
            <div
              key={planet.id}
              ref={(el) => {
                planetRefs.current[index] = el;
              }}
              className="absolute top-1/2 left-1/2 cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              onMouseEnter={() => setHoveredPlanetId(planet.id)}
              onMouseLeave={() => setHoveredPlanetId(null)}
              onClick={() => onPlanetClick(planet.id)}
            >
              <div className="relative flex flex-col items-center justify-center transition-transform duration-300">
                <div
                  className={`w-[50px] h-[50px] rounded-full relative flex justify-center items-center transition-all duration-300
                    shadow-[inset_-8px_-8px_20px_rgba(0,0,0,0.8)] hover:scale-110
                    after:content-[''] after:absolute after:inset-[-6px] after:rounded-full after:border after:border-transparent after:opacity-60 after:pointer-events-none`}
                  style={{
                    background:
                      planet.id === 1
                        ? "radial-gradient(circle at 30% 30%, #22d3ee 0%, #0891b2 50%, #000000 100%)"
                        : planet.id === 2
                          ? "radial-gradient(circle at 30% 30%, #34d399 0%, #059669 50%, #000000 100%)"
                          : planet.id === 3
                            ? "radial-gradient(circle at 30% 30%, #f472b6 0%, #db2777 50%, #000000 100%)"
                            : "radial-gradient(circle at 30% 30%, #60a5fa 0%, #2563eb 50%, #000000 100%)",
                  }}
                >
                  {planet.id === 1 && (
                    <div className="absolute w-[75px] h-[75px] rounded-full border border-[rgba(6,182,212,0.4)] opacity-50 animate-[pulse-ring_2s_cubic-bezier(0.215,0.610,0.355,1)_infinite]" />
                  )}

                  {planet.id === 2 && (
                    <div
                      className="absolute w-[90px] h-[90px] border-[0.5px] border-dashed border-[rgba(16,185,129,0.3)] rounded-full animate-[rotate-clockwise_10s_linear_infinite]"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {[
                        {
                          top: "0",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        },
                        {
                          top: "50%",
                          left: "100%",
                          transform: "translate(-50%, -50%)",
                        },
                        {
                          top: "100%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        },
                        {
                          top: "50%",
                          left: "0",
                          transform: "translate(-50%, -50%)",
                        },
                      ].map((pos, i) => {
                        const icons = [
                          <Search key="s" />,
                          <Code2 key="c" />,
                          <Mail key="m" />,
                          <Terminal key="t" />,
                        ];
                        return (
                          <div
                            key={i}
                            className="absolute w-[14px] h-[14px] rounded-full bg-[#10b981] flex justify-center items-center shadow-[0_0_8px_#10b981]"
                            style={pos}
                          >
                            {React.cloneElement(icons[i], {
                              className: "w-[8px] h-[8px] text-black",
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {planet.id === 3 && (
                    <>
                      <div
                        className="absolute w-3 h-3 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.4)] animate-[orbit-bubble-1_4s_linear_infinite]"
                        style={{ transformStyle: "preserve-3d" }}
                      />
                      <div
                        className="absolute w-3 h-3 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.4)] animate-[orbit-bubble-2_4s_linear_infinite]"
                        style={{ transformStyle: "preserve-3d" }}
                      />
                      <div
                        className="absolute w-3 h-3 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.4)] animate-[orbit-bubble-3_4s_linear_infinite]"
                        style={{ transformStyle: "preserve-3d" }}
                      />
                    </>
                  )}

                  {planet.id === 4 && (
                    <div className="absolute w-[70px] h-[70px] border border-dotted border-[rgba(59,130,246,0.4)] rounded-full animate-[pulse-rotate_5s_ease-in-out_infinite_alternate]" />
                  )}
                </div>

                <div className="mt-2 font-[Orbitron] text-[0.7rem] font-medium tracking-[0.05em] text-[#9ca3af] bg-black/60 px-2 py-0.5 rounded border border-white/[0.05] pointer-events-none whitespace-nowrap group-hover:text-white group-hover:border-white/20">
                  {planet.name}
                </div>

                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[230px] px-4 py-3 opacity-0 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.1)] z-[100] flex flex-col gap-1.5 border-l-[3px] glass-panel scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-hover:-translate-y-[120%]"
                  style={{
                    borderLeftColor: planet.color,
                    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 15px ${planet.color}15`,
                  }}
                >
                  <div
                    className="font-[Orbitron] text-[0.8rem] font-bold tracking-[0.05em] text-white"
                    style={{ color: planet.color }}
                  >
                    {planet.name}
                  </div>
                  <div className="text-[0.7rem] text-[#9ca3af] leading-[1.3]">
                    {planet.desc}
                  </div>
                  <div className="h-px bg-white/[0.08] my-0.5"></div>
                  <div className="flex flex-col gap-0.5 font-[JetBrains_Mono] text-[0.65rem]">
                    {planet.stats.map((stat, sIndex) => (
                      <div key={sIndex} className="flex justify-between">
                        <span className="text-[#9ca3af]">{stat.label}:</span>
                        <span
                          className="text-white"
                          style={{ color: planet.color }}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="text-[0.55rem] font-[JetBrains_Mono] text-right tracking-[0.05em] mt-1"
                    style={{ color: planet.color }}
                  >
                    &gt; CLICK TO DEPLOY &lt;
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
