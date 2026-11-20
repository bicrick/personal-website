import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTokenStats } from '../../hooks/useTokenStats';
import BottomSheet from '../../components/BottomSheet';
import {
  MONTHS,
  SOURCES,
  RANGES,
  formatCount,
  timeAgo,
  addDays,
} from './tokenStats';
import { CumulativeChart, DailyChart } from './TokenCharts';
import './TokensMobile.css';

const VIEWS = [
  { id: 'calendar', label: 'calendar' },
  { id: 'daily', label: 'daily' },
  { id: 'cumulative', label: 'total' },
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function longDay(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div className="mt-seg" role="tablist" aria-label={label}>
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

/** Compact GitHub-style strip: weeks across, days down. Opens scrolled to today. */
function Calendar({ series, onPick }) {
  const scrollRef = useRef(null);
  const [picked, setPicked] = useState(null);

  const weeks = useMemo(() => {
    if (!series.length) return [];
    const byDate = new Map(series.map((d) => [d.date, d]));
    const first = series[0].date;
    const last = series[series.length - 1].date;
    const startDow = new Date(`${first}T12:00:00Z`).getUTCDay();
    const out = [];
    let prevMonth = null;
    for (let sunday = addDays(first, -startDow); sunday <= last; sunday = addDays(sunday, 7)) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const iso = addDays(sunday, i);
        return iso < first || iso > last ? null : byDate.get(iso);
      });
      const anchor = days.find(Boolean);
      const month = anchor ? anchor.date.slice(5, 7) : null;
      out.push({ key: sunday, days, month: month && month !== prevMonth ? MONTHS[Number(month) - 1] : '' });
      prevMonth = month || prevMonth;
    }
    return out;
  }, [series]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks]);

  const pick = (d) => {
    setPicked(d.date);
    onPick(d);
  };

  return (
    <div className="mt-cal">
      <div className="mt-cal-days" aria-hidden="true">
        <span />
        {WEEKDAYS.map((d, i) => <span key={i}>{i % 2 ? d : ''}</span>)}
      </div>
      <div className="mt-cal-scroll" ref={scrollRef}>
        {weeks.map((week) => (
          <div className="mt-cal-week" key={week.key}>
            <span className="mt-cal-month">{week.month}</span>
            {week.days.map((d, i) =>
              d ? (
                <button
                  key={d.date}
                  type="button"
                  className={`mt-cal-cell level-${d.level}${picked === d.date ? ' is-picked' : ''}`}
                  aria-label={`${longDay(d.date)}: ${formatCount(d.count)} tokens`}
                  onClick={() => pick(d)}
                />
              ) : (
                <span key={i} className="mt-cal-cell is-empty" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="mt-legend">
        <span>tap a day · swipe for earlier</span>
        <span className="mt-legend-scale" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`mt-cal-cell level-${l}`} />)}
        </span>
      </div>
    </div>
  );
}

function DaySheet({ day, onClose }) {
  const parts = day ? SOURCES.filter((s) => day.sources[s.id]) : [];
  const max = Math.max(1, ...parts.map((s) => day.sources[s.id]));
  return (
    <BottomSheet open={!!day} onClose={onClose} label="day detail">
      {day && (
        <div className="mt-day">
          <p className="m-label">{longDay(day.date)}</p>
          <p className="mt-day-total">
            {formatCount(day.count)} <span>tokens</span>
          </p>
          {parts.length ? (
            <ul className="mt-day-list">
              {parts.map((s) => (
                <li key={s.id} className={`source-${s.id}`}>
                  <span className="mt-day-name"><i />{s.name}</span>
                  <span className="mt-day-value">{formatCount(day.sources[s.id])}</span>
                  <span className="mt-day-bar"><span style={{ width: `${(day.sources[s.id] / max) * 100}%` }} /></span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-muted">No activity this day.</p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

const ALL_TOOLS = SOURCES.map((s) => s.id);

export default function TokensMobile() {
  const [view, setView] = useState('calendar');
  const [range, setRange] = useState('year');
  const [selected, setSelected] = useState(() => new Set(ALL_TOOLS));
  const [day, setDay] = useState(null);

  const rangeDays = RANGES.find((r) => r.id === range).days;
  // Every number here is a tokentracker API query (see hooks/useTokenStats).
  // sourceTotals come back unfiltered, so chips show what turning a tool back on adds.
  const { data: stats, error } = useTokenStats(selected, ALL_TOOLS, rangeDays);
  const allStats = stats;

  const toggle = (id) =>
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

  const rangeLabel = { year: 'this year', 90: 'last 90 days', 30: 'last 30 days' }[range];

  return (
    <section className="page-section mt-page" aria-label="token usage">
      <header className="mt-header">
        <h1>tokens</h1>
        <p>
          Every token my AI coding tools process, collected and served by{' '}
          <Link to="/projects/tokentracker">tokentracker</Link>, an open source tool I built.
        </p>
      </header>

      {error && !stats && <p className="mt-muted">Token data is unavailable right now.</p>}

      {stats && (
        <>
          <div className="mt-hero">
            <p className="mt-hero-total">{formatCount(stats.total)}</p>
            <p className="mt-hero-sub">tokens {rangeLabel}</p>
          </div>

          <Segmented label="Time range" options={RANGES} value={range} onChange={setRange} />

          <div className="mt-chips" role="group" aria-label="Sources">
            {SOURCES.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`mt-chip source-${s.id}${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggle(s.id)}
                >
                  <i aria-hidden="true" />
                  {s.name}
                  <span>{formatCount(allStats.sourceTotals[s.id] || 0)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-stats">
            <div>
              <span>busiest day</span>
              <strong>{stats.busiest ? formatCount(stats.busiest.count) : '—'}</strong>
              {stats.busiest && (
                <button type="button" onClick={() => setDay(stats.busiest)}>
                  {new Date(`${stats.busiest.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} →
                </button>
              )}
            </div>
            <div>
              <span>avg active day</span>
              <strong>{formatCount(stats.avgActive)}</strong>
              <em>{stats.activeDays} active days</em>
            </div>
            <div>
              <span>longest streak</span>
              <strong>{stats.longest}d</strong>
            </div>
            <div>
              <span>favorite model</span>
              <strong className="is-text">{stats.favorite ? stats.favorite.name : '—'}</strong>
              {stats.favorite && <em>{stats.favorite.messages.toLocaleString()} responses</em>}
            </div>
          </div>

          <div className="mt-panel">
            <Segmented label="Chart view" options={VIEWS} value={view} onChange={setView} />
            <div className="mt-panel-body">
              {view === 'calendar' && <Calendar series={stats.series} onPick={setDay} />}
              {view === 'daily' && <DailyChart series={stats.series} order={SOURCES.map((s) => s.id)} />}
              {view === 'cumulative' && <CumulativeChart series={stats.series} />}
            </div>
          </div>

          <ul className="mt-sync">
            {SOURCES.map((s) => (
              <li key={s.id}>
                <span>{s.name}</span>
                <span>{s.method} · synced {timeAgo(stats.synced[s.id])}</span>
              </li>
            ))}
          </ul>

          <DaySheet day={day} onClose={() => setDay(null)} />
        </>
      )}
    </section>
  );
}
