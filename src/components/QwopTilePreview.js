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
function QwopTilePreview({ title = 'qwop-python' }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let observer = null;

    async function boot() {
      try {
        const assets = await loadQwopPreviewAssets();
        if (cancelled || !canvasRef.current || !stageRef.current) return;

        const player = createQwopReplayPlayer(canvasRef.current, assets, {
          stageEl: stageRef.current,
          hideChrome: true,
          fit: 'cover',
        });
        playerRef.current = player;

        if (typeof IntersectionObserver !== 'undefined') {
          observer = new IntersectionObserver(
            ([entry]) => {
              if (!playerRef.current) return;
              if (entry.isIntersecting) {
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
        }

        setStatus('ready');
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    }

    boot();

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current = null;
      }
    };
  }, []);

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
    </div>
  );
}

export default QwopTilePreview;
