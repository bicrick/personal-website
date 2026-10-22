/**
 * Desktop ribbon from infinitetapestry.app (static/client.js + static/refl.js).
 *
 * The band is a fraction of the tile (production uses 0.6) and sits on the
 * optical center the live viewer uses when it is not fullscreen: a 6% lift,
 * so the cream margin below is a little taller than the one above. Reflections
 * are the light-mode mirror: a blurred, fading copy of the band, stronger
 * below (aBelow 0.55) than above (aAbove 0.25), composited over #f4efe7.
 */

import { drawStrip } from './ribbon';
import { blitBlur, cssContext, layer } from './canvasLayers';

export const PROD_RIBBON = 0.6;
export const FIELD = '#f4efe7';

const LIFT = 0.06;
const A_BELOW = 0.55;
const A_ABOVE = 0.25;
const FADE = 1.25;
const GLOW = 0.18;
/** Downscale factor for the mirror. High enough to melt detail, low enough that the flip still reads at tile size. */
const BLUR = 8;

export const PROD_CENTER = (1 - LIFT) / 2;

export function bandFractions(ribbon) {
  const top = PROD_CENTER - ribbon / 2;
  return { top, center: PROD_CENTER, ribbon };
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Light-mode coverage of the mirror at distance `d` (fraction of the band height). */
function reflectAlpha(d, below) {
  const dn = d / FADE;
  if (dn > 1.15) return 0;
  const f = Math.exp(-dn * 3) * smoothstep(0, 0.012, d + 0.006);
  const k = f * (below ? A_BELOW : A_ABOVE);
  const g = GLOW * Math.exp(-dn * 1.8) * (below ? 1 : 0.6) * 0.35;
  return Math.min(1, k + g);
}

/**
 * Fade one margin by stacking 2px strips of the opaque mirror.
 * The tile canvas is created without alpha, and a destination-in mask on a
 * second buffer does not survive the draw onto it. Uniform alpha does.
 */
function paintSide(main, src, dpr, edge, far, w, bandH, below) {
  const span = far - edge;
  const abs = Math.abs(span);
  if (abs < 1 || bandH < 1) return;
  const n = Math.ceil(abs / 2);
  const bw = src.width;
  for (let i = 0; i < n; i += 1) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const a = reflectAlpha((((t0 + t1) / 2) * abs) / bandH, below);
    if (a < 0.012) continue;
    const y0 = edge + span * t0;
    const y1 = edge + span * t1;
    const y = Math.min(y0, y1);
    const sh = Math.abs(y1 - y0);
    main.globalAlpha = a;
    main.drawImage(
      src,
      0,
      Math.max(0, y * dpr),
      bw,
      Math.max(1, sh * dpr),
      0,
      y,
      w,
      sh,
    );
  }
}

function paintReflect(main, strip, w, h, dpr, top, bandH, state) {
  const bot = top + bandH;
  const scratch = layer(state, 'refl-src', w, h, dpr);
  const sctx = cssContext(scratch, dpr);
  sctx.fillStyle = FIELD;
  sctx.fillRect(0, 0, w, h);
  sctx.drawImage(strip, 0, top, w, bandH);

  const mirror = (edge, y0, y1) => {
    sctx.save();
    sctx.beginPath();
    sctx.rect(0, Math.min(y0, y1), w, Math.abs(y1 - y0));
    sctx.clip();
    sctx.translate(0, edge);
    sctx.scale(1, -1);
    sctx.translate(0, -edge);
    sctx.drawImage(strip, 0, top, w, bandH);
    sctx.restore();
  };
  mirror(bot, bot, h);
  mirror(top, top, 0);

  const blurred = layer(state, 'refl-blur', w, h, dpr);
  const bctx = cssContext(blurred, dpr);
  bctx.clearRect(0, 0, w, h);
  blitBlur(bctx, scratch, w, h, state, 'refl', BLUR);

  const graded = layer(state, 'refl-grade', w, h, dpr);
  const gctx = cssContext(graded, dpr);
  gctx.clearRect(0, 0, w, h);
  gctx.filter = 'brightness(1.12) saturate(1.12)';
  gctx.drawImage(blurred, 0, 0, w, h);
  gctx.filter = 'none';

  main.save();
  paintSide(main, graded, dpr, bot, h, w, bandH, true);
  paintSide(main, graded, dpr, top, 0, w, bandH, false);
  main.restore();
}

export function paintBand(frame, ribbonFrac) {
  const { ctx, w, h, dpr, time, ribbon, reduced, state } = frame;
  const { top } = bandFractions(ribbonFrac);
  const bandH = h * ribbonFrac;
  const y = top * h;

  ctx.fillStyle = FIELD;
  ctx.fillRect(0, 0, w, h);

  const strip = layer(state, 'strip', w, Math.max(1, bandH), dpr);
  const sctx = cssContext(strip, dpr);
  drawStrip(sctx, ribbon, w, bandH, time, reduced);

  paintReflect(ctx, strip, w, h, dpr, y, bandH, state);
  ctx.drawImage(strip, 0, y, w, bandH);
}
