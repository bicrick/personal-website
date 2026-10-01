import React from 'react';
import { GlyphArgo, GlyphCloud, GlyphNet, GlyphUi } from './glyphs';

const STEPS = [
  { label: 'UI pages', Glyph: GlyphUi },
  { label: 'cloud deploys', Glyph: GlyphCloud },
  { label: 'the network', Glyph: GlyphNet },
  { label: 'Argo CD', Glyph: GlyphArgo },
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
