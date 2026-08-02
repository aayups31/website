"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { useExperienceStore } from "@/lib/experience-store";
import { scrollRuntime } from "./scroll-runtime";

const positionKeys: [number, number, number][] = [
  [0.25, 1.5, 14],
  [-0.7, 0.9, 5.2],
  [0.9, 0.4, -8.5],
  [0.15, 1.2, -28],
  [-0.95, 0.65, -43.5],
  [0.95, 0.45, -57.5],
  [0.2, 1.05, -74],
  [-0.9, 0.65, -89],
  [0.55, 0.8, -105],
  [0.15, 1.15, -119.5],
  [-0.8, 0.85, -133],
  [0.9, 0.6, -149.5],
  [0, 1, -165],
];

const targetKeys: [number, number, number][] = [
  [0, 0.75, 5],
  [0, 0.45, -1.8],
  [0.15, 0.2, -16],
  [0, 0.65, -39],
  [0.3, 0.25, -48],
  [-0.2, 0.2, -63],
  [0, 0.6, -85],
  [0, 0.55, -95],
  [0.3, 0.45, -112],
  [0, 0.7, -128],
  [0.2, 0.65, -138],
  [-0.15, 0.45, -157],
  [0, 0.8, -171],
];

export function CameraDirector() {
  const { camera } = useThree();
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const positionCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        positionKeys.map((point) => new THREE.Vector3(...point)),
        false,
        "catmullrom",
        0.18,
      ),
    [],
  );
  const targetCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        targetKeys.map((point) => new THREE.Vector3(...point)),
        false,
        "catmullrom",
        0.18,
      ),
    [],
  );
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const desiredQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame((_, delta) => {
    const rawProgress = THREE.MathUtils.clamp(scrollRuntime.progress, 0, 1);
    const progress = motionReduced
      ? Math.round(rawProgress * (positionKeys.length - 1)) / (positionKeys.length - 1)
      : rawProgress;
    positionCurve.getPointAt(progress, desiredPosition);
    targetCurve.getPointAt(progress, desiredTarget);
    const damping = motionReduced ? 1 : 1 - Math.exp(-delta * 3.7);
    camera.position.lerp(desiredPosition, damping);
    matrix.lookAt(camera.position, desiredTarget, up);
    desiredQuaternion.setFromRotationMatrix(matrix);
    camera.quaternion.slerp(desiredQuaternion, motionReduced ? 1 : 1 - Math.exp(-delta * 4.8));

    if (camera instanceof THREE.PerspectiveCamera) {
      const desiredFov = 38 + Math.sin(progress * Math.PI * 4) * 1.4;
      camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, 4, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
