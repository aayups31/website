"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type EngineModelHandle = {
  update: (progress: number) => void;
};

type EngineModelProps = {
  className?: string;
  enabled?: boolean;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function disposeObject(object: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    const childMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    childMaterials.forEach((material) => materials.add(material));
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function createPipe(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 32, radius, 10, false),
    material,
  );
}

function createEngineAssembly() {
  const engine = new THREE.Group();

  const graphite = new THREE.MeshStandardMaterial({
    color: 0x101419,
    metalness: 0.88,
    roughness: 0.27,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x242a31,
    metalness: 0.94,
    roughness: 0.2,
  });
  const alloy = new THREE.MeshStandardMaterial({
    color: 0x9aa4ab,
    metalness: 0.96,
    roughness: 0.17,
  });
  const titanium = new THREE.MeshStandardMaterial({
    color: 0x6e7881,
    metalness: 1,
    roughness: 0.13,
  });
  const blue = new THREE.MeshPhysicalMaterial({
    color: 0x255fa8,
    metalness: 0.76,
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.16,
  });
  const red = new THREE.MeshStandardMaterial({
    color: 0xd82b22,
    emissive: 0x4b0503,
    emissiveIntensity: 0.22,
    metalness: 0.7,
    roughness: 0.24,
  });

  const block = new THREE.Mesh(
    new RoundedBoxGeometry(5.6, 1.55, 1.75, 5, 0.18),
    graphite,
  );
  block.position.y = -0.2;
  engine.add(block);

  const head = new THREE.Mesh(
    new RoundedBoxGeometry(5.25, 0.78, 1.5, 5, 0.2),
    darkMetal,
  );
  head.position.y = 0.84;
  engine.add(head);

  const camCover = new THREE.Mesh(
    new RoundedBoxGeometry(4.85, 0.48, 1.18, 6, 0.2),
    blue,
  );
  camCover.position.set(-0.08, 1.45, 0);
  engine.add(camCover);

  const frontPlate = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 1.78, 1.58, 4, 0.12),
    alloy,
  );
  frontPlate.position.set(2.88, 0.05, 0);
  engine.add(frontPlate);

  const pulleyMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0b0d,
    metalness: 0.85,
    roughness: 0.28,
  });
  [
    { y: 0.56, z: 0.48, r: 0.38 },
    { y: -0.2, z: 0.54, r: 0.48 },
    { y: -0.65, z: -0.34, r: 0.3 },
  ].forEach(({ y, z, r }) => {
    const pulley = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.18, 32),
      pulleyMaterial,
    );
    pulley.rotation.z = Math.PI / 2;
    pulley.position.set(3.14, y, z);
    engine.add(pulley);
  });

  const intake = new THREE.Group();
  for (let index = 0; index < 6; index += 1) {
    const x = -2.05 + index * 0.82;
    const runner = createPipe(
      [
        new THREE.Vector3(x, 0.75, 0.72),
        new THREE.Vector3(x, 0.54, 1.16),
        new THREE.Vector3(x + 0.08, 0.12, 1.62),
      ],
      0.115,
      alloy,
    );
    intake.add(runner);

    const trumpet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.12, 0.36, 20, 1, true),
      titanium,
    );
    trumpet.rotation.x = Math.PI / 2;
    trumpet.position.set(x + 0.08, 0.12, 1.8);
    intake.add(trumpet);
  }
  engine.add(intake);

  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 4.72, 18),
    red,
  );
  rail.rotation.z = Math.PI / 2;
  rail.position.set(-0.1, 1.03, 1.02);
  engine.add(rail);

  const turboGroup = new THREE.Group();
  [-1.15, 1.05].forEach((x) => {
    const turbine = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.18, 16, 36),
      titanium,
    );
    turbine.rotation.y = Math.PI / 2;
    turbine.position.set(x, -0.45, -1.18);
    turboGroup.add(turbine);

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.38, 24),
      darkMetal,
    );
    core.rotation.z = Math.PI / 2;
    core.position.copy(turbine.position);
    turboGroup.add(core);
  });
  engine.add(turboGroup);

  engine.add(
    createPipe(
      [
        new THREE.Vector3(-1.15, -0.45, -1.18),
        new THREE.Vector3(-0.3, -0.86, -1.44),
        new THREE.Vector3(1.05, -0.45, -1.18),
      ],
      0.18,
      darkMetal,
    ),
  );
  engine.add(
    createPipe(
      [
        new THREE.Vector3(1.05, -0.45, -1.18),
        new THREE.Vector3(2.3, -0.18, -1.22),
        new THREE.Vector3(2.58, 0.62, -0.72),
      ],
      0.21,
      alloy,
    ),
  );

  const flywheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.88, 0.32, 48),
    darkMetal,
  );
  flywheel.rotation.z = Math.PI / 2;
  flywheel.position.set(-3.02, -0.26, 0);
  engine.add(flywheel);

  const support = new THREE.Mesh(
    new THREE.TorusGeometry(3.75, 0.014, 6, 96),
    new THREE.MeshBasicMaterial({
      color: 0x71849a,
      transparent: true,
      opacity: 0.33,
    }),
  );
  support.rotation.x = Math.PI / 2.25;
  support.position.z = -0.8;
  engine.add(support);

  engine.rotation.set(-0.08, -0.3, -0.02);
  return { engine, intake, turboGroup };
}

export const EngineModel = forwardRef<EngineModelHandle, EngineModelProps>(
  function EngineModel({ className, enabled = true }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const updateRef = useRef<(progress: number) => void>(() => undefined);

    useImperativeHandle(ref, () => ({
      update: (progress) => updateRef.current(progress),
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      updateRef.current = () => undefined;
      if (!enabled) {
        canvas.dataset.webgl = "disabled";
        return;
      }

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: window.devicePixelRatio <= 1.5,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        });
      } catch {
        canvas.dataset.webgl = "unavailable";
        return;
      }

      canvas.dataset.webgl = "ready";
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
      camera.position.set(0, 0.65, 10.8);

      const assembly = createEngineAssembly();
      scene.add(assembly.engine);

      const key = new THREE.SpotLight(0xd7e8ff, 78, 30, Math.PI / 4, 0.7, 1.2);
      key.position.set(-5, 6, 8);
      scene.add(key);
      const edge = new THREE.SpotLight(0x397dcc, 64, 28, Math.PI / 4.5, 0.75, 1.1);
      edge.position.set(5, 1, -4);
      scene.add(edge);
      const ember = new THREE.PointLight(0xef392b, 34, 18, 1.4);
      ember.position.set(1, -2, 4);
      scene.add(ember);
      scene.add(new THREE.AmbientLight(0x8590a0, 0.62));

      let targetProgress = 0;
      let animationFrame: number | null = null;
      let introStart = performance.now();
      let introComplete = false;
      let contextAvailable = true;
      let disposed = false;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const render = (now: number) => {
        animationFrame = null;
        if (disposed || !contextAvailable || document.hidden) return;

        const introProgress = reduceMotion
          ? 1
          : clamp((now - introStart) / 2200);
        introComplete = introProgress >= 1;
        const easedIntro = 1 - Math.pow(1 - introProgress, 4);
        // ScrollTrigger already supplies an eased, frame-synchronised value.
        // Rendering that value directly prevents a second lagging interpolation
        // from making the model trail the rest of the scene.
        const progress = targetProgress;
        assembly.engine.rotation.y = -0.58 + easedIntro * 0.36 + progress * 0.88;
        assembly.engine.rotation.x = -0.12 + progress * 0.18;
        assembly.engine.rotation.z = -0.04 + progress * 0.06;
        assembly.engine.position.y = -0.12 + Math.sin(progress * Math.PI) * 0.16;
        assembly.intake.rotation.x = Math.sin(progress * Math.PI * 2) * 0.025;
        assembly.turboGroup.rotation.z = progress * 0.12;
        camera.position.z = 12.8 - easedIntro * 2.1 - progress * 2.2;
        camera.position.x = -0.7 + progress * 1.3;
        camera.position.y = 0.95 - progress * 0.58;
        camera.lookAt(0, 0.2, 0);
        ember.intensity = 20 + progress * 38;
        renderer.render(scene, camera);

        if (!introComplete) {
          animationFrame = window.requestAnimationFrame(render);
        }
      };

      const schedule = () => {
        if (
          !disposed &&
          contextAvailable &&
          !document.hidden &&
          animationFrame === null
        ) {
          animationFrame = window.requestAnimationFrame(render);
        }
      };

      updateRef.current = (progress) => {
        targetProgress = clamp(Number.isFinite(progress) ? progress : 0);
        schedule();
      };

      const handleContextLost = (event: Event) => {
        event.preventDefault();
        contextAvailable = false;
        canvas.dataset.webgl = "context-lost";
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      };

      const handleContextRestored = () => {
        contextAvailable = true;
        canvas.dataset.webgl = "ready";
        resize();
        schedule();
      };

      const handleVisibility = () => {
        if (!document.hidden) schedule();
      };

      const observer = new ResizeObserver(() => {
        resize();
        schedule();
      });
      observer.observe(canvas);
      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("resize", resize, { passive: true });
      resize();
      introStart = performance.now();
      schedule();

      return () => {
        disposed = true;
        observer.disconnect();
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener("webglcontextrestored", handleContextRestored);
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("resize", resize);
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        updateRef.current = () => undefined;
        disposeObject(assembly.engine);
        renderer.dispose();
      };
    }, [enabled]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        data-engine-model
        data-webgl={enabled ? undefined : "disabled"}
        aria-hidden="true"
      />
    );
  },
);
