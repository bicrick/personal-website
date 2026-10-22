/**
 * Shared strip for the thumbnail mockups.
 *
 * The bitmap is the baked production ribbon already shipped with the site
 * (public/images/infinite-tapestry/ribbon-thumb.webp). Scroll speed matches
 * infinitetapestry.app's live viewer: 30 world px/s across a 512px-tall band
 * (static/client.js `scroll_speed` / `height`). Pass the band height as `h`:
 * the crop then moves at 30 * (bandHeight / 512) CSS pixels per second.
 * prefers-reduced-motion holds one frame.
 */

const BASE = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

export const RIBBON_SRC = `${BASE}/ribbon-thumb.webp`;
export const RIBBON_FALLBACK = `${BASE}/ribbon-thumb.jpg`;
export const MARK_SRC = `${BASE}/brand/mark-plain.svg`;

export const SCROLL_WORLD_PX = 30;
export const BAND_WORLD_H = 512;

/**
 * Hold past the hard join between the meadow and the coral (a grey column in
 * the baked ribbon) so the still frame is one continuous scene.
 */
const PHASE = 0.25;

let ribbonPromise = null;
let clockStart = 0;

function loadImage(src, fallback) {
  const trySrc = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (!img.naturalWidth) {
        reject(new Error(`empty image ${url}`));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`failed ${url}`));
    img.src = url;
  });
  return trySrc(src).catch((err) => {
    if (!fallback) throw err;
    return trySrc(fallback);
  });
}

export function loadRibbon() {
  if (!ribbonPromise) {
    ribbonPromise = loadImage(RIBBON_SRC, RIBBON_FALLBACK);
  }
  return ribbonPromise;
}

export function ribbonTime(now, reduced) {
  if (reduced) return 0;
  if (!clockStart) clockStart = now;
  return (now - clockStart) / 1000;
}

export function drawStrip(ctx, ribbon, w, h, time, reduced) {
  if (!ribbon || !ribbon.naturalWidth) {
    ctx.fillStyle = '#f4efe7';
    ctx.fillRect(0, 0, w, h);
    return null;
  }
  const scale = h / ribbon.naturalHeight;
  const drawW = ribbon.naturalWidth * scale;
  const speed = SCROLL_WORLD_PX * (h / BAND_WORLD_H);
  const dist = drawW * PHASE + (reduced ? 0 : time * speed);
  let x = -((dist % drawW) + drawW) % drawW;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  while (x < w) {
    ctx.drawImage(ribbon, x, 0, drawW, h);
    x += drawW;
  }
  return { drawW, scale };
}
