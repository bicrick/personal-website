import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { createQwopReplayPlayer, loadQwopDemoAssets } from './qwopReplayEngine';
import {
  formatRecordedLine,
  formatSeedLine,
  hudStatsForFrame,
  modelLabelFromMeta,
  QRDQN_INFO,
  sparklinePath,
} from './qwopReplayHud';
import './QwopReplay.css';

const SPARK_W = 120;
const SPARK_H = 28;
const MODEL_INFO_ID = 'qwop-model-info';
const PLAYBACK_RATES = [0.5, 1, 2, 4];
const COURSE_METERS = 100;

function QwopReplay() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const playerRef = useRef(null);
  const progressInputRef = useRef(null);
  const speedValueRef = useRef(null);
  const sparkPathRef = useRef(null);
  const distLabelRef = useRef(null);
  const infoWrapRef = useRef(null);
  const scrubbingRef = useRef(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [metaHud, setMetaHud] = useState({
    model: 'RL agent',
    seedLine: 'realtime replay',
    recordedLine: 'Recorded agent run · loops',
  });

  useEffect(() => {
    if (!infoOpen) return undefined;
    const onPointerDown = (event) => {
      if (infoWrapRef.current && !infoWrapRef.current.contains(event.target)) {
        setInfoOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setInfoOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [infoOpen]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const params = new URLSearchParams(window.location.search);
        const seekRaw = params.get('at');
        const seekDistance = seekRaw != null ? Number(seekRaw) : null;
        const freezeAtSeek = params.get('freeze') === '1';
        const assets = await loadQwopDemoAssets();
        if (cancelled || !canvasRef.current || !stageRef.current) return;

        const meta = assets.run.meta || {};
        setMetaHud({
          model: modelLabelFromMeta(meta),
          seedLine: formatSeedLine(meta),
          recordedLine: formatRecordedLine(),
        });

        const player = createQwopReplayPlayer(canvasRef.current, assets, {
          stageEl: stageRef.current,
          seekDistance: Number.isFinite(seekDistance) ? seekDistance : null,
          freezeAtSeek,
          onFrame: ({ index, run }) => {
            const stats = hudStatsForFrame(run, index);
            if (!scrubbingRef.current && progressInputRef.current) {
              progressInputRef.current.value = String(
                Math.max(0, Math.min(COURSE_METERS, stats.distance)).toFixed(1),
              );
              progressInputRef.current.style.setProperty(
                '--qwop-progress',
                `${(stats.progress * 100).toFixed(2)}%`,
              );
            }
            if (speedValueRef.current) {
              speedValueRef.current.textContent = `${stats.speed.toFixed(1)} m/s`;
            }
            if (distLabelRef.current) {
              distLabelRef.current.textContent = `${stats.distance.toFixed(1)} m`;
            }
            if (sparkPathRef.current) {
              sparkPathRef.current.setAttribute(
                'd',
                sparklinePath(stats.spark, SPARK_W, SPARK_H),
              );
            }
          },
        });
        playerRef.current = player;
        player.start();
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load demo');
          setStatus('error');
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current = null;
      }
    };
  }, []);

  const chromeReady = status === 'ready';

  const handlePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    playerRef.current?.setPlaybackRate(rate);
  };

  const handleScrubStart = () => {
    scrubbingRef.current = true;
    playerRef.current?.pause();
  };

  const handleScrub = (event) => {
    const meters = Number(event.target.value);
    if (!Number.isFinite(meters)) return;
    if (progressInputRef.current) {
      progressInputRef.current.style.setProperty(
        '--qwop-progress',
        `${Math.max(0, Math.min(100, (meters / COURSE_METERS) * 100)).toFixed(2)}%`,
      );
    }
    if (distLabelRef.current) {
      distLabelRef.current.textContent = `${meters.toFixed(1)} m`;
    }
    playerRef.current?.seekToDistance(meters);
  };

  const handleScrubEnd = () => {
    scrubbingRef.current = false;
    playerRef.current?.resume();
  };

  const handleScrubKeyDown = (event) => {
    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ].includes(event.key)
    ) {
      handleScrubStart();
    }
  };

  return (
    <div className="qwop-replay">
      <SEO
        ogTitle="qwop-python agent run - bicrick"
        description="Watch a trained RL agent run in qwop-python — pose replay of a recorded episode, no install."
        keywords="bicrick, qwop-python, QWOP, reinforcement learning, demo"
        url="https://bicrick.com/demos/qwop"
        image="https://bicrick.com/images/qwop-python/qwop-python-1200x600.png"
      />

      <nav className="qwop-replay-nav" aria-label="Demo navigation">
        <div className="qwop-replay-nav-left">
          <Link to="/projects/qwop-python" className="qwop-replay-nav-back">
            ← qwop-python
          </Link>
          <span className="qwop-replay-nav-sep" aria-hidden="true">
            ·
          </span>
          <a
            className="qwop-replay-nav-original"
            href="https://www.foddy.net/legacy/Athletics.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Play original
          </a>
        </div>
        <h1 className="qwop-replay-nav-title">
          QWOP by Bennet Foddy
          <span className="qwop-replay-nav-title-sep" aria-hidden="true">
            {' '}
            |{' '}
          </span>
          <span className="qwop-replay-nav-title-sub">
            RL Agent Trained in qwop-python
          </span>
        </h1>
      </nav>

      <div
        className={`qwop-replay-telemetry${chromeReady ? ' is-ready' : ''}`}
        aria-hidden={!chromeReady}
      >
        <div className="qwop-replay-model">
          <div className="qwop-replay-model-row">
            <div className="qwop-replay-model-name">{metaHud.model}</div>
            <div
              ref={infoWrapRef}
              className={`qwop-replay-model-info${infoOpen ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="qwop-replay-model-info-btn"
                aria-label="About this model"
                aria-expanded={infoOpen}
                aria-controls={MODEL_INFO_ID}
                aria-describedby={MODEL_INFO_ID}
                onClick={() => setInfoOpen((open) => !open)}
              >
                i
              </button>
              <div
                id={MODEL_INFO_ID}
                className="qwop-replay-model-tooltip"
                role="tooltip"
              >
                <strong className="qwop-replay-model-tooltip-title">
                  {metaHud.model}
                </strong>
                <p>{QRDQN_INFO}</p>
              </div>
            </div>
          </div>
          <div className="qwop-replay-model-sub">{metaHud.seedLine}</div>
        </div>

        <div className="qwop-replay-progress-wrap">
          <div className="qwop-replay-progress-meta">
            <span ref={distLabelRef}>0.0 m</span>
            <span>100 m</span>
          </div>
          <label className="qwop-replay-progress-label">
            <span className="qwop-sr-only">Scrub timeline</span>
            <input
              ref={progressInputRef}
              className="qwop-replay-progress"
              type="range"
              min={0}
              max={COURSE_METERS}
              step={0.1}
              defaultValue={0}
              aria-valuemin={0}
              aria-valuemax={COURSE_METERS}
              aria-label="Scrub run by distance"
              disabled={!chromeReady}
              onPointerDown={handleScrubStart}
              onPointerUp={handleScrubEnd}
              onPointerCancel={handleScrubEnd}
              onKeyDown={handleScrubKeyDown}
              onKeyUp={handleScrubEnd}
              onChange={handleScrub}
              onInput={handleScrub}
            />
          </label>
        </div>

        <div className="qwop-replay-speed">
          <div ref={speedValueRef} className="qwop-replay-speed-value">
            0.0 m/s
          </div>
          <svg
            className="qwop-replay-spark"
            width={SPARK_W}
            height={SPARK_H}
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            aria-hidden="true"
          >
            <path
              ref={sparkPathRef}
              d=""
              fill="none"
              stroke="rgba(120, 180, 220, 0.9)"
              strokeWidth="1.5"
            />
          </svg>
          <div
            className="qwop-replay-rate"
            role="group"
            aria-label="Playback speed"
          >
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                className={`qwop-replay-rate-btn${playbackRate === rate ? ' is-active' : ''}`}
                aria-pressed={playbackRate === rate}
                disabled={!chromeReady}
                onClick={() => handlePlaybackRate(rate)}
              >
                {rate === 1 ? '1x' : `${rate}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={stageRef} className="qwop-replay-stage">
        <canvas
          ref={canvasRef}
          className="qwop-replay-canvas"
          aria-label="QWOP agent replay"
        />
        {status === 'loading' && (
          <div className="qwop-replay-status">loading agent run…</div>
        )}
        {status === 'error' && (
          <div className="qwop-replay-status qwop-replay-status-error">{error}</div>
        )}
      </div>

      <section
        className={`qwop-replay-about${chromeReady ? ' is-ready' : ''}`}
        aria-label="About this agent"
      >
        <p>{QRDQN_INFO}</p>
      </section>

      <footer className={`qwop-replay-footer${chromeReady ? ' is-ready' : ''}`}>
        {metaHud.recordedLine}
      </footer>
    </div>
  );
}

export default QwopReplay;
