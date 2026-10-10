import React from 'react';
import { CritterBody, Cart } from '../project/harness/Critter';
import '../project/harness/Critter.css';

// The harness post's mark: the pixel Claude hauling carts of context.
// Each cart is a different-sized load, colored like the context window.
const CARTS = [
  { x: -8, width: 14, bob: 3, load: [['c-msg', 8], ['c-msg', 11], ['c-tool', 9], ['c-msg', 12]] },
  { x: 10, width: 7, bob: 2, load: [['c-mcp', 4], ['c-skill', 6], ['c-sys', 3]] },
  { x: 21, width: 3, bob: 1, load: [['c-tool', 3]] },
];

export default function CartTrainMark() {
  return (
    <svg
      className="writing-bot cart-train"
      viewBox="0 13 45 20"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <g className="cart-ground">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 8} y="31" width="3" height="0.6" />
        ))}
      </g>
      <g className="cart-rope">
        <line x1="8" y1="26.5" x2="10" y2="26.5" />
        <line x1="19" y1="26.5" x2="21" y2="26.5" />
        <line x1="26" y1="26.5" x2="28" y2="24" />
      </g>
      {CARTS.map((cart) => (
        <Cart key={cart.x} x={cart.x} y={25} width={cart.width} load={cart.load} bob={cart.bob} />
      ))}
      <CritterBody x={27} y={18} walk />
    </svg>
  );
}
