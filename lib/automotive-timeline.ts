export type AutomotiveChapterId =
  | "about"
  | "experience"
  | "projects"
  | "creative"
  | "contact";

export type AutomotiveShotId =
  | "identity"
  | "skyline-hero"
  | "engine-inspection"
  | "skyline-handoff"
  | "senna-carbon"
  | "senna-wheel"
  | "senna-exhaust"
  | "senna-settle"
  | "senna-door-motion"
  | "open-door-camera-push"
  | "tyre-match"
  | "ferrari-controls"
  | "ferrari-suspension"
  | "ferrari-hero"
  | "ferrari-speed"
  | "ferrari-rear"
  | "aperture"
  | "vfx"
  | "photography"
  | "iris-close"
  | "end-frame";

type TimelineSegment<Id extends string> = Readonly<{
  id: Id;
  start: number;
  end: number;
}>;

/**
 * Canonical positions in the authored GSAP edit. Components convert these
 * units to normalized scroll progress; public chapter state uses the same
 * boundaries so the DOM contract can never drift from the film.
 */
export const AUTOMOTIVE_EDIT = Object.freeze({
  total: 285,
  aboutEnd: 56,
  experienceEnd: 136,
  projectsEnd: 224,
  creativeEnd: 266,
  engineInspectionStart: 29.2,
  engineInspectionEnd: 54.8,
  doorStart: 110,
  doorEnd: 126,
});

/**
 * A single normalized edit table drives both visible choreography and public
 * timeline state. Segments are half-open; exact boundaries resolve forward.
 */
export const AUTOMOTIVE_CHAPTERS: readonly TimelineSegment<AutomotiveChapterId>[] = [
  { id: "about", start: 0, end: AUTOMOTIVE_EDIT.aboutEnd / AUTOMOTIVE_EDIT.total },
  { id: "experience", start: AUTOMOTIVE_EDIT.aboutEnd / AUTOMOTIVE_EDIT.total, end: AUTOMOTIVE_EDIT.experienceEnd / AUTOMOTIVE_EDIT.total },
  { id: "projects", start: AUTOMOTIVE_EDIT.experienceEnd / AUTOMOTIVE_EDIT.total, end: AUTOMOTIVE_EDIT.projectsEnd / AUTOMOTIVE_EDIT.total },
  { id: "creative", start: AUTOMOTIVE_EDIT.projectsEnd / AUTOMOTIVE_EDIT.total, end: AUTOMOTIVE_EDIT.creativeEnd / AUTOMOTIVE_EDIT.total },
  { id: "contact", start: AUTOMOTIVE_EDIT.creativeEnd / AUTOMOTIVE_EDIT.total, end: 1 },
] as const;

export const AUTOMOTIVE_SHOTS: Readonly<
  Record<AutomotiveChapterId, readonly TimelineSegment<AutomotiveShotId>[]>
> = {
  about: [
    { id: "identity", start: 0, end: 0.25 },
    { id: "skyline-hero", start: 0.25, end: 0.5214 },
    { id: "engine-inspection", start: 0.5214, end: 0.9786 },
    { id: "skyline-handoff", start: 0.9786, end: 1 },
  ],
  experience: [
    { id: "senna-carbon", start: 0, end: 0.15 },
    { id: "senna-wheel", start: 0.15, end: 0.3563 },
    { id: "senna-exhaust", start: 0.3563, end: 0.5625 },
    { id: "senna-settle", start: 0.5625, end: 0.675 },
    { id: "senna-door-motion", start: 0.675, end: 0.775 },
    { id: "open-door-camera-push", start: 0.775, end: 0.925 },
    { id: "tyre-match", start: 0.925, end: 1 },
  ],
  projects: [
    { id: "tyre-match", start: 0, end: 0.1193 },
    { id: "ferrari-controls", start: 0.1193, end: 0.3182 },
    { id: "ferrari-suspension", start: 0.3182, end: 0.517 },
    { id: "ferrari-hero", start: 0.517, end: 0.7159 },
    { id: "ferrari-speed", start: 0.7159, end: 0.8409 },
    { id: "ferrari-rear", start: 0.8409, end: 1 },
  ],
  creative: [
    { id: "aperture", start: 0, end: 0.119 },
    { id: "vfx", start: 0.119, end: 0.655 },
    { id: "photography", start: 0.655, end: 0.952 },
    { id: "iris-close", start: 0.952, end: 1 },
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

export function clampTimelineProgress(progress: number): number {
  if (Number.isNaN(progress) || progress === Number.NEGATIVE_INFINITY) return 0;
  if (progress === Number.POSITIVE_INFINITY) return 1;
  return Math.min(1, Math.max(0, progress));
}

export function getLocalProgress(progress: number, start: number, end: number): number {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new RangeError("Timeline segment end must be greater than start");
  }
  return Math.min(1, Math.max(0, (clampTimelineProgress(progress) - start) / (end - start)));
}

function resolveSegment<Id extends string>(
  progress: number,
  segments: readonly TimelineSegment<Id>[],
) {
  const clampedProgress = clampTimelineProgress(progress);
  const lastIndex = segments.length - 1;
  const index = segments.findIndex(
    (segment, segmentIndex) => clampedProgress < segment.end || segmentIndex === lastIndex,
  );
  const segment = segments[index];
  return {
    id: segment.id,
    index,
    progress: getLocalProgress(clampedProgress, segment.start, segment.end),
  } as const;
}

export function resolveChapterShot(
  chapterId: AutomotiveChapterId,
  chapterProgress: number,
) {
  return resolveSegment(chapterProgress, AUTOMOTIVE_SHOTS[chapterId]);
}

export function resolveAutomotiveTimeline(progress: number): AutomotiveTimelineState {
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
