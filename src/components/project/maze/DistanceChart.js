import { CHART } from './geometry';
import { BACK_SPAN, CHART_SEGMENTS } from './timeline';

const CLIP_ID = 'maze-chart-reveal';

export default function DistanceChart({ refs }) {
  const bottom = CHART.y + CHART.h;
  const bandMid = (BACK_SPAN.x0 + BACK_SPAN.x1) / 2;

  return (
    <g className="maze-chart">
      <text className="maze-chart-name" x={CHART.x} y={CHART.y - 12}>distance to exit</text>

      <g ref={refs.band} className="maze-chart-band">
        <rect x={BACK_SPAN.x0} y={CHART.y} width={BACK_SPAN.x1 - BACK_SPAN.x0} height={CHART.h} />
        <text x={bandMid} y={CHART.y - 12} textAnchor="middle">going back</text>
      </g>

      <line className="maze-chart-axis" x1={CHART.x} y1={bottom} x2={CHART.x + CHART.w} y2={bottom} />
      <text className="maze-chart-tick" x={CHART.x + CHART.w + 8} y={bottom + 4}>0</text>

      <clipPath id={CLIP_ID}>
        <rect ref={refs.clip} x={CHART.x - 4} y={CHART.y - 8} width="0" height={CHART.h + 16} />
      </clipPath>
      <g clipPath={`url(#${CLIP_ID})`}>
        {CHART_SEGMENTS.map((seg) => (
          <path key={seg.d} className={`maze-chart-line is-${seg.kind}`} d={seg.d} />
        ))}
      </g>

      <circle ref={refs.dot} className="maze-chart-dot" cx={CHART.x} cy={bottom} r="3.5" />
    </g>
  );
}
