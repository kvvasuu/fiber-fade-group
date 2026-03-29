import { create } from "zustand";

export type Store = {
  selectedMode: "alpha" | "dither" | "dissolve" | "noise";
  alphaVisible: boolean;
  ditherVisible: boolean;
  dissolveVisible: boolean;
  noiseVisible: boolean;
  dissolveFlying: boolean;
};

export const useMainStore = create<Store>(() => ({
  selectedMode: "dissolve",
  alphaVisible: true,
  ditherVisible: true,
  dissolveVisible: true,
  noiseVisible: true,
  dissolveFlying: false,
}));
