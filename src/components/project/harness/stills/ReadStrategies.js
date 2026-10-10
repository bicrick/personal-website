import React from 'react';
import { Transcript } from '../cc';
import { Who } from '../logos';

// Four ways a harness decides what code the model reads.
function Card({ name, who, children }) {
  return (
    <div className="hs-strat">
      <div className="hs-strat-head">
        <span className="hs-strat-name">{name}</span>
        <span className="hs-strat-who">{typeof who === 'string' ? who : <Who ids={who} />}</span>
      </div>
      <div className="hs-strat-body">{children}</div>
    </div>
  );
}

export default function ReadStrategies() {
  return (
    <div className="hs-strats">
      <Card name="everything" who="paste the repo">
        <div className="hs-files">
          {Array.from({ length: 37 }, (_, i) => <span key={i} />)}
        </div>
        <div className="hs-strat-note">37 files, 206k tokens before a word is written</div>
      </Card>
      <Card name="a map" who={['aider']}>
        <pre className="hs-code">{`schema.py
│ class Schema
│   def load(data, ...)
exceptions.py
│ class ValidationError`}</pre>
        <div className="hs-strat-note">signatures only, ranked by importance</div>
      </Card>
      <Card name="search as you go" who={['claude', 'codex', 'gemini']}>
        <div className="cc-mini">
          <Transcript
            lines={[
              { kind: 'call', text: 'Search("ValidationError")' },
              { kind: 'out', text: 'Found 19 files' },
              { kind: 'call', text: 'Read(exceptions.py)' },
            ]}
          />
        </div>
        <div className="hs-strat-note">starts empty, pulls in what it needs</div>
      </Card>
      <Card name="an index" who={['cursor']}>
        <pre className="hs-code">{`"where are errors raised?"
  0.82  schema.py:612
  0.79  fields.py:340
  0.74  validate.py:88`}</pre>
        <div className="hs-strat-note">embedding search over the codebase</div>
      </Card>
    </div>
  );
}
