import React from 'react';
import Critter from '../Critter';
import Stack from '../Stack';
import Pinned from '../Pinned';
import useReducedMotion from '../../useReducedMotion';
import useScrollProgress from '../useScrollProgress';
import { WHY } from '../swebench';
import { ROSTER } from '../roster';
import { byOrder } from '../order';

// One harness at a time: how full its window is before any code (instructions
// + tool list), how big it gets, and the habits that multiply it.
const SCALE = 30000;
const ITEMS = byOrder(WHY).map((w) => ({ ...w, ...ROSTER.find((h) => h.id === w.id) }));
const TICKS = ITEMS.map((h, n) => ({ at: n / ITEMS.length, label: h.short }));
const k = (n) => `${(n / 1000).toFixed(1)}k`;

const SAY = {
  claude_code: 'Its 20 tools and instructions fill 24k tokens before it reads a line of code. It sends that opening again with every message.',
  cursor: 'Its opening is 13k: instructions, 6k of tool definitions, and short lists of built-in skills and helpers. It talks to its own servers, so we can\u2019t see each message, only the totals: about 131k tokens in per bug, 91% of it reused from the cache.',
  opencode: 'Half the opening of Claude Code, and a similar number of messages. Most of what it sends is still that opening, repeated.',
  swe_agent: 'A tiny opening, but it checks its work often: about twice as many messages per bug as the others. That is where its tokens go.',
  mini: 'One tool and a short prompt. Its window stays the smallest of the five, so it reads the fewest tokens per fix.',
};

function Slide({ h }) {
  return (
    <div className="wt-slide">
      <div className="wt-who"><Critter className="wt-critter" outfit={h.outfit} /><span>{h.label}<small>{h.measured ? 'messages not logged' : `${h.tools} ${h.tools === 1 ? 'tool' : 'tools'}`}</small></span></div>
      <div className="wt-lab"><span>window before any code</span><b>{k(h.start)}</b></div>
      <div className="cx-bar wt-bar">
        <span className="cx-seg is-sys" style={{ width: `${(h.start / SCALE) * 100}%` }} />
        {!h.measured && <span className="cx-seg is-convo" style={{ width: `${((h.peak - h.start) / SCALE) * 100}%` }} />}
      </div>
      <div className="wt-key"><span><i className="cx-sw is-sys" />instructions + tool list</span>{h.measured ? <span>measured in a matching test run</span> : <span><i className="cx-sw is-convo" />code and results, at its biggest</span>}</div>
      <dl className="wt-stats">
        <div><dt>messages per bug</dt><dd>{h.measured ? 'not logged' : h.calls}</dd></div>
        <div><dt>biggest window</dt><dd>{h.measured ? 'not logged' : k(h.peak)}</dd></div>
        <div><dt>share that is the opening, resent</dt><dd>{h.measured ? 'not logged' : `${h.resent}%`}</dd></div>
        <div><dt>tokens per fix</dt><dd>{Math.round(h.tok / 1000)}k</dd></div>
      </dl>
      <p className="wt-say">{SAY[h.id]}</p>
    </div>
  );
}

export default function WhyTokens() {
  const reduce = useReducedMotion();
  const { ref, p } = useScrollProgress(!reduce);
  if (reduce) return <div className="wt-static">{ITEMS.map((h) => <figure key={h.id} className="sg-frame wt-frame"><Slide h={h} /></figure>)}</div>;
  const at = Math.min(ITEMS.length - 1, Math.floor(p * ITEMS.length));
  return (
    <Pinned sref={ref} id="why" label="Why tokens differ" title="why tokens differ" aside={<span>{at + 1} of {ITEMS.length}</span>} p={p} ticks={TICKS} stage={at} height={420} className="wt">
      <Stack className="wt-stack" at={at} items={ITEMS.map((h) => <Slide key={h.id} h={h} />)} />
    </Pinned>
  );
}
