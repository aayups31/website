"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  DustField,
  IrregularGround,
  LightStrip,
  SplineTube,
  TargetedSpotLight,
} from "@/scenes/geometry/procedural";

function ShroudedVehicle() {
  const bodyGeometry = useMemo(() => {
    const profile = new THREE.Shape();
    profile.moveTo(-3.2, -0.3);
    profile.quadraticCurveTo(-2.9, -0.55, -2.25, -0.52);
    profile.lineTo(-1.62, -0.18);
    profile.quadraticCurveTo(-0.72, 0.02, -0.35, 0.8);
    profile.quadraticCurveTo(0.12, 1.23, 0.72, 0.48);
    profile.quadraticCurveTo(1.6, 0.2, 2.18, 0.4);
    profile.lineTo(2.95, 0.14);
    profile.quadraticCurveTo(3.35, -0.02, 3.18, -0.42);
    profile.quadraticCurveTo(0, -0.68, -3.2, -0.3);
    const geometry = new THREE.ExtrudeGeometry(profile, {
      depth: 1.34,
      bevelEnabled: true,
      bevelSegments: 7,
      bevelSize: 0.16,
      bevelThickness: 0.18,
      curveSegments: 42,
    });
    geometry.center();
    return geometry;
  }, []);

  return (
    <group position={[0.4, 0.04, -2.3]} rotation={[0, -0.16, 0]}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#282a2d"
          roughness={0.84}
          metalness={0.03}
          sheen={0.65}
          sheenColor="#788194"
          clearcoat={0.08}
        />
      </mesh>
      {[
        [-1.92, -0.58, -1.04],
        [-1.92, -0.58, 1.04],
        [1.9, -0.58, -1.04],
        [1.9, -0.58, 1.04],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow>
          <torusGeometry args={[0.67, 0.24, 18, 42]} />
          <meshStandardMaterial color="#090a0b" roughness={0.7} metalness={0.04} />
        </mesh>
      ))}
      <SplineTube
        points={[
          [-2.85, 0.12, 0.76],
          [-1.55, 0.28, 0.82],
          [-0.3, 1.02, 0.78],
          [0.86, 0.43, 0.78],
          [2.82, 0.05, 0.76],
        ]}
        color="#707985"
        radius={0.018}
        opacity={0.75}
        metalness={0.1}
        roughness={0.85}
      />
      <mesh position={[0.1, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.04, 8, 40, Math.PI]} />
        <meshStandardMaterial color="#a9b0bd" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

function GarageCanopy() {
  return (
    <group>
      {[-6.8, -3.4, 0, 3.4, 6.8].map((z, index) => (
        <group key={z} position={[0, 0, z]}>
          <SplineTube
            points={[
              [-5.4, -1.2, 0],
              [-4.6, 2.5, 0],
              [-2.6, 4.25, 0],
              [0, 4.65 + index * 0.02, 0],
              [2.6, 4.25, 0],
              [4.6, 2.5, 0],
              [5.4, -1.2, 0],
            ]}
            color={index % 2 ? "#3b3e42" : "#5e6268"}
            radius={0.1}
            metalness={0.7}
            roughness={0.28}
          />
          <LightStrip
            position={[0, 4.18, 0]}
            rotation={[0, 0, Math.PI / 2]}
            length={4.7}
            color={index < 2 ? "#dce6f5" : "#d6a66f"}
            intensity={index < 2 ? 1.8 : 1.25}
          />
        </group>
      ))}
      <SplineTube
        points={[
          [-4.8, 3.35, 7.5],
          [-4.4, 3.62, 2],
          [-4.35, 3.54, -3.5],
          [-4.1, 3.1, -8.4],
        ]}
        color="#585d63"
        radius={0.07}
      />
      <SplineTube
        points={[
          [4.8, 3.35, 7.5],
          [4.4, 3.62, 2],
          [4.35, 3.54, -3.5],
          [4.1, 3.1, -8.4],
        ]}
        color="#585d63"
        radius={0.07}
      />
    </group>
  );
}

function TelemetryRig() {
  const traces = [
    { y: 1.65, color: "#d7e2f2", seed: 0.1 },
    { y: 1.2, color: "#d49a5a", seed: 0.8 },
    { y: 0.75, color: "#a6b7d6", seed: 1.4 },
  ];
  return (
    <group position={[-2.2, 0.1, -7.5]} rotation={[0, 0.18, 0]}>
      <SplineTube
        points={[
          [-2.6, -1, 0],
          [-2.45, 2.8, 0],
          [0, 3.25, 0],
          [2.45, 2.8, 0],
          [2.6, -1, 0],
        ]}
        color="#43484e"
        radius={0.095}
      />
      {traces.map((trace) => (
        <SplineTube
          key={trace.y}
          points={Array.from({ length: 10 }, (_, index) => {
            const x = -2.05 + index * 0.46;
            return [
              x,
              trace.y + Math.sin(index * 1.3 + trace.seed) * 0.16,
              -0.05,
            ] as [number, number, number];
          })}
          color={trace.color}
          radius={0.018}
          opacity={0.88}
          metalness={0}
          roughness={0.15}
        />
      ))}
      <mesh position={[0, 1.35, 0.08]}>
        <planeGeometry args={[4.45, 2.35]} />
        <meshBasicMaterial color="#0b0f14" transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

function StrategySurface() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-3.5, -0.7);
    shape.bezierCurveTo(-2.2, -1.25, 1.6, -1.15, 3.35, -0.45);
    shape.lineTo(2.82, 0.68);
    shape.bezierCurveTo(1.2, 0.25, -1.55, 0.18, -3.2, 0.72);
    shape.closePath();
    const surface = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      bevelSegments: 4,
      curveSegments: 32,
    });
    surface.center();
    surface.rotateX(-Math.PI / 2);
    return surface;
  }, []);

  return (
    <group position={[1.15, -0.38, -10.8]} rotation={[0, -0.28, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#17191b"
          roughness={0.26}
          metalness={0.6}
          clearcoat={0.45}
        />
      </mesh>
      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={index}
          position={[-2.1 + index * 1.25, 0.12, 0.05 + Math.sin(index) * 0.14]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.23, 0.31, 28]} />
          <meshBasicMaterial
            color={index < 2 ? "#d5dce7" : "#cf8c50"}
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function RacingWorld() {
  return (
    <group position={[0, -0.12, -45]}>
      <IrregularGround width={16} depth={34} color="#101112" wet={0.58} />
      <GarageCanopy />
      <ShroudedVehicle />
      <TelemetryRig />
      <StrategySurface />
      <DustField count={150} spread={[13, 6, 26]} color="#e7d7c4" opacity={0.14} />
      <TargetedSpotLight
        world="racing"
        position={[-4.2, 6.4, 4.8]}
        target={[0, 0, -2.5]}
        angle={0.4}
        penumbra={0.95}
        intensity={4.7}
        color="#cfdcf0"
      />
      <pointLight position={[2.8, 1.4, -9]} color="#c16f35" intensity={4} distance={8} />
    </group>
  );
}
