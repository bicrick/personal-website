import React from 'react';
import { CritterBody, Cart } from '../Critter';

// The opener: one model, hauling whatever the harness loads on.
const CARTS = [
  { x: 2, width: 26, bob: 3, load: [['c-msg', 14], ['c-msg', 18], ['c-tool', 12], ['c-msg', 16], ['c-msg', 19], ['c-msg', 13], ['c-sys', 9]] },
  { x: 36, width: 12, bob: 2, load: [['c-skill', 6], ['c-mcp', 8], ['c-sys', 5]] },
  { x: 56, width: 6, bob: 1, load: [['c-tool', 3], ['c-msg', 4]] },
];

export default function Hero() {
  return (
    <div className="hs-hero">
      <svg viewBox="0 6 92 36" aria-hidden="true" className="hs-hero-svg">
        <g className="cart-ground">
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={i * 8} y="39" width="3" height="0.5" />
          ))}
        </g>
        <g className="cart-rope">
          <line x1="30" y1="34.5" x2="36" y2="34.5" />
          <line x1="50" y1="34.5" x2="56" y2="34.5" />
          <line x1="64" y1="34.5" x2="73" y2="32" />
        </g>
        {CARTS.map((c) => (
          <Cart key={c.x} x={c.x} y={33} width={c.width} load={c.load} bob={c.bob} />
        ))}
        <CritterBody x={72} y={26} walk />
      </svg>
    </div>
  );
}
