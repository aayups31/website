import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aayu Pratap Singh — Engineer & Founder",
    short_name: "Aayu",
    description:
      "Selected product, machine-learning, infrastructure, simulation, VFX, and photography work by Aayu Pratap Singh.",
    start_url: "/",
    display: "standalone",
    background_color: "#050607",
    theme_color: "#050607",
    orientation: "portrait-primary",
    categories: ["portfolio", "technology", "design"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
