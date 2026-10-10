import React from 'react';
import Critter from '../Critter';

// The final head-to-head: 5 seeds x 25 tasks per side, same model.
export default function Headline() {
  return (
    <div className="hs-headline">
      <div className="hs-head-side">
        <Critter className="hs-head-critter" mood="tired" />
        <div className="hs-head-label">whole repo, one prompt</div>
        <div className="hs-head-num">63%</div>
        <div className="hs-head-cost">$0.0510 per solve</div>
      </div>
      <div className="hs-head-mid">same model<br />same 125 runs<br />→</div>
      <div className="hs-head-side is-win">
        <Critter className="hs-head-critter" mood="happy" outfit="harness" hop />
        <div className="hs-head-label">all four levers set</div>
        <div className="hs-head-num">100%</div>
        <div className="hs-head-cost">$0.0016 per solve</div>
      </div>
    </div>
  );
}
