import type { OrbitParams } from "./types";

export interface PlanetConfig {
  id: number;
  nameKey: string;
  roleKey: string;
  descKey: string;
  color: string;
  hexColor: string;
  rx: number;
  ry: number;
  speedCoeff: number;
  startAngle: number;
  size: number;
  stats: { labelKey: string; value: string }[];
  orbit: OrbitParams;
}

export const PLANETS_CONFIG: PlanetConfig[] = [
  {
    id: 1,
    nameKey: "planets.voiceCanvas.name",
    roleKey: "planets.voiceCanvas.role",
    descKey: "planets.voiceCanvas.desc",
    color: "var(--c-planet-1)",
    hexColor: "#06b6d4",
    rx: 1.5,
    ry: 1.0,
    speedCoeff: 1.0,
    startAngle: 0,
    size: 0.35,
    stats: [
      { labelKey: "planets.voiceCanvas.stats.latency", value: "120ms" },
      { labelKey: "planets.voiceCanvas.stats.codec", value: "Opus 48kbps" },
      { labelKey: "planets.voiceCanvas.stats.mosScore", value: "4.65" },
    ],
    orbit: { a: 1.5, e: 0.12, i: 0.05, omega: 0.5, M0: 0, period: 6 },
  },
  {
    id: 2,
    nameKey: "planets.autonomousAgent.name",
    roleKey: "planets.autonomousAgent.role",
    descKey: "planets.autonomousAgent.desc",
    color: "var(--c-planet-2)",
    hexColor: "#10b981",
    rx: 2.3,
    ry: 1.5,
    speedCoeff: 0.7,
    startAngle: Math.PI / 2,
    size: 0.4,
    stats: [
      { labelKey: "planets.autonomousAgent.stats.successRate", value: "94.2%" },
      {
        labelKey: "planets.autonomousAgent.stats.stepsPerTask",
        value: "12 steps",
      },
      { labelKey: "planets.autonomousAgent.stats.runs", value: "48k / day" },
    ],
    orbit: { a: 2.3, e: 0.1, i: -0.04, omega: 2.0, M0: Math.PI / 3, period: 12 },
  },
  {
    id: 3,
    nameKey: "planets.multiAgent.name",
    roleKey: "planets.multiAgent.role",
    descKey: "planets.multiAgent.desc",
    color: "var(--c-planet-3)",
    hexColor: "#ec4899",
    rx: 3.1,
    ry: 2.0,
    speedCoeff: 0.45,
    startAngle: Math.PI,
    size: 0.45,
    stats: [
      { labelKey: "planets.multiAgent.stats.agentNodes", value: "3 Active" },
      { labelKey: "planets.multiAgent.stats.consensus", value: "98.5%" },
      { labelKey: "planets.multiAgent.stats.iterations", value: "4.2 cycles" },
    ],
    orbit: { a: 3.1, e: 0.08, i: 0.03, omega: 3.8, M0: Math.PI * 0.7, period: 20 },
  },
  {
    id: 4,
    nameKey: "planets.agenticRag.name",
    roleKey: "planets.agenticRag.role",
    descKey: "planets.agenticRag.desc",
    color: "var(--c-planet-4)",
    hexColor: "#3b82f6",
    rx: 3.9,
    ry: 2.4,
    speedCoeff: 0.3,
    startAngle: (3 * Math.PI) / 2,
    size: 0.5,
    stats: [
      { labelKey: "planets.agenticRag.stats.vectors", value: "1.2M docs" },
      { labelKey: "planets.agenticRag.stats.searchLatency", value: "14ms" },
      { labelKey: "planets.agenticRag.stats.cacheHit", value: "88%" },
    ],
    orbit: { a: 3.9, e: 0.1, i: -0.02, omega: 5.2, M0: Math.PI * 1.3, period: 32 },
  },
];
