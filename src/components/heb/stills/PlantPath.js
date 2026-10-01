import React from 'react';
import { GlyphArgo, GlyphCloud, GlyphNet, GlyphUi } from './glyphs';

const STEPS = [
  { label: 'Kubernetes', Glyph: GlyphCloud },
  { label: 'Argo CD', Glyph: GlyphArgo },
  { label: 'deploys', Glyph: GlyphUi },
  { label: 'the network', Glyph: GlyphNet },
];

function PlantPath() {
  return (
    <ol className="heb-path" aria-hidden="true">
      {STEPS.map((step) => {
        const Glyph = step.Glyph;
        return (
          <li key={step.label}>
            <Glyph />
            <span className="heb-path-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default PlantPath;
