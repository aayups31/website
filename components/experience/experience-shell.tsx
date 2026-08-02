"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SceneCanvas } from "@/scenes/core/scene-canvas";
import { scrollRuntime, clamp } from "@/scenes/core/scroll-runtime";
import {
  type QualityTier,
  type WorldId,
  useExperienceStore,
  worldOrder,
} from "@/lib/experience-store";
import { useProceduralAudio } from "@/lib/use-procedural-audio";
import { WebGLBoundary } from "./webgl-boundary";

const chapterLinks: { id: WorldId; label: string; href: string }[] = [
  { id: "football", label: "Performance", href: "#performance" },
  { id: "racing", label: "Precision", href: "#precision" },
  { id: "psychological", label: "Perspective", href: "#perspective" },
  { id: "archive", label: "Image", href: "#image" },
  { id: "contact", label: "Contact", href: "#signal" },
];

function detectQuality(): QualityTier {
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const smallViewport = window.matchMedia("(max-width: 760px)").matches;
  if (smallViewport || deviceMemory <= 4 || cores <= 4) return "low";
  if (deviceMemory >= 8 && cores >= 8 && window.devicePixelRatio <= 2) return "high";
  return "medium";
}

export function ExperienceShell() {
  const [qualityReady, setQualityReady] = useState(false);
  const activeWorld = useExperienceStore((state) => state.activeWorld);
  const canvasReady = useExperienceStore((state) => state.canvasReady);
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const quality = useExperienceStore((state) => state.quality);
  const soundEnabled = useExperienceStore((state) => state.soundEnabled);
  const setActiveWorld = useExperienceStore((state) => state.setActiveWorld);
  const setCanvasReady = useExperienceStore((state) => state.setCanvasReady);
  const setMotionReduced = useExperienceStore((state) => state.setMotionReduced);
  const setQuality = useExperienceStore((state) => state.setQuality);
  const frameRef = useRef<number | null>(null);
  const lastScrollRef = useRef({ y: 0, time: performance.now() });

  useProceduralAudio(soundEnabled, activeWorld);

  useLayoutEffect(() => {
    setCanvasReady(false);
    setActiveWorld("prologue");
    scrollRuntime.progress = 0;
    scrollRuntime.localProgress = 0;
    scrollRuntime.velocity = 0;
    scrollRuntime.world = "prologue";

    const savedMotion = window.localStorage.getItem("portfolio-motion");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotionReduced(savedMotion ? savedMotion === "reduced" : prefersReduced);
    setQuality(detectQuality());
    setQualityReady(true);

    return () => {
      setCanvasReady(false);
      setActiveWorld("prologue");
      scrollRuntime.progress = 0;
      scrollRuntime.localProgress = 0;
      scrollRuntime.velocity = 0;
      scrollRuntime.world = "prologue";
      delete document.documentElement.dataset.world;
      delete document.documentElement.dataset.quality;
    };
  }, [setActiveWorld, setCanvasReady, setMotionReduced, setQuality]);

  useEffect(() => {
    window.localStorage.setItem("portfolio-motion", motionReduced ? "reduced" : "full");
    document.documentElement.dataset.motion = motionReduced ? "reduced" : "full";
  }, [motionReduced]);

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      const now = performance.now();
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const deltaY = scrollY - lastScrollRef.current.y;
      const deltaTime = Math.max(16, now - lastScrollRef.current.time);
      scrollRuntime.progress = clamp(scrollY / maxScroll);
      scrollRuntime.velocity = deltaY / deltaTime;
      lastScrollRef.current = { y: scrollY, time: now };

      const focusLine = window.innerHeight * 0.52;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-world]"),
      );
      let selected = sections[0];
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const containsFocus = rect.top <= focusLine && rect.bottom >= focusLine;
        const distance = containsFocus
          ? 0
          : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
        if (distance < nearestDistance) {
          selected = section;
          nearestDistance = distance;
        }
      }

      if (selected) {
        const rect = selected.getBoundingClientRect();
        const world = selected.dataset.world as WorldId;
        scrollRuntime.world = world;
        scrollRuntime.localProgress = clamp(
          (focusLine - rect.top) / Math.max(1, rect.height),
        );
        if (worldOrder.includes(world) && world !== useExperienceStore.getState().activeWorld) {
          setActiveWorld(world);
        }
      }
    };

    const onScroll = () => {
      if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [setActiveWorld]);

  useEffect(() => {
    document.documentElement.dataset.world = activeWorld;
  }, [activeWorld]);

  return (
    <>
      <div
        className="experience-canvas"
        data-ready={canvasReady || undefined}
        aria-hidden="true"
      >
        {qualityReady ? (
          <WebGLBoundary>
            <SceneCanvas />
          </WebGLBoundary>
        ) : (
          <div className="experience-fallback experience-fallback--loading" />
        )}
        <div className="canvas-vignette" />
        <div className="transition-veil" />
      </div>

      <aside className="chapter-rail" aria-label="Experience chapters">
        <span className="chapter-rail__index">
          {String(
            Math.max(1, chapterLinks.findIndex((chapter) => chapter.id === activeWorld) + 1),
          ).padStart(2, "0")}
        </span>
        <nav>
          {chapterLinks.map((chapter) => (
            <a
              key={chapter.id}
              href={chapter.href}
              aria-current={activeWorld === chapter.id ? "step" : undefined}
            >
              <span>{chapter.label}</span>
              <i aria-hidden="true" />
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
