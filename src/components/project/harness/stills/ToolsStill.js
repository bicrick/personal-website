import React from 'react';
import { CcWindow, Transcript } from '../cc';

// Raw materials vs. the operation itself.
export default function ToolsStill() {
  return (
    <div className="hs-pair">
      <CcWindow title="raw tools" meta="most agents">
        <Transcript
          lines={[
            { kind: 'call', text: 'Bash(grep -rn "ValidationError")' },
            { kind: 'out', text: '468 lines across 19 files' },
            { kind: 'call', text: 'Read(src/marshmallow/fields.py)' },
            { kind: 'call', text: 'Update(src/marshmallow/fields.py)' },
            { kind: 'call', text: 'Read(src/marshmallow/schema.py)' },
            { kind: 'call', text: 'Update(src/marshmallow/schema.py)' },
            { kind: 'gap', text: '… one file at a time' },
          ]}
        />
      </CcWindow>
      <CcWindow title="structured tools" meta="built for the job">
        <Transcript
          lines={[
            { kind: 'call', text: 'find_references("ValidationError")' },
            { kind: 'out', text: 'definition, imports, raises, excepts · 19 files' },
            { kind: 'call', text: 'rename_symbol(→ SchemaValidationError)' },
            { kind: 'out', text: '468 lines in 19 files' },
            { kind: 'call', text: 'Bash(pytest)' },
            { kind: 'out', text: 'passed' },
          ]}
        />
      </CcWindow>
    </div>
  );
}
