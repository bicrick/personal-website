import React, { useMemo, useState } from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import { useTokenStats } from '../hooks/useTokenStats';
import useIsMobile from '../hooks/useIsMobile';
import {
  TRACKER_URL,
  SOURCES,
  VIEWS,
  RANGES,
  formatCount,
  formatDay,
  timeAgo,
} from './tokens/tokenStats';
import { CumulativeChart, DailyChart } from './tokens/TokenCharts';
import TokensMobile from './tokens/TokensMobile';
import './TokensPage.css';


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
  return useIsMobile() ? <TokensMobile /> : <TokensDesktop />;
}

const ALL_TOOLS = SOURCES.map((s) => s.id);

function TokensDesktop() {
  const [view, setView] = useState('heatmap');
  const [range, setRange] = useState('year');
  const [selected, setSelected] = useState(() => new Set(ALL_TOOLS));

  // The heatmap is always year-to-date, so stats follow it in that view
  const rangeDays = view === 'heatmap' ? null : RANGES.find((r) => r.id === range).days;
  // Every number below is a tokentracker API query (see hooks/useTokenStats)
  const { data: stats, error } = useTokenStats(selected, ALL_TOOLS, rangeDays);
  const heatmapTools = useMemo(
    () => (selected.size === ALL_TOOLS.length ? null : [...selected].join(',')),
    [selected]
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

        {error && !stats && <p className="tokens-muted">Token data is unavailable right now.</p>}

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
                    tools={heatmapTools}
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
