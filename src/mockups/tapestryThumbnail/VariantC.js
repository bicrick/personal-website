import React from 'react';
import useTileFrame from './useTileFrame';
import { PROD_BG, drawStrip } from './ribbon';
import { blitBlur, cssContext, layer } from './canvasLayers';
import {
  BAND_WIDTH,
  buildBandMask,
  buildRing,
  createMarkPaths,
  fitMarkBox,
  opaqueBounds,
} from './mark';

function ensureMask(state, w, h, dpr) {
  const key = `${Math.round(w)}x${Math.round(h)}@${dpr}`;
  if (state.mask && state.maskKey === key) return;
  const paths = state.paths || (state.paths = createMarkPaths());
  const fit = fitMarkBox(w, h, 0.66, 0.045);
  const mask = buildBandMask(paths, w, h, dpr, fit, BAND_WIDTH);
  state.mask = mask;
  state.maskKey = key;
  state.bounds = opaqueBounds(mask, dpr);
  state.hairline = buildRing(mask, Math.max(1, Math.round(dpr * 0.85)), 'rgba(239,233,223,0.5)');
}

/**
 * Mirror `source` across `axis` into the dark field, then blur and fade it.
 * Matches the live viewer's reflection: a soft, fading copy of the band,
 * stronger below than above (refl.js aBelow 0.55 / aAbove 0.25, fade 1.25),
 * with an additive bloom so dark paint still glows on #050505.
 */
function paintMirror(main, source, w, h, dpr, axis, side, state) {
  const scratch = layer(state, `mir-${side}`, w, h, dpr);
  const ctx = cssContext(scratch, dpr);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  if (side === 'below') ctx.rect(0, axis, w, Math.max(0, h - axis));
  else ctx.rect(0, 0, w, Math.max(0, axis));
  ctx.clip();
  ctx.translate(0, axis);
  ctx.scale(1, -1);
  ctx.translate(0, -axis);
  ctx.drawImage(source, 0, 0, w, h);
  ctx.restore();

  const drawBlur = (key, divisor) => {
    const canvas = layer(state, key, w, h, dpr);
    const bctx = cssContext(canvas, dpr);
    bctx.clearRect(0, 0, w, h);
    blitBlur(bctx, scratch, w, h, state, `${key}-px`, divisor);
    return canvas;
  };

  const blurred = drawBlur(`mirb-${side}`, side === 'below' ? 6 : 9);
  const bloom = drawBlur(`mirg-${side}`, 13);
  const peak = side === 'below' ? 0.95 : 0.4;
  const bloomPeak = side === 'below' ? 0.7 : 0.24;

  const fade = (canvas, alpha) => {
    const fctx = cssContext(canvas, dpr);
    fctx.globalCompositeOperation = 'destination-in';
    const g = side === 'below'
      ? fctx.createLinearGradient(0, axis, 0, h)
      : fctx.createLinearGradient(0, axis, 0, 0);
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(0.28, `rgba(0,0,0,${(alpha * 0.72).toFixed(3)})`);
    g.addColorStop(0.62, `rgba(0,0,0,${(alpha * 0.28).toFixed(3)})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    fctx.fillStyle = g;
    fctx.fillRect(0, 0, w, h);
  };

  fade(blurred, peak);
  fade(bloom, bloomPeak);

  // gain / saturation from the live reflection shader (refl.js VAR gain 1.35, sat 1.12),
  // pushed a little so the mirror still reads at thumbnail size.
  main.save();
  main.filter = 'brightness(1.6) saturate(1.35)';
  main.drawImage(blurred, 0, 0, w, h);
  main.filter = 'none';
  main.globalCompositeOperation = 'lighter';
  main.globalAlpha = 0.8;
  main.drawImage(bloom, 0, 0, w, h);
  main.restore();
}

function paintC({ ctx, w, h, dpr, time, ribbon, reduced, state }) {
  ensureMask(state, w, h, dpr);

  const win = layer(state, 'win', w, h, dpr);
  const wctx = cssContext(win, dpr);
  wctx.clearRect(0, 0, w, h);
  drawStrip(wctx, ribbon, w, h, time, reduced);
  wctx.setTransform(1, 0, 0, 1, 0, 0);
  wctx.globalCompositeOperation = 'destination-in';
  wctx.drawImage(state.mask, 0, 0);

  ctx.fillStyle = PROD_BG;
  ctx.fillRect(0, 0, w, h);

  const { top, bottom } = state.bounds;
  // Tuck the mirror under the ink so the blur starts at the edge, not a gap below it.
  paintMirror(ctx, win, w, h, dpr, bottom - 3, 'below', state);
  paintMirror(ctx, win, w, h, dpr, Math.max(0, top + 2), 'above', state);

  ctx.drawImage(win, 0, 0, w, h);
  ctx.drawImage(state.hairline, 0, 0, w, h);
}

/**
 * Production field (#050505). The strip shows only inside the infinity, and a
 * blurred mirror of that window fades into the dark the way the live ribbon does.
 */
export default function VariantC() {
  const { wrapRef, canvasRef } = useTileFrame(paintC);
  return (
    <div ref={wrapRef} className="tap-variant tap-variant-c" data-variant="c" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
