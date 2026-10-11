import React from 'react';
import useInView from '../useInView';
import Logo from '../logos';
import { SWE, SWE_N, SWE_ALL, SWE_NONE } from '../swebench';

// 1. Pass rate with 95% interval whiskers. Axis 40-100%.
export function SwePassRate() {
  const { ref, on } = useInView();
  const x = (v) => `${((v - 40) / 60) * 100}%`;
  return (
    <div ref={ref} className={`hs-card swe-ci${on ? ' is-on' : ''}`}>
      <div className="hs-card-head"><span>pass rate, {SWE_N} tasks</span><span className="hs-muted">bar = 95% range</span></div>
      {SWE.map((r, i) => (
        <div key={r.id} className="swe-ci-row" style={{ '--i': i }}>
          <span className="hs-bar-label">{r.logo && <Logo id={r.logo} />}{r.label}</span>
          <div className="swe-ci-track">
            <span className="swe-ci-whisker" style={{ left: x(r.ci[0]), width: `calc(${x(r.ci[1])} - ${x(r.ci[0])})` }} />
            <span className="swe-ci-dot" style={{ left: x(r.pct) }} />
          </div>
          <span className="hs-bar-val">{r.pct}%</span>
        </div>
      ))}
      <div className="swe-ci-axis"><span /><span>40%</span><span>70%</span><span>100%</span><span /></div>
      <div className="hs-foot">Every bar overlaps every other. Only top versus bottom is a real gap.</div>
    </div>
  );
}

// 2. Cost per solve (log x) vs pass rate.
export function SweCostScatter() {
  const { ref, on } = useInView();
  const W = 520; const H = 250; const L = 40; const R = 16; const T = 16; const B = 34;
  const lx = (v) => L + ((Math.log10(v) - Math.log10(0.004)) / (Math.log10(0.12) - Math.log10(0.004))) * (W - L - R);
  const ly = (v) => T + ((80 - v) / 25) * (H - T - B);
  const ticks = [0.005, 0.01, 0.02, 0.05, 0.1];
  return (
    <div ref={ref} className={`hs-card swe-scatter${on ? ' is-on' : ''}`}>
      <div className="hs-card-head"><span>cost per solve vs pass rate</span><span className="hs-muted">log scale</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cost per solved task against pass rate for six harnesses">
        {[60, 70, 80].map((v) => (
          <g key={v}><line x1={L} x2={W - R} y1={ly(v)} y2={ly(v)} className="swe-grid" /><text x={L - 6} y={ly(v) + 4} textAnchor="end" className="swe-tick">{v}%</text></g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={lx(t)} y={H - 12} textAnchor="middle" className="swe-tick">{t < 0.01 ? `${(t * 100).toFixed(1)}¢` : `${Math.round(t * 100)}¢`}</text>
        ))}
        {SWE.map((r, i) => {
          const cx = lx(r.perSolve); const cy = ly(r.pct); const left = r.id === 'aider';
          return (
            <g key={r.id} className={`swe-pt${r.id === 'aider' ? ' is-out' : ''}`} style={{ '--i': i }}>
              <circle cx={cx} cy={cy} r={r.id === 'aider' ? 6 : 5} className={r.est ? 'is-est' : ''} />
              <text x={left ? cx - 10 : cx + 10} y={cy + 4} textAnchor={left ? 'end' : 'start'} className="swe-lab">{r.label}{r.est ? ' (est.)' : ''}</text>
            </g>
          );
        })}
      </svg>
      <div className="hs-foot">Aider pays about 15× OpenCode per solved task, and solves fewer.</div>
    </div>
  );
}

// 3. Tokens per solve, with cache hit rate beside it.
export function SweTokens() {
  const { ref, on } = useInView();
  const max = 460000;
  const rows = [...SWE].sort((a, b) => a.tokPerSolve - b.tokPerSolve);
  return (
    <div ref={ref} className={`hs-card hs-bars has-side${on ? ' is-on' : ''}`}>
      <div className="hs-card-head"><span>tokens per solved task</span><span className="hs-muted">from cache</span></div>
      {rows.map((r, i) => (
        <div key={r.id} className={`hs-bar-row${r.cache < 50 ? ' is-hl' : ''}`} style={{ '--i': i, '--w': `${(r.tokPerSolve / max) * 100}%` }}>
          <span className="hs-bar-label">{r.logo && <Logo id={r.logo} />}{r.label}</span>
          <div className="hs-bar-track"><span className="hs-bar-fill" /></div>
          <span className="hs-bar-val">{Math.round(r.tokPerSolve / 1000)}k</span>
          <span className="hs-bar-side">{r.cache}%</span>
        </div>
      ))}
      <div className="hs-foot">
        Aider isn&apos;t the heaviest, it just almost never hits the cache. All six solved the same {SWE_ALL} tasks; none solved {SWE_NONE}.
      </div>
    </div>
  );
}
