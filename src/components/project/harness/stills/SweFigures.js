import React from 'react';
import useInView from '../useInView';
import Logo from '../logos';
import { SWE, SWE_N, SWE_ALL, SWE_NONE, SWE_SPREAD } from '../swebench';

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
    </div>
  );
}

// 2. Cost per solve (log x) vs pass rate.
export function SweCostScatter() {
  const { ref, on } = useInView();
  const W = 360; const H = 280; const L = 44; const R = 8; const T = 14; const B = 34;
  const lx = (v) => L + ((Math.log10(v) - Math.log10(0.004)) / (Math.log10(0.12) - Math.log10(0.004))) * (W - L - R);
  const ly = (v) => T + ((80 - v) / 25) * (H - T - B);
  const ticks = [0.005, 0.01, 0.03, 0.1];
  return (
    <div ref={ref} className={`hs-card swe-scatter${on ? ' is-on' : ''}`}>
      <div className="hs-card-head"><span>cost per solve vs pass rate</span><span className="hs-muted">log scale</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cost per solved task against pass rate for six harnesses">
        {[60, 70, 80].map((v) => (
          <g key={v}><line x1={L} x2={W - R} y1={ly(v)} y2={ly(v)} className="swe-grid" /><text x={L - 6} y={ly(v) + 5} textAnchor="end" className="swe-tick">{v}%</text></g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={lx(t)} y={H - 12} textAnchor="middle" className="swe-tick">{t < 0.01 ? `${(t * 100).toFixed(1)}¢` : `${Math.round(t * 100)}¢`}</text>
        ))}
        {SWE.map((r, i) => {
          const cx = lx(r.perSolve); const cy = ly(r.pct); const left = r.id === 'aider';
          return (
            <g key={r.id} className={`swe-pt${r.id === 'aider' ? ' is-out' : ''}`} style={{ '--i': i }}>
              <circle cx={cx} cy={cy} r={r.id === 'aider' ? 6 : 5} className={r.est ? 'is-est' : ''} />
              <text x={left ? cx - 10 : cx + 10} y={cy + 4} textAnchor={left ? 'end' : 'start'} className="swe-lab">{r.label}{r.est ? '*' : ''}</text>
            </g>
          );
        })}
      </svg>
      <div className="hs-foot">Up and left is better. Aider pays about 15× OpenCode per solved bug. *Cursor estimated from its own logs.</div>
    </div>
  );
}

// 49 tasks, one square each, grouped by how many harnesses fixed them.
export function SweOverlap() {
  const { ref, on } = useInView();
  const split = SWE_SPREAD.filter((g) => g.k > 0 && g.k < 6).flatMap(({ k, n }) => Array.from({ length: n }, () => k));
  const groups = [
    { label: 'all six fixed', cells: Array.from({ length: SWE_ALL }, () => 6) },
    { label: 'some fixed', cells: split, hl: true },
    { label: 'none fixed', cells: Array.from({ length: SWE_NONE }, () => 0) },
  ];
  let idx = 0;
  return (
    <div ref={ref} className={`hs-card swe-overlap${on ? ' is-on' : ''}`}>
      <div className="cr-title">{SWE_N} bugs, one square each</div>
      {groups.map((g) => (
        <div key={g.label} className={`swe-group${g.hl ? ' is-hl' : ''}`}>
          <div className="swe-group-head"><b>{g.cells.length}</b> {g.label}</div>
          <div className="swe-cells">
            {g.cells.map((k) => {
              idx += 1;
              return <span key={idx} className={`swe-cell${k === 0 ? ' is-none' : ''}`} style={{ '--i': idx, '--a': k / 6 }} title={`${k} of 6`} />;
            })}
          </div>
        </div>
      ))}
      <div className="hs-foot">In the middle group, darker means more harnesses fixed it. This is where the harnesses differ.</div>
    </div>
  );
}
