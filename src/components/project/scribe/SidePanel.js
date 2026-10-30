import React, { useState } from 'react';
import { HANDS } from './scenarios';

const SND_ICON = {
  on: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 6h2.5l3-2.5v9L5 10H2.5z" fill="currentColor" />
      <path d="M10.5 5.8a3 3 0 0 1 0 4.4M12.3 4a5.5 5.5 0 0 1 0 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  off: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 6h2.5l3-2.5v9L5 10H2.5z" fill="currentColor" />
      <path d="M10.5 6l3.5 4M14 6l-3.5 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const PLAY_ICON = (
  <svg className="i" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M6 4.2v9.6L14.2 9z" />
  </svg>
);
const PAUSE_ICON = (
  <svg className="i" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M5 4h3v10H5zM10 4h3v10h-3z" />
  </svg>
);
const REPLAY_ICON = (
  <svg className="i" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M9 3.2a5.8 5.8 0 1 0 5.5 7.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M14.8 4.2v4.2h-4.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const REFRESH_ICON = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.2 3.2a5.5 5.5 0 0 1 9.1 1.6M12.8 12.8a5.5 5.5 0 0 1-9.1-1.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12.8 2.2v3.2h-3.2M3.2 13.8v-3.2h3.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const GRID_ICON = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <rect x="2.5" y="2.5" width="4.5" height="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="2.5" width="4.5" height="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="2.5" y="9" width="4.5" height="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="9" width="4.5" height="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const CHEVRON_ICON = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function statusText(stage, working, run, scenario) {
  if (!run && !working) return 'Pick an example — or watch the reel.';
  if (stage === 'typing') return 'Reading your request…';
  if (stage === 'plan' || stage === 'wire' || stage === 'regions') return 'Planning the page…';
  if (stage === 'write') return 'Writing…';
  if (stage === 'done') return scenario ? scenario.reply : 'Done.';
  if (working) return 'Working…';
  return '';
}

function statusKind(stage) {
  if (stage === 'done') return 'ok';
  if (stage === 'write' || stage === 'plan' || stage === 'wire' || stage === 'regions' || stage === 'typing') {
    return 'working';
  }
  return '';
}

function fmtClock(p, totalSec = 0) {
  const sec = Math.max(0, Math.round((p || 0) * (totalSec || 0)));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const SPEED_OPTS = [1, 2, 4];

export default function SidePanel({
  scenarios,
  scenarioId,
  scenario,
  run,
  typed,
  writeFlash = false,
  working,
  wireOn,
  setWireOn,
  handId,
  setHand,
  onPick,
  onReplay,
  onTogglePlay,
  playing = false,
  userPaused = false,
  userSpeed = 1,
  setUserSpeed,
  wallTotalSec = 0,
  penProgress,
  scrubPen,
  setScrubbing,
  stage,
  soundOn = true,
  onToggleSound,
}) {
  const [styleOpen, setStyleOpen] = useState(false);
  const kind = statusKind(stage);
  const writing = stage === 'write';
  const done = stage === 'done';
  const playerOn = Boolean(scenario) && (writing || done || stage === 'regions' || stage === 'wire');
  const fill = `${Math.round((penProgress || 0) * 100)}%`;
  const showPause = writing && playing && !userPaused;
  const clock = fmtClock(penProgress, wallTotalSec);

  return (
    <aside className="sqd-panel" aria-label="Scribe controls">
      <div className="sqd-panel-scroll">
        <div className={`sqd-compose${typed && stage === 'typing' ? ' is-typing' : ''}${writeFlash ? ' is-submit' : ''}`}>
          <div className="sqd-compose-text" aria-live="polite">
            {typed || (
              <span className="sqd-ph">A note to leave on the fridge…</span>
            )}
          </div>
          <div className="sqd-compose-row">
            <span className="sqd-check" aria-hidden="true" title="Ready">
              <svg viewBox="0 0 14 14">
                <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="1.5" fill="currentColor" />
                <path d="M3.6 7.1l2.2 2.2 4.6-4.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sqd-grow" />
            <button
              type="button"
              className={`sqd-go${working ? ' is-busy' : ''}${writeFlash ? ' is-pressed' : ''}`}
              disabled
              aria-pressed={writeFlash}
            >
              Write
            </button>
          </div>
        </div>

        <div className="sqd-examples">
          <div className="sqd-ex-list" role="group" aria-label="Example requests">
            {scenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sqd-ex${scenarioId === s.id ? ' is-current' : ''}`}
                disabled={working && !writing && !done}
                onClick={() => onPick(s.id)}
              >
                {s.prompt || s.label}
              </button>
            ))}
          </div>
          <div className="sqd-ex-tools">
            <button
              type="button"
              className="sqd-icon-btn"
              aria-label="Refresh examples"
              title="Refresh"
              disabled={!scenario || (working && !writing && !done)}
              onClick={() => scenarioId && onPick(scenarioId)}
            >
              {REFRESH_ICON}
            </button>
            <button
              type="button"
              className={`sqd-icon-btn${wireOn ? ' is-on' : ''}`}
              aria-pressed={wireOn}
              aria-label={wireOn ? 'Hide layout boxes' : 'Show layout boxes'}
              title="Layout"
              onClick={() => setWireOn(!wireOn)}
            >
              {GRID_ICON}
            </button>
          </div>
        </div>

        <div
          className={`sqd-status${kind === 'working' ? ' is-working' : ''}`}
          data-kind={kind}
          role="status"
        >
          {statusText(stage, working, run, scenario)}
        </div>

        <div className={`sqd-player${playerOn ? '' : ' is-off'}${done ? ' is-done' : ''}`}>
          <div className="sqd-speed" role="group" aria-label="Playback speed">
            {SPEED_OPTS.map((sp) => (
              <button
                key={sp}
                type="button"
                className={userSpeed === sp ? 'is-on' : ''}
                aria-pressed={userSpeed === sp}
                onClick={() => setUserSpeed && setUserSpeed(sp)}
              >
                {sp}x
              </button>
            ))}
          </div>
          <div className="sqd-transport">
            <button
              type="button"
              className="sqd-round"
              aria-label={done ? 'Replay' : showPause ? 'Pause' : 'Play'}
              disabled={!scenario || (working && !writing && !done)}
              onClick={() => (onTogglePlay ? onTogglePlay() : onReplay && onReplay())}
            >
              {done ? REPLAY_ICON : showPause ? PAUSE_ICON : PLAY_ICON}
            </button>
            <input
              type="range"
              className="sqd-scrub"
              min={0}
              max={1000}
              value={Math.round((penProgress || 0) * 1000)}
              style={{ '--fill': fill }}
              disabled={!scenario || stage === 'idle' || stage === 'typing' || stage === 'plan'}
              aria-label="Pen progress"
              onPointerDown={() => setScrubbing && setScrubbing(true)}
              onPointerUp={() => setScrubbing && setScrubbing(false)}
              onPointerCancel={() => setScrubbing && setScrubbing(false)}
              onChange={(e) => scrubPen(Number(e.target.value) / 1000)}
            />
            <span className="sqd-clock">{clock}</span>
            <button
              type="button"
              className={`sqd-snd${soundOn ? '' : ' is-off'}`}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Sound on' : 'Sound off'}
              title={soundOn ? 'Pen sound: on' : 'Pen sound: off'}
              onClick={() => onToggleSound && onToggleSound()}
            >
              {SND_ICON[soundOn ? 'on' : 'off']}
            </button>
          </div>
        </div>

        <div className="sqd-style-block">
          <button
            type="button"
            className={`sqd-style-toggle${styleOpen ? ' is-open' : ''}`}
            aria-expanded={styleOpen}
            onClick={() => setStyleOpen((v) => !v)}
          >
            <span>Style</span>
            {CHEVRON_ICON}
          </button>
          {styleOpen ? (
            <div className="sqd-style" aria-label="Style details">
              <div className="sqd-seg" role="group" aria-label="Page view">
                <button
                  type="button"
                  className={!wireOn ? 'is-on' : ''}
                  aria-pressed={!wireOn}
                  onClick={() => setWireOn(false)}
                >
                  page
                </button>
                <button
                  type="button"
                  className={wireOn ? 'is-on' : ''}
                  aria-pressed={wireOn}
                  onClick={() => setWireOn(true)}
                >
                  layout
                </button>
              </div>
              <div className="sqd-seg" role="group" aria-label="Handwriting style">
                {HANDS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={handId === h.id ? 'is-on' : ''}
                    disabled={!scenario}
                    onClick={() => setHand(h.id)}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
