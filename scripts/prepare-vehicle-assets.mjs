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

const SOURCE_GROUPS = Object.freeze(["senna", "f1", "skyline"]);
const WEBP_OPTIONS = Object.freeze({
  quality: 86,
  effort: 6,
  smartSubsample: true,
  preset: "photo",
});
const OUTPUT_VARIANTS = Object.freeze({
  desktop: Object.freeze({ longEdge: 3840 }),
  mobile: Object.freeze({ longEdge: 2160 }),
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

function resizeOptions(width, height, longEdge) {
  const landscapeOrSquare = width >= height;
  return {
    width: landscapeOrSquare ? longEdge : undefined,
    height: landscapeOrSquare ? undefined : longEdge,
    fit: "inside",
    withoutEnlargement: false,
    kernel: sharp.kernel.lanczos3,
  };
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

async function renderVariant({ sourcePath, relativeSource, sourceMetadata, variant }) {
  const { longEdge } = OUTPUT_VARIANTS[variant];
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
  await pipeline
    .resize(resizeOptions(workingWidth, workingHeight, longEdge))
    .toColourspace("srgb")
    .sharpen({ sigma: 0.55, m1: 0.7, m2: 1.35, x1: 2, y2: 8, y3: 16 })
    .webp(WEBP_OPTIONS)
    .toFile(outputPath);

  const [outputMetadata, outputStat, digest] = await Promise.all([
    sharp(outputPath).metadata(),
    fs.stat(outputPath),
    sha256(outputPath),
  ]);

  if (
    outputMetadata.format !== "webp" ||
    !outputMetadata.width ||
    !outputMetadata.height ||
    Math.max(outputMetadata.width, outputMetadata.height) !== longEdge ||
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
  };
}

async function prepareAsset(sourcePath) {
  if (!isPathInside(VEHICLE_ROOT, sourcePath)) {
    throw new Error(`Refusing to read outside public/vehicles: ${sourcePath}`);
  }

  const relativeSource = sourceRelativePath(sourcePath);
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
      variant: "desktop",
    }),
    renderVariant({
      sourcePath,
      relativeSource,
      sourceMetadata,
      variant: "mobile",
    }),
  ]);

  return {
    id: relativeSource.replace(/\.png$/i, ""),
    group: relativeSource.split("/")[0],
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
    version: 1,
    generatedBy: "scripts/prepare-vehicle-assets.mjs",
    sourcePolicy: {
      roots: SOURCE_GROUPS.map((group) => `/vehicles/${group}`),
      excluded: ["/Images", "/vehicles/optimized"],
    },
    settings: {
      colourspace: "srgb",
      metadata: "stripped",
      resizeKernel: "lanczos3",
      sharpen: { sigma: 0.55, m1: 0.7, m2: 1.35, x1: 2, y2: 8, y3: 16 },
      webp: WEBP_OPTIONS,
      variants: OUTPUT_VARIANTS,
    },
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
