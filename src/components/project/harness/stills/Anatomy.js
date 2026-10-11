import React, { useEffect, useState } from 'react';
import { CritterBody } from '../Critter';
import useInView from '../useInView';

// The model sits in the middle and only sees the ring: its context window.
// The harness fills the ring, piece by piece. Illustrative proportions.
const PARTS = [
  { tone: 'c-sys', name: 'Instructions', say: 'how to behave, written by the harness', share: 0.1 },
  { tone: 'c-tool', name: 'Tools', say: 'what it can do: search, open files, run tests', share: 0.14 },
  { tone: 'c-msg', name: 'Your code', say: 'the files the harness chooses to show it', share: 0.36 },
  { tone: 'c-skill', name: 'Memory', say: 'everything so far, trimmed when the ring fills up', share: 0.24 },
];
const R = 74;
const C = 2 * Math.PI * R;

export default function Anatomy() {
  const { ref, on } = useInView();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    const t = setTimeout(() => setStep((s) => (s + 1) % (PARTS.length + 2)), step === PARTS.length + 1 ? 2600 : 1300);
    return () => clearTimeout(t);
  }, [on, step]);
  const trimmed = step === PARTS.length + 1;
  let start = 0;
  return (
    <div ref={ref} className="hs-card an">
      <div className="an-stage">
        <svg viewBox="0 0 200 200" className="an-ring" aria-hidden="true">
          <circle cx="100" cy="100" r={R} className="an-track" />
          {PARTS.map((p, i) => {
            const share = trimmed && p.tone === 'c-skill' ? 0.08 : p.share;
            const len = (i < step ? share : 0) * C;
            const el = (
              <circle
                key={p.tone}
                cx="100" cy="100" r={R}
                className={`an-seg ${p.tone}`}
                strokeDasharray={`${Math.max(len - 2, 0)} ${C}`}
                strokeDashoffset={-start * C}
                transform="rotate(-90 100 100)"
              />
            );
            start += share;
            return el;
          })}
          <g transform="translate(73 80) scale(3)"><CritterBody mood={trimmed ? 'tired' : 'open'} /></g>
        </svg>
        <div className="an-model">the model</div>
      </div>
      <div className="an-parts">
        {PARTS.map((p, i) => (
          <div key={p.tone} className={`an-part${i < step ? ' is-on' : ''}${i === step - 1 ? ' is-now' : ''}`}>
            <i className={`an-sw ${p.tone}`} />
            <div><b>{p.name}</b><span>{p.say}</span></div>
          </div>
        ))}
      </div>
      <div className="hs-foot">The ring is the context window: all the model sees. Everything in it was put there by the harness. Proportions illustrative.</div>
    </div>
  );
}
