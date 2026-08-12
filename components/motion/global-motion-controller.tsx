"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useExperienceStore } from "@/lib/experience-store";

const HOOK_SELECTOR = [
  "[data-motion-reveal]",
  "[data-reveal]",
  "[data-motion-progress]",
  "[data-scroll-shot]",
  "[data-motion-parallax]",
  "[data-parallax]",
  "[data-motion-section]",
  "[data-motion-magnetic]",
  "[data-magnetic]",
  ".kinetic-heading",
].join(",");

const PROGRESS_SELECTOR = [
  "[data-motion-progress]",
  "[data-scroll-shot]",
  "[data-motion-parallax]",
  "[data-parallax]",
  "[data-motion-section]",
  ".kinetic-heading",
].join(",");

const MAGNETIC_SELECTOR = [
  "[data-motion-magnetic]:not(a):not(.kinetic-heading)",
  "[data-magnetic]:not(a):not(.kinetic-heading)",
].join(",");

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function resetMagneticElement(element: HTMLElement | null) {
  if (!element) return;
  delete element.dataset.motionActive;
  element.style.setProperty("--magnetic-x", "0px");
  element.style.setProperty("--magnetic-y", "0px");
  element.style.setProperty("--pointer-local-x", "0.5");
  element.style.setProperty("--pointer-local-y", "0.5");
}

/**
 * A single read/write loop for route-wide scroll, reveal, parallax, and magnetic
 * hooks. Route components stay server rendered and opt in with data attributes.
 */
export function GlobalMotionController() {
  const pathname = usePathname();
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const setMotionReduced = useExperienceStore((state) => state.setMotionReduced);

  useEffect(() => {
    const root = document.documentElement;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyPreference = (reduced: boolean) => {
      setMotionReduced(reduced);
      root.dataset.motion = reduced ? "reduced" : "full";
    };

    const savedPreference = window.localStorage.getItem("portfolio-motion");
    applyPreference(
      savedPreference === "reduced" ||
        (savedPreference !== "full" && motionQuery.matches),
    );

    const onSystemPreference = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem("portfolio-motion") === null) {
        applyPreference(event.matches);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "portfolio-motion") return;
      applyPreference(
        event.newValue === "reduced" ||
          (event.newValue !== "full" && motionQuery.matches),
      );
    };

    motionQuery.addEventListener("change", onSystemPreference);
    window.addEventListener("storage", onStorage);
    const readyFrame = window.requestAnimationFrame(() => {
      root.classList.add("motion-ready");
      root.dataset.motionReady = "true";
    });

    return () => {
      window.cancelAnimationFrame(readyFrame);
      motionQuery.removeEventListener("change", onSystemPreference);
      window.removeEventListener("storage", onStorage);
      root.classList.remove("motion-ready");
      delete root.dataset.motionReady;
    };
  }, [setMotionReduced]);

  useEffect(() => {
    document.documentElement.dataset.motion = motionReduced ? "reduced" : "full";
  }, [motionReduced]);

  useEffect(() => {
    // The automotive homepage owns a single GSAP/Lenis render loop. Keeping the
    // route-wide observer active there would introduce a competing scroll loop
    // and re-animate typography independently of the vehicle choreography.
    if (pathname === "/") return;

    const root = document.documentElement;
    const observedElements = new Set<HTMLElement>();
    const visibleProgressElements = new Set<HTMLElement>();
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let finePointer = finePointerQuery.matches;
    let activeMagnetic: HTMLElement | null = null;
    let animationFrame: number | null = null;
    let scrollY = window.scrollY;
    let previousScrollY = scrollY;
    let previousScrollTime = performance.now();
    let targetVelocity = 0;
    let renderedVelocity = 0;

    const updateLocalProgress = () => {
      const viewportHeight = Math.max(1, window.innerHeight);
      for (const element of visibleProgressElements) {
        if (!element.isConnected) {
          visibleProgressElements.delete(element);
          continue;
        }
        const rect = element.getBoundingClientRect();
        const progress = clamp(
          (viewportHeight - rect.top) / Math.max(1, viewportHeight + rect.height),
        );
        const centered = clamp(
          (viewportHeight * 0.5 - rect.top) / Math.max(1, rect.height),
        );
        element.style.setProperty("--section-progress", progress.toFixed(4));
        element.style.setProperty("--section-centered-progress", centered.toFixed(4));
        element.style.setProperty("--type-progress", progress.toFixed(4));
        element.style.setProperty("--texture-position", `${(progress * 100).toFixed(2)}%`);

        const parallaxValue =
          element.dataset.motionParallax ?? element.dataset.parallax;
        const parsedParallax = Number(parallaxValue);
        const parallaxStrength = Number.isFinite(parsedParallax) && parallaxValue !== ""
          ? parsedParallax
          : 0;
        element.style.setProperty(
          "--parallax-y",
          `${((0.5 - progress) * parallaxStrength * viewportHeight).toFixed(2)}px`,
        );
      }
    };

    const render = () => {
      animationFrame = null;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      if (motionReduced) {
        targetVelocity = 0;
        renderedVelocity = 0;
      } else {
        renderedVelocity += (targetVelocity - renderedVelocity) * 0.18;
        targetVelocity *= 0.78;
      }

      root.style.setProperty("--page-scroll", clamp(scrollY / maxScroll).toFixed(5));
      root.style.setProperty("--page-progress", clamp(scrollY / maxScroll).toFixed(5));
      root.style.setProperty("--scroll-progress", clamp(scrollY / maxScroll).toFixed(5));
      root.style.setProperty("--scroll-y", `${scrollY.toFixed(2)}px`);
      root.style.setProperty("--scroll-velocity", renderedVelocity.toFixed(4));
      root.style.setProperty(
        "--scroll-velocity-px",
        `${clamp(renderedVelocity * 18, -24, 24).toFixed(2)}px`,
      );
      updateLocalProgress();

      if (
        !motionReduced &&
        (Math.abs(targetVelocity) > 0.001 || Math.abs(renderedVelocity) > 0.001)
      ) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const requestRender = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const onScroll = () => {
      const now = performance.now();
      scrollY = window.scrollY;
      const deltaTime = Math.max(16, now - previousScrollTime);
      targetVelocity = motionReduced
        ? 0
        : clamp((scrollY - previousScrollY) / deltaTime, -3, 3);
      previousScrollY = scrollY;
      previousScrollTime = now;
      requestRender();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const isProgressElement = element.matches(PROGRESS_SELECTOR);
          if (entry.isIntersecting) {
            element.dataset.motionInView = "true";
            if (isProgressElement) visibleProgressElements.add(element);
          } else {
            if (
              element.hasAttribute("data-motion-repeat") ||
              element.hasAttribute("data-reveal-repeat")
            ) {
              delete element.dataset.motionInView;
            }
            if (isProgressElement) visibleProgressElements.delete(element);
          }
        }
        requestRender();
      },
      { rootMargin: "12% 0px 12%", threshold: [0, 0.01, 0.5, 1] },
    );

    const observeElement = (element: HTMLElement) => {
      if (observedElements.has(element)) return;
      observedElements.add(element);
      observer.observe(element);
    };

    const discoverHooks = (scope: ParentNode) => {
      if (scope instanceof HTMLElement && scope.matches(HOOK_SELECTOR)) {
        observeElement(scope);
      }
      scope
        .querySelectorAll<HTMLElement>(HOOK_SELECTOR)
        .forEach((element) => observeElement(element));
    };

    discoverHooks(document);

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) discoverHooks(node);
        }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const onPointerMove = (event: PointerEvent) => {
      if (motionReduced || !finePointer) return;
      root.style.setProperty("--pointer-x", `${event.clientX.toFixed(2)}px`);
      root.style.setProperty("--pointer-y", `${event.clientY.toFixed(2)}px`);
      root.style.setProperty(
        "--pointer-nx",
        clamp(event.clientX / Math.max(1, window.innerWidth)).toFixed(4),
      );
      root.style.setProperty(
        "--pointer-ny",
        clamp(event.clientY / Math.max(1, window.innerHeight)).toFixed(4),
      );

      const eventTarget = event.target instanceof Element ? event.target : null;
      const magnetic = eventTarget?.closest<HTMLElement>(MAGNETIC_SELECTOR) ?? null;
      if (activeMagnetic !== magnetic) {
        resetMagneticElement(activeMagnetic);
        activeMagnetic = magnetic;
      }
      if (!magnetic) return;

      const rect = magnetic.getBoundingClientRect();
      const localX = clamp((event.clientX - rect.left) / Math.max(1, rect.width));
      const localY = clamp((event.clientY - rect.top) / Math.max(1, rect.height));
      const offsetX = clamp(localX * 2 - 1, -1, 1);
      const offsetY = clamp(localY * 2 - 1, -1, 1);
      const configuredStrength = Number(magnetic.dataset.magneticStrength);
      const strength = Number.isFinite(configuredStrength) && configuredStrength > 0
        ? Math.min(configuredStrength, 32)
        : 12;

      magnetic.dataset.motionActive = "true";
      magnetic.style.setProperty("--pointer-local-x", localX.toFixed(4));
      magnetic.style.setProperty("--pointer-local-y", localY.toFixed(4));
      magnetic.style.setProperty("--magnetic-x", `${(offsetX * strength).toFixed(2)}px`);
      magnetic.style.setProperty("--magnetic-y", `${(offsetY * strength).toFixed(2)}px`);
    };

    const resetPointer = () => {
      resetMagneticElement(activeMagnetic);
      activeMagnetic = null;
      root.style.setProperty("--pointer-x", "50vw");
      root.style.setProperty("--pointer-y", "50vh");
      root.style.setProperty("--pointer-nx", "0.5");
      root.style.setProperty("--pointer-ny", "0.5");
    };

    const onPointerCapability = (event: MediaQueryListEvent) => {
      finePointer = event.matches;
      if (!finePointer) resetPointer();
    };

    root.style.setProperty("--pointer-x", "50vw");
    root.style.setProperty("--pointer-y", "50vh");
    root.style.setProperty("--pointer-nx", "0.5");
    root.style.setProperty("--pointer-ny", "0.5");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestRender);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);
    finePointerQuery.addEventListener("change", onPointerCapability);
    requestRender();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetPointer);
      finePointerQuery.removeEventListener("change", onPointerCapability);
      mutationObserver.disconnect();
      observer.disconnect();
      resetMagneticElement(activeMagnetic);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      for (const element of observedElements) {
        element.style.removeProperty("--section-progress");
        element.style.removeProperty("--section-centered-progress");
        element.style.removeProperty("--type-progress");
        element.style.removeProperty("--texture-position");
        element.style.removeProperty("--parallax-y");
        delete element.dataset.motionInView;
      }
    };
  }, [motionReduced, pathname]);

  return null;
}
