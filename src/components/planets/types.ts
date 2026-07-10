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

export type { PlanetConfig };
