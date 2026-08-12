/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { experience, projects, siteConfig, values } from "@/lib/content";
import {
  AUTOMOTIVE_EDIT,
  resolveAutomotiveTimeline,
  type AutomotiveChapterId,
} from "@/lib/automotive-timeline";
import { useExperienceStore } from "@/lib/experience-store";
import { EngineHoverReveal } from "./engine-hover-reveal";
import {
  ScrollFrameSequence,
  type ScrollFrameSequenceHandle,
} from "./scroll-frame-sequence";
import styles from "./automotive-home.module.css";

type DeferredChapter = "experience" | "projects" | "creative";

const chapterLinks: ReadonlyArray<{
  id: AutomotiveChapterId;
  label: string;
  href: string;
}> = [
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "creative", label: "Creative", href: "#creative" },
  { id: "contact", label: "Contact", href: "#contact" },
];

const chapterSources: Record<DeferredChapter, string[]> = {
  experience: [
    "/vehicles/optimized/senna/senna-body-macro-v1",
    "/vehicles/optimized/senna/senna-wheel-macro-v1",
    "/vehicles/optimized/senna/senna-exhaust-macro-v1",
    "/vehicles/optimized/senna/senna-hero-closed-v1",
    "/vehicles/optimized/senna/senna-hero-open-v1",
  ],
  projects: [
    "/vehicles/optimized/f1/ferrari/tyre-macro-v1",
    "/vehicles/optimized/f1/ferrari/steering-cockpit-v1",
    "/vehicles/optimized/f1/ferrari/suspension-macro-v1",
    "/vehicles/optimized/f1/ferrari/front-hero-v1",
    "/vehicles/optimized/f1/ferrari/side-speed-v1",
    "/vehicles/optimized/f1/ferrari/rear-light-v1",
  ],
  creative: ["/vehicles/optimized/f1/ferrari/rear-light-v1"],
};

const OPEN_DOOR_CAMERA_PUSH_FRAME_COUNT = 32;
const DOOR_MOTION_FRAME_COUNT = 37;

function openDoorCameraPushFrames(variant: "desktop" | "mobile") {
  return Array.from({ length: OPEN_DOOR_CAMERA_PUSH_FRAME_COUNT }, (_, index) => {
    const frame = String(index).padStart(3, "0");
    return `/vehicles/senna/video-derived/frames/${variant}/frame-${frame}.webp`;
  });
}

const desktopOpenDoorCameraPushFrames = openDoorCameraPushFrames("desktop");
const mobileOpenDoorCameraPushFrames = openDoorCameraPushFrames("mobile");

function doorMotionFrames(variant: "desktop" | "mobile") {
  return Array.from({ length: DOOR_MOTION_FRAME_COUNT }, (_, index) => {
    const frame = String(index).padStart(3, "0");
    return `/vehicles/optimized/senna/door-motion-flow-v1/${variant}/frame-${frame}.webp`;
  });
}

const desktopDoorMotionFrames = doorMotionFrames("desktop");
const mobileDoorMotionFrames = doorMotionFrames("mobile");

function VehiclePicture({
  base,
  alt = "",
  className,
  loaded = true,
  priority = false,
}: {
  base: string;
  alt?: string;
  className?: string;
  loaded?: boolean;
  priority?: boolean;
}) {
  if (!loaded) {
    return <span className={`${styles.mediaPlaceholder} ${className ?? ""}`} aria-hidden="true" />;
  }

  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={`${base}-mobile.webp`} />
      <img
        src={`${base}-desktop.webp`}
        srcSet={`${base}-mobile.webp 1440w, ${base}-desktop.webp 2560w`}
        sizes="100vw"
        alt={alt}
        width={2560}
        height={1441}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}

function MaskLine({
  children,
  className,
  inert = false,
}: {
  children: React.ReactNode;
  className?: string;
  inert?: boolean;
}) {
  return (
    <span className={`${styles.lineMask} ${className ?? ""}`}>
      <span className={styles.lineInner} data-line-inner inert={inert || undefined}>
        {children}
      </span>
    </span>
  );
}

function ReducedChapter({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  align = "left",
  headingLevel = 2,
  linksEnabled,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  align?: "left" | "right";
  headingLevel?: 1 | 2;
  linksEnabled: boolean;
  children?: React.ReactNode;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className={styles.reducedPanel} data-align={align}>
      {image ? (
        <VehiclePicture base={image} alt={imageAlt} className={styles.reducedMedia} />
      ) : (
        <div className={styles.reducedEndFrame} aria-hidden="true" />
      )}
      <div className={styles.reducedCopy}>
        <p>{eyebrow}</p>
        <Heading>{title}</Heading>
        <p>{body}</p>
        <span inert={linksEnabled ? undefined : true}>{children}</span>
      </div>
    </div>
  );
}

function preloadChapter(chapter: DeferredChapter) {
  const suffix = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
  return Promise.all(
    chapterSources[chapter].map(
      (base) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            image.decode().catch(() => undefined).finally(resolve);
          };
          image.onload = finish;
          image.onerror = finish;
          image.src = `${base}-${suffix}.webp`;
          if (image.complete) finish();
        }),
    ),
  );
}

export function AutomotiveHome() {
  const rootRef = useRef<HTMLElement>(null);
  const doorMotionRef = useRef<ScrollFrameSequenceHandle>(null);
  const doorSequenceRef = useRef<ScrollFrameSequenceHandle>(null);
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const [loaded, setLoaded] = useState<Record<DeferredChapter, boolean>>({
    experience: false,
    projects: false,
    creative: false,
  });
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    if (motionReduced) {
      setLoaded({ experience: true, projects: true, creative: true });
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const chapter = (entry.target as HTMLElement).dataset.loadChapter as
            | DeferredChapter
            | undefined;
          if (!chapter) return;
          observer.unobserve(entry.target);
          void preloadChapter(chapter).then(() => {
            setLoaded((current) =>
              current[chapter] ? current : { ...current, [chapter]: true },
            );
          });
        });
      },
      { rootMargin: "160% 0px", threshold: 0 },
    );
      root.querySelectorAll<HTMLElement>("[data-load-chapter]").forEach((element) => {
        observer.observe(element);
      });
    return () => {
      observer.disconnect();
    };
  }, [motionReduced]);

  useEffect(() => {
    if (motionReduced) {
      setIntroReady(true);
      return;
    }
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const hero = new Image();
    const start = performance.now();
    let cancelled = false;
    let timer: number | undefined;
    const finish = () => {
      const elapsed = performance.now() - start;
      timer = window.setTimeout(() => {
        if (!cancelled) setIntroReady(true);
      }, Math.max(0, 1250 - elapsed));
    };
    hero.decoding = "async";
    hero.onload = () => void hero.decode().catch(() => undefined).finally(finish);
    hero.onerror = finish;
    hero.src = `/vehicles/optimized/skyline/v2/skyline-hero-rear-three-quarter-v2-${mobile ? "mobile" : "desktop"}.webp`;
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [motionReduced]);

  const updateRuntime = useCallback((progress: number) => {
    const state = resolveAutomotiveTimeline(progress);
    const doorStart = AUTOMOTIVE_EDIT.doorStart / AUTOMOTIVE_EDIT.total;
    const doorEnd = AUTOMOTIVE_EDIT.doorEnd / AUTOMOTIVE_EDIT.total;
    const doorSpan = doorEnd - doorStart;
    const localDoorProgress = (progress - doorStart) / doorSpan;
    doorMotionRef.current?.update(localDoorProgress / 0.5);
    doorSequenceRef.current?.update((localDoorProgress - 0.5) / 0.5);
    return state;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.motionMode = motionReduced ? "reduced" : "full";

    if (motionReduced) {
      root.dataset.ready = "true";
      root.dataset.activeChapter = "about";
      root.dataset.activeShot = "identity";
      document.documentElement.dataset.automotiveChapter = "about";
      return () => {
        delete document.documentElement.dataset.automotiveChapter;
      };
    }

    gsap.registerPlugin(ScrollTrigger);
    const select = gsap.utils.selector(root);
    let lastChapter = "";
    let lenis: Lenis | null = null;

    const updateProgress = (progress: number) => {
      const state = updateRuntime(progress);
      root.style.setProperty("--automotive-progress", state.progress.toFixed(5));
      root.dataset.activeShot = state.shotId;
      if (lastChapter === state.chapterId) return;
      lastChapter = state.chapterId;
      root.dataset.activeChapter = state.chapterId;
      document.documentElement.dataset.automotiveChapter = state.chapterId;
      select<HTMLElement>("[data-chapter-link]").forEach((link) => {
        const active = link.dataset.chapterLink === state.chapterId;
        link.toggleAttribute("data-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const context = gsap.context(() => {
      const scenes = select<HTMLElement>("[data-scene]");
      const shots = select<HTMLElement>("[data-shot]");
      const copies = select<HTMLElement>("[data-copy]");
      const lines = select<HTMLElement>("[data-line-inner]");

      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(shots, { autoAlpha: 0 });
      gsap.set(copies, { visibility: "hidden" });
      gsap.set(lines, { yPercent: 112, rotationX: -14, z: -36 });
      gsap.set(select('[data-scene="about"]'), { autoAlpha: 1 });
      gsap.set(select('[data-shot="skyline-intro"]'), { autoAlpha: 1 });
      gsap.set(select('[data-copy="about-identity"]'), { visibility: "visible" });
      gsap.set(select('[data-copy="about-identity"] > p'), {
        clipPath: "inset(0% 0 0% 0)",
        yPercent: 0,
        rotationX: 0,
      });
      gsap.set(select('[data-copy="about-identity"] [data-line-inner]'), {
        yPercent: 0,
        rotationX: 0,
        z: 0,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "automotive-master-v2",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateProgress(self.progress),
        },
      });

      const copyBeat = (id: string, start: number, end: number) => {
        const block = select<HTMLElement>(`[data-copy="${id}"]`);
        const blockLines = select<HTMLElement>(`[data-copy="${id}"] [data-line-inner]`);
        const blockMeta = select<HTMLElement>(`[data-copy="${id}"] > p`);
        const span = end - start;
        const enter = span * 0.12;
        const exit = span * 0.1;
        timeline
          .set(block, { visibility: "visible" }, start)
          .fromTo(
            blockMeta,
            { clipPath: "inset(100% 0 0 0)", yPercent: 28, rotationX: -22 },
            {
              clipPath: "inset(0% 0 0 0)",
              yPercent: 0,
              rotationX: 0,
              duration: enter * 0.86,
              ease: "power4.out",
              immediateRender: false,
            },
            start,
          )
          .fromTo(
            blockLines,
            { yPercent: 112, rotationX: -14, z: -36 },
            {
              yPercent: 0,
              rotationX: 0,
              z: 0,
              duration: enter,
              stagger: enter * 0.045,
              ease: "power4.out",
              immediateRender: false,
            },
            start + enter * 0.08,
          )
          .to(
            blockLines,
            {
              yPercent: -112,
              rotationX: 12,
              z: -48,
              duration: exit * 0.9,
              stagger: exit * 0.035,
              ease: "power3.in",
            },
            end - exit,
          )
          .to(
            blockMeta,
            {
              clipPath: "inset(0 0 100% 0)",
              yPercent: -22,
              rotationX: 18,
              duration: exit * 0.82,
              ease: "power3.in",
            },
            end - exit,
          )
          .set(block, { visibility: "hidden" }, end);
      };

      const cameraSeam = (
        outgoingSelector: string,
        incomingSelector: string,
        start: number,
        duration: number,
        direction: 1 | -1 = 1,
      ) => {
        const outgoing = select<HTMLElement>(outgoingSelector);
        const incoming = select<HTMLElement>(incomingSelector);
        timeline
          .set(incoming, { autoAlpha: 1 }, start)
          .fromTo(
            incoming,
            {
              xPercent: direction * 13,
              z: -560,
              scale: 0.76,
              rotationX: -4,
              rotationY: direction * -24,
              transformOrigin: direction > 0 ? "0% 50%" : "100% 50%",
            },
            {
              xPercent: 0,
              z: 0,
              scale: 1,
              rotationX: 0,
              rotationY: 0,
              duration,
              ease: "power3.inOut",
              immediateRender: false,
            },
            start,
          )
          .to(
            outgoing,
            {
              xPercent: direction * -18,
              z: 640,
              scale: 1.28,
              rotationX: 3,
              rotationY: direction * 27,
              transformOrigin: direction > 0 ? "100% 50%" : "0% 50%",
              duration,
              ease: "power3.inOut",
            },
            start,
          )
          .set(outgoing, { autoAlpha: 0 }, start + duration);
      };

      const chapterSeam = (
        outgoingSceneSelector: string,
        incomingSceneSelector: string,
        outgoingCameraSelector: string,
        incomingCameraSelector: string,
        start: number,
        duration: number,
        direction: 1 | -1 = 1,
      ) => {
        const outgoingScene = select<HTMLElement>(outgoingSceneSelector);
        const incomingScene = select<HTMLElement>(incomingSceneSelector);
        const outgoingCamera = select<HTMLElement>(outgoingCameraSelector);
        const incomingCamera = select<HTMLElement>(incomingCameraSelector);
        const bloom = select<HTMLElement>("[data-seam-bloom]");
        const originX = direction > 0 ? 64 : 36;

        timeline
          .set(
            incomingScene,
            {
              autoAlpha: 1,
              "--seam-core": "0%",
              "--seam-edge": "0%",
              maskImage: `radial-gradient(circle at ${originX}% 50%, #000 0%, #000 var(--seam-core), transparent var(--seam-edge))`,
              WebkitMaskImage: `radial-gradient(circle at ${originX}% 50%, #000 0%, #000 var(--seam-core), transparent var(--seam-edge))`,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              rotationX: 0,
              rotationY: 0,
              z: 0,
            },
            start,
          )
          .fromTo(
            incomingCamera,
            {
              z: -520,
              scale: 1.34,
              rotationX: -3,
              rotationY: direction * -9,
            },
            {
              z: 0,
              scale: 1,
              rotationX: 0,
              rotationY: 0,
              duration,
              ease: "power4.inOut",
              immediateRender: false,
            },
            start,
          )
          .to(
            incomingScene,
            {
              "--seam-core": "138%",
              "--seam-edge": "168%",
              duration,
              ease: "power4.inOut",
            },
            start,
          )
          .to(
            outgoingCamera,
            {
              z: 420,
              scale: 1.2,
              rotationX: 2,
              rotationY: direction * 8,
              duration,
              ease: "power4.inOut",
            },
            start,
          )
          .fromTo(
            bloom,
            { autoAlpha: 0, scale: 0.32, xPercent: direction * 16 },
            {
              autoAlpha: 0.56,
              scale: 1.35,
              xPercent: 0,
              duration: duration * 0.46,
              ease: "power3.in",
              immediateRender: false,
            },
            start,
          )
          .to(
            bloom,
            {
              autoAlpha: 0,
              scale: 2.6,
              duration: duration * 0.54,
              ease: "power3.out",
            },
            start + duration * 0.46,
          )
          .set(outgoingScene, { autoAlpha: 0 }, start + duration)
          .set(
            incomingScene,
            { maskImage: "none", WebkitMaskImage: "none" },
            start + duration,
          );
      };

      timeline
        .addLabel("about", 0)
        .fromTo(
          select('[data-camera="skyline"]'),
          { z: -180, rotationX: 3.5, rotationY: -5, scale: 1.2 },
          { z: 0, rotationX: 0, rotationY: 0, scale: 1, duration: 11.4 },
          0,
        )
        .fromTo(
          select('[data-shot="skyline-intro"]'),
          { scale: 1.32, xPercent: -7, yPercent: 3 },
          { scale: 1.03, xPercent: 0, yPercent: 0, duration: 12.35 },
          0,
        )
        .fromTo(
          select("[data-orbit-ring]"),
          { rotate: -22, scale: 0.7, opacity: 0 },
          { rotate: 18, scale: 1, opacity: 0.55, duration: 10.5, ease: "power3.out" },
          1,
        )
        .to(
          select("[data-orbit-ring]"),
          { opacity: 0, scale: 1.12, duration: 3.4, ease: "power2.inOut" },
          14.8,
        );
      timeline
        .set(select('[data-copy="about-identity"]'), { visibility: "visible" }, 0)
        .set(select('[data-copy="about-identity"] > p'), { clipPath: "inset(0% 0 0 0)", yPercent: 0, rotationX: 0 }, 0)
        .set(select('[data-copy="about-identity"] [data-line-inner]'), { yPercent: 0, rotationX: 0, z: 0 }, 0)
        .to(
          select('[data-copy="about-identity"] [data-line-inner]'),
          { yPercent: -112, rotationX: 12, z: -48, duration: 1.8, stagger: 0.08, ease: "power3.in" },
          16.6,
        )
        .to(
          select('[data-copy="about-identity"] > p'),
          { clipPath: "inset(0 0 100% 0)", yPercent: -22, rotationX: 18, duration: 1.5, ease: "power3.in" },
          16.8,
        )
        .set(select('[data-copy="about-identity"]'), { visibility: "hidden" }, 18.5);
      cameraSeam('[data-shot="skyline-intro"]', '[data-shot="skyline-side"]', 12.4, 6.8, -1);
      copyBeat("about-values", 19.2, 33.4);

      timeline
        .set(select('[data-shot="engine-inspection"]'), { autoAlpha: 1 }, 29.2)
        .fromTo(
          select('[data-shot="engine-inspection"]'),
          {
            scale: 1.38,
            z: -420,
            xPercent: 10,
            rotationX: -3.5,
            rotationY: 7,
            opacity: 0.22,
          },
          {
            scale: 1.015,
            z: 0,
            xPercent: 0,
            rotationX: 0,
            rotationY: 0,
            opacity: 1,
            duration: 8.2,
            ease: "power4.inOut",
          },
          29.2,
        )
        .to(
          select('[data-shot="skyline-side"]'),
          { scale: 0.68, z: -340, rotationY: -9, duration: 7.2, ease: "power4.inOut" },
          29.2,
        )
        .set(select('[data-shot="skyline-side"]'), { autoAlpha: 0 }, 36.35);
      copyBeat("about-engine", 40.5, 49.5);

      timeline
        .to(
          select('[data-shot="engine-inspection"]'),
          { scale: 1.3, z: 190, rotationX: 2.5, duration: 8.3, ease: "power3.in" },
          46.5,
        )
        .to(select('[data-camera="skyline"]'), { z: 310, rotationY: 5, duration: 6.1, ease: "power3.in" }, 49.2);
      chapterSeam(
        '[data-scene="about"]',
        '[data-scene="experience"]',
        '[data-camera="skyline"]',
        '[data-camera="senna"]',
        49.2,
        9.4,
        1,
      );
      timeline
        .addLabel("experience", 56)
        .set(select('[data-shot="senna-carbon"]'), { autoAlpha: 1 }, 49.2)
        .fromTo(
          select('[data-shot="senna-carbon"]'),
          { scale: 1.42, z: -180, rotationY: -8 },
          { scale: 1.04, z: 0, rotationY: 0, duration: 9.6, ease: "power3.inOut" },
          50,
        );
      copyBeat("experience-intro", 56.8, 73.2);

      cameraSeam('[data-shot="senna-carbon"]', '[data-shot="senna-wheel"]', 66.5, 8.2, -1);
      copyBeat("experience-0", 72.6, 89.4);

      cameraSeam('[data-shot="senna-wheel"]', '[data-shot="senna-exhaust"]', 82.6, 8, 1);
      copyBeat("experience-1", 88.2, 103.4);

      cameraSeam('[data-shot="senna-exhaust"]', '[data-shot="senna-settle"]', 98.6, 8.4, -1);
      cameraSeam('[data-shot="senna-settle"]', '[data-shot="senna-door-motion"]', 108.2, 3.8, 1);
      copyBeat("experience-2", 102.2, 117.4);
      copyBeat("experience-close", 117.8, 132.2);

      const doorIris = select<HTMLElement>("[data-door-iris]");
      timeline
        .set(doorIris, { autoAlpha: 0, scaleX: 1.25, scaleY: 0.014 }, 116.6)
        .to(
          doorIris,
          {
            autoAlpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 1.6,
            ease: "power4.inOut",
          },
          116.6,
        )
        .set(select('[data-shot="senna-door-motion"]'), { autoAlpha: 0 }, 118.2)
        .set(select('[data-shot="senna-door-camera-push"]'), { autoAlpha: 1 }, 118.2)
        .to(
          doorIris,
          {
            autoAlpha: 0,
            scaleX: 1.25,
            scaleY: 0.014,
            duration: 3,
            ease: "power4.inOut",
          },
          118.2,
        )
        .set(doorIris, { autoAlpha: 0 }, 121.2);

      timeline
        .set(select('[data-shot="ferrari-tyre"]'), { autoAlpha: 1 }, 127.2)
        .fromTo(
          select('[data-shot="ferrari-tyre"]'),
          { scale: 1.55, z: -240, rotationY: 10 },
          { scale: 1.03, z: 0, rotationY: 0, duration: 9.4, ease: "power4.inOut" },
          127.2,
        )
        .addLabel("projects", 136);
      chapterSeam(
        '[data-scene="experience"]',
        '[data-scene="projects"]',
        '[data-camera="senna"]',
        '[data-camera="ferrari"]',
        127.2,
        11.4,
        -1,
      );
      copyBeat("projects-intro", 132.4, 151.2);

      cameraSeam('[data-shot="ferrari-tyre"]', '[data-shot="ferrari-controls"]', 144.2, 8.6, 1);
      copyBeat("project-0", 150.5, 168.7);

      cameraSeam('[data-shot="ferrari-controls"]', '[data-shot="ferrari-suspension"]', 161.7, 8.6, -1);
      copyBeat("project-1", 168.2, 186.4);

      cameraSeam('[data-shot="ferrari-suspension"]', '[data-shot="ferrari-hero"]', 179.4, 8.8, 1);
      copyBeat("projects-index", 186.8, 217.4);

      cameraSeam('[data-shot="ferrari-hero"]', '[data-shot="ferrari-speed"]', 196.2, 9, -1);
      cameraSeam('[data-shot="ferrari-speed"]', '[data-shot="ferrari-rear"]', 206.4, 9.2, 1);

      timeline
        .to(select('[data-camera="ferrari"]'), { z: 290, rotationX: -3, rotationY: -8, duration: 7.5, ease: "power3.inOut" }, 214)
        .addLabel("creative", 224)
        .to(select("[data-aperture-blades]"), { rotate: 34, scale: 1.12, duration: 11, ease: "power3.inOut" }, 216.5);
      chapterSeam(
        '[data-scene="projects"]',
        '[data-scene="creative"]',
        '[data-camera="ferrari"]',
        '[data-aperture]',
        216.5,
        11.2,
        -1,
      );
      copyBeat("creative-intro", 222.8, 241.2);
      copyBeat("creative-vfx", 239.8, 253.2);
      copyBeat("creative-photo", 251.8, 266.2);

      timeline
        .to(select("[data-aperture-blades]"), { rotate: 88, scale: 0.06, duration: 9.2, ease: "power4.inOut" }, 258.8)
        .addLabel("contact", 266)
        .fromTo(
          select("[data-contact-rule]"),
          { scaleX: 0.02, rotation: -8 },
          { scaleX: 1, rotation: 0, duration: 8, ease: "power4.inOut" },
          262,
        );
      chapterSeam(
        '[data-scene="creative"]',
        '[data-scene="contact"]',
        '[data-aperture]',
        '[data-camera="contact"]',
        258.8,
        10.2,
        1,
      );
      const contactBlock = select<HTMLElement>('[data-copy="contact"]');
      const contactLines = select<HTMLElement>('[data-copy="contact"] [data-line-inner]');
      const contactMeta = select<HTMLElement>('[data-copy="contact"] > p');
      timeline
        .set(contactBlock, { visibility: "visible" }, 263.2)
        .fromTo(
          contactMeta,
          { clipPath: "inset(100% 0 0 0)", yPercent: 28, rotationX: -22 },
          { clipPath: "inset(0% 0 0 0)", yPercent: 0, rotationX: 0, duration: 2.2, ease: "power4.out", immediateRender: false },
          263.2,
        )
        .fromTo(
          contactLines,
          { yPercent: 112, rotationX: -14, z: -36 },
          { yPercent: 0, rotationX: 0, z: 0, duration: 2.6, stagger: 0.12, ease: "power4.out", immediateRender: false },
          263.45,
        )
        .to({}, { duration: 19.05 }, 265.95);
    }, root);

    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let tick: ((time: number) => void) | null = null;
    let onLenisScroll: (() => void) | null = null;
    if (finePointer && !saveData) {
      lenis = new Lenis({
        autoRaf: false,
        anchors: {
          duration: 1.2,
          easing: (value: number) => 1 - Math.pow(1 - value, 4),
          lock: true,
        },
        lerp: 0.055,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.68,
      });
      onLenisScroll = () => ScrollTrigger.update();
      tick = (time: number) => lenis?.raf(time * 1000);
      lenis.on("scroll", onLenisScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    updateProgress(ScrollTrigger.getById("automotive-master-v2")?.progress ?? 0);
    root.dataset.ready = "true";
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      if (tick) gsap.ticker.remove(tick);
      if (onLenisScroll) lenis?.off("scroll", onLenisScroll);
      lenis?.destroy();
      context.revert();
      if (tick) gsap.ticker.lagSmoothing(500, 33);
      delete root.dataset.ready;
      delete document.documentElement.dataset.automotiveChapter;
    };
  }, [motionReduced, updateRuntime]);

  const featuredProjects = projects.slice(0, 3);

  return (
    <main
      id="main-content"
      ref={rootRef}
      className={styles.root}
      data-automotive-home
      data-active-chapter="about"
      data-active-shot="identity"
      data-motion-mode={motionReduced ? "reduced" : "full"}
      data-intro-ready={introReady || undefined}
    >
      <div className={styles.introCurtain} aria-hidden="true">
        <span className={styles.introAperture} />
        <span className={styles.introMark}>APS</span>
        <span className={styles.introSignal}>Identity / systems / image</span>
      </div>

      <div className={styles.stage} aria-hidden="true">
        <div className={styles.scene} data-scene="about">
          <div className={styles.camera} data-camera="skyline">
            <div className={`${styles.shot} ${styles.skylineIntro}`} data-shot="skyline-intro">
              <VehiclePicture base="/vehicles/optimized/skyline/v2/skyline-hero-rear-three-quarter-v2" className={styles.media} priority />
            </div>
            <div className={`${styles.shot} ${styles.skylineSide}`} data-shot="skyline-side">
              <VehiclePicture base="/vehicles/optimized/skyline/v2/skyline-side-profile-v2" className={styles.media} />
            </div>
            <div className={`${styles.shot} ${styles.engineInspection}`} data-shot="engine-inspection">
              <EngineHoverReveal
                closedBase="/vehicles/optimized/skyline/v2/skyline-engine-front-closed-reg-v2"
                openBase="/vehicles/optimized/skyline/v2/skyline-engine-front-open-reg-v2"
                reducedMotion={motionReduced}
              />
            </div>
          </div>

          <div className={styles.orbitUi} data-orbit-ring>
            <span />
            <i />
            <b>43.47° N</b>
          </div>
          <div className={`${styles.copy} ${styles.identityCopy}`} data-copy="about-identity">
            <p className={styles.eyebrow}>About / {siteConfig.name} · {siteConfig.location}</p>
            <h1 className={styles.displayTitle}>
              <MaskLine>Aayu Pratap</MaskLine>
              <MaskLine className={styles.indentedLine}>Singh.</MaskLine>
            </h1>
            <MaskLine className={styles.copyDeck}>{siteConfig.title} · Computer Science at Waterloo</MaskLine>
          </div>
          <div className={`${styles.copy} ${styles.copyRight} ${styles.factCopy}`} data-copy="about-values">
            <p className={styles.eyebrow}>Computer Science / University of Waterloo</p>
            <h2 className={styles.factTitle}>
              <MaskLine>{values[1].title}</MaskLine>
            </h2>
            <MaskLine className={styles.factBody}>{values[1].copy}</MaskLine>
          </div>
          <div className={`${styles.copy} ${styles.copyLeft} ${styles.factCopy}`} data-copy="about-engine">
            <p className={styles.eyebrow}>Under the surface / how I think</p>
            <h2 className={styles.factTitle}>
              <MaskLine>{values[0].title}</MaskLine>
            </h2>
            <MaskLine className={styles.factBody}>{values[0].copy}</MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="experience">
          <div className={styles.camera} data-camera="senna">
            <div className={`${styles.shot} ${styles.sennaCarbon}`} data-shot="senna-carbon">
              <VehiclePicture base="/vehicles/optimized/senna/senna-body-macro-v1" className={styles.media} loaded={loaded.experience} />
            </div>
            <div className={`${styles.shot} ${styles.sennaWheel}`} data-shot="senna-wheel">
              <VehiclePicture base="/vehicles/optimized/senna/senna-wheel-macro-v1" className={styles.media} loaded={loaded.experience} />
            </div>
            <div className={`${styles.shot} ${styles.sennaExhaust}`} data-shot="senna-exhaust">
              <VehiclePicture base="/vehicles/optimized/senna/senna-exhaust-macro-v1" className={styles.media} loaded={loaded.experience} />
            </div>
            <div className={`${styles.shot} ${styles.sennaHero}`} data-shot="senna-settle">
              <VehiclePicture base="/vehicles/optimized/senna/senna-hero-closed-v1" className={styles.media} loaded={loaded.experience} />
            </div>
            <div className={`${styles.shot} ${styles.sennaHero}`} data-shot="senna-door-motion">
              <ScrollFrameSequence
                ref={doorMotionRef}
                className={styles.doorCanvas}
                desktopFrames={desktopDoorMotionFrames}
                mobileFrames={mobileDoorMotionFrames}
                fallbackDesktop="/vehicles/optimized/senna/door-motion-flow-v1/desktop/frame-000.webp"
                fallbackMobile="/vehicles/optimized/senna/door-motion-flow-v1/mobile/frame-000.webp"
                enabled={loaded.experience && !motionReduced}
                poster="/vehicles/optimized/senna/door-motion-flow-v1/desktop/frame-000.webp"
                sequenceLabel="Prototype registered dihedral door-state motion with optical-flow in-betweens"
                sequenceKind="door-state-motion"
              />
            </div>
            <div className={`${styles.shot} ${styles.sennaHero} ${styles.doorCameraPush}`} data-shot="senna-door-camera-push">
              <ScrollFrameSequence
                ref={doorSequenceRef}
                className={styles.doorCanvas}
                desktopFrames={desktopOpenDoorCameraPushFrames}
                mobileFrames={mobileOpenDoorCameraPushFrames}
                fallbackDesktop="/vehicles/senna/video-derived/frames/desktop/frame-000.webp"
                fallbackMobile="/vehicles/senna/video-derived/frames/mobile/frame-000.webp"
                enabled={loaded.experience && !motionReduced}
                poster="/vehicles/senna/video-derived/frames/desktop/frame-000.webp"
                sequenceLabel="Owner-supplied McLaren open-door camera push"
                sequenceKind="open-door-camera-push"
                sourceStartFrame={112}
              />
            </div>
          </div>
          <span className={styles.doorIris} data-door-iris />
          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="experience-intro">
            <p className={styles.eyebrow}>02 / Experience</p>
            <h2 className={styles.chapterTitle}><MaskLine>Work that</MaskLine><MaskLine>holds pressure.</MaskLine></h2>
          </div>
          {experience.map((item, index) => (
            <article className={`${styles.copy} ${index === 1 ? styles.copyLeft : styles.copyRight} ${styles.factCopy}`} data-copy={`experience-${index}`} key={item.id}>
              <p className={styles.eyebrow}>{String(index + 1).padStart(2, "0")} · {item.discipline}</p>
              <h3 className={styles.factTitle}><MaskLine>{item.organisation}</MaskLine></h3>
              <MaskLine className={styles.factMeta}>{item.role} · {item.period}{item.status ? ` · ${item.status}` : ""}</MaskLine>
              <MaskLine className={styles.factBody}>{item.summary}</MaskLine>
            </article>
          ))}
          <div className={`${styles.copy} ${styles.copyRight} ${styles.factCopy}`} data-copy="experience-close">
            <p className={styles.eyebrow}>Complete record</p>
            <h3 className={styles.factTitle}><MaskLine>Product.</MaskLine><MaskLine>Models. Systems.</MaskLine></h3>
          </div>
        </div>

        <div className={styles.scene} data-scene="projects">
          <div className={styles.camera} data-camera="ferrari">
            {[
              ["ferrari-tyre", "tyre-macro-v1"],
              ["ferrari-controls", "steering-cockpit-v1"],
              ["ferrari-suspension", "suspension-macro-v1"],
              ["ferrari-hero", "front-hero-v1"],
              ["ferrari-speed", "side-speed-v1"],
              ["ferrari-rear", "rear-light-v1"],
            ].map(([shot, asset]) => (
              <div className={`${styles.shot} ${styles.ferrariShot}`} data-shot={shot} key={shot}>
                <VehiclePicture base={`/vehicles/optimized/f1/ferrari/${asset}`} className={styles.media} loaded={loaded.projects} />
              </div>
            ))}
          </div>
          <div className={styles.telemetryUi}>
            <span data-telemetry-ring /><span data-telemetry-ring /><i />
          </div>
          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="projects-intro">
            <p className={styles.eyebrow}>03 / Projects · engineering in motion</p>
            <h2 className={styles.chapterTitle}><MaskLine>Decisions at</MaskLine><MaskLine>race speed.</MaskLine></h2>
          </div>
          {featuredProjects.slice(0, 2).map((project, index) => (
            <article className={`${styles.copy} ${index ? styles.copyLeft : styles.copyRight} ${styles.factCopy}`} data-copy={`project-${index}`} key={project.slug}>
              <p className={styles.eyebrow}>{project.index} · {project.category}</p>
              <h3 className={styles.factTitle}><MaskLine>{project.title}</MaskLine></h3>
              <MaskLine className={styles.factMeta}>{project.period}{project.status ? ` · ${project.status}` : ""}</MaskLine>
              <MaskLine className={styles.factBody}>{project.summary}</MaskLine>
            </article>
          ))}
          <div className={`${styles.copy} ${styles.copyRight} ${styles.factCopy}`} data-copy="projects-index">
            <p className={styles.eyebrow}>Five factual case studies / no invented outcomes</p>
            <h3 className={styles.factTitle}><MaskLine>Products.</MaskLine><MaskLine>Models. Motion.</MaskLine></h3>
            <MaskLine className={styles.factBody}>{featuredProjects[2].title}, AI Personal Finance Manager, and Emotion-Powered Music Mixer continue in the project index.</MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="creative">
          <div className={styles.aperture} data-aperture>
            <div className={styles.apertureImage}>
              <VehiclePicture base="/vehicles/optimized/f1/ferrari/rear-light-v1" className={styles.media} loaded={loaded.creative} />
            </div>
            <div className={styles.apertureBlades} data-aperture-blades>
              {Array.from({ length: 10 }, (_, index) => <span key={index} style={{ "--blade": index } as React.CSSProperties} />)}
            </div>
          </div>
          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="creative-intro">
            <p className={styles.eyebrow}>04 / Creative practice</p>
            <h2 className={styles.chapterTitle}><MaskLine>Images with</MaskLine><MaskLine>intent.</MaskLine></h2>
          </div>
          <div className={`${styles.copy} ${styles.copyRight} ${styles.factCopy}`} data-copy="creative-vfx">
            <p className={styles.eyebrow}>VFX / motion</p>
            <h3 className={styles.factTitle}><MaskLine>Light.</MaskLine><MaskLine>Timing. Texture.</MaskLine></h3>
            <MaskLine className={styles.factBody}>A dedicated home for finished VFX work and process breakdowns. Final media pending.</MaskLine>
          </div>
          <div className={`${styles.copy} ${styles.copyLeft} ${styles.factCopy}`} data-copy="creative-photo">
            <p className={styles.eyebrow}>Photography</p>
            <h3 className={styles.factTitle}><MaskLine>Observation</MaskLine><MaskLine>over spectacle.</MaskLine></h3>
            <MaskLine className={styles.factBody}>The archive remains honestly placeholder-only until Aayu supplies the final work.</MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="contact">
          <div className={styles.contactField} data-camera="contact" />
          <span className={styles.contactRule} data-contact-rule />
          <div className={`${styles.copy} ${styles.contactCopy}`} data-copy="contact">
            <p className={styles.eyebrow}>05 / Contact</p>
            <h2 className={styles.contactTitle}><MaskLine>Let’s build</MaskLine><MaskLine>what moves next.</MaskLine></h2>
            <MaskLine className={styles.contactEmail} inert><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></MaskLine>
          </div>
        </div>

        <div className={styles.vignette} />
        <div className={styles.seamBloom} data-seam-bloom />
        <div className={styles.hud}>
          <span>APS / portfolio</span>
          <span className={styles.hudChapter}>About first / vehicles as visual language</span>
          <i />
        </div>
      </div>

      <nav className={styles.actionDock} aria-label="Portfolio shortcuts">
        <Link href="/about" data-action-chapter="about">Profile <span>↗</span></Link>
        <Link href="/experience" data-action-chapter="experience">Full record <span>↗</span></Link>
        <Link href="/projects" data-action-chapter="projects">Case studies <span>↗</span></Link>
        <Link href="/archive" data-action-chapter="creative">Creative archive <span>↗</span></Link>
        <a href={`mailto:${siteConfig.email}`} data-action-chapter="contact">Start a conversation <span>↗</span></a>
        <a href={siteConfig.github} target="_blank" rel="noreferrer" data-action-chapter="contact">GitHub <span>↗</span></a>
        <Link href="/resume" data-action-chapter="contact">Résumé <span>↗</span></Link>
      </nav>

      <nav className={styles.chapterRail} aria-label="Homepage chapters">
        {chapterLinks.map((chapter, index) => (
          <a href={chapter.href} aria-label={`Jump to ${chapter.label}`} data-chapter-link={chapter.id} data-active={index === 0 ? "" : undefined} aria-current={index === 0 ? "location" : undefined} key={chapter.id}>
            <span>{chapter.label}</span><i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
          </a>
        ))}
      </nav>

      <div className={styles.scrollTrack}>
        <section id="about" className={styles.trackAbout} aria-label="About">
          <ReducedChapter eyebrow="01 / About" title={`${siteConfig.name} — ${siteConfig.title}`} body={siteConfig.description} image="/vehicles/optimized/skyline/v2/skyline-hero-rear-three-quarter-v2" imageAlt="Cobalt performance coupe in a dark studio." headingLevel={1} linksEnabled={motionReduced}><Link href="/about">About Aayu ↗</Link></ReducedChapter>
        </section>
        <section id="experience" className={styles.trackExperience} aria-label="Experience" data-load-chapter="experience">
          <ReducedChapter eyebrow="02 / Experience" title="Work that holds pressure." body="UniMarket, WAT.AI SportsNext, and ATS Corporation—product ownership, machine learning, and reliable infrastructure." image="/vehicles/optimized/senna/senna-hero-open-v1" imageAlt="Orange performance car with raised dihedral doors." align="right" linksEnabled={motionReduced}><Link href="/experience">View experience ↗</Link></ReducedChapter>
        </section>
        <section id="projects" className={styles.trackProjects} aria-label="Projects" data-load-chapter="projects">
          <ReducedChapter eyebrow="03 / Projects" title="Decisions at race speed." body="Five projects across telemetry, simulation, product engineering, machine learning, RAG, and creative technology." image="/vehicles/optimized/f1/ferrari/front-hero-v1" imageAlt="Original scarlet open-wheel race car in a dark studio." linksEnabled={motionReduced}><Link href="/projects">Explore projects ↗</Link></ReducedChapter>
        </section>
        <section id="creative" className={styles.trackCreative} aria-label="Creative work" data-load-chapter="creative">
          <ReducedChapter eyebrow="04 / Creative practice" title="Images with intent." body="A future home for Aayu’s VFX, motion work, photography, and process." image="/vehicles/optimized/f1/ferrari/rear-light-v1" imageAlt="Scarlet race car rear light in a dark tunnel." align="right" linksEnabled={motionReduced}><Link href="/archive">Enter archive ↗</Link></ReducedChapter>
        </section>
        <section id="contact" className={styles.trackContact} aria-label="Contact">
          <ReducedChapter eyebrow="05 / Contact" title="Let’s build what moves next." body={`${siteConfig.name} · ${siteConfig.location}`} linksEnabled={motionReduced}><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> · <a href={siteConfig.github}>GitHub</a> · <Link href="/resume">Résumé</Link></ReducedChapter>
        </section>
      </div>
    </main>
  );
}
