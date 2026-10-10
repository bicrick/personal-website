import React from 'react';

// A small pixel Claude that runs through the harness post. Drawn on an
// 18 x 13 grid so every pose stays crisp at any size.
//
// mood: open | happy | tired | sleep
// walk: legs step in place
// hop:  a little bounce on loop
const EYES = {
  open: [[6, 4, 1, 2], [11, 4, 1, 2]],
  happy: [[5, 5, 1, 1], [6, 4, 1, 1], [7, 5, 1, 1], [10, 5, 1, 1], [11, 4, 1, 1], [12, 5, 1, 1]],
  tired: [[5, 5, 2, 1], [11, 5, 2, 1]],
  sleep: [[5, 5, 2, 1], [11, 5, 2, 1]],
};

export function CritterBody({ mood = 'open', walk = false, x = 0, y = 0 }) {
  return (
    <g className={`critter${walk ? ' is-walk' : ''}`} transform={`translate(${x} ${y})`}>
      <g className="critter-legs">
        <rect className="critter-leg is-a" x="4" y="9" width="1" height="3" />
        <rect className="critter-leg is-b" x="6" y="9" width="1" height="3" />
        <rect className="critter-leg is-a" x="11" y="9" width="1" height="3" />
        <rect className="critter-leg is-b" x="13" y="9" width="1" height="3" />
      </g>
      <rect className="critter-fill" x="3" y="2" width="12" height="7" />
      <rect className="critter-fill" x="1" y="5" width="2" height="2" />
      <rect className="critter-fill" x="15" y="5" width="2" height="2" />
      {EYES[mood].map(([ex, ey, w, h]) => (
        <rect key={`${ex}-${ey}`} className="critter-eye" x={ex} y={ey} width={w} height={h} />
      ))}
      {mood === 'tired' && <rect className="critter-sweat" x="16" y="1" width="1" height="2" />}
      {mood === 'sleep' && (
        <path className="critter-z" d="M16 -3h2v.6l-1.4 1.4h1.4v.6h-2v-.6l1.4-1.4h-1.4z" />
      )}
    </g>
  );
}

export default function Critter({ mood, walk, hop, className = '', label, style }) {
  return (
    <svg
      className={`critter-svg${hop ? ' is-hop' : ''} ${className}`}
      style={style}
      viewBox="0 -4 18 17"
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <CritterBody mood={mood} walk={walk} />
    </svg>
  );
}

// A pixel cart. `load` is a list of [className, height] blocks stacked
// left to right; the cart grows to fit.
export function Cart({ x = 0, y = 0, width = 14, load = [], bob }) {
  const step = width / Math.max(load.length, 1);
  return (
    <g className={`cart${bob ? ` is-bob-${bob}` : ''}`} transform={`translate(${x} ${y})`}>
      <g className="cart-ride">
        {load.map(([tone, h], i) => (
          <rect
            key={i}
            className={`cart-load ${tone}`}
            x={1 + i * step}
            y={-h}
            width={Math.max(step - 0.6, 0.8)}
            height={h}
          />
        ))}
        <rect className="cart-tray" x="0" y="0" width={width + 2} height="3" />
      </g>
      <rect className="cart-wheel" x="2" y="3" width="2" height="2" />
      <rect className="cart-wheel" x={width - 2} y="3" width="2" height="2" />
    </g>
  );
}
