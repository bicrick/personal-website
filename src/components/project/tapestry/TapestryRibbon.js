import React from 'react';
import './tapestry.css';

const LIVE = 'https://infinitetapestry.app';

/**
 * Compact non-interactive live embed of infinitetapestry.app.
 * Scaled/cropped to a short band+reflection window; click-through opens the site.
 * Live theme follows OS / its own localStorage (no theme URL param).
 */
export default function TapestryRibbon({
  caption = 'Live from infinitetapestry.app — click to open the full viewer.',
}) {
  return (
    <figure className="it-demo">
      <div className="it-embed">
        <div className="it-embed-scaler" aria-hidden="true">
          <iframe
            className="it-embed-iframe"
            src={LIVE}
            title="Infinite Tapestry live painting"
            loading="lazy"
            tabIndex={-1}
            referrerPolicy="no-referrer-when-downgrade"
            allow=""
          />
        </div>
        <a
          className="it-embed-link"
          href={LIVE}
          target="_blank"
          rel="noopener"
          aria-label="Open Infinite Tapestry live site"
        >
          <span className="it-embed-link-text">Open infinitetapestry.app</span>
        </a>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
