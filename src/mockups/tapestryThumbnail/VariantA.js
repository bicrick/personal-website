import React from 'react';
import useTileFrame from './useTileFrame';
import { MARK_SRC } from './ribbon';
import { PROD_RIBBON, bandFractions, paintBand } from './band';

/**
 * Production ribbon: a horizontal band on the cream field, with the mirrored
 * fade above and below, and the woven mark centered on the band.
 */
export default function VariantA({ ribbon = PROD_RIBBON, mark = 0.22 }) {
  const { center } = bandFractions(ribbon);
  const { wrapRef, canvasRef } = useTileFrame((frame) => {
    paintBand(frame, ribbon);
  });

  return (
    <div
      ref={wrapRef}
      className="tap-variant tap-variant-a"
      style={{
        '--mark-top': `${center * 100}%`,
        '--mark-h': `${mark * 100}%`,
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
      <img className="tap-a-mark" src={MARK_SRC} alt="" draggable="false" />
    </div>
  );
}
