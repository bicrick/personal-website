import { useState } from 'react';
import './RangeRatEmbed.css';

const PLAY_HREF = 'https://golf.bicrick.com';
const POSTER = `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-1200x600.jpg`;

function RangeRatEmbed() {
  const [loaded, setLoaded] = useState(false);

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
          className="range-rat-embed-frame"
          src={PLAY_HREF}
          title="Range Rat"
          loading="eager"
          tabIndex={-1}
          allow=""
          onLoad={() => setLoaded(true)}
        />
        <a
          className="range-rat-embed-hit"
          href={PLAY_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="range-rat-embed-hit-label">Play fullscreen</span>
        </a>
      </div>
      <figcaption>
        The live title screen. Click to play fullscreen at golf.bicrick.com.
      </figcaption>
    </figure>
  );
}

export default RangeRatEmbed;
