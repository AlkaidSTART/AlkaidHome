import type * as THREE from "three";
import type { PlanetConfig } from "./config";

export interface PlanetVisualProps {
  config: {
    id: number;
    size: number;
    hexColor: string;
  };
  satellitesRef: React.RefObject<THREE.Group | null>;
}

export interface OrbitParams {
  a: number;
  e: number;
  i: number;
  omega: number;
  M0: number;
  period: number;
}

export type { PlanetConfig };
