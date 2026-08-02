import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aayups31.github.io/website";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-02T00:00:00.000Z");

  const pages = [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/experience`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/projects`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/archive`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${siteUrl}/resume`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ] satisfies MetadataRoute.Sitemap;

  const projectPages: MetadataRoute.Sitemap = projects.map(({ slug }) => ({
    url: `${siteUrl}/projects/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...pages.map((entry) => ({ ...entry, lastModified })), ...projectPages];
}
