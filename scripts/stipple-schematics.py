#!/usr/bin/env python3
"""
Pre-bake dense monochrome stipple masks for schematic crops.

Outputs alpha PNGs (white opaque dots on transparent):
  *-stipple-mask.png

Bake is Floyd–Steinberg dithering at high resolution so tonal range reads via
dot density (textbook / engraving). The app paints with CSS mask-image +
background currentColor (dark dots in light mode, light dots in dark mode).
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

# Retina bake scale relative to the existing webp crop size.
# Display slots are ~1× crop width in CSS px; 4× → sharp on 2× DPR.
UPSCALE = 4

# Optional ribbon re-crops (x, width) at full ribbon height for sharper geom sources.
# Matched against current webp fingerprints; join/loop keep committed webps.
RIBBON_RECROPS = {
    "geom-context": (1600, 875),
    "geom-repaint": (2475, 175),
    "geom-new": (2650, 350),
    "geom-emit": (2390, 612),
    # Landscape join plates — adjacent scenes from the ribbon band
    "join-prev": (900, 1200),
    "join-new": (2100, 1200),
}


def load_source(name: str) -> tuple[Image.Image, int]:
    """Return (RGB image, extra_upscale). Ribbon crops already high-res → less upscale."""
    webp = SRC_DIR / f"{name}.webp"
    if name in RIBBON_RECROPS and RIBBON.exists():
        ribbon = Image.open(RIBBON).convert("RGB")
        x, w = RIBBON_RECROPS[name]
        x = max(0, min(x, ribbon.width - 2))
        w = min(w, ribbon.width - x)
        crop = ribbon.crop((x, 0, x + w, ribbon.height))
        if webp.exists():
            ref = Image.open(webp)
            # Preview webp stays layout-sized; bake uses full ribbon height.
            preview = crop.resize(ref.size, Image.Resampling.LANCZOS)
            preview.save(webp, "WEBP", quality=90, method=6)
            print(f"  refreshed {webp.name} from ribbon @ x={x} (bake {crop.size})")
        # Ribbon is already ~2× old crop height → 2× more is enough for retina
        return crop, 2
    return Image.open(webp).convert("RGB"), UPSCALE


def to_ink_gray(rgb: Image.Image) -> Image.Image:
    """Luminance → gray where darker source → darker gray (more ink after dither)."""
    arr = np.asarray(rgb.convert("RGB")).astype(np.float32) / 255.0
    lum = 0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]
    lo, hi = np.percentile(lum, 2), np.percentile(lum, 98)
    lum = np.clip((lum - lo) / (hi - lo + 1e-6), 0, 1)
    # Mild midtone lift so structure reads; still pure luminance (no chroma).
    ink = np.clip((1.0 - lum) ** 0.92, 0, 1)
    gray = ((1.0 - ink) * 255.0).astype(np.uint8)
    return Image.fromarray(gray, "L")


def bake_mask(gray: Image.Image, upscale: int) -> Image.Image:
    """Floyd–Steinberg → alpha PNG (opaque white where ink dots go)."""
    w, h = gray.size
    if upscale > 1:
        gray = gray.resize((w * upscale, h * upscale), Image.Resampling.LANCZOS)
    gray = gray.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=2))
    bw = gray.convert("1", dither=Image.Dither.FLOYDSTEINBERG)
    mask = np.asarray(bw.convert("L"))
    alpha = np.where(mask < 128, 255, 0).astype(np.uint8)
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., 0:3] = 255
    rgba[..., 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def stipple_named(name: str) -> None:
    rgb, upscale = load_source(name)
    gray = to_ink_gray(rgb)
    out = bake_mask(gray, upscale)
    out_path = OUT_DIR / f"{name}-stipple-mask.png"
    out.save(out_path, "PNG", optimize=True)
    ink = float(np.asarray(out.split()[-1]).mean() / 255.0)
    print(
        f"  {name}: bake {out.size[0]}x{out.size[1]}, "
        f"ink≈{ink:.2f}, {out_path.stat().st_size // 1024} KB"
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*-stipple-light.png"):
        old.unlink()
        print(f"removed {old.name}")
    for old in OUT_DIR.glob("*-stipple-dark.png"):
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
