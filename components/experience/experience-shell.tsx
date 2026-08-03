"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scrollRuntime, clamp, smoothstep } from "@/lib/scroll-runtime";
import {
  cinematicTimelines,
  getShotState,
  getWorldCamera,
} from "@/lib/cinematic-timelines";
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
  const lastAnimationTimeRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, time: 0 });
  const targetRef = useRef({
    local: 0.5,
    beat: 0.5,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const smoothedRef = useRef({
    local: 0.5,
    beat: 0.5,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
  });
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
      const beatTrack = smoothedRef.current.beat;
      const velocity = smoothedRef.current.velocity;
      const pointerX = motionReduced ? 0 : smoothedRef.current.pointerX;
      const pointerY = motionReduced ? 0 : smoothedRef.current.pointerY;
      const world = scrollRuntime.world;
      const timeline = cinematicTimelines[world];
      const motionAmplitude = motionReduced ? 0 : quality === "low" ? 0.55 : 1;
      const travel = motionReduced ? 0 : local - 0.5;
      const velocityOffset = motionReduced ? 0 : clamp(velocity * 22, -18, 18);
      const safeBeatTrack = clamp(beatTrack, 0, timeline.beatCount);
      const beatIndex = Math.min(
        timeline.beatCount - 1,
        Math.floor(Math.max(0, safeBeatTrack - (safeBeatTrack === timeline.beatCount ? 0.0001 : 0))),
      );
      const beatProgress = clamp(safeBeatTrack - beatIndex);
      const camera = getWorldCamera(world, local, motionAmplitude);

      stage.style.setProperty("--world-progress", local.toFixed(4));
      stage.style.setProperty("--section-p", local.toFixed(4));
      stage.style.setProperty("--beat-track", safeBeatTrack.toFixed(4));
      stage.style.setProperty("--beat-index", String(beatIndex));
      stage.style.setProperty("--beat-p", beatProgress.toFixed(4));
      stage.style.setProperty("--beat-enter", smoothstep(0, 0.18, beatProgress).toFixed(4));
      stage.style.setProperty(
        "--beat-exit",
        (1 - smoothstep(0.78, 1, beatProgress)).toFixed(4),
      );
      stage.style.setProperty("--scroll-v", velocity.toFixed(4));
      stage.style.setProperty("--scroll-speed", Math.abs(velocity).toFixed(4));
      stage.style.setProperty("--pointer-x", pointerX.toFixed(4));
      stage.style.setProperty("--pointer-y", pointerY.toFixed(4));
      stage.style.setProperty("--pointer-camera-x", `${(pointerX * 1.8).toFixed(3)}deg`);
      stage.style.setProperty("--pointer-camera-y", `${(pointerY * -1.35).toFixed(3)}deg`);
      stage.style.setProperty("--cam-x", `${camera.x.toFixed(3)}vw`);
      stage.style.setProperty("--cam-y", `${camera.y.toFixed(3)}vh`);
      stage.style.setProperty("--cam-scale", camera.scale.toFixed(5));
      stage.style.setProperty("--cam-rx", `${camera.rotateX.toFixed(3)}deg`);
      stage.style.setProperty("--cam-ry", `${camera.rotateY.toFixed(3)}deg`);
      stage.style.setProperty("--cam-rz", `${camera.rotateZ.toFixed(3)}deg`);
      stage.style.setProperty("--cam-origin-x", `${camera.originX.toFixed(2)}%`);
      stage.style.setProperty("--cam-origin-y", `${camera.originY.toFixed(2)}%`);
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

      stage.dataset.cameraWorld = world;
      stage.dataset.cameraBeat = String(beatIndex);

      const shots = stage.querySelectorAll<HTMLElement>(
        `[data-cinematic-world="${world}"] [data-cinematic-shot]`,
      );
      for (const shot of shots) {
        const shotId = shot.dataset.cinematicShot;
        if (!shotId) continue;
        const state = getShotState(
          world,
          shotId,
          safeBeatTrack,
          motionAmplitude,
          motionReduced,
        );
        if (!state) continue;

        const depth = shot.dataset.depth === "near"
          ? 1
          : shot.dataset.depth === "middle"
            ? 0.68
            : 0.38;
        const pointerDepth = motionReduced ? 0 : depth;
        const velocityTravel = motionReduced
          ? 0
          : clamp(velocity * 3.4 * depth, -7, 7);

        shot.style.opacity = state.opacity.toFixed(4);
        shot.style.setProperty("--shot-opacity", state.opacity.toFixed(4));
        shot.style.setProperty("--shot-p", state.progress.toFixed(4));
        shot.style.setProperty("--shot-x", `${state.frame.x.toFixed(3)}vw`);
        shot.style.setProperty("--shot-y", `${state.frame.y.toFixed(3)}vh`);
        shot.style.setProperty("--shot-scale", state.frame.scale.toFixed(5));
        shot.style.setProperty("--shot-rx", `${state.frame.rotateX.toFixed(3)}deg`);
        shot.style.setProperty("--shot-ry", `${state.frame.rotateY.toFixed(3)}deg`);
        shot.style.setProperty("--shot-rz", `${state.frame.rotateZ.toFixed(3)}deg`);
        shot.style.setProperty("--shot-origin-x", `${state.frame.originX.toFixed(2)}%`);
        shot.style.setProperty("--shot-origin-y", `${state.frame.originY.toFixed(2)}%`);
        shot.style.setProperty(
          "--shot-pointer-x",
          `${(pointerX * 1.8 * pointerDepth).toFixed(3)}vw`,
        );
        shot.style.setProperty(
          "--shot-pointer-y",
          `${(pointerY * 1.3 * pointerDepth).toFixed(3)}vh`,
        );
        shot.style.setProperty("--shot-velocity-x", `${velocityTravel.toFixed(3)}vw`);
        if (state.opacity > 0.01) shot.dataset.active = "true";
        else delete shot.dataset.active;
      }
    };

    const animate = (time: number) => {
      const previousTime = lastAnimationTimeRef.current || time - 16.67;
      const deltaSeconds = clamp((time - previousTime) / 1000, 1 / 240, 0.05);
      lastAnimationTimeRef.current = time;
      const target = targetRef.current;
      const smoothed = smoothedRef.current;
      const easing = motionReduced ? 1 : 1 - Math.exp(-deltaSeconds * 8.5);
      const velocityEasing = motionReduced ? 1 : 1 - Math.exp(-deltaSeconds * 11);
      const pointerEasing = motionReduced ? 1 : 1 - Math.exp(-deltaSeconds * 7.5);
      smoothed.local += (target.local - smoothed.local) * easing;
      smoothed.beat += (target.beat - smoothed.beat) * easing;
      smoothed.velocity += (target.velocity - smoothed.velocity) * velocityEasing;
      smoothed.pointerX += (target.pointerX - smoothed.pointerX) * pointerEasing;
      smoothed.pointerY += (target.pointerY - smoothed.pointerY) * pointerEasing;
      target.velocity *= motionReduced ? 0 : Math.exp(-deltaSeconds * 10);
      scrollRuntime.localProgress = smoothed.local;
      scrollRuntime.velocity = smoothed.velocity;
      writeMotionVariables();

      const unsettled =
        Math.abs(target.local - smoothed.local) > 0.0004 ||
        Math.abs(target.beat - smoothed.beat) > 0.0004 ||
        Math.abs(smoothed.velocity) > 0.001 ||
        Math.abs(target.velocity) > 0.001 ||
        Math.abs(target.pointerX - smoothed.pointerX) > 0.0004 ||
        Math.abs(target.pointerY - smoothed.pointerY) > 0.0004;
      if (unsettled) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        lastAnimationTimeRef.current = 0;
      }
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
        ? Math.max(8, now - lastScrollRef.current.time)
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
        const beatElements = Array.from(
          selected.querySelectorAll<HTMLElement>(
            ":scope > .world-intro, :scope > .world-beat, :scope > .world-closing",
          ),
        );
        const beats = beatElements.length > 0 ? beatElements : [selected];
        let selectedBeat = beats[0];
        let selectedBeatIndex = 0;
        let nearestBeatDistance = Number.POSITIVE_INFINITY;
        for (const [index, beat] of beats.entries()) {
          const beatRect = beat.getBoundingClientRect();
          const containsFocus = beatRect.top <= focusLine && beatRect.bottom >= focusLine;
          const distance = containsFocus
            ? 0
            : Math.min(
                Math.abs(beatRect.top - focusLine),
                Math.abs(beatRect.bottom - focusLine),
              );
          if (distance < nearestBeatDistance) {
            selectedBeat = beat;
            selectedBeatIndex = index;
            nearestBeatDistance = distance;
          }
        }
        const selectedBeatRect = selectedBeat.getBoundingClientRect();
        const selectedBeatProgress = clamp(
          (focusLine - selectedBeatRect.top) / Math.max(1, selectedBeatRect.height),
        );
        const configuredBeatCount = cinematicTimelines[world].beatCount;
        const nextBeatTrack =
          ((selectedBeatIndex + selectedBeatProgress) / beats.length) * configuredBeatCount;
        targetRef.current.local = nextLocal;
        targetRef.current.beat = nextBeatTrack;
        if (world !== measuredWorldRef.current) {
          measuredWorldRef.current = world;
          smoothedRef.current.local = nextLocal;
          smoothedRef.current.beat = nextBeatTrack;
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

    const onPointerMove = (event: PointerEvent) => {
      if (motionReduced || event.pointerType === "touch") return;
      targetRef.current.pointerX = clamp(
        (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
        -1,
        1,
      );
      targetRef.current.pointerY = clamp(
        (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1,
        -1,
        1,
      );
      requestAnimation();
    };

    const onPointerLeave = () => {
      targetRef.current.pointerX = 0;
      targetRef.current.pointerY = 0;
      requestAnimation();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastAnimationTimeRef.current = 0;
    };
  }, [motionReduced, quality, setActiveWorld]);

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
