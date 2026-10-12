import React, { useEffect, useState } from 'react';
import Critter from '../Critter';
import useInView from '../useInView';
import Fig from '../Fig';
import Stack from '../Stack';
import { SWE_FAIR as SWE, SWE_N } from '../swebench';

const METRICS = [
  { key: 'rate', tab: 'Success rate', note: `bugs fixed out of ${SWE_N}. Higher is better.`, fmt: (v) => `${v}%`, high: true },
  { key: 'usd', tab: '$ per fix', note: 'API spend divided by bugs fixed. Lower is better.', fmt: (v) => (v < 0.01 ? `${(v * 100).toFixed(2)}¢` : `${(v * 100).toFixed(1)}¢`) },
  { key: 'tok', tab: 'Tokens per fix', note: 'chunks of text the model read and wrote, per bug fixed. Lower is better.', fmt: (v) => `${Math.round(v / 1000)}k` },
  { key: 'min', tab: 'Minutes per fix', note: 'time on the clock per bug fixed. Lower is better.', fmt: (v) => `${v.toFixed(1)} min` },
];

const CAPS = [
  'Each rate is uncertain by about ±12 points. The top five are within 8 points: a tie.',
  'Cursor bills separately, so its cost is estimated from its own token logs.',
  'Includes text re-read from the cache, which is cheap, so more tokens is not always more cost.',
  'Every run used the same setup: three at a time, 2 CPU and 4 GB each.',
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
    <Fig innerRef={ref} className={`mr${on ? ' is-on' : ''}`} title="per bug fixed" aside="same settings" caption={CAPS} captionAt={m}>
      <div className="mr-tabs" role="tablist">
        {METRICS.map((x, i) => (
          <button key={x.key} type="button" role="tab" aria-selected={i === m} className={`mr-tab${i === m ? ' is-on' : ''}`} onClick={() => { setAuto(false); setM(i); }}>
            {x.tab}
          </button>
        ))}
      </div>
      <Stack className="mr-note" at={m} items={METRICS.map((x) => x.note)} />
      <div className="mr-rows" style={{ height: SWE.length * 52 }}>
        {SWE.map((r) => {
          const pos = rows.indexOf(r);
          const v = r[met.key];
          return (
            <div key={r.id} className={`mr-row${v === best ? ' is-best' : ''}`} style={{ transform: `translateY(${pos * 52}px)` }}>
              <Critter className="mr-critter" outfit={r.outfit} mood={v === best ? 'happy' : 'open'} />
              <div className="mr-body">
                <div className="mr-line"><span className="mr-name">{r.label}</span><span className="mr-val">{met.fmt(v)}</span></div>
                <div className="mr-track"><span className="mr-fill" style={{ width: on ? `${(v / max) * 100}%` : 0 }} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </Fig>
  );
}
