"use client";

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
    tone: "senna-orange",
    layers: [
      { src: "/vehicles/optimized/senna/senna-hero-closed-v1-desktop.webp", position: "58% 56%", depth: "far" },
      { src: "/vehicles/optimized/senna/senna-body-macro-v1-desktop.webp", position: "48% 50%", depth: "near" },
    ],
  },
  projects: {
    id: "projects",
    tone: "race-amber",
    layers: [
      { src: "/vehicles/optimized/f1/f1-hero-v1-desktop.webp", position: "56% 56%", depth: "far" },
      { src: "/vehicles/optimized/f1/f1-cockpit-v1-desktop.webp", position: "50% 48%", depth: "middle" },
    ],
  },
  "case-f1": {
    id: "case-f1",
    tone: "race-red",
    layers: [
      { src: "/vehicles/optimized/f1/f1-cockpit-v1-desktop.webp", position: "52% 50%", depth: "far" },
      { src: "/vehicles/optimized/f1/f1-hero-v1-desktop.webp", position: "62% 55%", depth: "near" },
    ],
  },
  "case-sports": {
    id: "case-sports",
    tone: "technical-blue",
    layers: [
      { src: "/vehicles/optimized/skyline/skyline-hero-closed-v1-desktop.webp", position: "55% 56%", depth: "far" },
      { src: "/vehicles/optimized/skyline/skyline-hero-xray-v1-desktop.webp", position: "56% 52%", depth: "near" },
    ],
  },
  "case-music": {
    id: "case-music",
    tone: "aperture-amber",
    layers: [
      { src: "/vehicles/optimized/senna/senna-exhaust-macro-v1-desktop.webp", position: "50% 50%", depth: "far" },
      { src: "/vehicles/optimized/senna/senna-wheel-macro-v1-desktop.webp", position: "67% 54%", depth: "near" },
    ],
  },
  "case-product": {
    id: "case-product",
    tone: "signal-cyan",
    layers: [
      { src: "/vehicles/optimized/skyline/skyline-hero-xray-v1-desktop.webp", position: "56% 52%", depth: "far" },
      { src: "/vehicles/optimized/senna/senna-body-macro-v1-desktop.webp", position: "48% 50%", depth: "middle" },
    ],
  },
  about: {
    id: "about",
    tone: "skyline-blue",
    layers: [
      { src: "/vehicles/optimized/skyline/skyline-hero-closed-v1-desktop.webp", position: "56% 56%", depth: "far" },
      { src: "/vehicles/optimized/skyline/skyline-hero-xray-v1-desktop.webp", position: "57% 52%", depth: "middle" },
    ],
  },
  archive: {
    id: "archive",
    tone: "electric-cyan",
    layers: [
      { src: "/vehicles/optimized/senna/senna-exhaust-macro-v1-desktop.webp", position: "50% 50%", depth: "far" },
      { src: "/vehicles/optimized/skyline/skyline-hero-xray-v1-desktop.webp", position: "61% 52%", depth: "near" },
    ],
  },
  resume: {
    id: "resume",
    tone: "blueprint-blue",
    layers: [
      { src: "/vehicles/optimized/senna/senna-body-macro-v1-desktop.webp", position: "46% 50%", depth: "far" },
      { src: "/vehicles/optimized/skyline/skyline-hero-xray-v1-desktop.webp", position: "58% 52%", depth: "near" },
    ],
  },
  contact: {
    id: "contact",
    tone: "signal-gold",
    layers: [
      { src: "/vehicles/optimized/senna/senna-body-macro-v1-desktop.webp", position: "52% 50%", depth: "far" },
      { src: "/vehicles/optimized/senna/senna-exhaust-macro-v1-desktop.webp", position: "50% 50%", depth: "middle" },
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
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={layer.src.replace("-desktop.webp", "-mobile.webp")}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.src}
              srcSet={`${layer.src.replace("-desktop.webp", "-mobile.webp")} 2160w, ${layer.src} 3840w`}
              sizes="100vw"
              alt=""
              width={3840}
              height={2161}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              style={{ objectPosition: layer.position }}
            />
          </picture>
        </div>
      ))}
      <div className="route-atmosphere__light" />
      <div className="route-atmosphere__texture" />
      <div className="route-atmosphere__veil" />
    </div>
  );
}
