/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { experience, projects, siteConfig } from "@/lib/content";
import { resolveAutomotiveTimeline } from "@/lib/automotive-timeline";
import { useExperienceStore } from "@/lib/experience-store";
import styles from "./automotive-home.module.css";

type DeferredChapter = "senna" | "f1" | "skyline" | "creative";

type VehiclePictureProps = {
  base: string;
  alt?: string;
  className?: string;
  loaded?: boolean;
  priority?: boolean;
};

const chapterSources: Record<DeferredChapter, string[]> = {
  senna: [
    "/vehicles/optimized/senna/senna-wheel-macro-v1",
    "/vehicles/optimized/senna/senna-exhaust-macro-v1",
    "/vehicles/optimized/senna/senna-hero-closed-v1",
    "/vehicles/optimized/senna/senna-hero-open-v1",
  ],
  f1: [
    "/vehicles/optimized/f1/f1-hero-v1",
    "/vehicles/optimized/f1/f1-cockpit-v1",
  ],
  skyline: [
    "/vehicles/optimized/skyline/skyline-hero-closed-v1",
    "/vehicles/optimized/skyline/skyline-hero-xray-v1",
  ],
  creative: ["/vehicles/optimized/senna/senna-exhaust-macro-v1"],
};

const chapterLinks = [
  { id: "opening", label: "Start", href: "#opening" },
  { id: "senna", label: "Experience", href: "#experience" },
  { id: "f1", label: "Projects", href: "#projects" },
  { id: "skyline", label: "About", href: "#about" },
  { id: "creative", label: "Creative", href: "#creative" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;

function VehiclePicture({
  base,
  alt = "",
  className,
  loaded = true,
  priority = false,
}: VehiclePictureProps) {
  if (!loaded) {
    return <span className={`${styles.mediaPlaceholder} ${className ?? ""}`} aria-hidden="true" />;
  }

  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={`${base}-mobile.webp`} />
      <img
        src={`${base}-desktop.webp`}
        srcSet={`${base}-mobile.webp 2160w, ${base}-desktop.webp 3840w`}
        sizes="100vw"
        alt={alt}
        width={3840}
        height={2161}
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

function preloadChapter(chapter: DeferredChapter) {
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const suffix = desktop ? "desktop" : "mobile";

  return Promise.all(
    chapterSources[chapter].map(
      (base) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => {
            image.decode().catch(() => undefined).finally(resolve);
          };
          image.onerror = () => resolve();
          image.src = `${base}-${suffix}.webp`;
          if (image.complete) {
            image.decode().catch(() => undefined).finally(resolve);
          }
        }),
    ),
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
  linksEnabled = true,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  align?: "left" | "right";
  headingLevel?: 1 | 2;
  linksEnabled?: boolean;
  children?: React.ReactNode;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className={styles.reducedPanel} data-align={align}>
      {image ? (
        <VehiclePicture
          base={image}
          alt={imageAlt}
          className={styles.reducedMedia}
        />
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

export function AutomotiveHome() {
  const rootRef = useRef<HTMLElement>(null);
  const scanFrameRef = useRef<number | null>(null);
  const scanTargetRef = useRef<{ element: HTMLDivElement; x: number; y: number } | null>(null);
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const [scanLocked, setScanLocked] = useState(false);
  const [loaded, setLoaded] = useState<Record<DeferredChapter, boolean>>({
    senna: false,
    f1: false,
    skyline: false,
    creative: false,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (motionReduced) {
      setLoaded({ senna: true, f1: true, skyline: true, creative: true });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const chapter = (entry.target as HTMLElement).dataset.loadChapter as
            | DeferredChapter
            | undefined;
          if (!chapter) continue;
          observer.unobserve(entry.target);
          void preloadChapter(chapter).then(() => {
            setLoaded((current) =>
              current[chapter] ? current : { ...current, [chapter]: true },
            );
          });
        }
      },
      { rootMargin: "220% 0px", threshold: 0 },
    );

    root
      .querySelectorAll<HTMLElement>("[data-load-chapter]")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [motionReduced]);

  useEffect(
    () => () => {
      if (scanFrameRef.current !== null) {
        window.cancelAnimationFrame(scanFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.dataset.motionMode = motionReduced ? "reduced" : "full";
    if (motionReduced) {
      root.dataset.ready = "true";
      root.dataset.activeChapter = "opening";
      document.documentElement.dataset.automotiveChapter = "opening";
      return () => {
        delete document.documentElement.dataset.automotiveChapter;
      };
    }

    gsap.registerPlugin(ScrollTrigger);
    const select = gsap.utils.selector(root);
    let lastChapter = "";
    let lenis: Lenis | null = null;

    const updateProgress = (progress: number) => {
      const state = resolveAutomotiveTimeline(progress);
      root.style.setProperty("--automotive-progress", state.progress.toFixed(5));
      root.dataset.activeShot = state.shotId;

      if (lastChapter === state.chapterId) return;
      lastChapter = state.chapterId;
      root.dataset.activeChapter = state.chapterId;
      document.documentElement.dataset.automotiveChapter = state.chapterId;
      select<HTMLElement>("[data-chapter-link]").forEach((link) => {
        const active = link.dataset.chapterLink === state.chapterId;
        link.toggleAttribute("data-active", active);
        if (active) link.setAttribute("aria-current", "true");
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
      gsap.set(lines, { yPercent: 112 });

      // The timeline's time-zero callbacks are not guaranteed to render until
      // ScrollTrigger receives its first non-zero update. Establish a complete
      // opening frame eagerly so a fresh load never flashes or settles on black.
      gsap.set(select('[data-scene="opening"]'), { autoAlpha: 1 });
      gsap.set(select('[data-shot="opening-body"]'), {
        autoAlpha: 1,
        scale: 1.72,
        xPercent: -6,
        yPercent: 4,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "automotive-master",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateProgress(self.progress),
        },
      });

      const revealCopy = (id: string, at: number, hold: number) => {
        const block = select<HTMLElement>(`[data-copy="${id}"]`);
        const blockLines = select<HTMLElement>(`[data-copy="${id}"] [data-line-inner]`);
        timeline
          .set(block, { autoAlpha: 1 }, at)
          .fromTo(
            blockLines,
            { yPercent: 112 },
            { yPercent: 0, duration: 0.62, stagger: 0.08, ease: "power3.out" },
            at,
          )
          .to(
            blockLines,
            { yPercent: -108, duration: 0.48, stagger: 0.045, ease: "power2.in" },
            at + hold,
          )
          .set(block, { autoAlpha: 0 }, at + hold + 0.5);
      };

      timeline
        .addLabel("opening", 0)
        .set(select('[data-scene="opening"]'), { autoAlpha: 1 }, 0)
        .set(select('[data-shot="opening-body"]'), { autoAlpha: 1 }, 0)
        .fromTo(
          select('[data-shot="opening-body"]'),
          { scale: 1.72, xPercent: -6, yPercent: 4 },
          { scale: 1.08, xPercent: 0, yPercent: 0, duration: 8.7 },
          0,
        )
        .fromTo(
          select("[data-opening-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 3.2, ease: "power3.inOut" },
          1.2,
        )
        .to(select("[data-opening-glow]"), { opacity: 0.82, duration: 4.8 }, 0.8);

      revealCopy("opening-identity", 2.2, 5.7);

      timeline
        .addLabel("senna", 10)
        .set(select('[data-scene="senna"]'), { autoAlpha: 1 }, 8.9)
        .set(select('[data-shot="senna-body"]'), { autoAlpha: 1 }, 8.9)
        .fromTo(
          select('[data-shot="senna-body"]'),
          { scale: 1.2, clipPath: "inset(42% 0 42% 0)" },
          {
            scale: 1,
            clipPath: "inset(0% 0 0% 0)",
            duration: 4.5,
            ease: "power2.inOut",
          },
          9.1,
        )
        .to(select('[data-scene="opening"]'), { autoAlpha: 0, duration: 1.4 }, 9.2);

      revealCopy("senna-intro", 11.4, 3.2);

      timeline
        .set(select('[data-shot="senna-wheel"]'), { autoAlpha: 1 }, 14.7)
        .fromTo(
          select('[data-shot="senna-wheel"]'),
          { clipPath: "circle(0% at 69% 58%)", scale: 1.22 },
          {
            clipPath: "circle(88% at 69% 58%)",
            scale: 1,
            duration: 2.5,
            ease: "power3.inOut",
          },
          14.7,
        )
        .to(select('[data-shot="senna-body"]'), { autoAlpha: 0, duration: 0.8 }, 16.3)
        .to(select('[data-wheel-ring]'), { rotate: 38, duration: 4.2 }, 15.4);

      revealCopy("experience-0", 17.1, 3.1);

      timeline
        .set(select('[data-shot="senna-exhaust"]'), { autoAlpha: 1 }, 20.4)
        .fromTo(
          select('[data-shot="senna-exhaust"]'),
          { clipPath: "polygon(46% 0, 54% 0, 54% 100%, 46% 100%)", scale: 1.14 },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
            duration: 2.2,
            ease: "power3.inOut",
          },
          20.4,
        )
        .to(select('[data-shot="senna-wheel"]'), { autoAlpha: 0, duration: 0.9 }, 21.2)
        .fromTo(
          select("[data-heat-line]"),
          { scaleY: 0, opacity: 0 },
          { scaleY: 1, opacity: 0.72, duration: 1.6, ease: "power2.out" },
          21.2,
        );

      revealCopy("experience-1", 22.6, 3.1);

      timeline
        .set(select('[data-shot="senna-closed"]'), { autoAlpha: 1 }, 25.7)
        .fromTo(
          select('[data-shot="senna-closed"]'),
          { clipPath: "inset(0 50% 0 50%)", scale: 1.09 },
          {
            clipPath: "inset(0 0% 0 0%)",
            scale: 1,
            duration: 2.7,
            ease: "power3.inOut",
          },
          25.7,
        )
        .to(select('[data-shot="senna-exhaust"]'), { autoAlpha: 0, duration: 0.9 }, 26.4);

      revealCopy("experience-2", 28.2, 2.9);

      timeline
        .set(select('[data-shot="senna-open"]'), { autoAlpha: 1 }, 31.4)
        .fromTo(
          select('[data-shot="senna-open"]'),
          {
            clipPath: "polygon(47% 0, 53% 0, 58% 100%, 42% 100%)",
            filter: "brightness(0.45)",
          },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            filter: "brightness(1)",
            duration: 3,
            ease: "power2.inOut",
          },
          31.4,
        )
        .fromTo(
          select("[data-door-light]"),
          { xPercent: -125, opacity: 0 },
          { xPercent: 125, opacity: 0.8, duration: 2.7, ease: "power2.inOut" },
          31.5,
        );

      revealCopy("experience-close", 32.5, 2.7);

      timeline
        .set(select('[data-shot="senna-transition"]'), { autoAlpha: 1 }, 35.7)
        .fromTo(
          select('[data-shot="senna-transition"]'),
          { clipPath: "circle(10% at 68% 58%)", scale: 0.9, rotate: 0 },
          {
            clipPath: "circle(120% at 68% 58%)",
            scale: 2.7,
            rotate: 34,
            duration: 2.7,
            ease: "power3.in",
          },
          35.7,
        )
        .to(select('[data-shot="senna-open"]'), { autoAlpha: 0, duration: 0.8 }, 36.8)
        .addLabel("f1", 38)
        .set(select('[data-scene="f1"]'), { autoAlpha: 1 }, 37.2)
        .set(select('[data-shot="f1-hero"]'), { autoAlpha: 1 }, 37.2)
        .fromTo(
          select('[data-shot="f1-hero"]'),
          { clipPath: "circle(0% at 50% 58%)", scale: 1.12 },
          {
            clipPath: "circle(95% at 50% 58%)",
            scale: 1,
            duration: 3.1,
            ease: "power3.inOut",
          },
          37.2,
        )
        .to(select('[data-scene="senna"]'), { autoAlpha: 0, duration: 1 }, 38.7);

      revealCopy("f1-intro", 40.2, 2.7);
      revealCopy("project-0", 43.2, 2.4);

      timeline
        .set(select('[data-shot="f1-cockpit"]'), { autoAlpha: 1 }, 45.7)
        .fromTo(
          select('[data-shot="f1-cockpit"]'),
          { clipPath: "inset(50% 0 50% 0)", scale: 1.14 },
          {
            clipPath: "inset(0% 0 0% 0)",
            scale: 1,
            duration: 2,
            ease: "power3.inOut",
          },
          45.7,
        )
        .to(select('[data-shot="f1-hero"]'), { autoAlpha: 0, duration: 0.8 }, 46.8);

      revealCopy("project-1", 46.1, 2.35);
      revealCopy("project-2", 49, 2.35);

      timeline
        .set(select('[data-shot="f1-hero-return"]'), { autoAlpha: 1 }, 51.5)
        .fromTo(
          select('[data-shot="f1-hero-return"]'),
          { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", scale: 1.08 },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
            duration: 2.1,
            ease: "power3.inOut",
          },
          51.5,
        )
        .to(select('[data-shot="f1-cockpit"]'), { autoAlpha: 0, duration: 0.7 }, 52.8);

      revealCopy("project-3", 52, 2.3);
      revealCopy("project-4", 55, 2.65);

      timeline
        .fromTo(
          select("[data-f1-speedline]"),
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.7, duration: 2.2, ease: "power3.inOut" },
          57.7,
        )
        .fromTo(
          select("[data-red-orb]"),
          { scale: 0.06, opacity: 0 },
          { scale: 1, opacity: 1, duration: 3.2, ease: "power3.in" },
          58.8,
        )
        .addLabel("skyline", 62)
        .set(select('[data-scene="skyline"]'), { autoAlpha: 1 }, 61.1)
        .set(select('[data-shot="skyline-closed"]'), { autoAlpha: 1 }, 61.1)
        .set(select('[data-shot="skyline-xray"]'), { autoAlpha: 1 }, 61.1)
        .fromTo(
          select('[data-scene="skyline"]'),
          { clipPath: "circle(0% at 75% 60%)" },
          {
            clipPath: "circle(110% at 75% 60%)",
            duration: 2.8,
            ease: "power3.inOut",
          },
          61.1,
        )
        .fromTo(
          select('[data-shot="skyline-closed"]'),
          { scale: 1.12 },
          { scale: 1, duration: 3.6, ease: "power2.out" },
          61.5,
        )
        .to(select('[data-scene="f1"]'), { autoAlpha: 0, duration: 1 }, 62.3);

      revealCopy("skyline-intro", 64.5, 2.9);
      revealCopy("about-primary", 68, 3.4);
      revealCopy("about-scan", 72.1, 4.2);

      timeline
        .fromTo(
          select("[data-tail-ring]"),
          { scale: 0.2, opacity: 0 },
          { scale: 1, opacity: 0.86, duration: 2.7, stagger: 0.18, ease: "power3.out" },
          77,
        )
        .addLabel("creative", 80)
        .set(select('[data-scene="creative"]'), { autoAlpha: 1 }, 79.1)
        .fromTo(
          select("[data-aperture]"),
          { clipPath: "circle(0% at 72% 58%)", rotate: -14 },
          {
            clipPath: "circle(82% at 72% 58%)",
            rotate: 0,
            duration: 3.2,
            ease: "power3.inOut",
          },
          79.1,
        )
        .to(select('[data-scene="skyline"]'), { autoAlpha: 0, duration: 1 }, 80.5);

      revealCopy("creative-intro", 82, 2.15);
      revealCopy("creative-vfx", 84.7, 2.15);
      revealCopy("creative-photo", 87.4, 2.35);

      timeline
        .to(
          select("[data-aperture-blades]"),
          { rotate: 62, scale: 0.14, opacity: 0.15, duration: 3.1, ease: "power3.in" },
          90.8,
        )
        .to(select('[data-scene="creative"]'), { autoAlpha: 0, duration: 1.2 }, 92.8)
        .addLabel("contact", 94)
        .set(select('[data-scene="contact"]'), { autoAlpha: 1 }, 93.2)
        .fromTo(
          select("[data-contact-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 2.2, ease: "power3.inOut" },
          94.2,
        );

      revealCopy("contact", 95, 4.4);
      timeline.to({}, { duration: 0.1 }, 99.9);
    }, root);

    const saveData = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection?.saveData;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let tick: ((time: number) => void) | null = null;
    let onLenisScroll: (() => void) | null = null;

    // Native touch scrolling is already smooth and keeps input latency low.
    // Lenis is reserved for precise wheel/trackpad devices and disabled for
    // Save-Data visitors; either path still drives the same ScrollTrigger.
    if (finePointer && !saveData) {
      lenis = new Lenis({
        autoRaf: false,
        anchors: true,
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      });
      onLenisScroll = () => ScrollTrigger.update();
      tick = (time: number) => lenis?.raf(time * 1000);
      lenis.on("scroll", onLenisScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    updateProgress(ScrollTrigger.getById("automotive-master")?.progress ?? 0);
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
  }, [motionReduced]);

  const moveScanner = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    scanTargetRef.current = { element: event.currentTarget, x, y };
    if (scanFrameRef.current !== null) return;
    scanFrameRef.current = window.requestAnimationFrame(() => {
      scanFrameRef.current = null;
      const target = scanTargetRef.current;
      if (!target) return;
      target.element.style.setProperty("--scan-x", `${target.x.toFixed(2)}%`);
      target.element.style.setProperty("--scan-y", `${target.y.toFixed(2)}%`);
    });
  };

  return (
    <main
      id="main-content"
      ref={rootRef}
      className={styles.root}
      data-automotive-home
      data-active-chapter="opening"
      data-motion-mode={motionReduced ? "reduced" : "full"}
      data-scan-locked={scanLocked || undefined}
    >
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.scene} data-scene="opening">
          <div className={`${styles.shot} ${styles.openingBody}`} data-shot="opening-body">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-body-macro-v1"
              className={styles.media}
              priority
            />
          </div>
          <div className={styles.openingShade} />
          <div className={styles.openingGlow} data-opening-glow />
          <span className={styles.openingRule} data-opening-rule />
          <div className={`${styles.copy} ${styles.openingCopy}`} data-copy="opening-identity">
            <p className={styles.eyebrow}>Aayu Pratap Singh · Waterloo, Ontario</p>
            <h1 className={styles.displayTitle}>
              <MaskLine>Aayu Pratap</MaskLine>
              <MaskLine className={styles.indentedLine}>Singh</MaskLine>
            </h1>
            <MaskLine className={styles.copyDeck}>
              Computer science · engineering · motion
            </MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="senna">
          <div className={`${styles.shot} ${styles.sennaBody}`} data-shot="senna-body">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-body-macro-v1"
              className={styles.media}
            />
          </div>
          <div className={`${styles.shot} ${styles.sennaWheel}`} data-shot="senna-wheel">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-wheel-macro-v1"
              className={styles.media}
              loaded={loaded.senna}
            />
            <span className={styles.wheelRing} data-wheel-ring />
          </div>
          <div className={`${styles.shot} ${styles.sennaExhaust}`} data-shot="senna-exhaust">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-exhaust-macro-v1"
              className={styles.media}
              loaded={loaded.senna}
            />
            <span className={styles.heatLine} data-heat-line />
          </div>
          <div className={`${styles.shot} ${styles.sennaHero}`} data-shot="senna-closed">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-hero-closed-v1"
              className={styles.media}
              loaded={loaded.senna}
            />
          </div>
          <div className={`${styles.shot} ${styles.sennaHero}`} data-shot="senna-open">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-hero-open-v1"
              className={styles.media}
              loaded={loaded.senna}
            />
          </div>
          <div className={styles.doorLight} data-door-light />
          <div className={`${styles.shot} ${styles.sennaTransition}`} data-shot="senna-transition">
            <VehiclePicture
              base="/vehicles/optimized/senna/senna-wheel-macro-v1"
              className={styles.media}
              loaded={loaded.senna}
            />
          </div>

          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="senna-intro">
            <p className={styles.eyebrow}>01 / Experience</p>
            <h2 className={styles.chapterTitle}>
              <MaskLine>Systems</MaskLine>
              <MaskLine>under pressure.</MaskLine>
            </h2>
          </div>

          {experience.map((item, index) => (
            <article
              className={`${styles.copy} ${index === 1 ? styles.copyLeft : styles.copyRight} ${styles.factCopy}`}
              data-copy={`experience-${index}`}
              key={item.id}
            >
              <p className={styles.eyebrow}>
                {String(index + 1).padStart(2, "0")} · {item.discipline}
              </p>
              <h3 className={styles.factTitle}>
                <MaskLine>{item.organisation}</MaskLine>
              </h3>
              <MaskLine className={styles.factMeta}>
                {item.role} · {item.period}
              </MaskLine>
              <MaskLine className={styles.factBody}>{item.summary}</MaskLine>
            </article>
          ))}

          <div className={`${styles.copy} ${styles.copyRight} ${styles.closeCopy}`} data-copy="experience-close">
            <p className={styles.eyebrow}>Experience / Complete record</p>
            <h3 className={styles.statementTitle}>
              <MaskLine>Product.</MaskLine>
              <MaskLine>Models.</MaskLine>
              <MaskLine>Infrastructure.</MaskLine>
            </h3>
            <MaskLine className={styles.inlineLink} inert>
              <Link href="/experience">View experience ↗</Link>
            </MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="f1">
          <div className={`${styles.shot} ${styles.f1Hero}`} data-shot="f1-hero">
            <VehiclePicture
              base="/vehicles/optimized/f1/f1-hero-v1"
              className={styles.media}
              loaded={loaded.f1}
            />
          </div>
          <div className={`${styles.shot} ${styles.f1Cockpit}`} data-shot="f1-cockpit">
            <VehiclePicture
              base="/vehicles/optimized/f1/f1-cockpit-v1"
              className={styles.media}
              loaded={loaded.f1}
            />
          </div>
          <div className={`${styles.shot} ${styles.f1HeroReturn}`} data-shot="f1-hero-return">
            <VehiclePicture
              base="/vehicles/optimized/f1/f1-hero-v1"
              className={styles.media}
              loaded={loaded.f1}
            />
          </div>
          <span className={styles.f1Speedline} data-f1-speedline />
          <span className={styles.redOrb} data-red-orb />

          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="f1-intro">
            <p className={styles.eyebrow}>02 / Projects</p>
            <h2 className={styles.chapterTitle}>
              <MaskLine>Decisions at</MaskLine>
              <MaskLine>race speed.</MaskLine>
            </h2>
          </div>

          {projects.map((project, index) => (
            <article
              className={`${styles.copy} ${index % 2 ? styles.copyLeft : styles.copyRight} ${styles.factCopy}`}
              data-copy={`project-${index}`}
              key={project.slug}
            >
              <p className={styles.eyebrow}>
                {project.index} · {project.category}
              </p>
              <h3 className={styles.factTitle}>
                <MaskLine>{project.title}</MaskLine>
              </h3>
              <MaskLine className={styles.factMeta}>
                {project.period}{project.status ? ` · ${project.status}` : ""}
              </MaskLine>
              <MaskLine className={styles.factBody}>{project.summary}</MaskLine>
              <MaskLine className={styles.inlineLink} inert>
                <Link href={`/projects/${project.slug}`}>Open case study ↗</Link>
              </MaskLine>
            </article>
          ))}
        </div>

        <div className={styles.scene} data-scene="skyline">
          <div
            className={styles.skylineScanner}
            onPointerMove={moveScanner}
            onPointerLeave={(event) => {
              if (scanLocked) return;
              event.currentTarget.style.setProperty("--scan-x", "67%");
              event.currentTarget.style.setProperty("--scan-y", "46%");
            }}
          >
            <div className={`${styles.shot} ${styles.skylineHero}`} data-shot="skyline-closed">
              <VehiclePicture
                base="/vehicles/optimized/skyline/skyline-hero-closed-v1"
                className={styles.media}
                loaded={loaded.skyline}
              />
            </div>
            <div className={`${styles.shot} ${styles.skylineXray}`} data-shot="skyline-xray">
              <VehiclePicture
                base="/vehicles/optimized/skyline/skyline-hero-xray-v1"
                className={styles.media}
                loaded={loaded.skyline}
              />
            </div>
          </div>
          <div className={styles.tailRings} aria-hidden="true">
            <span data-tail-ring />
            <span data-tail-ring />
            <span data-tail-ring />
            <span data-tail-ring />
          </div>
          <button
            className={styles.scanToggle}
            type="button"
            tabIndex={-1}
            aria-pressed={scanLocked}
            onClick={() => setScanLocked((current) => !current)}
          >
            {scanLocked ? "Close hood scan" : "Hold hood scan"}
          </button>

          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="skyline-intro">
            <p className={styles.eyebrow}>03 / About</p>
            <h2 className={styles.chapterTitle}>
              <MaskLine>Look beneath</MaskLine>
              <MaskLine>the surface.</MaskLine>
            </h2>
          </div>
          <div className={`${styles.copy} ${styles.copyRight} ${styles.factCopy}`} data-copy="about-primary">
            <p className={styles.eyebrow}>Aayu Pratap Singh</p>
            <h3 className={styles.factTitle}>
              <MaskLine>Computer science</MaskLine>
              <MaskLine>at Waterloo.</MaskLine>
            </h3>
            <MaskLine className={styles.factBody}>
              Product engineering, machine learning, infrastructure, simulation, and visual storytelling.
            </MaskLine>
          </div>
          <div className={`${styles.copy} ${styles.copyLeft} ${styles.factCopy}`} data-copy="about-scan">
            <p className={styles.eyebrow}>Registered diagnostic layer</p>
            <h3 className={styles.factTitle}>
              <MaskLine>Motorsport.</MaskLine>
              <MaskLine>Football. Film.</MaskLine>
            </h3>
            <MaskLine className={styles.factBody}>
              Move across the hood to reveal the system beneath it.
            </MaskLine>
            <MaskLine className={styles.inlineLink} inert>
              <Link href="/about">Read about Aayu ↗</Link>
            </MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="creative">
          <div className={styles.aperture} data-aperture>
            <div className={styles.apertureBlades} data-aperture-blades>
              {Array.from({ length: 8 }, (_, index) => (
                <span key={index} style={{ "--blade": index } as React.CSSProperties} />
              ))}
            </div>
            <div className={styles.apertureImage}>
              <VehiclePicture
                base="/vehicles/optimized/senna/senna-exhaust-macro-v1"
                className={styles.media}
                loaded={loaded.creative}
              />
            </div>
          </div>
          <div className={`${styles.copy} ${styles.copyLeft}`} data-copy="creative-intro">
            <p className={styles.eyebrow}>04 / Creative practice</p>
            <h2 className={styles.chapterTitle}>
              <MaskLine>Frames with</MaskLine>
              <MaskLine>intent.</MaskLine>
            </h2>
          </div>
          <div className={`${styles.copy} ${styles.copyRight} ${styles.factCopy}`} data-copy="creative-vfx">
            <p className={styles.eyebrow}>VFX / Motion</p>
            <h3 className={styles.factTitle}>
              <MaskLine>Compositing.</MaskLine>
              <MaskLine>Light. Timing.</MaskLine>
            </h3>
            <MaskLine className={styles.factBody}>
              A dedicated home for finished VFX work and process breakdowns. Final media pending.
            </MaskLine>
          </div>
          <div className={`${styles.copy} ${styles.copyLeft} ${styles.factCopy}`} data-copy="creative-photo">
            <p className={styles.eyebrow}>Photography</p>
            <h3 className={styles.factTitle}>
              <MaskLine>Observation</MaskLine>
              <MaskLine>over spectacle.</MaskLine>
            </h3>
            <MaskLine className={styles.factBody}>
              The archive remains explicitly placeholder-only until Aayu supplies the final work.
            </MaskLine>
            <MaskLine className={styles.inlineLink} inert>
              <Link href="/archive">Enter the archive ↗</Link>
            </MaskLine>
          </div>
        </div>

        <div className={styles.scene} data-scene="contact">
          <span className={styles.contactRule} data-contact-rule />
          <div className={`${styles.copy} ${styles.contactCopy}`} data-copy="contact">
            <p className={styles.eyebrow}>05 / Contact</p>
            <h2 className={styles.contactTitle}>
              <MaskLine>Let’s build</MaskLine>
              <MaskLine>what moves next.</MaskLine>
            </h2>
            <MaskLine className={styles.contactEmail} inert>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </MaskLine>
            <MaskLine className={styles.contactLinks} inert>
              <a href={siteConfig.github} target="_blank" rel="noreferrer">GitHub ↗</a>
              <Link href="/resume">Résumé ↗</Link>
            </MaskLine>
          </div>
        </div>

        <div className={styles.stageFinish} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.hud} aria-hidden="true">
          <span>APS / 2026</span>
          <span className={styles.hudChapter}>Automotive study</span>
          <i />
        </div>

      </div>

      <nav className={styles.chapterRail} aria-label="Homepage chapters">
        {chapterLinks.map((chapter, index) => (
          <a
            href={chapter.href}
            data-chapter-link={chapter.id}
            data-active={index === 0 ? "" : undefined}
            aria-current={index === 0 ? "true" : undefined}
            key={chapter.id}
          >
            <span>{chapter.label}</span>
            <i aria-hidden="true">{String(index).padStart(2, "0")}</i>
          </a>
        ))}
      </nav>

      <div className={styles.scrollTrack}>
        <section id="opening" className={styles.trackOpening} aria-label="Introduction">
          <ReducedChapter
            eyebrow="Aayu Pratap Singh · Waterloo, Ontario"
            title="Engineering in motion."
            body="Computer Science at the University of Waterloo. Product, machine learning, infrastructure, simulation, and visual storytelling."
            image="/vehicles/optimized/senna/senna-body-macro-v1"
            imageAlt="Orange performance car body detail in a dark studio."
            headingLevel={1}
            linksEnabled={motionReduced}
          />
        </section>
        <section
          id="experience"
          className={styles.trackSenna}
          aria-label="Experience"
          data-load-chapter="senna"
        >
          <ReducedChapter
            eyebrow="01 / Experience"
            title="Systems under pressure."
            body="UniMarket, WAT.AI SportsNext, and ATS Corporation—product ownership, learning match dynamics, and reliable infrastructure."
            image="/vehicles/optimized/senna/senna-hero-open-v1"
            imageAlt="Orange performance car with dihedral doors raised in a dark studio."
            align="right"
            linksEnabled={motionReduced}
          >
            <Link href="/experience">View complete experience ↗</Link>
          </ReducedChapter>
        </section>
        <section
          id="projects"
          className={styles.trackF1}
          aria-label="Projects"
          data-load-chapter="f1"
        >
          <ReducedChapter
            eyebrow="02 / Projects"
            title="Decisions at race speed."
            body="Five projects across telemetry, simulation, full-stack product engineering, machine learning, RAG, and real-time creative technology."
            image="/vehicles/optimized/f1/f1-hero-v1"
            imageAlt="Unbranded open-wheel race car in a dark studio."
            linksEnabled={motionReduced}
          >
            <Link href="/projects">Explore all projects ↗</Link>
          </ReducedChapter>
        </section>
        <section
          id="about"
          className={styles.trackSkyline}
          aria-label="About"
          data-load-chapter="skyline"
        >
          <ReducedChapter
            eyebrow="03 / About"
            title="Look beneath the surface."
            body="Aayu studies Computer Science at Waterloo and works across software, ML, systems, sport, and image."
            image="/vehicles/optimized/skyline/skyline-hero-xray-v1"
            imageAlt="Blue Japanese performance car with a diagnostic view through the hood."
            align="right"
            linksEnabled={motionReduced}
          >
            <Link href="/about">About Aayu ↗</Link>
          </ReducedChapter>
        </section>
        <section
          id="creative"
          className={styles.trackCreative}
          aria-label="Creative work"
          data-load-chapter="creative"
        >
          <ReducedChapter
            eyebrow="04 / Creative practice"
            title="Frames with intent."
            body="A future home for Aayu’s VFX, motion work, photography, and process. All current archive media is clearly marked as placeholder."
            image="/vehicles/optimized/senna/senna-exhaust-macro-v1"
            imageAlt="Mechanical exhaust detail lit in a dark studio."
            linksEnabled={motionReduced}
          >
            <Link href="/archive">Enter the archive ↗</Link>
          </ReducedChapter>
        </section>
        <section id="contact" className={styles.trackContact} aria-label="Contact">
          <ReducedChapter
            eyebrow="05 / Contact"
            title="Let’s build what moves next."
            body={`${siteConfig.name} · ${siteConfig.location}`}
            linksEnabled={motionReduced}
          >
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </ReducedChapter>
        </section>
      </div>
    </main>
  );
}
