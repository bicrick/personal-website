import React, { useState } from 'react';
import { SKILL } from '../data';
import './Demo.css';

export default function SkillDemo() {
  const [injected, setInjected] = useState(true);
  const [active, setActive] = useState(0);

  return (
    <figure className="cs-demo">
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Procedural context · refactor skill</p>
          <span className="cs-demo-badge">five-step skill from the study</span>
        </div>

        <div className="cs-demo-controls">
          <button
            type="button"
            className={injected ? 'is-on' : ''}
            onClick={() => setInjected(true)}
          >
            inject skill
          </button>
          <button
            type="button"
            className={!injected ? 'is-on' : ''}
            onClick={() => setInjected(false)}
          >
            no skill
          </button>
        </div>

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

        <div className={`cs-skill${injected ? '' : ''}`}>
          <p className="cs-skill-title">refactor.skill</p>
          <ol>
            {SKILL.steps.map((step, i) => (
              <li
                key={step}
                className={injected && active === i ? 'is-on' : undefined}
                onMouseEnter={() => setActive(i)}
              >
                {step}
              </li>
            ))}
          </ol>
          <div className={`cs-skill-context${injected ? ' is-in' : ''}`}>
            {injected
              ? 'in system context · same 93% pass, cheaper ($0.0085 → $0.0080)'
              : 'not injected · 93% pass at $0.0085'}
          </div>
        </div>
      </div>
      <figcaption>
        A cost win, not an accuracy win. Pass rates and costs are from the study.
      </figcaption>
    </figure>
  );
}
