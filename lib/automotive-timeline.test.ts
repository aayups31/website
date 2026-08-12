import { describe, expect, it } from "vitest";
import {
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
      if (index > 0) {
        expect(chapter.start).toBe(AUTOMOTIVE_CHAPTERS[index - 1].end);
      }

      const shots = AUTOMOTIVE_SHOTS[chapter.id];
      expect(shots[0].start).toBe(0);
      expect(shots.at(-1)?.end).toBe(1);

      for (const [shotIndex, shot] of shots.entries()) {
        expect(shot.end).toBeGreaterThan(shot.start);
        if (shotIndex > 0) {
          expect(shot.start).toBe(shots[shotIndex - 1].end);
        }
      }
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
    expect(getLocalProgress(0.1, 0.1, 0.38)).toBe(0);
    expect(getLocalProgress(0.24, 0.1, 0.38)).toBeCloseTo(0.5);
    expect(getLocalProgress(0.8, 0.1, 0.38)).toBe(1);
    expect(() => getLocalProgress(0.5, 0.5, 0.5)).toThrow(RangeError);
  });

  it("maps exact chapter boundaries to the incoming chapter", () => {
    expect(resolveAutomotiveTimeline(0)).toMatchObject({
      chapterId: "opening",
      chapterProgress: 0,
      shotId: "darkness",
    });
    expect(resolveAutomotiveTimeline(0.1)).toMatchObject({
      chapterId: "senna",
      chapterProgress: 0,
      shotId: "body",
    });
    expect(resolveAutomotiveTimeline(0.38)).toMatchObject({
      chapterId: "f1",
      chapterProgress: 0,
      shotId: "tyre-match",
    });
    expect(resolveAutomotiveTimeline(0.62)).toMatchObject({
      chapterId: "skyline",
      chapterProgress: 0,
      shotId: "taillights",
    });
    expect(resolveAutomotiveTimeline(0.8)).toMatchObject({
      chapterId: "creative",
      chapterProgress: 0,
      shotId: "aperture",
    });
    expect(resolveAutomotiveTimeline(0.94)).toMatchObject({
      chapterId: "contact",
      chapterProgress: 0,
      shotId: "end-frame",
    });
    expect(resolveAutomotiveTimeline(1)).toMatchObject({
      chapterId: "contact",
      chapterProgress: 1,
      shotId: "end-frame",
      shotProgress: 1,
    });
  });

  it("uses the authored Senna milestones and hands exact boundaries forward", () => {
    const expected = [
      [0, "body"],
      [0.18, "wheel"],
      [0.36, "exhaust"],
      [0.52, "hero"],
      [0.7, "doors"],
      [0.9, "transition"],
    ] as const;

    for (const [progress, shotId] of expected) {
      expect(resolveChapterShot("senna", progress)).toMatchObject({
        id: shotId,
        progress: 0,
      });
    }

    expect(resolveChapterShot("senna", 1)).toMatchObject({
      id: "transition",
      progress: 1,
    });
  });

  it("is reverse-safe and has no history-dependent output", () => {
    const samples = [0, 0.07, 0.1, 0.27, 0.38, 0.51, 0.62, 0.79, 0.8, 0.94, 1];
    const forward = samples.map(resolveAutomotiveTimeline);
    const reverseThenRestore = samples
      .toReversed()
      .map(resolveAutomotiveTimeline)
      .toReversed();

    expect(reverseThenRestore).toEqual(forward);
    expect(resolveAutomotiveTimeline(0.296)).toEqual(
      resolveAutomotiveTimeline(0.296),
    );
  });
});
