import React from 'react';

const LINES = [
  ['03:12  error  no column store_id', true],
  ['03:12  failed store_inventory_extract', true],
  ['03:11  ddl    drop column store_id', false],
];

function LogCause() {
  const stream = [...LINES, ...LINES];

  return (
    <div className="heb-fig heb-llm" aria-hidden="true">
      <div className="heb-llm-log">
        <div className="heb-llm-lines">
          {stream.map(([line, error], index) => (
            <span key={`${line}-${index}`} className={error ? 'is-error' : undefined}>
              {line}
            </span>
          ))}
        </div>
      </div>
      <div className="heb-llm-out">
        <span>LLM</span>
        Job failed because a DDL change dropped store_id.
      </div>
    </div>
  );
}

export default LogCause;
