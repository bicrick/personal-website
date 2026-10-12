import React, { useEffect, useState } from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import useReducedMotion from '../../useReducedMotion';
import { CACHE_RACE } from '../swebench';

// One real bug, both harnesses fixed it. Each row is one time the harness
// sent the model its window. Grey was already sent last time (cached, a tenth
// of the price). Orange is new and paid in full.
const MAX = Math.max(...CACHE_RACE.aider.map((x) => x[0]));
const SIDES = [
  { id: 'opencode', name: 'OpenCode', outfit: 'opencode', how: 'adds to the end', calls: CACHE_RACE.opencode },
  { id: 'aider', name: 'Aider', outfit: 'aider', how: 'rebuilds every turn', calls: CACHE_RACE.aider },
];
const ROWS = 8;

export default function CacheRace() {
  const { ref, on } = useInView();
  const reduce = useReducedMotion();
  const [t, setT] = useState(reduce ? ROWS : 0);
  useEffect(() => {
    if (!on || reduce) return undefined;
    const d = setTimeout(() => setT((x) => (x >= ROWS + 3 ? 0 : x + 1)), t === 0 ? 900 : 750);
    return () => clearTimeout(d);
  }, [on, t, reduce]);
  return (
    <Fig innerRef={ref} className="cr" title="every message, one bug" aside="grey reused · orange new" caption="Same bug, both fixed it. Bar length is how much each message sent. Real logs.">
      <div className="cr-sides">
        {SIDES.map((s) => {
          const shown = s.calls.slice(0, Math.min(t, s.calls.length));
          const spent = shown.reduce((n, c) => n + c[2], 0);
          return (
            <div key={s.id} className="cr-side">
              <div className="cr-who"><Critter className="cr-critter" outfit={s.outfit} /><span>{s.name}<small>{s.how}</small></span></div>
              <div className="cr-rows">
                {Array.from({ length: ROWS }, (_, n) => {
                  const c = s.calls[n];
                  const vis = c && n < t;
                  return (
                    <div key={n} className={`cr-row${vis ? ' is-on' : ''}`}>
                      {c && <>
                        <i className="cr-cached" style={{ width: `${(c[1] / MAX) * 100}%` }} />
                        <i className="cr-new" style={{ width: `${Math.max(((c[0] - c[1]) / MAX) * 100, 0.6)}%` }} />
                      </>}
                    </div>
                  );
                })}
              </div>
              <div className="cr-bill"><span>spent</span><b>{(spent * 100).toFixed(2)}¢</b></div>
            </div>
          );
        })}
      </div>
    </Fig>
  );
}
