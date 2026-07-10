import { create } from "zustand";

interface AppStore {
  orbitSpeed: number;
  activePlanetId: number | null;
  activePlanetName: string | null;
  hoveredPlanetId: number | null;
  coreHovered: boolean;

  setOrbitSpeed: (speed: number) => void;
  setActivePlanetId: (id: number | null) => void;
  setActivePlanetName: (name: string | null) => void;
  setHoveredPlanetId: (id: number | null) => void;
  setCoreHovered: (hovered: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  orbitSpeed: 0.2,
  activePlanetId: null,
  activePlanetName: null,
  hoveredPlanetId: null,
  coreHovered: false,

  setOrbitSpeed: (speed) => set({ orbitSpeed: speed }),
  setActivePlanetId: (id) => set({ activePlanetId: id }),
  setActivePlanetName: (name) => set({ activePlanetName: name }),
  setHoveredPlanetId: (id) => set({ hoveredPlanetId: id }),
  setCoreHovered: (hovered) => set({ coreHovered: hovered }),
}));