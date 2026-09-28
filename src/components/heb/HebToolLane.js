import React from 'react';
import { MARKS } from './marks';

function HebToolLane({ rows, caption }) {
  return (
    <figure className="heb-lane">
      {rows.map((row) => (
        <div key={row.year} className="heb-lane-row">
          <span className="heb-lane-year">{row.year}</span>
          <div className="heb-lane-tools">
            {row.ids.map((id) => {
              const mark = MARKS[id];
              return (
                <span key={id} className="heb-mark">
                  <span className="heb-mark-icon">{mark.icon}</span>
                  <span className="heb-mark-label">{mark.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      ))}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export default HebToolLane;
