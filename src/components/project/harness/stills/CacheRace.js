import React, { useEffect, useState } from 'react';
import useInView from '../useInView';
import Critter from '../Critter';
import { CACHE_RACE } from '../swebench';

const MAX = 94000;
const STEP_MS = 1100;

function Lane({ outfit, name, calls, shown }) {
  const spent = calls.slice(0, shown).reduce((s, c) => s + c[2], 0);
  return (
    <div className="cr-lane">
      <div className="cr-lane-head">
        <span className="cr-name"><Critter className="cr-critter" outfit={outfit} />{name}</span>
        <span className="cr-cost">${spent.toFixed(spent < 0.01 ? 4 : 3)}</span>
      </div>
      {calls.map(([prompt, cached], i) => (
        <div key={i} className={`cr-call${i < shown ? ' is-on' : ''}`}>
          <span className="cr-bar" style={{ width: `${Math.max((prompt / MAX) * 100, 1.5)}%` }}>
            <span className="cr-hit" style={{ width: `${(cached / prompt) * 100}%` }} />
          </span>
          <span className="cr-k">{Math.round(prompt / 1000)}k</span>
        </div>
      ))}
    </div>
  );
}

// Each bar is one model call: its prompt size, split into what the cache
// served (grey) and what was paid at full price (orange).
export default function CacheRace() {
  const { ref, on } = useInView();
  const total = Math.max(CACHE_RACE.aider.length, CACHE_RACE.opencode.length);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    if (shown >= total) return undefined;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 300 : STEP_MS);
    return () => clearTimeout(t);
  }, [on, shown, total]);
  return (
    <div ref={ref} className="hs-card cr">
      <div className="cr-title">One bug, every trip to the model</div>
      <Lane outfit="aider" name="Aider" calls={CACHE_RACE.aider} shown={shown} />
      <Lane outfit="opencode" name="OpenCode" calls={CACHE_RACE.opencode} shown={shown} />
      <div className="cr-key">
        <span><i className="cr-sw is-hit" />from cache</span>
        <span><i className="cr-sw" />paid in full</span>
      </div>
      <div className="hs-foot">Real logs from one bug both fixed. Each bar is one trip to the model. The light part came from the cache (cheap); the darker part was paid in full.</div>
    </div>
  );
}
