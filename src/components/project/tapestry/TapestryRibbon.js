import React from 'react';
import './tapestry.css';

const LIVE = 'https://infinitetapestry.app';

/* Layout viewport inside the frame. The live site goes full-bleed below 520px tall. */
const VIEW_W = 1600;
const VIEW_H = 900;

/**
 * 16:9 live embed of infinitetapestry.app.
 * The iframe lays out at a desktop size, then scales down into the frame
 * so the ribbon, light bands, and reflections stay in view.
 * Nothing inside the frame accepts input. The cover link opens the live site.
 */
export default function TapestryRibbon() {
  return (
    <figure className="it-demo">
      <div className="it-embed">
        <div className="it-embed-scaler" inert="">
          <iframe
            className="it-embed-iframe"
            src={LIVE}
            title="Infinite Tapestry live painting"
            width={VIEW_W}
            height={VIEW_H}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        <a
          className="it-embed-hit"
          href={LIVE}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the live Infinite Tapestry"
        >
          <span className="it-embed-hit-label">Open the live Infinite Tapestry</span>
        </a>
      </div>
      <figcaption>
        Live from{' '}
        <a href={LIVE} target="_blank" rel="noopener noreferrer">
          infinitetapestry.app
        </a>
        .
      </figcaption>
    </figure>
  );
}
