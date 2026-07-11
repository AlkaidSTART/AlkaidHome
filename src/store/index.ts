import { create } from "zustand";

interface AppStore {
  orbitSpeed: number;
  activePlanetId: number | null;
  hoveredPlanetId: number | null;
  coreHovered: boolean;

  setOrbitSpeed: (speed: number) => void;
  setActivePlanetId: (id: number | null) => void;
  setHoveredPlanetId: (id: number | null) => void;
  setCoreHovered: (hovered: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  orbitSpeed: 0.2,
  activePlanetId: null,
  hoveredPlanetId: null,
  coreHovered: false,

  setOrbitSpeed: (speed) => set({ orbitSpeed: speed }),
  setActivePlanetId: (id) => set({ activePlanetId: id }),
  setHoveredPlanetId: (id) => set({ hoveredPlanetId: id }),
  setCoreHovered: (hovered) => set({ coreHovered: hovered }),
}));