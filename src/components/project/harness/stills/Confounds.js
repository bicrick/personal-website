import React, { useEffect, useState } from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import { SWE, SWE_VARIANTS, SWE_N } from '../swebench';

// Success rate as shipped vs with two settings fixed. Dot = rate, band = 95% range.
const LO = 40;
const HI = 95;
const x = (v) => `${((v - LO) / (HI - LO)) * 100}%`;
const FIX = {
  opencode: { v: SWE_VARIANTS.opencode_auto, why: 'auto-approve' },
  cursor: { v: SWE_VARIANTS.cursor_nothink, why: 'thinking off' },
};

export default function Confounds() {
  const { ref, on } = useInView();
  const [fixed, setFixed] = useState(false);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!on || !auto) return undefined;
    const t = setTimeout(() => setFixed((f) => !f), fixed ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [on, auto, fixed]);
  const rows = SWE.map((r) => {
    const f = FIX[r.id];
    const cur = fixed && f ? f.v : r;
    return { ...r, cur, f };
  });
  const top = rows.filter((r) => r.id !== 'aider').map((r) => (fixed && r.f ? r.f.v.rate : r.rate));
  return (
    <Fig
      innerRef={ref}
      className={`cf2${on ? ' is-on' : ''}${fixed ? ' is-fixed' : ''}`}
      title="bugs fixed"
      aside={`out of ${SWE_N}`}
      caption="Dot: share of bugs fixed. Line: the range the true rate plausibly sits in (95%). Shaded: the top five once fixed. Two settings, not the harness design, made most of the first-glance spread."
    >
      <div className="mr-tabs cf2-tabs" role="tablist">
        {['as shipped', 'two settings fixed'].map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={fixed === !!i} className={`mr-tab${fixed === !!i ? ' is-on' : ''}`} onClick={() => { setAuto(false); setFixed(!!i); }}>
            {t}
          </button>
        ))}
      </div>
      <div className="cf2-plot">
        <span className="cf2-zone" style={{ left: x(Math.min(...top)), width: `calc(${x(Math.max(...top))} - ${x(Math.min(...top))})` }} />
        {[50, 60, 70, 80, 90].map((t) => <span key={t} className="cf2-tick" style={{ left: x(t) }}><i>{t}%</i></span>)}
        {rows.map((r) => (
          <div key={r.id} className={`cf2-row${r.f ? ' is-var' : ''}`}>
            <div className="cf2-who">
              <Critter className="cf2-critter" outfit={r.outfit} />
              <span>{r.label}</span>
              {r.f && <em className="cf2-why">{r.f.why} {r.f.v.rate > r.rate ? '+' : '−'}{Math.abs(r.f.v.solved - r.solved)}</em>}
            </div>
            <div className="cf2-line">
              <span className="cf2-band" style={{ left: x(r.cur.ci[0]), width: `calc(${x(r.cur.ci[1])} - ${x(r.cur.ci[0])})` }} />
              {r.f && <span className="cf2-ghost" style={{ left: x(r.rate) }} />}
              <span className="cf2-dot" style={{ left: x(r.cur.rate) }}><b>{r.cur.rate}%</b></span>
            </div>
          </div>
        ))}
      </div>
    </Fig>
  );
}
