import React from 'react';
import StrokeCanvas from './StrokeCanvas';

const ROLE_COLOR = {
  title: 'var(--bot)',
  text: 'var(--link)',
  list: 'var(--link)',
  diagram: 'var(--bot)',
  label: 'var(--ink-muted)',
  salutation: 'var(--ink-muted)',
  'sign-off': 'var(--ink-muted)',
};

function Wireframe({ regions, regionStatus, visible, page }) {
  if (!visible || !regions) return null;
  const W = page.width_mm;
  const H = page.height_mm;
  return (
    <svg className="sqd-wire" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect
        x={page.margins.l}
        y={page.margins.t}
        width={W - page.margins.l - page.margins.r}
        height={H - page.margins.t - page.margins.b}
        className="sqd-wire-margin"
      />
      {regions.map((r) => {
        const st = regionStatus[r.id] || 'pending';
        return (
          <g key={r.id} className={`sqd-wire-region is-${st}`}>
            <rect
              x={r.box.x}
              y={r.box.y}
              width={r.box.w}
              height={r.box.h}
              style={{ stroke: ROLE_COLOR[r.role] || 'var(--bot)' }}
            />
            <text x={r.box.x + 1.5} y={r.box.y + 3.2} fontSize="2.8">
              {r.label}
              {st === 'running' ? ' …' : ''}
              {st === 'done' ? ' ✓' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RuledLines({ page }) {
  if (!page.ruled && page.kind !== 'college_ruled') return null;
  const lines = [];
  const top = page.margins.t;
  const bottom = page.height_mm - page.margins.b;
  const lh = page.line_height_mm || 8;
  for (let y = top + lh; y < bottom; y += lh) {
    lines.push(
      <line
        key={`h-${y}`}
        className="sqd-ruled-h"
        x1={0}
        x2={page.width_mm}
        y1={y}
        y2={y}
      />,
    );
  }
  // College-ruled red margin (~1"). Prefer a fixed 28mm when left margin is tight.
  const marginX = page.kind === 'college_ruled'
    ? Math.max(25, Math.min(32, (page.margins && page.margins.l) || 28))
    : null;
  return (
    <svg className="sqd-ruled" viewBox={`0 0 ${page.width_mm} ${page.height_mm}`} aria-hidden="true">
      {lines}
      {marginX != null ? (
        <line
          className="sqd-ruled-margin"
          x1={marginX}
          x2={marginX}
          y1={0}
          y2={page.height_mm}
        />
      ) : null}
    </svg>
  );
}

/** The page on the desk: paper, optional layout boxes, friends pen. */
export default function PaperView({
  scenario,
  stage,
  regionStatus,
  penVt,
  wireOn,
  handId,
  replayKey,
}) {
  // Idle: blank letter. Once a scenario is active, use its paper (college_ruled
  // for math demos) — ink still waits for the write stage.
  const blankPaper = {
    width_mm: 216,
    height_mm: 279,
    margins: { l: 20, r: 20, t: 20, b: 20 },
    ruled: false,
    kind: 'letter',
  };
  const paper = scenario ? scenario.paper : blankPaper;
  const regions = scenario ? scenario.regions : [];
  const ink = scenario ? scenario.ink : null;
  const showWire = Boolean(scenario) && wireOn
    && (stage === 'wire' || stage === 'regions' || stage === 'write' || stage === 'done');
  const showInk = Boolean(scenario) && (stage === 'write' || stage === 'done');
  const finished = stage === 'done';
  // Outer slot is always letter so switching pages never resizes the desk.
  const slotAr = 216 / 279;
  const pageAr = paper.width_mm / paper.height_mm;
  const isCompact = paper.kind === 'sticky' || pageAr > 1.1 || pageAr < slotAr * 0.92;

  return (
    <div
      className="sqd-page-slot"
      style={{ aspectRatio: '216 / 279', '--page-ar': slotAr }}
      data-stage={stage || 'idle'}
    >
      <div
        className={`sqd-page${paper.kind === 'sticky' ? ' is-sticky' : ''}${isCompact ? ' is-compact' : ''}`}
        style={{ aspectRatio: `${paper.width_mm} / ${paper.height_mm}`, '--sheet-ar': pageAr }}
      >
      <div className="sqd-sheet">
        <RuledLines page={paper} />
        {showInk ? (
          <StrokeCanvas
            key={`${scenario.id}-${handId}-${replayKey}`}
            ink={{ ...ink, byHand: scenario.inkByHand || ink.byHand }}
            handId={handId}
            vt={finished ? 1e9 : penVt}
            showPen={!finished}
            finished={finished}
            pageW={paper.width_mm}
            pageH={paper.height_mm}
            regions={regions}
            lineHeightMm={paper.line_height_mm || 8}
            className="sqd-ink"
          />
        ) : null}
        <Wireframe
          regions={regions}
          regionStatus={regionStatus}
          visible={showWire}
          page={paper}
        />
      </div>
      </div>
    </div>
  );
}
