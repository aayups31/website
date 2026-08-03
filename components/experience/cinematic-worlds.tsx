"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  type WorldId,
  useExperienceStore,
  worldOrder,
} from "@/lib/experience-store";

type ImageLayer = {
  shot: string;
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
        shot: "prologue-aerial",
        src: "/media/football/stadium-aerial.webp",
        className: "cinematic-layer--base image--stadium-aerial",
        position: "50% 52%",
      },
      {
        shot: "prologue-bowl",
        src: "/media/football/stadium-bowl.webp",
        className: "cinematic-layer--far image--stadium-bowl",
        position: "50% 58%",
      },
      {
        shot: "prologue-locker",
        src: "/media/football/locker-room.jpg",
        className:
          "cinematic-layer--near cinematic-layer--optional image--locker-threshold",
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
        shot: "football-night",
        src: "/media/football/match-night.webp",
        className: "cinematic-layer--base image--match-night",
        position: "52% 48%",
      },
      {
        shot: "football-bowl",
        src: "/media/football/stadium-bowl.webp",
        className: "cinematic-layer--far image--football-bowl",
        position: "50% 58%",
      },
      {
        shot: "football-locker",
        src: "/media/football/locker-room.jpg",
        className: "cinematic-layer--middle image--football-locker",
        position: "50% 50%",
        sizes: "(max-width: 760px) 92vw, 62vw",
      },
      {
        shot: "football-pitch",
        src: "/media/football/pitch-line.jpeg",
        className:
          "cinematic-layer--near cinematic-layer--optional image--football-pitch",
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
        shot: "racing-studio",
        src: "/media/racing/studio-car.avif",
        className: "cinematic-layer--base image--racing-studio",
        position: "50% 56%",
      },
      {
        shot: "racing-garage",
        src: "/media/racing/garage.jpeg",
        className: "cinematic-layer--middle image--racing-garage",
        position: "50% 50%",
        sizes: "(max-width: 760px) 94vw, 58vw",
      },
      {
        shot: "racing-corner",
        src: "/media/racing/ferrari-corner.jpg",
        className: "cinematic-layer--far image--racing-corner",
        position: "70% 52%",
      },
      {
        shot: "racing-track",
        src: "/media/racing/car-on-track.jpg",
        className: "cinematic-layer--near image--racing-track",
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
        shot: "music-arena",
        src: "/media/music/zimmer-arena.jpg",
        className: "cinematic-layer--base image--music-arena",
        position: "50% 52%",
      },
      {
        shot: "music-linkin-art",
        src: "/media/music/linkin-park-hybrid.jpg",
        className: "cinematic-layer--far image--music-linkin",
        position: "50% 50%",
      },
      {
        shot: "music-linkin-band",
        src: "/media/music/linkin-park-band.jpeg",
        className:
          "cinematic-layer--near cinematic-layer--optional image--music-band",
        position: "50% 50%",
        sizes: "(max-width: 760px) 88vw, 54vw",
      },
      {
        shot: "music-orchestra",
        src: "/media/music/zimmer-orchestra.webp",
        className: "cinematic-layer--middle image--music-orchestra",
        position: "50% 48%",
      },
      {
        shot: "music-stars",
        src: "/media/music/zimmer-stars.jpg",
        className:
          "cinematic-layer--near cinematic-layer--optional image--music-stars",
        position: "50% 50%",
        sizes: "(max-width: 760px) 76vw, 42vw",
      },
      {
        shot: "music-michael-stage",
        src: "/media/music/michael-jackson-stage.jpg",
        className: "cinematic-layer--near image--music-michael",
        position: "50% 32%",
        sizes: "(max-width: 760px) 74vw, 34vw",
      },
      {
        shot: "music-michael-glove",
        src: "/media/music/michael-jackson-glove.jpeg",
        className:
          "cinematic-layer--middle cinematic-layer--optional image--music-glove",
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
        shot: "archive-drift",
        src: "/media/archive/drifting.jpg",
        className: "cinematic-layer--base image--archive-drift",
        position: "52% 50%",
      },
      {
        shot: "archive-parked",
        src: "/media/archive/parked.jpg",
        className: "cinematic-layer--middle image--archive-parked",
        position: "50% 55%",
        sizes: "(max-width: 760px) 78vw, 38vw",
      },
      {
        shot: "archive-engine",
        src: "/media/archive/skyline-engine.jpg",
        className: "cinematic-layer--near image--archive-engine",
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
        shot: "contact-stars",
        src: "/media/music/zimmer-stars.jpg",
        className: "cinematic-layer--base image--contact-stars",
        position: "50% 45%",
      },
      {
        shot: "contact-aerial",
        src: "/media/football/stadium-aerial.webp",
        className: "cinematic-layer--far image--contact-aerial",
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
            {layers.map((layer, index) => {
              const depth = layer.className.includes("cinematic-layer--near")
                ? "near"
                : layer.className.includes("cinematic-layer--middle")
                  ? "middle"
                  : "far";

              return (
                <div
                  className={`cinematic-shot cinematic-shot--${layer.shot}`}
                  data-cinematic-shot={layer.shot}
                  data-depth={depth}
                  key={layer.shot}
                >
                  <div className="cinematic-shot__camera" data-camera-rig>
                    <div className={`cinematic-layer cinematic-shot__image ${layer.className}`}>
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
                  </div>
                </div>
              );
            })}
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
