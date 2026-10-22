/** Reused offscreen tile buffers. Sized in CSS pixels times `dpr`. */

export function layer(state, key, cssW, cssH, dpr = 1) {
  const cw = Math.max(1, Math.round(cssW * dpr));
  const ch = Math.max(1, Math.round(cssH * dpr));
  let canvas = state[key];
  if (!canvas) {
    canvas = document.createElement('canvas');
    state[key] = canvas;
  }
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  return canvas;
}

export function cssContext(canvas, dpr) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  return ctx;
}

/**
 * Soften `source` by drawing it through a small buffer and back.
 * `divisor` is in CSS pixels (8 ≈ a milky frost, 14 ≈ the production mirror).
 * `destCtx` must already be in CSS-pixel space.
 */
export function blitBlur(destCtx, source, cssW, cssH, state, key, divisor) {
  const tw = Math.max(2, Math.round(cssW / divisor));
  const th = Math.max(2, Math.round(cssH / divisor));
  const tiny = layer(state, `${key}-a`, tw, th, 1);
  const mid = layer(state, `${key}-b`, tw * 2, th * 2, 1);
  const paint = (ctx, canvas, src) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  };
  paint(tiny.getContext('2d'), tiny, source);
  paint(mid.getContext('2d'), mid, tiny);
  paint(tiny.getContext('2d'), tiny, mid);
  destCtx.imageSmoothingEnabled = true;
  destCtx.imageSmoothingQuality = 'high';
  destCtx.drawImage(tiny, 0, 0, cssW, cssH);
}
