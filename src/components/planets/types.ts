import type * as THREE from "three";

export interface PlanetVisualProps {
  config: {
    id: number;
    size: number;
    hexColor: string;
  };
  satellitesRef: React.RefObject<THREE.Group | null>;
}
