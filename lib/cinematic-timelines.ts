import type { WorldId } from "./experience-store";
import { clamp, smoothstep } from "./scroll-runtime";

export type CameraFrame = {
  x: number;
  y: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  originX: number;
  originY: number;
};

export type CinematicShotTimeline = {
  start: number;
  end: number;
  fade?: number;
  from: CameraFrame;
  to: CameraFrame;
};

type WorldTimeline = {
  beatCount: number;
  camera: {
    from: CameraFrame;
    to: CameraFrame;
  };
  shots: Record<string, CinematicShotTimeline>;
};

const frame = (
  x: number,
  y: number,
  scale: number,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  originX = 50,
  originY = 50,
): CameraFrame => ({
  x,
  y,
  scale,
  rotateX,
  rotateY,
  rotateZ,
  originX,
  originY,
});

/**
 * Timings use editorial beats rather than viewport percentages. A value of 1
 * represents one intro, article, or closing beat in the corresponding chapter.
 */
export const cinematicTimelines: Record<WorldId, WorldTimeline> = {
  prologue: {
    beatCount: 1,
    camera: { from: frame(-1, -1, 1.01, 1.2, -0.8), to: frame(2, 2, 1.09, -1.5, 1.2) },
    shots: {
      "prologue-aerial": {
        start: 0,
        end: 0.76,
        fade: 0.1,
        from: frame(-3, -3, 1.03, 2, -1.5, -0.3, 50, 54),
        to: frame(4, 4, 1.34, -2.5, 2, 0.35, 50, 56),
      },
      "prologue-bowl": {
        start: 0.58,
        end: 1,
        fade: 0.1,
        from: frame(1, 5, 0.9, 3, -2, -0.6, 50, 61),
        to: frame(-2, -2, 1.28, -2, 1.5, 0.3, 50, 58),
      },
      "prologue-locker": {
        start: 0.8,
        end: 1,
        fade: 0.08,
        from: frame(-8, 6, 0.94, 2, 3, -1, 36, 54),
        to: frame(5, -3, 1.22, -1, -3, 0.5, 42, 50),
      },
    },
  },
  football: {
    beatCount: 5,
    camera: { from: frame(-1, 1, 1.02, 1, -1), to: frame(2, -2, 1.08, -1.5, 1.5) },
    shots: {
      "football-night": {
        start: 0,
        end: 5,
        fade: 0.18,
        from: frame(3, 1, 1.04, 1.5, -1.5, -0.3, 54, 48),
        to: frame(-4, -5, 1.3, -2, 2, 0.45, 48, 44),
      },
      "football-bowl": {
        start: 0,
        end: 1.28,
        fade: 0.18,
        from: frame(5, 3, 1.05, 2, -2.5, -0.4, 52, 58),
        to: frame(-4, -3, 1.3, -2, 2, 0.35, 48, 56),
      },
      "football-locker": {
        start: 0.82,
        end: 2.34,
        fade: 0.2,
        from: frame(5, 6, 1.08, 2.5, 3, -0.8, 40, 52),
        to: frame(-4, -4, 1.4, -2, -3, 0.6, 50, 48),
      },
      "football-pitch": {
        start: 1.9,
        end: 3.55,
        fade: 0.22,
        from: frame(-5, 8, 1.1, 4, -2, -0.5, 52, 58),
        to: frame(6, -6, 1.48, -2.5, 2.5, 0.5, 50, 48),
      },
    },
  },
  racing: {
    beatCount: 4,
    camera: { from: frame(-2, 1, 1.02, 0.8, -1.5), to: frame(3, -1, 1.1, -1, 2) },
    shots: {
      "racing-studio": {
        start: 0,
        end: 4,
        fade: 0.16,
        from: frame(4, 2, 1.04, 1.5, 3, -0.4, 54, 56),
        to: frame(-5, -3, 1.3, -1.5, -3.5, 0.45, 48, 52),
      },
      "racing-garage": {
        start: 0,
        end: 1.38,
        fade: 0.18,
        from: frame(9, 3, 1.08, 1, 3.5, 0.6, 48, 52),
        to: frame(-8, -3, 1.29, -1.5, -4, -0.7, 52, 48),
      },
      "racing-corner": {
        start: 0.92,
        end: 2.72,
        fade: 0.2,
        from: frame(10, 5, 1.02, 2, 3, 1.25, 70, 54),
        to: frame(-7, -4, 1.54, -2.5, -3, -1.5, 62, 50),
      },
      "racing-track": {
        start: 2.2,
        end: 4,
        fade: 0.2,
        from: frame(-11, 4, 1.16, 1.5, -4, -0.8, 64, 52),
        to: frame(12, -5, 1.42, -2, 4, 0.9, 58, 48),
      },
    },
  },
  music: {
    beatCount: 5,
    camera: { from: frame(-1, 2, 1.01, 1.2, -1), to: frame(2, -2, 1.09, -1.5, 1.5) },
    shots: {
      "music-arena": {
        start: 0,
        end: 5,
        fade: 0.18,
        from: frame(-2, 5, 1.02, 3, -1.5, -0.25, 50, 54),
        to: frame(3, -5, 1.38, -2.5, 2, 0.35, 50, 48),
      },
      "music-linkin-art": {
        start: 0.45,
        end: 2.08,
        fade: 0.2,
        from: frame(-5, 3, 1.06, 1, -2, -2, 52, 50),
        to: frame(4, -4, 1.43, -1.5, 2.5, 1.1, 48, 50),
      },
      "music-linkin-band": {
        start: 0.72,
        end: 1.98,
        fade: 0.16,
        from: frame(8, 7, 0.96, 1.5, 3, -1.2, 56, 54),
        to: frame(-5, -4, 1.28, -1.5, -3, 0.7, 48, 48),
      },
      "music-orchestra": {
        start: 1.72,
        end: 3.24,
        fade: 0.2,
        from: frame(-5, 6, 1.04, 3.5, -2, -0.4, 48, 54),
        to: frame(5, -5, 1.34, -2.5, 2.5, 0.45, 52, 48),
      },
      "music-stars": {
        start: 1.92,
        end: 3.12,
        fade: 0.18,
        from: frame(7, -4, 0.94, -2, 3, 0.8, 58, 44),
        to: frame(-5, 5, 1.26, 2, -3, -0.65, 48, 52),
      },
      "music-michael-stage": {
        start: 2.82,
        end: 4.58,
        fade: 0.2,
        from: frame(3, 12, 1.03, 2, 2, -0.6, 60, 40),
        to: frame(-4, -14, 1.4, -2.5, -2.5, 0.7, 54, 30),
      },
      "music-michael-glove": {
        start: 3.02,
        end: 4.32,
        fade: 0.18,
        from: frame(-9, 7, 0.94, 2, -3, -8, 36, 42),
        to: frame(7, -6, 1.3, -2, 3, 9, 44, 38),
      },
    },
  },
  archive: {
    beatCount: 4,
    camera: { from: frame(-2, 1, 1.02, 1, -1), to: frame(2, -2, 1.1, -1.5, 1.5) },
    shots: {
      "archive-drift": {
        start: 0,
        end: 4,
        fade: 0.18,
        from: frame(-8, 3, 1.07, 1.5, -2, -1, 54, 52),
        to: frame(10, -5, 1.37, -2, 3, 1.1, 48, 48),
      },
      "archive-parked": {
        start: 0.38,
        end: 2.08,
        fade: 0.2,
        from: frame(-6, 9, 1.02, 3, -3, -1.5, 40, 56),
        to: frame(5, -11, 1.32, -2.5, 3, 1.1, 48, 48),
      },
      "archive-engine": {
        start: 1.68,
        end: 3.22,
        fade: 0.2,
        from: frame(7, 5, 1.08, 2, 3, 1, 64, 50),
        to: frame(-6, -5, 1.62, -2, -3, -1, 54, 46),
      },
    },
  },
  contact: {
    beatCount: 1,
    camera: { from: frame(-1, 1, 1.01, 1, -1), to: frame(1, -1, 1.08, -1, 1) },
    shots: {
      "contact-stars": {
        start: 0,
        end: 1,
        fade: 0.14,
        from: frame(-2, 3, 1.02, 2, -1.5, -0.3, 50, 46),
        to: frame(2, -4, 1.26, -2, 2, 0.35, 50, 44),
      },
      "contact-aerial": {
        start: 0.42,
        end: 1,
        fade: 0.12,
        from: frame(4, 5, 0.9, 3, 2, 0.5, 52, 54),
        to: frame(-3, -4, 1.22, -2.5, -2, -0.4, 48, 48),
      },
    },
  },
};

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export function interpolateFrame(
  from: CameraFrame,
  to: CameraFrame,
  progress: number,
  amplitude = 1,
): CameraFrame {
  const eased = smoothstep(0, 1, progress);
  return {
    x: mix(from.x, to.x, eased) * amplitude,
    y: mix(from.y, to.y, eased) * amplitude,
    scale: 1 + (mix(from.scale, to.scale, eased) - 1) * amplitude,
    rotateX: mix(from.rotateX, to.rotateX, eased) * amplitude,
    rotateY: mix(from.rotateY, to.rotateY, eased) * amplitude,
    rotateZ: mix(from.rotateZ, to.rotateZ, eased) * amplitude,
    originX: mix(from.originX, to.originX, eased),
    originY: mix(from.originY, to.originY, eased),
  };
}

export function getWorldCamera(
  world: WorldId,
  sectionProgress: number,
  amplitude = 1,
) {
  const { camera } = cinematicTimelines[world];
  return interpolateFrame(camera.from, camera.to, sectionProgress, amplitude);
}

export function getShotState(
  world: WorldId,
  shotId: string,
  beatTrack: number,
  amplitude = 1,
  posterFrame = false,
) {
  const worldTimeline = cinematicTimelines[world];
  const shot = worldTimeline.shots[shotId];
  if (!shot) return null;

  const duration = Math.max(0.001, shot.end - shot.start);
  const timelineProgress = clamp((beatTrack - shot.start) / duration);
  const motionProgress = posterFrame ? 0.55 : timelineProgress;
  const fade = Math.min(shot.fade ?? 0.18, duration * 0.42);
  const enter = shot.start <= 0
    ? 1
    : smoothstep(shot.start, shot.start + fade, beatTrack);
  const exit = shot.end >= worldTimeline.beatCount
    ? 1
    : 1 - smoothstep(shot.end - fade, shot.end, beatTrack);

  return {
    opacity: clamp(enter * exit),
    progress: motionProgress,
    frame: interpolateFrame(shot.from, shot.to, motionProgress, amplitude),
  };
}
