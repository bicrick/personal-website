import React, { useEffect, useMemo, useState } from 'react';
import './CursorActivityHeatmap.css';

const PROFILE_URL = 'https://cursor.com/@bicrick';
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function formatCount(count) {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}b`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(count);
}

function formatDayLabel(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function utcToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function buildYtdGrid(activityCounts, year) {
  const byDate = new Map(
    (activityCounts || []).map((row) => [row.date, Number(row.count) || 0])
  );

  const jan1 = new Date(Date.UTC(year, 0, 1));
  const today = utcToday();
  const end = today.getUTCFullYear() === year
    ? today
    : new Date(Date.UTC(year, 11, 31));

  // Week columns start on Sunday, matching GitHub-style calendars
  const gridStart = new Date(jan1);
  gridStart.setUTCDate(jan1.getUTCDate() - jan1.getUTCDay());

  const gridEnd = new Date(end);
  gridEnd.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const weeks = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week = [];
    for (let d = 0; d < 7; d += 1) {
      const iso = cursor.toISOString().slice(0, 10);
      const inRange = cursor >= jan1 && cursor <= end;
      week.push({
        date: iso,
        count: inRange ? byDate.get(iso) || 0 : null,
        month: cursor.getUTCMonth(),
        inRange,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // Keep only weeks that touch the YTD window
    if (week.some((day) => day.inRange)) {
      weeks.push(week);
    }
  }

  const values = [...byDate.entries()]
    .filter(([date, count]) => count > 0 && date >= `${year}-01-01` && date <= end.toISOString().slice(0, 10))
    .map(([, count]) => count)
    .sort((a, b) => a - b);

  const q = (p) => {
    if (!values.length) return 1;
    const idx = Math.min(values.length - 1, Math.floor(values.length * p));
    return values[idx];
  };
  const thresholds = [q(0.25), q(0.5), q(0.75), q(0.9)];

  const levelFor = (count) => {
    if (count == null) return -1;
    if (count <= 0) return 0;
    if (count <= thresholds[0]) return 1;
    if (count <= thresholds[1]) return 2;
    if (count <= thresholds[2]) return 3;
    return 4;
  };

  const monthMarkers = MONTH_LABELS.map((label, monthIndex) => {
    const weekIndex = weeks.findIndex((week) =>
      week.some((day) => day.inRange && day.month === monthIndex && day.date.endsWith('-01'))
    );
    // Also label months that start mid-grid without a visible 1st in-range cell
    // (e.g. month begins before jan1 week padding) — prefer first in-range day of month
    const fallbackIndex = weeks.findIndex((week) =>
      week.some((day) => day.inRange && day.month === monthIndex)
    );
    return {
      label,
      weekIndex: weekIndex === -1 ? (fallbackIndex === -1 ? null : fallbackIndex) : weekIndex,
    };
  }).filter((month, i, arr) => {
    if (month.weekIndex == null) return false;
    // Avoid stacking two labels on the same week column
    return arr.findIndex((m) => m.weekIndex === month.weekIndex) === i;
  });

  return { weeks, levelFor, monthMarkers };
}

function CursorActivityHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const primary = await fetch('/api/cursor-activity');
        if (primary.ok) {
          const json = await primary.json();
          if (!cancelled) setData(json);
          return;
        }
      } catch (_) {
        // fall through to static snapshot for local/dev
      }

      try {
        const fallback = await fetch(`${process.env.PUBLIC_URL}/cursor-activity.json`);
        if (!fallback.ok) throw new Error(`status ${fallback.status}`);
        const json = await fallback.json();
        if (!cancelled) setData(json);
      } catch (_) {
        if (!cancelled) setError(true);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const year = useMemo(() => {
    if (data?.activityCounts?.length) {
      return Number(data.activityCounts[data.activityCounts.length - 1].date.slice(0, 4));
    }
    return new Date().getUTCFullYear();
  }, [data]);

  const grid = useMemo(
    () => buildYtdGrid(data?.activityCounts || [], year),
    [data, year]
  );

  if (error || !data) {
    return null;
  }

  const showTip = (event, day) => {
    if (!day.inRange) {
      setTooltip(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text: `${formatDayLabel(day.date)} · ${formatCount(day.count)}`,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <a
      className="cursor-activity"
      href={PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cursor token usage for @bicrick"
      onMouseLeave={() => setTooltip(null)}
    >
      <span className="cursor-activity-label">token usage</span>
      <div className="cursor-activity-graph">
        <div className="cursor-activity-months">
          <span className="cursor-activity-gutter" />
          <div
            className="cursor-activity-month-track"
            style={{ gridTemplateColumns: `repeat(${grid.weeks.length}, minmax(0, 1fr))` }}
          >
            {grid.monthMarkers.map((month) => (
              <span
                key={month.label}
                style={{ gridColumn: month.weekIndex + 1 }}
              >
                {month.label}
              </span>
            ))}
          </div>
        </div>

        <div className="cursor-activity-body">
          <div className="cursor-activity-days">
            {DAY_LABELS.map((label, i) => (
              <span key={`day-${i}`}>{label}</span>
            ))}
          </div>

          <div
            className="cursor-activity-weeks"
            style={{ gridTemplateColumns: `repeat(${grid.weeks.length}, minmax(0, 1fr))` }}
          >
            {grid.weeks.map((week, wi) => (
              <div key={`week-${wi}`} className="cursor-activity-week">
                {week.map((day) => {
                  const level = grid.levelFor(day.count);
                  return (
                    <span
                      key={day.date}
                      className={`cursor-activity-dot level-${level < 0 ? 'empty' : level}`}
                      onMouseEnter={(event) => showTip(event, day)}
                      onMouseMove={(event) => showTip(event, day)}
                      onFocus={(event) => showTip(event, day)}
                      onBlur={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <span
          className="cursor-activity-tip"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          {tooltip.text}
        </span>
      )}
    </a>
  );
}

export default CursorActivityHeatmap;
