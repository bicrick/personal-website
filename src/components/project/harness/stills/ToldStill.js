import React from 'react';

// Notes loaded before the model starts.
export default function ToldStill() {
  return (
    <div className="hs-files-row">
      <div className="hs-doc">
        <div className="hs-doc-name">CLAUDE.md · AGENTS.md</div>
        <pre className="hs-code">{`# Conventions
- use pytest
- type hints everywhere
- keep imports sorted`}</pre>
        <div className="hs-strat-note">house rules, always loaded</div>
      </div>
      <div className="hs-doc">
        <div className="hs-doc-name">skills/refactor/SKILL.md</div>
        <pre className="hs-code">{`1. find every reference first
2. change the definition, then each one
3. run the tests
4. search again: count must be 0
5. only then finish`}</pre>
        <div className="hs-strat-note">a procedure, loaded when relevant</div>
      </div>
    </div>
  );
}
