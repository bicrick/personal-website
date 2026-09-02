import { useEffect, useRef, useState } from 'react';
import './NotepadableEmbed.css';

const SITE_HREF = 'https://notepadable.com';
const FRAME_W = 1100;
const FRAME_H = 618;
const POSTER = `${process.env.PUBLIC_URL}/images/notepadable/notepadable-logo.png`;

function NotepadableEmbed() {
  const stageRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) {
      return undefined;
    }

    const update = () => {
      setScale(el.clientWidth / FRAME_W);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="project-figure notepadable-embed">
      <div className="notepadable-embed-stage" ref={stageRef}>
        <img
          className="notepadable-embed-poster"
          src={POSTER}
          alt=""
          width={1200}
          height={600}
          hidden={loaded}
        />
        <div
          className="notepadable-embed-scaler"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            transform: `scale(${scale || 0})`,
          }}
        >
          <iframe
            className="notepadable-embed-frame"
            src={SITE_HREF}
            title="notepadable"
            loading="eager"
            tabIndex={-1}
            onLoad={() => setLoaded(true)}
          />
        </div>
        <a
          className="notepadable-embed-hit"
          href={SITE_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="notepadable-embed-hit-label">Open notepadable</span>
        </a>
      </div>
      <figcaption>
        The live site. Click to open notepadable.com.
      </figcaption>
    </figure>
  );
}

export default NotepadableEmbed;
