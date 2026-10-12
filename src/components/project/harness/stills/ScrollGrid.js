import React, { useMemo } from 'react';
import Critter from '../Critter';
import Stack from '../Stack';
import Pinned from '../Pinned';
import useReducedMotion from '../../useReducedMotion';
import useScrollProgress from '../useScrollProgress';
import { GRID_COLS, GRID_CELLS as RAW_CELLS, GRID_ORDER as RAW_ORDER, GRID_NONE, GRID_ALL } from '../grid';
import { ROSTER } from '../roster';

// 50 bugs x 5 harnesses. Scroll replays the runs in the order they finished
// (yellow = working, then green or red), then pins the rows every harness
// agreed on, then the few rows where they split.
// Columns follow the shared ORDER (via ROSTER), not the data file's order.
const PERM = ROSTER.map((h) => GRID_COLS.indexOf(h.id));
const GRID_CELLS = RAW_CELLS.map((row) => PERM.map((i) => row[i]));
const GRID_ORDER = RAW_ORDER.map(([r, c]) => [r, PERM.indexOf(c)]);
const N = GRID_ORDER.length;
const W = ROSTER.length;
const RANK = {};
GRID_ORDER.forEach(([r, c], i) => { RANK[`${r}-${c}`] = i; });
const fixedIn = (r) => GRID_CELLS[r].reduce((n, x) => n + x[0], 0);
const unanimous = (r) => fixedIn(r) === 0 || fixedIn(r) === W;
const SPLIT = GRID_CELLS.filter((_, r) => !unanimous(r)).length;
const splitFixed = ROSTER.map((_, c) => GRID_CELLS.filter((row, r) => !unanimous(r) && row[c][0]).length);
const loners = GRID_CELLS.map((row, r) => (fixedIn(r) === 1 ? ROSTER[row.findIndex((x) => x[0])].label : null)).filter(Boolean);
const best = ROSTER[splitFixed.indexOf(Math.max(...splitFixed))];

const CAPS = [
  'Each row is a bug. Each column is a harness. Scroll to run them.',
  'Yellow is working. Green is fixed. Red is not.',
  'Same model, and nearly the same picture in every column.',
  `Most rows are one color all the way across: ${GRID_ALL} bugs every harness fixed, ${GRID_NONE} that none did. The bug decides more than the harness.`,
  `Only ${SPLIT} bugs split them, and it is a mixed bag. ${best.label} got ${Math.max(...splitFixed)} of them, which is its whole lead. The two bugs only one harness fixed went to ${loners.join(' and ')}.`,
];
const TICKS = [{ at: 0, label: 'replay' }, { at: 0.5, label: 'agreed' }, { at: 0.74, label: 'split' }];
const STAGE = [0, 0, 0, 1, 2];
const phase = (p) => (p < 0.04 ? 0 : p < 0.26 ? 1 : p < 0.5 ? 2 : p < 0.74 ? 3 : 4);

export default function ScrollGrid() {
  const reduce = useReducedMotion();
  const { ref, p } = useScrollProgress(!reduce);
  const ph = reduce ? 4 : phase(p);
  const k = reduce ? N + 8 : Math.min(1, p / 0.46) * (N + 8);

  const live = useMemo(() => ROSTER.map((_, c) => {
    let fixed = 0;
    GRID_CELLS.forEach((row, r) => { if (RANK[`${r}-${c}`] < k - 8 && row[c][0]) fixed += 1; });
    return fixed;
  }), [k]);

  const body = (stage) => (
    <>
      <div className="sg-head">
        {ROSTER.map((h) => (
          <span key={h.id} className="sg-who"><Critter className="sg-critter" outfit={h.outfit} /><span>{h.short}</span></span>
        ))}
      </div>
      <div className="sg-cells" role="img" aria-label="Which harness fixed which bug">
        {GRID_CELLS.map((row, r) => row.map(([ok], c) => {
          const i = RANK[`${r}-${c}`];
          let cls = 'is-wait';
          if (i < k - 8) cls = ok ? 'is-ok' : 'is-bad';
          else if (i < k) cls = 'is-run';
          const dim = (stage === 3 && !unanimous(r)) || (stage === 4 && unanimous(r));
          return <i key={`${r}-${c}`} className={`sg-cell ${cls}${dim ? ' is-dim' : ''}`} />;
        }))}
      </div>
      <div className="sg-foot">
        {ROSTER.map((h, c) => (
          <span key={h.id}><Stack at={stage === 4 ? 1 : 0} items={[`${live[c]}/50`, `${splitFixed[c]}/${SPLIT}`]} /></span>
        ))}
      </div>
      <div className="sg-legend">
        <div className="hs-stack-i is-on"><span><i className="sg-sw is-run" />working</span><span><i className="sg-sw is-ok" />fixed</span><span><i className="sg-sw is-bad" />not fixed</span></div>
      </div>
    </>
  );

  if (reduce) {
    return (
      <div className="sg-static">
        <figure className="sg-frame">{body(3)}<figcaption>{CAPS[3]}</figcaption></figure>
        <figure className="sg-frame">{body(4)}<figcaption>{CAPS[4]} Bottom row: split bugs fixed.</figcaption></figure>
      </div>
    );
  }

  return (
    <Pinned
      sref={ref}
      id="test"
      label="Fifty bugs, five harnesses"
      title="50 bugs × 5 harnesses"
      aside={<Stack at={ph === 4 ? 1 : 0} items={['fixed', 'split bugs fixed']} />}
      p={p}
      ticks={TICKS}
      stage={STAGE[ph]}
      height={560}
    >
      {body(ph)}
      <figcaption className="sg-cap"><Stack at={ph} items={CAPS} /></figcaption>
    </Pinned>
  );
}
