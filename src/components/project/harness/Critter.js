import React from 'react';

// A small pixel Claude that runs through the harness post, drawn on an
// 18 x 13 grid. Shapes overlap slightly so there are no seams when it
// moves on sub-pixel positions.
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

// Outfits: the same Claude dressed as each harness. Each is a few extra
// pixels over (or behind) the body; `hideEyes` swaps in the costume's own.
const OUTFITS = {
  cursor: {
    hideEyes: true,
    behind: [['o-cape', 'M3 5h12l2.5 7h-17z']],
    over: [
      ['o-dark', 'M3 2h12v3H3zM3 1h2v1H3zM4 0h1v1H4zM13 1h2v1h-2zM13 0h1v1h-1z'],
      ['o-white', 'M5 3h2v1H5zM11 3h2v1h-2z'],
      ['o-emblem', 'M6.5 6.4h5v1.6h-5z'],
      ['o-dark', 'M8.5 6.7h1v1h-1zM7.5 6.9h.6v.6h-.6zM9.9 6.9h.6v.6h-.6z'],
    ],
  },
  opencode: {
    over: [
      ['o-dark', 'M2 1h14v2H2zM2 3h1v6H2zM15 3h1v6h-1zM3 7h12v2H3zM1 5h2v2H1zM15 5h2v2h-2z'],
    ],
  },
  codex: {
    over: [
      ['o-dark', 'M4 3h4v1H4zM4 6h4v1H4zM4 4h1v2H4zM7 4h1v2H7zM10 3h4v1h-4zM10 6h4v1h-4zM10 4h1v2h-1zM13 4h1v2h-1zM8 4h2v1H8zM3 4h1v1H3zM14 4h1v1h-1z'],
    ],
  },
  gemini: {
    over: [
      ['o-hat', 'M5 2L9 -4l4 6z'],
      ['o-hat-brim', 'M2 1.6h14v1H2z'],
      ['o-star', 'M9 -2.4h.8v2.6H9zM8.1 -1.5h2.6v.8H8.1z'],
    ],
  },
  aider: {
    hideEyes: true,
    over: [
      ['o-visor', 'M3 3.5h12v3H3z'],
      ['o-visor-glow', 'M4 4.3h10v1.4H4z'],
      ['o-dark', 'M2 4h1v2H2zM15 4h1v2h-1z'],
    ],
  },
  mini: {
    over: [
      ['o-hardhat', 'M4.5 -0.5h9v2.5h-9zM6 -1.5h6v1H6z'],
      ['o-hardhat', 'M2.5 1.6h13v1h-13z'],
      ['o-hardhat-band', 'M8.5 -1.5h1v3.5h-1z'],
    ],
  },
  harness: {
    over: [
      ['o-strap', 'M4 2h1v7H4zM13 2h1v7h-1zM3 7h12v1H3z'],
      ['o-buckle', 'M8 6.5h2v2H8z'],
    ],
  },
};

export function CritterBody({ mood = 'open', walk = false, outfit, x = 0, y = 0, legsRef }) {
  const o = OUTFITS[outfit] || {};
  return (
    <g className={`critter${walk ? ' is-walk' : ''}`} transform={`translate(${x} ${y})`}>
      {(o.behind || []).map(([cls, d], i) => <path key={`b${i}`} className={cls} d={d} />)}
      <g className="critter-legs" ref={legsRef}>
        <rect className="critter-leg is-a" x="4" y="8.5" width="1" height="3.5" />
        <rect className="critter-leg is-b" x="6" y="8.5" width="1" height="3.5" />
        <rect className="critter-leg is-a" x="11" y="8.5" width="1" height="3.5" />
        <rect className="critter-leg is-b" x="13" y="8.5" width="1" height="3.5" />
      </g>
      <path className="critter-fill" d="M3 2h12v3h2v2h-2v2H3V7H1V5h2z" />
      {!o.hideEyes && EYES[mood].map(([ex, ey, w, h]) => (
        <rect key={`${ex}-${ey}`} className="critter-eye" x={ex} y={ey} width={w} height={h} />
      ))}
      {(o.over || []).map(([cls, d], i) => <path key={`o${i}`} className={cls} d={d} />)}
      {mood === 'tired' && <rect className="critter-sweat" x="16" y="1" width="1" height="2" />}
      {mood === 'sleep' && (
        <path className="critter-z" d="M16 -3h2v.6l-1.4 1.4h1.4v.6h-2v-.6l1.4-1.4h-1.4z" />
      )}
    </g>
  );
}

export default function Critter({ mood, walk, hop, outfit, className = '', label, style }) {
  return (
    <svg
      className={`critter-svg${hop ? ' is-hop' : ''} ${className}`}
      style={style}
      viewBox="0 -4 18 17"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <CritterBody mood={mood} walk={walk} outfit={outfit} />
    </svg>
  );
}

// A pixel cart. `load` is a list of [className, height] columns; each
// column is stacked from square crates, so a bigger load is a taller pile.
export function Cart({ x = 0, y = 0, width = 14, load = [], bob }) {
  const step = width / Math.max(load.length, 1);
  const size = Math.max(step - 0.5, 0.8);
  return (
    <g className={`cart${bob ? ` is-bob-${bob}` : ''}`} transform={`translate(${x} ${y})`}>
      <g className="cart-ride">
        {load.flatMap(([tone, h], i) => {
          const count = Math.max(1, Math.round(h / (size + 0.4)));
          return Array.from({ length: count }, (_, j) => (
            <rect
              key={`${i}-${j}`}
              className={`cart-load ${tone}`}
              x={1 + i * step}
              y={-(j + 1) * (size + 0.4)}
              width={size}
              height={size}
              rx="0.35"
            />
          ));
        })}
        <rect className="cart-tray" x="0" y="0" width={width + 2} height="3" rx="0.4" />
      </g>
      <circle className="cart-wheel" cx="3" cy="4" r="1.3" />
      <circle className="cart-wheel" cx={width - 1} cy="4" r="1.3" />
    </g>
  );
}
