import React from 'react';
import useTileFrame from './useTileFrame';
import { drawStrip } from './ribbon';
import { blitBlur, cssContext, layer } from './canvasLayers';
import {
  CREAM,
  buildBandMask,
  buildRing,
  createMarkPaths,
  fitMarkBox,
  softenMask,
} from './mark';

function ensureMask(state, w, h, dpr) {
  const key = `${Math.round(w)}x${Math.round(h)}@${dpr}`;
  if (state.mask && state.maskKey === key) return;
  const paths = state.paths || (state.paths = createMarkPaths());
  const fit = fitMarkBox(w, h, 0.72, 0);
  // Thinner than the window cutout so the holes stay open and it reads as a mark.
  const mask = buildBandMask(paths, w, h, dpr, fit, 10.4);
  state.mask = mask;
  state.maskKey = key;
  state.softMask = softenMask(mask, w, h, dpr, 16);
  state.ringCream = buildRing(mask, Math.max(1, Math.round(1.05 * dpr)), CREAM);
  state.ringInk = buildRing(mask, Math.max(2, Math.round(2.1 * dpr)), 'rgba(8,8,10,0.55)');
}

function paintB({ ctx, w, h, dpr, time, ribbon, reduced, state }) {
  ensureMask(state, w, h, dpr);
  const { mask, softMask, ringCream, ringInk } = state;

  const sharp = layer(state, 'sharp', w, h, dpr);
  const sctx = cssContext(sharp, dpr);
  sctx.clearRect(0, 0, w, h);
  drawStrip(sctx, ribbon, w, h, time, reduced);

  const frost = layer(state, 'frost', w, h, dpr);
  const fctx = cssContext(frost, dpr);
  fctx.clearRect(0, 0, w, h);
  blitBlur(fctx, sharp, w, h, state, 'frostBlur', 4.2);
  fctx.setTransform(1, 0, 0, 1, 0, 0);
  fctx.globalCompositeOperation = 'destination-in';
  fctx.drawImage(mask, 0, 0);
  fctx.globalCompositeOperation = 'source-atop';
  fctx.fillStyle = 'rgba(255, 248, 240, 0.1)';
  fctx.fillRect(0, 0, frost.width, frost.height);

  const halo = layer(state, 'halo', w, h, dpr);
  const hctx = cssContext(halo, dpr);
  hctx.clearRect(0, 0, w, h);
  blitBlur(hctx, sharp, w, h, state, 'haloBlur', 12);
  hctx.setTransform(1, 0, 0, 1, 0, 0);
  hctx.globalCompositeOperation = 'destination-in';
  hctx.drawImage(softMask, 0, 0);
  hctx.globalCompositeOperation = 'destination-out';
  hctx.drawImage(mask, 0, 0);
  hctx.globalCompositeOperation = 'source-atop';
  hctx.fillStyle = 'rgba(255, 226, 196, 0.45)';
  hctx.fillRect(0, 0, halo.width, halo.height);

  ctx.drawImage(sharp, 0, 0, w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.9;
  ctx.drawImage(halo, 0, 0, w, h);
  ctx.restore();
  ctx.drawImage(ringInk, 0, 0, w, h);
  ctx.drawImage(ringCream, 0, 0, w, h);
  ctx.drawImage(frost, 0, 0, w, h);
}

/**
 * Full-bleed strip. The infinity is a frosted band of the painting, edged in
 * the brand cream, with a glow sampled from the strip under it.
 */
export default function VariantB() {
  const { wrapRef, canvasRef } = useTileFrame(paintB);
  return (
    <div ref={wrapRef} className="tap-variant tap-variant-b" data-variant="b" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
