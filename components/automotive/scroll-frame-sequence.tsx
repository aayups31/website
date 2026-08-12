"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type ScrollFrameSequenceHandle = {
  update: (progress: number) => void;
};

type ScrollFrameSequenceProps = {
  className?: string;
  desktopFrames: string[];
  mobileFrames: string[];
  fallbackDesktop: string;
  fallbackMobile: string;
  enabled: boolean;
  poster: string;
};

type LoadedFrame = HTMLImageElement | null;

const DOOR_FRAME_COUNT = 10;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

function isLegacyDoorSequence(frames: string[]) {
  return (
    frames.length === DOOR_FRAME_COUNT &&
    frames.some((frame) => frame.includes("/door-open-v2/"))
  );
}

/**
 * The registered source set is intentionally numbered door-000..door-009.
 * Accept the earlier frame list shape as input so a stale cached client can
 * still resolve the current, registered sequence after deployment.
 */
function resolveFrameSources(
  frames: string[],
  variant: "desktop" | "mobile",
) {
  if (!isLegacyDoorSequence(frames)) return frames;

  return Array.from({ length: DOOR_FRAME_COUNT }, (_, index) => {
    const frame = String(index).padStart(3, "0");
    return `/vehicles/optimized/senna/door-open-v2/door-${frame}-${variant}.webp`;
  });
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  alpha = 1,
) {
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  if (imageWidth <= 0 || imageHeight <= 0) return;

  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  context.globalAlpha = alpha;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function closestLoadedFrame(images: LoadedFrame[], target: number, step: -1 | 1) {
  for (
    let index = target;
    index >= 0 && index < images.length;
    index += step
  ) {
    if (images[index]) return index;
  }
  return -1;
}

function useStableFrames(frames: string[]) {
  const framesRef = useRef(frames);
  const previous = framesRef.current;
  const unchanged =
    previous.length === frames.length &&
    previous.every((frame, index) => frame === frames[index]);

  if (!unchanged) framesRef.current = frames;
  return framesRef.current;
}

export const ScrollFrameSequence = forwardRef<
  ScrollFrameSequenceHandle,
  ScrollFrameSequenceProps
>(function ScrollFrameSequence(
  {
    className,
    desktopFrames,
    mobileFrames,
    fallbackDesktop,
    fallbackMobile,
    enabled,
    poster,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateRef = useRef<(progress: number) => void>(() => undefined);
  const pendingProgressRef = useRef(0);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );
  const stableDesktopFrames = useStableFrames(desktopFrames);
  const stableMobileFrames = useStableFrames(mobileFrames);

  useImperativeHandle(ref, () => ({
    update: (progress) => {
      pendingProgressRef.current = clamp(Number.isFinite(progress) ? progress : 0);
      updateRef.current(pendingProgressRef.current);
    },
  }));

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const sources = useMemo(
    () =>
      isMobile
        ? resolveFrameSources(stableMobileFrames, "mobile")
        : resolveFrameSources(stableDesktopFrames, "desktop"),
    [isMobile, stableDesktopFrames, stableMobileFrames],
  );
  const fallbackSource = isMobile ? fallbackMobile : fallbackDesktop;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    const frameSources =
      enabled && sources.length > 0 ? sources : [fallbackSource || poster];
    const images: LoadedFrame[] = Array(frameSources.length).fill(null);
    let targetProgress = pendingProgressRef.current;
    let animationFrame: number | null = null;
    let disposed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.35);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width === width && canvas.height === height) return false;
      canvas.width = width;
      canvas.height = height;
      return true;
    };

    const render = () => {
      animationFrame = null;
      resize();
      context.globalAlpha = 1;
      context.fillStyle = "#020304";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const exactFrame =
        clamp(targetProgress) * Math.max(0, frameSources.length - 1);
      canvas.dataset.frame = String(Math.round(exactFrame));
      const lower = closestLoadedFrame(images, Math.floor(exactFrame), -1);
      const upper = closestLoadedFrame(images, Math.ceil(exactFrame), 1);

      if (lower >= 0) {
        drawCover(context, images[lower]!, canvas.width, canvas.height);
      }

      if (upper >= 0 && upper !== lower) {
        const distance = Math.max(1, upper - lower);
        const blend = clamp((exactFrame - lower) / distance);
        drawCover(
          context,
          images[upper]!,
          canvas.width,
          canvas.height,
          blend,
        );
      } else if (lower < 0 && upper >= 0) {
        drawCover(context, images[upper]!, canvas.width, canvas.height);
      }

      context.globalAlpha = 1;
    };

    function schedule() {
      if (!disposed && animationFrame === null) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    const load = (
      source: string,
      index: number,
      priority: "high" | "auto",
      allowFallback = true,
    ) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority;
      image.onload = () => {
        void image
          .decode()
          .catch(() => undefined)
          .finally(() => {
            if (disposed) return;
            images[index] = image;
            schedule();
          });
      };
      image.onerror = () => {
        const alternate =
          source !== fallbackSource && fallbackSource
            ? fallbackSource
            : source !== poster
              ? poster
              : "";
        if (!disposed && allowFallback && index === 0 && alternate) {
          load(alternate, index, "high", false);
        }
      };
      image.src = source;
    };

    updateRef.current = (progress) => {
      targetProgress = clamp(Number.isFinite(progress) ? progress : 0);
      schedule();
    };

    updateRef.current(pendingProgressRef.current);

    resize();
    // The first registered frame is the canonical poster. The explicit
    // fallback remains useful when motion is disabled or only one frame is used.
    frameSources.forEach((source, index) => {
      load(source || fallbackSource || poster, index, index < 2 ? "high" : "auto");
    });
    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      updateRef.current = () => undefined;
      images.fill(null);
    };
  }, [enabled, fallbackSource, poster, sources]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      data-door-sequence
      data-poster={poster}
      aria-hidden="true"
    />
  );
});
