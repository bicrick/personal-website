import React from 'react';
import Critter from '../Critter';
import Pinned from '../Pinned';
import useReducedMotion from '../../useReducedMotion';
import useScrollProgress from '../useScrollProgress';
import { ROSTER } from '../roster';

// The five harnesses arrive one at a time as you scroll. Every row is
// reserved from the start, so nothing moves when one appears.
const TICKS = ROSTER.map((h, n) => ({ at: n / ROSTER.length, label: h.short }));

function Row({ h, on }) {
  return (
    <div className={`mh-row${on ? ' is-on' : ''}`}>
      <Critter className="mh-critter" outfit={h.outfit} hop={on} />
      <div className="mh-text">
        <div className="mh-name"><span>{h.label}</span>
          <a className="hx-visit" href={h.site} target="_blank" rel="noopener noreferrer" tabIndex={on ? undefined : -1}>visit ↗</a>
        </div>
        <p>{h.line}</p>
      </div>
    </div>
  );
}

export default function MeetHarnesses() {
  const reduce = useReducedMotion();
  const { ref, p } = useScrollProgress(!reduce);
  const shown = reduce ? ROSTER.length : Math.min(ROSTER.length, Math.floor(p * ROSTER.length * 1.05) + 1);
  if (reduce) {
    return <div id="harnesses" className="mh-static">{ROSTER.map((h) => <Row key={h.id} h={h} on />)}</div>;
  }
  return (
    <Pinned sref={ref} id="harnesses" label="Meet the harnesses" title="meet the harnesses" aside={<span>{shown} of {ROSTER.length}</span>} p={p} ticks={TICKS} stage={shown - 1} height={360} className="mh">
      <div className="mh-rows">
        {ROSTER.map((h, n) => <Row key={h.id} h={h} on={n < shown} />)}
      </div>
    </Pinned>
  );
}
