import React from 'react';

export default function SidePanel({
  mode,
  onMode,
  holding,
  busy,
  captures,
  elapsed,
  status,
  onHoldStart,
  onHoldEnd,
  onGrab,
  canGrab,
}) {
  return (
    <aside className="dtd-panel" aria-label="da transcribuh controls">
      <div className="dtd-panel-head">
        <span className="dtd-mark" aria-hidden="true">
          <span className="dtd-mark-d">d</span>
          <span className="dtd-mark-t">t</span>
        </span>
        <span className="dtd-panel-name">da transcribuh</span>
        <span className="dtd-panel-pill">on-device · local</span>
      </div>

      <div className="dtd-tabs" role="tablist" aria-label="demo mode">
        {[
          { id: 'dictate', label: 'dictate' },
          { id: 'capture', label: 'capture' },
          { id: 'race', label: 'wpm race' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={mode === t.id}
            className={mode === t.id ? 'is-on' : ''}
            onClick={() => onMode(t.id)}
            disabled={busy && mode !== t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="dtd-panel-body">
        {mode === 'race' ? (
          <p className="dtd-hint">
            Typing sits around 40 wpm. Talking lands nearer 150. Press hold to
            watch a short race — no mic, just the canned pace.
          </p>
        ) : mode === 'capture' ? (
          <p className="dtd-hint">
            Hold to record, then grab a region of the mock page. Release and the
            collage + text land together — one paste.
          </p>
        ) : (
          <p className="dtd-hint">
            Hold space (when the demo is focused) or the button below. Release
            and a canned sentence types itself into the field.
          </p>
        )}

        <div className="dtd-controls">
          <button
            type="button"
            className={`dtd-hold${holding ? ' is-down' : ''}`}
            disabled={busy && !holding}
            onPointerDown={(e) => {
              e.preventDefault();
              onHoldStart();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch (_) {
                /* synthetic events (tests / screenshots) may lack a real pointerId */
              }
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onHoldEnd();
            }}
            onPointerCancel={onHoldEnd}
            onLostPointerCapture={onHoldEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            {holding ? 'recording…' : 'hold to talk'}
          </button>

          {mode === 'capture' ? (
            <button
              type="button"
              className="dtd-grab"
              disabled={!canGrab}
              onClick={onGrab}
            >
              grab region
            </button>
          ) : null}
        </div>

        <dl className="dtd-stats">
          <div>
            <dt>status</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>elapsed</dt>
            <dd>{elapsed}</dd>
          </div>
          <div>
            <dt>captures</dt>
            <dd>{captures}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
