import React from 'react';
import DemoTransport, { DemoNarration } from './DemoTransport';
import './Demo.css';

/** Shared shell: kicker, narration, optional jump buttons, the ring panel, stats, controls. */
export default function DemoFrame({ auto, kicker, badge, say, tabs, stats, caption, children }) {
  return (
    <figure className="cs-demo" ref={auto.rootRef}>
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">{kicker}</p>
          {badge ? <span className="cs-demo-badge">{badge}</span> : null}
        </div>

        <DemoNarration>{say}</DemoNarration>

        {tabs ? (
          <div className="cs-demo-controls" role="group" aria-label={tabs.label}>
            {tabs.items.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={t.on}
                className={t.on ? 'is-on' : undefined}
                onClick={t.onClick}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}

        {children}

        {stats ? (
          <div className="cs-demo-stats">
            {stats.map((s) => (
              <span key={s.label} className={`cs-stat${s.accent ? ' is-accent' : ''}`}>
                {s.label} <strong>{s.value}</strong>
              </span>
            ))}
          </div>
        ) : null}

        <DemoTransport
          playing={auto.playing}
          reduce={auto.reduce}
          onReplay={auto.replay}
          onPause={auto.pause}
          onPlay={auto.play}
          onPrev={auto.stepPrev}
          onNext={auto.stepNext}
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
