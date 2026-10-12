import React from 'react';
import { Link } from 'react-router-dom';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import { WINDOW_START } from '../swebench';
import { ROSTER, harnessHref } from '../roster';

// How full the window already is before the model reads a line of code:
// instructions plus tool definitions, from each harness's first request.
const MAX = Math.max(...WINDOW_START.map((r) => r.start));
const slug = (id) => ROSTER.find((h) => h.id === id);

export default function StartWindow() {
  const { ref, on } = useInView();
  return (
    <Fig innerRef={ref} className={`sw${on ? ' is-on' : ''}`} title="the window before any code" aside="median tokens" caption="Instructions plus the tool list, resent with every message. Cursor's requests aren't logged.">
      {WINDOW_START.map((r, n) => (
        <Link key={r.id} to={harnessHref(slug(r.id))} className={`tb-row${r.id === 'mini' ? ' is-hot' : ''}`} style={{ '--w': `${(r.start / MAX) * 100}%`, '--d': `${n * 0.1}s` }}>
          <Critter className="tb-critter" outfit={r.outfit} />
          <span className="tb-name">{r.label}<small>{r.tools} {r.tools === 1 ? 'tool' : 'tools'}</small></span>
          <span className="tb-track"><i /></span>
          <b>{(r.start / 1000).toFixed(1)}k</b>
        </Link>
      ))}
    </Fig>
  );
}
