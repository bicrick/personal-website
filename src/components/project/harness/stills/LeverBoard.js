import React, { useEffect, useState } from 'react';
import Critter from '../Critter';
import Logo, { HARNESSES } from '../logos';
import useInView from '../useInView';
import useReducedMotion from '../../useReducedMotion';
import { LEVERS, HARNESS_PICKS, MY_PICKS, BASELINE, EXPERIMENTS } from '../levers';

const HARNESS_TABS = ['claude', 'cursor', 'aider', 'codex', 'gemini'];

// Cycle through tabs while on screen, until the reader picks one.
function useCycle(count, ms) {
  const { ref, on } = useInView();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!on || held || reduce) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % count), ms);
    return () => clearInterval(t);
  }, [on, held, reduce, count, ms]);
  const pick = (v) => {
    setHeld(true);
    setI(v);
  };
  return { ref, i, pick };
}

function Row({ lever, picked, dim, tag, children }) {
  return (
    <div className={`lb-row${dim ? ' is-dim' : ''}`}>
      <div className="lb-row-head">
        <span className="hs-lever-n">{lever.n}</span>
        <span className="lb-row-name">{lever.name}</span>
        {tag && <span className="lb-tag">{tag}</span>}
      </div>
      <div className="lb-opts">
        {children || lever.options.map((o) => (
          <span key={o.id} className={`lb-opt${picked.includes(o.id) ? ' is-on' : ''}`}>{o.label}</span>
        ))}
      </div>
    </div>
  );
}

// Each lever is a choice between options. `harness` mode lets you flip
// between real harnesses; `mine` shows my picks; `experiment` shows what I
// tried on one lever while the others stayed at the baseline.
export default function LeverBoard({ mode = 'harness' }) {
  const tabs = mode === 'harness' ? HARNESS_TABS : mode === 'experiment' ? [0, 1, 2, 3] : [];
  const { ref, i, pick } = useCycle(tabs.length || 1, mode === 'experiment' ? 4200 : 3200);

  let picks = MY_PICKS;
  let note = mode === 'mine'
    ? 'On tasks this size the window never filled, so forgetting nothing won. If yours has to shrink, clear old tool output before you summarize.'
    : null;
  if (mode === 'harness') {
    picks = HARNESS_PICKS[tabs[i]].picks;
    note = HARNESS_PICKS[tabs[i]].note;
  }
  if (mode === 'experiment') {
    picks = BASELINE;
    note = EXPERIMENTS[i].note;
  }

  return (
    <div ref={ref} className={`lb lb-${mode}`}>
      {mode === 'harness' && (
        <div className="lb-tabs" role="tablist" aria-label="harness">
          {tabs.map((id, k) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={k === i}
              className={`lb-tab${k === i ? ' is-on' : ''}`}
              onClick={() => pick(k)}
            >
              <Logo id={id} />
              {HARNESSES[id].name}
            </button>
          ))}
        </div>
      )}
      {mode === 'experiment' && (
        <div className="lb-tabs" role="tablist" aria-label="experiment">
          {LEVERS.map((l, k) => (
            <button
              key={l.n}
              type="button"
              role="tab"
              aria-selected={k === i}
              className={`lb-tab${k === i ? ' is-on' : ''}`}
              onClick={() => pick(k)}
            >
              <span className="hs-lever-n">{l.n}</span>
              {l.name}
            </button>
          ))}
        </div>
      )}
      {mode === 'mine' && (
        <div className="lb-mine-head">
          <Critter className="lb-mine-critter" mood="happy" outfit="harness" hop />
          <span>how I’d set them</span>
        </div>
      )}

      <div className="lb-rows">
        {LEVERS.map((lever, k) => {
          if (mode === 'experiment' && k === i) {
            return (
              <Row key={lever.n} lever={lever} tag="varied">
                {EXPERIMENTS[k].tried.map((t) => (
                  <span key={t} className="lb-opt is-tried">{t}</span>
                ))}
              </Row>
            );
          }
          return (
            <Row
              key={lever.n}
              lever={lever}
              picked={picks[k]}
              dim={mode === 'experiment'}
              tag={mode === 'experiment' ? 'held fixed' : null}
            />
          );
        })}
      </div>

      {note && <div className="lb-note" key={`${mode}-${i}`}>{note}</div>}
    </div>
  );
}
