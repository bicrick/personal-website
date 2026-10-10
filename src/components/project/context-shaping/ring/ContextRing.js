import React, { useState } from 'react';
import { SEGMENTS, SEGMENT_BY_KEY, sumTokens, fmtTokens, fmtPct } from './segments';
import './ContextRing.css';

/*
 * One picture of the context window, used by every demo in the post.
 * A ring (stacked bar on narrow screens) split into SEGMENTS plus free space,
 * a shared legend, and a detail panel for whichever segment is hovered,
 * tapped, or being narrated.
 *
 * ring = {
 *   id, title, segments: { [key]: tokens }, capacity, capacityLabel,
 *   reasoning?  tokens of `messages` that are inferred rather than visible,
 *   outer?      { tokens, label, kind: 'cache' | 'ghost' } thin arc outside the ring,
 *   marks?      [{ at: tokens, label }] ticks across the ring,
 *   zoom?       draw the ring at this many tokens instead of the full capacity
 *               (labeled on the ring; free space and % still use capacity),
 *   note?       short line under the center number,
 *   footer?     node rendered under the ring,
 * }
 */

const R = 84;
const STROKE = 20;
const C = 2 * Math.PI * R;
const OUTER_R = 100;
const OUTER_C = 2 * Math.PI * OUTER_R;
const MIN_ARC = 2.4;
const GAP = 1.6;

function scaleOf(ring) {
  return Math.max(ring.zoom || ring.capacity, sumTokens(ring.segments));
}

function arcs(segments, scale) {
  const present = SEGMENTS.filter((s) => segments[s.key] > 0).length;
  let pos = 0;
  const out = SEGMENTS.map((s) => {
    const v = segments[s.key] || 0;
    const len = v > 0 ? Math.max(MIN_ARC, (v / scale) * C) : 0;
    const arc = { key: s.key, start: pos, len };
    pos += len;
    return arc;
  });
  const k = pos > C ? C / pos : 1;
  const gap = present > 1 ? GAP : 0;
  return out.map((a) => ({
    key: a.key,
    start: a.start * k,
    draw: a.len * k > gap * 1.5 ? a.len * k - gap : a.len * k,
  }));
}

function polar(r, frac) {
  const a = frac * 2 * Math.PI - Math.PI / 2;
  return [110 + r * Math.cos(a), 110 + r * Math.sin(a)];
}

function Ring({ ring, active, onHover, onPick }) {
  const scale = scaleOf(ring);
  const used = sumTokens(ring.segments);
  const over = used > ring.capacity;
  const outerLen = ring.outer ? Math.min(1, ring.outer.tokens / scale) * OUTER_C : 0;
  const label = SEGMENTS.filter((s) => ring.segments[s.key] > 0)
    .map((s) => `${s.label} ${fmtTokens(ring.segments[s.key])}`)
    .join(', ');

  return (
    <div className="cs-ring-cell">
      {ring.title ? <p className="cs-ring-title">{ring.title}</p> : null}

      <div className="cs-ring">
        <svg
          viewBox="-14 -14 248 248"
          role="img"
          aria-label={`${ring.title ? `${ring.title}: ` : ''}${fmtTokens(used)} of ${ring.capacityLabel} used. ${label}.`}
        >
          <circle
            className={`cs-ring-track${active === 'free' ? ' is-active' : ''}`}
            cx="110"
            cy="110"
            r={R}
            strokeWidth={STROKE}
            onMouseEnter={() => onHover('free')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onPick('free')}
          />
          <g transform="rotate(-90 110 110)">
            {arcs(ring.segments, scale).map((a) => (
              <circle
                key={a.key}
                className={`cs-ring-seg cs-seg-${a.key}${
                  active && active !== a.key ? ' is-dim' : ''
                }`}
                cx="110"
                cy="110"
                r={R}
                strokeWidth={STROKE}
                strokeDasharray={`${a.draw} ${C}`}
                strokeDashoffset={-a.start}
                onMouseEnter={() => onHover(a.key)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onPick(a.key)}
              />
            ))}
            <circle
              className={`cs-ring-outer is-${ring.outer?.kind || 'cache'}`}
              cx="110"
              cy="110"
              r={OUTER_R}
              strokeDasharray={`${outerLen} ${OUTER_C}`}
            />
          </g>
          {(ring.marks || []).map((m) => {
            const f = m.at / scale;
            const [x1, y1] = polar(R - STROKE / 2 - 3, f);
            const [x2, y2] = polar(R + STROKE / 2 + 3, f);
            const [tx, ty] = polar(R + STROKE / 2 + 13, f);
            return (
              <g key={m.label} className="cs-ring-mark">
                <line x1={x1} y1={y1} x2={x2} y2={y2} />
                <text
                  x={tx}
                  y={ty}
                  textAnchor={tx > 112 ? 'start' : tx < 108 ? 'end' : 'middle'}
                  dominantBaseline="middle"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="cs-ring-center" aria-hidden="true">
          <strong>{fmtTokens(used)}</strong>
          <span>of {ring.capacityLabel}</span>
          <span className={over ? 'is-over' : undefined}>
            {over ? `over by ${fmtTokens(used - ring.capacity)}` : ring.note || fmtPct(used, ring.capacity)}
          </span>
          {ring.zoom ? <span className="cs-ring-zoom">ring = first {fmtTokens(ring.zoom)}</span> : null}
        </div>
      </div>

      <div className="cs-ring-bar-wrap" aria-hidden="true">
        <p className="cs-ring-bar-num">
          <strong>{fmtTokens(used)}</strong> of {ring.capacityLabel}
          {' · '}
          <span className={over ? 'is-over' : undefined}>
            {over ? `over by ${fmtTokens(used - ring.capacity)}` : ring.note || fmtPct(used, ring.capacity)}
          </span>
          {ring.zoom ? ` · bar = first ${fmtTokens(ring.zoom)}` : ''}
        </p>
        <div className="cs-ring-bar">
          {SEGMENTS.map((s) => (
            <span
              key={s.key}
              className={`cs-seg-${s.key}${active && active !== s.key ? ' is-dim' : ''}`}
              style={{
                width: ring.segments[s.key]
                  ? `max(2px, ${((ring.segments[s.key] / scale) * 100).toFixed(3)}%)`
                  : 0,
              }}
              onClick={() => onPick(s.key)}
            />
          ))}
          {(ring.marks || []).map((m) => (
            <i key={m.label} style={{ left: `${(m.at / scale) * 100}%` }} />
          ))}
        </div>
        {ring.outer ? (
          <div className={`cs-ring-bar-outer is-${ring.outer.kind || 'cache'}`}>
            <span style={{ width: `${Math.min(100, (ring.outer.tokens / scale) * 100)}%` }} />
          </div>
        ) : null}
      </div>

      {ring.footer || null}
    </div>
  );
}

function Legend({ rings, active, onHover, onPick }) {
  const keys = SEGMENTS.filter((s) => rings.some((r) => r.segments[s.key] > 0)).map((s) => s.key);
  const free = (r) => Math.max(0, r.capacity - sumTokens(r.segments));
  return (
    <ul className={`cs-ring-legend${rings.length > 1 ? ' is-multi' : ''}`} aria-label="context segments">
      {rings.length > 1 ? (
        <li className="cs-legend-head" aria-hidden="true">
          <span />
          <span />
          {rings.map((r) => (
            <span key={r.id} className="cs-legend-val">
              {r.short || r.title}
            </span>
          ))}
        </li>
      ) : null}
      {[...keys, 'free'].map((key) => (
        <li key={key}>
          <button
            type="button"
            aria-pressed={active === key}
            className={active === key ? 'is-active' : undefined}
            onMouseEnter={() => onHover(key)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(key)}
            onBlur={() => onHover(null)}
            onClick={() => onPick(key)}
          >
            <i className={`cs-swatch cs-seg-${key}`} aria-hidden="true" />
            <span className="cs-legend-label">{SEGMENT_BY_KEY[key].label}</span>
            {rings.map((r) => {
              const v = key === 'free' ? free(r) : r.segments[key] || 0;
              return (
                <span key={r.id} className="cs-legend-val">
                  {v ? fmtTokens(v) : '·'}
                </span>
              );
            })}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Detail({ rings, active, pinned, onUnpin, notes, source }) {
  const seg = active ? SEGMENT_BY_KEY[active] : null;
  return (
    <div className="cs-ring-detail" aria-live="polite">
      {seg ? (
        <>
          <p className="cs-detail-head">
            <i className={`cs-swatch cs-seg-${seg.key}`} aria-hidden="true" />
            {seg.label}
            {pinned ? (
              <button type="button" className="cs-detail-unpin" onClick={onUnpin}>
                unpin
              </button>
            ) : null}
          </p>
          <ul className="cs-detail-nums">
            {rings.map((r) => {
              const used = sumTokens(r.segments);
              const v = active === 'free' ? Math.max(0, r.capacity - used) : r.segments[active] || 0;
              return (
                <li key={r.id}>
                  {rings.length > 1 ? <span>{r.title}: </span> : null}
                  <strong>{v.toLocaleString()}</strong> tokens
                  {v ? ` · ${fmtPct(v, r.capacity)} of the ${r.capacityLabel}` : ''}
                  {active === 'messages' && r.reasoning > 0 ? (
                    <em>
                      {' '}
                      (≈{fmtTokens(r.reasoning)} of it inferred: hidden reasoning and turn overhead
                      the API counted beyond the visible text)
                    </em>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="cs-detail-what">{seg.what}</p>
          {notes[active] ? <div className="cs-detail-why">{notes[active]}</div> : null}
        </>
      ) : (
        <p className="cs-detail-hint">Hover or tap a segment to see what it holds.</p>
      )}
      {source ? <p className="cs-detail-source">{source}</p> : null}
    </div>
  );
}

/** Rings + shared legend + detail panel. `focus` is the narrated segment; a tap pins one. */
export default function ContextPanel({ rings, focus = null, notes = {}, source = null, className = '' }) {
  const [pinned, setPinned] = useState(null);
  const [hover, setHover] = useState(null);
  const active = hover || pinned || focus;
  const pick = (key) => setPinned((p) => (p === key ? null : key));

  return (
    <div className={`cs-ctx${rings.length > 1 ? ' is-multi' : ''} ${className}`}>
      <div className="cs-ctx-rings">
        {rings.map((r) => (
          <Ring key={r.id} ring={r} active={active} onHover={setHover} onPick={pick} />
        ))}
      </div>
      <div className="cs-ctx-side">
        <Legend rings={rings} active={active} onHover={setHover} onPick={pick} />
        <Detail
          rings={rings}
          active={active}
          pinned={pinned != null && pinned === active}
          onUnpin={() => setPinned(null)}
          notes={notes}
          source={source}
        />
      </div>
    </div>
  );
}

/** Legend-only strip for charts that share the palette without drawing a ring. */
export function SegmentKey({ keys }) {
  return (
    <ul className="cs-segment-key" aria-label="legend">
      {keys.map((k) => (
        <li key={k}>
          <i className={`cs-swatch cs-seg-${k}`} aria-hidden="true" />
          {SEGMENT_BY_KEY[k].label}
        </li>
      ))}
    </ul>
  );
}
