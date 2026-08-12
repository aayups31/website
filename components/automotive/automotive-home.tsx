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
import { EngineModel, type EngineModelHandle } from "./engine-model";
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

const doorFrames = [
  "/vehicles/optimized/senna/door-open-v2/door-000",
  "/vehicles/optimized/senna/door-open-v2/door-001",
  "/vehicles/optimized/senna/door-open-v2/door-002",
  "/vehicles/optimized/senna/door-open-v2/door-003",
  "/vehicles/optimized/senna/door-open-v2/door-004",
  "/vehicles/optimized/senna/door-open-v2/door-005",
  "/vehicles/optimized/senna/door-open-v2/door-006",
  "/vehicles/optimized/senna/door-open-v2/door-007",
  "/vehicles/optimized/senna/door-open-v2/door-008",
  "/vehicles/optimized/senna/door-open-v2/door-009",
];

function responsiveFrames(variant: "desktop" | "mobile") {
  return doorFrames.map((frame) => `${frame}-${variant}.webp`);
}

const desktopDoorFrames = responsiveFrames("desktop");
const mobileDoorFrames = responsiveFrames("mobile");

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
  const engineRef = useRef<EngineModelHandle>(null);
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
    const preloadAhead = window.setTimeout(() => {
      for (const chapter of ["experience", "projects", "creative"] as const) {
        void preloadChapter(chapter).then(() => {
          setLoaded((current) =>
            current[chapter] ? current : { ...current, [chapter]: true },
          );
        });
      }
    }, 2200);
    return () => {
      window.clearTimeout(preloadAhead);
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
    const engineStart = AUTOMOTIVE_EDIT.engineModelStart / AUTOMOTIVE_EDIT.total;
    const engineEnd = AUTOMOTIVE_EDIT.engineModelEnd / AUTOMOTIVE_EDIT.total;
    engineRef.current?.update((progress - engineStart) / (engineEnd - engineStart));

    const doorStart = AUTOMOTIVE_EDIT.doorStart / AUTOMOTIVE_EDIT.total;
    const doorEnd = AUTOMOTIVE_EDIT.doorEnd / AUTOMOTIVE_EDIT.total;
    doorSequenceRef.current?.update((progress - doorStart) / (doorEnd - doorStart));
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
      gsap.set(copies, { autoAlpha: 0 });
      gsap.set(lines, { yPercent: 118 });
      gsap.set(select('[data-scene="about"]'), { autoAlpha: 1 });
      gsap.set(select('[data-shot="skyline-intro"]'), { autoAlpha: 1 });
      gsap.set(select('[data-copy="about-identity"]'), { autoAlpha: 1 });

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
        const span = end - start;
        const enter = span * 0.15;
        const exit = span * 0.15;
        timeline
          .set(block, { autoAlpha: 1 }, start)
          .fromTo(
            blockLines,
            { yPercent: 118 },
            { yPercent: 0, duration: enter, stagger: enter * 0.08, ease: "power4.out" },
            start,
          )
          .to(
            blockLines,
            { yPercent: -112, duration: exit, stagger: exit * 0.06, ease: "power3.in" },
            end - exit,
          )
          .set(block, { autoAlpha: 0 }, end);
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
          { scale: 1.03, xPercent: 0, yPercent: 0, duration: 13.8 },
          0,
        )
        .fromTo(
          select("[data-orbit-ring]"),
          { rotate: -22, scale: 0.7, opacity: 0 },
          { rotate: 18, scale: 1, opacity: 0.55, duration: 10.5, ease: "power3.out" },
          1,
        );
      timeline
        .fromTo(
          select('[data-copy="about-identity"] [data-line-inner]'),
          { yPercent: 118 },
          { yPercent: 0, duration: 2.6, stagger: 0.12, ease: "power4.out", immediateRender: true },
          0,
        )
        .to(
          select('[data-copy="about-identity"] [data-line-inner]'),
          { yPercent: -112, duration: 2, stagger: 0.08, ease: "power3.in" },
          12,
        )
        .set(select('[data-copy="about-identity"]'), { autoAlpha: 0 }, 14);

      timeline
        .set(select('[data-shot="skyline-side"]'), { autoAlpha: 1 }, 14)
        .fromTo(
          select('[data-shot="skyline-side"]'),
          { clipPath: "circle(0% at 22% 50%)", scale: 1.16, xPercent: 7 },
          { clipPath: "circle(118% at 22% 50%)", scale: 1, xPercent: 0, duration: 5.5, ease: "power3.inOut" },
          14,
        )
        .to(select('[data-shot="skyline-intro"]'), { autoAlpha: 0, duration: 2.5 }, 16.8);
      copyBeat("about-values", 19.5, 30);

      timeline
        .set(select('[data-shot="engine-closed"]'), { autoAlpha: 1 }, 29.2)
        .fromTo(
          select('[data-shot="engine-closed"]'),
          { clipPath: "inset(50% 0 50% 0)", scale: 1.25 },
          { clipPath: "inset(0% 0 0% 0)", scale: 1.02, duration: 6.4, ease: "power4.inOut" },
          29.2,
        )
        .to(select('[data-shot="skyline-side"]'), { autoAlpha: 0, duration: 2.4 }, 32.5)
        .set(select('[data-shot="engine-open"]'), { autoAlpha: 1 }, 35)
        .fromTo(
          select('[data-shot="engine-open"]'),
          { clipPath: "circle(0% at 50% 42%)", scale: 1.18 },
          { clipPath: "circle(88% at 50% 42%)", scale: 1.03, duration: 7, ease: "power3.inOut" },
          35,
        )
        .fromTo(
          select("[data-ink-reveal]"),
          { opacity: 0, scale: 0.36, rotate: -7 },
          { opacity: 0.9, scale: 1.3, rotate: 4, duration: 5.4, ease: "power2.inOut" },
          34.7,
        )
        .fromTo(
          select("[data-glitch-band]"),
          { xPercent: -120, opacity: 0 },
          { xPercent: 120, opacity: 0.76, duration: 3.8, stagger: 0.24, ease: "power3.inOut" },
          36,
        );
      copyBeat("about-engine", 40.5, 49.5);

      timeline
        .fromTo(
          select("[data-engine-model-wrap]"),
          { autoAlpha: 0, scale: 0.78, rotateY: -14 },
          { autoAlpha: 1, scale: 1, rotateY: 0, duration: 6.4, ease: "power4.out" },
          44.5,
        )
        .to(select('[data-shot="engine-closed"]'), { autoAlpha: 0, duration: 2 }, 44.5)
        .to(select('[data-shot="engine-open"]'), { autoAlpha: 0.22, duration: 3 }, 47)
        .to(select('[data-camera="skyline"]'), { z: 260, rotationY: 7, duration: 5.5 }, 50.5)
        .to(select('[data-scene="about"]'), { autoAlpha: 0, duration: 2.4 }, 54.8)
        .addLabel("experience", 56)
        .set(select('[data-scene="experience"]'), { autoAlpha: 1 }, 54.4)
        .set(select('[data-shot="senna-carbon"]'), { autoAlpha: 1 }, 54.4)
        .fromTo(
          select('[data-camera="senna"]'),
          { z: -240, rotationY: -8, scale: 1.28 },
          { z: 0, rotationY: 0, scale: 1, duration: 8.8, ease: "power3.inOut" },
          54.4,
        )
        .fromTo(
          select('[data-shot="senna-carbon"]'),
          { clipPath: "circle(8% at 60% 54%)", scale: 1.42 },
          { clipPath: "circle(118% at 60% 54%)", scale: 1.04, duration: 8.2, ease: "power3.inOut" },
          54.4,
        );
      copyBeat("experience-intro", 60.5, 70);

      timeline
        .set(select('[data-shot="senna-wheel"]'), { autoAlpha: 1 }, 68)
        .fromTo(
          select('[data-shot="senna-wheel"]'),
          { clipPath: "circle(0% at 70% 58%)", scale: 1.3 },
          { clipPath: "circle(105% at 70% 58%)", scale: 1.03, duration: 6.2, ease: "power4.inOut" },
          68,
        )
        .to(select('[data-shot="senna-carbon"]'), { autoAlpha: 0, duration: 2.5 }, 72);
      copyBeat("experience-0", 75, 86);

      timeline
        .set(select('[data-shot="senna-exhaust"]'), { autoAlpha: 1 }, 84.5)
        .fromTo(
          select('[data-shot="senna-exhaust"]'),
          { clipPath: "polygon(48% 0,52% 0,60% 100%,40% 100%)", scale: 1.22 },
          { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)", scale: 1.02, duration: 5.8, ease: "power4.inOut" },
          84.5,
        )
        .to(select('[data-shot="senna-wheel"]'), { autoAlpha: 0, duration: 2.5 }, 88);
      copyBeat("experience-1", 91.5, 102.5);

      timeline
        .set(select('[data-shot="senna-settle"]'), { autoAlpha: 1 }, 101)
        .fromTo(
          select('[data-shot="senna-settle"]'),
          { clipPath: "circle(0% at 50% 60%)", scale: 1.18 },
          { clipPath: "circle(100% at 50% 60%)", scale: 1, duration: 7, ease: "power4.inOut" },
          101,
        )
        .to(select('[data-shot="senna-exhaust"]'), { autoAlpha: 0, duration: 2.5 }, 105)
        .set(select('[data-shot="senna-door-sequence"]'), { autoAlpha: 1 }, 110)
        .to(select('[data-shot="senna-settle"]'), { autoAlpha: 0, duration: 2.2 }, 112);
      copyBeat("experience-2", 105.5, 116);
      copyBeat("experience-close", 119, 130.5);

      timeline
        .set(select('[data-shot="ferrari-tyre"]'), { autoAlpha: 1 }, 130)
        .fromTo(
          select('[data-shot="ferrari-tyre"]'),
          { clipPath: "circle(0% at 76% 56%)", scale: 1.55 },
          { clipPath: "circle(115% at 76% 56%)", scale: 1.03, duration: 7.2, ease: "power4.inOut" },
          130,
        )
        .to(select('[data-scene="experience"]'), { autoAlpha: 0, duration: 2.8 }, 134)
        .addLabel("projects", 136)
        .set(select('[data-scene="projects"]'), { autoAlpha: 1 }, 130)
        .fromTo(
          select('[data-camera="ferrari"]'),
          { z: -210, rotationX: 4, rotationY: 7, scale: 1.2 },
          { z: 0, rotationX: 0, rotationY: 0, scale: 1, duration: 8 },
          130,
        );
      copyBeat("projects-intro", 138, 148);

      timeline
        .set(select('[data-shot="ferrari-controls"]'), { autoAlpha: 1 }, 146.5)
        .fromTo(
          select('[data-shot="ferrari-controls"]'),
          { clipPath: "inset(50% 0 50% 0)", scale: 1.18, xPercent: 5 },
          { clipPath: "inset(0% 0 0% 0)", scale: 1.02, xPercent: 0, duration: 6.5, ease: "power4.inOut" },
          146.5,
        )
        .to(select('[data-shot="ferrari-tyre"]'), { autoAlpha: 0, duration: 2.4 }, 150.5);
      copyBeat("project-0", 154, 166);

      timeline
        .set(select('[data-shot="ferrari-suspension"]'), { autoAlpha: 1 }, 164)
        .fromTo(
          select('[data-shot="ferrari-suspension"]'),
          { clipPath: "circle(0% at 24% 52%)", scale: 1.22 },
          { clipPath: "circle(116% at 24% 52%)", scale: 1.02, duration: 6.5, ease: "power4.inOut" },
          164,
        )
        .to(select('[data-shot="ferrari-controls"]'), { autoAlpha: 0, duration: 2.5 }, 168);
      copyBeat("project-1", 171.5, 183.5);

      timeline
        .set(select('[data-shot="ferrari-hero"]'), { autoAlpha: 1 }, 181.5)
        .fromTo(
          select('[data-shot="ferrari-hero"]'),
          { clipPath: "circle(0% at 68% 58%)", scale: 1.18 },
          { clipPath: "circle(110% at 68% 58%)", scale: 1, duration: 7, ease: "power4.inOut" },
          181.5,
        )
        .to(select('[data-shot="ferrari-suspension"]'), { autoAlpha: 0, duration: 2.7 }, 185.5);
      copyBeat("projects-index", 189.5, 201.5);

      timeline
        .set(select('[data-shot="ferrari-speed"]'), { autoAlpha: 1 }, 199)
        .fromTo(
          select('[data-shot="ferrari-speed"]'),
          { clipPath: "inset(0 100% 0 0)", scale: 1.12, xPercent: 7 },
          { clipPath: "inset(0 0% 0 0)", scale: 1.02, xPercent: -2, duration: 7, ease: "power4.inOut" },
          199,
        )
        .to(select('[data-shot="ferrari-hero"]'), { autoAlpha: 0, duration: 2.8 }, 203)
        .set(select('[data-shot="ferrari-rear"]'), { autoAlpha: 1 }, 210)
        .fromTo(
          select('[data-shot="ferrari-rear"]'),
          { clipPath: "circle(0% at 50% 63%)", scale: 1.25 },
          { clipPath: "circle(112% at 50% 63%)", scale: 1, duration: 7, ease: "power4.inOut" },
          210,
        )
        .to(select('[data-shot="ferrari-speed"]'), { autoAlpha: 0, duration: 2.5 }, 214)
        .to(select('[data-camera="ferrari"]'), { z: 250, rotationY: -7, duration: 6 }, 215)
        .addLabel("creative", 224)
        .set(select('[data-scene="creative"]'), { autoAlpha: 1 }, 220)
        .fromTo(
          select("[data-aperture]"),
          { clipPath: "circle(0% at 50% 62%)", rotate: -10, scale: 0.7 },
          { clipPath: "circle(90% at 50% 62%)", rotate: 0, scale: 1, duration: 8, ease: "power4.inOut" },
          220,
        )
        .to(select('[data-scene="projects"]'), { autoAlpha: 0, duration: 3 }, 224);
      copyBeat("creative-intro", 229, 239);
      copyBeat("creative-vfx", 241, 251.5);
      copyBeat("creative-photo", 253.5, 264);

      timeline
        .to(select("[data-aperture-blades]"), { rotate: 70, scale: 0.08, opacity: 0, duration: 7, ease: "power4.inOut" }, 260)
        .to(select('[data-scene="creative"]'), { autoAlpha: 0, duration: 3 }, 265)
        .addLabel("contact", 266)
        .set(select('[data-scene="contact"]'), { autoAlpha: 1 }, 264)
        .fromTo(select("[data-contact-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 5.5, ease: "power4.inOut" }, 266);
      copyBeat("contact", 269, 283);
      timeline.to({}, { duration: 1 }, 284);
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
            <div className={`${styles.shot} ${styles.engineClosed}`} data-shot="engine-closed">
              <VehiclePicture base="/vehicles/optimized/skyline/v2/skyline-engine-front-closed-reg-v2" className={styles.media} />
            </div>
            <div className={`${styles.shot} ${styles.engineOpen}`} data-shot="engine-open">
              <VehiclePicture base="/vehicles/optimized/skyline/v2/skyline-engine-front-open-reg-v2" className={styles.media} />
            </div>
          </div>

          <div className={styles.inkReveal} data-ink-reveal>
            <picture>
              <source media="(max-width: 767px)" srcSet="/vehicles/optimized/effects/skyline-engine-ink-mask-v1-mobile.webp" />
              <img src="/vehicles/optimized/effects/skyline-engine-ink-mask-v1-desktop.webp" alt="" />
            </picture>
          </div>
          <div className={styles.glitchBands}>
            <i data-glitch-band />
            <i data-glitch-band />
            <i data-glitch-band />
          </div>
          <div className={styles.engineModelWrap} data-engine-model-wrap>
            <EngineModel ref={engineRef} className={styles.engineModel} enabled={!motionReduced} />
            <span className={styles.engineModelHalo} />
            <span className={styles.engineModelLabel}>Inline six / procedural study</span>
          </div>

          <div className={styles.orbitUi} data-orbit-ring>
            <span />
            <i />
            <b>43.47° N</b>
          </div>
          <div className={`${styles.copy} ${styles.identityCopy}`} data-copy="about-identity">
            <p className={styles.eyebrow}>About / {siteConfig.name} · {siteConfig.location}</p>
            <h1 className={styles.displayTitle}>
              <MaskLine>I build systems</MaskLine>
              <MaskLine className={styles.indentedLine}>that move.</MaskLine>
            </h1>
            <MaskLine className={styles.copyDeck}>{siteConfig.title} · visual storyteller</MaskLine>
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
            <div className={`${styles.shot} ${styles.sennaHero}`} data-shot="senna-door-sequence">
              <ScrollFrameSequence
                ref={doorSequenceRef}
                className={styles.doorCanvas}
                desktopFrames={desktopDoorFrames}
                mobileFrames={mobileDoorFrames}
                fallbackDesktop="/vehicles/optimized/senna/senna-hero-closed-v1-desktop.webp"
                fallbackMobile="/vehicles/optimized/senna/senna-hero-closed-v1-mobile.webp"
                enabled={loaded.experience && !motionReduced}
                poster="/vehicles/optimized/senna/senna-hero-closed-v1-desktop.webp"
              />
            </div>
          </div>
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
          <span className={styles.contactRule} data-contact-rule />
          <div className={`${styles.copy} ${styles.contactCopy}`} data-copy="contact">
            <p className={styles.eyebrow}>05 / Contact</p>
            <h2 className={styles.contactTitle}><MaskLine>Let’s build</MaskLine><MaskLine>what moves next.</MaskLine></h2>
            <MaskLine className={styles.contactEmail} inert><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></MaskLine>
          </div>
        </div>

        <div className={styles.vignette} />
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
