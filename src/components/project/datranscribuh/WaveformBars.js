import React, { useMemo } from 'react';
import { WaveformCount } from './ink';

/**
 * Solid B/W centered bars — port of WaveformBars.swift.
 * Square-capped, gap 1.35 when count > 24, min height 2.5.
 */
export default function WaveformBars({
  levels,
  width = 188,
  height = 26,
  className = '',
}) {
  const bars = levels && levels.length ? levels : Array(WaveformCount).fill(0.1);
  const count = bars.length;
  const gap = count > 24 ? 1.35 : 2.25;
  const barWidth = Math.max(1.25, (width - gap * (count - 1)) / count);
  const used = barWidth * count + gap * (count - 1);
  const origin = (width - used) / 2;

  const rects = useMemo(
    () =>
      bars.map((raw, index) => {
        const level = Math.min(1, Math.max(0, raw));
        const h = Math.max(2.5, 2.5 + level * (height - 2.5));
        return {
          x: origin + index * (barWidth + gap),
          y: (height - h) / 2,
          w: barWidth,
          h,
        };
      }),
    [bars, barWidth, gap, height, origin]
  );

  return (
    <svg
      className={`dtd-wave ${className}`.trim()}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
      ))}
    </svg>
  );
}
