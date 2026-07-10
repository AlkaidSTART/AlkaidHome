import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

interface OrbitalState {
  meanAnomalies: number[];
  perturbations: { x: number; y: number; z: number }[];
  velocities: { x: number; y: number; z: number }[];
}

interface OrbitParams {
  a: number;
  e: number;
  i: number;
  omega: number;
  M0: number;
  period: number;
}

interface PlanetPosition {
  x: number;
  y: number;
  z: number;
  visible: boolean;
}

interface OrbitalContextType {
  getPlanetPosition: (index: number) => PlanetPosition;
  updateOrbits: (delta: number, speed: number) => void;
}

const ORBITS: OrbitParams[] = [
  { a: 1.5, e: 0.12, i: 0.05, omega: 0.5, M0: 0, period: 6 },
  { a: 2.3, e: 0.1, i: -0.04, omega: 2.0, M0: Math.PI / 3, period: 12 },
  { a: 3.1, e: 0.08, i: 0.03, omega: 3.8, M0: Math.PI * 0.7, period: 20 },
  { a: 3.9, e: 0.1, i: -0.02, omega: 5.2, M0: Math.PI * 1.3, period: 32 },
];

const PLANET_MASS = [0.8, 1.2, 2.5, 1.8];

function solveKepler(M: number, e: number, maxIter = 10): number {
  let E = M;
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

function getOrbitalPosition(
  orbit: OrbitParams,
  M: number,
): { x: number; y: number; z: number } {
  const E = solveKepler(M, orbit.e);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrt1me2 = Math.sqrt(1 - orbit.e * orbit.e);

  const xOrbital = orbit.a * (cosE - orbit.e);
  const zOrbital = orbit.a * sqrt1me2 * sinE;

  const cosO = Math.cos(orbit.omega);
  const sinO = Math.sin(orbit.omega);
  const xRot = xOrbital * cosO - zOrbital * sinO;
  const zRot = xOrbital * sinO + zOrbital * cosO;

  const cosI = Math.cos(orbit.i);
  const sinI = Math.sin(orbit.i);
  const y = xRot * sinI;
  const x = xRot * cosI;
  const z = zRot;

  return { x, y, z };
}

function computePerturbation(
  positions: { x: number; y: number; z: number }[],
  myIndex: number,
  G = 0.008,
): { ax: number; ay: number; az: number } {
  let ax = 0, ay = 0, az = 0;
  const myPos = positions[myIndex];

  for (let i = 0; i < positions.length; i++) {
    if (i === myIndex) continue;
    const dx = positions[i].x - myPos.x;
    const dy = positions[i].y - myPos.y;
    const dz = positions[i].z - myPos.z;
    const r2 = dx * dx + dy * dy + dz * dz;
    const softening = 0.5;
    const rSoft = Math.sqrt(r2 + softening * softening);
    const factor = (G * PLANET_MASS[i]) / (rSoft * rSoft * rSoft);
    ax += factor * dx;
    ay += factor * dy;
    az += factor * dz;
  }

  return { ax, ay, az };
}

const initialState: OrbitalState = {
  meanAnomalies: ORBITS.map((o) => o.M0),
  perturbations: ORBITS.map(() => ({ x: 0, y: 0, z: 0 })),
  velocities: ORBITS.map(() => ({ x: 0, y: 0, z: 0 })),
};

type Action = {
  type: "UPDATE_ORBITS";
  delta: number;
  speed: number;
};

function orbitalReducer(state: OrbitalState, action: Action): OrbitalState {
  if (action.type === "UPDATE_ORBITS") {
    const { delta, speed } = action;
    const newMeanAnomalies = [...state.meanAnomalies];
    const newVelocities = state.velocities.map((v) => ({ ...v }));
    const newPerturbations = state.perturbations.map((p) => ({ ...p }));

    for (let i = 0; i < ORBITS.length; i++) {
      const orbit = ORBITS[i];
      const meanMotion = (2 * Math.PI) / orbit.period;
      newMeanAnomalies[i] += delta * meanMotion * speed;
    }

    const basePositions = newMeanAnomalies.map((M, i) => {
      const pos = getOrbitalPosition(ORBITS[i], M);
      return {
        x: pos.x + newPerturbations[i].x,
        y: pos.y + newPerturbations[i].y,
        z: pos.z + newPerturbations[i].z,
      };
    });

    for (let i = 0; i < ORBITS.length; i++) {
      const pert = computePerturbation(basePositions, i);
      newVelocities[i].x += pert.ax * delta;
      newVelocities[i].y += pert.ay * delta;
      newVelocities[i].z += pert.az * delta;

      const damping = 0.98;
      newVelocities[i].x *= damping;
      newVelocities[i].y *= damping;
      newVelocities[i].z *= damping;

      newPerturbations[i].x += newVelocities[i].x * delta;
      newPerturbations[i].y += newVelocities[i].y * delta;
      newPerturbations[i].z += newVelocities[i].z * delta;

      const maxPert = 0.3;
      newPerturbations[i].x = Math.max(-maxPert, Math.min(maxPert, newPerturbations[i].x));
      newPerturbations[i].y = Math.max(-maxPert, Math.min(maxPert, newPerturbations[i].y));
      newPerturbations[i].z = Math.max(-maxPert, Math.min(maxPert, newPerturbations[i].z));
    }

    return {
      meanAnomalies: newMeanAnomalies,
      perturbations: newPerturbations,
      velocities: newVelocities,
    };
  }

  return state;
}

const OrbitalContext = createContext<OrbitalContextType | null>(null);

export function OrbitalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orbitalReducer, initialState);

  const updateOrbits = useCallback((delta: number, speed: number) => {
    dispatch({ type: "UPDATE_ORBITS", delta, speed });
  }, []);

  const getPlanetPosition = useCallback((index: number): PlanetPosition => {
    const orbit = ORBITS[index];
    const M = state.meanAnomalies[index];
    const pos = getOrbitalPosition(orbit, M);

    const finalX = pos.x + state.perturbations[index].x;
    const finalY = pos.y + state.perturbations[index].y;
    const finalZ = pos.z + state.perturbations[index].z;

    const distance = 14;
    const tilt = Math.PI / 5;
    const projectedY = finalY / (distance - finalZ * Math.cos(tilt));
    const projectedX = finalX / (distance - finalZ * Math.cos(tilt));

    const screenX = 50 + projectedX * 25;
    const screenY = 50 - projectedY * 25;

    const depth = Math.sin(M);
    const visible = depth > -0.3;

    return { x: screenX, y: screenY, z: finalZ, visible };
  }, [state]);

  return (
    <OrbitalContext.Provider value={{ getPlanetPosition, updateOrbits }}>
      {children}
    </OrbitalContext.Provider>
  );
}

export function useOrbital() {
  const context = useContext(OrbitalContext);
  if (!context) {
    throw new Error("useOrbital must be used within an OrbitalProvider");
  }
  return context;
}

export { ORBITS, type OrbitParams };
