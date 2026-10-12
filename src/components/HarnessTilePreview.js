import React from 'react';
import SwingMark from './home/SwingMark';
import './HarnessTilePreview.css';

// Project tile for "same model, five harnesses": the post's hanging critter,
// swinging from a line and spinning through the five harness outfits in
// ORDER. SwingMark handles reduced motion (a still, plain critter).
export default function HarnessTilePreview() {
  return (
    <div className="harness-tile-preview">
      <div className="harness-tile-swing">
        <SwingMark />
      </div>
    </div>
  );
}
