import React from 'react';
import ResultTable from '../ResultTable';

const COLUMNS = ['field', 'what it does', 'guardrail'];

const ROWS = [
  ['css', 'Stylesheet injected into the tab, keyed off a data-monocle attribute on the root', 'Page scripts are never touched'],
  ['overlayHtml', 'Vignettes, glows, grain, anything drawn on top of the page', 'Lives in a shadow root with pointer-events: none'],
  ['ops', 'hide, show, wrap, move, restyle, insert, remove on a selector', 'Video and audio elements are never wrapped, moved, or removed'],
  ['runtime', 'Optional JS for motion, plus a Three.js stage through a host API', 'Runs in a sandbox frame. chrome.* and raw WebGL are rejected'],
  ['message', 'One line back to the chat', 'Message-only replies change nothing on the page'],
];

export default function PatchAnatomy() {
  return (
    <ResultTable
      caption="Everything the model can return. Anything else is dropped by validatePatch."
      columns={COLUMNS}
      rows={ROWS}
    />
  );
}
