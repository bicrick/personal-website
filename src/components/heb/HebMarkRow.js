import React from 'react';
import { MARKS } from './marks';

function HebMarkRow({ ids, caption }) {
  return (
    <figure className="heb-marks">
      <ul className="heb-marks-list">
        {ids.map((id) => {
          const mark = MARKS[id];
          return (
            <li key={id} className="heb-mark">
              <span className="heb-mark-icon">{mark.icon}</span>
              <span className="heb-mark-label">{mark.label}</span>
            </li>
          );
        })}
      </ul>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export default HebMarkRow;
