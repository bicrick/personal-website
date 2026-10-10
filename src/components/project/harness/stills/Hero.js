import React from 'react';
import { CritterBody, Cart } from '../Critter';

// The opener: one model, hauling whatever the harness loads on.
const CARTS = [
  { x: 2, width: 27, bob: 3, load: [['c-msg', 13], ['c-msg', 17], ['c-tool', 9], ['c-msg', 21], ['c-msg', 17], ['c-sys', 13], ['c-msg', 9]] },
  { x: 37, width: 12, bob: 2, load: [['c-skill', 8], ['c-mcp', 12], ['c-sys', 4]] },
  { x: 57, width: 8, bob: 1, load: [['c-tool', 4], ['c-msg', 8]] },
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
          <line x1="31" y1="34.5" x2="37" y2="34.5" />
          <line x1="51" y1="34.5" x2="57" y2="34.5" />
          <line x1="67" y1="34.5" x2="73" y2="32" />
        </g>
        {CARTS.map((c) => (
          <Cart key={c.x} x={c.x} y={33} width={c.width} load={c.load} bob={c.bob} />
        ))}
        <CritterBody x={72} y={26} walk />
      </svg>
    </div>
  );
}
