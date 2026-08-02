"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  ArchRib,
  DustField,
  IrregularGround,
  LightStrip,
  SplineTube,
  TargetedSpotLight,
} from "@/scenes/geometry/procedural";

function TacticalTable() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.4, -0.7);
    shape.quadraticCurveTo(-2.65, 0, -2.05, 0.92);
    shape.quadraticCurveTo(0, 1.55, 2.05, 0.92);
    shape.quadraticCurveTo(2.65, 0, 2.4, -0.7);
    shape.quadraticCurveTo(0, -1.05, -2.4, -0.7);
    const extruded = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      curveSegments: 28,
    });
    extruded.center();
    extruded.rotateX(-Math.PI / 2);
    return extruded;
  }, []);

  return (
    <group position={[0.9, -0.33, -7.6]} rotation={[0, -0.18, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#18202b" metalness={0.62} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 1.35, 20, 10]} />
        <meshBasicMaterial color="#244b92" transparent opacity={0.52} />
      </mesh>
      {[-1.25, -0.55, 0.2, 0.95].map((offset, index) => (
        <SplineTube
          key={offset}
          points={[
            [offset - 0.35, 0.16, -0.48],
            [offset - 0.12, 0.18, -0.05],
            [offset + 0.24, 0.16, 0.34],
          ]}
          radius={0.014}
          color={index % 2 ? "#8eb0ff" : "#dce8ff"}
          opacity={0.86}
          metalness={0}
          roughness={0.2}
        />
      ))}
    </group>
  );
}

function PreparationBay() {
  const alcoves = [-1.15, -0.75, -0.35, 0.05, 0.45, 0.85, 1.25];
  return (
    <group position={[-2.8, -0.25, -3.7]} rotation={[0, 0.32, 0]}>
      <mesh rotation={[0, -0.55, 0]} receiveShadow>
        <cylinderGeometry args={[4.6, 4.6, 3.1, 48, 1, true, -0.76, 1.52]} />
        <meshStandardMaterial
          color="#141a22"
          metalness={0.36}
          roughness={0.54}
          side={THREE.DoubleSide}
        />
      </mesh>
      {alcoves.map((angle, index) => {
        const x = Math.sin(angle) * 4.53;
        const z = Math.cos(angle) * 4.53;
        return (
          <group key={angle} position={[x, 0.15, z]} rotation={[0, angle, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.07, 2.35, 4, 10]} />
              <meshStandardMaterial color="#6c737c" metalness={0.68} roughness={0.3} />
            </mesh>
            {index % 2 === 0 ? (
              <mesh position={[0.17, 0.28, 0.04]} rotation={[0, 0, index % 3 ? 0.08 : -0.06]}>
                <planeGeometry args={[0.48, 1.14, 1, 5]} />
                <meshStandardMaterial
                  color={index === 2 ? "#254987" : "#303842"}
                  roughness={0.9}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ) : null}
          </group>
        );
      })}
      <mesh position={[0, -1.1, 1.15]} rotation={[Math.PI / 2, 0, 0.16]} castShadow>
        <torusGeometry args={[3.55, 0.16, 10, 72, 1.92]} />
        <meshStandardMaterial color="#22292f" roughness={0.72} />
      </mesh>
    </group>
  );
}

function StadiumReveal() {
  return (
    <group position={[0, -0.35, -18]}>
      {[0, 1, 2].map((tier) => (
        <mesh
          key={tier}
          position={[0, tier * 1.15, -tier * 0.3]}
          rotation={[0, Math.PI * 0.14, 0]}
        >
          <cylinderGeometry
            args={[11 + tier * 1.2, 9.2 + tier * 1.1, 1.1, 72, 1, true, 0.3, 2.54]}
          />
          <meshStandardMaterial
            color={tier === 1 ? "#1a315e" : "#141b27"}
            roughness={0.8}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[0, -1.18, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 22, 2, 6]} />
        <meshStandardMaterial color="#18261d" roughness={0.88} />
      </mesh>
      <group position={[-6.8, 5, 0.5]} rotation={[0, 0.22, 0]}>
        <LightStrip position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} length={4.3} />
        <LightStrip position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 2]} length={4.3} />
      </group>
      <group position={[6.8, 5.3, -1.2]} rotation={[0, -0.18, 0]}>
        <LightStrip position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} length={4.3} />
        <LightStrip position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 2]} length={4.3} />
      </group>
    </group>
  );
}

export function FootballWorld() {
  const archPositions = [8.5, 5.7, 2.9, 0.1, -2.7, -5.5];
  return (
    <group position={[0, -0.15, 0]}>
      <IrregularGround width={14} depth={35} color="#11161b" wet={0.42} />
      {archPositions.map((z, index) => (
        <ArchRib
          key={z}
          z={z}
          width={7.4 - index * 0.08}
          height={4.5 - index * 0.05}
          color={index % 2 ? "#3f4855" : "#58616c"}
        />
      ))}

      <SplineTube
        points={[
          [-3.4, 3.25, 9],
          [-3.2, 3.35, 3],
          [-2.65, 3.1, -3],
          [-2.2, 2.65, -8],
        ]}
        radius={0.07}
        color="#56616d"
      />
      <SplineTube
        points={[
          [-3.15, 3.45, 9],
          [-2.95, 3.52, 3],
          [-2.5, 3.28, -3],
          [-2.05, 2.82, -8],
        ]}
        radius={0.025}
        color="#8da4c8"
      />
      <SplineTube
        points={[
          [3.38, 0.25, 9],
          [3.12, 0.15, 2],
          [2.75, 0.35, -4],
          [2.25, 0.12, -9],
        ]}
        radius={0.055}
        color="#515962"
      />

      <LightStrip position={[0, 3.95, 6.6]} rotation={[0, 0, Math.PI / 2]} length={2.6} />
      <LightStrip position={[-1.3, 3.72, 1.3]} rotation={[0, 0, Math.PI / 2]} length={2.1} />
      <LightStrip
        position={[1.1, 3.48, -4.15]}
        rotation={[0, 0, Math.PI / 2]}
        length={2.1}
        color="#7498e8"
      />

      <PreparationBay />
      <TacticalTable />
      <StadiumReveal />
      <DustField count={210} spread={[12, 6, 28]} opacity={0.21} />
      <TargetedSpotLight
        world="football"
        position={[-2.8, 6, 5]}
        target={[0, 0, -2]}
        angle={0.42}
        penumbra={0.9}
        intensity={4.2}
        color="#b7d0ff"
      />
      <pointLight position={[2, 1.8, -13]} intensity={6} distance={12} color="#3c67c7" />
    </group>
  );
}
