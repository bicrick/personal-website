import React from 'react';

/**
 * One cell per model call, up to the step cap. Doubles as a scrubber.
 * cells: [{ fill: 0..1, mark?: 'summary' | 'drop' }]; fill shades the cell
 * (e.g. share of the prompt reused from cache).
 */
export default function TurnStrip({ cells, current, cap = 25, onPick, label, legend }) {
  return (
    <div className="cs-turns">
      <div
        className="cs-turns-row"
        role="group"
        aria-label={label}
        style={{ gridTemplateColumns: `repeat(${cap}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cap }, (_, i) => {
          const cell = cells[i];
          const state = !cell ? 'is-none' : i < current ? 'is-done' : i === current ? 'is-now' : 'is-next';
          return (
            <button
              key={i}
              type="button"
              className={`cs-turn ${state}${cell?.mark ? ` is-${cell.mark}` : ''}`}
              style={cell && i <= current ? { '--fill': cell.fill ?? 1 } : undefined}
              disabled={!cell}
              aria-label={cell ? `call ${i + 1}` : undefined}
              aria-current={i === current ? 'step' : undefined}
              onClick={() => cell && onPick?.(i)}
            />
          );
        })}
      </div>
      {legend ? <p className="cs-turns-legend">{legend}</p> : null}
    </div>
  );
}
