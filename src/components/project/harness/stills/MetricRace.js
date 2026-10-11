import React, { useEffect, useState } from 'react';
import Critter from '../Critter';
import useInView from '../useInView';
import { SWE, SWE_N } from '../swebench';

const METRICS = [
  { key: 'rate', tab: 'Success rate', note: `bugs fixed out of ${SWE_N}. Higher is better.`, fmt: (v) => `${v}%`, high: true },
  { key: 'usd', tab: '$ per fix', note: 'API spend divided by bugs fixed. Lower is better.', fmt: (v) => (v < 0.01 ? `${(v * 100).toFixed(2)}¢` : `${(v * 100).toFixed(1)}¢`) },
  { key: 'tok', tab: 'Tokens per fix', note: 'chunks of text the model read and wrote, per bug fixed. Lower is better.', fmt: (v) => `${Math.round(v / 1000)}k` },
  { key: 'min', tab: 'Minutes per fix', note: 'time on the clock per bug fixed. Lower is better.', fmt: (v) => `${v.toFixed(1)} min` },
];

export default function MetricRace() {
  const { ref, on } = useInView();
  const [m, setM] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!on || !auto) return undefined;
    const t = setTimeout(() => setM((x) => (x + 1) % METRICS.length), 6500);
    return () => clearTimeout(t);
  }, [on, auto, m]);
  const met = METRICS[m];
  const vals = SWE.map((r) => r[met.key]);
  const max = Math.max(...vals);
  const best = met.high ? max : Math.min(...vals);
  const rows = [...SWE].sort((a, b) => (met.high ? b[met.key] - a[met.key] : a[met.key] - b[met.key]));
  return (
    <div ref={ref} className={`hs-card mr${on ? ' is-on' : ''}`}>
      <div className="mr-tabs" role="tablist">
        {METRICS.map((x, i) => (
          <button key={x.key} type="button" role="tab" aria-selected={i === m} className={`mr-tab${i === m ? ' is-on' : ''}`} onClick={() => { setAuto(false); setM(i); }}>
            {x.tab}
          </button>
        ))}
      </div>
      <div className="mr-note">{met.note}</div>
      <div className="mr-rows" style={{ height: SWE.length * 52 }}>
        {SWE.map((r) => {
          const pos = rows.indexOf(r);
          const v = r[met.key];
          return (
            <div key={r.id} className={`mr-row${v === best ? ' is-best' : ''}`} style={{ transform: `translateY(${pos * 52}px)` }}>
              <Critter className="mr-critter" outfit={r.outfit} mood={v === best ? 'happy' : 'open'} />
              <div className="mr-body">
                <div className="mr-line"><span className="mr-name">{r.label}{met.key === 'usd' && r.est ? '*' : ''}</span><span className="mr-val">{met.fmt(v)}</span></div>
                <div className="mr-track"><span className="mr-fill" style={{ width: on ? `${(v / max) * 100}%` : 0 }} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hs-foot">Same model in every costume. {m === 0 && 'Each rate is uncertain by about ±12 points, so only the ends of the list are clearly apart.'}{m === 1 && '*Cursor bills separately; its cost is estimated from its own token logs.'}{m === 2 && 'Includes text re-read from the cache, which is cheap, so more tokens does not always mean more cost.'}{m === 3 && 'Measured only on runs under equal conditions (3 at a time, same CPU and memory).'}</div>
    </div>
  );
}
