"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  CurvedMediaSurface,
  DustField,
  IrregularGround,
  LightStrip,
  ProjectionBeam,
  SplineTube,
  TargetedSpotLight,
} from "@/scenes/geometry/procedural";

function OpticalIris() {
  const bladeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.25, 0);
    shape.quadraticCurveTo(1.25, 0.1, 2.55, 0.92);
    shape.quadraticCurveTo(2.2, 1.75, 1.02, 2.15);
    shape.quadraticCurveTo(0.58, 1.1, 0.25, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geometry.translate(0, -1.04, -0.04);
    return geometry;
  }, []);

  return (
    <group position={[0, 1.2, 4.8]} rotation={[0, 0, 0]}>
      {[2.85, 3.2, 3.55].map((radius, index) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, 0.08 + index * 0.025, 10, 72]} />
          <meshStandardMaterial
            color={index === 1 ? "#7d858f" : "#373c42"}
            metalness={0.78}
            roughness={0.23}
          />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, index) => (
        <mesh
          key={index}
          geometry={bladeGeometry}
          rotation={[0, 0, (index / 10) * Math.PI * 2 + 0.18]}
          castShadow
        >
          <meshStandardMaterial
            color={index % 2 ? "#21262b" : "#30363c"}
            metalness={0.65}
            roughness={0.34}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0, -0.8]} intensity={5} distance={7} color="#bbd1ff" />
    </group>
  );
}

function OpticalBench() {
  const lathePoints = useMemo(
    () => [
      new THREE.Vector2(0.42, -0.85),
      new THREE.Vector2(0.65, -0.72),
      new THREE.Vector2(0.78, -0.3),
      new THREE.Vector2(0.83, 0.2),
      new THREE.Vector2(0.68, 0.72),
      new THREE.Vector2(0.38, 0.88),
    ],
    [],
  );

  return (
    <group position={[-2.9, -0.32, -9.4]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <latheGeometry args={[lathePoints, 48]} />
        <meshPhysicalMaterial
          color="#20262e"
          metalness={0.72}
          roughness={0.19}
          clearcoat={0.42}
        />
      </mesh>
      {[0.98, 1.24, 1.52].map((radius, index) => (
        <mesh key={radius} position={[0, 0.2, -0.05 - index * 0.08]}>
          <torusGeometry args={[radius, 0.06, 10, 48]} />
          <meshStandardMaterial color="#606875" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <SplineTube
        points={[
          [-2.2, -0.72, 0.4],
          [-0.8, -0.58, 0.15],
          [0.8, -0.66, -0.1],
          [2.45, -0.5, -0.34],
        ]}
        color="#555d66"
        radius={0.09}
      />
      <SplineTube
        points={[
          [-2.05, -0.5, 0.28],
          [-0.7, -0.35, 0.04],
          [0.9, -0.42, -0.16],
          [2.35, -0.3, -0.42],
        ]}
        color="#2f353d"
        radius={0.035}
      />
    </group>
  );
}

function MediaRibbon() {
  return (
    <group>
      <CurvedMediaSurface
        source="/placeholders/vfx-volume.svg"
        position={[2.7, 1.4, -1.7]}
        rotation={[0, -0.38, 0]}
        width={5.9}
        height={3.3}
        curve={0.055}
        opacity={0.94}
      />
      <CurvedMediaSurface
        source="/placeholders/vfx-breakdown.svg"
        position={[-2.85, 0.8, -6.6]}
        rotation={[0.03, 0.4, -0.025]}
        width={4.8}
        height={3.08}
        curve={0.065}
        opacity={0.9}
      />
      <CurvedMediaSurface
        source="/placeholders/photo-architecture.svg"
        position={[2.55, 0.75, -11.6]}
        rotation={[-0.02, -0.42, 0.025]}
        width={2.55}
        height={3.4}
        curve={0.07}
        opacity={0.92}
      />
      <CurvedMediaSurface
        source="/placeholders/photo-motion.svg"
        position={[-2.1, 1.1, -15.2]}
        rotation={[0, 0.34, -0.02]}
        width={4.9}
        height={3.1}
        curve={0.055}
        opacity={0.9}
      />
      <SplineTube
        points={[
          [5.05, 3.25, 0],
          [3.8, 3.6, -4.5],
          [2.75, 3.2, -9],
          [1.9, 3.55, -14],
          [0.4, 3.25, -18],
        ]}
        color="#616b78"
        radius={0.07}
      />
      <SplineTube
        points={[
          [-4.8, 0.1, 0],
          [-4.2, 0.25, -4.5],
          [-3.2, 0.05, -9],
          [-2.6, 0.35, -14],
          [-1.2, 0.1, -18],
        ]}
        color="#3d444d"
        radius={0.045}
      />
    </group>
  );
}

export function ArchiveWorld() {
  return (
    <group position={[0, -0.1, -134]}>
      <IrregularGround width={16} depth={38} color="#0b0e12" wet={0.34} />
      <OpticalIris />
      <MediaRibbon />
      <OpticalBench />
      <ProjectionBeam
        position={[0, 1.15, 0.8]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#b8ccf2"
        length={9}
      />
      <LightStrip
        position={[-3.7, 3.8, -3.4]}
        rotation={[0, 0, Math.PI / 2]}
        length={2.7}
        color="#c6d5f2"
        intensity={1.5}
      />
      <LightStrip
        position={[3.8, 3.35, -10.1]}
        rotation={[0, 0, Math.PI / 2]}
        length={2.2}
        color="#d8b383"
        intensity={1.1}
      />
      <DustField count={230} spread={[14, 8, 34]} color="#cbdcff" opacity={0.23} />
      <TargetedSpotLight
        world="archive"
        position={[4.8, 6.8, 3.2]}
        target={[0, 0, -4]}
        angle={0.42}
        penumbra={0.94}
        intensity={4.3}
        color="#c8d9fa"
      />
      <pointLight position={[-2.5, 1.8, -14]} intensity={3.1} distance={8} color="#d39a62" />
    </group>
  );
}
