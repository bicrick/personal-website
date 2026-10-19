import { useEffect, useRef, useState } from 'react';
import {
  createQwopReplayPlayer,
  loadQwopPreviewAssets,
} from '../demos/qwopReplayEngine';
import './QwopTilePreview.css';

/**
 * Live mid-stride pose loop for project tiles.
 * Uses a small JSON slice (~132KB) and no HUD/key chrome.
 */
const RECORD = 45.167;
const RECORD_LABEL = RECORD.toFixed(3);

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function QwopTilePreview({ title = 'qwop-python', playbackRate = 1.5 }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const timeRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let observer = null;
    let clockFrame = 0;

    async function boot() {
      try {
        const assets = await loadQwopPreviewAssets();
        if (cancelled || !canvasRef.current || !stageRef.current) return;

        const player = createQwopReplayPlayer(canvasRef.current, assets, {
          stageEl: stageRef.current,
          hideChrome: true,
          fit: 'cover',
          playbackRate,
        });
        playerRef.current = player;

        if (typeof IntersectionObserver !== 'undefined') {
          observer = new IntersectionObserver(
            ([entry]) => {
              if (!playerRef.current) return;
              if (entry.isIntersecting) {
                playRecord();
                if (!entry.target.dataset.started) {
                  entry.target.dataset.started = '1';
                  playerRef.current.start();
                } else {
                  playerRef.current.resume();
                }
              } else {
                playerRef.current.pause();
              }
            },
            { threshold: 0.15 },
          );
          observer.observe(stageRef.current);
        } else {
          player.start();
          playRecord();
        }

        setStatus('ready');
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    }

    function playRecord() {
      const node = timeRef.current;
      if (!node || node.dataset.played === '1') return;
      node.dataset.played = '1';
      if (prefersReducedMotion()) {
        node.textContent = RECORD_LABEL;
        return;
      }

      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        // rAF timestamps can precede performance.now() by a frame.
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - (1 - t) ** 3;
        node.textContent = (RECORD * eased).toFixed(3);
        if (t < 1) clockFrame = requestAnimationFrame(tick);
      };
      clockFrame = requestAnimationFrame(tick);
    }

    boot();

    return () => {
      cancelled = true;
      if (clockFrame) cancelAnimationFrame(clockFrame);
      if (observer) observer.disconnect();
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current = null;
      }
    };
  }, [playbackRate]);

  return (
    <div ref={stageRef} className="qwop-tile-preview">
      <canvas
        ref={canvasRef}
        className="qwop-tile-preview-canvas"
        aria-label={`${title} mid-stride replay`}
      />
      {status === 'loading' && (
        <div className="qwop-tile-preview-status" aria-hidden="true" />
      )}
      <p className="qwop-tile-preview-record">
        <span className="qwop-tile-preview-record-label">wr</span>
        <span ref={timeRef}>{prefersReducedMotion() ? RECORD_LABEL : '0.000'}</span>
      </p>
    </div>
  );
}

export default QwopTilePreview;
