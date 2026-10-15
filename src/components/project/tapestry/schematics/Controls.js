import React from 'react';
import './schematics.css';

/**
 * Admin Configuration knobs schematic:
 * Auto / viewer scene widths, join width, repaint strength, example ribbon.
 */
export default function Controls() {
  const vbW = 720;
  const vbH = 210;
  const scenes = [
    { x: 40, w: 70, kind: 'auto' },
    { x: 110, w: 90, kind: 'auto' },
    { x: 200, w: 55, kind: 'idea' },
    { x: 255, w: 100, kind: 'auto' },
    { x: 355, w: 65, kind: 'auto' },
    { x: 420, w: 80, kind: 'idea' },
    { x: 500, w: 75, kind: 'auto' },
    { x: 575, w: 95, kind: 'auto' },
  ];
  const ribbonY = 128;
  const ribbonH = 36;

  return (
    <figure className="it-schematic" aria-label="Admin controls schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Admin controls</title>

        {/* Dual range rows */}
        <text className="it-schematic-label it-schematic-label-ink" x={40} y={28}>
          scene widths
        </text>

        <text className="it-schematic-label" x={40} y={52}>
          Auto
        </text>
        <line className="it-schematic-stroke-faint" x1={100} y1={48} x2={320} y2={48} />
        <rect className="it-schematic-fill-soft" x={140} y={42} width={120} height={12} />
        <circle className="it-schematic-dot" cx={140} cy={48} r={3.5} />
        <circle className="it-schematic-dot" cx={260} cy={48} r={3.5} />
        <text className="it-schematic-label" x={340} y={52}>
          3–9 strips
        </text>

        <text className="it-schematic-label" x={40} y={78}>
          ideas
        </text>
        <line className="it-schematic-stroke-faint" x1={100} y1={74} x2={320} y2={74} />
        <rect className="it-schematic-fill-soft" x={170} y={68} width={80} height={12} />
        <circle className="it-schematic-dot" cx={170} cy={74} r={3.5} />
        <circle className="it-schematic-dot" cx={250} cy={74} r={3.5} />
        <text className="it-schematic-label" x={340} y={78}>
          5–7 strips
        </text>

        {/* Single sliders */}
        <text className="it-schematic-label it-schematic-label-ink" x={430} y={28}>
          scene joins
        </text>
        <text className="it-schematic-label" x={430} y={52}>
          join width
        </text>
        <line className="it-schematic-stroke-faint" x1={520} y1={48} x2={640} y2={48} />
        <circle className="it-schematic-dot" cx={610} cy={48} r={3.5} />
        <text className="it-schematic-label" x={650} y={52}>
          192
        </text>

        <text className="it-schematic-label" x={430} y={78}>
          repaint
        </text>
        <line className="it-schematic-stroke-faint" x1={520} y1={74} x2={640} y2={74} />
        <circle className="it-schematic-dot" cx={590} cy={74} r={3.5} />
        <text className="it-schematic-label" x={650} y={78}>
          0.85
        </text>

        {/* Example ribbon preview (admin rs-prev) */}
        <text className="it-schematic-label it-schematic-label-ink" x={40} y={112}>
          preview
        </text>
        <rect
          className="it-schematic-stroke-faint"
          x={40}
          y={ribbonY}
          width={630}
          height={ribbonH}
        />
        {scenes.map((s, i) => {
          const joinX = s.x;
          return (
            <g key={`${s.x}-${i}`}>
              <rect
                className={s.kind === 'idea' ? 'it-schematic-fill-soft' : 'it-schematic-fill-faint'}
                x={s.x}
                y={ribbonY + 4}
                width={s.w}
                height={ribbonH - 8}
              />
              {i > 0 ? (
                <rect
                  className="it-schematic-fill-overlap"
                  x={joinX - 10}
                  y={ribbonY + 4}
                  width={18}
                  height={ribbonH - 8}
                />
              ) : null}
              <text
                className="it-schematic-label"
                x={s.x + s.w / 2}
                y={ribbonY + ribbonH / 2 + 4}
                textAnchor="middle"
              >
                {s.kind === 'idea' ? 'idea' : 'auto'}
              </text>
            </g>
          );
        })}
        <text className="it-schematic-label" x={40} y={ribbonY + ribbonH + 22}>
          hatched joins · live settings apply in ~15 s
        </text>
      </svg>
    </figure>
  );
}
