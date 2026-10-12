import React, { useEffect, useRef, useState } from 'react';
import { CritterBody } from '../Critter';
import useReducedMotion from '../../useReducedMotion';

// The opener: one model dragging a wagon. The wagon carries a context window,
// drawn like the post's context-window figure (same frame, same segment
// colors, instructions then tool list). Every few steps the critter spins
// into the next harness's outfit and the window resizes to that harness's
// real opening: what it sends before the model reads any code.
// sys/tools splits are approximate; totals are measured openings.
const LOOKS = [
  { outfit: 'swe', k: 2, sys: 1.2 },
  { outfit: 'cursor', k: 13.4, sys: 2 },
  { outfit: 'opencode', k: 11, sys: 3 },
  { outfit: 'mini', k: 2.4, sys: 1.6 },
  { outfit: undefined, k: 24, sys: 4 }, // Claude Code: the plain critter
];
const HOLD = 3200; // ms in each outfit
const SPIN = 760; // front, edge, back, edge, next front
const FULL = 30; // k tokens that would fill the drawn window
const BAR_X = 7.6;
const BAR_W = 42.8;

export default function Hero() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const spinRef = useRef(null);
  const [look, setLook] = useState(4);
  const [back, setBack] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;
    let timer = 0;
    let raf = 0;
    let visible = true;
    let idx = 4;
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

  const cur = LOOKS[reduce ? 4 : look];
  const unit = BAR_W / FULL;
  const sysW = cur.sys * unit;
  const toolW = (cur.k - cur.sys) * unit;
  return (
    <div ref={rootRef} className={`hs-hero${reduce ? ' is-still' : ''}`}>
      <svg viewBox="0 6 96 32" aria-hidden="true" className="hs-hero-svg">
        <g className="hero-track">
          <rect className="hero-rail" x="0" y="35" width="96" height="0.6" />
          <g className="hero-ties">
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={i * 8} y="35.6" width="3" height="0.8" />
            ))}
          </g>
        </g>

        <g className="hero-wagon">
          <text className="hero-k" x={BAR_X} y="20.6">{`${cur.k}k`}<tspan className="is-dim"> opening</tspan></text>
          <rect className="hero-seg is-sys" x="29.2" y="18.6" width="2" height="2" />
          <text className="hero-k is-dim" x="31.8" y="20.6">instructions</text>
          <rect className="hero-seg is-tools" x="48.4" y="18.6" width="2" height="2" />
          <text className="hero-k is-dim" x="51" y="20.6">tools</text>
          <rect className="hero-frame" x={BAR_X - 1.6} y="22" width={BAR_W + 3.2} height="6.4" />
          <rect className="hero-frame-in" x={BAR_X - 1} y="22.6" width={BAR_W + 2} height="5.2" />
          <rect className="hero-seg is-sys" x={BAR_X} y="23.6" height="3.2" style={{ width: sysW }} />
          <rect className="hero-seg is-tools" y="23.6" height="3.2" style={{ x: BAR_X + sysW, width: toolW }} />
          <rect className="hero-bed" x="4" y="29.4" width="50" height="2" />
          <rect className="hero-wheel" x="8" y="31.4" width="3" height="3" />
          <rect className="hero-wheel" x="47" y="31.4" width="3" height="3" />
        </g>

        <g className="hero-rope">
          <rect className="hero-rope-a" x="54" y="29.7" width="5.6" height="0.7" />
          <rect className="hero-rope-b" x="59" y="29.1" width="5.6" height="0.7" />
        </g>

        <g className="hero-puller">
          <g ref={spinRef} className="hero-spin">
            <CritterBody x={63} y={23} walk={!reduce} outfit={cur.outfit} back={!reduce && back} />
            <rect className="hero-strap" x="63.6" y="28.4" width="1.8" height="0.9" />
          </g>
        </g>
      </svg>
    </div>
  );
}
