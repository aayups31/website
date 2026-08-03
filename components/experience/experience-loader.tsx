"use client";

import dynamic from "next/dynamic";

const ExperienceShell = dynamic(
  () => import("./experience-shell").then((module) => module.ExperienceShell),
  {
    ssr: false,
    loading: () => <div className="experience-fallback experience-fallback--loading" aria-hidden="true" />,
  },
);

export function ExperienceLoader() {
  return <ExperienceShell />;
}
