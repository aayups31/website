"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useExperienceStore } from "@/lib/experience-store";
import { FootballWorld } from "@/scenes/worlds/football-world";
import { RacingWorld } from "@/scenes/worlds/racing-world";
import { PsychologicalWorld } from "@/scenes/worlds/psychological-world";
import { ArchiveWorld } from "@/scenes/worlds/archive-world";
import { LightStrip, SplineTube } from "@/scenes/geometry/procedural";
import { scrollRuntime } from "./scroll-runtime";
import { CameraDirector } from "./camera-director";

const palette = [
  new THREE.Color("#05080d"),
  new THREE.Color("#07101d"),
  new THREE.Color("#0b0c0e"),
  new THREE.Color("#151817"),
  new THREE.Color("#070a10"),
  new THREE.Color("#050607"),
];

function SceneReadySignal() {
  const setCanvasReady = useExperienceStore((state) => state.setCanvasReady);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCanvasReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [setCanvasReady]);

  return null;
}

function FinaleMarker() {
  return (
    <group position={[0, 0, -170]}>
      {[2.4, 2.75, 3.1].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.055 + index * 0.018, 8, 72]} />
          <meshStandardMaterial
            color={index === 1 ? "#7e8794" : "#343940"}
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>
      ))}
      <LightStrip position={[0, 0.35, -0.5]} rotation={[0, 0, Math.PI / 2]} length={3.1} />
      <SplineTube
        points={[
          [-3.8, -1, 1.4],
          [-2.6, 1.8, 0.2],
          [0, 3.15, -0.4],
          [2.6, 1.8, 0.2],
          [3.8, -1, 1.4],
        ]}
        color="#606975"
        radius={0.08}
      />
      <pointLight position={[0, 0.4, 1.2]} intensity={3.5} distance={7} color="#dbe7ff" />
    </group>
  );
}

function PaletteDirector() {
  const { scene } = useThree();
  const current = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const scaled = THREE.MathUtils.clamp(scrollRuntime.progress, 0, 0.9999) * (palette.length - 1);
    const index = Math.floor(scaled);
    const mix = scaled - index;
    current.lerpColors(palette[index], palette[Math.min(index + 1, palette.length - 1)], mix);
    scene.background = current;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(current);
      scene.fog.density = 0.034 + Math.sin(scrollRuntime.progress * Math.PI * 5) * 0.004;
    }
  });

  return null;
}

export function WorldStage() {
  return (
    <>
      <fogExp2 attach="fog" args={["#05080d", 0.036]} />
      <ambientLight intensity={0.13} color="#a8b6c8" />
      <hemisphereLight intensity={0.3} color="#becce2" groundColor="#15110e" />
      <Environment resolution={128}>
        <Lightformer
          form="ring"
          intensity={1.4}
          color="#d9e4f7"
          scale={[8, 8, 1]}
          position={[0, 5, 2]}
          rotation-x={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#c17f4e"
          scale={[5, 2, 1]}
          position={[-6, 2, -45]}
          rotation-y={Math.PI / 2}
        />
      </Environment>
      <Suspense fallback={null}>
        <FootballWorld />
        <RacingWorld />
        <PsychologicalWorld />
        <ArchiveWorld />
        <SceneReadySignal />
      </Suspense>
      <FinaleMarker />
      <CameraDirector />
      <PaletteDirector />
    </>
  );
}
