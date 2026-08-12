export type AutomotiveChapterId =
  | "opening"
  | "senna"
  | "f1"
  | "skyline"
  | "creative"
  | "contact";

export type SennaShotId =
  | "body"
  | "wheel"
  | "exhaust"
  | "hero"
  | "doors"
  | "transition";

export type AutomotiveShotId =
  | "darkness"
  | "identity"
  | "senna-handoff"
  | SennaShotId
  | "tyre-match"
  | "steering"
  | "suspension"
  | "cockpit"
  | "f1-hero"
  | "rear-light"
  | "taillights"
  | "headlight"
  | "skyline-hero"
  | "xray"
  | "lens-transition"
  | "aperture"
  | "showreel"
  | "writing"
  | "iris-close"
  | "end-frame";

type TimelineSegment<Id extends string> = Readonly<{
  id: Id;
  start: number;
  end: number;
}>;

/**
 * The homepage's normalized edit. Segments are half-open (`start <= p < end`),
 * except for the final segment, which includes progress 1. Exact boundaries
 * therefore resolve to the incoming chapter or shot.
 */
export const AUTOMOTIVE_CHAPTERS: readonly TimelineSegment<AutomotiveChapterId>[] = [
  { id: "opening", start: 0, end: 0.1 },
  { id: "senna", start: 0.1, end: 0.38 },
  { id: "f1", start: 0.38, end: 0.62 },
  { id: "skyline", start: 0.62, end: 0.8 },
  { id: "creative", start: 0.8, end: 0.94 },
  { id: "contact", start: 0.94, end: 1 },
] as const;

export const AUTOMOTIVE_SHOTS: Readonly<
  Record<AutomotiveChapterId, readonly TimelineSegment<AutomotiveShotId>[]>
> = {
  opening: [
    { id: "darkness", start: 0, end: 0.34 },
    { id: "identity", start: 0.34, end: 0.72 },
    { id: "senna-handoff", start: 0.72, end: 1 },
  ],
  senna: [
    { id: "body", start: 0, end: 0.18 },
    { id: "wheel", start: 0.18, end: 0.36 },
    { id: "exhaust", start: 0.36, end: 0.52 },
    { id: "hero", start: 0.52, end: 0.7 },
    { id: "doors", start: 0.7, end: 0.9 },
    { id: "transition", start: 0.9, end: 1 },
  ],
  f1: [
    { id: "tyre-match", start: 0, end: 0.17 },
    { id: "steering", start: 0.17, end: 0.34 },
    { id: "suspension", start: 0.34, end: 0.5 },
    { id: "cockpit", start: 0.5, end: 0.67 },
    { id: "f1-hero", start: 0.67, end: 0.86 },
    { id: "rear-light", start: 0.86, end: 1 },
  ],
  skyline: [
    { id: "taillights", start: 0, end: 0.2 },
    { id: "headlight", start: 0.2, end: 0.38 },
    { id: "skyline-hero", start: 0.38, end: 0.6 },
    { id: "xray", start: 0.6, end: 0.88 },
    { id: "lens-transition", start: 0.88, end: 1 },
  ],
  creative: [
    { id: "aperture", start: 0, end: 0.2 },
    { id: "showreel", start: 0.2, end: 0.56 },
    { id: "writing", start: 0.56, end: 0.84 },
    { id: "iris-close", start: 0.84, end: 1 },
  ],
  contact: [{ id: "end-frame", start: 0, end: 1 }],
} as const;

export type AutomotiveTimelineState = Readonly<{
  progress: number;
  chapterId: AutomotiveChapterId;
  chapterIndex: number;
  chapterProgress: number;
  shotId: AutomotiveShotId;
  shotIndex: number;
  shotProgress: number;
}>;

/** Clamp an arbitrary input into the normalized timeline domain. */
export function clampTimelineProgress(progress: number): number {
  if (Number.isNaN(progress) || progress === Number.NEGATIVE_INFINITY) {
    return 0;
  }

  if (progress === Number.POSITIVE_INFINITY) {
    return 1;
  }

  return Math.min(1, Math.max(0, progress));
}

/** Resolve normalized progress within a segment, clamped at both ends. */
export function getLocalProgress(
  progress: number,
  start: number,
  end: number,
): number {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new RangeError("Timeline segment end must be greater than start");
  }

  const clampedProgress = clampTimelineProgress(progress);
  return Math.min(1, Math.max(0, (clampedProgress - start) / (end - start)));
}

function resolveSegment<Id extends string>(
  progress: number,
  segments: readonly TimelineSegment<Id>[],
) {
  const clampedProgress = clampTimelineProgress(progress);
  const lastIndex = segments.length - 1;
  const index = segments.findIndex(
    (segment, segmentIndex) =>
      clampedProgress < segment.end || segmentIndex === lastIndex,
  );
  const segment = segments[index];

  return {
    id: segment.id,
    index,
    progress: getLocalProgress(clampedProgress, segment.start, segment.end),
  } as const;
}

/** Resolve a local chapter position to one of that chapter's authored shots. */
export function resolveChapterShot(
  chapterId: AutomotiveChapterId,
  chapterProgress: number,
) {
  return resolveSegment(chapterProgress, AUTOMOTIVE_SHOTS[chapterId]);
}

/**
 * Resolve a scroll position without reading or retaining prior direction/state.
 * The same progress always produces the same chapter, shot, and local values.
 */
export function resolveAutomotiveTimeline(
  progress: number,
): AutomotiveTimelineState {
  const clampedProgress = clampTimelineProgress(progress);
  const chapter = resolveSegment(clampedProgress, AUTOMOTIVE_CHAPTERS);
  const shot = resolveChapterShot(chapter.id, chapter.progress);

  return {
    progress: clampedProgress,
    chapterId: chapter.id,
    chapterIndex: chapter.index,
    chapterProgress: chapter.progress,
    shotId: shot.id,
    shotIndex: shot.index,
    shotProgress: shot.progress,
  };
}
