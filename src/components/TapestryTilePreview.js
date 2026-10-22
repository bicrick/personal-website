import React, { useCallback } from 'react';
import {
  BAND_H,
  BAND_TOP,
  MARK_H,
  MARK_SRC,
  MARK_TOP,
  RIBBON_FALLBACK,
  RIBBON_SRC,
  SCROLL_PHASE,
  SCROLL_SECONDS,
} from './tapestry/tileRibbon';
import './TapestryTilePreview.css';

function pct(fraction) {
  return `${Math.round(fraction * 1000) / 10}%`;
}

function RibbonFrame({ onError }) {
  return (
    <div className="tapestry-tile-scroller">
      <img src={RIBBON_SRC} alt="" draggable="false" decoding="async" onError={onError} />
      <img src={RIBBON_SRC} alt="" draggable="false" decoding="async" onError={onError} />
    </div>
  );
}

/**
 * Project-card thumbnail: the production ribbon, with the woven mark centered
 * on the band. The field follows the site theme (`html.is-dark`).
 * The slide is a compositor translate3d shared by the band and both mirrors.
 */
export default function TapestryTilePreview({ className = '' }) {
  const onError = useCallback((event) => {
    const img = event.currentTarget;
    if (img.dataset.fallback === '1') return;
    img.dataset.fallback = '1';
    img.src = RIBBON_FALLBACK;
  }, []);

  return (
    <div
      className={`tapestry-tile-preview${className ? ` ${className}` : ''}`}
      style={{
        '--band-top': pct(BAND_TOP),
        '--band-h': pct(BAND_H),
        '--band-bottom': pct(BAND_TOP + BAND_H),
        '--mark-top': pct(MARK_TOP),
        '--mark-h': pct(MARK_H),
        '--scroll-duration': `${SCROLL_SECONDS}s`,
        '--scroll-phase': SCROLL_PHASE,
      }}
      aria-hidden="true"
    >
      <div className="tapestry-tile-reflect is-above">
        <div className="tapestry-tile-flip">
          <RibbonFrame onError={onError} />
        </div>
      </div>
      <div className="tapestry-tile-reflect is-below">
        <div className="tapestry-tile-flip">
          <RibbonFrame onError={onError} />
        </div>
      </div>
      <div className="tapestry-tile-band">
        <RibbonFrame onError={onError} />
      </div>
      <img className="tapestry-tile-mark" src={MARK_SRC} alt="" draggable="false" />
    </div>
  );
}
