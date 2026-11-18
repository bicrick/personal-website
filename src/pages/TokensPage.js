import React, { useMemo, useState } from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import useTokenActivity from '../hooks/useTokenActivity';
import './TokensPage.css';

const TIME_ZONE = 'America/Chicago';
const TRACKER_URL = 'https://github.com/bicrick/tokentracker';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PROVIDER_NAMES = {
  'github-copilot': 'github copilot',
};

const SOURCES = [
  { id: 'cursor', name: 'cursor', method: 'public profile' },
  { id: 'claude-code', name: 'claude code', method: 'local collector' },
  { id: 'opencode', name: 'opencode', method: 'local collector' },
];

const VIEWS = [
  { id: 'heatmap', label: 'heatmap' },
  { id: 'cumulative', label: 'cumulative' },
  { id: 'daily', label: 'daily' },
];

const RANGES = [
  { id: 'year', label: 'ytd', days: null },
  { id: '90', label: '90d', days: 90 },
  { id: '30', label: '30d', days: 30 },
];

function formatCount(count) {
  if (count >= 1e9) return `${(count / 1e9).toFixed(2).replace(/\.?0+$/, '')}b`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(1).replace(/\.0$/, '')}m`;
  if (count >= 1e3) return `${(count / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
  return String(Math.round(count));
}

function formatDay(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function timeAgo(iso) {
  if (!iso) return 'never';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function todayIso() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function modelName(model) {
  const id = model.split('/').slice(1).join('/') || model;
  // claude-opus-4-5 -> claude-opus-4.5
  return id.replace(/-(\d)-(\d)(?=$|-)/, '-$1.$2');
}

function providerOf(model) {
  const provider = model.split('/')[0];
  return PROVIDER_NAMES[provider] || provider;
}

/** Daily counts restricted to the selected tools. */
function filterActivity(activityCounts, selected) {
  return (activityCounts || []).map((d) => {
    const sources = d.sources || { cursor: d.count };
    const kept = {};
    let count = 0;
    for (const [source, value] of Object.entries(sources)) {
      if (!selected.has(source)) continue;
      kept[source] = value;
      count += value;
    }
    return { date: d.date, count, sources: kept };
  });
}

function computeStats(data, selected, rangeDays) {
  const today = todayIso();
  const year = today.slice(0, 4);
  const start = rangeDays ? addDays(today, -(rangeDays - 1)) : `${year}-01-01`;

  const filtered = filterActivity(data.activityCounts, selected);
  const byDate = new Map(filtered.map((d) => [d.date, d]));

  // Dense series over the range so charts have every day, including zeros
  const series = [];
  let running = 0;
  for (let iso = start; iso <= today; iso = addDays(iso, 1)) {
    const day = byDate.get(iso) || { date: iso, count: 0, sources: {} };
    running += day.count;
    series.push({ ...day, total: running });
  }

  const total = running;
  const active = series.filter((d) => d.count > 0);
  const busiest = series.reduce((best, d) => (!best || d.count > best.count ? d : best), null);

  let longest = 0;
  let run = 0;
  for (const d of series) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const sourceTotals = {};
  for (const d of series) {
    for (const [source, value] of Object.entries(d.sources)) {
      sourceTotals[source] = (sourceTotals[source] || 0) + value;
    }
  }

  // Cursor's public profile doesn't break usage down by model.
  // The same model can come through several tools, so merge by name.
  const byName = new Map();
  const providers = {};
  for (const m of data.models || []) {
    if (m.model === 'cursor/all') continue;
    (providers[m.source] ||= new Set()).add(providerOf(m.model));
    if (!selected.has(m.source)) continue;
    const name = modelName(m.model);
    const entry = byName.get(name) || { name, messages: 0, tokens: 0 };
    entry.messages += m.messages || 0;
    entry.tokens += m.tokens || 0;
    byName.set(name, entry);
  }
  const favorite = [...byName.values()].sort((a, b) => b.messages - a.messages)[0] || null;

  const synced = {};
  for (const d of data.devices || []) {
    if (!synced[d.source] || d.updatedAt > synced[d.source]) synced[d.source] = d.updatedAt;
  }

  return {
    series,
    filtered,
    total,
    busiest: busiest?.count ? busiest : null,
    longest,
    activeDays: active.length,
    avgActive: active.length ? total / active.length : 0,
    sourceTotals,
    favorite,
    providers,
    synced,
  };
}

function Toggle({ options, value, onChange, label }) {
  return (
    <div className="tokens-toggle" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          className={value === o.id ? 'is-active' : ''}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StatStrip({ stats }) {
  const items = [
    { label: 'total', value: formatCount(stats.total) },
    {
      label: 'busiest day',
      value: stats.busiest ? formatCount(stats.busiest.count) : '—',
      note: stats.busiest ? formatDay(stats.busiest.date) : null,
    },
    { label: 'avg active day', value: formatCount(stats.avgActive), note: `${stats.activeDays} active days` },
    { label: 'longest streak', value: `${stats.longest}d` },
    {
      label: 'favorite model',
      value: stats.favorite ? stats.favorite.name : '—',
      note: stats.favorite ? `${stats.favorite.messages.toLocaleString()} responses` : 'not reported',
      wide: true,
    },
  ];

  return (
    <dl className="tokens-stats">
      {items.map((item) => (
        <div className={`tokens-stat${item.wide ? ' is-wide' : ''}`} key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.value}
            <span>{item.note || '\u00a0'}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

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

function CumulativeChart({ series }) {
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

function DailyChart({ series, order }) {
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
      <div className="tokens-chart-plot" onMouseMove={onMove} onMouseLeave={onLeave}>
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

function SourceFilter({ stats, selected, onToggle }) {
  const max = Math.max(1, ...SOURCES.map((s) => stats.sourceTotals[s.id] || 0));
  return (
    <ul className="tokens-sources">
      {SOURCES.map((s) => {
        const on = selected.has(s.id);
        const tokens = stats.sourceTotals[s.id] || 0;
        const providers = [...(stats.providers[s.id] || [])];
        const via = s.id === 'cursor' ? 'cursor.com/@bicrick' : providers.length ? `via ${providers.join(', ')}` : '';
        return (
          <li key={s.id}>
            <button
              type="button"
              className={`tokens-source source-${s.id}${on ? ' is-on' : ''}`}
              aria-pressed={on}
              onClick={() => onToggle(s.id)}
            >
              <span className="tokens-source-head">
                <i aria-hidden="true" />
                <span className="tokens-source-name">{s.name}</span>
                <span className="tokens-source-tokens">{on ? formatCount(tokens) : 'off'}</span>
              </span>
              <span className="tokens-bar" aria-hidden="true">
                <span style={{ width: `${on ? (tokens / max) * 100 : 0}%` }} />
              </span>
              <span className="tokens-source-meta">
                {[via, s.method, `synced ${timeAgo(stats.synced[s.id])}`].filter(Boolean).join(' · ')}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function TokensPage() {
  const { data, error } = useTokenActivity();
  const [view, setView] = useState('heatmap');
  const [range, setRange] = useState('year');
  const [selected, setSelected] = useState(() => new Set(SOURCES.map((s) => s.id)));

  // The heatmap is always year-to-date, so stats follow it in that view
  const rangeDays = view === 'heatmap' ? null : RANGES.find((r) => r.id === range).days;
  const stats = useMemo(
    () => (data ? computeStats(data, selected, rangeDays) : null),
    [data, selected, rangeDays]
  );

  const heatmapData = useMemo(
    () => (data && stats ? { ...data, activityCounts: stats.filtered } : null),
    [data, stats]
  );

  const toggleSource = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const order = SOURCES.map((s) => s.id);

  return (
    <section id="tokens" className="page-section tokens-page" aria-label="token usage">
      <article className="tokens-article">
        <header className="tokens-header">
          <TypewriterHeading as="h1" className="tokens-heading">
            tokens
          </TypewriterHeading>
          <p>
            Every token I spend with AI coding tools, across every tool and machine I build on.
            Collected with <a href={TRACKER_URL} target="_blank" rel="noopener noreferrer">tokentracker</a>.
          </p>
        </header>

        {error && <p className="tokens-muted">Token data is unavailable right now.</p>}

        {stats && (
          <>
            <div className="tokens-controls">
              <Toggle label="Chart view" options={VIEWS} value={view} onChange={setView} />
              {view !== 'heatmap' && (
                <Toggle label="Time range" options={RANGES} value={range} onChange={setRange} />
              )}
            </div>

            <StatStrip stats={stats} />

            <div className="tokens-panel">
              {view === 'heatmap' && (
                <div className="tokens-heatmap">
                  <CursorActivityHeatmap
                    to={null}
                    activity={heatmapData}
                    showSources
                    showTotal={false}
                    showLabel={false}
                  />
                </div>
              )}
              {view === 'cumulative' && <CumulativeChart series={stats.series} />}
              {view === 'daily' && <DailyChart series={stats.series} order={order} />}
            </div>

            <SourceFilter stats={stats} selected={selected} onToggle={toggleSource} />
          </>
        )}
      </article>
    </section>
  );
}
