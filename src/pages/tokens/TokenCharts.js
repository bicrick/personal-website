import React, { useState } from 'react';
import { MONTHS, formatCount, formatDay } from './tokenStats';

function useChartHover(series) {
  const [index, setIndex] = useState(null);
  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    setIndex(Math.max(0, Math.min(series.length - 1, Math.round(ratio * (series.length - 1)))));
  };
  return { index, onMove, onLeave: () => setIndex(null) };
}

function axisTicks(series) {
  const ticks = [];
  series.forEach((d, i) => {
    const first = i === 0 || d.date.slice(5, 7) !== series[i - 1].date.slice(5, 7);
    if (series.length <= 31 ? i % 7 === 0 : first) {
      ticks.push({
        key: d.date,
        label: series.length <= 31 ? formatDay(d.date) : MONTHS[Number(d.date.slice(5, 7)) - 1],
        left: (i / Math.max(1, series.length - 1)) * 100,
      });
    }
  });
  return ticks;
}

const W = 1000;
const H = 240;

export function CumulativeChart({ series }) {
  const { index, onMove, onLeave } = useChartHover(series);
  const max = series[series.length - 1]?.total || 1;
  const x = (i) => (i / Math.max(1, series.length - 1)) * W;
  const y = (v) => H - (v / max) * H;
  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join('');
  const hover = index != null ? series[index] : null;

  return (
    <ChartFrame
      series={series}
      max={max}
      onMove={onMove}
      onLeave={onLeave}
      readout={hover ? `${formatDay(hover.date)} · ${formatCount(hover.total)} total` : `${formatCount(max)} total`}
    >
      <path d={`${line}L${W},${H}L0,${H}Z`} className="area" />
      <path d={line} className="line" vectorEffect="non-scaling-stroke" />
      {hover && <line x1={x(index)} x2={x(index)} y1="0" y2={H} className="cursor" vectorEffect="non-scaling-stroke" />}
    </ChartFrame>
  );
}

export function DailyChart({ series, order }) {
  const { index, onMove, onLeave } = useChartHover(series);
  const max = Math.max(1, ...series.map((d) => d.count));
  const slot = W / series.length;
  const barW = Math.max(1, slot * 0.72);
  const hover = index != null ? series[index] : null;

  return (
    <ChartFrame
      series={series}
      max={max}
      onMove={onMove}
      onLeave={onLeave}
      readout={hover ? `${formatDay(hover.date)} · ${formatCount(hover.count)}` : `peak ${formatCount(max)} / day`}
    >
      {series.map((d, i) => {
        let top = H;
        return order.map((source) => {
          const value = d.sources[source] || 0;
          if (!value) return null;
          const h = (value / max) * H;
          top -= h;
          return (
            <rect
              key={`${d.date}-${source}`}
              x={i * slot + (slot - barW) / 2}
              y={top}
              width={barW}
              height={h}
              className={`bar source-${source}${index != null && index !== i ? ' is-dim' : ''}`}
            />
          );
        });
      })}
    </ChartFrame>
  );
}

function ChartFrame({ series, max, onMove, onLeave, readout, children }) {
  const gridlines = [0.25, 0.5, 0.75, 1];
  return (
    <figure className="tokens-chart">
      <p className="tokens-chart-readout">{readout}</p>
      <div className="tokens-chart-plot" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={onLeave}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {gridlines.map((f) => (
            <line key={f} x1="0" x2={W} y1={H - f * H} y2={H - f * H} className="grid" vectorEffect="non-scaling-stroke" />
          ))}
          {children}
        </svg>
        {gridlines.map((f) => (
          <span key={f} className="tokens-chart-y" style={{ bottom: `${f * 100}%` }}>
            {formatCount(max * f)}
          </span>
        ))}
      </div>
      <div className="tokens-chart-x">
        {axisTicks(series).map((t) => (
          <span key={t.key} style={{ left: `${t.left}%` }}>{t.label}</span>
        ))}
      </div>
    </figure>
  );
}

