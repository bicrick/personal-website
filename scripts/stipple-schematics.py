#!/usr/bin/env python3
"""
Pre-bake monochrome weighted-Voronoi (Lloyd) stipple masks for schematic crops.

Outputs a single luminance mask per crop:
  *-stipple-mask.png  — white dots on black (no source colour/tint)

The app paints these via SVG mask + fill="currentColor" so light mode gets
dark dots and dark mode gets light dots from theme CSS alone.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "public/images/infinite-tapestry/schematic"
OUT_DIR = SRC_DIR

CROPS = [
    "geom-context",
    "geom-repaint",
    "geom-new",
    "geom-emit",
    "join-prev",
    "join-new",
    *[f"loop-{i}" for i in range(5)],
]

POINTS_PER_KPIX = 22.0
LLOYD_ITERS = 10
GRID_CAP = 160
RNG = np.random.default_rng(0x1A5E)


def luminance(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def downsample_density(density: np.ndarray, cap: int = GRID_CAP) -> tuple[np.ndarray, float]:
    h, w = density.shape
    scale = min(1.0, cap / max(w, h))
    if scale >= 1:
        return density.astype(np.float64), 1.0
    nh, nw = max(1, int(round(h * scale))), max(1, int(round(w * scale)))
    im = Image.fromarray((np.clip(density, 0, 1) * 255).astype(np.uint8), "L")
    im = im.resize((nw, nh), Image.Resampling.BOX)
    dens = np.asarray(im, dtype=np.float64) / 255.0
    dens *= (h * w) / max(1, nh * nw)
    return dens, scale


def sample_points(density: np.ndarray, n: int) -> np.ndarray:
    h, w = density.shape
    flat = np.maximum(density.ravel().astype(np.float64), 1e-6)
    flat /= flat.sum()
    idx = RNG.choice(flat.size, size=n, replace=True, p=flat)
    ys, xs = np.divmod(idx, w)
    return np.column_stack([xs + RNG.random(n), ys + RNG.random(n)]).astype(np.float64)


def lloyd(density: np.ndarray, pts: np.ndarray, iters: int) -> np.ndarray:
    dens, scale = downsample_density(density)
    h, w = dens.shape
    pts_w = pts * scale if scale < 1 else pts.copy()

    ys, xs = np.mgrid[0:h, 0:w]
    pix = np.column_stack([(xs + 0.5).ravel(), (ys + 0.5).ravel()])
    mass = dens.ravel()
    n_pix = pix.shape[0]
    chunk = 8000

    for _ in range(iters):
        n = len(pts_w)
        assign = np.empty(n_pix, dtype=np.int32)
        for start in range(0, n_pix, chunk):
            end = min(n_pix, start + chunk)
            d = pix[start:end, None, :] - pts_w[None, :, :]
            dist2 = (d * d).sum(axis=2)
            assign[start:end] = dist2.argmin(axis=1)

        new = pts_w.copy()
        for j in range(n):
            mask = assign == j
            m = mass[mask]
            total = m.sum()
            if total < 1e-9:
                continue
            new[j] = (pix[mask] * m[:, None]).sum(axis=0) / total
        pts_w = new

    if scale < 1:
        pts_w = pts_w / scale
    return pts_w


def radii_for(pts: np.ndarray, density: np.ndarray, base: float = 0.8) -> np.ndarray:
    h, w = density.shape
    xi = np.clip(pts[:, 0].astype(int), 0, w - 1)
    yi = np.clip(pts[:, 1].astype(int), 0, h - 1)
    d = density[yi, xi]
    d = (d - d.min()) / (d.max() - d.min() + 1e-9)
    return base * (0.62 + 0.55 * d)


def render_mask(
    pts: np.ndarray,
    radii: np.ndarray,
    size: tuple[int, int],
    scale: int = 2,
) -> Image.Image:
    """White soft discs on black — pure monochrome luminance mask for SVG masking."""
    w, h = size
    W, H = w * scale, h * scale
    ink = np.zeros((H, W), dtype=np.float32)

    for (x, y), r in zip(pts, radii):
        cx, cy = x * scale, y * scale
        rr = max(0.85, float(r) * scale)
        x0 = max(0, int(cx - rr * 3))
        x1 = min(W, int(cx + rr * 3) + 1)
        y0 = max(0, int(cy - rr * 3))
        y1 = min(H, int(cy + rr * 3) + 1)
        if x0 >= x1 or y0 >= y1:
            continue
        yy, xx = np.ogrid[y0:y1, x0:x1]
        dist2 = (xx - cx) ** 2 + (yy - cy) ** 2
        a = np.exp(-dist2 / (2.0 * (rr * 0.55) ** 2))
        ink[y0:y1, x0:x1] = np.maximum(ink[y0:y1, x0:x1], a)

    ink = np.clip(ink, 0, 1)
    gray = (ink * 255).astype(np.uint8)
    im = Image.fromarray(gray, "L")
    if scale != 1:
        im = im.resize((w, h), Image.Resampling.LANCZOS)
    return im


def stipple_image(path: Path) -> None:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.float32) / 255.0
    h, w = arr.shape[:2]
    lum = luminance(arr)

    # Density from luminance only — no chroma. Darker → more ink (classic stipple).
    dens = np.clip((1.0 - lum) ** 1.15, 0.04, 1.0)

    n = int(max(64, (w * h / 1000.0) * POINTS_PER_KPIX))
    n = min(n, 6000)
    print(f"  {path.stem}: {w}x{h}, {n} points")

    pts = sample_points(dens, n)
    pts = lloyd(dens, pts, LLOYD_ITERS)
    pts[:, 0] = np.clip(pts[:, 0], 0.5, w - 0.5)
    pts[:, 1] = np.clip(pts[:, 1], 0.5, h - 0.5)
    rad = radii_for(pts, dens, base=0.92 if max(w, h) > 100 else 0.8)
    out = render_mask(pts, rad, (w, h), scale=2)
    out_path = OUT_DIR / f"{path.stem}-stipple-mask.png"
    out.save(out_path, "PNG", optimize=True)
    print(f"    -> {out_path.name} ({out_path.stat().st_size // 1024} KB)")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Remove prior dual-colour theme renders if present
    for old in OUT_DIR.glob("*-stipple-light.png"):
        old.unlink()
        print(f"removed {old.name}")
    for old in OUT_DIR.glob("*-stipple-dark.png"):
        old.unlink()
        print(f"removed {old.name}")

    for name in CROPS:
        src = SRC_DIR / f"{name}.webp"
        if not src.exists():
            print(f"skip missing {src}")
            continue
        stipple_image(src)


if __name__ == "__main__":
    main()
