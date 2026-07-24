import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { createQwopReplayPlayer, loadQwopDemoAssets } from './qwopReplayEngine';
import {
  formatRecordedLine,
  formatSeedLine,
  hudStatsForFrame,
  modelLabelFromMeta,
  sparklinePath,
} from './qwopReplayHud';
import './QwopReplay.css';

const SPARK_W = 120;
const SPARK_H = 28;

function QwopReplay() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const playerRef = useRef(null);
  const progressFillRef = useRef(null);
  const speedValueRef = useRef(null);
  const sparkPathRef = useRef(null);
  const distLabelRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [metaHud, setMetaHud] = useState({
    model: 'RL agent',
    seedLine: 'realtime replay',
    recordedLine: 'recorded run · loops',
  });

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
          recordedLine: formatRecordedLine(meta),
        });

        const player = createQwopReplayPlayer(canvasRef.current, assets, {
          stageEl: stageRef.current,
          seekDistance: Number.isFinite(seekDistance) ? seekDistance : null,
          freezeAtSeek,
          onFrame: ({ index, run }) => {
            const stats = hudStatsForFrame(run, index);
            if (progressFillRef.current) {
              progressFillRef.current.style.width = `${(stats.progress * 100).toFixed(2)}%`;
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
      </nav>

      <div
        className={`qwop-replay-telemetry${chromeReady ? ' is-ready' : ''}`}
        aria-hidden={!chromeReady}
      >
        <div className="qwop-replay-model">
          <div className="qwop-replay-model-name">{metaHud.model}</div>
          <div className="qwop-replay-model-sub">{metaHud.seedLine}</div>
        </div>

        <div className="qwop-replay-progress-wrap">
          <div className="qwop-replay-progress-meta">
            <span ref={distLabelRef}>0.0 m</span>
            <span>100 m</span>
          </div>
          <div
            className="qwop-replay-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div ref={progressFillRef} className="qwop-replay-progress-fill" />
          </div>
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

      <footer className={`qwop-replay-footer${chromeReady ? ' is-ready' : ''}`}>
        {metaHud.recordedLine}
      </footer>
    </div>
  );
}

export default QwopReplay;
