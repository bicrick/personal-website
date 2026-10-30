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
  if (!page.ruled) return null;
  const lines = [];
  const top = page.margins.t;
  const bottom = page.height_mm - page.margins.b;
  const lh = page.line_height_mm || 8;
  for (let y = top + lh; y < bottom; y += lh) {
    lines.push(
      <line
        key={y}
        x1={page.margins.l}
        x2={page.width_mm - page.margins.r}
        y1={y}
        y2={y}
      />,
    );
  }
  return (
    <svg className="sqd-ruled" viewBox={`0 0 ${page.width_mm} ${page.height_mm}`} aria-hidden="true">
      {lines}
    </svg>
  );
}

/** The page inside the browser chrome: paper, optional layout boxes, friends pen. */
export default function PaperView({
  scenario,
  stage,
  regionStatus,
  penVt,
  wireOn,
  handId,
  replayKey,
}) {
  if (!scenario) {
    return (
      <div className="sqd-page sqd-page-empty">
        <p>Pick a request on the right. Scribe plans the page, then writes it.</p>
      </div>
    );
  }
  const { paper, regions, ink } = scenario;
  const showWire = wireOn && (stage === 'wire' || stage === 'regions' || stage === 'write' || stage === 'done');
  const showInk = stage === 'write' || stage === 'done';
  const finished = stage === 'done';
  // Outer slot is always letter so switching pages never resizes the desk.
  const slotAr = 216 / 279;
  const pageAr = paper.width_mm / paper.height_mm;
  const choosing = stage === 'plan' || stage === 'typing';
  const isCompact = paper.kind === 'sticky' || pageAr > 1.1 || pageAr < slotAr * 0.92;

  return (
    <div
      className="sqd-page-slot"
      style={{ aspectRatio: '216 / 279', '--page-ar': slotAr }}
      data-stage={stage}
    >
      <div
        className={`sqd-page${paper.kind === 'sticky' ? ' is-sticky' : ''}${isCompact ? ' is-compact' : ''}`}
        style={{ aspectRatio: `${paper.width_mm} / ${paper.height_mm}`, '--sheet-ar': pageAr }}
      >
      <div className="sqd-sheet">
        <RuledLines page={paper} />
        {choosing ? (
          <p className="sqd-choosing">{paper.label}</p>
        ) : null}
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