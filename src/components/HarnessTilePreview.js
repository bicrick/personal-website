import React, { useEffect, useRef, useState } from 'react';
import { CritterBody, Cart } from './project/harness/Critter';
import useReducedMotion from './project/useReducedMotion';
import { ORDER, OUTFIT } from './project/harness/order';
import './project/harness/Critter.css';
import './HarnessTilePreview.css';

// Project tile for "same model, five harnesses": the pixel critter, upright,
// pulling one cart of context blocks on a straight rope. Every few seconds it
// spins into the next harness outfit and the pile changes to that harness's
// opening window (roughly 24k Claude Code ... 2k SWE-agent), one crate per ~2k.
const PILES = {
  claude_code: [['c-sys', 3], ['c-tool', 5], ['c-skill', 2], ['c-msg', 2]],
  cursor: [['c-sys', 1], ['c-tool', 3], ['c-skill', 1], ['c-msg', 2]],
  opencode: [['c-sys', 2], ['c-tool', 3], ['c-skill', 0], ['c-msg', 1]],
  swe_agent: [['c-sys', 1], ['c-tool', 0], ['c-skill', 0], ['c-msg', 0]],
  mini: [['c-sys', 1], ['c-tool', 0], ['c-skill', 0], ['c-msg', 1]],
};
const HOLD = 2400;
const FRAMES = [1, 0.5, 0.08, 0.5, 1];

export default function HarnessTilePreview() {
  const reduce = useReducedMotion();
  const [at, setAt] = useState(0);
  const [sx, setSx] = useState(1);
  const [back, setBack] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (reduce) return undefined;
    let visible = true;
    let timers = [];
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    if (rootRef.current) io.observe(rootRef.current);
    const tick = setInterval(() => {
      if (!visible || document.hidden) return;
      FRAMES.forEach((f, i) => {
        timers.push(setTimeout(() => {
          setSx(f);
          if (i === 2) setBack(true);
          if (i === 3) { setBack(false); setAt((n) => (n + 1) % ORDER.length); }
        }, i * 110));
      });
    }, HOLD);
    return () => { clearInterval(tick); timers.forEach(clearTimeout); io.disconnect(); };
  }, [reduce]);

  const id = ORDER[reduce ? 0 : at];
  return (
    <div ref={rootRef} className="harness-tile-preview">
      <svg viewBox="0 0 64 36" preserveAspectRatio="xMidYMid meet" focusable="false" shapeRendering="crispEdges">
        {Array.from({ length: 5 }, (_, c) => Array.from({ length: 7 }, (_, r) => (
          <rect key={`${c}-${r}`} className={`htp-cell${(c * 7 + r * 3) % 5 === 0 ? ' is-miss' : ''}`} x={44 + c * 3.4} y={4.4 + r * 3.4} width="2.6" height="2.6" />
        )))}
        <rect className="htp-ground" x="4" y="29" width="56" height="0.6" />
        <rect className="htp-rope" x="17.6" y="22.6" width="10.4" height="0.6" />
        <Cart x={4} y={24.6} width={11} load={PILES[id].filter(([, n]) => n > 0)} />
        <g transform="translate(36.5 0)">
          <g transform={`scale(${sx} 1)`}>
            <CritterBody x={-9} y={17} outfit={reduce ? undefined : OUTFIT[id]} back={back} />
          </g>
        </g>
      </svg>
    </div>
  );
}
