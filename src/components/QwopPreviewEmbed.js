import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createQwopReplayPlayer,
  loadQwopDemoAssets,
} from '../demos/qwopReplayEngine';
import './QwopPreviewEmbed.css';

function QwopPreviewEmbed() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let observer = null;

    async function boot() {
      try {
        const assets = await loadQwopDemoAssets();
        if (cancelled || !canvasRef.current || !stageRef.current) return;

        const player = createQwopReplayPlayer(canvasRef.current, assets, {
          stageEl: stageRef.current,
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
            { threshold: 0.2 },
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
    <figure className="project-figure qwop-preview-embed">
      <div ref={stageRef} className="qwop-preview-embed-stage">
        <canvas
          ref={canvasRef}
          className="qwop-preview-embed-canvas"
          aria-label="QWOP agent replay preview"
        />
        {status === 'loading' && (
          <div className="qwop-preview-embed-status">loading…</div>
        )}
        {status === 'error' && (
          <div className="qwop-preview-embed-status">preview failed to load</div>
        )}
        <Link to="/demos/qwop" className="qwop-preview-embed-hit">
          <span className="qwop-preview-embed-hit-label">Open full demo</span>
        </Link>
      </div>
      <figcaption>Live pose replay of the trained PPO agent.</figcaption>
    </figure>
  );
}

export default QwopPreviewEmbed;
