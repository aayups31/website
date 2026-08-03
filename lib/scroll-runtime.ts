import type { WorldId } from "./experience-store";

export const scrollRuntime = {
  progress: 0,
  localProgress: 0,
  velocity: 0,
  world: "prologue" as WorldId,
};

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const normalized = clamp((value - edge0) / (edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
};
