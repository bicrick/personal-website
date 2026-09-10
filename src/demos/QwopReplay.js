import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { createQwopReplayPlayer, loadQwopDemoAssets } from './qwopReplayEngine';
import {
  agentInfoFromMeta,
  formatRecordedLine,
  formatSeedLine,
  hudStatsForFrame,
  modelLabelFromMeta,
} from './qwopReplayHud';
import './QwopReplay.css';

const MODEL_INFO_ID = 'qwop-model-info';
const PLAYBACK_RATES = [0.5, 1, 2, 4];
const COURSE_METERS = 100;

function DemoNav() {
  const { pathname } = useLocation();
  const linkClass = (path) => (
    pathname === path || (path === '/projects' && pathname.startsWith('/projects/'))
      ? 'nav-link is-active'
      : 'nav-link'
  );

  return (
    <div className="nav">
      <Link to="/" className={linkClass('/')}>bicrick</Link>
      <span className="nav-separator">·</span>
      <Link to="/about" className={linkClass('/about')}>about</Link>
      <span className="nav-separator">·</span>
      <Link
        to="/projects"
        className={linkClass('/projects')}
        aria-current={pathname.startsWith('/projects') || pathname.startsWith('/demos/') ? 'page' : undefined}
      >
        projects
      </Link>
      <span className="nav-separator">·</span>
      <Link to="/contact" className={linkClass('/contact')}>contact</Link>
    </div>
  );
}

function QwopReplay() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const playerRef = useRef(null);
  const progressInputRef = useRef(null);
  const distLabelRef = useRef(null);
  const infoWrapRef = useRef(null);
  const scrubbingRef = useRef(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [metaHud, setMetaHud] = useState({
    model: 'PPO',
    seedLine: 'realtime replay',
    recordedLine: 'Recorded PPO pose replay · loops',
    info: agentInfoFromMeta({}),
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
          recordedLine: formatRecordedLine(meta),
          info: agentInfoFromMeta(meta),
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
            if (distLabelRef.current) {
              distLabelRef.current.textContent = `${stats.distance.toFixed(1)} m`;
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
    <div className="qwop-replay App_mainContainer landing-page">
      <SEO
        ogTitle="qwop-python PPO agent run - bicrick"
        description="Watch a qwop-python PPO pose replay. Same policy line scored 45.167s on official browser physics, beating the human WR of 45.530s."
        keywords="bicrick, qwop-python, QWOP, world record, reinforcement learning, PPO, demo"
        url="https://bicrick.com/demos/qwop"
        image="https://bicrick.com/images/qwop-python/qwop-python-1200x600.png"
      />

      <header className="App_header landing-nav">
        <div className="App_mainColumn landing-nav-inner">
          <DemoNav />
        </div>
      </header>

      <main className="qwop-replay-main">
        <div className="qwop-replay-toolbar">
          <div className="qwop-replay-toolbar-left">
            <Link to="/projects/qwop-python" className="qwop-replay-back">
              ← qwop-python
            </Link>
            <span className="qwop-replay-sep" aria-hidden="true">·</span>
            <a
              className="qwop-replay-original"
              href="https://www.foddy.net/legacy/Athletics.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Play original
            </a>
          </div>

          <div
            className={`qwop-replay-model${chromeReady ? ' is-ready' : ''}`}
            aria-hidden={!chromeReady}
          >
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
                  <p>{metaHud.info}</p>
                </div>
              </div>
            </div>
            <div className="qwop-replay-model-sub">{metaHud.seedLine}</div>
          </div>
        </div>

        <div
          className={`qwop-replay-controls${chromeReady ? ' is-ready' : ''}`}
          aria-hidden={!chromeReady}
        >
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
          <p>{metaHud.info}</p>
        </section>

        <footer className={`qwop-replay-footer${chromeReady ? ' is-ready' : ''}`}>
          {metaHud.recordedLine}
        </footer>
      </main>
    </div>
  );
}

export default QwopReplay;
