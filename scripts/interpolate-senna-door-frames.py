#!/usr/bin/env python3
"""Build a 37-frame Senna door sequence with bidirectional optical flow.

The ten registered source states remain byte-for-byte originals at output frames
000, 004, ..., 036. Three frames are synthesized between each pair by warping
both endpoints with full-resolution OpenCV DeepFlow fields before compositing.

Requires NumPy and an OpenCV build that includes ``cv2.optflow`` (for example,
``opencv-contrib-python-headless==4.11.0.86``).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
from typing import Any

import cv2
import numpy as np


VARIANTS = ("desktop", "mobile")
SOURCE_STATE_COUNT = 10
INTERMEDIATE_FRAMES = 3
OUTPUT_FRAME_COUNT = (SOURCE_STATE_COUNT - 1) * (INTERMEDIATE_FRAMES + 1) + 1


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-root",
        type=Path,
        default=repo_root / "public/vehicles/optimized/senna/door-open-v2",
        help="Directory containing door-000..009 desktop/mobile WebPs.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=repo_root / "public/vehicles/optimized/senna/door-motion-flow-v1",
        help="Destination for desktop/mobile frames and manifest.json.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="WebP quality for interpolated frames (original states are copied).",
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Validate an existing output without regenerating it.",
    )
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def repo_relative(path: Path, repo_root: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def source_paths(source_root: Path, variant: str) -> list[Path]:
    paths = [
        source_root / f"door-{index:03d}-{variant}.webp"
        for index in range(SOURCE_STATE_COUNT)
    ]
    missing = [path for path in paths if not path.is_file()]
    if missing:
        raise RuntimeError(
            f"Missing {variant} source frame(s): "
            + ", ".join(path.name for path in missing)
        )
    return paths


def read_bgr(path: Path) -> np.ndarray:
    image = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"OpenCV could not decode {path}")
    return image


def calculate_deepflow(first: np.ndarray, second: np.ndarray) -> np.ndarray:
    first_gray = cv2.cvtColor(first, cv2.COLOR_BGR2GRAY)
    second_gray = cv2.cvtColor(second, cv2.COLOR_BGR2GRAY)
    estimator = cv2.optflow.createOptFlow_DeepFlow()
    flow = estimator.calc(first_gray, second_gray, None)
    if flow is None or flow.shape != (*first_gray.shape, 2):
        raise RuntimeError("DeepFlow returned an invalid field")
    if not np.isfinite(flow).all():
        raise RuntimeError("DeepFlow returned non-finite motion vectors")
    return flow


def warp(
    image: np.ndarray,
    flow: np.ndarray,
    amount: float,
    grid_x: np.ndarray,
    grid_y: np.ndarray,
) -> np.ndarray:
    map_x = grid_x - np.float32(amount) * flow[..., 0]
    map_y = grid_y - np.float32(amount) * flow[..., 1]
    return cv2.remap(
        image,
        map_x,
        map_y,
        interpolation=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REFLECT_101,
    )


def interpolate_pair(
    first: np.ndarray,
    second: np.ndarray,
) -> list[np.ndarray]:
    if first.shape != second.shape:
        raise RuntimeError(f"Source dimensions differ: {first.shape} vs {second.shape}")

    forward = calculate_deepflow(first, second)
    backward = calculate_deepflow(second, first)
    height, width = first.shape[:2]
    grid_x, grid_y = np.meshgrid(
        np.arange(width, dtype=np.float32),
        np.arange(height, dtype=np.float32),
    )

    frames: list[np.ndarray] = []
    for step in range(1, INTERMEDIATE_FRAMES + 1):
        t = step / (INTERMEDIATE_FRAMES + 1)
        first_warped = warp(first, forward, t, grid_x, grid_y)
        second_warped = warp(second, backward, 1.0 - t, grid_x, grid_y)
        frames.append(cv2.addWeighted(first_warped, 1.0 - t, second_warped, t, 0.0))
    return frames


def write_webp(path: Path, image: np.ndarray, quality: int) -> None:
    temporary = path.with_name(f".{path.stem}.tmp.webp")
    if not cv2.imwrite(
        str(temporary), image, [cv2.IMWRITE_WEBP_QUALITY, int(quality)]
    ):
        raise RuntimeError(f"OpenCV could not encode {path}")
    os.replace(temporary, path)


def frame_record(
    output_path: Path,
    output_root: Path,
    source_indices: list[int],
    t: float,
    original: bool,
    width: int,
    height: int,
) -> dict[str, Any]:
    return {
        "index": int(output_path.stem.split("-")[-1]),
        "file": output_path.relative_to(output_root).as_posix(),
        "sourceIndices": source_indices,
        "t": t,
        "original": original,
        "width": width,
        "height": height,
        "bytes": output_path.stat().st_size,
        "sha256": sha256(output_path),
    }


def generate_variant(
    source_root: Path,
    output_root: Path,
    variant: str,
    quality: int,
) -> dict[str, Any]:
    sources = source_paths(source_root, variant)
    images = [read_bgr(path) for path in sources]
    height, width = images[0].shape[:2]
    if any(image.shape != images[0].shape for image in images):
        raise RuntimeError(f"All {variant} source frames must have equal dimensions")

    destination = output_root / variant
    destination.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, Any]] = []
    source_records = [
        {
            "index": index,
            "file": path.name,
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        }
        for index, path in enumerate(sources)
    ]

    for pair_index in range(SOURCE_STATE_COUNT - 1):
        original_index = pair_index * (INTERMEDIATE_FRAMES + 1)
        original_path = destination / f"frame-{original_index:03d}.webp"
        shutil.copyfile(sources[pair_index], original_path)
        records.append(
            frame_record(
                original_path,
                output_root,
                [pair_index],
                0.0,
                True,
                width,
                height,
            )
        )

        print(
            f"[{variant}] optical flow {pair_index:03d} -> {pair_index + 1:03d}",
            flush=True,
        )
        for step, image in enumerate(
            interpolate_pair(images[pair_index], images[pair_index + 1]), start=1
        ):
            output_index = original_index + step
            output_path = destination / f"frame-{output_index:03d}.webp"
            write_webp(output_path, image, quality)
            records.append(
                frame_record(
                    output_path,
                    output_root,
                    [pair_index, pair_index + 1],
                    step / (INTERMEDIATE_FRAMES + 1),
                    False,
                    width,
                    height,
                )
            )

    final_index = OUTPUT_FRAME_COUNT - 1
    final_path = destination / f"frame-{final_index:03d}.webp"
    shutil.copyfile(sources[-1], final_path)
    records.append(
        frame_record(
            final_path,
            output_root,
            [SOURCE_STATE_COUNT - 1],
            0.0,
            True,
            width,
            height,
        )
    )

    return {
        "width": width,
        "height": height,
        "sourceFrames": source_records,
        "frames": records,
    }


def build_manifest(
    source_root: Path,
    output_root: Path,
    quality: int,
    variants: dict[str, Any],
) -> dict[str, Any]:
    repo_root = Path(__file__).resolve().parents[1]
    return {
        "schemaVersion": 1,
        "asset": "McLaren Senna registered door-opening scroll sequence",
        "generator": repo_relative(Path(__file__), repo_root),
        "opencvVersion": cv2.__version__,
        "algorithm": {
            "name": "DeepFlow",
            "implementation": "cv2.optflow.createOptFlow_DeepFlow",
            "flowResolution": "full source resolution",
            "direction": "bidirectional",
            "synthesis": "cubic inverse-remap of both endpoints with temporal weighting",
            "intermediateFramesPerPair": INTERMEDIATE_FRAMES,
            "webpQuality": quality,
        },
        "input": {
            "root": repo_relative(source_root, repo_root),
            "pattern": "door-{000..009}-{desktop|mobile}.webp",
            "stateCount": SOURCE_STATE_COUNT,
        },
        "output": {
            "root": repo_relative(output_root, repo_root),
            "pattern": "{desktop|mobile}/frame-{000..036}.webp",
            "frameCountPerVariant": OUTPUT_FRAME_COUNT,
            "originalFrameStride": INTERMEDIATE_FRAMES + 1,
        },
        "variants": variants,
    }


def write_manifest(output_root: Path, manifest: dict[str, Any]) -> None:
    manifest_path = output_root / "manifest.json"
    temporary = output_root / ".manifest.tmp.json"
    temporary.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, manifest_path)


def validate(source_root: Path, output_root: Path) -> None:
    manifest_path = output_root / "manifest.json"
    if not manifest_path.is_file():
        raise RuntimeError(f"Missing {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("output", {}).get("frameCountPerVariant") != OUTPUT_FRAME_COUNT:
        raise RuntimeError("Manifest frame count is incorrect")

    for variant in VARIANTS:
        sources = source_paths(source_root, variant)
        source_image = read_bgr(sources[0])
        expected_height, expected_width = source_image.shape[:2]
        expected_names = [f"frame-{index:03d}.webp" for index in range(OUTPUT_FRAME_COUNT)]
        destination = output_root / variant
        actual_names = sorted(path.name for path in destination.glob("frame-*.webp"))
        if actual_names != expected_names:
            raise RuntimeError(
                f"{variant}: expected frame-000..{OUTPUT_FRAME_COUNT - 1:03d}; "
                f"found {len(actual_names)} frame files"
            )

        manifest_records = manifest.get("variants", {}).get(variant, {}).get("frames", [])
        if len(manifest_records) != OUTPUT_FRAME_COUNT:
            raise RuntimeError(f"{variant}: manifest does not describe all output frames")

        for index, name in enumerate(expected_names):
            path = destination / name
            image = read_bgr(path)
            if image.shape[:2] != (expected_height, expected_width):
                raise RuntimeError(
                    f"{path}: expected {expected_width}x{expected_height}, "
                    f"got {image.shape[1]}x{image.shape[0]}"
                )
            record = manifest_records[index]
            if record.get("index") != index or record.get("sha256") != sha256(path):
                raise RuntimeError(f"{path}: manifest provenance/hash mismatch")
            if record.get("bytes") != path.stat().st_size:
                raise RuntimeError(f"{path}: manifest byte count mismatch")

        for source_index, source in enumerate(sources):
            output = destination / f"frame-{source_index * 4:03d}.webp"
            if sha256(output) != sha256(source):
                raise RuntimeError(f"{output}: original state is not byte-identical")

        print(
            f"[{variant}] valid: {OUTPUT_FRAME_COUNT} frames, "
            f"{expected_width}x{expected_height}",
            flush=True,
        )


def main() -> int:
    args = parse_args()
    if not 1 <= args.quality <= 100:
        raise RuntimeError("--quality must be between 1 and 100")
    if not hasattr(cv2, "optflow") or not hasattr(cv2.optflow, "createOptFlow_DeepFlow"):
        raise RuntimeError(
            "This script needs an OpenCV contrib build with cv2.optflow DeepFlow"
        )

    # Avoid implementation-specific GPU paths and keep repeated builds deterministic.
    cv2.ocl.setUseOpenCL(False)
    cv2.setNumThreads(1)

    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    if args.validate_only:
        validate(source_root, output_root)
        return 0

    output_root.mkdir(parents=True, exist_ok=True)
    variants = {
        variant: generate_variant(source_root, output_root, variant, args.quality)
        for variant in VARIANTS
    }
    write_manifest(
        output_root,
        build_manifest(source_root, output_root, args.quality, variants),
    )
    validate(source_root, output_root)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
