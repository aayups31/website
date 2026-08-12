"use client";

import { useEffect, useRef } from "react";
import styles from "./automotive-home.module.css";

type EngineHoverRevealProps = {
  closedBase: string;
  openBase: string;
  reducedMotion?: boolean;
};

type PointerState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  reveal: number;
  targetReveal: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

function EnginePlate({ base }: { base: string }) {
  return (
    <picture className={styles.engineRevealPicture}>
      <source media="(max-width: 767px)" srcSet={`${base}-mobile.webp`} />
      <img
        src={`${base}-desktop.webp`}
        srcSet={`${base}-mobile.webp 1440w, ${base}-desktop.webp 2560w`}
        sizes="100vw"
        alt=""
        width={2560}
        height={1441}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}

export function EngineHoverReveal({
  closedBase,
  openBase,
  reducedMotion = false,
}: EngineHoverRevealProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const touchPinnedRef = useRef(false);
  const pointer = useRef<PointerState>({
    x: 0.5,
    y: 0.46,
    targetX: 0.5,
    targetY: 0.46,
    reveal: reducedMotion ? 0.72 : 0,
    targetReveal: reducedMotion ? 0.72 : 0,
  });

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const state = pointer.current;
    state.targetReveal = reducedMotion ? 0.72 : 0;
    let bounds = surface.getBoundingClientRect();
    let maxRadius =
      Math.min(bounds.width, bounds.height) * (window.innerWidth < 768 ? 0.255 : 0.225);
    const resizeObserver = new ResizeObserver(() => {
      bounds = surface.getBoundingClientRect();
      maxRadius =
        Math.min(bounds.width, bounds.height) * (window.innerWidth < 768 ? 0.255 : 0.225);
    });
    resizeObserver.observe(surface);

    const render = () => {
      frameRef.current = null;
      const positionEase = reducedMotion ? 1 : 0.16;
      const revealEase = reducedMotion ? 1 : state.targetReveal > state.reveal ? 0.13 : 0.18;

      state.x += (state.targetX - state.x) * positionEase;
      state.y += (state.targetY - state.y) * positionEase;
      state.reveal += (state.targetReveal - state.reveal) * revealEase;

      const radius = maxRadius * state.reveal;
      const tiltX = clamp((0.5 - state.y) * 5.2, -2.6, 2.6);
      const tiltY = clamp((state.x - 0.5) * 6.4, -3.2, 3.2);

      surface.style.setProperty("--engine-x", `${(state.x * 100).toFixed(3)}%`);
      surface.style.setProperty("--engine-y", `${(state.y * 100).toFixed(3)}%`);
      surface.style.setProperty("--engine-radius", `${radius.toFixed(2)}px`);
      surface.style.setProperty("--engine-reveal", state.reveal.toFixed(4));
      surface.style.setProperty("--engine-tilt-x", `${tiltX.toFixed(3)}deg`);
      surface.style.setProperty("--engine-tilt-y", `${tiltY.toFixed(3)}deg`);

      const moving =
        Math.abs(state.targetX - state.x) > 0.0005 ||
        Math.abs(state.targetY - state.y) > 0.0005 ||
        Math.abs(state.targetReveal - state.reveal) > 0.002;
      if (moving) frameRef.current = window.requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(render);
    };

    const locate = (event: PointerEvent) => {
      state.targetX = clamp((event.clientX - bounds.left) / bounds.width, 0.04, 0.96);
      state.targetY = clamp((event.clientY - bounds.top) / bounds.height, 0.06, 0.94);
      requestRender();
    };

    const enter = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "touch") return;
      locate(event);
      state.targetReveal = 1;
      surface.dataset.revealActive = "true";
      requestRender();
    };

    const move = (event: PointerEvent) => {
      if (reducedMotion) return;
      if (event.pointerType === "touch" && !touchPinnedRef.current) return;
      locate(event);
    };

    const leave = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "touch") return;
      state.targetReveal = 0;
      surface.dataset.revealActive = "false";
      requestRender();
    };

    const press = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "mouse") return;
      locate(event);
      touchPinnedRef.current = !touchPinnedRef.current;
      state.targetReveal = touchPinnedRef.current ? 1 : 0;
      surface.dataset.revealActive = touchPinnedRef.current ? "true" : "false";
      if (touchPinnedRef.current) surface.setPointerCapture(event.pointerId);
      requestRender();
    };

    const release = (event: PointerEvent) => {
      if (surface.hasPointerCapture(event.pointerId)) {
        surface.releasePointerCapture(event.pointerId);
      }
    };

    surface.addEventListener("pointerenter", enter);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", leave);
    surface.addEventListener("pointerdown", press);
    surface.addEventListener("pointerup", release);
    surface.addEventListener("pointercancel", release);
    requestRender();

    return () => {
      surface.removeEventListener("pointerenter", enter);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("pointerdown", press);
      surface.removeEventListener("pointerup", release);
      surface.removeEventListener("pointercancel", release);
      resizeObserver.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={surfaceRef}
      className={styles.engineReveal}
      data-engine-hover-reveal
      data-reveal-active={reducedMotion ? "true" : "false"}
    >
      <div className={styles.engineRevealPlate}>
        <div className={styles.engineRevealClosed}>
          <EnginePlate base={closedBase} />
        </div>
        <div className={styles.engineRevealOpen}>
          <EnginePlate base={openBase} />
        </div>
      </div>
      <span className={styles.engineRevealPrompt}>
        <span className={styles.engineRevealPromptPointer}>Move to inspect</span>
        <span className={styles.engineRevealPromptTouch}>Tap / drag to inspect</span>
      </span>
    </div>
  );
}
