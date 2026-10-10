import React from 'react';

/** Optional replay / pause / step controls — never required. */
export default function DemoTransport({
  playing,
  reduce,
  onReplay,
  onPause,
  onPlay,
  onPrev,
  onNext,
  label = 'demo controls',
}) {
  return (
    <div className="cs-demo-transport" role="group" aria-label={label}>
      <button type="button" onClick={onReplay}>
        replay
      </button>
      {reduce ? null : playing ? (
        <button type="button" onClick={onPause}>
          pause
        </button>
      ) : (
        <button type="button" onClick={onPlay}>
          play
        </button>
      )}
      <button type="button" onClick={onPrev} aria-label="previous step">
        ←
      </button>
      <button type="button" onClick={onNext} aria-label="next step">
        →
      </button>
    </div>
  );
}

export function DemoNarration({ children }) {
  return (
    <p className="cs-demo-narration" aria-live="polite">
      {children}
    </p>
  );
}
