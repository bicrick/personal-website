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

const FAR = [[14, 14], [10, 18], [12, 21], [16, 17], [12, 13], [14, 16], [10, 20], [16, 23], [12, 19], [14, 15], [12, 12], [18, 16]];
const MID = [[18, 9], [14, 12], [12, 14], [16, 11], [14, 8], [12, 10], [18, 13], [14, 15], [12, 12], [16, 9], [14, 11]];
const NEAR = [[22, 4], [16, 6], [20, 5], [14, 3], [18, 5], [24, 6], [16, 4], [14, 5], [20, 3]];

export default function HarnessTilePreview() {
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
    <div ref={ref} className={`harness-tile-preview${live ? ' is-live' : ''}`}>
      <svg className="htp-scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" focusable="false">
        <rect className="htp-sky-0" x="0" y="0" width={W} height={H} />
        <rect className="htp-sky-1" x="0" y="22" width={W} height={H} />
        <rect className="htp-sky-2" x="0" y="38" width={W} height={H} />
        <rect className="htp-sky-3" x="0" y="50" width={W} height={H} />
        <g className="htp-sun">
          <rect x="124" y="12" width="10" height="10" />
          <rect x="122" y="14" width="14" height="6" />
          <rect x="126" y="10" width="6" height="14" />
        </g>
        <g className="htp-clouds htp-clouds-far">
          {[0, W].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={14} y={14} s={0.8} />
              <Cloud x={96} y={8} s={0.7} />
            </g>
          ))}
        </g>
        <g className="htp-hill-far">{hill(FAR, 66)}</g>
        <g className="htp-clouds htp-clouds-near">
          {[0, W].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={40} y={26} />
              <Cloud x={130} y={32} s={0.9} />
            </g>
          ))}
        </g>
        <g className="htp-hill-mid">{hill(MID, 74)}</g>
        <Tree x={20} y={64} />
        <Tree x={27} y={66} />
        <Tree x={132} y={61} />
        <Tree x={142} y={64} />
        <g className="htp-hill-near">{hill(NEAR, 82)}</g>
        <g className="htp-grass">
          {[8, 30, 52, 101, 118, 146].map((x) => (
            <rect key={x} x={x} y={77} width="1" height="2" />
          ))}
        </g>
      </svg>
      <div className="harness-tile-swing">
        <SwingMark />
      </div>
    </div>
  );
}
