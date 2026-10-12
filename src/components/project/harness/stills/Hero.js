import React, { useEffect, useRef, useState } from 'react';
import { CritterBody, Cart } from '../Critter';
import useReducedMotion from '../../useReducedMotion';
import { ORDER, OUTFIT } from '../order';

// The opener: one model, hauling whatever the harness loads on. The critter
// cycles through the five harness outfits with a quick spin (same costume
// and back-view art as the home page's SwingMark) while the carts glide on.
// The lead cart is the harness's opening window, so it grows and shrinks
// with the outfit; the two behind are the conversation piling up.
// Opening window per harness, in k tokens (measured before any code).
const OPEN_K = { claude_code: 24, cursor: 13.4, opencode: 11, swe_agent: 2, mini: 2.4 };
const LOOKS = ORDER.map((id) => ({ outfit: OUTFIT[id], k: OPEN_K[id] }));
const HOLD = 2600; // ms in each outfit
const SPIN = 720; // ms per turn: front, edge, back, edge, next front

// Opening-window cart: grey system prompt under orange tool definitions
// and gold skills, the same colors as the context legends further down.
function opening(k) {
  const tools = Math.max(1, Math.round(k / 6));
  const extra = k > 12 ? 1 : 0;
  return [
    ['c-sys', 1], ['c-sys', 1 + tools], ['c-tool', tools + extra], ['c-sys', 1 + tools],
    ['c-tool', Math.max(1, tools - 1 + extra)], ['c-skill', extra || 1],
  ];
}
// Each column: [tone, crates]. Bottom crate of every column is the system prompt.
const HISTORY = [
  [['c-sys', 1], ['c-msg', 3], ['c-msg', 4], ['c-tool', 2], ['c-msg', 5], ['c-msg', 3], ['c-msg', 4], ['c-msg', 2]],
  [['c-sys', 1], ['c-msg', 2], ['c-tool', 1], ['c-msg', 3], ['c-msg', 2]],
];

export default function Hero() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const spinRef = useRef(null);
  const [look, setLook] = useState(0);
  const [back, setBack] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;
    let timer = 0;
    let raf = 0;
    let visible = true;
    let idx = 0;
    const g = spinRef.current;

    const spin = () => {
      const t0 = performance.now();
      let phase = 0;
      const frame = (now) => {
        const p = Math.min((now - t0) / SPIN, 1);
        if (p >= 0.25 && phase === 0) { phase = 1; setBack(true); }
        if (p >= 0.75 && phase === 1) {
          phase = 2;
          idx = (idx + 1) % LOOKS.length;
          setBack(false);
          setLook(idx);
        }
        // a few snapped frames keep the pixels crisp
        const sx = Math.round(Math.cos(2 * Math.PI * p) * 4) / 4;
        g.style.transform = `scale(${Math.abs(sx) < 0.05 ? 0.12 : sx}, 1)`;
        if (p < 1) raf = requestAnimationFrame(frame);
        else { g.style.transform = ''; schedule(); }
      };
      raf = requestAnimationFrame(frame);
    };
    const schedule = () => {
      clearTimeout(timer);
      if (visible) timer = setTimeout(spin, HOLD);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      root.classList.toggle('is-paused', !visible);
      if (visible && !was) schedule();
      if (!visible) clearTimeout(timer);
    });
    io.observe(root);
    schedule();
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);

  const cur = LOOKS[reduce ? 0 : look];
  return (
    <div ref={rootRef} className={`hs-hero${reduce ? ' is-still' : ''}`}>
      <svg viewBox="0 4 96 34" aria-hidden="true" className="hs-hero-svg">
        <g className="hero-track">
          <rect className="hero-rail" x="0" y="35" width="96" height="0.6" />
          <g className="hero-ties">
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={i * 8} y="35.6" width="3" height="1" />
            ))}
          </g>
        </g>
        <g className="cart-rope">
          <rect x="30" y="31" width="5" height="0.6" />
          <rect x="51" y="31" width="5" height="0.6" />
          <rect x="70" y="31" width="7" height="0.6" />
        </g>
        <Cart x={2} y={30} width={26} load={HISTORY[0]} />
        <Cart x={35} y={30} width={14} load={HISTORY[1]} />
        <Cart x={56} y={30} width={12} load={opening(cur.k)} />
        <g className="hero-puller">
          <g ref={spinRef} className="hero-spin">
            <CritterBody x={74} y={23} walk={!reduce} outfit={cur.outfit} back={!reduce && back} />
          </g>
        </g>
      </svg>
    </div>
  );
}
