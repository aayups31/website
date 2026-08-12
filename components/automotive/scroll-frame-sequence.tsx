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
  desktopFrames: readonly string[];
  mobileFrames: readonly string[];
  fallbackDesktop: string;
  fallbackMobile: string;
  enabled: boolean;
  poster: string;
  sequenceLabel: string;
  sequenceKind: "door-state-motion" | "open-door-camera-push";
  sourceStartFrame?: number;
};

type LoadedFrame = HTMLImageElement | null;
type LoadState = "idle" | "loading" | "ready" | "error";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

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

function useStableFrames(frames: readonly string[]) {
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
    sequenceLabel,
    sequenceKind,
    sourceStartFrame = 0,
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
    () => (isMobile ? stableMobileFrames : stableDesktopFrames),
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
    const loadStates: LoadState[] = Array(frameSources.length).fill("idle");
    let targetProgress = pendingProgressRef.current;
    let lastRequestedProgress = Number.NaN;
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
      const displayFrame = Math.round(exactFrame);
      canvas.dataset.frame = String(displayFrame);
      canvas.dataset.sourceFrame = String(sourceStartFrame + displayFrame);
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
      index: number,
      priority: "high" | "auto",
      sourceOverride?: string,
    ) => {
      if (index < 0 || index >= frameSources.length || disposed) return;
      if (!sourceOverride && loadStates[index] !== "idle") return;

      const source =
        sourceOverride || frameSources[index] || fallbackSource || poster;
      if (!source) return;
      loadStates[index] = "loading";
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
            loadStates[index] = "ready";
            schedule();
          });
      };
      image.onerror = () => {
        if (disposed) return;
        loadStates[index] = "error";
        const alternate = source !== fallbackSource ? fallbackSource : poster;
        if (index === 0 && alternate && alternate !== source) {
          loadStates[index] = "idle";
          load(index, "high", alternate);
        }
      };
      image.src = source;
    };

    const primeTarget = (progress: number) => {
      const exact = clamp(progress) * Math.max(0, frameSources.length - 1);
      const target = Math.round(exact);
      const nearby = [
        target,
        Math.floor(exact),
        Math.ceil(exact),
        target - 1,
        target + 1,
        target - 2,
        target + 2,
        target - 3,
        target + 3,
        target - 4,
        target + 4,
      ];
      nearby.forEach((index, order) => load(index, order < 3 ? "high" : "auto"));

      images.forEach((image, index) => {
        if (!image || index === 0 || Math.abs(index - target) <= 7) return;
        images[index] = null;
        if (loadStates[index] === "ready") loadStates[index] = "idle";
      });
    };

    updateRef.current = (progress) => {
      targetProgress = clamp(Number.isFinite(progress) ? progress : 0);
      if (
        Number.isFinite(lastRequestedProgress) &&
        Math.abs(targetProgress - lastRequestedProgress) < 0.0001
      ) {
        return;
      }
      lastRequestedProgress = targetProgress;
      primeTarget(targetProgress);
      schedule();
    };

    updateRef.current(pendingProgressRef.current);

    resize();
    // Decode only the current scrub neighborhood. This preserves sub-frame
    // blending without retaining every full-screen source frame in memory.
    primeTarget(pendingProgressRef.current);
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
  }, [enabled, fallbackSource, poster, sourceStartFrame, sources]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      data-door-sequence
      data-scroll-frame-sequence
      data-sequence-kind={sequenceKind}
      data-sequence-label={sequenceLabel}
      data-poster={poster}
      aria-hidden="true"
    />
  );
});
