import React from 'react';
import useTileFrame from './useTileFrame';
import { MARK_SRC, drawStrip } from './ribbon';

function paintA({ ctx, w, h, time, ribbon, reduced }) {
  drawStrip(ctx, ribbon, w, h, time, reduced);
}

/** Full-bleed strip. The official woven mark sits on top, in crisp vectors. */
export default function VariantA() {
  const { wrapRef, canvasRef } = useTileFrame(paintA);

  return (
    <div ref={wrapRef} className="tap-variant tap-variant-a" data-variant="a" aria-hidden="true">
      <canvas ref={canvasRef} />
      <img className="tap-a-mark" src={MARK_SRC} alt="" draggable="false" />
    </div>
  );
}
