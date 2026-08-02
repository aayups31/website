"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  ArchRib,
  DustField,
  IrregularGround,
  LightStrip,
  ProjectionBeam,
  SplineTube,
  TargetedSpotLight,
} from "@/scenes/geometry/procedural";

function BrokenRotunda() {
  const segments = [
    { angle: -0.95, length: 0.66, radius: 6.2, height: 5.2 },
    { angle: -0.08, length: 0.58, radius: 6.8, height: 6.3 },
    { angle: 0.72, length: 0.62, radius: 6.15, height: 4.6 },
    { angle: 1.52, length: 0.52, radius: 7.2, height: 5.8 },
    { angle: 2.28, length: 0.58, radius: 6.45, height: 5.1 },
  ];

  return (
    <group position={[0, 1.1, -2]}>
      {segments.map((segment, index) => (
        <mesh
          key={segment.angle}
          position={[0, (segment.height - 5) * 0.15, 0]}
          rotation={[0, segment.angle, index % 2 ? 0.025 : -0.018]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry
            args={[
              segment.radius,
              segment.radius + 0.18,
              segment.height,
              48,
              4,
              true,
              0,
              segment.length,
            ]}
          />
          <meshStandardMaterial
            color={index === 2 ? "#45494a" : "#2a2e2f"}
            roughness={0.92}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {Array.from({ length: 13 }, (_, index) => {
        const angle = -1.4 + index * 0.24;
        const radius = 4.4 + (index % 3) * 0.16;
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * radius, 0.35, Math.cos(angle) * radius]}
            rotation={[0, angle + Math.PI / 2, index % 2 ? 0.06 : -0.04]}
            castShadow
          >
            <extrudeGeometry
              args={[
                new THREE.Shape([
                  new THREE.Vector2(-0.12, -2.4),
                  new THREE.Vector2(0.1, -2.4),
                  new THREE.Vector2(0.28, 2.25),
                  new THREE.Vector2(-0.24, 2.5),
                ]),
                { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelSegments: 2 },
              ]}
            />
            <meshStandardMaterial color="#54595a" roughness={0.88} />
          </mesh>
        );
      })}
    </group>
  );
}

function ArchiveRibbon() {
  const ribbonGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.6, 2.8, 2.2),
      new THREE.Vector3(-2.8, 1.2, 0.7),
      new THREE.Vector3(-0.2, 2.05, -0.7),
      new THREE.Vector3(2.4, 1.05, -1.6),
      new THREE.Vector3(4.8, 2.4, -2.4),
    ]);
    const segments = 56;
    const halfWidth = 0.58;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const point = curve.getPoint(t);
      curve.getTangent(t, tangent);
      side.crossVectors(tangent, up).normalize();
      for (const direction of [-1, 1]) {
        const vertex = point.clone().addScaledVector(side, halfWidth * direction);
        positions.push(vertex.x, vertex.y, vertex.z);
        uvs.push(t, direction === -1 ? 0 : 1);
      }
      if (index < segments) {
        const base = index * 2;
        indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group position={[0, 0.2, -6.6]}>
      <mesh geometry={ribbonGeometry} castShadow>
        <meshStandardMaterial
          color="#d2d0c6"
          roughness={0.82}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-3.2, -1.15, 1.1, 3.3].map((x, index) => (
        <mesh key={x} position={[x, 1.65 + (index % 2) * 0.3, -0.2 - index * 0.6]}>
          <torusGeometry args={[0.42, 0.055, 8, 36]} />
          <meshStandardMaterial color="#3d4141" metalness={0.66} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function AnamorphicDoorway() {
  return (
    <group position={[0, -0.1, -11.8]}>
      <group position={[-1.25, 0, 0.5]} rotation={[0.06, 0.18, -0.06]}>
        <ArchRib z={0} width={4.3} height={4.1} color="#6a6c68" />
      </group>
      <group position={[1.15, 0.22, -1]} rotation={[-0.04, -0.16, 0.07]} scale={[0.87, 1.1, 1]}>
        <ArchRib z={0} width={4.2} height={4} color="#424645" />
      </group>
      <LightStrip position={[0, 3.55, -0.3]} rotation={[0, 0, Math.PI / 2]} length={1.7} color="#d3d8cc" />
    </group>
  );
}

export function PsychologicalWorld() {
  return (
    <group position={[0, -0.05, -90]}>
      <IrregularGround width={18} depth={34} color="#252829" wet={0.18} />
      <BrokenRotunda />
      <ArchiveRibbon />
      <AnamorphicDoorway />
      <SplineTube
        points={[
          [-5, 3.7, 7],
          [-3.8, 4.15, 1],
          [-2.9, 3.75, -5],
          [-1.2, 3.3, -12],
        ]}
        color="#4e5452"
        radius={0.09}
      />
      <SplineTube
        points={[
          [5.2, 0.45, 7],
          [4.45, 0.28, 0],
          [3.9, 0.52, -6],
          [2.55, 0.18, -13],
        ]}
        color="#454a48"
        radius={0.055}
      />
      <ProjectionBeam
        position={[0.3, 2.35, -15.5]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#dfe5d7"
        length={8}
      />
      <DustField count={190} spread={[15, 8, 27]} color="#d6d9cc" opacity={0.19} />
      <TargetedSpotLight
        world="psychological"
        position={[-4.5, 6.2, 3]}
        target={[0, 0, -4]}
        angle={0.45}
        penumbra={0.95}
        intensity={3.7}
        color="#dce1d6"
      />
      <pointLight position={[3.8, 1.2, -10]} intensity={3.2} distance={9} color="#b79d74" />
    </group>
  );
}
