"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

type AtmosphereLayer = {
  src: string;
  position: string;
  depth: "far" | "middle" | "near";
};

type AtmosphereConfig = {
  id: string;
  tone: string;
  layers: AtmosphereLayer[];
};

const routeAtmospheres: Record<string, AtmosphereConfig> = {
  experience: {
    id: "experience",
    tone: "stadium-blue",
    layers: [
      { src: "/media/football/stadium-bowl.webp", position: "50% 54%", depth: "far" },
      { src: "/media/football/locker-room.jpg", position: "50% 48%", depth: "near" },
    ],
  },
  projects: {
    id: "projects",
    tone: "race-amber",
    layers: [
      { src: "/media/racing/studio-car.avif", position: "52% 58%", depth: "far" },
      { src: "/media/racing/car-on-track.jpg", position: "64% 50%", depth: "middle" },
    ],
  },
  "case-f1": {
    id: "case-f1",
    tone: "race-red",
    layers: [
      { src: "/media/racing/ferrari-corner.jpg", position: "68% 52%", depth: "far" },
      { src: "/media/racing/car-on-track.jpg", position: "62% 50%", depth: "near" },
    ],
  },
  "case-sports": {
    id: "case-sports",
    tone: "pitch-blue",
    layers: [
      { src: "/media/football/match-night.webp", position: "50% 48%", depth: "far" },
      { src: "/media/football/pitch-line.jpeg", position: "50% 52%", depth: "near" },
    ],
  },
  "case-music": {
    id: "case-music",
    tone: "concert-gold",
    layers: [
      { src: "/media/music/zimmer-arena.jpg", position: "50% 52%", depth: "far" },
      { src: "/media/music/zimmer-stars.jpg", position: "50% 48%", depth: "near" },
    ],
  },
  "case-product": {
    id: "case-product",
    tone: "signal-cyan",
    layers: [
      { src: "/media/archive/skyline-engine.jpg", position: "50% 46%", depth: "far" },
      { src: "/media/racing/garage.jpeg", position: "50% 50%", depth: "middle" },
    ],
  },
  about: {
    id: "about",
    tone: "memory-indigo",
    layers: [
      { src: "/media/football/stadium-aerial.webp", position: "54% 50%", depth: "far" },
      { src: "/media/music/zimmer-orchestra.webp", position: "50% 48%", depth: "middle" },
    ],
  },
  archive: {
    id: "archive",
    tone: "electric-cyan",
    layers: [
      { src: "/media/archive/drifting.jpg", position: "52% 50%", depth: "far" },
      { src: "/media/archive/parked.jpg", position: "50% 54%", depth: "near" },
    ],
  },
  resume: {
    id: "resume",
    tone: "blueprint-blue",
    layers: [
      { src: "/media/football/stadium-aerial.webp", position: "50% 50%", depth: "far" },
      { src: "/media/archive/skyline-engine.jpg", position: "50% 48%", depth: "near" },
    ],
  },
  contact: {
    id: "contact",
    tone: "signal-gold",
    layers: [
      { src: "/media/music/zimmer-stars.jpg", position: "50% 45%", depth: "far" },
      { src: "/media/football/stadium-aerial.webp", position: "50% 50%", depth: "middle" },
    ],
  },
};

function atmosphereForPath(pathname: string): AtmosphereConfig | null {
  if (pathname === "/") return null;
  if (pathname === "/experience") return routeAtmospheres.experience;
  if (pathname === "/projects") return routeAtmospheres.projects;
  if (pathname === "/about") return routeAtmospheres.about;
  if (pathname === "/archive") return routeAtmospheres.archive;
  if (pathname === "/resume") return routeAtmospheres.resume;
  if (pathname === "/contact") return routeAtmospheres.contact;

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.slice("/projects/".length);
    if (slug === "f1-strategy-engine") return routeAtmospheres["case-f1"];
    if (slug === "sportsnext-world-model") return routeAtmospheres["case-sports"];
    if (slug === "emotion-music-mixer") return routeAtmospheres["case-music"];
    return routeAtmospheres["case-product"];
  }

  return routeAtmospheres.contact;
}

/** Decorative route-specific media, styled and scrubbed by the shared motion layer. */
export function RouteAtmosphere() {
  const pathname = usePathname();
  const atmosphere = atmosphereForPath(pathname);
  if (!atmosphere) return null;

  return (
    <div
      className={`route-atmosphere route-atmosphere--${atmosphere.id}`}
      data-route-atmosphere={atmosphere.id}
      data-route-tone={atmosphere.tone}
      aria-hidden="true"
    >
      {atmosphere.layers.map((layer, index) => (
        <div
          className={`route-atmosphere__layer route-atmosphere__layer--${layer.depth}`}
          data-parallax
          data-motion-depth={layer.depth}
          key={`${atmosphere.id}-${layer.src}`}
        >
          <Image
            src={layer.src}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            style={{ objectPosition: layer.position }}
          />
        </div>
      ))}
      <div className="route-atmosphere__light" />
      <div className="route-atmosphere__texture" />
      <div className="route-atmosphere__veil" />
    </div>
  );
}
