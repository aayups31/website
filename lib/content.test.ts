import { describe, expect, it } from "vitest";
import { archiveItems, experience, projects, siteConfig, values } from "./content";

describe("portfolio content", () => {
  it("uses unique project slugs and indices", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
    expect(new Set(projects.map(({ index }) => index)).size).toBe(projects.length);
  });

  it("keeps every experience item evidence-backed", () => {
    for (const item of experience) {
      expect(item.evidence.length).toBeGreaterThanOrEqual(3);
      expect(item.summary.length).toBeGreaterThan(30);
    }
  });

  it("labels all archive placeholders honestly", () => {
    expect(archiveItems.every(({ status }) => status === "Placeholder")).toBe(true);
  });

  it("never uses the retired creative alias", () => {
    const serialized = JSON.stringify({ archiveItems, experience, projects, siteConfig, values });
    expect(serialized.toLowerCase()).not.toContain("dark vfx");
    expect(serialized.toLowerCase()).not.toContain("psychological horror");
  });
});
