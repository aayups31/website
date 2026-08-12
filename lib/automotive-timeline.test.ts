import { describe, expect, it } from "vitest";
import {
  AUTOMOTIVE_EDIT,
  AUTOMOTIVE_CHAPTERS,
  AUTOMOTIVE_SHOTS,
  clampTimelineProgress,
  getLocalProgress,
  resolveAutomotiveTimeline,
  resolveChapterShot,
} from "./automotive-timeline";

describe("automotive timeline", () => {
  it("covers the normalized timeline with contiguous chapters and shots", () => {
    expect(AUTOMOTIVE_CHAPTERS[0].start).toBe(0);
    expect(AUTOMOTIVE_CHAPTERS.at(-1)?.end).toBe(1);
    for (const [index, chapter] of AUTOMOTIVE_CHAPTERS.entries()) {
      if (index) expect(chapter.start).toBe(AUTOMOTIVE_CHAPTERS[index - 1].end);
      const shots = AUTOMOTIVE_SHOTS[chapter.id];
      expect(shots[0].start).toBe(0);
      expect(shots.at(-1)?.end).toBe(1);
      shots.forEach((shot, shotIndex) => {
        expect(shot.end).toBeGreaterThan(shot.start);
        if (shotIndex) expect(shot.start).toBe(shots[shotIndex - 1].end);
      });
    }
  });

  it("clamps finite and non-finite progress deterministically", () => {
    expect(clampTimelineProgress(-0.2)).toBe(0);
    expect(clampTimelineProgress(0.42)).toBe(0.42);
    expect(clampTimelineProgress(1.2)).toBe(1);
    expect(clampTimelineProgress(Number.NaN)).toBe(0);
    expect(clampTimelineProgress(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(clampTimelineProgress(Number.POSITIVE_INFINITY)).toBe(1);
  });

  it("calculates clamped local progress", () => {
    const start = AUTOMOTIVE_EDIT.aboutEnd / AUTOMOTIVE_EDIT.total;
    const end = AUTOMOTIVE_EDIT.experienceEnd / AUTOMOTIVE_EDIT.total;
    expect(getLocalProgress(start, start, end)).toBe(0);
    expect(getLocalProgress((start + end) / 2, start, end)).toBeCloseTo(0.5);
    expect(getLocalProgress(end + 0.2, start, end)).toBe(1);
    expect(() => getLocalProgress(0.5, 0.5, 0.5)).toThrow(RangeError);
  });

  it("maps exact chapter boundaries to the incoming semantic chapter", () => {
    expect(resolveAutomotiveTimeline(0)).toMatchObject({ chapterId: "about", shotId: "identity" });
    expect(resolveAutomotiveTimeline(AUTOMOTIVE_EDIT.aboutEnd / AUTOMOTIVE_EDIT.total)).toMatchObject({ chapterId: "experience", shotId: "senna-carbon" });
    expect(resolveAutomotiveTimeline(AUTOMOTIVE_EDIT.experienceEnd / AUTOMOTIVE_EDIT.total)).toMatchObject({ chapterId: "projects", shotId: "tyre-match" });
    expect(resolveAutomotiveTimeline(AUTOMOTIVE_EDIT.projectsEnd / AUTOMOTIVE_EDIT.total)).toMatchObject({ chapterId: "creative", shotId: "aperture" });
    expect(resolveAutomotiveTimeline(AUTOMOTIVE_EDIT.creativeEnd / AUTOMOTIVE_EDIT.total)).toMatchObject({ chapterId: "contact", shotId: "end-frame" });
    expect(resolveAutomotiveTimeline(1)).toMatchObject({ chapterId: "contact", shotProgress: 1 });
  });

  it("maps the door-state motion into the authentic open-door camera push", () => {
    expect(resolveChapterShot("experience", 0.675)).toMatchObject({ id: "senna-door-motion", progress: 0 });
    const midpoint = resolveChapterShot("experience", 0.725);
    expect(midpoint.id).toBe("senna-door-motion");
    expect(midpoint.progress).toBeCloseTo(0.5);
    expect(resolveChapterShot("experience", 0.775)).toMatchObject({ id: "open-door-camera-push", progress: 0 });
  });

  it("is reverse-safe and history independent", () => {
    const samples = [0, 0.07, 0.19, 0.28, 0.44, 0.6, 0.72, 0.84, 0.95, 1];
    const forward = samples.map(resolveAutomotiveTimeline);
    const reversed = samples.toReversed().map(resolveAutomotiveTimeline).toReversed();
    expect(reversed).toEqual(forward);
  });
});
