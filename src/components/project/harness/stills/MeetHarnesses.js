import React from 'react';
import Critter from '../Critter';
import { ROSTER } from '../roster';

// Five harnesses in ORDER, all visible at once inside a thin square frame.
function Row({ h }) {
  return (
    <div className="mh-row">
      <Critter className="mh-critter" outfit={h.outfit} />
      <div className="mh-text">
        <div className="mh-name"><span>{h.label}</span>
          <a className="hx-visit" href={h.site} target="_blank" rel="noopener noreferrer">visit ↗</a>
        </div>
        <p>{h.line}</p>
      </div>
    </div>
  );
}

export default function MeetHarnesses() {
  return (
    <div id="harnesses" className="mh-static" aria-label="Meet the harnesses">
      {ROSTER.map((h) => <Row key={h.id} h={h} />)}
    </div>
  );
}
