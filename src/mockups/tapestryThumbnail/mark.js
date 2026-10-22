import { createMarkPaths } from '../../components/tapestry/markGeometry';

/**
 * Tight crop of mark-plain.svg (viewBox "2 14 60 36"). Fitting this box, rather
 * than the full 64 square, makes the infinity large on a 16:9 tile.
 */
export const MARK_BOX = { x: 2, y: 14, w: 60, h: 36 };

/** Same outer-band weight the live cutout uses (9 × 1.55), as one solid window. */
export const BAND_WIDTH = 9 * 1.55;

export const CREAM = '#efe9df';

export { createMarkPaths };

export function fitMarkBox(cssW, cssH, fill = 0.72, lift = 0) {
  const scale = Math.min((cssW * fill) / MARK_BOX.w, (cssH * fill) / MARK_BOX.h);
  const ox = (cssW - MARK_BOX.w * scale) / 2 - MARK_BOX.x * scale;
  const oy = (cssH - MARK_BOX.h * scale) / 2 - MARK_BOX.y * scale - cssH * lift;
  return { scale, ox, oy };
}

function mirrorLeftHalf(canvas) {
  const cw = canvas.width;
  const ch = canvas.height;
  const half = Math.floor(cw / 2);
  const left = document.createElement('canvas');
  left.width = half;
  left.height = ch;
  left.getContext('2d').drawImage(canvas, 0, 0, half, ch, 0, 0, half, ch);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(cw - half, 0, half, ch);
  ctx.setTransform(-1, 0, 0, 1, cw, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(left, 0, 0);
  ctx.restore();
  return canvas;
}

/** Solid infinity band, in device pixels, symmetric across the tile. */
export function buildBandMask(paths, cssW, cssH, dpr, fit, width = BAND_WIDTH) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.translate(fit.ox, fit.oy);
  ctx.scale(fit.scale, fit.scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = width;
  ctx.stroke(paths.right);
  ctx.stroke(paths.left);
  return mirrorLeftHalf(canvas);
}

/** Ring of `radius` device pixels just outside the mask. */
export function buildRing(mask, radius, color) {
  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;
  const ctx = canvas.getContext('2d');
  const r = Math.max(1, Math.round(radius));
  for (let dy = -r; dy <= r; dy += 1) {
    for (let dx = -r; dx <= r; dx += 1) {
      if (dx * dx + dy * dy <= r * r + 1) ctx.drawImage(mask, dx, dy);
    }
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Blurred copy of a mask, same device size as the tile. Used as a soft halo alpha. */
export function softenMask(mask, cssW, cssH, dpr, divisor) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const tw = Math.max(2, Math.round(cssW / divisor));
  const th = Math.max(2, Math.round(cssH / divisor));
  const tiny = document.createElement('canvas');
  tiny.width = tw;
  tiny.height = th;
  const tctx = tiny.getContext('2d');
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(mask, 0, 0, tw, th);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(tiny, 0, 0, cssW, cssH);
  return canvas;
}

/** CSS-pixel bounds of opaque pixels. Sampled once per mask, not per frame. */
export function opaqueBounds(mask, dpr) {
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  const { width, height, data } = ctx.getImageData(0, 0, mask.width, mask.height);
  let minY = height;
  let maxY = 0;
  const step = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 20) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxY <= minY) {
    return { top: 0, bottom: height / dpr };
  }
  return { top: minY / dpr, bottom: (maxY + step) / dpr };
}
