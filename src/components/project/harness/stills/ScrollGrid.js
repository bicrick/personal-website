import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Critter from '../Critter';
import Stack from '../Stack';
import useReducedMotion from '../../useReducedMotion';
import useScrollProgress from '../useScrollProgress';
import { GRID_CELLS, GRID_ORDER, GRID_NONE, GRID_ALL } from '../grid';
import { ROSTER, harnessHref, cents } from '../roster';

// The spine: 50 bugs x 6 harnesses. Scroll replays the runs in the order they
// finished (yellow = working, then green or red), pins the rows every harness
// agreed on, then re-colors every cell by what that run cost.
const N = GRID_ORDER.length;
const RANK = {};
GRID_ORDER.forEach(([r, c], i) => { RANK[`${r}-${c}`] = i; });
const AIDER = ROSTER.findIndex((h) => h.id === 'aider');
const unanimous = (r) => {
  const s = GRID_CELLS[r].reduce((n, x) => n + x[0], 0);
  return s === 0 || s === 6;
};
const LO = Math.log10(0.001);
const HI = Math.log10(0.1);
const shade = (usd) => Math.min(1, Math.max(0.06, (Math.log10(Math.max(usd, 0.001)) - LO) / (HI - LO)));

const CAPS = [
  'Each row is a bug. Each column is a harness. Scroll to run them.',
  'Yellow is working. Green is fixed. Red is not.',
  'Same model, and nearly the same picture in every column.',
  `Most rows are one color all the way across. ${GRID_ALL} bugs every harness fixed. ${GRID_NONE} that none did. The bug decides more than the harness.`,
  'Aider\u2019s column is the redder one.',
  'Now color each run by what it cost. Darker is pricier. Same fixes, very different bills.',
];

function phase(p) {
  if (p < 0.04) return 0;
  if (p < 0.24) return 1;
  if (p < 0.44) return 2;
  if (p < 0.62) return 3;
  if (p < 0.76) return 4;
  return 5;
}

export default function ScrollGrid() {
  const reduce = useReducedMotion();
  const { ref, p } = useScrollProgress(!reduce);
  const prog = reduce ? 0.6 : p;
  const ph = reduce ? 3 : phase(prog);
  const k = Math.min(1, prog / 0.42) * (N + 8);
  const cost = !reduce && ph === 5;

  const live = useMemo(() => ROSTER.map((_, c) => {
    let fixed = 0;
    GRID_CELLS.forEach((row, r) => { if (RANK[`${r}-${c}`] < k - 8 && row[c][0]) fixed += 1; });
    return fixed;
  }), [k]);

  const grid = (useCost, static_) => (
    <div className="sg-cells" role="img" aria-label={useCost ? 'Cost of every run, darker is more expensive' : 'Which harness fixed which bug'}>
      {GRID_CELLS.map((row, r) => row.map(([ok, usd], c) => {
        const i = RANK[`${r}-${c}`];
        let cls = 'is-wait';
        if (static_ || i < k - 8) cls = ok ? 'is-ok' : 'is-bad';
        else if (i < k) cls = 'is-run';
        const dim = !useCost && !static_ && ((ph === 3 && !unanimous(r)) || (ph === 4 && c !== AIDER));
        return (
          <i
            key={`${r}-${c}`}
            className={`sg-cell ${useCost ? 'is-cost' : cls}${dim ? ' is-dim' : ''}`}
            style={useCost ? { '--a': shade(usd) } : undefined}
          />
        );
      }))}
    </div>
  );

  const head = (
    <div className="sg-head">
      {ROSTER.map((h) => (
        <Link key={h.id} to={harnessHref(h)} className="sg-who" aria-label={`${h.label} profile`}>
          <Critter className="sg-critter" outfit={h.outfit} />
          <span>{h.short}</span>
        </Link>
      ))}
    </div>
  );

  const foot = (useCost, static_) => (
    <div className="sg-foot">
      {ROSTER.map((h, c) => (
        <span key={h.id} className={c === AIDER && ph === 4 ? 'is-hot' : ''}>
          <Stack at={useCost ? 1 : 0} items={[`${static_ ? h.solved : live[c]}/50`, `${cents(h.usd)}`]} />
        </span>
      ))}
    </div>
  );

  if (reduce) {
    return (
      <div className="sg-static">
        <figure className="sg-frame">{head}{grid(false, true)}{foot(false, true)}<figcaption>{CAPS[3]}</figcaption></figure>
        <figure className="sg-frame">{head}{grid(true, true)}{foot(true, true)}<figcaption>{CAPS[5]} Bottom row: cost per fix.</figcaption></figure>
      </div>
    );
  }

  return (
    <section ref={ref} className="sg" aria-label="Fifty bugs, six harnesses">
      <div className="sg-sticky">
        <figure className="sg-frame">
          <div className="sg-top"><span>50 bugs × 6 harnesses</span><Stack at={cost ? 1 : 0} items={['fixed', 'cost per fix']} /></div>
          {head}
          {grid(cost, false)}
          {foot(cost, false)}
          <div className="sg-legend">
            <Stack at={cost ? 1 : 0} items={[
              <><span><i className="sg-sw is-run" />working</span><span><i className="sg-sw is-ok" />fixed</span><span><i className="sg-sw is-bad" />not fixed</span></>,
              <><span><i className="sg-sw is-cost" style={{ '--a': 0.06 }} />0.1¢</span><span><i className="sg-sw is-cost" style={{ '--a': 0.5 }} />1¢</span><span><i className="sg-sw is-cost" style={{ '--a': 1 }} />10¢ and up</span></>,
            ]} />
          </div>
          <figcaption className="sg-cap"><Stack at={ph} items={CAPS} /></figcaption>
        </figure>
      </div>
    </section>
  );
}
