import React from 'react';
import './LogCause.css';

const LINES = [
  { time: '03:12', level: 'error', message: 'no column store_id', tone: 'error' },
  { time: '03:12', level: 'failed', message: 'store_inventory_extract', tone: 'error' },
  { time: '03:11', level: 'ddl', message: 'drop column store_id', tone: 'ddl' },
];

function LogCause() {
  return (
    <div className="heb-cause" aria-hidden="true">
      <div className="heb-cause-trace">
        <span className="heb-cause-kicker">trace</span>
        <div className="heb-cause-lines">
          {LINES.map((line) => (
            <div key={`${line.time}-${line.level}`} className={`heb-cause-line is-${line.tone}`}>
              <span className="heb-cause-time">{line.time}</span>
              <span className="heb-cause-level">{line.level}</span>
              <span className="heb-cause-msg">{line.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="heb-cause-rail is-in">
        <span className="heb-cause-packet">store_id</span>
      </div>

      <div className="heb-cause-llm">LLM</div>

      <div className="heb-cause-rail is-out" />

      <div className="heb-cause-summary">
        <span className="heb-cause-kicker">root cause</span>
        <span className="heb-cause-reveal">
          store_inventory_extract failed because a DDL change dropped column store_id.
        </span>
      </div>
    </div>
  );
}

export default LogCause;
