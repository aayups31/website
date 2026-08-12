#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const SOURCE = path.join(
  REPOSITORY_ROOT,
  "Images",
  "Mclaren",
  "Now_do_the_same_for_these_samp.mp4",
);
const OUTPUT_ROOT = path.join(
  REPOSITORY_ROOT,
  "public",
  "vehicles",
  "senna",
  "video-derived",
);
const DESKTOP_FRAMES = path.join(OUTPUT_ROOT, "frames", "desktop");
const MOBILE_FRAMES = path.join(OUTPUT_ROOT, "frames", "mobile");

// The supplied clip changes to the front-on, doors-up composition at frame 112
// and cuts to the exhaust at frame 144. Keeping source-frame boundaries avoids
// interpolated imagery and makes every scrub position deterministic.
const SOURCE_FPS = 24;
const START_FRAME = 112;
const END_FRAME_EXCLUSIVE = 144;
const FRAME_COUNT = END_FRAME_EXCLUSIVE - START_FRAME;
const START_SECONDS = START_FRAME / SOURCE_FPS;
const DURATION_SECONDS = FRAME_COUNT / SOURCE_FPS;

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function executable(candidate) {
  if (!candidate) return false;
  try {
    await fs.access(candidate, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveFfmpeg() {
  const candidates = [
    process.env.SENNA_FFMPEG_BIN,
    path.join(REPOSITORY_ROOT, "node_modules", "ffmpeg-static", "ffmpeg"),
  ];

  for (const candidate of candidates) {
    if (await executable(candidate)) return candidate;
  }

  return "ffmpeg";
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with status ${code}.`));
    });
  });
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.once("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.once("end", () => resolve(hash.digest("hex")));
  });
}

async function resetFrameDirectory(directory) {
  if (!isInside(OUTPUT_ROOT, directory)) {
    throw new Error(`Refusing to reset a directory outside ${OUTPUT_ROOT}.`);
  }
  await fs.rm(directory, { recursive: true, force: true });
  await fs.mkdir(directory, { recursive: true });
}

async function assertFrameCount(directory, label) {
  const frameNames = (await fs.readdir(directory))
    .filter((name) => /^frame-\d{3}\.webp$/.test(name))
    .sort();

  if (frameNames.length !== FRAME_COUNT) {
    throw new Error(
      `${label} frame count mismatch: expected ${FRAME_COUNT}, received ${frameNames.length}.`,
    );
  }
}

async function main() {
  await fs.access(SOURCE);
  const sourceStat = await fs.stat(SOURCE);
  const sourceSha256 = await sha256(SOURCE);
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  await resetFrameDirectory(DESKTOP_FRAMES);
  await resetFrameDirectory(MOBILE_FRAMES);

  const ffmpeg = await resolveFfmpeg();
  const segmentArgs = [
    "-y",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-ss",
    START_SECONDS.toFixed(6),
    "-i",
    SOURCE,
    "-frames:v",
    String(FRAME_COUNT),
    "-an",
  ];

  await run(ffmpeg, [
    ...segmentArgs,
    "-vf",
    "scale=1280:720:flags=lanczos",
    "-c:v",
    "libwebp",
    "-quality",
    "82",
    "-compression_level",
    "6",
    "-start_number",
    "0",
    path.join(DESKTOP_FRAMES, "frame-%03d.webp"),
  ]);

  await run(ffmpeg, [
    ...segmentArgs,
    "-vf",
    "scale=720:405:flags=lanczos,pad=720:1280:0:437:black",
    "-c:v",
    "libwebp",
    "-quality",
    "80",
    "-compression_level",
    "6",
    "-start_number",
    "0",
    path.join(MOBILE_FRAMES, "frame-%03d.webp"),
  ]);

  await assertFrameCount(DESKTOP_FRAMES, "Desktop");
  await assertFrameCount(MOBILE_FRAMES, "Mobile");

  const metadata = {
    source: "Images/Mclaren/Now_do_the_same_for_these_samp.mp4",
    sourceSha256,
    sourceBytes: sourceStat.size,
    sourceCodec: "H.264 High / yuv420p with AAC-LC stereo",
    sourceDimensions: { width: 1280, height: 720 },
    sourceDurationSeconds: 10.006,
    sourceFrameRate: SOURCE_FPS,
    sourceStartFrame: START_FRAME,
    sourceEndFrameExclusive: END_FRAME_EXCLUSIVE,
    sourceStartSeconds: START_SECONDS,
    durationSeconds: DURATION_SECONDS,
    frameCount: FRAME_COUNT,
    derivatives: {
      desktopFramePattern:
        "/vehicles/senna/video-derived/frames/desktop/frame-%03d.webp",
      desktopDimensions: { width: 1280, height: 720 },
      mobileFramePattern:
        "/vehicles/senna/video-derived/frames/mobile/frame-%03d.webp",
      mobileDimensions: { width: 720, height: 1280 },
    },
    contentNote:
      "The source segment contains a camera push on a fully open-door pose; it does not contain the door hinge opening from closed to open.",
    provenanceNote:
      "Owner-supplied Google-encoded reference. Visible sparkle mark and vehicle branding are retained in the extracted frames.",
  };

  await fs.writeFile(
    path.join(OUTPUT_ROOT, "provenance.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(
    `Prepared ${FRAME_COUNT} source-derived frames per profile from ${START_SECONDS.toFixed(6)}s to ${(START_SECONDS + DURATION_SECONDS).toFixed(6)}s.\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
