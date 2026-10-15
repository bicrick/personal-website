import React from 'react';
import './schematics.css';

/** Storage and serving: strip → R2 + DB → WS ref → browser feather. */
export default function StorageServing() {
  const vbW = 720;
  const vbH = 150;
  const nodes = [
    { x: 40, label: 'generator', sub: '448×1024 webp' },
    { x: 200, label: 'R2 CDN', sub: 'live-sdxl/strips' },
    { x: 360, label: 'Supabase', sub: 'idx · scene · time' },
    { x: 520, label: 'browser', sub: 'feather · scroll' },
  ];
  const boxW = 118;
  const boxH = 48;
  const y = 36;

  return (
    <figure className="it-schematic" aria-label="Storage and serving schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Storage and serving</title>
        {nodes.map((node, i) => (
          <g key={node.label}>
            <rect
              className="it-schematic-fill-faint"
              x={node.x}
              y={y}
              width={boxW}
              height={boxH}
            />
            <text
              className="it-schematic-label it-schematic-label-ink"
              x={node.x + boxW / 2}
              y={y + 20}
              textAnchor="middle"
            >
              {node.label}
            </text>
            <text
              className="it-schematic-label"
              x={node.x + boxW / 2}
              y={y + 36}
              textAnchor="middle"
            >
              {node.sub}
            </text>
            {i < nodes.length - 1 ? (
              <g>
                <line
                  className="it-schematic-arrow"
                  x1={node.x + boxW + 4}
                  y1={y + boxH / 2}
                  x2={nodes[i + 1].x - 8}
                  y2={y + boxH / 2}
                />
                <polyline
                  className="it-schematic-arrow"
                  points={`${nodes[i + 1].x - 14},${y + boxH / 2 - 5} ${nodes[i + 1].x - 6},${y + boxH / 2} ${nodes[i + 1].x - 14},${y + boxH / 2 + 5}`}
                />
              </g>
            ) : null}
          </g>
        ))}

        {/* WS note under generator → browser */}
        <text className="it-schematic-label" x={360} y={y + boxH + 28} textAnchor="middle">
          WebSocket strip refs · LOD tiles for scrub
        </text>
      </svg>
    </figure>
  );
}
