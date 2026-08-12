#!/usr/bin/env node

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const PUBLIC_ROOT = path.join(REPOSITORY_ROOT, "public");
const VEHICLE_ROOT = path.join(PUBLIC_ROOT, "vehicles");
const OUTPUT_ROOT = path.join(VEHICLE_ROOT, "optimized");
const MANIFEST_PATH = path.join(OUTPUT_ROOT, "manifest.json");

const SOURCE_GROUPS = Object.freeze(["senna", "f1", "skyline", "effects"]);
const SEQUENCE_FRAME_COUNT = 10;
const OUTPUT_PROFILES = Object.freeze({
  plate: Object.freeze({
    grayscale: false,
    sharpen: Object.freeze({
      sigma: 0.55,
      m1: 0.7,
      m2: 1.35,
      x1: 2,
      y2: 8,
      y3: 16,
    }),
    webp: Object.freeze({
      quality: 86,
      effort: 6,
      smartSubsample: true,
      preset: "photo",
    }),
    variants: Object.freeze({
      desktop: Object.freeze({ longEdge: 2560, withoutEnlargement: false }),
      mobile: Object.freeze({ longEdge: 1440, withoutEnlargement: false }),
    }),
  }),
  sequenceFrame: Object.freeze({
    grayscale: false,
    sharpen: Object.freeze({
      sigma: 0.4,
      m1: 0.55,
      m2: 1.1,
      x1: 2,
      y2: 8,
      y3: 16,
    }),
    webp: Object.freeze({
      quality: 80,
      effort: 6,
      smartSubsample: true,
      preset: "photo",
    }),
    variants: Object.freeze({
      desktop: Object.freeze({ longEdge: 1920, withoutEnlargement: false }),
      mobile: Object.freeze({ longEdge: 1280, withoutEnlargement: false }),
    }),
  }),
  effect: Object.freeze({
    grayscale: true,
    sharpen: null,
    webp: Object.freeze({
      quality: 88,
      effort: 6,
      smartSubsample: false,
      preset: "picture",
    }),
    variants: Object.freeze({
      desktop: Object.freeze({ longEdge: 1440, withoutEnlargement: true }),
      mobile: Object.freeze({ longEdge: 1024, withoutEnlargement: true }),
    }),
  }),
});

const ASSET_ROLES = Object.freeze({
  "senna/senna-body-macro-v1.png": Object.freeze({
    role: "opening-body-macro",
    preloadRole: "critical",
  }),
  "senna/senna-wheel-macro-v1.png": Object.freeze({
    role: "senna-wheel",
    preloadRole: "chapter-entry",
  }),
  "senna/senna-exhaust-macro-v1.png": Object.freeze({
    role: "senna-exhaust",
    preloadRole: "near-shot",
  }),
  "senna/senna-hero-closed-v1.png": Object.freeze({
    role: "senna-hero-closed",
    preloadRole: "near-shot",
  }),
  "senna/senna-hero-open-v1.png": Object.freeze({
    role: "senna-hero-open-fallback",
    preloadRole: "on-demand",
  }),
  "f1/ferrari/tyre-macro-v1.png": Object.freeze({
    role: "f1-tyre-match",
    preloadRole: "chapter-entry",
  }),
  "f1/ferrari/steering-cockpit-v1.png": Object.freeze({
    role: "f1-steering-cockpit",
    preloadRole: "near-shot",
  }),
  "f1/ferrari/suspension-macro-v1.png": Object.freeze({
    role: "f1-suspension",
    preloadRole: "near-shot",
  }),
  "f1/ferrari/front-hero-v1.png": Object.freeze({
    role: "f1-front-hero",
    preloadRole: "near-shot",
  }),
  "f1/ferrari/side-speed-v1.png": Object.freeze({
    role: "f1-side-speed",
    preloadRole: "near-shot",
  }),
  "f1/ferrari/rear-light-v1.png": Object.freeze({
    role: "f1-rear-light-handoff",
    preloadRole: "near-shot",
  }),
  "skyline/v2/skyline-taillight-macro-v2.png": Object.freeze({
    role: "skyline-taillight-match",
    preloadRole: "chapter-entry",
  }),
  "skyline/v2/skyline-hero-rear-three-quarter-v2.png": Object.freeze({
    role: "skyline-intro-hero",
    preloadRole: "chapter-entry",
  }),
  "skyline/v2/skyline-headlight-macro-v2.png": Object.freeze({
    role: "skyline-headlight",
    preloadRole: "near-shot",
  }),
  "skyline/v2/skyline-engine-front-closed-reg-v2.png": Object.freeze({
    role: "skyline-engine-closed",
    preloadRole: "near-shot",
  }),
  "skyline/v2/skyline-engine-front-open-reg-v2.png": Object.freeze({
    role: "skyline-engine-open",
    preloadRole: "paired-reveal",
  }),
  "skyline/v2/skyline-side-profile-v2.png": Object.freeze({
    role: "skyline-side-profile",
    preloadRole: "near-shot",
  }),
  "effects/skyline-engine-ink-mask-v1.png": Object.freeze({
    role: "skyline-engine-reveal-mask",
    preloadRole: "paired-reveal",
  }),
  "effects/skyline-engine-depth-v1.png": Object.freeze({
    role: "skyline-engine-depth-map",
    preloadRole: "paired-reveal",
  }),
});

// Add an entry only when a particular mobile asset needs a deliberate crop.
// Keys are source paths relative to public/vehicles, and extract coordinates are
// measured in source pixels. With no entry, the original aspect ratio is kept.
const MOBILE_ART_DIRECTION = Object.freeze({
  // "senna/example.png": { left: 0, top: 0, width: 1200, height: 941 },
});

function assertSupportedNodeVersion() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 13)) {
    throw new Error(
      `Node 22.13.0 or newer is required; received ${process.versions.node}.`,
    );
  }
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function publicUrl(filePath) {
  return `/${toPosixPath(path.relative(PUBLIC_ROOT, filePath))}`;
}

function sourceRelativePath(filePath) {
  return toPosixPath(path.relative(VEHICLE_ROOT, filePath));
}

function isPathInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function discoverPngs(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await discoverPngs(entryPath)));
      continue;
    }

    if (entry.isFile() && /\.png$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function resizeOptions(width, height, variantSettings) {
  const { longEdge, withoutEnlargement } = variantSettings;
  const landscapeOrSquare = width >= height;
  return {
    width: landscapeOrSquare ? longEdge : undefined,
    height: landscapeOrSquare ? undefined : longEdge,
    fit: "inside",
    withoutEnlargement,
    kernel: sharp.kernel.lanczos3,
  };
}

function expectedLongEdge(width, height, variantSettings) {
  const sourceLongEdge = Math.max(width, height);
  return variantSettings.withoutEnlargement
    ? Math.min(variantSettings.longEdge, sourceLongEdge)
    : variantSettings.longEdge;
}

function sequenceMetadata(relativeSource) {
  const match = /^senna\/door-open-v2\/door-(\d{3})\.png$/i.exec(relativeSource);
  if (!match) return null;

  const frameIndex = Number(match[1]);
  if (frameIndex < 0 || frameIndex >= SEQUENCE_FRAME_COUNT) {
    throw new Error(`Unexpected Senna door sequence frame: ${relativeSource}`);
  }

  return {
    id: "senna-door-open-v2",
    frameIndex,
    frameCount: SEQUENCE_FRAME_COUNT,
    progress: frameIndex / (SEQUENCE_FRAME_COUNT - 1),
  };
}

function assetDescriptor(relativeSource) {
  const sequence = sequenceMetadata(relativeSource);
  if (sequence) {
    return {
      profile: "sequenceFrame",
      role: "senna-door-open-frame",
      preloadRole: frameIndexPreloadRole(sequence.frameIndex),
      sequence,
    };
  }

  return {
    profile: relativeSource.startsWith("effects/") ? "effect" : "plate",
    role: ASSET_ROLES[relativeSource]?.role ?? "supporting-plate",
    preloadRole: ASSET_ROLES[relativeSource]?.preloadRole ?? "on-demand",
    sequence: null,
  };
}

function frameIndexPreloadRole(frameIndex) {
  if (frameIndex === 0 || frameIndex === SEQUENCE_FRAME_COUNT - 1) {
    return "sequence-poster";
  }
  if (frameIndex <= 2) return "sequence-seed";
  return "sequence-neighbor";
}

function validateArtDirection(relativeSource, metadata, variant) {
  if (variant !== "mobile") return undefined;

  const extract = MOBILE_ART_DIRECTION[relativeSource];
  if (!extract) return undefined;

  const values = [extract.left, extract.top, extract.width, extract.height];
  if (values.some((value) => !Number.isInteger(value) || value < 0)) {
    throw new Error(`Invalid mobile crop for ${relativeSource}.`);
  }

  if (
    extract.width === 0 ||
    extract.height === 0 ||
    extract.left + extract.width > metadata.width ||
    extract.top + extract.height > metadata.height
  ) {
    throw new Error(`Mobile crop exceeds source bounds for ${relativeSource}.`);
  }

  return extract;
}

async function sha256(filePath) {
  const contents = await fs.readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

async function renderVariant({
  sourcePath,
  relativeSource,
  sourceMetadata,
  profileName,
  variant,
}) {
  const profile = OUTPUT_PROFILES[profileName];
  const variantSettings = profile.variants[variant];
  const parsed = path.parse(relativeSource);
  const outputPath = path.join(
    OUTPUT_ROOT,
    parsed.dir,
    `${parsed.name}-${variant}.webp`,
  );
  const artDirectedCrop = validateArtDirection(
    relativeSource,
    sourceMetadata,
    variant,
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  let pipeline = sharp(sourcePath, {
    failOn: "error",
    limitInputPixels: 268_402_689,
  });

  if (artDirectedCrop) {
    pipeline = pipeline.extract(artDirectedCrop);
  }

  const workingWidth = artDirectedCrop?.width ?? sourceMetadata.width;
  const workingHeight = artDirectedCrop?.height ?? sourceMetadata.height;

  // Sharp strips EXIF/XMP/IPTC metadata by default. Avoiding keepMetadata() or
  // withMetadata() is deliberate so production files contain pixels only.
  pipeline = pipeline.resize(
    resizeOptions(workingWidth, workingHeight, variantSettings),
  );

  if (profile.grayscale) {
    pipeline = pipeline.grayscale();
  } else {
    pipeline = pipeline.toColourspace("srgb");
  }

  if (profile.sharpen) {
    pipeline = pipeline.sharpen(profile.sharpen);
  }

  await pipeline.webp(profile.webp).toFile(outputPath);

  const [outputMetadata, outputStat, digest] = await Promise.all([
    sharp(outputPath).metadata(),
    fs.stat(outputPath),
    sha256(outputPath),
  ]);

  if (
    outputMetadata.format !== "webp" ||
    !outputMetadata.width ||
    !outputMetadata.height ||
    Math.max(outputMetadata.width, outputMetadata.height) !==
      expectedLongEdge(workingWidth, workingHeight, variantSettings) ||
    outputStat.size === 0
  ) {
    throw new Error(`Verification failed for ${publicUrl(outputPath)}.`);
  }

  return {
    src: publicUrl(outputPath),
    width: outputMetadata.width,
    height: outputMetadata.height,
    bytes: outputStat.size,
    sha256: digest,
    artDirectedCrop: artDirectedCrop ?? null,
    profile: profileName,
  };
}

async function prepareAsset(sourcePath) {
  if (!isPathInside(VEHICLE_ROOT, sourcePath)) {
    throw new Error(`Refusing to read outside public/vehicles: ${sourcePath}`);
  }

  const relativeSource = sourceRelativePath(sourcePath);
  const descriptor = assetDescriptor(relativeSource);
  const sourceMetadata = await sharp(sourcePath, { failOn: "error" }).metadata();

  if (
    sourceMetadata.format !== "png" ||
    !sourceMetadata.width ||
    !sourceMetadata.height
  ) {
    throw new Error(`Expected a readable PNG: ${relativeSource}`);
  }

  const [sourceStat, desktop, mobile] = await Promise.all([
    fs.stat(sourcePath),
    renderVariant({
      sourcePath,
      relativeSource,
      sourceMetadata,
      profileName: descriptor.profile,
      variant: "desktop",
    }),
    renderVariant({
      sourcePath,
      relativeSource,
      sourceMetadata,
      profileName: descriptor.profile,
      variant: "mobile",
    }),
  ]);

  return {
    id: relativeSource.replace(/\.png$/i, ""),
    group: relativeSource.split("/")[0],
    role: descriptor.role,
    preloadRole: descriptor.preloadRole,
    sequence: descriptor.sequence,
    profile: descriptor.profile,
    source: publicUrl(sourcePath),
    sourceWidth: sourceMetadata.width,
    sourceHeight: sourceMetadata.height,
    sourceBytes: sourceStat.size,
    outputs: { desktop, mobile },
  };
}

async function main() {
  assertSupportedNodeVersion();

  const expectedOutputRoot = path.resolve(
    REPOSITORY_ROOT,
    "public",
    "vehicles",
    "optimized",
  );
  if (OUTPUT_ROOT !== expectedOutputRoot) {
    throw new Error("Refusing to clean an unexpected output directory.");
  }

  const sourceLists = await Promise.all(
    SOURCE_GROUPS.map((group) => discoverPngs(path.join(VEHICLE_ROOT, group))),
  );
  const sources = sourceLists
    .flat()
    .sort((left, right) => sourceRelativePath(left).localeCompare(sourceRelativePath(right)));

  if (sources.length === 0) {
    throw new Error("No generated vehicle PNGs were found.");
  }

  const sequenceSources = sources.filter((sourcePath) =>
    sourceRelativePath(sourcePath).startsWith("senna/door-open-v2/"),
  );
  const expectedSequenceNames = Array.from(
    { length: SEQUENCE_FRAME_COUNT },
    (_, index) => `senna/door-open-v2/door-${String(index).padStart(3, "0")}.png`,
  );
  const actualSequenceNames = sequenceSources
    .map(sourceRelativePath)
    .sort((left, right) => left.localeCompare(right));
  if (
    actualSequenceNames.length !== expectedSequenceNames.length ||
    actualSequenceNames.some((name, index) => name !== expectedSequenceNames[index])
  ) {
    throw new Error(
      `Senna door sequence must contain exactly ${expectedSequenceNames.join(", ")}.`,
    );
  }

  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });

  const assets = [];
  for (const sourcePath of sources) {
    assets.push(await prepareAsset(sourcePath));
  }

  const outputFiles = assets.flatMap((asset) => [
    asset.outputs.desktop,
    asset.outputs.mobile,
  ]);
  if (outputFiles.length !== sources.length * 2) {
    throw new Error("Not every source PNG produced both required variants.");
  }

  const totalOutputBytes = outputFiles.reduce(
    (total, output) => total + output.bytes,
    0,
  );
  const manifest = {
    version: 2,
    generatedBy: "scripts/prepare-vehicle-assets.mjs",
    sourcePolicy: {
      roots: SOURCE_GROUPS.map((group) => `/vehicles/${group}`),
      excluded: ["/Images", "/vehicles/optimized"],
    },
    settings: {
      colourspace: "srgb",
      metadata: "stripped",
      resizeKernel: "lanczos3",
      profiles: OUTPUT_PROFILES,
    },
    sequences: [
      {
        id: "senna-door-open-v2",
        sourcePrefix: "/vehicles/senna/door-open-v2/door-",
        optimizedPrefix: "/vehicles/optimized/senna/door-open-v2/door-",
        frameCount: SEQUENCE_FRAME_COUNT,
        firstFrame: 0,
        lastFrame: SEQUENCE_FRAME_COUNT - 1,
        interpolation: "discrete-scroll",
        loading: {
          initial: [0, 1, 2, SEQUENCE_FRAME_COUNT - 1],
          neighborhoodRadius: 2,
        },
      },
    ],
    sourceCount: sources.length,
    outputCount: outputFiles.length,
    totalOutputBytes,
    assets,
  };

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `Prepared ${sources.length} PNGs into ${outputFiles.length} verified WebPs.`,
  );
  console.log(`Total output bytes: ${totalOutputBytes}`);
  console.log(`Manifest: ${path.relative(REPOSITORY_ROOT, MANIFEST_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
