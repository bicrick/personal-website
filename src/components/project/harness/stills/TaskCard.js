import React from 'react';
import { CcWindow, Transcript } from '../cc';

// One of the 25 tasks, and the three checks every run had to pass.
export default function TaskCard() {
  return (
    <div className="hs-task">
      <CcWindow title="marshmallow · hardest task" meta="468 lines · 19 files">
        <Transcript
          lines={[
            { kind: 'user', text: 'Rename ValidationError to SchemaValidationError. Update every reference. No alias.' },
          ]}
        />
      </CcWindow>
      <div className="hs-checks">
        <div className="hs-check"><span className="hs-ok">✓</span> the repo's tests pass</div>
        <div className="hs-check"><span className="hs-ok">✓</span> zero references to the old name</div>
        <div className="hs-check"><span className="hs-ok">✓</span> a task-specific import check</div>
      </div>
      <div className="hs-miss">
        <div className="hs-miss-head">a missed caller</div>
        <pre className="hs-code">
          {'try:\n    result = schema.load(data)\n'}
          <span className="hs-bad">{'except ValidationError as err:'}</span>
          {'\n    return err.messages'}
        </pre>
      </div>
    </div>
  );
}
