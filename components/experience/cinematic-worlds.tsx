"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  type WorldId,
  useExperienceStore,
  worldOrder,
} from "@/lib/experience-store";

type ImageLayer = {
  src: string;
  className: string;
  position?: string;
  sizes?: string;
};

type WorldComposition = {
  id: WorldId;
  label: string;
  watermark: string;
  layers: ImageLayer[];
};

const compositions: WorldComposition[] = [
  {
    id: "prologue",
    label: "The opening frame",
    watermark: "BEHIND THE MOMENT",
    layers: [
      {
        src: "/media/football/stadium-aerial.webp",
        className: "cinematic-layer--base image--stadium-aerial",
        position: "50% 52%",
      },
      {
        src: "/media/football/stadium-bowl.webp",
        className:
          "cinematic-layer--far cinematic-layer--phase-middle image--stadium-bowl",
        position: "50% 58%",
      },
      {
        src: "/media/football/locker-room.jpg",
        className:
          "cinematic-layer--near cinematic-layer--phase-outro cinematic-layer--optional image--locker-threshold",
        position: "50% 50%",
        sizes: "(max-width: 760px) 78vw, 48vw",
      },
    ],
  },
  {
    id: "football",
    label: "Performance world",
    watermark: "BUILT BACKSTAGE",
    layers: [
      {
        src: "/media/football/match-night.webp",
        className: "cinematic-layer--base image--match-night",
        position: "52% 48%",
      },
      {
        src: "/media/football/stadium-bowl.webp",
        className:
          "cinematic-layer--far cinematic-layer--phase-intro image--football-bowl",
        position: "50% 58%",
      },
      {
        src: "/media/football/locker-room.jpg",
        className:
          "cinematic-layer--middle cinematic-layer--phase-middle image--football-locker",
        position: "50% 50%",
        sizes: "(max-width: 760px) 92vw, 62vw",
      },
      {
        src: "/media/football/pitch-line.jpeg",
        className:
          "cinematic-layer--near cinematic-layer--phase-outro cinematic-layer--optional image--football-pitch",
        position: "50% 50%",
        sizes: "(max-width: 760px) 72vw, 38vw",
      },
    ],
  },
  {
    id: "racing",
    label: "Precision world",
    watermark: "EVERY SIGNAL",
    layers: [
      {
        src: "/media/racing/studio-car.avif",
        className: "cinematic-layer--base image--racing-studio",
        position: "50% 56%",
      },
      {
        src: "/media/racing/garage.jpeg",
        className:
          "cinematic-layer--middle cinematic-layer--phase-intro image--racing-garage",
        position: "50% 50%",
        sizes: "(max-width: 760px) 94vw, 58vw",
      },
      {
        src: "/media/racing/ferrari-corner.jpg",
        className:
          "cinematic-layer--far cinematic-layer--phase-middle image--racing-corner",
        position: "70% 52%",
      },
      {
        src: "/media/racing/car-on-track.jpg",
        className:
          "cinematic-layer--near cinematic-layer--phase-outro image--racing-track",
        position: "62% 50%",
      },
    ],
  },
  {
    id: "music",
    label: "Music world",
    watermark: "LISTEN CLOSELY",
    layers: [
      {
        src: "/media/music/zimmer-arena.jpg",
        className: "cinematic-layer--base image--music-arena",
        position: "50% 52%",
      },
      {
        src: "/media/music/linkin-park-hybrid.jpg",
        className:
          "cinematic-layer--far cinematic-layer--phase-intro cinematic-layer--music-linkin image--music-linkin",
        position: "50% 50%",
      },
      {
        src: "/media/music/linkin-park-band.jpeg",
        className:
          "cinematic-layer--near cinematic-layer--phase-intro cinematic-layer--music-linkin cinematic-layer--optional image--music-band",
        position: "50% 50%",
        sizes: "(max-width: 760px) 88vw, 54vw",
      },
      {
        src: "/media/music/zimmer-orchestra.webp",
        className:
          "cinematic-layer--middle cinematic-layer--phase-middle cinematic-layer--music-zimmer image--music-orchestra",
        position: "50% 48%",
      },
      {
        src: "/media/music/zimmer-stars.jpg",
        className:
          "cinematic-layer--near cinematic-layer--phase-middle cinematic-layer--music-zimmer cinematic-layer--optional image--music-stars",
        position: "50% 50%",
        sizes: "(max-width: 760px) 76vw, 42vw",
      },
      {
        src: "/media/music/michael-jackson-stage.jpg",
        className:
          "cinematic-layer--near cinematic-layer--phase-outro cinematic-layer--music-michael image--music-michael",
        position: "50% 32%",
        sizes: "(max-width: 760px) 74vw, 34vw",
      },
      {
        src: "/media/music/michael-jackson-glove.jpeg",
        className:
          "cinematic-layer--middle cinematic-layer--phase-outro cinematic-layer--music-michael cinematic-layer--optional image--music-glove",
        position: "50% 38%",
        sizes: "24vw",
      },
    ],
  },
  {
    id: "archive",
    label: "Image world",
    watermark: "IMAGE / MOTION",
    layers: [
      {
        src: "/media/archive/drifting.jpg",
        className: "cinematic-layer--base image--archive-drift",
        position: "52% 50%",
      },
      {
        src: "/media/archive/parked.jpg",
        className:
          "cinematic-layer--middle cinematic-layer--phase-intro image--archive-parked",
        position: "50% 55%",
        sizes: "(max-width: 760px) 78vw, 38vw",
      },
      {
        src: "/media/archive/skyline-engine.jpg",
        className:
          "cinematic-layer--near cinematic-layer--phase-middle image--archive-engine",
        position: "50% 48%",
        sizes: "(max-width: 760px) 76vw, 34vw",
      },
    ],
  },
  {
    id: "contact",
    label: "Signal open",
    watermark: "MAKE CONTACT",
    layers: [
      {
        src: "/media/music/zimmer-stars.jpg",
        className: "cinematic-layer--base image--contact-stars",
        position: "50% 45%",
      },
      {
        src: "/media/football/stadium-aerial.webp",
        className:
          "cinematic-layer--far cinematic-layer--phase-outro image--contact-aerial",
        position: "50% 50%",
      },
    ],
  },
];

export function CinematicWorlds() {
  const activeWorld = useExperienceStore((state) => state.activeWorld);
  const quality = useExperienceStore((state) => state.quality);
  const setStageReady = useExperienceStore((state) => state.setStageReady);
  const readyRef = useRef(false);
  const activeIndex = Math.max(0, worldOrder.indexOf(activeWorld));

  const visibleWorlds = useMemo(
    () =>
      compositions.filter((composition) => {
        const index = worldOrder.indexOf(composition.id);
        return Math.abs(index - activeIndex) <= 1;
      }),
    [activeIndex],
  );

  const markReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    setStageReady(true);
  }, [setStageReady]);

  useEffect(() => {
    const timeout = window.setTimeout(markReady, 2600);
    return () => window.clearTimeout(timeout);
  }, [markReady]);

  return (
    <div className="cinematic-worlds" data-cinematic-worlds>
      {visibleWorlds.map((world) => {
        const layers = world.layers.filter(
          (layer) => quality !== "low" || !layer.className.includes("cinematic-layer--optional"),
        );
        return (
          <div
            className={`cinematic-world cinematic-world--${world.id}`}
            data-cinematic-world={world.id}
            key={world.id}
          >
            {layers.map((layer, index) => (
              <div className={`cinematic-layer ${layer.className}`} key={layer.src}>
                <Image
                  src={layer.src}
                  alt=""
                  fill
                  sizes={layer.sizes ?? "100vw"}
                  priority={world.id === "prologue" && index === 0}
                  onLoad={world.id === "prologue" && index === 0 ? markReady : undefined}
                  onError={world.id === "prologue" && index === 0 ? markReady : undefined}
                  style={{ objectPosition: layer.position }}
                />
              </div>
            ))}
            <div className="cinematic-world__light" />
            <div className="cinematic-world__aperture" />
            <p className="cinematic-world__label">{world.label}</p>
            <p className="cinematic-world__watermark">{world.watermark}</p>
          </div>
        );
      })}
      <div className="cinematic-grain" />
      <div className="cinematic-scan" />
    </div>
  );
}
