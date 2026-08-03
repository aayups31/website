import { create } from "zustand";

export type WorldId =
  | "prologue"
  | "football"
  | "racing"
  | "music"
  | "archive"
  | "contact";

export type QualityTier = "low" | "medium" | "high";

type ExperienceState = {
  activeWorld: WorldId;
  stageReady: boolean;
  motionReduced: boolean;
  quality: QualityTier;
  soundEnabled: boolean;
  setActiveWorld: (world: WorldId) => void;
  setStageReady: (ready: boolean) => void;
  setMotionReduced: (reduced: boolean) => void;
  setQuality: (quality: QualityTier) => void;
  setSoundEnabled: (enabled: boolean) => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  activeWorld: "prologue",
  stageReady: false,
  motionReduced: false,
  quality: "medium",
  soundEnabled: false,
  setActiveWorld: (activeWorld) => set({ activeWorld }),
  setStageReady: (stageReady) => set({ stageReady }),
  setMotionReduced: (motionReduced) => set({ motionReduced }),
  setQuality: (quality) => set({ quality }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
}));

export const worldOrder: WorldId[] = [
  "prologue",
  "football",
  "racing",
  "music",
  "archive",
  "contact",
];
