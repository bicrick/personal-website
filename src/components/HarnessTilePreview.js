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
// The pattern repeats until it covers `width`, so a wider frame gets more
// hill rather than stretched pixels.
function hill(cols, base, width) {
  const out = [];
  let x = 0;
  for (let i = 0; x < width; i += 1) {
    const [w, h] = cols[i % cols.length];
    out.push(<rect key={x} x={x} y={base - h} width={w + 0.05} height={h + 20} />);
    x += w;
  }
  return out;
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

// `wide`: fit the frame's aspect instead of cropping. The scene keeps its
// 90-unit height and grows (or shrinks) its width to match, so the sky, sun
// and clouds stay at the top, the ground and shadow at the bottom, and the
// hills repeat sideways. The home tile is 16:9 and leaves this off.
export default function HarnessTilePreview({ className = '', wide = false }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);
  const [vw, setVw] = useState(W);

  useEffect(() => {
    const el = ref.current;
    if (!wide || !el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setVw(Math.round((H * width) / height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);
  const k = vw / W;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`harness-tile-preview${live ? ' is-live' : ''}${className ? ` ${className}` : ''}`}>
      <svg className="htp-scene" viewBox={`0 0 ${vw} ${H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" focusable="false">
        <rect className="htp-sky-0" x="0" y="0" width={vw} height={H} />
        <rect className="htp-sky-1" x="0" y="34" width={vw} height={H} />
        <g className="htp-sun">
          <rect x={vw - 34} y="12" width="8" height="8" />
          <rect x={vw - 36} y="14" width="12" height="4" />
          <rect x={vw - 32} y="10" width="4" height="12" />
        </g>
        <g className="htp-clouds htp-clouds-far" style={{ '--htp-loop': `${-vw}px` }}>
          {[0, vw].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={18 * k} y={14} s={0.8} />
              <Cloud x={98 * k} y={24} s={0.7} />
            </g>
          ))}
        </g>
        <g className="htp-hill-far">{hill(FAR, 60, vw)}</g>
        <g className="htp-clouds htp-clouds-near" style={{ '--htp-loop': `${-vw}px` }}>
          {[0, vw].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={44 * k} y={30} />
            </g>
          ))}
        </g>
        <g className="htp-hill-mid">{hill(MID, 70, vw)}</g>
        <Tree x={14} y={59} />
        <Tree x={21} y={62} />
        <Tree x={vw - 22} y={60} />
        <rect className="htp-ground-edge" x="0" y="70" width={vw} height="1" />
        <rect className="htp-ground" x="0" y="71" width={vw} height="19" />
      </svg>
      <div className="harness-tile-swing">
        <SwingMark />
      </div>
    </div>
  );
}
