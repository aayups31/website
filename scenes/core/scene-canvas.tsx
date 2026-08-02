"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/lib/experience-store";
import { WorldStage } from "./world-stage";

export function SceneCanvas() {
  const quality = useExperienceStore((state) => state.quality);
  const dpr: [number, number] =
    quality === "high" ? [1, 1.5] : quality === "medium" ? [0.85, 1.25] : [0.75, 1];

  return (
    <Canvas
      dpr={dpr}
      shadows={quality !== "low"}
      camera={{ position: [0.25, 1.5, 14], fov: 38, near: 0.08, far: 90 }}
      gl={{
        antialias: quality !== "low",
        alpha: false,
        powerPreference: "high-performance",
      }}
      performance={{ min: 0.62 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.9;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <WorldStage />
    </Canvas>
  );
}
