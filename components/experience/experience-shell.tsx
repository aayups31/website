"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scrollRuntime, clamp } from "@/lib/scroll-runtime";
import {
  type QualityTier,
  type WorldId,
  useExperienceStore,
  worldOrder,
} from "@/lib/experience-store";
import { useProceduralAudio } from "@/lib/use-procedural-audio";
import { CinematicWorlds } from "./cinematic-worlds";

const chapterLinks: { id: WorldId; label: string; href: string }[] = [
  { id: "football", label: "Performance", href: "#performance" },
  { id: "racing", label: "Precision", href: "#precision" },
  { id: "music", label: "Music", href: "#music" },
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
  const stageReady = useExperienceStore((state) => state.stageReady);
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const quality = useExperienceStore((state) => state.quality);
  const soundEnabled = useExperienceStore((state) => state.soundEnabled);
  const setActiveWorld = useExperienceStore((state) => state.setActiveWorld);
  const setStageReady = useExperienceStore((state) => state.setStageReady);
  const setMotionReduced = useExperienceStore((state) => state.setMotionReduced);
  const setQuality = useExperienceStore((state) => state.setQuality);
  const stageRef = useRef<HTMLDivElement>(null);
  const measureFrameRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollRef = useRef({ y: 0, time: 0 });
  const targetRef = useRef({ local: 0.5, velocity: 0 });
  const smoothedRef = useRef({ local: 0.5, velocity: 0 });
  const measuredWorldRef = useRef<WorldId>("prologue");

  useProceduralAudio(soundEnabled, activeWorld);

  useLayoutEffect(() => {
    setStageReady(false);
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
      setStageReady(false);
      setActiveWorld("prologue");
      scrollRuntime.progress = 0;
      scrollRuntime.localProgress = 0;
      scrollRuntime.velocity = 0;
      scrollRuntime.world = "prologue";
      delete document.documentElement.dataset.world;
      delete document.documentElement.dataset.quality;
    };
  }, [setActiveWorld, setMotionReduced, setQuality, setStageReady]);

  useEffect(() => {
    window.localStorage.setItem("portfolio-motion", motionReduced ? "reduced" : "full");
    document.documentElement.dataset.motion = motionReduced ? "reduced" : "full";
  }, [motionReduced]);

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  useEffect(() => {
    const writeMotionVariables = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const local = smoothedRef.current.local;
      const velocity = smoothedRef.current.velocity;
      const travel = motionReduced ? 0 : local - 0.5;
      const velocityOffset = motionReduced ? 0 : clamp(velocity * 22, -18, 18);

      stage.style.setProperty("--world-progress", local.toFixed(4));
      stage.style.setProperty("--phase-intro", clamp(1 - local * 2.15).toFixed(4));
      stage.style.setProperty("--phase-middle", Math.sin(local * Math.PI).toFixed(4));
      stage.style.setProperty("--phase-outro", clamp((local - 0.48) * 2.05).toFixed(4));
      stage.style.setProperty(
        "--music-linkin",
        clamp(1 - Math.abs(local - 0.28) / 0.23).toFixed(4),
      );
      stage.style.setProperty(
        "--music-zimmer",
        clamp(1 - Math.abs(local - 0.5) / 0.2).toFixed(4),
      );
      stage.style.setProperty(
        "--music-michael",
        clamp((local - 0.58) / 0.16).toFixed(4),
      );
      stage.style.setProperty("--far-y", `${(travel * -26).toFixed(2)}px`);
      stage.style.setProperty("--middle-y", `${(travel * -52).toFixed(2)}px`);
      stage.style.setProperty("--near-y", `${(travel * -86).toFixed(2)}px`);
      stage.style.setProperty("--velocity-x", `${velocityOffset.toFixed(2)}px`);
      stage.style.setProperty("--velocity-x-reverse", `${(velocityOffset * -0.65).toFixed(2)}px`);
      stage.style.setProperty("--far-scale", (1.055 + local * 0.035).toFixed(4));
      stage.style.setProperty("--middle-scale", (1.04 + local * 0.055).toFixed(4));
      stage.style.setProperty("--near-scale", (1.025 + local * 0.075).toFixed(4));
    };

    const animate = () => {
      animationFrameRef.current = null;
      const target = targetRef.current;
      const smoothed = smoothedRef.current;
      const easing = motionReduced ? 1 : 0.105;
      smoothed.local += (target.local - smoothed.local) * easing;
      smoothed.velocity += (target.velocity - smoothed.velocity) * (motionReduced ? 1 : 0.16);
      target.velocity *= motionReduced ? 0 : 0.78;
      scrollRuntime.localProgress = smoothed.local;
      scrollRuntime.velocity = smoothed.velocity;
      writeMotionVariables();

      const unsettled =
        Math.abs(target.local - smoothed.local) > 0.0004 ||
        Math.abs(smoothed.velocity) > 0.001 ||
        Math.abs(target.velocity) > 0.001;
      if (unsettled) animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    const requestAnimation = () => {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      }
    };

    const measure = () => {
      measureFrameRef.current = null;
      const now = performance.now();
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const deltaY = scrollY - lastScrollRef.current.y;
      const deltaTime = lastScrollRef.current.time
        ? Math.max(16, now - lastScrollRef.current.time)
        : 16;
      scrollRuntime.progress = clamp(scrollY / maxScroll);
      targetRef.current.velocity = clamp(deltaY / deltaTime, -3, 3);
      lastScrollRef.current = { y: scrollY, time: now };

      const focusLine = window.innerHeight * 0.52;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(".cinematic-home > [data-world]"),
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
        const nextLocal = clamp(
          (focusLine - rect.top) / Math.max(1, rect.height),
        );
        targetRef.current.local = nextLocal;
        if (world !== measuredWorldRef.current) {
          measuredWorldRef.current = world;
          smoothedRef.current.local = nextLocal;
        }
        if (worldOrder.includes(world) && world !== useExperienceStore.getState().activeWorld) {
          setActiveWorld(world);
        }
      }
      requestAnimation();
    };

    const onScroll = () => {
      if (measureFrameRef.current === null) {
        measureFrameRef.current = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [motionReduced, setActiveWorld]);

  useEffect(() => {
    document.documentElement.dataset.world = activeWorld;
  }, [activeWorld]);

  return (
    <>
      <div
        ref={stageRef}
        className="experience-stage"
        data-ready={stageReady || undefined}
        aria-hidden="true"
      >
        {qualityReady ? (
          <CinematicWorlds />
        ) : (
          <div className="experience-fallback experience-fallback--loading" />
        )}
        <div className="stage-vignette" />
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
