import { useCallback, useEffect, useRef, useState } from 'react';
import './RangeRatEmbed.css';

const PLAY_HREF = 'https://golf.bicrick.com';
const EMBED_ORIGIN = 'https://golf.bicrick.com';
const EMBED_SRC = `${EMBED_ORIGIN}/?embed=1&muted=1`;
const POSTER = `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-1200x600.jpg`;
const SET_MUTED_TYPE = 'range-rat-set-muted';
const EMBED_READY_TYPE = 'range-rat-embed-ready';

function postEmbedMuted(frame, muted) {
  if (!frame?.contentWindow) {
    return;
  }
  frame.contentWindow.postMessage({ type: SET_MUTED_TYPE, muted }, EMBED_ORIGIN);
}

function SpeakerIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M4 9v6h3.2L12 19V5L7.2 9H4z" />
      {muted ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M16.2 9.2l5.6 5.6m0-5.6l-5.6 5.6"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          d="M15.6 8.6a4.4 4.4 0 010 6.8M18.4 6.4a7.6 7.6 0 010 11.2"
        />
      )}
    </svg>
  );
}

function RangeRatEmbed() {
  const frameRef = useRef(null);
  const mutedRef = useRef(true);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);

  const syncMute = useCallback((nextMuted) => {
    mutedRef.current = nextMuted;
    postEmbedMuted(frameRef.current, nextMuted);
  }, []);

  useEffect(() => {
    function onMessage(event) {
      if (event.origin !== EMBED_ORIGIN) {
        return;
      }
      if (event.data?.type !== EMBED_READY_TYPE) {
        return;
      }
      postEmbedMuted(frameRef.current, mutedRef.current);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleFrameLoad = () => {
    setLoaded(true);
    postEmbedMuted(frameRef.current, mutedRef.current);
  };

  const handleSpeakerClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextMuted = !muted;
    setMuted(nextMuted);
    syncMute(nextMuted);
  };

  return (
    <figure className="project-figure range-rat-embed">
      <div className="range-rat-embed-stage">
        <img
          className="range-rat-embed-poster"
          src={POSTER}
          alt=""
          width={1024}
          height={512}
          hidden={loaded}
        />
        <iframe
          ref={frameRef}
          className="range-rat-embed-frame"
          src={EMBED_SRC}
          title="Range Rat"
          loading="eager"
          tabIndex={-1}
          allow="autoplay"
          onLoad={handleFrameLoad}
        />
        <a
          className="range-rat-embed-hit"
          href={PLAY_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="range-rat-embed-hit-label">Play fullscreen</span>
        </a>
        <button
          type="button"
          className="range-rat-embed-speaker"
          aria-label={muted ? 'Unmute title music' : 'Mute title music'}
          aria-pressed={!muted}
          onClick={handleSpeakerClick}
        >
          <SpeakerIcon muted={muted} />
        </button>
      </div>
      <figcaption>
        The live title screen. Click to play fullscreen at golf.bicrick.com.
      </figcaption>
    </figure>
  );
}

export default RangeRatEmbed;
