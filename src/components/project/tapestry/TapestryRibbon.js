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
 */
export default function TapestryRibbon() {
  return (
    <figure className="it-demo">
      <div className="it-embed">
        <div className="it-embed-scaler">
          <iframe
            className="it-embed-iframe"
            src={LIVE}
            title="Infinite Tapestry live painting"
            width={VIEW_W}
            height={VIEW_H}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          />
        </div>
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
