import React, { useEffect, useRef, useState } from 'react';
import SwingMark from './home/SwingMark';
import './HarnessTilePreview.css';

// Project tile for the harness post: the hanging critter, swinging from a
// line and spinning through the five harness outfits, over a small pixel
// naturescape. The scene is one static SVG; only the cloud layers move, by
// CSS transform, and they pause when the tile is offscreen or motion is reduced.
const W = 160;
const H = 90;

// stepped hill: a run of [width, height] columns sitting on y = base
function hill(cols, base) {
  let x = 0;
  return cols.map(([w, h]) => {
    const r = <rect key={x} x={x} y={base - h} width={w + 0.05} height={h + 20} />;
    x += w;
    return r;
  });
}

function Cloud({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="2" y="0" width="6" height="2" />
      <rect x="0" y="2" width="12" height="2" />
      <rect x="9" y="1" width="4" height="1" />
    </g>
  );
}

function Tree({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="htp-trunk" x="1.5" y="4" width="1" height="2" />
      <rect className="htp-leaf" x="0" y="1" width="4" height="3" />
      <rect className="htp-leaf" x="1" y="0" width="2" height="1" />
    </g>
  );
}

const FAR = [[16, 10], [12, 14], [14, 17], [18, 13], [14, 9], [16, 12], [12, 16], [18, 19], [14, 14], [12, 10], [14, 12]];
const MID = [[20, 5], [16, 8], [14, 10], [18, 7], [30, 3], [18, 6], [14, 9], [16, 7], [14, 5]];

export default function HarnessTilePreview({ className = '' }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`harness-tile-preview${live ? ' is-live' : ''}${className ? ` ${className}` : ''}`}>
      <svg className="htp-scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" focusable="false">
        <rect className="htp-sky-0" x="0" y="0" width={W} height={H} />
        <rect className="htp-sky-1" x="0" y="34" width={W} height={H} />
        <g className="htp-sun">
          <rect x="126" y="12" width="8" height="8" />
          <rect x="124" y="14" width="12" height="4" />
          <rect x="128" y="10" width="4" height="12" />
        </g>
        <g className="htp-clouds htp-clouds-far">
          {[0, W].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={18} y={14} s={0.8} />
              <Cloud x={98} y={24} s={0.7} />
            </g>
          ))}
        </g>
        <g className="htp-hill-far">{hill(FAR, 60)}</g>
        <g className="htp-clouds htp-clouds-near">
          {[0, W].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={44} y={30} />
            </g>
          ))}
        </g>
        <g className="htp-hill-mid">{hill(MID, 70)}</g>
        <Tree x={14} y={59} />
        <Tree x={21} y={62} />
        <Tree x={138} y={60} />
        <rect className="htp-ground-edge" x="0" y="70" width={W} height="1" />
        <rect className="htp-ground" x="0" y="71" width={W} height="19" />
      </svg>
      <div className="harness-tile-swing">
        <SwingMark />
      </div>
    </div>
  );
}
