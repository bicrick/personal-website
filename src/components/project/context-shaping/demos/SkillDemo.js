import React from 'react';
import { SKILL } from '../data';
import useDemoAutoplay from './useDemoAutoplay';
import DemoTransport, { DemoNarration } from './DemoTransport';
import './Demo.css';

/** Tour: no skill → inject → walk each of the five steps. */
const TOUR = [
  {
    injected: false,
    active: -1,
    say: `No procedure in context. Still ${SKILL.noSkill}% pass, but a bit more spend ($${SKILL.costWithout.toFixed(4)}).`,
  },
  {
    injected: true,
    active: -1,
    say: 'Inject a five-step refactor skill into system context — same accuracy target, cheaper path.',
  },
  {
    injected: true,
    active: 0,
    say: 'Step 1: find every reference first — don’t rename blind.',
  },
  {
    injected: true,
    active: 1,
    say: 'Step 2: change each definition and call site together.',
  },
  {
    injected: true,
    active: 2,
    say: 'Step 3: run the tests before claiming done.',
  },
  {
    injected: true,
    active: 3,
    say: 'Step 4: search again for leftovers the first pass missed.',
  },
  {
    injected: true,
    active: 4,
    say: `Step 5: finish only when the grader is clean. Same ${SKILL.withSkill}% pass, $${SKILL.costWithout.toFixed(4)}→$${SKILL.costWith.toFixed(4)}.`,
  },
];

export default function SkillDemo() {
  const {
    rootRef,
    idx,
    playing,
    reduce,
    pause,
    play,
    replay,
    stepNext,
    stepPrev,
    goTo,
  } = useDemoAutoplay({
    length: TOUR.length,
    stepMs: 1400,
    holdLastMs: 2800,
    loop: true,
  });

  const step = TOUR[idx];
  const injected = step.injected;

  return (
    <figure className="cs-demo" ref={rootRef}>
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Procedural context · refactor skill</p>
          <span className="cs-demo-badge">five-step skill from the study</span>
        </div>

        <DemoNarration>{step.say}</DemoNarration>

        <div className="cs-demo-controls">
          <button
            type="button"
            className={injected ? 'is-on' : ''}
            onClick={() => goTo(1)}
          >
            inject skill
          </button>
          <button
            type="button"
            className={!injected ? 'is-on' : ''}
            onClick={() => goTo(0)}
          >
            no skill
          </button>
        </div>

        <DemoTransport
          playing={playing}
          reduce={reduce}
          onReplay={replay}
          onPause={pause}
          onPlay={play}
          onPrev={stepPrev}
          onNext={stepNext}
        />

        <div className="cs-demo-stats">
          <span className="cs-stat is-accent">
            pass <strong>{injected ? SKILL.withSkill : SKILL.noSkill}%</strong>
          </span>
          <span className="cs-stat">
            cost/solve{' '}
            <strong>
              ${injected ? SKILL.costWith.toFixed(4) : SKILL.costWithout.toFixed(4)}
            </strong>
          </span>
          <span className="cs-stat">
            AGENTS.md <strong>{SKILL.agentsMd}%</strong>
          </span>
        </div>

        <div className={`cs-skill${injected ? ' is-injected' : ' is-empty'}`}>
          <p className="cs-skill-title">refactor.skill</p>
          <ol>
            {SKILL.steps.map((text, i) => (
              <li
                key={text}
                className={injected && step.active === i ? 'is-on' : undefined}
              >
                {text}
              </li>
            ))}
          </ol>
          <div className={`cs-skill-context${injected ? ' is-in' : ''}`}>
            {injected
              ? `in system context · same ${SKILL.withSkill}% pass, cheaper ($${SKILL.costWithout.toFixed(4)} → $${SKILL.costWith.toFixed(4)})`
              : `not injected · ${SKILL.noSkill}% pass at $${SKILL.costWithout.toFixed(4)}`}
          </div>
        </div>
      </div>
      <figcaption>
        A cost win, not an accuracy win. Pass rates and costs are from the study.
      </figcaption>
    </figure>
  );
}
