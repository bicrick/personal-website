#!/usr/bin/env python3
"""
Pre-bake dense monochrome stipple masks for schematic crops.

Outputs alpha PNGs (white opaque dots on transparent):
  *-stipple-mask.png

Floyd–Steinberg dither at ~2× layout resolution → textbook / engraving density
(tonal range via dot density, ~10×+ prior sparse Lloyd). The app paints with
CSS mask-image + background currentColor (dark dots light / light dots dark).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "public/images/infinite-tapestry/schematic"
OUT_DIR = SRC_DIR
RIBBON = ROOT / "public/images/infinite-tapestry/ribbon-scroll.webp"

CROPS = [
    "geom-context",
    "geom-repaint",
    "geom-new",
    "geom-emit",
    "join-prev",
    "join-new",
    *[f"loop-{i}" for i in range(5)],
]

# Retina bake vs committed webp (≈ 1× CSS layout size).
# 3× ≈ ~1260px on geom-context — dense FS reads as engraving at 1× CSS / 2× DPR.
BAKE_SCALE = 3

RIBBON_RECROPS = {
    "geom-context": (1600, 875),
    "geom-repaint": (2475, 175),
    "geom-new": (2650, 350),
    "geom-emit": (2390, 612),
    "join-prev": (900, 1200),
    "join-new": (2100, 1200),
}


def load_source(name: str) -> Image.Image:
    webp = SRC_DIR / f"{name}.webp"
    ref = Image.open(webp) if webp.exists() else None
    target = (
        (ref.width * BAKE_SCALE, ref.height * BAKE_SCALE) if ref is not None else None
    )

    if name in RIBBON_RECROPS and RIBBON.exists() and target is not None:
        ribbon = Image.open(RIBBON).convert("RGB")
        x, w = RIBBON_RECROPS[name]
        x = max(0, min(x, ribbon.width - 2))
        w = min(w, ribbon.width - x)
        crop = ribbon.crop((x, 0, x + w, ribbon.height))
        preview = crop.resize(ref.size, Image.Resampling.LANCZOS)
        preview.save(webp, "WEBP", quality=90, method=6)
        print(f"  refreshed {webp.name} from ribbon @ x={x}")
        return crop.resize(target, Image.Resampling.LANCZOS)

    rgb = Image.open(webp).convert("RGB")
    if BAKE_SCALE != 1:
        rgb = rgb.resize(
            (rgb.width * BAKE_SCALE, rgb.height * BAKE_SCALE),
            Image.Resampling.LANCZOS,
        )
    return rgb


def to_ink_gray(rgb: Image.Image) -> Image.Image:
    """Luminance only → gray for dither (darker source → more ink)."""
    arr = np.asarray(rgb.convert("RGB")).astype(np.float32) / 255.0
    lum = 0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]
    lo, hi = np.percentile(lum, 1.5), np.percentile(lum, 98.5)
    lum = np.clip((lum - lo) / (hi - lo + 1e-6), 0, 1)
    # Slightly aggressive ink so midtones don't wash out at display size
    ink = np.clip((1.0 - lum) ** 0.88, 0, 1)
    gray = ((1.0 - ink) * 255.0).astype(np.uint8)
    return Image.fromarray(gray, "L")


def bake_mask(gray: Image.Image) -> Image.Image:
    gray = gray.filter(ImageFilter.UnsharpMask(radius=1.1, percent=140, threshold=2))
    bw = gray.convert("1", dither=Image.Dither.FLOYDSTEINBERG)
    mask = np.asarray(bw.convert("L"))
    # Opaque white where ink dots go (alpha PNG for CSS mask-image)
    alpha = np.where(mask < 128, 255, 0).astype(np.uint8)
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., 0:3] = 255
    rgba[..., 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def stipple_named(name: str) -> None:
    rgb = load_source(name)
    gray = to_ink_gray(rgb)
    out = bake_mask(gray)
    out_path = OUT_DIR / f"{name}-stipple-mask.png"
    out.save(out_path, "PNG", optimize=True)
    alpha = np.asarray(out.split()[-1])
    ink_px = int((alpha > 0).sum())
    print(
        f"  {name}: {out.size[0]}x{out.size[1]}, {ink_px} dots, "
        f"ink≈{alpha.mean()/255:.2f}, {out_path.stat().st_size // 1024} KB"
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in list(OUT_DIR.glob("*-stipple-light.png")) + list(
        OUT_DIR.glob("*-stipple-dark.png")
    ):
        old.unlink()
        print(f"removed {old.name}")

    for name in CROPS:
        src = SRC_DIR / f"{name}.webp"
        if not src.exists() and name not in RIBBON_RECROPS:
            print(f"skip missing {src}")
            continue
        stipple_named(name)


if __name__ == "__main__":
    main()
