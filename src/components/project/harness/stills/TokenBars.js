import React from 'react';
import { Link } from 'react-router-dom';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import { ROSTER, harnessHref } from '../roster';

// Tokens per fix, one row per harness, mini-swe-agent picked out.
const rows = [...ROSTER].sort((a, b) => a.tok - b.tok);
const MAX = Math.max(...rows.map((r) => r.tok));

export default function TokenBars() {
  const { ref, on } = useInView();
  return (
    <Fig innerRef={ref} className={`tb${on ? ' is-on' : ''}`} title="words read per fix" aside="thousands of tokens" caption="mini-swe-agent reads the least to land almost the same fixes.">
      {rows.map((r, n) => (
        <Link key={r.id} to={harnessHref(r)} className={`tb-row${r.id === 'mini' ? ' is-hot' : ''}`} style={{ '--w': `${(r.tok / MAX) * 100}%`, '--d': `${n * 0.08}s` }}>
          <Critter className="tb-critter" outfit={r.outfit} />
          <span className="tb-name">{r.label}<small>{r.solved}/50 fixed</small></span>
          <span className="tb-track"><i /></span>
          <b>{Math.round(r.tok / 1000)}k</b>
        </Link>
      ))}
    </Fig>
  );
}
