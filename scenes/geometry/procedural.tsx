"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useExperienceStore } from "@/lib/experience-store";

type Vec3 = [number, number, number];

export function TargetedSpotLight({
  world,
  position,
  target,
  color,
  intensity,
  angle = 0.42,
  penumbra = 0.94,
}: {
  world: "football" | "racing" | "psychological" | "archive";
  position: Vec3;
  target: Vec3;
  color: string;
  intensity: number;
  angle?: number;
  penumbra?: number;
}) {
  const activeWorld = useExperienceStore((state) => state.activeWorld);
  const quality = useExperienceStore((state) => state.quality);
  const targetObject = useMemo(() => new THREE.Object3D(), []);
  const castsShadow = activeWorld === world && quality !== "low";
  const shadowSize = quality === "high" ? 1024 : 512;

  return (
    <>
      <primitive object={targetObject} position={target} />
      <spotLight
        position={position}
        target={targetObject}
        angle={angle}
        penumbra={penumbra}
        intensity={intensity}
        color={color}
        castShadow={castsShadow}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.00025}
      />
    </>
  );
}

export function SplineTube({
  points,
  color,
  radius = 0.035,
  opacity = 1,
  roughness = 0.45,
  metalness = 0.2,
}: {
  points: Vec3[];
  color: string;
  radius?: number;
  opacity?: number;
  roughness?: number;
  metalness?: number;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point)),
      false,
      "catmullrom",
      0.38,
    );
    return new THREE.TubeGeometry(curve, Math.max(32, points.length * 12), radius, 8, false);
  }, [points, radius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

export function ArchRib({
  z,
  width = 7,
  height = 4.8,
  color = "#59606b",
  emissive = "#000000",
}: {
  z: number;
  width?: number;
  height?: number;
  color?: string;
  emissive?: string;
}) {
  const points = useMemo<Vec3[]>(
    () => [
      [-width / 2, -1.2, z],
      [-width / 2, height * 0.34, z],
      [-width * 0.35, height * 0.82, z],
      [0, height, z],
      [width * 0.35, height * 0.82, z],
      [width / 2, height * 0.34, z],
      [width / 2, -1.2, z],
    ],
    [height, width, z],
  );

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point)),
      false,
      "catmullrom",
      0.22,
    );
    return new THREE.TubeGeometry(curve, 72, 0.12, 10, false);
  }, [points]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissive === "#000000" ? 0 : 0.8}
        metalness={0.56}
        roughness={0.32}
      />
    </mesh>
  );
}

export function IrregularGround({
  width = 18,
  depth = 28,
  color = "#15191c",
  wet = 0.25,
}: {
  width?: number;
  depth?: number;
  color?: string;
  wet?: number;
}) {
  const geometry = useMemo(() => {
    const ground = new THREE.PlaneGeometry(width, depth, 44, 64);
    ground.rotateX(-Math.PI / 2);
    const position = ground.attributes.position as THREE.BufferAttribute;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const z = position.getZ(index);
      const variation =
        Math.sin(x * 1.73 + z * 0.41) * 0.012 +
        Math.cos(z * 1.31 - x * 0.22) * 0.009;
      position.setY(index, variation);
    }
    ground.computeVertexNormals();
    return ground;
  }, [depth, width]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color={color}
        metalness={wet * 0.35}
        roughness={Math.max(0.24, 0.76 - wet)}
      />
    </mesh>
  );
}

export function LightStrip({
  position,
  rotation = [0, 0, 0],
  length = 3,
  color = "#d9e6ff",
  intensity = 2,
}: {
  position: Vec3;
  rotation?: Vec3;
  length?: number;
  color?: string;
  intensity?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <capsuleGeometry args={[0.045, Math.max(0.1, length - 0.09), 4, 14]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
          toneMapped={false}
        />
      </mesh>
      <pointLight color={color} intensity={intensity * 1.1} distance={5.5} decay={2} />
    </group>
  );
}

function makeCurvedPlane(width: number, height: number, curve: number) {
  const columns = 36;
  const rows = 12;
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let yIndex = 0; yIndex <= rows; yIndex += 1) {
    for (let xIndex = 0; xIndex <= columns; xIndex += 1) {
      const u = xIndex / columns;
      const v = yIndex / rows;
      const x = (u - 0.5) * width;
      const y = (v - 0.5) * height;
      const z = -curve * x * x;
      vertices.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let yIndex = 0; yIndex < rows; yIndex += 1) {
    for (let xIndex = 0; xIndex < columns; xIndex += 1) {
      const a = yIndex * (columns + 1) + xIndex;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function CurvedMediaSurface({
  source,
  position,
  rotation = [0, 0, 0],
  width = 5,
  height = 3,
  curve = 0.045,
  opacity = 0.9,
}: {
  source: string;
  position: Vec3;
  rotation?: Vec3;
  width?: number;
  height?: number;
  curve?: number;
  opacity?: number;
}) {
  const texture = useTexture(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const geometry = useMemo(
    () => makeCurvedPlane(width, height, curve),
    [curve, height, width],
  );

  return (
    <mesh geometry={geometry} position={position} rotation={rotation}>
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

export function DustField({
  count = 180,
  spread = [10, 6, 14],
  color = "#c8d6ee",
  opacity = 0.24,
}: {
  count?: number;
  spread?: Vec3;
  color?: string;
  opacity?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    let seed = 9187;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let index = 0; index < count; index += 1) {
      data[index * 3] = (random() - 0.5) * spread[0];
      data[index * 3 + 1] = (random() - 0.5) * spread[1] + 1.5;
      data[index * 3 + 2] = (random() - 0.5) * spread[2];
    }
    return data;
  }, [count, spread]);

  useFrame((_, delta) => {
    if (pointsRef.current && !motionReduced) pointsRef.current.rotation.y += delta * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.018}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

export function ProjectionBeam({
  position,
  rotation = [0, 0, 0],
  color = "#dce8ff",
  length = 7,
}: {
  position: Vec3;
  rotation?: Vec3;
  color?: string;
  length?: number;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[2.1, length, 36, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.045}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
